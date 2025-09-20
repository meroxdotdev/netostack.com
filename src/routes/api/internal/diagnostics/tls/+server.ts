import { json, error } from '@sveltejs/kit';
import * as tls from 'node:tls';
import * as net from 'node:net';
import type { RequestHandler } from './$types';

type Action = 'certificate' | 'versions' | 'alpn';

interface BaseReq {
  action: Action;
}

interface CertificateReq extends BaseReq {
  action: 'certificate';
  host: string;
  port?: number;
  servername?: string;
}

interface VersionsReq extends BaseReq {
  action: 'versions';
  host: string;
  port?: number;
  servername?: string;
}

interface ALPNReq extends BaseReq {
  action: 'alpn';
  host: string;
  port?: number;
  servername?: string;
  protocols?: string[];
}

type RequestBody = CertificateReq | VersionsReq | ALPNReq;

const TLS_VERSIONS = ['TLSv1', 'TLSv1.1', 'TLSv1.2', 'TLSv1.3'] as const;

function parseHost(hostPort: string): { host: string; port: number } {
  const match = hostPort.match(/^(.+?):(\d+)$/);
  if (match) {
    return { host: match[1], port: parseInt(match[2], 10) };
  }
  return { host: hostPort, port: 443 };
}

function formatCertificate(cert: any): any {
  const now = Date.now();
  const validFrom = new Date(cert.valid_from).getTime();
  const validTo = new Date(cert.valid_to).getTime();

  return {
    subject: {
      CN: cert.subject?.CN || '',
      O: cert.subject?.O || '',
      OU: cert.subject?.OU || '',
      C: cert.subject?.C || '',
    },
    issuer: {
      CN: cert.issuer?.CN || '',
      O: cert.issuer?.O || '',
      C: cert.issuer?.C || '',
    },
    validFrom: cert.valid_from,
    validTo: cert.valid_to,
    daysUntilExpiry: Math.ceil((validTo - now) / (1000 * 60 * 60 * 24)),
    isExpired: now > validTo,
    isNotYetValid: now < validFrom,
    serialNumber: cert.serialNumber,
    fingerprint: cert.fingerprint,
    fingerprint256: cert.fingerprint256,
    subjectAltNames:
      cert.subjectaltname && typeof cert.subjectaltname === 'string'
        ? cert.subjectaltname.split(', ').map((san: string) => san.replace(/^DNS:/, ''))
        : [],
    keyUsage: cert.ext_key_usage && typeof cert.ext_key_usage === 'string' ? cert.ext_key_usage.split(', ') : [],
    version: cert.version,
  };
}

async function getCertificateInfo(host: string, port: number, servername?: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Connection timeout'));
    }, 10000);

    const options: any = {
      host,
      port,
      servername: servername || host,
      rejectUnauthorized: false,
      timeout: 10000,
    };

    const socket = (tls as any).connect(options, () => {
      clearTimeout(timeout);

      const cert = socket.getPeerCertificate(true);
      const protocol = socket.getProtocol();
      const cipher = socket.getCipher();
      let alpnProtocol = null;

      // Try the new method first (Node.js 22.12+)
      if (typeof socket.getALPNProtocol === 'function') {
        alpnProtocol = socket.getALPNProtocol();
      } else {
        // Fallback: Check if ALPN was negotiated by accessing internal properties
        try {
          const tlsSocket = socket as any;
          if (tlsSocket.alpnProtocol) {
            alpnProtocol = tlsSocket.alpnProtocol;
          } else if (tlsSocket._handle && tlsSocket._handle.getALPNProtocol) {
            alpnProtocol = tlsSocket._handle.getALPNProtocol();
          }
        } catch (e) {
          // Ignore errors from accessing internal properties
        }
      }

      const chain: any[] = [];
      let currentCert = cert;

      while (currentCert && Object.keys(currentCert).length > 0) {
        chain.push(formatCertificate(currentCert));
        currentCert = currentCert.issuerCertificate;
        // Prevent infinite loops
        if (currentCert === cert || chain.length > 10) break;
      }

      const result = {
        chain,
        protocol,
        cipher: cipher
          ? {
              name: cipher.name,
              version: cipher.version,
              bits: cipher.bits,
            }
          : null,
        alpnProtocol,
        servername: servername || host,
        peerCertificate: formatCertificate(cert),
      };

      socket.end();
      resolve(result);
    });

    socket.on('error', (err: any) => {
      clearTimeout(timeout);
      reject(err);
    });

    socket.on('timeout', () => {
      clearTimeout(timeout);
      socket.destroy();
      reject(new Error('Connection timeout'));
    });
  });
}

