import type { IPAddress, SubnetInfo } from '../types/ip.js';

/**
 * Converts IP string to IPAddress object
 */
export function parseIP(ip: string): IPAddress {
  const octets = ip.split('.').map(Number);
  const binary = octets.map(n => n.toString(2).padStart(8, '0')).join('.');
  const decimal = octets.reduce((acc, octet, i) => acc + octet * Math.pow(256, 3 - i), 0);
  const hex = octets.map(n => n.toString(16).padStart(2, '0').toUpperCase()).join('.');

  return {
    octets,
    binary,
    decimal,
    hex,
    valid: true
  };
}

/**
 * Converts CIDR prefix to subnet mask
 */
export function cidrToMask(cidr: number): IPAddress {
  const mask = (0xffffffff << (32 - cidr)) >>> 0;
  const octets = [
    (mask >>> 24) & 0xff,
    (mask >>> 16) & 0xff,
    (mask >>> 8) & 0xff,
    mask & 0xff
  ];
  
  return parseIP(octets.join('.'));
}

/**
 * Converts subnet mask to CIDR prefix
 */
export function maskToCidr(mask: string): number {
  const octets = mask.split('.').map(Number);
  const binary = octets.map(n => n.toString(2).padStart(8, '0')).join('');
  return binary.split('1').length - 1;
}

/**
 * Calculates network address
 */
export function getNetworkAddress(ip: string, cidr: number): IPAddress {
  const ipNum = ipToNumber(ip);
  const mask = (0xffffffff << (32 - cidr)) >>> 0;
  const networkNum = (ipNum & mask) >>> 0;
  
  return numberToIP(networkNum);
}

/**
 * Calculates broadcast address
 */
export function getBroadcastAddress(ip: string, cidr: number): IPAddress {
  const networkNum = ipToNumber(getNetworkAddress(ip, cidr).octets.join('.'));
  const hostBits = 32 - cidr;
  const broadcastNum = networkNum + Math.pow(2, hostBits) - 1;
  
  return numberToIP(broadcastNum);
}

/**
 * Calculates complete subnet information
 */
export function calculateSubnet(ip: string, cidr: number): SubnetInfo {
  const network = getNetworkAddress(ip, cidr);
  const broadcast = getBroadcastAddress(ip, cidr);
  const subnet = cidrToMask(cidr);
  const wildcardMask = getWildcardMask(cidr);
  
  const hostBits = 32 - cidr;
  const hostCount = Math.pow(2, hostBits);
  const usableHosts = hostCount > 2 ? hostCount - 2 : 0;
  
  const firstHost = numberToIP(ipToNumber(network.octets.join('.')) + 1);
  const lastHost = numberToIP(ipToNumber(broadcast.octets.join('.')) - 1);

  return {
    network,
    broadcast,
    subnet,
    cidr,
    hostCount,
    usableHosts,
    firstHost,
    lastHost,
    wildcardMask
  };
}

/**
 * Calculates wildcard mask
 */
export function getWildcardMask(cidr: number): IPAddress {
  const mask = cidrToMask(cidr);
  const wildcardOctets = mask.octets.map(octet => 255 - octet);
  
  return parseIP(wildcardOctets.join('.'));
}

/**
 * Converts IP address to 32-bit number
 */
function ipToNumber(ip: string): number {
  const octets = ip.split('.').map(Number);
  return (octets[0] << 24 | octets[1] << 16 | octets[2] << 8 | octets[3]) >>> 0;
}

/**
 * Converts 32-bit number to IP address
 */
function numberToIP(num: number): IPAddress {
  const octets = [
    (num >>> 24) & 0xff,
    (num >>> 16) & 0xff,
    (num >>> 8) & 0xff,
    num & 0xff
  ];
  
  return parseIP(octets.join('.'));
}

/**
 * Checks if IP is in subnet range
 */
export function isIPInSubnet(ip: string, subnet: string, cidr: number): boolean {
  const ipNum = ipToNumber(ip);
  const subnetNum = ipToNumber(subnet);
  const mask = (0xffffffff << (32 - cidr)) >>> 0;
  
  return ((ipNum & mask) >>> 0) === ((subnetNum & mask) >>> 0);
}