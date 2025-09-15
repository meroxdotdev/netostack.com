import { describe, it, expect } from 'vitest';
import { 
  validateDomainName,
  validateEmail,
  validateTTL,
  humanizeTTL,
  calculateTTLExpiry,
  estimateEDNSSize,
  validateDNSRecord,
  normalizeDomainLabel,
  humanizeTTLSimple
} from '../../../src/lib/utils/dns-validation';

describe('DNS validation utilities', () => {
  describe('domain name validation', () => {
    it('validates correct domain names', () => {
      const validDomains = [
        'example.com',
        'sub.example.com',
        'test-domain.org',
        'a.b.c.d.example.co.uk',
        '123.example.com',
        'test.example-site.com'
      ];

      validDomains.forEach(domain => {
        const result = validateDomainName(domain);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('rejects invalid domain names', () => {
      const invalidDomains = [
        '',
        'domain',                    // No TLD
        '.example.com',              // Leading dot
        'example.com.',              // Trailing dot (depending on config)
        'ex ample.com',              // Space
        'example..com',              // Double dot
        '-example.com',              // Leading hyphen
        'example-.com',              // Trailing hyphen
        '12345678901234567890123456789012345678901234567890123456789012345.com', // Label too long
        'a'.repeat(254) + '.com'     // Domain too long
      ];

      invalidDomains.forEach(domain => {
        const result = validateDomainName(domain);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    it('handles IDN domains correctly', () => {
      const idnDomains = [
        'xn--e1afmkfd.xn--p1ai',     // пример.рф (Russian)
        'xn--fsq.xn--0zwm56d',       // 测试.测试 (Chinese)
        'xn--nxasmq6b.xn--mgbaam7a8h' // إختبار.إختبار (Arabic)
      ];

      idnDomains.forEach(domain => {
        const result = validateDomainName(domain);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('email validation for DNS', () => {
    it('validates email addresses for DNS use', () => {
      const validEmails = [
        'admin@example.com',
        'user.name@subdomain.example.org',
        'test+tag@example.co.uk',
        'user123@test-domain.com'
      ];

      validEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('converts to DNS format correctly', () => {
      const result = validateEmail('admin@example.com');
      expect(result.normalized).toBe('admin.example.com');
    });

    it('handles special characters in email', () => {
      const result = validateEmail('user.name+tag@example.com');
      expect(result.normalized).toBe('user\\.name\\+tag.example.com');
    });
  });

  describe('TTL validation and formatting', () => {
    it('validates TTL values', () => {
      expect(validateTTL(300).valid).toBe(true);
      expect(validateTTL(86400).valid).toBe(true);
      expect(validateTTL(604800).valid).toBe(true);
      
      expect(validateTTL(-1).valid).toBe(false);
      expect(validateTTL(0).valid).toBe(false);
      expect(validateTTL(2147483648).valid).toBe(false); // 2^31, too large
    });

    it('humanizes TTL values correctly', () => {
      expect(humanizeTTLSimple(60)).toBe('1 minute');
      expect(humanizeTTLSimple(300)).toBe('5 minutes');
      expect(humanizeTTLSimple(3600)).toBe('1 hour');
      expect(humanizeTTLSimple(86400)).toBe('1 day');
      expect(humanizeTTLSimple(604800)).toBe('1 week');
      expect(humanizeTTLSimple(7200)).toBe('2 hours');
      expect(humanizeTTLSimple(90)).toBe('1 minute 30 seconds');
    });

    it('categorizes TTL appropriately', () => {
      const shortTTL = calculateTTLExpiry(60);
      expect(shortTTL.category).toBe('very-short');
      expect(shortTTL.recommendations).toContain('Consider increasing');

      const mediumTTL = calculateTTLExpiry(3600);
      expect(mediumTTL.category).toBe('medium');

      const longTTL = calculateTTLExpiry(86400);
      expect(longTTL.category).toBe('long');
    });

    it('calculates expiry times correctly', () => {
      const now = new Date();
      const ttlInfo = calculateTTLExpiry(3600); // 1 hour
      const expectedExpiry = new Date(now.getTime() + 3600 * 1000);
      
      // Allow 1 second tolerance for test execution time
      expect(Math.abs(ttlInfo.expiresAt.getTime() - expectedExpiry.getTime())).toBeLessThan(1000);
    });
  });

  describe('EDNS size estimation', () => {
    it('estimates basic query size correctly', () => {
      const estimate = estimateEDNSSize('example.com', 'A', []);
      
      expect(estimate.baseSize).toBeGreaterThan(0);
      expect(estimate.recordsSize).toBe(0);
      expect(estimate.totalSize).toBe(estimate.baseSize);
      expect(estimate.udpSafe).toBe(true);
    });

    it('accounts for multiple records', () => {
      const records = [
        { name: 'example.com', type: 'A', value: '192.168.1.1' },
        { name: 'example.com', type: 'A', value: '192.168.1.2' },
        { name: 'example.com', type: 'AAAA', value: '2001:db8::1' }
      ];

      const estimate = estimateEDNSSize('example.com', 'A', records);
      
      expect(estimate.recordsSize).toBeGreaterThan(0);
      expect(estimate.totalSize).toBeGreaterThan(estimate.baseSize);
    });

    it('identifies fragmentation risk', () => {
      // Create many records to simulate large response
      const manyRecords = Array.from({ length: 50 }, (_, i) => ({
        name: 'example.com',
        type: 'TXT',
        value: `v=DKIM1; k=rsa; p=${'A'.repeat(200)}` // Large TXT record
      }));

      const estimate = estimateEDNSSize('example.com', 'TXT', manyRecords);
      
      expect(estimate.totalSize).toBeGreaterThan(512);
      expect(estimate.fragmentationRisk).toBe('high');
      expect(estimate.recommendations).toContain('Consider using TCP');
    });
  });

  describe('DNS record validation', () => {
    it('validates A records', () => {
      const validA = validateDNSRecord('example.com', 'A', '192.168.1.1');
      expect(validA.valid).toBe(true);

      const invalidA = validateDNSRecord('example.com', 'A', '256.1.1.1');
      expect(invalidA.valid).toBe(false);
      expect(invalidA.errors).toContain('Invalid IPv4 address');
    });

    it('validates AAAA records', () => {
      const validAAAA = validateDNSRecord('example.com', 'AAAA', '2001:db8::1');
      expect(validAAAA.valid).toBe(true);

      const invalidAAAA = validateDNSRecord('example.com', 'AAAA', '2001:db8::gggg');
      expect(invalidAAAA.valid).toBe(false);
      expect(invalidAAAA.errors).toContain('Invalid IPv6 address');
    });

    it('validates CNAME records', () => {
      const validCNAME = validateDNSRecord('alias.example.com', 'CNAME', 'target.example.com');
      expect(validCNAME.valid).toBe(true);

      const invalidCNAME = validateDNSRecord('alias.example.com', 'CNAME', 'invalid..domain');
      expect(invalidCNAME.valid).toBe(false);
    });

    it('validates MX records', () => {
      const validMX = validateDNSRecord('example.com', 'MX', '10 mail.example.com');
      expect(validMX.valid).toBe(true);

      const invalidMX = validateDNSRecord('example.com', 'MX', 'invalid-priority mail.example.com');
      expect(invalidMX.valid).toBe(false);
      expect(invalidMX.errors).toContain('Invalid MX priority');
    });

    it('validates TXT records', () => {
      const validTXT = validateDNSRecord('example.com', 'TXT', 'v=spf1 include:_spf.example.com ~all');
      expect(validTXT.valid).toBe(true);

      // TXT record too long (>255 characters per string)
      const longTXT = 'a'.repeat(256);
      const invalidTXT = validateDNSRecord('example.com', 'TXT', longTXT);
      expect(invalidTXT.valid).toBe(false);
      expect(invalidTXT.errors).toContain('TXT record string too long');
    });

    it('validates SRV records', () => {
      const validSRV = validateDNSRecord('_http._tcp.example.com', 'SRV', '10 5 80 server.example.com');
      expect(validSRV.valid).toBe(true);

      const invalidSRV = validateDNSRecord('_http._tcp.example.com', 'SRV', '10 5 99999 server.example.com');
      expect(invalidSRV.valid).toBe(false);
      expect(invalidSRV.errors).toContain('Invalid port number');
    });
  });

  describe('domain label normalization', () => {
    it('normalizes basic labels correctly', () => {
      const result = normalizeDomainLabel('Example');
      expect(result.normalized).toBe('example');
      expect(result.warnings).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it('detects potential homoglyphs', () => {
      // Cyrillic 'а' looks like Latin 'a'
      const result = normalizeDomainLabel('exаmple'); // Contains Cyrillic 'а'
      expect(result.hasHomoglyphs).toBe(true);
      expect(result.warnings).toContain('Contains potential homoglyphs');
    });

    it('handles mixed scripts correctly', () => {
      const result = normalizeDomainLabel('exampleрусский'); // Latin + Cyrillic
      expect(result.scripts?.length).toBeGreaterThan(1);
      expect(result.warnings).toContain('Mixed scripts detected');
    });

    it('identifies IDN labels', () => {
      const result = normalizeDomainLabel('тест'); // Cyrillic
      expect(result.isIDN).toBe(true);
      expect(result.scripts).toContain('Cyrillic');
    });
  });

  describe('practical DNS validation scenarios', () => {
    it('validates complete zone records', () => {
      const zoneRecords = [
        { name: 'example.com', type: 'A', value: '192.168.1.1' },
        { name: 'example.com', type: 'MX', value: '10 mail.example.com' },
        { name: 'www.example.com', type: 'CNAME', value: 'example.com' },
        { name: 'mail.example.com', type: 'A', value: '192.168.1.10' },
        { name: 'example.com', type: 'TXT', value: 'v=spf1 mx ~all' }
      ];

      zoneRecords.forEach(record => {
        const result = validateDNSRecord(record.name, record.type, record.value);
        expect(result.valid).toBe(true);
      });
    });

    it('detects common DNS configuration errors', () => {
      // CNAME at apex (not allowed with other records)
      const cnameAtApex = validateDNSRecord('example.com', 'CNAME', 'target.example.com');
      expect(cnameAtApex.warnings).toContain('CNAME at zone apex');

      // MX pointing to CNAME (discouraged)
      const mxToCname = validateDNSRecord('example.com', 'MX', '10 alias.example.com');
      // This would need additional context to detect, but the structure is there
      expect(mxToCname.valid).toBe(true);
    });

    it('validates email-specific DNS records', () => {
      const spfRecord = validateDNSRecord('example.com', 'TXT', 'v=spf1 include:_spf.google.com ~all');
      expect(spfRecord.valid).toBe(true);

      const dmarcRecord = validateDNSRecord('_dmarc.example.com', 'TXT', 'v=DMARC1; p=quarantine; rua=mailto:dmarc@example.com');
      expect(dmarcRecord.valid).toBe(true);

      const dkimRecord = validateDNSRecord('selector._domainkey.example.com', 'TXT', 'v=DKIM1; k=rsa; p=MIGfMA0G...');
      expect(dkimRecord.valid).toBe(true);
    });
  });
});