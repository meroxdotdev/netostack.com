// DNS validation and utility functions

export interface SimpleValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  normalized?: string;
}

export interface DNSRecord {
  name: string;
  type: string;
  value: string;
  ttl?: number;
  priority?: number;
  weight?: number;
  port?: number;
}

export interface TTLInfo {
  seconds: number;
  human: string;
  expiresAt: Date;
  category: 'very-short' | 'short' | 'medium' | 'long' | 'very-long';
  recommendations: string[];
}

export interface EDNSEstimate {
  baseSize: number;
  recordsSize: number;
  totalSize: number;
  udpSafe: boolean;
  fragmentationRisk: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export interface LabelAnalysis {
  original: string;
  normalized: string;
  warnings: string[];
  errors: string[];
  scripts: string[];
  hasHomoglyphs: boolean;
  isIDN: boolean;
}

// DNS Record Type Validators
export function validateARecord(value: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  if (!ipv4Regex.test(value.trim())) {
    errors.push('Invalid IPv4 address format');
  }
  
  const octets = value.split('.');
  octets.forEach((octet, index) => {
    const num = parseInt(octet);
    if (num < 0 || num > 255) {
      errors.push(`Octet ${index + 1} (${octet}) is out of range (0-255)`);
    }
  });
  
  if (value.startsWith('0.') || value.startsWith('255.')) {
    warnings.push('Address in reserved range');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    normalized: value.trim()
  };
}

export function validateAAAARecord(value: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    const normalized = normalizeIPv6(value);
    
    if (normalized.startsWith('::1')) {
      warnings.push('Loopback address');
    } else if (normalized.startsWith('fe80:')) {
      warnings.push('Link-local address');
    } else if (normalized.startsWith('ff')) {
      warnings.push('Multicast address');
    }
    
    return {
      valid: true,
      errors,
      warnings,
      normalized
    };
  } catch (error) {
    errors.push('Invalid IPv6 address format');
    return {
      valid: false,
      errors,
      warnings
    };
  }
}

export function validateCNAMERecord(value: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const normalized = normalizeDomainName(value);
  
  if (normalized === '.') {
    errors.push('CNAME cannot point to root');
  }
  
  if (!normalized.endsWith('.')) {
    warnings.push('Domain should end with dot (.) to be fully qualified');
  }
  
  if (normalized.length > 255) {
    errors.push('Domain name too long (max 255 characters)');
  }
  
  const labels = normalized.split('.');
  labels.forEach(label => {
    if (label.length > 63) {
      errors.push(`Label "${label}" too long (max 63 characters)`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    normalized
  };
}

export function validateMXRecord(value: string, priority?: number): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (priority !== undefined) {
    if (priority < 0 || priority > 65535) {
      errors.push('MX priority must be between 0 and 65535');
    }
  }
  
  const domainResult = validateCNAMERecord(value);
  errors.push(...domainResult.errors);
  warnings.push(...domainResult.warnings);
  
  if (value === '.') {
    warnings.push('Null MX record (mail disabled for domain)');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    normalized: domainResult.normalized
  };
}

export function validateTXTRecord(value: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (value.length > 65535) {
    errors.push('TXT record too long (max 65535 characters)');
  }
  
  // Check for proper chunking (255 character chunks)
  const chunks = splitTXTRecord(value);
  if (chunks.some(chunk => chunk.length > 255)) {
    warnings.push('Long strings should be split into 255-character chunks');
  }
  
  // Check for common record types
  if (value.startsWith('v=spf1')) {
    warnings.push('SPF record detected - validate policy carefully');
  } else if (value.startsWith('v=DMARC1')) {
    warnings.push('DMARC record detected - validate policy syntax');
  } else if (value.includes('._domainkey')) {
    warnings.push('DKIM record detected - validate key format');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    normalized: value
  };
}

export function validateSRVRecord(service: string, protocol: string, priority: number, weight: number, port: number, target: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!service.startsWith('_')) {
    errors.push('Service must start with underscore (_)');
  }
  
  if (!['_tcp', '_udp'].includes(protocol)) {
    errors.push('Protocol must be _tcp or _udp');
  }
  
  if (priority < 0 || priority > 65535) {
    errors.push('Priority must be between 0 and 65535');
  }
  
  if (weight < 0 || weight > 65535) {
    errors.push('Weight must be between 0 and 65535');
  }
  
  if (port < 0 || port > 65535) {
    errors.push('Port must be between 0 and 65535');
  }
  
  const targetResult = validateCNAMERecord(target);
  errors.push(...targetResult.errors);
  warnings.push(...targetResult.warnings);
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    normalized: `${service}.${protocol}`
  };
}

