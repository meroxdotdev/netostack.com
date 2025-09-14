import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';

// Mock SvelteKit
vi.mock('@sveltejs/kit', () => ({
  json: vi.fn(),
  error: vi.fn()
}));

// Import MSW for proper mocking
import { http, HttpResponse } from 'msw';
import { server } from '../../../../../../setup';

import { POST } from '../../../../../../../src/routes/api/internal/diagnostics/http/+server';
import { json, error } from '@sveltejs/kit';

// Get mocked functions
const mockJson = vi.mocked(json);
const mockError = vi.mocked(error);

describe('HTTP Diagnostics Server', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockJson.mockReturnValue(new Response());
    mockError.mockImplementation((status, message) => {
      throw new Error(`${status}: ${message}`);
    });

    // Set up MSW handlers for HTTP requests
    server.use(
      // Handle all external HTTP requests
      http.get('https://example.com', () => {
        return new HttpResponse(null, {
          status: 200,
          statusText: 'OK',
          headers: {
            'content-type': 'text/html',
            'content-length': '1234',
            'server': 'nginx/1.20.1'
          }
        });
      }),
      http.head('https://example.com', () => {
        return new HttpResponse(null, {
          status: 200,
          statusText: 'OK',
          headers: {
            'content-type': 'text/html',
            'content-length': '1234',
            'server': 'nginx/1.20.1'
          }
        });
      }),
      http.post('https://example.com', () => {
        return new HttpResponse(null, {
          status: 200,
          statusText: 'OK',
          headers: {
            'content-type': 'text/html',
            'content-length': '1234'
          }
        });
      }),
      http.options('https://api.example.com', () => {
        return new HttpResponse(null, {
          status: 200,
          headers: {
            'access-control-allow-origin': '*',
            'access-control-allow-methods': 'GET, POST, PUT',
            'access-control-allow-headers': 'content-type, authorization'
          }
        });
      }),
      // Handle other domains
      http.get('http://example.com', () => {
        return new HttpResponse(null, { status: 200 });
      }),
      http.head('http://example.com', () => {
        return new HttpResponse(null, { status: 200 });
      }),
      http.get('https://example.com:8080', () => {
        return new HttpResponse(null, { status: 200 });
      }),
      http.head('https://example.com:8080', () => {
        return new HttpResponse(null, { status: 200 });
      }),
      http.get('https://sub.example.com/path', () => {
        return new HttpResponse(null, { status: 200 });
      }),
      http.head('https://sub.example.com/path', () => {
        return new HttpResponse(null, { status: 200 });
      }),
      // Handle test.com domain used in many tests
      http.get('https://test.com', () => {
        return new HttpResponse(null, { status: 200 });
      }),
      http.head('https://test.com', () => {
        return new HttpResponse(null, { status: 200 });
      }),
      http.post('https://test.com', () => {
        return new HttpResponse(null, { status: 200 });
      }),
      // Catch-all for other test URLs
      http.get('*', ({ request }) => {
        const url = new URL(request.url);
        if (url.hostname.includes('test') || url.hostname.includes('example')) {
          return new HttpResponse(null, { status: 200 });
        }
        return new HttpResponse(null, { status: 404 });
      }),
      http.head('*', ({ request }) => {
        const url = new URL(request.url);
        if (url.hostname.includes('test') || url.hostname.includes('example')) {
          return new HttpResponse(null, { status: 200 });
        }
        return new HttpResponse(null, { status: 404 });
      })
    );
  });

  describe('POST handler', () => {
    it('handles missing action parameter with 400 error', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          url: 'https://example.com'
        })
      };

      await expect(POST({ request: mockRequest })).rejects.toThrow('400');
      expect(mockError).toHaveBeenCalledWith(400, 'Missing required parameters: action and url');
    });

    it('handles missing url parameter with 400 error', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'headers'
        })
      };

      await expect(POST({ request: mockRequest })).rejects.toThrow('400');
      expect(mockError).toHaveBeenCalledWith(400, 'Missing required parameters: action and url');
    });

    it('handles invalid URL with 400 error', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'headers',
          url: 'invalid-url'
        })
      };

      await expect(POST({ request: mockRequest })).rejects.toThrow('400');
      expect(mockError).toHaveBeenCalledWith(400, expect.stringContaining('Invalid URL'));
    });

    it('handles unknown action with 400 error', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'unknown-action',
          url: 'https://example.com'
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
      expect(mockError).toHaveBeenCalledWith(500, expect.any(String));
    });

    it('handles headers action successfully', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'headers',
          url: 'https://example.com'
        })
      };

      await POST({ request: mockRequest });

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 200,
          statusText: 'OK',
          headers: expect.any(Object),
          url: 'https://example.com'
        })
      );
    });

    it('handles redirect-trace action successfully', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'redirect-trace',
          url: 'https://example.com'
        })
      };

      await POST({ request: mockRequest });

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          finalStatus: 200,
          finalUrl: 'https://example.com',
          redirectChain: expect.any(Array),
          totalRedirects: expect.any(Number)
        })
      );
    });

    it('handles security action successfully', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'security',
          url: 'https://example.com'
        })
      };

      // Add MSW handler with security headers
      server.use(
        http.get('https://example.com', () => {
          return new HttpResponse(null, {
            status: 200,
            headers: {
              'strict-transport-security': 'max-age=31536000',
              'content-security-policy': "default-src 'self'"
            }
          });
        })
      );

      await POST({ request: mockRequest });

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('example.com'),
          status: 200,
          headers: expect.any(Object),
          analysis: expect.any(Object)
        })
      );
    });

    it('handles cors-check action successfully', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'cors-check',
          url: 'https://api.example.com'
        })
      };

      // CORS headers already handled by MSW in beforeEach

      await POST({ request: mockRequest });

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          preflight: expect.objectContaining({
            status: 200,
            allowed: expect.any(Boolean),
            headers: expect.any(Object)
          }),
          analysis: expect.objectContaining({
            corsEnabled: expect.any(Boolean),
            allowsOrigin: expect.any(Boolean)
          })
        })
      );
    });

    it('handles cors-check with custom origin', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'cors-check',
          url: 'https://api.example.com',
          headers: {
            origin: 'https://mydomain.com'
          }
        })
      };

      await POST({ request: mockRequest });

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          origin: 'https://mydomain.com'
        })
      );
    });

    it('handles cors-check with preflight failure', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'cors-check',
          url: 'https://api.example.com'
        })
      };

      // Mock fetch failure for CORS preflight
      server.use(
        http.options('https://api.example.com', () => {
          return HttpResponse.error();
        })
      );

      await POST({ request: mockRequest });

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          preflight: expect.objectContaining({
            status: 0,
            allowed: false,
            error: 'Network error'
          }),
          analysis: expect.objectContaining({
            corsEnabled: false
          })
        })
      );
    });

    it('handles perf action successfully', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'perf',
          url: 'https://example.com'
        })
      };

      // Mock response with performance-related headers
      server.use(
        http.get('https://example.com', () => {
          return new HttpResponse(null, {
            status: 200,
            headers: {
              'content-length': '5000',
              'content-encoding': 'gzip'
            }
          });
        })
      );

      await POST({ request: mockRequest });

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://example.com',
          status: 200,
          size: 5000,
          performance: expect.objectContaining({
            isHTTPS: true,
            hasCompression: true
          })
        })
      );
    });

    it('handles custom headers in request', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'headers',
          url: 'https://example.com',
          headers: {
            'User-Agent': 'Custom-Agent/1.0',
            'Authorization': 'Bearer token123'
          }
        })
      };

      await POST({ request: mockRequest });
      expect(mockJson).toHaveBeenCalled();
    });

    it('handles custom method parameter', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'headers',
          url: 'https://example.com',
          method: 'POST'
        })
      };

      await POST({ request: mockRequest });
      expect(mockJson).toHaveBeenCalled();
    });

    it('handles timeout parameter', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'headers',
          url: 'https://example.com',
          timeout: 5000
        })
      };

      await POST({ request: mockRequest });
      expect(mockJson).toHaveBeenCalled();
    });

    it('handles maxRedirects parameter', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'redirect-trace',
          url: 'https://example.com',
          maxRedirects: 5
        })
      };

      await POST({ request: mockRequest });
      expect(mockJson).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('handles timeout errors with 408 status', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'headers',
          url: 'https://timeout.example.com'
        })
      };

      server.use(
        http.get('https://timeout.example.com', () => {
          const abortError = new Error('Request timeout');
          abortError.name = 'AbortError';
          throw abortError;
        })
      );

      await expect(POST({ request: mockRequest })).rejects.toThrow('408');
      expect(mockError).toHaveBeenCalledWith(408, 'Request timeout');
    });

    it('handles DNS resolution errors with 400 status', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'headers',
          url: 'https://nonexistent.example.com'
        })
      };

      server.use(
        http.get('https://nonexistent.example.com', () => {
          const dnsError = new Error('Host not found');
          dnsError.code = 'ENOTFOUND';
          throw dnsError;
        })
      );

      await expect(POST({ request: mockRequest })).rejects.toThrow('400');
      expect(mockError).toHaveBeenCalledWith(400, 'Host not found');
    });

    it('handles connection refused errors with 400 status', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'headers',
          url: 'https://refused.example.com'
        })
      };

      server.use(
        http.get('https://refused.example.com', () => {
          const connError = new Error('Connection refused');
          connError.code = 'ECONNREFUSED';
          throw connError;
        })
      );

      await expect(POST({ request: mockRequest })).rejects.toThrow('400');
      expect(mockError).toHaveBeenCalledWith(400, 'Connection refused');
    });

    it('handles generic errors with 500 status', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'headers',
          url: 'https://error.example.com'
        })
      };

      server.use(
        http.get('https://error.example.com', () => {
          throw new Error('Generic error');
        })
      );

      await expect(POST({ request: mockRequest })).rejects.toThrow('500');
      expect(mockError).toHaveBeenCalledWith(500, 'Generic error');
    });
  });

  describe('Request validation', () => {
    it('processes valid requests with all parameters', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'headers',
          url: 'https://test.com',
          method: 'GET',
          headers: { 'Custom': 'Header' },
          maxRedirects: 5,
          timeout: 10000
        })
      };

      await POST({ request: mockRequest });
      expect(mockJson).toHaveBeenCalled();
    });

    it('uses default parameters when not provided', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'headers',
          url: 'https://test.com'
        })
      };

      await POST({ request: mockRequest });
      expect(mockJson).toHaveBeenCalled();
    });
  });

  describe('Action routing', () => {
    const testActions = [
      'headers',
      'redirect-trace',
      'security',
      'cors-check',
      'perf'
    ];

    testActions.forEach((action) => {
      it(`routes ${action} action correctly`, async () => {
        const mockRequest = {
          json: vi.fn().mockResolvedValue({
            action,
            url: 'https://test.com'
          })
        };

        await POST({ request: mockRequest });
        expect(mockJson).toHaveBeenCalled();
      });
    });
  });

  describe('URL validation', () => {
    const invalidUrls = [
      'not-a-url',
      'ftp://example.com',
      'file:///etc/passwd',
      'javascript:alert(1)',
      'data:text/html,<script>alert(1)</script>'
    ];

    invalidUrls.forEach((url) => {
      it(`rejects invalid URL: ${url}`, async () => {
        const mockRequest = {
          json: vi.fn().mockResolvedValue({
            action: 'headers',
            url
          })
        };

        await expect(POST({ request: mockRequest })).rejects.toThrow('400');
      });
    });

    const validUrls = [
      'https://example.com',
      'http://example.com',
      'https://example.com:8080',
      'https://sub.example.com/path?query=value'
    ];

    validUrls.forEach((url) => {
      it(`accepts valid URL: ${url}`, async () => {
        const mockRequest = {
          json: vi.fn().mockResolvedValue({
            action: 'headers',
            url
          })
        };

        await POST({ request: mockRequest });
        expect(mockJson).toHaveBeenCalled();
      });
    });
  });
});