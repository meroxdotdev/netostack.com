import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock SvelteKit
vi.mock('@sveltejs/kit', () => ({
  json: vi.fn(),
  error: vi.fn()
}));

// Mock Node.js DNS
vi.mock('node:dns', () => {
  const mockResolveMx = vi.fn();
  const mockResolve4 = vi.fn();
  const mockResolve6 = vi.fn();
  const mockResolveTxt = vi.fn();

  return {
    default: {},
    promises: {
      resolveMx: mockResolveMx,
      resolve4: mockResolve4,
      resolve6: mockResolve6,
      resolveTxt: mockResolveTxt,
      resolve: vi.fn(),
      reverse: vi.fn(),
      resolveNs: vi.fn(),
      resolveSoa: vi.fn(),
      resolveCaa: vi.fn(),
      setServers: vi.fn(),
      setDefaultResultOrder: vi.fn()
    }
  };
});

// Mock Node.js net
vi.mock('node:net', () => ({
  default: {},
  connect: vi.fn()
}));

// Mock fetch for SPF/DMARC calls
global.fetch = vi.fn();

// Import MSW for internal API calls
import { http, HttpResponse } from 'msw';
import { server } from '../../../../../../setup';

import { POST } from '../../../../../../../src/routes/api/internal/diagnostics/email/+server';
import { json, error } from '@sveltejs/kit';
import { promises as dns } from 'node:dns';
import { connect as netConnect } from 'node:net';

// Get mocked functions
const mockJson = vi.mocked(json);
const mockError = vi.mocked(error);
const mockDns = vi.mocked(dns);
const mockNetConnect = vi.mocked(netConnect);

