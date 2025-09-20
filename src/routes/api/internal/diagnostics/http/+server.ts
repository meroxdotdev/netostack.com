import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { performance } from 'perf_hooks';

interface HTTPTimings {
  dns: number;
  tcp: number;
  tls: number;
  ttfb: number;
  total: number;
}

interface SecurityHeaders {
  'strict-transport-security'?: string;
  'content-security-policy'?: string;
  'x-frame-options'?: string;
  'x-content-type-options'?: string;
  'referrer-policy'?: string;
  'x-xss-protection'?: string;
  'permissions-policy'?: string;
  'cross-origin-embedder-policy'?: string;
  'cross-origin-opener-policy'?: string;
  'cross-origin-resource-policy'?: string;
}

function validateURL(url: string): { isValid: boolean; error?: string; parsed?: URL } {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { isValid: false, error: 'URL must use HTTP or HTTPS protocol' };
    }
    return { isValid: true, parsed };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
}

async function performHTTPRequest(
  url: string,
  method: string = 'GET',
  customHeaders: Record<string, string> = {},
  followRedirects: boolean = true,
  maxRedirects: number = 10,
  timeout: number = 10000,
): Promise<{
  response: Response;
  timings: HTTPTimings;
  redirectChain?: Array<{ url: string; status: number; location?: string; headers: Record<string, string> }>;
}> {
  const startTime = performance.now();
  let dns = 0,
    tcp = 0,
    tls = 0,
    ttfb = 0;

  const redirectChain: Array<{ url: string; status: number; location?: string; headers: Record<string, string> }> = [];
  let currentUrl = url;
  let redirectCount = 0;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    while (redirectCount <= maxRedirects) {
      const requestStart = performance.now();

      const response = await fetch(currentUrl, {
        method,
        headers: customHeaders,
        redirect: 'manual',
        signal: controller.signal,
      });

      const requestEnd = performance.now();
      if (redirectCount === 0) {
        // Approximate timings for first request
        const totalTime = requestEnd - requestStart;
        dns = totalTime * 0.1; // ~10% DNS (approximation)
        tcp = totalTime * 0.2; // ~20% TCP connect
        tls = currentUrl.startsWith('https:') ? totalTime * 0.3 : 0; // ~30% TLS if HTTPS
        ttfb = totalTime * 0.4; // ~40% TTFB
      }

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key.toLowerCase()] = value;
      });

      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        redirectChain.push({
          url: currentUrl,
          status: response.status,
          location: location || undefined,
          headers: responseHeaders,
        });

        if (!location) {
          throw new Error(`Redirect response (${response.status}) missing Location header`);
        }

        if (!followRedirects) {
          const total = performance.now() - startTime;
          return {
            response,
            timings: { dns, tcp, tls, ttfb, total },
            redirectChain,
          };
        }

        currentUrl = new URL(location, currentUrl).href;
        redirectCount++;

        if (redirectCount > maxRedirects) {
          throw new Error(`Too many redirects (>${maxRedirects})`);
        }
      } else {
        // Final response
        const total = performance.now() - startTime;
        if (redirectChain.length > 0) {
          redirectChain.push({
            url: currentUrl,
            status: response.status,
            headers: responseHeaders,
          });
        }

        return {
          response,
          timings: { dns, tcp, tls, ttfb, total },
          redirectChain: redirectChain.length > 0 ? redirectChain : undefined,
        };
      }
    }

    throw new Error(`Maximum redirects (${maxRedirects}) exceeded`);
  } finally {
    clearTimeout(timeoutId);
  }
}