async function probeTLSVersions(host: string, port: number, servername?: string): Promise<any> {
  const results: { [key: string]: boolean } = {};
  const errors: { [key: string]: string } = {};

  for (const version of TLS_VERSIONS) {
    try {
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout'));
        }, 5000);

        const options: any = {
          host,
          port,
          servername: servername || host,
          minVersion: version,
          maxVersion: version,
          rejectUnauthorized: false,
          timeout: 5000,
        };

        const socket = (tls as any).connect(options, () => {
          clearTimeout(timeout);
          results[version] = true;
          socket.end();
          resolve();
        });

        socket.on('error', (err: any) => {
          clearTimeout(timeout);
          results[version] = false;
          errors[version] = err.message;
          resolve();
        });

        socket.on('timeout', () => {
          clearTimeout(timeout);
          socket.destroy();
          results[version] = false;
          errors[version] = 'Timeout';
          resolve();
        });
      });
    } catch (err: any) {
      results[version] = false;
      errors[version] = err.message;
    }
  }

  const supportedVersions = Object.entries(results)
    .filter(([_, supported]) => supported)
    .map(([version]) => version);

  return {
    supported: results,
    errors,
    supportedVersions,
    minVersion: supportedVersions[0] || null,
    maxVersion: supportedVersions[supportedVersions.length - 1] || null,
    totalSupported: supportedVersions.length,
  };
}

async function probeALPN(host: string, port: number, protocols: string[], servername?: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Connection timeout'));
    }, 10000);

    const options: any = {
      host,
      port,
      servername: servername || host,
      ALPNProtocols: protocols,
      rejectUnauthorized: false,
      timeout: 10000,
    };

    const socket = (tls as any).connect(options, () => {
      clearTimeout(timeout);

      let negotiatedProtocol = null;

      // Try the new method first (Node.js 22.12+)
      if (typeof socket.getALPNProtocol === 'function') {
        negotiatedProtocol = socket.getALPNProtocol();
      } else {
        // Fallback: Check if ALPN was negotiated by accessing internal properties
        // This is a workaround for older Node.js versions
        try {
          const tlsSocket = socket as any;
          if (tlsSocket.alpnProtocol) {
            negotiatedProtocol = tlsSocket.alpnProtocol;
          } else if (tlsSocket._handle && tlsSocket._handle.getALPNProtocol) {
            negotiatedProtocol = tlsSocket._handle.getALPNProtocol();
          }
        } catch (e) {
          // Ignore errors from accessing internal properties
        }
      }

      const tlsVersion = socket.getProtocol();

      const result = {
        requestedProtocols: protocols,
        negotiatedProtocol: negotiatedProtocol || null,
        tlsVersion,
        success: !!negotiatedProtocol,
        servername: servername || host,
      };

      socket.end();
      resolve(result);
    });

    socket.on('error', (err: any) => {
      clearTimeout(timeout);
      reject(err);
    });

    socket.on('timeout', () => {
      clearTimeout(timeout);
      socket.destroy();
      reject(new Error('Connection timeout'));
    });
  });
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body: RequestBody = await request.json();

    switch (body.action) {
      case 'certificate': {
        const { host: hostInput, port = 443, servername } = body as CertificateReq;
        const { host } = parseHost(hostInput);
        const result = await getCertificateInfo(host, port, servername);
        return json(result);
      }

      case 'versions': {
        const { host: hostInput, port = 443, servername } = body as VersionsReq;
        const { host } = parseHost(hostInput);
        const result = await probeTLSVersions(host, port, servername);
        return json(result);
      }

      case 'alpn': {
        const { host: hostInput, port = 443, servername, protocols = ['h2', 'http/1.1'] } = body as ALPNReq;
        const { host } = parseHost(hostInput);
        const result = await probeALPN(host, port, protocols, servername);
        return json(result);
      }

      default:
        throw error(400, `Unknown action: ${(body as any).action}`);
    }
  } catch (err: any) {
    console.error('TLS API error:', err);
    throw error(500, `TLS operation failed: ${err.message}`);
  }
};
