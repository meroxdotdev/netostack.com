/* Unique Local Address (ULA) Generation Utilities - RFC 4193 */

export interface ULAGeneration {
  prefix: string;
  globalID: string;
  subnetID: string;
  fullPrefix: string;
  network: string;
  isValid: boolean;
  details: {
    prefixBinary: string;
    globalIDBinary: string;
    subnetIDBinary: string;
    algorithm: string;
    timestamp: number;
    entropy: string;
  };
  error?: string;
}

export interface ULAResult {
  generations: ULAGeneration[];
  summary: {
    totalRequests: number;
    successfulGenerations: number;
    failedGenerations: number;
  };
  errors: string[];
}

/* Generate cryptographically secure random bytes */
function generateSecureRandom(bytes: number): Uint8Array {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    return crypto.getRandomValues(new Uint8Array(bytes));
  } else {
    // Fallback for environments without crypto API
    const array = new Uint8Array(bytes);
    for (let i = 0; i < bytes; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  }
}

/* Convert bytes to hex string */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/* Convert hex string to binary string */
function hexToBinary(hex: string): string {
  return hex
    .split('')
    .map(h => parseInt(h, 16).toString(2).padStart(4, '0'))
    .join('');
}

/* Generate SHA-1 hash (simplified implementation for demonstration) */
function generateHash(input: string): string {
  // In a real implementation, you would use a proper SHA-1 library
  // This is a simplified hash for demonstration purposes
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to positive hex and pad to 40 characters (SHA-1 length)
  const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
  return hexHash.repeat(5).substring(0, 40);
}

/* Generate ULA according to RFC 4193 */
function generateULA(subnetId?: string): ULAGeneration {
  try {
    // Step 1: Get current time in 64-bit format
    const timestamp = Date.now();
    
    // Step 2: Generate random/pseudo-random data
    const randomBytes = generateSecureRandom(8);
    const entropy = bytesToHex(randomBytes);
    
    // Step 3: Create input for hash algorithm
    const hashInput = timestamp.toString(16) + entropy;
    
    // Step 4: Compute hash and take least significant 40 bits for Global ID
    const hash = generateHash(hashInput);
    const globalID = hash.substring(hash.length - 10); // Last 40 bits (5 bytes)
    
    // Step 5: Format Global ID with colons
    const formattedGlobalID = globalID.match(/.{4}/g)?.join(':') || '';
    
    // Step 6: Handle subnet ID
    const subnetID = subnetId ? 
      subnetId.padStart(4, '0') : 
      bytesToHex(generateSecureRandom(2));
    
    // Step 7: Construct the ULA prefix
    const prefix = 'fd'; // ULA prefix for locally assigned addresses
    const fullPrefix = `${prefix}${globalID}:${subnetID}`;
    const network = `${fullPrefix}::/64`;
    
    // Generate binary representations
    const prefixBinary = hexToBinary(prefix);
    const globalIDBinary = hexToBinary(globalID);
    const subnetIDBinary = hexToBinary(subnetID);
    
    return {
      prefix,
      globalID: formattedGlobalID,
      subnetID,
      fullPrefix,
      network,
      isValid: true,
      details: {
        prefixBinary,
        globalIDBinary,
        subnetIDBinary,
        algorithm: 'RFC 4193 - Pseudo-random Global ID',
        timestamp,
        entropy
      }
    };
    
  } catch (error) {
    return {
      prefix: '',
      globalID: '',
      subnetID: '',
      fullPrefix: '',
      network: '',
      isValid: false,
      details: {
        prefixBinary: '',
        globalIDBinary: '',
        subnetIDBinary: '',
        algorithm: '',
        timestamp: 0,
        entropy: ''
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/* Validate subnet ID format */
function isValidSubnetID(subnetId: string): boolean {
  if (!subnetId.trim()) return true; // Empty is valid (will be auto-generated)
  
  const clean = subnetId.replace(/:/g, '');
  return /^[0-9a-fA-F]{1,4}$/.test(clean);
}

/* Generate multiple ULA addresses */
export function generateULAAddresses(
  count: number,
  subnetIds?: string[]
): ULAResult {
  const generations: ULAGeneration[] = [];
  const errors: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const subnetId = subnetIds?.[i];
    
    // Validate subnet ID if provided
    if (subnetId && !isValidSubnetID(subnetId)) {
      const errorGen: ULAGeneration = {
        prefix: '',
        globalID: '',
        subnetID: subnetId || '',
        fullPrefix: '',
        network: '',
        isValid: false,
        details: {
          prefixBinary: '',
          globalIDBinary: '',
          subnetIDBinary: '',
          algorithm: '',
          timestamp: 0,
          entropy: ''
        },
        error: `Invalid subnet ID format: ${subnetId}`
      };
      generations.push(errorGen);
      errors.push(`Generation ${i + 1}: Invalid subnet ID format: ${subnetId}`);
      continue;
    }
    
    const generation = generateULA(subnetId);
    generations.push(generation);
    
    if (!generation.isValid && generation.error) {
      errors.push(`Generation ${i + 1}: ${generation.error}`);
    }
  }
  
  const successfulGenerations = generations.filter(g => g.isValid).length;
  
  return {
    generations,
    summary: {
      totalRequests: count,
      successfulGenerations,
      failedGenerations: count - successfulGenerations
    },
    errors
  };
}

/* Parse ULA address and extract components */
export function parseULA(ula: string): {
  isValid: boolean;
  prefix?: string;
  globalID?: string;
  subnetID?: string;
  interfaceID?: string;
  error?: string;
} {
  try {
    // Clean and validate input
    const cleanULA = ula.trim().toLowerCase();
    
    // Check if it starts with fd (ULA prefix)
    if (!cleanULA.startsWith('fd')) {
      return {
        isValid: false,
        error: 'Not a valid ULA address (must start with fd)'
      };
    }
    
    // Remove prefix and split by colons
    const withoutPrefix = cleanULA.substring(2);
    const parts = withoutPrefix.split(':');
    
    if (parts.length < 4) {
      return {
        isValid: false,
        error: 'Invalid ULA format'
      };
    }
    
    // Extract components
    const globalIDParts = parts.slice(0, 2).join('');
    const subnetID = parts[2];
    const interfaceID = parts.slice(3).join(':');
    
    return {
      isValid: true,
      prefix: 'fd',
      globalID: globalIDParts.match(/.{4}/g)?.join(':') || '',
      subnetID,
      interfaceID
    };
    
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown parsing error'
    };
  }
}