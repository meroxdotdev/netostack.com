import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock SvelteKit
vi.mock('@sveltejs/kit', () => ({
  json: vi.fn(),
  error: vi.fn()
}));

// Mock Node.js DNS completely - handle the bug where promises is used for setServers
vi.mock('node:dns', () => {
  const mockDnsResolve = vi.fn();
  const mockDnsReverse = vi.fn();
  const mockDnsResolveTxt = vi.fn();
  const mockDnsResolveMx = vi.fn();
  const mockDnsResolveNs = vi.fn();
  const mockDnsResolveSoa = vi.fn();
  const mockDnsResolveCaa = vi.fn();
  const mockDnsSetServers = vi.fn();

  // Create promises object that also has setServers and setDefaultResultOrder (to handle the server bug)
  const promisesWithSetServers = {
    resolve: mockDnsResolve,
    reverse: mockDnsReverse,
    resolveTxt: mockDnsResolveTxt,
    resolveMx: mockDnsResolveMx,
    resolveNs: mockDnsResolveNs,
    resolveSoa: mockDnsResolveSoa,
    resolveCaa: mockDnsResolveCaa,
    setServers: mockDnsSetServers,
    setDefaultResultOrder: vi.fn()
  };

  return {
    default: {
      setServers: mockDnsSetServers
    },
    promises: promisesWithSetServers,
    setServers: mockDnsSetServers
  };
});

// Mock fetch
(globalThis as any).fetch = vi.fn();

import { POST } from '../../../../../../../src/routes/api/internal/diagnostics/dns/+server';
import { json, error } from '@sveltejs/kit';
import { promises as dns } from 'node:dns';

// Get mocked functions
const mockJson = vi.mocked(json);
const mockError = vi.mocked(error);
const mockFetch = vi.mocked((globalThis as any).fetch);
const mockDns = vi.mocked(dns);

