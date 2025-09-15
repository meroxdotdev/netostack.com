import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock SvelteKit
vi.mock('@sveltejs/kit', () => ({
  json: vi.fn(),
  error: vi.fn()
}));

// Mock Node.js net
vi.mock('node:net', () => ({
  default: {},
  Socket: vi.fn()
}));

// Mock fetch for http-ping
(globalThis as any).fetch = vi.fn();

import { POST } from '../../../../../../../src/routes/api/internal/diagnostics/network/+server';
import { json, error } from '@sveltejs/kit';
import { Socket } from 'node:net';

// Get mocked functions
const mockJson = vi.mocked(json);
const mockError = vi.mocked(error);
const mockSocket = vi.mocked(Socket);
const mockFetch = vi.mocked((globalThis as any).fetch);

describe('Network Diagnostics Server', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockJson.mockReturnValue(new Response());
    mockError.mockImplementation((status, message) => {
      throw new Error(`${status}: ${message}`);
    });

    // Mock successful socket instance with immediate connection
    const mockSocketInstance = {
      destroy: vi.fn(),
      setTimeout: vi.fn(),
      on: vi.fn((event, callback) => {
        if (event === 'connect') {
          // Immediately trigger connect callback for fast tests
          setTimeout(() => callback(), 1);
        }
      }),
      connect: vi.fn()
    };
    mockSocket.mockReturnValue(mockSocketInstance as any);

    // Mock successful fetch response for http-ping
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers()
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
      expect(mockError).toHaveBeenCalledWith(500, expect.stringContaining('Network diagnostic failed'));
    });

    it('handles tcp-port-check action with valid targets', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'tcp-port-check',
          targets: ['example.com:80', 'google.com:443'],
          timeout: 3000
        })
      } as unknown as Request;

      // Mock successful socket connection
      const mockSocketInstance = {
        destroy: vi.fn(),
        setTimeout: vi.fn(),
        on: vi.fn((event, callback) => {
          if (event === 'connect') {
            setTimeout(() => callback(), 10);
          }
        }),
        connect: vi.fn()
      };
      mockSocket.mockReturnValue(mockSocketInstance as any);

      await POST({ request: mockRequest } as any);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          targets: ['example.com:80', 'google.com:443'],
          timeout: 3000,
          results: expect.any(Array),
          summary: expect.any(Object),
          timestamp: expect.any(String)
        })
      );
    });

    it('handles tcp-port-check with no targets error', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'tcp-port-check',
          targets: []
        })
      } as unknown as Request;

      await expect(POST({ request: mockRequest } as any)).rejects.toThrow('400');
      expect(mockError).toHaveBeenCalledWith(400, 'No targets provided');
    });

    it('handles tcp-port-check with too many targets error', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'tcp-port-check',
          targets: Array(51).fill('example.com:80')
        })
      } as unknown as Request;

      await expect(POST({ request: mockRequest } as any)).rejects.toThrow('400');
      expect(mockError).toHaveBeenCalledWith(400, 'Too many targets (max 50)');
    });

    it('handles tcp-port-check with invalid target format', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'tcp-port-check',
          targets: ['invalid-target-format']
        })
      } as unknown as Request;

      await POST({ request: mockRequest } as any);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          results: expect.arrayContaining([
            expect.objectContaining({
              host: 'invalid-target-format',
              port: 0,
              open: false,
              error: expect.stringContaining('Invalid host:port format')
            })
          ])
        })
      );
    });

    it('handles http-ping action with valid URL', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'http-ping',
          url: 'https://example.com',
          count: 3,
          method: 'HEAD'
        })
      } as unknown as Request;

      await POST({ request: mockRequest } as any);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://example.com',
          timestamp: expect.any(String)
        })
      );
    });

    it('handles http-ping with missing URL error', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'http-ping'
        })
      } as unknown as Request;

      await expect(POST({ request: mockRequest } as any)).rejects.toThrow('400');
      expect(mockError).toHaveBeenCalledWith(400, 'URL is required');
    });

    it('handles http-ping with invalid count error', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'http-ping',
          url: 'https://example.com',
          count: 25
        })
      } as unknown as Request;

      await expect(POST({ request: mockRequest } as any)).rejects.toThrow('400');
      expect(mockError).toHaveBeenCalledWith(400, 'Count must be between 1 and 20');
    });

    it('handles http-ping with invalid URL format error', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'http-ping',
          url: 'invalid-url-format'
        })
      } as unknown as Request;

      await expect(POST({ request: mockRequest } as any)).rejects.toThrow('400');
      expect(mockError).toHaveBeenCalledWith(400, 'Invalid URL format');
    });

    it('handles tcp-port-check with socket connection error', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'tcp-port-check',
          targets: ['unreachable.example.com:80']
        })
      } as unknown as Request;

      // Mock socket connection error
      const mockSocketInstance = {
        destroy: vi.fn(),
        setTimeout: vi.fn(),
        on: vi.fn((event, callback) => {
          if (event === 'error') {
            setTimeout(() => callback(new Error('Connection refused')), 10);
          }
        }),
        connect: vi.fn()
      };
      mockSocket.mockReturnValue(mockSocketInstance as any);

      await POST({ request: mockRequest } as any);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          results: expect.arrayContaining([
            expect.objectContaining({
              host: 'unreachable.example.com',
              port: 80,
              open: false,
              error: 'Connection refused'
            })
          ])
        })
      );
    });

    it('handles tcp-port-check with socket timeout', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'tcp-port-check',
          targets: ['slow.example.com:80'],
          timeout: 100
        })
      } as unknown as Request;

      // Mock socket timeout
      const mockSocketInstance = {
        destroy: vi.fn(),
        setTimeout: vi.fn(),
        on: vi.fn((event, callback) => {
          if (event === 'timeout') {
            setTimeout(() => callback(), 150);
          }
        }),
        connect: vi.fn()
      };
      mockSocket.mockReturnValue(mockSocketInstance as any);

      await POST({ request: mockRequest } as any);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          results: expect.arrayContaining([
            expect.objectContaining({
              host: 'slow.example.com',
              port: 80,
              open: false,
              error: 'Socket timeout'
            })
          ])
        })
      );
    });

    it('calculates summary statistics correctly', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'tcp-port-check',
          targets: ['host1.com:80', 'host2.com:443']
        })
      } as unknown as Request;

      // Mock one successful and one failed connection
      let callCount = 0;
      const mockSocketInstance = {
        destroy: vi.fn(),
        setTimeout: vi.fn(),
        on: vi.fn((event, callback) => {
          if (event === 'connect' && callCount === 0) {
            setTimeout(() => callback(), 10);
          } else if (event === 'error' && callCount === 1) {
            setTimeout(() => callback(new Error('Connection refused')), 10);
          }
          callCount++;
        }),
        connect: vi.fn()
      };
      mockSocket.mockReturnValue(mockSocketInstance as any);

      await POST({ request: mockRequest } as any);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          summary: expect.objectContaining({
            total: 2,
            open: expect.any(Number),
            closed: expect.any(Number)
          })
        })
      );
    });
  });

  describe('Request validation', () => {
    it('processes valid tcp-port-check requests', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'tcp-port-check',
          targets: ['test.com:80']
        })
      } as unknown as Request;

      await POST({ request: mockRequest } as any);
      expect(mockJson).toHaveBeenCalled();
    });

    it('processes valid http-ping requests', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'http-ping',
          url: 'https://test.com'
        })
      } as unknown as Request;

      await POST({ request: mockRequest } as any);
      expect(mockJson).toHaveBeenCalled();
    });

    it('handles default parameters correctly', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'http-ping',
          url: 'https://example.com'
        })
      } as unknown as Request;

      await POST({ request: mockRequest } as any);
      expect(mockJson).toHaveBeenCalled();
    });
  });

  describe('Action routing', () => {
    const testActions = [
      { action: 'tcp-port-check', params: { targets: ['test.com:80'] } },
      { action: 'http-ping', params: { url: 'https://test.com' } }
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

  describe('Edge cases', () => {
    it('handles IPv6 addresses in tcp-port-check', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'tcp-port-check',
          targets: ['[2001:db8::1]:80']
        })
      } as unknown as Request;

      await POST({ request: mockRequest } as any);
      expect(mockJson).toHaveBeenCalled();
    });

    it('handles whitespace in target strings', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'tcp-port-check',
          targets: ['  example.com:80  ', ' google.com:443 ']
        })
      } as unknown as Request;

      await POST({ request: mockRequest } as any);
      expect(mockJson).toHaveBeenCalled();
    });

    it('handles different HTTP methods in http-ping', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'http-ping',
          url: 'https://example.com',
          method: 'GET'
        })
      } as unknown as Request;

      await POST({ request: mockRequest } as any);
      expect(mockJson).toHaveBeenCalled();
    });
  });
});