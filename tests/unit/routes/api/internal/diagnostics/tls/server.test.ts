import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock SvelteKit
vi.mock('@sveltejs/kit', () => ({
  json: vi.fn(),
  error: vi.fn()
}));

// Mock Node.js tls
vi.mock('node:tls', () => ({
  default: {},
  connect: vi.fn()
}));

import { POST } from '../../../../../../../src/routes/api/internal/diagnostics/tls/+server';
import { json, error } from '@sveltejs/kit';
import * as tls from 'node:tls';

// Get mocked functions
const mockJson = vi.mocked(json);
const mockError = vi.mocked(error);
const mockTlsConnect = vi.mocked((tls as any).connect);

describe('TLS Diagnostics Server', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockJson.mockReturnValue(new Response());
    mockError.mockImplementation((status, message) => {
      throw new Error(`${status}: ${message}`);
    });

    // Mock successful TLS connection with immediate callbacks for fast tests
    const mockSocket = {
      destroy: vi.fn(),
      on: vi.fn((event, callback) => {
        if (event === 'secureConnect') {
          // Immediately trigger secureConnect for fast tests
          setTimeout(() => callback(), 0);
        } else if (event === 'error') {
          // Don't trigger error by default
        }
      }),
      getPeerCertificate: vi.fn(() => ({
        subject: { CN: 'example.com' },
        issuer: { CN: 'Test CA' },
        valid_from: 'Jan 1 2024',
        valid_to: 'Jan 1 2025',
        fingerprint: 'AA:BB:CC',
        serialNumber: '12345'
      })),
      getProtocol: vi.fn(() => 'TLSv1.3'),
      getCipher: vi.fn(() => ({ name: 'AES256-GCM-SHA384' })),
      getEphemeralKeyInfo: vi.fn(() => ({ type: 'ECDH', name: 'prime256v1' })),
      alpnProtocol: 'h2'
    };
    mockTlsConnect.mockReturnValue(mockSocket as any);
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
      expect(mockError).toHaveBeenCalledWith(500, expect.stringContaining('TLS operation failed'));
    });

    it('handles certificate action with hostname', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'certificate',
          host: 'example.com'
        })
      } as unknown as Request;

      // Mock successful connection
      const mockSocket = {
        destroy: vi.fn(),
        on: vi.fn((event, callback) => {
          if (event === 'secureConnect') {
            setTimeout(() => callback(), 0);
          }
        }),
        getPeerCertificate: vi.fn(() => ({
          subject: { CN: 'example.com' },
          issuer: { CN: 'Test CA' },
          valid_from: 'Jan 1 2024',
          valid_to: 'Jan 1 2025',
          fingerprint: 'AA:BB:CC',
          serialNumber: '12345'
        }))
      };
      mockTlsConnect.mockReturnValue(mockSocket as any);

      await POST({ request: mockRequest } as any);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'example.com',
          port: 443
        })
      );
    });

    it('handles certificate action with custom port', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'certificate',
          host: 'example.com',
          port: 8443
        })
      } as unknown as Request;

      await POST({ request: mockRequest } as any);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'example.com',
          port: 8443
        })
      );
    });

    it('handles certificate action with servername', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'certificate',
          host: '192.168.1.1',
          servername: 'example.com'
        })
      } as unknown as Request;

      await POST({ request: mockRequest } as any);

      expect(mockJson).toHaveBeenCalled();
    });

    it('handles versions action successfully', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'versions',
          host: 'example.com'
        })
      } as unknown as Request;

      // Mock multiple TLS version connections
      let connectionCount = 0;
      mockTlsConnect.mockImplementation((options: any) => {
        const mockSocket = {
          destroy: vi.fn(),
          on: vi.fn((event, callback) => {
            if (event === 'secureConnect') {
              setTimeout(() => callback(), 0);
            }
          }),
          getProtocol: vi.fn(() => {
            connectionCount++;
            return connectionCount === 1 ? 'TLSv1.3' : 'TLSv1.2';
          })
        };
        return mockSocket as any;
      });

      await POST({ request: mockRequest } as any);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'example.com',
          port: 443,
          supported: expect.any(Array)
        })
      );
    });

    it('handles alpn action with default protocols', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'alpn',
          host: 'example.com'
        })
      } as unknown as Request;

      // Mock ALPN negotiation
      const mockSocket = {
        destroy: vi.fn(),
        on: vi.fn((event, callback) => {
          if (event === 'secureConnect') {
            setTimeout(() => callback(), 0);
          }
        }),
        alpnProtocol: 'h2'
      };
      mockTlsConnect.mockReturnValue(mockSocket as any);

      await POST({ request: mockRequest } as any);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'example.com',
          port: 443,
          requestedProtocols: ['h2', 'http/1.1']
        })
      );
    });

    it('handles alpn action with custom protocols', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'alpn',
          host: 'example.com',
          protocols: ['h3', 'h2', 'http/1.1']
        })
      } as unknown as Request;

      await POST({ request: mockRequest } as any);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          requestedProtocols: ['h3', 'h2', 'http/1.1']
        })
      );
    });

    it('handles TLS connection errors gracefully', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'certificate',
          host: 'nonexistent.example.com'
        })
      } as unknown as Request;

      // Mock connection error
      const mockSocket = {
        destroy: vi.fn(),
        on: vi.fn((event, callback) => {
          if (event === 'error') {
            setTimeout(() => callback(new Error('Connection refused')), 10);
          }
        })
      } as unknown as Request;
      mockTlsConnect.mockReturnValue(mockSocket as any);

      await expect(POST({ request: mockRequest } as any)).rejects.toThrow('500');
    });

    it('handles certificate parsing errors', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'certificate',
          host: 'example.com'
        })
      } as unknown as Request;

      // Mock connection with certificate error
      const mockSocket = {
        destroy: vi.fn(),
        on: vi.fn((event, callback) => {
          if (event === 'secureConnect') {
            setTimeout(() => callback(), 0);
          }
        }),
        getPeerCertificate: vi.fn(() => {
          throw new Error('Certificate parsing failed');
        })
      } as unknown as Request;
      mockTlsConnect.mockReturnValue(mockSocket as any);

      await expect(POST({ request: mockRequest } as any)).rejects.toThrow('500');
    });

    it('handles IPv6 addresses correctly', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'certificate',
          host: '[2001:db8::1]'
        })
      } as unknown as Request;

      await POST({ request: mockRequest } as any);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          host: '2001:db8::1'
        })
      );
    });

    it('handles hostname with port in host string', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'certificate',
          host: 'example.com:8443'
        })
      } as unknown as Request;

      await POST({ request: mockRequest } as any);

      expect(mockJson).toHaveBeenCalled();
    });
  });

  describe('Request validation', () => {
    it('processes valid certificate requests', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'certificate',
          host: 'test.com'
        })
      } as unknown as Request;

      await POST({ request: mockRequest } as any);
      expect(mockJson).toHaveBeenCalled();
    });

    it('processes valid versions requests', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'versions',
          host: 'test.com'
        })
      } as unknown as Request;

      await POST({ request: mockRequest } as any);
      expect(mockJson).toHaveBeenCalled();
    });

    it('processes valid alpn requests', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'alpn',
          host: 'test.com'
        })
      } as unknown as Request;

      await POST({ request: mockRequest } as any);
      expect(mockJson).toHaveBeenCalled();
    });

    it('uses default port 443 when not specified', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'certificate',
          host: 'test.com'
        })
      } as unknown as Request;

      await POST({ request: mockRequest } as any);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          port: 443
        })
      );
    });
  });

  describe('Action routing', () => {
    const testActions = [
      { action: 'certificate', params: { host: 'test.com' } },
      { action: 'versions', params: { host: 'test.com' } },
      { action: 'alpn', params: { host: 'test.com' } }
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
    it('handles connection timeout', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'certificate',
          host: 'slow.example.com'
        })
      } as unknown as Request;

      // Mock timeout
      const mockSocket = {
        destroy: vi.fn(),
        on: vi.fn((event, callback) => {
          if (event === 'timeout') {
            setTimeout(() => callback(), 0);
          }
        })
      } as unknown as Request;
      mockTlsConnect.mockReturnValue(mockSocket as any);

      await expect(POST({ request: mockRequest } as any)).rejects.toThrow('500');
    });

    it('handles self-signed certificate scenarios', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'certificate',
          host: 'selfsigned.example.com'
        })
      } as unknown as Request;

      // Mock self-signed certificate
      const mockSocket = {
        destroy: vi.fn(),
        on: vi.fn((event, callback) => {
          if (event === 'secureConnect') {
            setTimeout(() => callback(), 0);
          }
        }),
        getPeerCertificate: vi.fn(() => ({
          subject: { CN: 'selfsigned.example.com' },
          issuer: { CN: 'selfsigned.example.com' },
          valid_from: 'Jan 1 2024',
          valid_to: 'Jan 1 2025',
          fingerprint: 'AA:BB:CC',
          serialNumber: '12345'
        })),
        authorized: false
      };
      mockTlsConnect.mockReturnValue(mockSocket as any);

      await POST({ request: mockRequest } as any);
      expect(mockJson).toHaveBeenCalled();
    });

    it('handles expired certificate scenarios', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          action: 'certificate',
          host: 'expired.example.com'
        })
      } as unknown as Request;

      // Mock expired certificate
      const mockSocket = {
        destroy: vi.fn(),
        on: vi.fn((event, callback) => {
          if (event === 'secureConnect') {
            setTimeout(() => callback(), 0);
          }
        }),
        getPeerCertificate: vi.fn(() => ({
          subject: { CN: 'expired.example.com' },
          issuer: { CN: 'Test CA' },
          valid_from: 'Jan 1 2020',
          valid_to: 'Jan 1 2021',
          fingerprint: 'AA:BB:CC',
          serialNumber: '12345'
        })),
        authorized: false
      };
      mockTlsConnect.mockReturnValue(mockSocket as any);

      await POST({ request: mockRequest } as any);
      expect(mockJson).toHaveBeenCalled();
    });
  });
});