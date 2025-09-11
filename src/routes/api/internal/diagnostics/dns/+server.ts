import { json, error } from '@sveltejs/kit';
import { promises as dns } from 'node:dns';
import type { RequestHandler } from './$types';

type Action =
  | "lookup"
  | "reverse-lookup"
  | "propagation"
  | "spf-evaluator"
  | "dmarc-check"
  | "caa-effective"
  | "ns-soa-check"
  | "dnssec-adflag"
  | "soa-serial";

interface BaseReq { action: Action; }

interface ResolverOpts {
  // choose one; default = "cloudflare"
  doh?: "cloudflare" | "google" | "quad9" | "opendns";
  // optional custom DNS server (IPv4/IPv6) for non-DoH path
  server?: string;
  // prefer DoH for TTLs/flags unless you need local resolver behavior
  preferDoH?: boolean;
  timeoutMs?: number; // default ~3500
}

interface IndividualRecord {
  address: string;
  ttl: number;
}

// DNS over HTTPS endpoints
const DOH_ENDPOINTS = {
  cloudflare: 'https://cloudflare-dns.com/dns-query',
  google: 'https://dns.google/dns-query',
  quad9: 'https://dns.quad9.net/dns-query',
  opendns: 'https://doh.opendns.com/dns-query'
};

// DNS record type mapping
const DNS_TYPES = {
  A: 1, AAAA: 28, CNAME: 5, MX: 15, TXT: 16, NS: 2, SOA: 6, CAA: 257, PTR: 12, SRV: 33
};

// DNS server mapping for fallback
const DNS_SERVERS = {
  cloudflare: '1.1.1.1',
  google: '8.8.8.8', 
  quad9: '9.9.9.9',
  opendns: '208.67.222.222'
};

function getDNSServerForResolver(resolver: string): string {
  return DNS_SERVERS[resolver] || DNS_SERVERS.cloudflare;
}

interface LookupReq extends BaseReq {
  action: "lookup";
  name: string;
  type?: keyof typeof DNS_TYPES;
  resolverOpts?: ResolverOpts;
}

interface ReverseLookupReq extends BaseReq {
  action: "reverse-lookup";
  ip: string;
  resolverOpts?: ResolverOpts;
}

interface PropagationReq extends BaseReq {
  action: "propagation";
  name: string;
  type?: keyof typeof DNS_TYPES;
}

interface SPFEvaluatorReq extends BaseReq {
  action: "spf-evaluator";
  domain: string;
}

interface DMARCCheckReq extends BaseReq {
  action: "dmarc-check";
  domain: string;
}

interface CAAEffectiveReq extends BaseReq {
  action: "caa-effective";
  name: string;
}

interface NSSOACheckReq extends BaseReq {
  action: "ns-soa-check";
  domain: string;
}

interface DNSSECADFlagReq extends BaseReq {
  action: "dnssec-adflag";
  name: string;
  type?: keyof typeof DNS_TYPES;
  resolverOpts?: ResolverOpts;
}

interface SOASerialReq extends BaseReq {
  action: "soa-serial";
  domain: string;
  resolverOpts?: ResolverOpts;
}

type RequestBody = LookupReq | ReverseLookupReq | PropagationReq | SPFEvaluatorReq | DMARCCheckReq | CAAEffectiveReq | NSSOACheckReq | DNSSECADFlagReq | SOASerialReq;

