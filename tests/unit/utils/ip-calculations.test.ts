import { describe, it, expect } from 'vitest';
import { 
  parseIP, 
  cidrToMask, 
  maskToCidr, 
  getNetworkAddress, 
  getBroadcastAddress, 
  getHostRange, 
  calculateSubnetInfo,
  ipToNumber,
  numberToIP
} from '../../../src/lib/utils/ip-calculations';

describe('IP calculations core logic', () => {
  describe('parseIP', () => {
    it('correctly parses valid IP addresses', () => {
      const result = parseIP('192.168.1.1');
      expect(result.octets).toEqual([192, 168, 1, 1]);
      expect(result.binary).toBe('11000000.10101000.00000001.00000001');
      expect(result.decimal).toBe(3232235777);
      expect(result.hex).toBe('C0.A8.01.01');
      expect(result.valid).toBe(true);
    });

    it('handles edge cases correctly', () => {
      const zero = parseIP('0.0.0.0');
      expect(zero.decimal).toBe(0);
      expect(zero.binary).toBe('00000000.00000000.00000000.00000000');

      const max = parseIP('255.255.255.255');
      expect(max.decimal).toBe(4294967295);
      expect(max.binary).toBe('11111111.11111111.11111111.11111111');
    });
  });

  describe('CIDR and mask conversions', () => {
    it('converts CIDR to subnet mask correctly', () => {
      expect(cidrToMask(24).octets).toEqual([255, 255, 255, 0]);
      expect(cidrToMask(16).octets).toEqual([255, 255, 0, 0]);
      expect(cidrToMask(8).octets).toEqual([255, 0, 0, 0]);
      expect(cidrToMask(30).octets).toEqual([255, 255, 255, 252]);
    });

    it('converts subnet mask to CIDR correctly', () => {
      expect(maskToCidr('255.255.255.0')).toBe(24);
      expect(maskToCidr('255.255.0.0')).toBe(16);
      expect(maskToCidr('255.0.0.0')).toBe(8);
      expect(maskToCidr('255.255.255.252')).toBe(30);
    });

    it('handles edge CIDR values', () => {
      expect(cidrToMask(0).octets).toEqual([0, 0, 0, 0]);
      expect(cidrToMask(32).octets).toEqual([255, 255, 255, 255]);
      expect(maskToCidr('0.0.0.0')).toBe(0);
      expect(maskToCidr('255.255.255.255')).toBe(32);
    });
  });

  describe('network calculations', () => {
    it('calculates network address correctly', () => {
      expect(getNetworkAddress('192.168.1.100', 24).octets).toEqual([192, 168, 1, 0]);
      expect(getNetworkAddress('10.5.3.200', 16).octets).toEqual([10, 5, 0, 0]);
      expect(getNetworkAddress('172.16.50.75', 20).octets).toEqual([172, 16, 48, 0]);
    });

    it('calculates broadcast address correctly', () => {
      expect(getBroadcastAddress('192.168.1.100', 24).octets).toEqual([192, 168, 1, 255]);
      expect(getBroadcastAddress('10.5.3.200', 16).octets).toEqual([10, 5, 255, 255]);
      expect(getBroadcastAddress('172.16.50.75', 20).octets).toEqual([172, 16, 63, 255]);
    });

    it('calculates host range correctly', () => {
      const range24 = getHostRange('192.168.1.0', 24);
      expect(range24.first.octets).toEqual([192, 168, 1, 1]);
      expect(range24.last.octets).toEqual([192, 168, 1, 254]);

      const range30 = getHostRange('192.168.1.0', 30);
      expect(range30.first.octets).toEqual([192, 168, 1, 1]);
      expect(range30.last.octets).toEqual([192, 168, 1, 2]);
    });

    it('handles /31 and /32 subnets correctly', () => {
      // /31 subnet (point-to-point)
      const range31 = getHostRange('192.168.1.0', 31);
      expect(range31.first.octets).toEqual([192, 168, 1, 0]);
      expect(range31.last.octets).toEqual([192, 168, 1, 1]);

      // /32 subnet (host route)
      const range32 = getHostRange('192.168.1.1', 32);
      expect(range32.first.octets).toEqual([192, 168, 1, 1]);
      expect(range32.last.octets).toEqual([192, 168, 1, 1]);
    });
  });

  describe('complete subnet calculations', () => {
    it('calculates all subnet information correctly for /24', () => {
      const subnet = calculateSubnetInfo('192.168.1.100', 24);
      
      expect(subnet.ip.octets).toEqual([192, 168, 1, 100]);
      expect(subnet.network.octets).toEqual([192, 168, 1, 0]);
      expect(subnet.broadcast.octets).toEqual([192, 168, 1, 255]);
      expect(subnet.firstHost.octets).toEqual([192, 168, 1, 1]);
      expect(subnet.lastHost.octets).toEqual([192, 168, 1, 254]);
      expect(subnet.cidr).toBe(24);
      expect(subnet.hostCount).toBe(254);
      expect(subnet.totalAddresses).toBe(256);
    });

    it('calculates subnet information for different CIDR sizes', () => {
      const subnet16 = calculateSubnetInfo('10.0.50.100', 16);
      expect(subnet16.hostCount).toBe(65534);
      expect(subnet16.totalAddresses).toBe(65536);

      const subnet28 = calculateSubnetInfo('192.168.1.16', 28);
      expect(subnet28.hostCount).toBe(14);
      expect(subnet28.totalAddresses).toBe(16);
    });
  });

  describe('number conversions', () => {
    it('converts IP to number correctly', () => {
      expect(ipToNumber('192.168.1.1')).toBe(3232235777);
      expect(ipToNumber('10.0.0.1')).toBe(167772161);
      expect(ipToNumber('0.0.0.0')).toBe(0);
      expect(ipToNumber('255.255.255.255')).toBe(4294967295);
    });

    it('converts number to IP correctly', () => {
      expect(numberToIP(3232235777).octets).toEqual([192, 168, 1, 1]);
      expect(numberToIP(167772161).octets).toEqual([10, 0, 0, 1]);
      expect(numberToIP(0).octets).toEqual([0, 0, 0, 0]);
      expect(numberToIP(4294967295).octets).toEqual([255, 255, 255, 255]);
    });

    it('handles round-trip conversions correctly', () => {
      const testIPs = ['192.168.1.1', '10.0.0.1', '172.16.254.1', '203.0.113.1'];
      
      testIPs.forEach(ip => {
        const num = ipToNumber(ip);
        const backToIP = numberToIP(num).octets.join('.');
        expect(backToIP).toBe(ip);
      });
    });
  });

  describe('binary representation accuracy', () => {
    it('produces correct binary representations', () => {
      const ip = parseIP('192.168.1.0');
      expect(ip.binary).toBe('11000000.10101000.00000001.00000000');
      
      const mask = cidrToMask(24);
      expect(mask.binary).toBe('11111111.11111111.11111111.00000000');
    });

    it('handles all 256 possible octet values', () => {
      for (let i = 0; i <= 255; i++) {
        const ip = parseIP(`${i}.0.0.0`);
        expect(ip.octets[0]).toBe(i);
        expect(ip.binary.startsWith(i.toString(2).padStart(8, '0'))).toBe(true);
      }
    });
  });

  describe('error conditions and edge cases', () => {
    it('handles maximum network sizes', () => {
      const subnet0 = calculateSubnetInfo('0.0.0.0', 0);
      expect(subnet0.totalAddresses).toBe(4294967296);
      expect(subnet0.hostCount).toBe(4294967294);
    });

    it('calculates correct host counts for all CIDR sizes', () => {
      const expectedHosts = {
        0: 4294967294, // /0 - entire Internet minus network/broadcast
        8: 16777214,   // /8 - Class A minus network/broadcast
        16: 65534,     // /16 - Class B minus network/broadcast
        24: 254,       // /24 - Class C minus network/broadcast
        28: 14,        // /28 - 16 addresses minus network/broadcast
        30: 2,         // /30 - 4 addresses minus network/broadcast
        31: 2,         // /31 - point-to-point, no network/broadcast
        32: 1          // /32 - single host
      };

      Object.entries(expectedHosts).forEach(([cidr, hosts]) => {
        const subnet = calculateSubnetInfo('192.168.1.0', parseInt(cidr));
        expect(subnet.hostCount).toBe(hosts);
      });
    });
  });
});