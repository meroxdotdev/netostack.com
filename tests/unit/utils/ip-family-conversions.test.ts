import { describe, it, expect } from 'vitest';
import {
  validateIPv4,
  validateIPv6,
  ipv4ToIPv6,
  ipv6ToIPv4,
  getIPv6Info,
  expandIPv6,
  compressIPv6
} from '../../../src/lib/utils/ip-family-conversions.js';

describe('IP Family Conversion Utilities', () => {
  describe('IPv4 validation', () => {
    it('should validate correct IPv4 addresses', () => {
      const validIPs = [
        '0.0.0.0',
        '127.0.0.1',
        '192.168.1.1',
        '255.255.255.255',
        '10.0.0.1',
        '172.16.0.1'
      ];

      validIPs.forEach(ip => {
        const result = validateIPv4(ip);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject invalid IPv4 addresses', () => {
      const invalidIPs = [
        '256.1.1.1',
        '1.256.1.1',
        '1.1.256.1',
        '1.1.1.256',
        '1.1.1',
        '1.1.1.1.1',
        'abc.1.1.1',
        '1.abc.1.1',
        '192.168.1.',
        '.192.168.1.1',
        ''
      ];

      invalidIPs.forEach(ip => {
        const result = validateIPv4(ip);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Invalid IPv4 format');
      });
    });
  });

  describe('IPv6 validation', () => {
    it('should validate correct IPv6 addresses', () => {
      const validIPs = [
        '::1',
        '::',
        '2001:db8::1',
        '2001:0db8:0000:0000:0000:0000:0000:0001',
        'fe80::1',
        '::ffff:192.0.2.1',
        '::ffff:c000:0201',
        '[2001:db8::1]',
        'fc00::1',
        'ff00::1'
      ];

      validIPs.forEach(ip => {
        const result = validateIPv6(ip);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject invalid IPv6 addresses', () => {
      const invalidIPs = [
        'gggg::1',
        '2001:db8:::1',
        '2001:db8::1::1',
        '2001:db8:1:2:3:4:5:6:7',
        '2001:db8::12345',
        ''
      ];

      invalidIPs.forEach(ip => {
        const result = validateIPv6(ip);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Invalid IPv6 format');
      });
    });
  });

  describe('IPv4 to IPv6 conversion', () => {
    it('should convert valid IPv4 to IPv4-mapped IPv6', () => {
      const result = ipv4ToIPv6('192.0.2.1');

      expect(result.success).toBe(true);
      expect(result.result).toBe('::ffff:c000:0201');
      expect(result.type).toBe('IPv4-mapped IPv6');
      expect(result.details?.compressed).toBe('::ffff:c000:0201');
      expect(result.details?.expanded).toBe('0000:0000:0000:0000:0000:ffff:c000:0201');
      expect(result.details?.dotted).toBe('::ffff:192.0.2.1');
      expect(result.details?.original).toBe('192.0.2.1');
    });

    it('should convert corner case IPv4 addresses', () => {
      const testCases = [
        { ipv4: '0.0.0.0', expected: '::ffff:0000:0000' },
        { ipv4: '255.255.255.255', expected: '::ffff:ffff:ffff' },
        { ipv4: '127.0.0.1', expected: '::ffff:7f00:0001' },
        { ipv4: '10.0.0.1', expected: '::ffff:0a00:0001' }
      ];

      testCases.forEach(({ ipv4, expected }) => {
        const result = ipv4ToIPv6(ipv4);
        expect(result.success).toBe(true);
        expect(result.result).toBe(expected);
      });
    });

    it('should reject invalid IPv4 for conversion', () => {
      const result = ipv4ToIPv6('256.1.1.1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid IPv4 format');
    });
  });

  describe('IPv6 to IPv4 conversion', () => {
    it('should convert IPv4-mapped IPv6 (hex format) to IPv4', () => {
      const result = ipv6ToIPv4('::ffff:c000:0201');

      expect(result.success).toBe(true);
      expect(result.result).toBe('192.0.2.1');
      expect(result.type).toBe('Extracted from IPv4-mapped IPv6');
      expect(result.details?.ipv4).toBe('192.0.2.1');
      expect(result.details?.original).toBe('::ffff:c000:0201');
      expect(result.details?.hex1).toBe('c000');
      expect(result.details?.hex2).toBe('0201');
    });

    it('should convert IPv4-mapped IPv6 (dotted format) to IPv4', () => {
      const result = ipv6ToIPv4('::ffff:192.0.2.1');

      expect(result.success).toBe(true);
      expect(result.result).toBe('192.0.2.1');
      expect(result.type).toBe('Extracted from IPv4-mapped IPv6');
      expect(result.details?.ipv4).toBe('192.0.2.1');
      expect(result.details?.original).toBe('::ffff:192.0.2.1');
    });

    it('should handle IPv6 addresses with brackets', () => {
      const result = ipv6ToIPv4('[::ffff:192.0.2.1]');

      expect(result.success).toBe(true);
      expect(result.result).toBe('192.0.2.1');
    });

    it('should reject non-IPv4-mapped IPv6 addresses', () => {
      const nonMappedAddresses = [
        '2001:db8::1',
        'fe80::1',
        '::1',
        'fc00::1'
      ];

      nonMappedAddresses.forEach(ip => {
        const result = ipv6ToIPv4(ip);
        expect(result.success).toBe(false);
        expect(result.error).toContain('not IPv4-mapped');
        expect(result.details?.suggestion).toContain('::ffff:');
      });
    });

    it('should reject invalid IPv6 for conversion', () => {
      const result = ipv6ToIPv4('invalid::ipv6');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid IPv6 format');
    });
  });

  describe('IPv6 information extraction', () => {
    it('should identify loopback addresses', () => {
      const info = getIPv6Info('::1');

      expect(info.types).toContain('Loopback');
      expect(info.description).toContain('loopback');
      expect(info.cleaned).toBe('::1');
    });

    it('should identify unspecified addresses', () => {
      const info = getIPv6Info('::');

      expect(info.types).toContain('Unspecified');
      expect(info.description).toContain('unspecified');
    });

    it('should identify IPv4-mapped addresses', () => {
      const info = getIPv6Info('::ffff:192.0.2.1');

      expect(info.types).toContain('IPv4-mapped');
      expect(info.description).toContain('IPv4-mapped');
    });

    it('should identify link-local addresses', () => {
      const info = getIPv6Info('fe80::1');

      expect(info.types).toContain('Link-local');
      expect(info.description).toContain('Link-local');
    });

    it('should identify unique local addresses', () => {
      const fcInfo = getIPv6Info('fc00::1');
      const fdInfo = getIPv6Info('fd00::1');

      expect(fcInfo.types).toContain('Unique Local');
      expect(fdInfo.types).toContain('Unique Local');
      expect(fcInfo.description).toContain('Unique local');
    });

    it('should identify multicast addresses', () => {
      const info = getIPv6Info('ff00::1');

      expect(info.types).toContain('Multicast');
      expect(info.description).toContain('multicast');
    });

    it('should identify global unicast addresses', () => {
      const info = getIPv6Info('2001:db8::1');

      expect(info.types).toContain('Global Unicast');
      expect(info.description).toContain('Global unicast');
    });

    it('should handle brackets in IPv6 addresses', () => {
      const info = getIPv6Info('[2001:db8::1]');

      expect(info.cleaned).toBe('2001:db8::1');
      expect(info.original).toBe('[2001:db8::1]');
    });
  });

  describe('IPv6 expansion', () => {
    it('should expand compressed IPv6 addresses', () => {
      const testCases = [
        { compressed: '::1', expanded: '0000:0000:0000:0000:0000:0000:0000:0001' },
        { compressed: '::', expanded: '0000:0000:0000:0000:0000:0000:0000:0000' },
        { compressed: '2001:db8::1', expanded: '2001:0db8:0000:0000:0000:0000:0000:0001' },
        { compressed: '::ffff:192.0.2.1', expanded: '0000:0000:0000:0000:0000:0000:ffff:192.0.2.1' },
        { compressed: 'fe80::1', expanded: 'fe80:0000:0000:0000:0000:0000:0000:0001' },
        { compressed: '2001:db8:1::1', expanded: '2001:0db8:0001:0000:0000:0000:0000:0001' }
      ];

      testCases.forEach(({ compressed, expanded }) => {
        const result = expandIPv6(compressed);
        expect(result).toBe(expanded);
      });
    });

    it('should handle already expanded addresses', () => {
      const expanded = '2001:0db8:0000:0000:0000:0000:0000:0001';
      const result = expandIPv6(expanded);
      expect(result).toBe(expanded);
    });

    it('should handle brackets', () => {
      const result = expandIPv6('[::1]');
      expect(result).toBe('0000:0000:0000:0000:0000:0000:0000:0001');
    });
  });

  describe('IPv6 compression', () => {
    it('should compress expanded IPv6 addresses', () => {
      const testCases = [
        { expanded: '0000:0000:0000:0000:0000:0000:0000:0001', compressed: '::1' },
        { expanded: '0000:0000:0000:0000:0000:0000:0000:0000', compressed: '::' },
        { expanded: '2001:0db8:0000:0000:0000:0000:0000:0001', compressed: '2001:db8::1' },
        { expanded: 'fe80:0000:0000:0000:0000:0000:0000:0001', compressed: 'fe80::1' },
        { expanded: '2001:0db8:0001:0000:0000:0000:0000:0001', compressed: '2001:db8:1::1' }
      ];

      testCases.forEach(({ expanded, compressed }) => {
        const result = compressIPv6(expanded);
        expect(result).toBe(compressed);
      });
    });

    it('should remove leading zeros without compression', () => {
      const result = compressIPv6('2001:0db8:0001:0002:0003:0004:0005:0006');
      expect(result).toBe('2001:db8:1:2:3:4:5:6');
    });

    it('should compress longest zero sequence', () => {
      const result = compressIPv6('2001:0000:0000:0000:0000:0000:0000:0001');
      expect(result).toBe('2001::1');
    });

    it('should compress trailing zeros', () => {
      const result = compressIPv6('2001:0db8:0000:0000:0000:0000:0000:0000');
      expect(result).toBe('2001:db8::');
    });

    it('should compress leading zeros', () => {
      const result = compressIPv6('0000:0000:0000:0000:0000:0000:0db8:0001');
      expect(result).toBe('::db8:1');
    });

    it('should handle addresses with no compressible sequences', () => {
      const result = compressIPv6('2001:0db8:0001:0002:0003:0004:0005:0006');
      expect(result).toBe('2001:db8:1:2:3:4:5:6');
    });
  });

  describe('Round-trip conversions', () => {
    it('should maintain consistency in IPv4 to IPv6 and back', () => {
      const originalIPv4 = '192.0.2.1';

      const toIPv6Result = ipv4ToIPv6(originalIPv4);
      expect(toIPv6Result.success).toBe(true);

      const backToIPv4Result = ipv6ToIPv4(toIPv6Result.result!);
      expect(backToIPv4Result.success).toBe(true);
      expect(backToIPv4Result.result).toBe(originalIPv4);
    });

    it('should maintain consistency in IPv6 expansion and compression', () => {
      const testAddresses = [
        '::1',
        '2001:db8::1',
        'fe80::1',
        '2001:db8:1::1'
      ];

      testAddresses.forEach(original => {
        const expanded = expandIPv6(original);
        const compressed = compressIPv6(expanded);
        expect(compressed).toBe(original);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty strings gracefully', () => {
      expect(validateIPv4('')).toEqual({ valid: false, error: 'Invalid IPv4 format' });
      expect(validateIPv6('')).toEqual({ valid: false, error: 'Invalid IPv6 format' });
    });

    it('should handle whitespace', () => {
      expect(validateIPv4(' 192.168.1.1 ')).toEqual({ valid: false, error: 'Invalid IPv4 format' });
      expect(validateIPv6(' ::1 ')).toEqual({ valid: false, error: 'Invalid IPv6 format' });
    });

    it('should handle case insensitivity for IPv6', () => {
      const upperCase = validateIPv6('2001:DB8::1');
      const lowerCase = validateIPv6('2001:db8::1');

      expect(upperCase.valid).toBe(true);
      expect(lowerCase.valid).toBe(true);
    });

    it('should handle mixed case IPv4-mapped conversion', () => {
      const result = ipv6ToIPv4('::FFFF:C000:0201');
      expect(result.success).toBe(true);
      expect(result.result).toBe('192.0.2.1');
    });
  });
});