async function doHQuery(endpoint: string, name: string, type: number, timeout: number = 3500): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(`${endpoint}?name=${encodeURIComponent(name)}&type=${type}`, {
      headers: { 'Accept': 'application/dns-json' },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`DoH query failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

async function performDNSLookup(name: string, type: keyof typeof DNS_TYPES, opts: ResolverOpts = {}): Promise<any> {
  const { doh = 'cloudflare', preferDoH = true, timeoutMs = 3500 } = opts;
  const warnings: string[] = [];
  const originalResolver = opts.server ? `Custom DNS (${opts.server})` : `${doh.charAt(0).toUpperCase() + doh.slice(1)} DoH`;
  
  // Use DoH by default for better Vercel compatibility
  if (preferDoH || !opts.server) {
    try {
      const endpoint = DOH_ENDPOINTS[doh];
      const result = await doHQuery(endpoint, name, DNS_TYPES[type], timeoutMs);
      return { ...result, warnings };
    } catch (error) {
      console.warn(`DoH query failed for ${doh}, falling back to Cloudflare DoH:`, error.message);
      
      // If the failed resolver wasn't Cloudflare, try Cloudflare DoH as fallback
      if (doh !== 'cloudflare') {
        try {
          const cloudflareEndpoint = DOH_ENDPOINTS['cloudflare'];
          const result = await doHQuery(cloudflareEndpoint, name, DNS_TYPES[type], timeoutMs);
          warnings.push(`${originalResolver} failed, fell back to Cloudflare DoH which succeeded.`);
          return { ...result, warnings };
        } catch (cloudflareError) {
          console.warn('Cloudflare DoH also failed, falling back to native DNS:', cloudflareError.message);
        }
      }
      
      // Final fallback to native DNS with appropriate server
      const fallbackServer = getDNSServerForResolver(doh);
      const fallbackName = `Native DNS (${fallbackServer})`;
      warnings.push(`${originalResolver} failed, fell back to ${fallbackName}.`);
      const result = await performNativeDNSLookup(name, type, fallbackServer, Math.min(timeoutMs, 2000));
      return { ...result, warnings };
    }
  }
  
  // Use native DNS
  const result = await performNativeDNSLookup(name, type, opts.server, timeoutMs);
  return { ...result, warnings };
}

async function performNativeDNSLookup(name: string, type: keyof typeof DNS_TYPES, customServer?: string, timeoutMs: number = 2000): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    if (customServer) {
      dns.setServers([customServer]);
    }
    
    // Set DNS preferences for better performance
    dns.setDefaultResultOrder('ipv4first');
    
    let result: any;
    
    switch (type) {
      case 'A':
        const a4 = await Promise.race([
          dns.resolve4(name, { ttl: true }),
          new Promise((_, reject) => {
            controller.signal.addEventListener('abort', () => reject(new Error('DNS timeout')));
          })
        ]);
        result = { Answer: (a4 as IndividualRecord[]).map(r => ({ data: r.address, TTL: r.ttl })) };
        break;
      case 'AAAA':
        const a6 = await Promise.race([
          dns.resolve6(name, { ttl: true }),
          new Promise((_, reject) => {
            controller.signal.addEventListener('abort', () => reject(new Error('DNS timeout')));
          })
        ]);
        result = { Answer: (a6 as IndividualRecord[]).map(r => ({ data: r.address, TTL: r.ttl })) };
        break;
      case 'CNAME':
        const cname = await Promise.race([
          dns.resolveCname(name),
          new Promise((_, reject) => {
            controller.signal.addEventListener('abort', () => reject(new Error('DNS timeout')));
          })
        ]);
        result = { Answer: (cname as string[]).map(r => ({ data: r })) };
        break;
      case 'MX':
        const mx = await Promise.race([
          dns.resolveMx(name),
          new Promise((_, reject) => {
            controller.signal.addEventListener('abort', () => reject(new Error('DNS timeout')));
          })
        ]);
        result = { Answer: (mx as any[]).map(r => ({ data: `${r.priority} ${r.exchange}` })) };
        break;
      case 'TXT':
        const txt = await Promise.race([
          dns.resolveTxt(name),
          new Promise((_, reject) => {
            controller.signal.addEventListener('abort', () => reject(new Error('DNS timeout')));
          })
        ]);
        result = { Answer: (txt as string[][]).map(r => ({ data: r.join('') })) };
        break;
      case 'NS':
        const ns = await Promise.race([
          dns.resolveNs(name),
          new Promise((_, reject) => {
            controller.signal.addEventListener('abort', () => reject(new Error('DNS timeout')));
          })
        ]);
        result = { Answer: (ns as string[]).map(r => ({ data: r })) };
        break;
      case 'SOA':
        const soa = await Promise.race([
          dns.resolveSoa(name),
          new Promise((_, reject) => {
            controller.signal.addEventListener('abort', () => reject(new Error('DNS timeout')));
          })
        ]);
        result = { Answer: [{ data: `${(soa as any).nsname} ${(soa as any).hostmaster} ${(soa as any).serial} ${(soa as any).refresh} ${(soa as any).retry} ${(soa as any).expire} ${(soa as any).minttl}` }] };
        break;
      case 'CAA':
        const caa = await Promise.race([
          dns.resolveCaa(name),
          new Promise((_, reject) => {
            controller.signal.addEventListener('abort', () => reject(new Error('DNS timeout')));
          })
        ]);
        result = { Answer: (caa as any[]).map(r => ({ data: `${r.critical} ${r.issue || r.issuewild || r.iodef}` })) };
        break;
      case 'PTR':
        const ptr = await Promise.race([
          dns.resolvePtr(name),
          new Promise((_, reject) => {
            controller.signal.addEventListener('abort', () => reject(new Error('DNS timeout')));
          })
        ]);
        result = { Answer: (ptr as string[]).map(r => ({ data: r })) };
        break;
      default:
        throw new Error(`Unsupported record type: ${type}`);
    }
    
    clearTimeout(timeoutId);
    return result;
    
  } catch (err: any) {
    clearTimeout(timeoutId);
    
    // Provide better error messages
    if (err.message === 'DNS timeout') {
      throw new Error(`DNS query timed out after ${timeoutMs}ms`);
    }
    if (err.code === 'ENOTFOUND') {
      throw new Error(`Domain not found: ${name}`);
    }
    if (err.code === 'ENODATA') {
      // Return structured response for no records found (will be handled as 404)
      return { 
        noRecords: true, 
        message: `No ${type} records found for ${name}`,
        name,
        type
      };
    }
    
    throw new Error(`DNS lookup failed: ${err.message}`);
  }
}

function createReverseZone(ip: string): string {
  if (ip.includes(':')) {
    // IPv6
    const expanded = ip.split(':').map(part => part.padStart(4, '0')).join('');
    const reversed = expanded.split('').reverse().join('.');
    return `${reversed}.ip6.arpa`;
  } else {
    // IPv4
    const parts = ip.split('.');
    return `${parts[3]}.${parts[2]}.${parts[1]}.${parts[0]}.in-addr.arpa`;
  }
}

async function parseSPFRecord(domain: string, visited = new Set<string>(), lookupCount = { count: 0 }): Promise<any> {
  if (visited.has(domain) || lookupCount.count > 10) {
    return { error: 'SPF lookup limit exceeded or circular reference' };
  }
  
  visited.add(domain);
  lookupCount.count++;
  
  try {
    const result = await performDNSLookup(domain, 'TXT');
    const spfRecord = result.Answer?.find((record: any) => {
      const cleanData = record.data.replace(/^"(.*)"$/, '$1'); // Remove surrounding quotes
      return cleanData.startsWith('v=spf1');
    });
    
    if (!spfRecord) {
      return { error: 'No SPF record found' };
    }
    
    // Clean the SPF record data by removing quotes
    const cleanSpfData = spfRecord.data.replace(/^"(.*)"$/, '$1');
    const mechanisms = cleanSpfData.split(' ');
    const expanded = { mechanisms: [], includes: [], redirects: [] };
    
    for (const mechanism of mechanisms) {
      if (mechanism.startsWith('include:')) {
        const includeDomain = mechanism.substring(8);
        const includeResult = await parseSPFRecord(includeDomain, visited, lookupCount);
        expanded.includes.push({ domain: includeDomain, result: includeResult });
      } else if (mechanism.startsWith('redirect=')) {
        const redirectDomain = mechanism.substring(9);
        const redirectResult = await parseSPFRecord(redirectDomain, visited, lookupCount);
        expanded.redirects.push({ domain: redirectDomain, result: redirectResult });
      } else {
        expanded.mechanisms.push(mechanism);
      }
    }
    
    return { record: cleanSpfData, expanded, lookupCount: lookupCount.count };
  } catch (err: any) {
    return { error: err.message };
  }
}

async function checkDMARC(domain: string): Promise<any> {
  try {
    const dmarcDomain = `_dmarc.${domain}`;
    const result = await performDNSLookup(dmarcDomain, 'TXT');
    const dmarcRecord = result.Answer?.find((record: any) => {
      const cleanData = record.data.replace(/^"(.*)"$/, '$1'); // Remove surrounding quotes
      return cleanData.startsWith('v=DMARC1');
    });
    
    if (!dmarcRecord) {
      return { 
        hasRecord: false,
        message: 'No DMARC record found',
        domain: dmarcDomain
      };
    }
    
    const policy = dmarcRecord.data.replace(/^"(.*)"$/, '$1'); // Clean the policy data
    const parsed = {
      policy: policy.match(/p=([^;]+)/)?.[1],
      subdomainPolicy: policy.match(/sp=([^;]+)/)?.[1],
      alignment: {
        dkim: policy.match(/adkim=([^;]+)/)?.[1] || 'r',
        spf: policy.match(/aspf=([^;]+)/)?.[1] || 'r'
      },
      reporting: {
        aggregate: policy.match(/rua=([^;]+)/)?.[1],
        forensic: policy.match(/ruf=([^;]+)/)?.[1],
        failureOptions: policy.match(/fo=([^;]+)/)?.[1] || '0'
      },
      percentage: policy.match(/pct=([^;]+)/)?.[1] || '100'
    };
    
    const issues = [];
    if (parsed.policy === 'none') issues.push('Policy is set to none - no action taken on failures');
    if (!parsed.reporting.aggregate) issues.push('No aggregate reporting address specified');
    if (parsed.percentage !== '100') issues.push(`Only ${parsed.percentage}% of messages are subject to DMARC policy`);
    
    return { 
      hasRecord: true,
      record: policy, 
      parsed, 
      issues 
    };
  } catch (err: any) {
    return { 
      error: `Error determining DMARC records: ${err.message}`,
      domain: `_dmarc.${domain}`
    };
  }
}

async function findEffectiveCAA(name: string): Promise<any> {
  const labels = name.split('.');
  const results = [];
  
  for (let i = 0; i < labels.length; i++) {
    const testName = labels.slice(i).join('.');
    try {
      const result = await performDNSLookup(testName, 'CAA');
      if (result.Answer?.length > 0) {
        results.push({
          domain: testName,
          records: result.Answer.map((r: any) => r.data)
        });
      }
    } catch {
      // Continue to parent domain
    }
  }
  
  return { chain: results, effective: results[0] || null };
}

async function checkNSandSOA(domain: string): Promise<any> {
  try {
    const [nsResult, soaResult] = await Promise.all([
      performDNSLookup(domain, 'NS'),
      performDNSLookup(domain, 'SOA')
    ]);
    
    const nameservers = nsResult.Answer?.map((r: any) => r.data) || [];
    const soa = soaResult.Answer?.[0]?.data;
    
    const nsChecks = [];
    for (const ns of nameservers) {
      try {
        const aResult = await performDNSLookup(ns, 'A');
        nsChecks.push({ 
          nameserver: ns, 
          resolved: true, 
          addresses: aResult.Answer?.map((r: any) => r.data) || [] 
        });
      } catch {
        nsChecks.push({ nameserver: ns, resolved: false });
      }
    }
    
    return {
      nameservers,
      soa,
      nameserverChecks: nsChecks,
      consistency: nsChecks.every(check => check.resolved)
    };
  } catch (err: any) {
    return { error: err.message };
  }
}

async function checkDNSSECADFlag(name: string, type: keyof typeof DNS_TYPES, opts: ResolverOpts = {}): Promise<any> {
  const { doh = 'cloudflare', timeoutMs = 3500 } = opts;
  
  try {
    // Use DoH to get DNSSEC information - we need DoH for AD flag access
    const endpoint = DOH_ENDPOINTS[doh];
    const result = await doHQuery(endpoint, name, DNS_TYPES[type], timeoutMs);
    
    const adFlag = result.AD || false;
    const cdFlag = result.CD || false;
    const statusFlags = result.Status || 0; // RCODE
    
    return {
      name,
      type,
      resolver: doh,
      authenticated: adFlag,
      checkingDisabled: cdFlag,
      rcode: statusFlags,
      rcodeText: getRCodeText(statusFlags),
      explanation: getDNSSECExplanation(adFlag, statusFlags),
      records: result.Answer || [],
      authority: result.Authority || [],
      additional: result.Additional || [],
      raw: result
    };
  } catch (err: any) {
    return { 
      error: err.message,
      name,
      type,
      resolver: doh
    };
  }
}

async function analyzeSOASerial(domain: string, opts: ResolverOpts = {}): Promise<any> {
  try {
    const result = await performDNSLookup(domain, 'SOA', opts);
    
    if (result.noRecords || !result.Answer?.[0]) {
      return { 
        error: 'No SOA record found',
        domain
      };
    }
    
    const soaData = result.Answer[0].data;
    const ttl = result.Answer[0].TTL;
    
    // Parse SOA record: mname rname serial refresh retry expire minimum
    const parts = soaData.split(' ');
    if (parts.length < 7) {
      return { error: 'Invalid SOA record format', raw: soaData };
    }
    
    const [mname, rname, serialStr, refreshStr, retryStr, expireStr, minimumStr] = parts;
    const serial = parseInt(serialStr);
    const refresh = parseInt(refreshStr);
    const retry = parseInt(retryStr);
    const expire = parseInt(expireStr);
    const minimum = parseInt(minimumStr);
    
    // Analyze serial format
    const serialAnalysis = analyzeSerialNumber(serial);
    
    return {
      domain,
      soa: {
        primaryNameserver: mname,
        responsibleEmail: rname.replace('.', '@', 1),
        serial,
        refresh,
        retry,
        expire,
        minimum,
        ttl
      },
      serialAnalysis,
      timings: {
        refresh: formatDuration(refresh),
        retry: formatDuration(retry),
        expire: formatDuration(expire),
        minimum: formatDuration(minimum),
        ttl: formatDuration(ttl)
      },
      recommendations: getSOARecommendations(refresh, retry, expire, minimum, ttl),
      raw: result
    };
  } catch (err: any) {
    return { 
      error: err.message,
      domain
    };
  }
}

function getRCodeText(rcode: number): string {
  const codes: Record<number, string> = {
    0: 'NOERROR - No error',
    1: 'FORMERR - Format error',
    2: 'SERVFAIL - Server failure', 
    3: 'NXDOMAIN - Non-existent domain',
    4: 'NOTIMP - Not implemented',
    5: 'REFUSED - Query refused',
    6: 'YXDOMAIN - Name exists when it should not',
    7: 'YXRRSET - RR set exists when it should not',
    8: 'NXRRSET - RR set that should exist does not',
    9: 'NOTAUTH - Server not authoritative'
  };
  return codes[rcode] || `Unknown RCODE: ${rcode}`;
}

function getDNSSECExplanation(adFlag: boolean, rcode: number): string {
  if (rcode !== 0) {
    return 'Query failed - DNSSEC status cannot be determined';
  }
  
  if (adFlag) {
    return 'Authenticated Data (AD) bit is SET - Response is cryptographically verified by DNSSEC';
  } else {
    return 'Authenticated Data (AD) bit is NOT SET - Response is not DNSSEC validated (unsigned, validation failed, or resolver does not validate)';
  }
}

function analyzeSerialNumber(serial: number): any {
  const serialStr = serial.toString();
  
  // Check if it looks like YYYYMMDDNN format
  if (serialStr.length === 10) {
    const year = parseInt(serialStr.substring(0, 4));
    const month = parseInt(serialStr.substring(4, 6));
    const day = parseInt(serialStr.substring(6, 8));
    const sequence = parseInt(serialStr.substring(8, 10));
    
    // Validate date components
    const currentYear = new Date().getFullYear();
    if (year >= 1990 && year <= currentYear + 5 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const date = new Date(year, month - 1, day);
      return {
        format: 'YYYYMMDDNN',
        likely: true,
        date: date.toISOString().split('T')[0],
        sequence,
        interpretation: `Date-based serial: ${date.toDateString()}, sequence ${sequence.toString().padStart(2, '0')}`
      };
    }
  }
  
  // Check if it looks like Unix timestamp
  if (serial >= 315532800 && serial <= Date.now() / 1000 + 86400 * 365) { // 1980 to next year
    const date = new Date(serial * 1000);
    return {
      format: 'Unix timestamp',
      likely: true,
      date: date.toISOString().split('T')[0],
      interpretation: `Unix timestamp: ${date.toISOString()}`
    };
  }
  
  return {
    format: 'Sequential/other',
    likely: false,
    interpretation: `Sequential or custom format: ${serial}`
  };
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
}

function getSOARecommendations(refresh: number, retry: number, expire: number, minimum: number, ttl: number): any[] {
  const recommendations = [];
  
  if (refresh < 3600) {
    recommendations.push({ type: 'warning', field: 'refresh', message: 'Refresh interval is very low (< 1 hour), may cause excessive load on primary' });
  }
  if (refresh > 86400) {
    recommendations.push({ type: 'info', field: 'refresh', message: 'Refresh interval is high (> 24 hours), slaves may be slow to detect changes' });
  }
  
  if (retry >= refresh) {
    recommendations.push({ type: 'error', field: 'retry', message: 'Retry interval should be less than refresh interval' });
  }
  
  if (expire < refresh * 2) {
    recommendations.push({ type: 'warning', field: 'expire', message: 'Expire time should be at least 2x the refresh interval' });
  }
  
  if (minimum > 86400) {
    recommendations.push({ type: 'warning', field: 'minimum', message: 'Minimum TTL is high (> 24 hours), may slow error recovery' });
  }
  
  if (ttl < 300) {
    recommendations.push({ type: 'info', field: 'ttl', message: 'SOA TTL is low (< 5 minutes), good for rapid DNS changes' });
  }
  
  return recommendations;
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body: RequestBody = await request.json();
    
    switch (body.action) {
      case 'lookup': {
        const { name, type = 'A', resolverOpts } = body as LookupReq;
        const result = await performDNSLookup(name, type, resolverOpts);
        
        // Handle "no records found" as 404
        if (result.noRecords) {
          return json(result, { status: 404 });
        }
        
        return json(result);
      }
      
      case 'reverse-lookup': {
        const { ip, resolverOpts } = body as ReverseLookupReq;
        const reverseName = createReverseZone(ip);
        const result = await performDNSLookup(reverseName, 'PTR', resolverOpts);
        
        // Handle "no records found" as 404
        if (result.noRecords) {
          return json({ ...result, reverseName }, { status: 404 });
        }
        
        return json({ ...result, reverseName });
      }
      
      case 'propagation': {
        const { name, type = 'A' } = body as PropagationReq;
        const resolvers = ['cloudflare', 'google', 'quad9', 'opendns'] as const;
        const results = await Promise.allSettled(
          resolvers.map(async resolver => ({
            resolver,
            result: await performDNSLookup(name, type, { doh: resolver })
          }))
        );
        
        return json({
          results: results.map(r => 
            r.status === 'fulfilled' ? r.value : { resolver: 'unknown', error: r.reason?.message }
          )
        });
      }
      
      case 'spf-evaluator': {
        const { domain } = body as SPFEvaluatorReq;
        const result = await parseSPFRecord(domain);
        return json(result);
      }
      
      case 'dmarc-check': {
        const { domain } = body as DMARCCheckReq;
        const result = await checkDMARC(domain);
        return json(result);
      }
      
      case 'caa-effective': {
        const { name } = body as CAAEffectiveReq;
        const result = await findEffectiveCAA(name);
        return json(result);
      }
      
      case 'ns-soa-check': {
        const { domain } = body as NSSOACheckReq;
        const result = await checkNSandSOA(domain);
        return json(result);
      }
      
      case 'dnssec-adflag': {
        const { name, type = 'A', resolverOpts } = body as DNSSECADFlagReq;
        const result = await checkDNSSECADFlag(name, type, resolverOpts);
        return json(result);
      }
      
      case 'soa-serial': {
        const { domain, resolverOpts } = body as SOASerialReq;
        const result = await analyzeSOASerial(domain, resolverOpts);
        return json(result);
      }
      
      default:
        throw error(400, `Unknown action: ${(body as any).action}`);
    }
  } catch (err: any) {
    console.error('DNS API error:', err);
    throw error(500, `DNS operation failed: ${err.message}`);
  }
};