function analyzeSecurityHeaders(headers: Headers): {
  headers: SecurityHeaders;
  analysis: Array<{ header: string; status: 'present' | 'missing' | 'weak'; message: string; recommendation?: string }>;
} {
  const securityHeaders: SecurityHeaders = {};
  const analysis: Array<{
    header: string;
    status: 'present' | 'missing' | 'weak';
    message: string;
    recommendation?: string;
  }> = [];

  // Check HSTS
  const hsts = headers.get('strict-transport-security');
  if (hsts) {
    securityHeaders['strict-transport-security'] = hsts;
    const maxAge = hsts.match(/max-age=(\d+)/)?.[1];
    if (maxAge && parseInt(maxAge) < 31536000) {
      analysis.push({
        header: 'Strict-Transport-Security',
        status: 'weak',
        message: 'HSTS max-age is less than 1 year',
        recommendation: 'Set max-age to at least 31536000 (1 year)',
      });
    } else {
      analysis.push({
        header: 'Strict-Transport-Security',
        status: 'present',
        message: 'HSTS properly configured',
      });
    }
  } else {
    analysis.push({
      header: 'Strict-Transport-Security',
      status: 'missing',
      message: 'HSTS header not present',
      recommendation: 'Add "Strict-Transport-Security: max-age=31536000; includeSubDomains"',
    });
  }

  // Check CSP
  const csp = headers.get('content-security-policy');
  if (csp) {
    securityHeaders['content-security-policy'] = csp;
    if (csp.includes("'unsafe-inline'") || csp.includes("'unsafe-eval'")) {
      analysis.push({
        header: 'Content-Security-Policy',
        status: 'weak',
        message: 'CSP contains unsafe directives',
        recommendation: 'Remove unsafe-inline and unsafe-eval directives',
      });
    } else {
      analysis.push({
        header: 'Content-Security-Policy',
        status: 'present',
        message: 'CSP configured (review directives)',
      });
    }
  } else {
    analysis.push({
      header: 'Content-Security-Policy',
      status: 'missing',
      message: 'CSP header not present',
      recommendation: 'Add a Content-Security-Policy header',
    });
  }

  // Check X-Frame-Options
  const xFrame = headers.get('x-frame-options');
  if (xFrame) {
    securityHeaders['x-frame-options'] = xFrame;
    analysis.push({
      header: 'X-Frame-Options',
      status: 'present',
      message: `Clickjacking protection: ${xFrame}`,
    });
  } else {
    analysis.push({
      header: 'X-Frame-Options',
      status: 'missing',
      message: 'X-Frame-Options header not present',
      recommendation: 'Add "X-Frame-Options: DENY" or use CSP frame-ancestors',
    });
  }

  // Check X-Content-Type-Options
  const xContentType = headers.get('x-content-type-options');
  if (xContentType === 'nosniff') {
    securityHeaders['x-content-type-options'] = xContentType;
    analysis.push({
      header: 'X-Content-Type-Options',
      status: 'present',
      message: 'MIME type sniffing protection enabled',
    });
  } else {
    analysis.push({
      header: 'X-Content-Type-Options',
      status: 'missing',
      message: 'X-Content-Type-Options header not present',
      recommendation: 'Add "X-Content-Type-Options: nosniff"',
    });
  }

  // Check Referrer-Policy
  const referrerPolicy = headers.get('referrer-policy');
  if (referrerPolicy) {
    securityHeaders['referrer-policy'] = referrerPolicy;
    analysis.push({
      header: 'Referrer-Policy',
      status: 'present',
      message: `Referrer policy: ${referrerPolicy}`,
    });
  } else {
    analysis.push({
      header: 'Referrer-Policy',
      status: 'missing',
      message: 'Referrer-Policy header not present',
      recommendation: 'Add "Referrer-Policy: strict-origin-when-cross-origin"',
    });
  }

  return { headers: securityHeaders, analysis };
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const {
      action,
      url,
      method = 'GET',
      headers: customHeaders = {},
      maxRedirects = 10,
      timeout = 10000,
    } = await request.json();

    if (!action || !url) {
      throw error(400, 'Missing required parameters: action and url');
    }

    const urlValidation = validateURL(url);
    if (!urlValidation.isValid) {
      throw error(400, urlValidation.error || 'Invalid URL');
    }

    switch (action) {
      case 'headers': {
        const { response, timings } = await performHTTPRequest(url, method, customHeaders, true, maxRedirects, timeout);

        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key.toLowerCase()] = value;
        });

        const contentLength = response.headers.get('content-length');
        const size = contentLength ? parseInt(contentLength) : null;

        return json({
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
          size,
          timings,
          url: response.url,
        });
      }

      case 'redirect-trace': {
        const { response, timings, redirectChain } = await performHTTPRequest(
          url,
          method,
          customHeaders,
          true,
          maxRedirects,
          timeout,
        );

        return json({
          finalStatus: response.status,
          finalUrl: response.url,
          redirectChain: redirectChain || [],
          totalRedirects: redirectChain ? redirectChain.length - 1 : 0,
          timings,
        });
      }

      case 'security': {
        const { response, timings } = await performHTTPRequest(url, method, customHeaders, true, maxRedirects, timeout);
        const { headers: securityHeaders, analysis } = analyzeSecurityHeaders(response.headers);

        return json({
          url: response.url,
          status: response.status,
          headers: securityHeaders,
          analysis,
          timings,
        });
      }

      case 'cors-check': {
        const origin = customHeaders.origin || 'https://example.com';

        // First try OPTIONS preflight
        const preflightHeaders = {
          Origin: origin,
          'Access-Control-Request-Method': method,
          'Access-Control-Request-Headers': 'content-type,authorization',
        };

        try {
          const preflightResponse = await fetch(url, {
            method: 'OPTIONS',
            headers: preflightHeaders,
            signal: AbortSignal.timeout(timeout),
          });

          const corsHeaders: Record<string, string> = {};
          preflightResponse.headers.forEach((value, key) => {
            if (key.toLowerCase().startsWith('access-control-')) {
              corsHeaders[key.toLowerCase()] = value;
            }
          });

          const allowsOrigin =
            corsHeaders['access-control-allow-origin'] === '*' || corsHeaders['access-control-allow-origin'] === origin;

          return json({
            preflight: {
              status: preflightResponse.status,
              allowed: allowsOrigin,
              headers: corsHeaders,
            },
            origin,
            analysis: {
              corsEnabled: Object.keys(corsHeaders).length > 0,
              allowsOrigin,
              allowsCredentials: corsHeaders['access-control-allow-credentials'] === 'true',
              allowedMethods: corsHeaders['access-control-allow-methods']?.split(',').map((m) => m.trim()) || [],
              allowedHeaders: corsHeaders['access-control-allow-headers']?.split(',').map((h) => h.trim()) || [],
              maxAge: corsHeaders['access-control-max-age'] ? parseInt(corsHeaders['access-control-max-age']) : null,
            },
          });
        } catch (err: unknown) {
          return json({
            preflight: {
              status: 0,
              allowed: false,
              error: err.message,
            },
            origin,
            analysis: {
              corsEnabled: false,
              allowsOrigin: false,
              allowsCredentials: false,
              allowedMethods: [],
              allowedHeaders: [],
              maxAge: null,
            },
          });
        }
      }

      case 'perf': {
        const { response, timings } = await performHTTPRequest(url, method, customHeaders, true, maxRedirects, timeout);

        // Additional performance metrics
        const contentLength = response.headers.get('content-length');
        const size = contentLength ? parseInt(contentLength) : null;
        const isHTTPS = url.startsWith('https:');

        return json({
          url: response.url,
          status: response.status,
          timings: {
            ...timings,
            dns_note: 'approximation',
            tcp_note: 'approximation',
            tls_note: isHTTPS ? 'approximation' : 'not_applicable',
          },
          size,
          performance: {
            isHTTPS,
            hasCompression: !!response.headers.get('content-encoding'),
            httpVersion: 'unknown', // Not easily accessible in Node.js fetch
            connectionReused: 'unknown',
          },
        });
      }

      default:
        throw error(400, `Unknown action: ${action}`);
    }
  } catch (err: unknown) {
    console.error('HTTP API error:', err);

    if (err.status) {
      throw err; // Re-throw SvelteKit errors
    }

    if (err.name === 'AbortError') {
      throw error(408, 'Request timeout');
    }

    if (err.code === 'ENOTFOUND') {
      throw error(400, 'Host not found');
    }

    if (err.code === 'ECONNREFUSED') {
      throw error(400, 'Connection refused');
    }

    throw error(500, err.message || 'HTTP request failed');
  }
};
