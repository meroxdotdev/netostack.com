import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock SvelteKit
vi.mock('@sveltejs/kit', () => ({
  json: vi.fn(),
  error: vi.fn()
}));

// Mock fetch for RDAP requests
(globalThis as any).fetch = vi.fn();

import { POST } from '../../../../../../../src/routes/api/internal/diagnostics/rdap/+server';
import { json, error } from '@sveltejs/kit';

// Get mocked functions
const mockJson = vi.mocked(json);
const mockError = vi.mocked(error);
const mockFetch = vi.mocked((globalThis as any).fetch);

describe('RDAP Diagnostics Server', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockJson.mockReturnValue(new Response());
    mockError.mockImplementation((status, message) => {
      throw new Error(`${status}: ${message}`);
    });

    // Mock successful fetch responses for RDAP bootstrap and queries using real Response object
    const createMockResponse = (data: any) => {
      const jsonString = JSON.stringify(data);
      return new Response(jsonString, {
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' }
      });
    };

    const mockBootstrapResponse = createMockResponse({
      services: [
        [['com'], ['https://rdap.verisign.com/com/v1/']],
        [['net'], ['https://rdap.verisign.com/net/v1/']],
        [['1.0.0.0/8', '2.0.0.0/8'], ['https://rdap.arin.net/registry/']],
        [['2001:400::/32'], ['https://rdap.arin.net/registry/']]
      ]
    });

    const mockRdapQueryResponse = createMockResponse({
      objectClassName: 'domain',
      handle: 'example.com',
      ldhName: 'example.com',
      nameservers: [
        { ldhName: 'ns1.example.com' },
        { ldhName: 'ns2.example.com' }
      ]
    });

    // Mock different responses based on URL
    mockFetch.mockImplementation((url: string) => {
      if (typeof url === 'string' && url.includes('rdap.iana.org')) {
        // Bootstrap registry request
        return Promise.resolve(mockBootstrapResponse as any);
      } else {
        // RDAP query request
        return Promise.resolve(mockRdapQueryResponse as any);
      }
    });
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
      expect(mockError).toHaveBeenCalledWith(500, expect.stringContaining('RDAP lookup failed'));
    });

    it('handles domain-lookup action with valid domain', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'domain-lookup',
          domain: 'example.com'
        })
      } as unknown as Request;

      // Mock bootstrap response first, then RDAP response
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            services: [
              [['com'], ['https://rdap.verisign.com/com/v1/']]
            ]
          })
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            objectClassName: 'domain',
            ldhName: 'example.com',
            handle: 'example'
          })
        } as any);

      await POST({ request: mockRequest } as any);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          domain: 'example.com',
          serviceUrl: expect.any(String),
          data: expect.any(Object)
        })
      );
    });

    it('handles domain-lookup action with invalid domain', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'domain-lookup',
          domain: 'invalid'
        })
      } as unknown as Request;

      await expect(POST({ request: mockRequest } as any)).rejects.toThrow('500');
      expect(mockError).toHaveBeenCalledWith(500, expect.stringContaining('Valid domain name required'));
    });

    it('handles ip-lookup action for IPv4', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'ip-lookup',
          ip: '192.0.2.1'
        })
      } as unknown as Request;

      // Mock bootstrap response first, then RDAP response
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            services: [
              [['192.0.0.0/8'], ['https://rdap.arin.net/registry/ip/']]
            ]
          })
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            objectClassName: 'ip network',
            startAddress: '192.0.2.0',
            endAddress: '192.0.2.255'
          })
        } as any);

      await POST({ request: mockRequest } as any);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          ip: '192.0.2.1',
          serviceUrl: expect.any(String),
          data: expect.any(Object)
        })
      );
    });

    it('handles ip-lookup action for IPv6', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'ip-lookup',
          ip: '2001:db8::1'
        })
      } as unknown as Request;

      // Mock bootstrap response first, then RDAP response
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            services: [
              [['2001:db8::/32'], ['https://rdap.db8.example/ip/']]
            ]
          })
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            objectClassName: 'ip network',
            startAddress: '2001:db8::',
            endAddress: '2001:db8:ffff:ffff:ffff:ffff:ffff:ffff'
          })
        } as any);

      await POST({ request: mockRequest } as any);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          ip: '2001:db8::1',
          serviceUrl: expect.any(String),
          data: expect.any(Object)
        })
      );
    });

    it('handles asn-lookup action', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'asn-lookup',
          asn: '64496'
        })
      } as unknown as Request;

      // Mock bootstrap response first, then RDAP response
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            services: [
              [['64496-64511'], ['https://rdap.example/asn/']]
            ]
          })
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            objectClassName: 'autnum',
            handle: '64496',
            startAutnum: 64496,
            endAutnum: 64496
          })
        } as any);

      await POST({ request: mockRequest } as any);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          asn: '64496',
          serviceUrl: expect.any(String),
          data: expect.any(Object)
        })
      );
    });

    it('handles missing domain parameter', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'domain-lookup'
        })
      } as unknown as Request;

      await expect(POST({ request: mockRequest } as any)).rejects.toThrow('500');
    });

    it('handles missing IP parameter', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'ip-lookup'
        })
      } as unknown as Request;

      await expect(POST({ request: mockRequest } as any)).rejects.toThrow('500');
    });

    it('handles missing ASN parameter', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'asn-lookup'
        })
      } as unknown as Request;

      await expect(POST({ request: mockRequest } as any)).rejects.toThrow('500');
    });

    it('handles RDAP service unavailable', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'domain-lookup',
          domain: 'example.com'
        })
      } as unknown as Request;

      // Mock bootstrap failure
      mockFetch.mockRejectedValue(new Error('Bootstrap service unavailable'));

      await expect(POST({ request: mockRequest } as any)).rejects.toThrow('500');
    });

    it('handles RDAP query failure', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'domain-lookup',
          domain: 'example.com'
        })
      } as unknown as Request;

      // Mock bootstrap success but RDAP query failure
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            services: [
              [['com'], ['https://rdap.verisign.com/com/v1/']]
            ]
          })
        } as any)
        .mockRejectedValueOnce(new Error('RDAP service error'));

      await expect(POST({ request: mockRequest } as any)).rejects.toThrow('500');
    });
  });

  describe('Request validation', () => {
    it('processes valid domain-lookup requests', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'domain-lookup',
          domain: 'test.com'
        })
      } as unknown as Request;

      // Mock successful responses
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ services: [[['.com'], ['https://example.com/']]] })
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ objectClassName: 'domain' })
        } as any);

      await POST({ request: mockRequest } as any);
      expect(mockJson).toHaveBeenCalled();
    });

    it('processes valid ip-lookup requests', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'ip-lookup',
          ip: '1.1.1.1'
        })
      } as unknown as Request;

      // Mock successful responses
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ services: [[['']], [['https://example.com/']]] })
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ objectClassName: 'ip network' })
        } as any);

      await POST({ request: mockRequest } as any);
      expect(mockJson).toHaveBeenCalled();
    });

    it('processes valid asn-lookup requests', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'asn-lookup',
          asn: '12345'
        })
      } as unknown as Request;

      // Mock successful responses
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ services: [[['']], [['https://example.com/']]] })
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ objectClassName: 'autnum' })
        } as any);

      await POST({ request: mockRequest } as any);
      expect(mockJson).toHaveBeenCalled();
    });
  });

  describe('Action routing', () => {
    const testActions = [
      { action: 'domain-lookup', params: { domain: 'test.com' } },
      { action: 'ip-lookup', params: { ip: '1.1.1.1' } },
      { action: 'asn-lookup', params: { asn: '12345' } }
    ];

    testActions.forEach(({ action, params }) => {
      it(`routes ${action} action correctly`, async () => {
        const mockRequest = {
          json: vi.fn().mockResolvedValue({
            action,
            ...params
          })
        };

        // Mock successful responses for all actions
        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ services: [[['']], [['https://example.com/']]] })
          } as any)
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ objectClassName: 'test' })
          } as any);

        await POST({ request: mockRequest } as any);
        expect(mockJson).toHaveBeenCalled();
      });
    });
  });
});