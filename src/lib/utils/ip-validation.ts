import type { ValidationResult } from '../types/ip.js';

/**
 * Validates an IPv4 address string
 */
export function validateIPv4(ip: string): ValidationResult {
  if (!ip || typeof ip !== 'string') {
    return { valid: false, error: 'IP address is required' };
  }

  const octets = ip.trim().split('.');
  
  if (octets.length !== 4) {
    return { valid: false, error: 'IPv4 address must have 4 octets' };
  }

  for (let i = 0; i < octets.length; i++) {
    const octet = octets[i];
    
    if (!/^\d+$/.test(octet)) {
      return { valid: false, error: `Octet ${i + 1} contains non-numeric characters` };
    }
    
    const num = parseInt(octet, 10);
    
    if (num < 0 || num > 255) {
      return { valid: false, error: `Octet ${i + 1} must be between 0-255` };
    }
    
    if (octet.length > 1 && octet[0] === '0') {
      return { valid: false, error: `Octet ${i + 1} has leading zeros` };
    }
  }

  return { valid: true };
}

/**
 * Validates CIDR notation
 */
export function validateCIDR(cidr: string): ValidationResult {
  if (!cidr) {
    return { valid: false, error: 'CIDR notation is required' };
  }

  const parts = cidr.split('/');
  
  if (parts.length !== 2) {
    return { valid: false, error: 'CIDR must be in format IP/prefix' };
  }

  const ipValidation = validateIPv4(parts[0]);
  if (!ipValidation.valid) {
    return ipValidation;
  }

  const prefix = parseInt(parts[1], 10);
  if (isNaN(prefix) || prefix < 0 || prefix > 32) {
    return { valid: false, error: 'CIDR prefix must be between 0-32' };
  }

  return { valid: true };
}

/**
 * Validates subnet mask
 */
export function validateSubnetMask(mask: string): ValidationResult {
  const validation = validateIPv4(mask);
  if (!validation.valid) {
    return validation;
  }

  const octets = mask.split('.').map(Number);
  const binary = octets.map(n => n.toString(2).padStart(8, '0')).join('');
  
  // Check if mask is contiguous (all 1s followed by all 0s)
  if (!/^1*0*$/.test(binary)) {
    return { valid: false, error: 'Subnet mask must be contiguous' };
  }

  return { valid: true };
}