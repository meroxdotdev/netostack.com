import type { ConversionFormats } from '../types/ip.js';

/**
 * Converts IP address to various number formats
 */
export function convertIPFormats(ip: string): ConversionFormats {
  const octets = ip.split('.').map(Number);
  
  const binary = octets
    .map(octet => octet.toString(2).padStart(8, '0'))
    .join('.');
  
  const decimal = octets
    .reduce((acc, octet, i) => acc + octet * Math.pow(256, 3 - i), 0)
    .toString();
  
  const hex = octets
    .map(octet => '0x' + octet.toString(16).padStart(2, '0').toUpperCase())
    .join('.');
  
  const octal = octets
    .map(octet => '0' + octet.toString(8))
    .join('.');

  return { binary, decimal, hex, octal };
}

/**
 * Converts decimal number to IP address
 */
export function decimalToIP(decimal: number): string {
  const octets = [
    (decimal >>> 24) & 0xff,
    (decimal >>> 16) & 0xff,
    (decimal >>> 8) & 0xff,
    decimal & 0xff
  ];
  
  return octets.join('.');
}

/**
 * Converts binary string to IP address
 */
export function binaryToIP(binary: string): string {
  // Remove dots and spaces
  const cleanBinary = binary.replace(/[.\s]/g, '');
  
  if (cleanBinary.length !== 32) {
    throw new Error('Binary string must be 32 bits');
  }
  
  const octets = [];
  for (let i = 0; i < 32; i += 8) {
    const octetBinary = cleanBinary.slice(i, i + 8);
    octets.push(parseInt(octetBinary, 2));
  }
  
  return octets.join('.');
}

/**
 * Converts hex string to IP address
 */
export function hexToIP(hex: string): string {
  // Remove 0x prefix and dots
  const cleanHex = hex.replace(/0x/g, '').replace(/\./g, '');
  
  if (cleanHex.length !== 8) {
    throw new Error('Hex string must be 8 characters');
  }
  
  const octets = [];
  for (let i = 0; i < 8; i += 2) {
    const octetHex = cleanHex.slice(i, i + 2);
    octets.push(parseInt(octetHex, 16));
  }
  
  return octets.join('.');
}

/**
 * Gets IP class information
 */
export function getIPClass(ip: string): { class: string; type: string; description: string } {
  const firstOctet = parseInt(ip.split('.')[0]);
  
  if (firstOctet >= 1 && firstOctet <= 126) {
    return {
      class: 'A',
      type: 'Unicast',
      description: 'Large networks'
    };
  } else if (firstOctet >= 128 && firstOctet <= 191) {
    return {
      class: 'B',
      type: 'Unicast',
      description: 'Medium networks'
    };
  } else if (firstOctet >= 192 && firstOctet <= 223) {
    return {
      class: 'C',
      type: 'Unicast',
      description: 'Small networks'
    };
  } else if (firstOctet >= 224 && firstOctet <= 239) {
    return {
      class: 'D',
      type: 'Multicast',
      description: 'Multicast addresses'
    };
  } else if (firstOctet >= 240 && firstOctet <= 255) {
    return {
      class: 'E',
      type: 'Reserved',
      description: 'Experimental/Reserved'
    };
  }
  
  return {
    class: 'Invalid',
    type: 'Invalid',
    description: 'Invalid IP address'
  };
}