describe('Email Diagnostics Server', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockJson.mockReturnValue(new Response());
    mockError.mockImplementation((status, message) => {
      throw new Error(`${status}: ${message}`);
    });

    // Setup DNS mocks
    mockDns.resolveMx.mockResolvedValue([
      { priority: 10, exchange: 'mail.example.com' }
    ]);
    mockDns.resolve4.mockResolvedValue(['192.0.2.1']);
    mockDns.resolve6.mockResolvedValue(['2001:db8::1']);
    mockDns.resolveTxt.mockResolvedValue([
      ['v=spf1 include:_spf.google.com ~all']
    ]);

    // Setup MSW handlers for internal DNS API calls
    server.use(
      http.post('http://localhost:5174/api/internal/diagnostics/dns', ({ request }) => {
        return HttpResponse.json({
          domain: 'example.com',
          hasRecord: true,
          record: 'v=spf1 include:_spf.google.com ~all',
          mechanisms: [
            { type: 'include', value: '_spf.google.com' }
          ]
        });
      })
    );

    // Mock successful socket for net connection
    const mockSocket = {
      connect: vi.fn(),
      on: vi.fn(),
      destroy: vi.fn(),
      end: vi.fn()
    };
    mockNetConnect.mockReturnValue(mockSocket as any);
  });

  describe('POST handler', () => {
    it('handles mx-health action', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'mx-health',
          domain: 'example.com',
          checkPorts: false
        })
      };

      mockDns.resolveMx.mockResolvedValue([
        { priority: 10, exchange: 'mail.example.com' }
      ]);
      mockDns.resolve4.mockResolvedValue(['192.0.2.1']);
      mockDns.resolve6.mockResolvedValue(['2001:db8::1']);

      await POST({ request: mockRequest });

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          domain: 'example.com',
          mxRecords: expect.arrayContaining([
            expect.objectContaining({
              priority: 10,
              exchange: 'mail.example.com'
            })
          ])
        })
      );
    });

    it('handles mx-health action with port checks', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'mx-health',
          domain: 'example.com',
          checkPorts: true
        })
      };

      mockDns.resolveMx.mockResolvedValue([
        { priority: 10, exchange: 'mail.example.com' }
      ]);
      mockDns.resolve4.mockResolvedValue(['192.0.2.1']);
      mockDns.resolve6.mockResolvedValue(['2001:db8::1']);

      // Mock successful connection
      const mockSocket = {
        connect: vi.fn(),
        on: vi.fn(),
        destroy: vi.fn(),
        end: vi.fn()
      };
      mockNetConnect.mockReturnValue(mockSocket as any);

      await POST({ request: mockRequest });

      expect(mockJson).toHaveBeenCalled();
      expect(mockNetConnect).toHaveBeenCalled();
    });

    it('handles spf-check action', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'spf-check',
          domain: 'example.com'
        })
      };

      mockDns.resolveTxt.mockResolvedValue([
        ['v=spf1 include:_spf.google.com ~all']
      ]);

      await POST({ request: mockRequest });

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          domain: 'example.com',
          hasSpf: true,
          spfRecord: expect.any(String)
        })
      );
    });

    it('handles dmarc-check action', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'dmarc-check',
          domain: 'example.com'
        })
      };

      mockResolveTxt.mockResolvedValue([
        ['v=DMARC1; p=reject; rua=mailto:dmarc@example.com']
      ]);

      await POST({ request: mockRequest });

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          domain: 'example.com',
          hasDmarc: true,
          dmarcRecord: expect.any(String)
        })
      );
    });

    it('handles unknown action with 400 error', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'unknown-action'
        })
      };

      await expect(POST({ request: mockRequest })).rejects.toThrow('400');
      expect(mockError).toHaveBeenCalledWith(400, 'Unknown action: unknown-action');
    });

    it('handles JSON parsing errors with 500 error', async () => {
      const mockRequest = {
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON'))
      };

      await expect(POST({ request: mockRequest })).rejects.toThrow('500');
      expect(mockError).toHaveBeenCalledWith(500, expect.stringContaining('Email diagnostics failed'));
    });

    it('handles DNS resolution errors gracefully', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'mx-health',
          domain: 'nonexistent.example.com'
        })
      };

      mockDns.resolveMx.mockRejectedValue(new Error('NXDOMAIN'));

      await POST({ request: mockRequest });

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          domain: 'nonexistent.example.com',
          error: expect.any(String)
        })
      );
    });

    it('handles SPF records with no SPF found', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'spf-check',
          domain: 'example.com'
        })
      };

      mockDns.resolveTxt.mockResolvedValue([
        ['some-other-txt-record']
      ]);

      await POST({ request: mockRequest });

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          domain: 'example.com',
          hasSpf: false
        })
      );
    });

    it('handles DMARC records with no DMARC found', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'dmarc-check',
          domain: 'example.com'
        })
      };

      mockDns.resolveTxt.mockResolvedValue([]);

      await POST({ request: mockRequest });

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          domain: 'example.com',
          hasDmarc: false
        })
      );
    });

    it('handles MX records with mixed IPv4/IPv6 resolution', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'mx-health',
          domain: 'example.com'
        })
      };

      mockResolveMx.mockResolvedValue([
        { priority: 10, exchange: 'mail1.example.com' },
        { priority: 20, exchange: 'mail2.example.com' }
      ]);

      mockDns.resolve4
        .mockResolvedValueOnce(['192.0.2.1'])
        .mockRejectedValueOnce(new Error('No A record'));

      mockDns.resolve6
        .mockRejectedValueOnce(new Error('No AAAA record'))
        .mockResolvedValueOnce(['2001:db8::1']);

      await POST({ request: mockRequest });

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          domain: 'example.com',
          mxRecords: expect.arrayContaining([
            expect.objectContaining({
              priority: 10,
              exchange: 'mail1.example.com',
              addresses: expect.objectContaining({
                ipv4: ['192.0.2.1'],
                ipv6: []
              })
            }),
            expect.objectContaining({
              priority: 20,
              exchange: 'mail2.example.com',
              addresses: expect.objectContaining({
                ipv4: [],
                ipv6: ['2001:db8::1']
              })
            })
          ])
        })
      );
    });

    it('handles complex SPF records with multiple mechanisms', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'spf-check',
          domain: 'example.com'
        })
      };

      mockResolveTxt.mockResolvedValue([
        ['v=spf1 ip4:192.0.2.0/24 include:_spf.google.com include:servers.mcsv.net ~all']
      ]);

      await POST({ request: mockRequest });

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          domain: 'example.com',
          hasSpf: true,
          spfRecord: expect.stringContaining('v=spf1'),
          mechanisms: expect.arrayContaining([
            expect.objectContaining({ type: 'ip4' }),
            expect.objectContaining({ type: 'include' })
          ])
        })
      );
    });

    it('handles DMARC records with policy analysis', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'dmarc-check',
          domain: 'example.com'
        })
      };

      mockResolveTxt.mockResolvedValue([
        ['v=DMARC1; p=quarantine; sp=reject; pct=100; rua=mailto:dmarc@example.com; ruf=mailto:forensic@example.com']
      ]);

      await POST({ request: mockRequest });

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          domain: 'example.com',
          hasDmarc: true,
          dmarcRecord: expect.stringContaining('v=DMARC1'),
          policy: expect.objectContaining({
            p: 'quarantine',
            sp: 'reject',
            pct: 100
          })
        })
      );
    });
  });

  describe('Request validation', () => {
    it('processes valid mx-health requests', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'mx-health',
          domain: 'test.com'
        })
      };

      mockDns.resolveMx.mockResolvedValue([]);

      await POST({ request: mockRequest });
      expect(mockJson).toHaveBeenCalled();
    });

    it('processes valid spf-check requests', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'spf-check',
          domain: 'test.com'
        })
      };

      mockDns.resolveTxt.mockResolvedValue([]);

      await POST({ request: mockRequest });
      expect(mockJson).toHaveBeenCalled();
    });

    it('processes valid dmarc-check requests', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'dmarc-check',
          domain: 'test.com'
        })
      };

      mockDns.resolveTxt.mockResolvedValue([]);

      await POST({ request: mockRequest });
      expect(mockJson).toHaveBeenCalled();
    });
  });

  describe('Action routing', () => {
    const testActions = [
      { action: 'mx-health', params: { domain: 'test.com' } },
      { action: 'spf-check', params: { domain: 'test.com' } },
      { action: 'dmarc-check', params: { domain: 'test.com' } }
    ];

    testActions.forEach(({ action, params }) => {
      it(`routes ${action} action correctly`, async () => {
        const mockRequest = {
          json: vi.fn().mockResolvedValue({
            action,
            ...params
          })
        };

        // Setup appropriate mocks for each action
        if (action === 'mx-health') {
          mockDns.resolveMx.mockResolvedValue([]);
        } else {
          mockDns.resolveTxt.mockResolvedValue([]);
        }

        await POST({ request: mockRequest });
        expect(mockJson).toHaveBeenCalled();
      });
    });
  });
});