export function validateCAARecord(flags: number, tag: string, value: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (flags < 0 || flags > 255) {
    errors.push('Flags must be between 0 and 255');
  }
  
  if (flags > 128) {
    warnings.push('Critical flag set - validators must understand this record');
  }
  
  const validTags = ['issue', 'issuewild', 'iodef'];
  if (!validTags.includes(tag)) {
    warnings.push(`Unknown tag "${tag}" - may not be processed by CAs`);
  }
  
  if (tag === 'issue' || tag === 'issuewild') {
    if (!value && value !== ';') {
      warnings.push('Empty issue tag disallows certificate issuance');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    normalized: `${flags} ${tag} "${value}"`
  };
}

// TTL Functions
export function humanizeTTL(seconds: number): TTLInfo {
  const recommendations: string[] = [];
  let category: TTLInfo['category'];
  let human: string;
  
  if (seconds < 300) {
    category = 'very-short';
    human = `${seconds} seconds`;
    recommendations.push('Very short TTL - high DNS load, fast updates');
  } else if (seconds < 3600) {
    category = 'short';
    const minutes = Math.floor(seconds / 60);
    human = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    recommendations.push('Short TTL - good for services that change frequently');
  } else if (seconds < 86400) {
    category = 'medium';
    const hours = Math.floor(seconds / 3600);
    human = `${hours} hour${hours !== 1 ? 's' : ''}`;
    recommendations.push('Medium TTL - balanced between performance and flexibility');
  } else if (seconds < 604800) {
    category = 'long';
    const days = Math.floor(seconds / 86400);
    human = `${days} day${days !== 1 ? 's' : ''}`;
    recommendations.push('Long TTL - good for stable records, reduces DNS queries');
  } else {
    category = 'very-long';
    const weeks = Math.floor(seconds / 604800);
    human = `${weeks} week${weeks !== 1 ? 's' : ''}`;
    recommendations.push('Very long TTL - use only for extremely stable records');
  }
  
  return {
    seconds,
    human,
    expiresAt: new Date(Date.now() + seconds * 1000),
    category,
    recommendations
  };
}

export function calculateCacheExpiry(ttlSeconds: number, recordCreated?: Date): Date {
  const created = recordCreated || new Date();
  return new Date(created.getTime() + ttlSeconds * 1000);
}

// EDNS Size Estimation
export function estimateEDNSSize(records: DNSRecord[]): EDNSEstimate {
  const baseSize = 12; // DNS header
  let recordsSize = 0;
  
  records.forEach(record => {
    // Question section (if query)
    recordsSize += record.name.length + 1 + 4; // name + type + class
    
    // Answer section
    recordsSize += record.name.length + 1; // name
    recordsSize += 10; // type + class + ttl + rdlength
    recordsSize += estimateRecordDataSize(record);
  });
  
  const totalSize = baseSize + recordsSize;
  
  let udpSafe = true;
  let fragmentationRisk: EDNSEstimate['fragmentationRisk'] = 'low';
  const recommendations: string[] = [];
  
  if (totalSize > 512) {
    udpSafe = false;
    recommendations.push('Response exceeds 512 bytes - EDNS0 required');
  }
  
  if (totalSize > 1232) {
    fragmentationRisk = 'medium';
    recommendations.push('Response may be fragmented on some networks');
  }
  
  if (totalSize > 4096) {
    fragmentationRisk = 'high';
    recommendations.push('High fragmentation risk - consider reducing record count');
  }
  
  return {
    baseSize,
    recordsSize,
    totalSize,
    udpSafe,
    fragmentationRisk,
    recommendations
  };
}

// Label Normalization
export function normalizeLabel(label: string): LabelAnalysis {
  const errors: string[] = [];
  const warnings: string[] = [];
  const scripts: string[] = [];
  let hasHomoglyphs = false;
  let isIDN = false;
  
  let normalized = label.toLowerCase().trim();
  
  // Remove trailing dots
  if (normalized.endsWith('.')) {
    normalized = normalized.slice(0, -1);
  }
  
  // Check for IDN
  if (normalized.includes('xn--') || /[^\x00-\x7F]/.test(normalized)) {
    isIDN = true;
    try {
      // Basic IDN normalization would go here
      // For now, just detect it
    } catch (error) {
      errors.push('Invalid IDN encoding');
    }
  }
  
  // Check for mixed scripts
  const scriptRanges = [
    { name: 'Latin', regex: /[\u0000-\u007F\u0080-\u00FF\u0100-\u017F\u0180-\u024F]/ },
    { name: 'Cyrillic', regex: /[\u0400-\u04FF\u0500-\u052F]/ },
    { name: 'Arabic', regex: /[\u0600-\u06FF\u0750-\u077F]/ },
    { name: 'Chinese', regex: /[\u4E00-\u9FFF]/ },
  ];
  
  scriptRanges.forEach(script => {
    if (script.regex.test(normalized)) {
      scripts.push(script.name);
    }
  });
  
  if (scripts.length > 1) {
    warnings.push('Mixed scripts detected - potential homograph attack risk');
    hasHomoglyphs = true;
  }
  
  // Check common homoglyphs
  const homoglyphs = [
    { char: 'а', lookalike: 'a', script: 'Cyrillic' },
    { char: 'о', lookalike: 'o', script: 'Cyrillic' },
    { char: 'р', lookalike: 'p', script: 'Cyrillic' },
  ];
  
  homoglyphs.forEach(h => {
    if (normalized.includes(h.char)) {
      warnings.push(`Contains ${h.script} "${h.char}" that looks like Latin "${h.lookalike}"`);
      hasHomoglyphs = true;
    }
  });
  
  return {
    original: label,
    normalized,
    warnings,
    errors,
    scripts,
    hasHomoglyphs,
    isIDN
  };
}

// Helper Functions
function normalizeIPv6(ip: string): string {
  // Basic IPv6 normalization - expand and format
  const parts = ip.split(':');
  const expanded: string[] = [];
  
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === '') {
      const zerosNeeded = 8 - (parts.length - 1);
      for (let j = 0; j < zerosNeeded; j++) {
        expanded.push('0000');
      }
    } else {
      expanded.push(parts[i].padStart(4, '0'));
    }
  }
  
  return expanded.join(':').toLowerCase();
}