describe('DNS Diagnostics Server - Basic Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockJson.mockReturnValue(new Response());
    mockError.mockImplementation((status, message) => {
      throw new Error(`${status}: ${message}`);
    });

    // Setup DNS mocks - directly mock the methods that will be called
    vi.mocked(dns.setServers).mockImplementation(() => {});
    vi.mocked(dns.setDefaultResultOrder).mockImplementation(() => {});
    vi.mocked(dns.resolve).mockResolvedValue(['192.0.2.1']);
    vi.mocked(dns.reverse).mockResolvedValue(['example.com']);
    vi.mocked(dns.resolveTxt).mockResolvedValue([['v=spf1 include:_spf.google.com ~all']]);
    vi.mocked(dns.resolveMx).mockResolvedValue([{ priority: 10, exchange: 'mail.example.com' }]);
    vi.mocked(dns.resolveNs).mockResolvedValue(['ns1.example.com']);
    vi.mocked(dns.resolveSoa).mockResolvedValue({
      nsname: 'ns1.example.com',
      hostmaster: 'hostmaster.example.com',
      serial: 2024010101,
      refresh: 3600,
      retry: 1800,
      expire: 604800,
      minttl: 86400
    });
    vi.mocked(dns.resolveCaa).mockResolvedValue([{ critical: 0, issue: 'letsencrypt.org' }]);

    // Mock successful fetch response for DoH
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        Answer: [{ data: '192.0.2.1', TTL: 300 }]
      })
    } as any);
  });

  describe('POST handler', () => {
    it('handles unknown action with 400 error', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'unknown-action'
        })
      } as unknown as Request;

      await expect(POST({ request: mockRequest } as any)).rejects.toThrow('400');
      expect(mockError).toHaveBeenCalledWith(400, 'Unknown action: unknown-action');
    });

    it('handles JSON parsing errors with 500 error', async () => {
      const mockRequest = {
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON'))
      } as unknown as Request;

      await expect(POST({ request: mockRequest } as any)).rejects.toThrow('500');
      expect(mockError).toHaveBeenCalledWith(500, expect.stringContaining('DNS operation failed'));
    });

    it('handles spf-evaluator action', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'spf-evaluator',
          domain: 'example.com'
        })
      } as unknown as Request;

      await POST({ request: mockRequest } as any);
      expect(mockJson).toHaveBeenCalled();
    });

    it('handles dmarc-check action', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'dmarc-check',
          domain: 'example.com'
        })
      } as unknown as Request;

      await POST({ request: mockRequest } as any);
      expect(mockJson).toHaveBeenCalled();
    });

    it('handles caa-effective action', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'caa-effective',
          name: 'example.com'
        })
      } as unknown as Request;

      await POST({ request: mockRequest } as any);
      expect(mockJson).toHaveBeenCalled();
    });

    it('handles ns-soa-check action', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'ns-soa-check',
          domain: 'example.com'
        })
      } as unknown as Request;

      await POST({ request: mockRequest } as any);
      expect(mockJson).toHaveBeenCalled();
    });

    it('handles dnssec-adflag action', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'dnssec-adflag',
          name: 'example.com',
          type: 'A'
        })
      } as unknown as Request;

      await POST({ request: mockRequest } as any);
      expect(mockJson).toHaveBeenCalled();
    });

    it('handles soa-serial action', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'soa-serial',
          domain: 'example.com'
        })
      } as unknown as Request;

      await POST({ request: mockRequest } as any);
      expect(mockJson).toHaveBeenCalled();
    });

    it('handles propagation action with multiple resolvers', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'propagation',
          name: 'example.com',
          type: 'A'
        })
      } as unknown as Request;

      await POST({ request: mockRequest } as any);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          results: expect.arrayContaining([
            expect.objectContaining({
              resolver: expect.any(String)
            })
          ])
        })
      );
    });

    it('handles lookup action with DoH preference', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'lookup',
          name: 'example.com',
          type: 'A',
          resolverOpts: {
            doh: 'cloudflare',
            preferDoH: true
          }
        })
      } as unknown as Request;

      await POST({ request: mockRequest } as any);
      expect(mockJson).toHaveBeenCalled();
    });

    it('handles reverse-lookup action for IPv4', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'reverse-lookup',
          ip: '8.8.8.8'
        })
      } as unknown as Request;

      await POST({ request: mockRequest } as any);
      expect(mockJson).toHaveBeenCalled();
    });

    it('handles reverse-lookup action for IPv6', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'reverse-lookup',
          ip: '2001:db8::1'
        })
      } as unknown as Request;

      await POST({ request: mockRequest } as any);
      expect(mockJson).toHaveBeenCalled();
    });
  });

  describe('Request validation', () => {
    it('processes valid lookup requests', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'lookup',
          name: 'test.com',
          type: 'AAAA'
        })
      } as unknown as Request;

      await POST({ request: mockRequest } as any);
      expect(mockJson).toHaveBeenCalled();
    });

    it('processes requests with resolver options', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'lookup',
          name: 'test.com',
          type: 'A',
          resolverOpts: {
            doh: 'google',
            timeoutMs: 5000
          }
        })
      } as unknown as Request;

      await POST({ request: mockRequest } as any);
      expect(mockJson).toHaveBeenCalled();
    });
  });

  describe('Action routing', () => {
    const testActions = [
      { action: 'lookup', params: { name: 'test.com', type: 'A' } },
      { action: 'reverse-lookup', params: { ip: '1.1.1.1' } },
      { action: 'propagation', params: { name: 'test.com', type: 'A' } },
      { action: 'spf-evaluator', params: { domain: 'test.com' } },
      { action: 'dmarc-check', params: { domain: 'test.com' } },
      { action: 'caa-effective', params: { name: 'test.com' } },
      { action: 'ns-soa-check', params: { domain: 'test.com' } },
      { action: 'dnssec-adflag', params: { name: 'test.com', type: 'A' } },
      { action: 'soa-serial', params: { domain: 'test.com' } }
    ];

    testActions.forEach(({ action, params }) => {
      it(`routes ${action} action correctly`, async () => {
        const mockRequest = {
          json: vi.fn().mockResolvedValue({
            action,
            ...params
          })
        };

        await POST({ request: mockRequest } as any);
        expect(mockJson).toHaveBeenCalled();
      });
    });
  });
});