function normalizeDomainName(domain: string): string {
  return domain.toLowerCase().trim();
}

function splitTXTRecord(value: string): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < value.length; i += 255) {
    chunks.push(value.slice(i, i + 255));
  }
  return chunks;
}

function estimateRecordDataSize(record: DNSRecord): number {
  switch (record.type.toLowerCase()) {
    case 'a': return 4;
    case 'aaaa': return 16;
    case 'mx': return 2 + record.value.length + 1;
    case 'cname': return record.value.length + 1;
    case 'txt': return record.value.length + 1;
    case 'srv': return 6 + record.value.length + 1;
    case 'caa': return 2 + record.value.length;
    default: return record.value.length + 10; // Estimate
  }
}

// Simple validation functions for diagnostic tools
export function isValidDomainName(domain: string): boolean {
  if (!domain || domain.trim().length === 0) return false;
  
  const trimmed = domain.trim();
  
  // Check length limits (RFC 1035)
  if (trimmed.length > 253) return false;
  
  // Allow underscores for DNS records like _dmarc, _spf
  const domainRegex = /^(?:[a-zA-Z0-9_](?:[a-zA-Z0-9_-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9_](?:[a-zA-Z0-9_-]{0,61}[a-zA-Z0-9])?\.?$/;
  
  if (!domainRegex.test(trimmed)) return false;
  
  // Check individual labels (max 63 bytes each)
  const labels = trimmed.split('.');
  if (labels.some(label => label.length > 63)) return false;
  
  return true;
}

export function isValidIPAddress(ip: string): boolean {
  if (!ip || ip.trim().length === 0) return false;
  
  const trimmed = ip.trim();
  
  // IPv4 validation
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (ipv4Regex.test(trimmed)) return true;
  
  // IPv6 validation (comprehensive)
  const ipv6Full = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  const ipv6Compressed = /^(?:[0-9a-fA-F]{1,4}:)*::(?:[0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:)*::[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:)*::$/;
  const ipv6Loopback = /^::1$/;
  const ipv6Any = /^::$/;
  
  return ipv6Full.test(trimmed) || ipv6Compressed.test(trimmed) || ipv6Loopback.test(trimmed) || ipv6Any.test(trimmed);
}

export function validateDNSLookupInput(domain: string, useCustomResolver: boolean = false, customResolver: string = ''): SimpleValidationResult {
  const trimmedDomain = domain.trim();
  
  if (!trimmedDomain) {
    return { isValid: false, error: 'Domain name is required' };
  }
  
  if (!isValidDomainName(trimmedDomain)) {
    return { 
      isValid: false, 
      error: 'Invalid domain name format. Use valid domain names like "example.com"' 
    };
  }
  
  if (useCustomResolver) {
    const trimmedResolver = customResolver.trim();
    
    if (!trimmedResolver) {
      return { 
        isValid: false, 
        error: 'Custom DNS resolver IP address is required when custom resolver is selected' 
      };
    }
    
    if (!isValidIPAddress(trimmedResolver)) {
      return { 
        isValid: false, 
        error: 'Invalid DNS resolver IP address. Use valid IPv4 (8.8.8.8) or IPv6 addresses' 
      };
    }
  }
  
  return { isValid: true };
}

export function validateReverseLookupInput(ipAddress: string, useCustomResolver: boolean = false, customResolver: string = ''): SimpleValidationResult {
  const trimmedIP = ipAddress.trim();
  
  if (!trimmedIP) {
    return { isValid: false, error: 'IP address is required' };
  }
  
  if (!isValidIPAddress(trimmedIP)) {
    return { 
      isValid: false, 
      error: 'Invalid IP address format. Use valid IPv4 (8.8.8.8) or IPv6 addresses' 
    };
  }
  
  if (useCustomResolver) {
    const trimmedResolver = customResolver.trim();
    
    if (!trimmedResolver) {
      return { 
        isValid: false, 
        error: 'Custom DNS resolver IP address is required when custom resolver is selected' 
      };
    }
    
    if (!isValidIPAddress(trimmedResolver)) {
      return { 
        isValid: false, 
        error: 'Invalid DNS resolver IP address. Use valid IPv4 (8.8.8.8) or IPv6 addresses' 
      };
    }
  }
  
  return { isValid: true };
}

export function formatDNSError(error: any): string {
  if (typeof error === 'string') return error;
  
  if (error?.name === 'TypeError' && error.message.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  if (error?.message) {
    // Clean up common DNS error messages
    let message = error.message;
    
    if (message.includes('ENOTFOUND')) {
      return 'Domain not found. Please check the domain name and try again.';
    }
    
    if (message.includes('ENODATA')) {
      return 'No records found for this query. The domain may not have the requested record type.';
    }
    
    if (message.includes('ETIMEOUT') || message.includes('timeout')) {
      return 'DNS lookup timed out. Please try again or use a different DNS resolver.';
    }
    
    if (message.includes('ECONNREFUSED')) {
      return 'DNS server connection refused. Please try a different DNS resolver.';
    }
    
    return message;
  }
  
  return 'An unexpected error occurred during DNS lookup.';
}