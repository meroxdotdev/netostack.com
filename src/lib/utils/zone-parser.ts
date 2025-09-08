export interface ResourceRecord {
  owner: string;
  ttl?: number;
  class: string;
  type: string;
  rdata: string;
  line?: number;
  raw?: string;
}

export interface ParsedZone {
  records: ResourceRecord[];
  errors: ParseError[];
  warnings: ParseWarning[];
  soa?: ResourceRecord;
  defaultTTL?: number;
  origin?: string;
}

export interface ParseError {
  line: number;
  message: string;
  severity: 'error' | 'warning';
}

export interface ParseWarning extends ParseError {
  severity: 'warning';
}

export interface ZoneStats {
  totalRecords: number;
  recordsByType: Record<string, number>;
  ttlDistribution: Record<number, number>;
  nameDepths: {
    min: number;
    max: number;
    average: number;
  };
  largestRecord: {
    record: ResourceRecord;
    size: number;
  };
  longestName: {
    name: string;
    length: number;
  };
  sanityChecks: {
    hasSoa: boolean;
    hasNs: boolean;
    duplicates: ResourceRecord[];
    orphanedGlue: ResourceRecord[];
  };
}

export interface ZoneDiff {
  added: ResourceRecord[];
  removed: ResourceRecord[];
  changed: Array<{
    before: ResourceRecord;
    after: ResourceRecord;
  }>;
  unchanged: ResourceRecord[];
}

export interface NameLengthViolation {
  name: string;
  type: 'label' | 'fqdn';
  length: number;
  limit: number;
  labels?: string[];
}

// Constants
const MAX_LABEL_LENGTH = 63;
const MAX_FQDN_LENGTH = 255;
const DEFAULT_CLASS = 'IN';
const DEFAULT_TTL = 3600;

export function parseZoneFile(content: string): ParsedZone {
  const lines = content.split('\n');
  const records: ResourceRecord[] = [];
  const errors: ParseError[] = [];
  const warnings: ParseWarning[] = [];
  
  let currentOrigin = '';
  let defaultTTL = DEFAULT_TTL;
  let lastOwner = '';
  let soa: ResourceRecord | undefined;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineNum = i + 1;

    // Skip empty lines and comments
    if (!line || line.startsWith(';')) continue;

    try {
      // Handle $ORIGIN directive
      if (line.startsWith('$ORIGIN')) {
        const match = line.match(/^\$ORIGIN\s+(\S+)/);
        if (match) {
          currentOrigin = match[1];
          if (!currentOrigin.endsWith('.')) {
            currentOrigin += '.';
          }
        }
        continue;
      }

      // Handle $TTL directive
      if (line.startsWith('$TTL')) {
        const match = line.match(/^\$TTL\s+(\d+)/);
        if (match) {
          defaultTTL = parseInt(match[1]);
        }
        continue;
      }

      // Parse resource record
      const record = parseResourceRecord(line, lastOwner, defaultTTL, currentOrigin, lineNum);
      if (record) {
        records.push(record);
        lastOwner = record.owner;
        
        if (record.type === 'SOA' && !soa) {
          soa = record;
        }
      }
    } catch (error) {
      errors.push({
        line: lineNum,
        message: error instanceof Error ? error.message : 'Unknown parsing error',
        severity: 'error'
      });
    }
  }

  // Add warnings for common issues
  if (!soa) {
    warnings.push({
      line: 0,
      message: 'No SOA record found in zone',
      severity: 'warning'
    });
  }

  return {
    records,
    errors,
    warnings,
    soa,
    defaultTTL,
    origin: currentOrigin
  };
}

function parseResourceRecord(
  line: string,
  lastOwner: string,
  defaultTTL: number,
  origin: string,
  lineNum: number
): ResourceRecord | null {
  // Remove comments
  const commentIndex = line.indexOf(';');
  const cleanLine = commentIndex >= 0 ? line.substring(0, commentIndex).trim() : line;
  
  if (!cleanLine) return null;

  const parts = cleanLine.split(/\s+/);
  if (parts.length < 3) return null;

  let owner = parts[0];
  let ttl: number | undefined;
  let recordClass = DEFAULT_CLASS;
  let type: string;
  let rdata: string;
  let partIndex = 1;

  // Handle implicit owner (blank or continuation)
  if (owner === '' || owner === '@') {
    owner = lastOwner || origin;
  } else if (!owner.endsWith('.') && origin) {
    owner = owner + '.' + origin;
  }

  // Parse TTL (optional)
  if (/^\d+$/.test(parts[partIndex])) {
    ttl = parseInt(parts[partIndex]);
    partIndex++;
  }

  // Parse class (optional, usually IN)
  if (parts[partIndex] && ['IN', 'CH', 'HS'].includes(parts[partIndex].toUpperCase())) {
    recordClass = parts[partIndex].toUpperCase();
    partIndex++;
  }

  // Parse type (required)
  if (partIndex >= parts.length) return null;
  type = parts[partIndex].toUpperCase();
  partIndex++;

  // Parse RDATA (rest of the line)
  rdata = parts.slice(partIndex).join(' ');

  return {
    owner,
    ttl: ttl || defaultTTL,
    class: recordClass,
    type,
    rdata,
    line: lineNum,
    raw: line
  };
}

export function normalizeZone(zone: ParsedZone): ParsedZone {
  const normalizedRecords = [...zone.records]
    .sort((a, b) => {
      // Sort by owner name first
      if (a.owner !== b.owner) {
        return a.owner.localeCompare(b.owner);
      }
      // Then by type
      if (a.type !== b.type) {
        return a.type.localeCompare(b.type);
      }
      // Then by RDATA
      return a.rdata.localeCompare(b.rdata);
    })
    // Remove duplicates
    .filter((record, index, array) => {
      if (index === 0) return true;
      const prev = array[index - 1];
      return !(
        record.owner === prev.owner &&
        record.type === prev.type &&
        record.rdata === prev.rdata
      );
    });

  return {
    ...zone,
    records: normalizedRecords
  };
}

export function generateZoneStats(zone: ParsedZone): ZoneStats {
  const recordsByType: Record<string, number> = {};
  const ttlDistribution: Record<number, number> = {};
  const nameLengths: number[] = [];
  
  let largestRecord = { record: zone.records[0], size: 0 };
  let longestName = { name: '', length: 0 };

  for (const record of zone.records) {
    // Count by type
    recordsByType[record.type] = (recordsByType[record.type] || 0) + 1;
    
    // Count TTL distribution
    const ttl = record.ttl || 0;
    ttlDistribution[ttl] = (ttlDistribution[ttl] || 0) + 1;
    
    // Track name lengths and depths
    const nameLength = record.owner.length;
    nameLengths.push(nameLength);
    
    if (nameLength > longestName.length) {
      longestName = { name: record.owner, length: nameLength };
    }
    
    // Track largest record
    const recordSize = (record.raw || '').length;
    if (recordSize > largestRecord.size) {
      largestRecord = { record, size: recordSize };
    }
  }

  // Calculate name depth statistics
  const nameDepths = {
    min: Math.min(...nameLengths),
    max: Math.max(...nameLengths),
    average: nameLengths.reduce((sum, len) => sum + len, 0) / nameLengths.length || 0
  };

  // Find duplicates
  const duplicates: ResourceRecord[] = [];
  const seen = new Set<string>();
  
  for (const record of zone.records) {
    const key = `${record.owner}:${record.type}:${record.rdata}`;
    if (seen.has(key)) {
      duplicates.push(record);
    } else {
      seen.add(key);
    }
  }

  // Basic sanity checks
  const hasSoa = zone.records.some(r => r.type === 'SOA');
  const hasNs = zone.records.some(r => r.type === 'NS');
  
  // Find orphaned glue records (A/AAAA records for NS that don't exist)
  const nsTargets = new Set(
    zone.records
      .filter(r => r.type === 'NS')
      .map(r => r.rdata.trim())
  );
  
  const orphanedGlue = zone.records.filter(record => {
    return (record.type === 'A' || record.type === 'AAAA') &&
           !nsTargets.has(record.owner);
  });

  return {
    totalRecords: zone.records.length,
    recordsByType,
    ttlDistribution,
    nameDepths,
    largestRecord,
    longestName,
    sanityChecks: {
      hasSoa,
      hasNs,
      duplicates,
      orphanedGlue
    }
  };
}

export function compareZones(oldZone: ParsedZone, newZone: ParsedZone): ZoneDiff {
  const oldRecords = new Map<string, ResourceRecord>();
  const newRecords = new Map<string, ResourceRecord>();
  
  // Create maps for easy comparison
  oldZone.records.forEach(record => {
    const key = `${record.owner}:${record.type}`;
    oldRecords.set(key, record);
  });
  
  newZone.records.forEach(record => {
    const key = `${record.owner}:${record.type}`;
    newRecords.set(key, record);
  });
  
  const added: ResourceRecord[] = [];
  const removed: ResourceRecord[] = [];
  const changed: Array<{ before: ResourceRecord; after: ResourceRecord }> = [];
  const unchanged: ResourceRecord[] = [];
  
  // Find added and changed records
  newRecords.forEach((newRecord, key) => {
    const oldRecord = oldRecords.get(key);
    if (!oldRecord) {
      added.push(newRecord);
    } else if (oldRecord.rdata !== newRecord.rdata || oldRecord.ttl !== newRecord.ttl) {
      changed.push({ before: oldRecord, after: newRecord });
    } else {
      unchanged.push(newRecord);
    }
  });
  
  // Find removed records
  oldRecords.forEach((oldRecord, key) => {
    if (!newRecords.has(key)) {
      removed.push(oldRecord);
    }
  });
  
  return {
    added,
    removed,
    changed,
    unchanged
  };
}

export function checkNameLengths(zone: ParsedZone): NameLengthViolation[] {
  const violations: NameLengthViolation[] = [];
  const checkedNames = new Set<string>();
  
  for (const record of zone.records) {
    const name = record.owner;
    
    if (checkedNames.has(name)) continue;
    checkedNames.add(name);
    
    // Check FQDN length
    if (name.length > MAX_FQDN_LENGTH) {
      violations.push({
        name,
        type: 'fqdn',
        length: name.length,
        limit: MAX_FQDN_LENGTH
      });
    }
    
    // Check individual label lengths
    const labels = name.split('.');
    for (const label of labels) {
      if (label.length > MAX_LABEL_LENGTH) {
        violations.push({
          name,
          type: 'label',
          length: label.length,
          limit: MAX_LABEL_LENGTH,
          labels
        });
        break; // Only report once per name
      }
    }
  }
  
  return violations;
}

export function formatZoneFile(zone: ParsedZone): string {
  const lines: string[] = [];
  
  // Add directives
  if (zone.origin) {
    lines.push(`$ORIGIN ${zone.origin}`);
  }
  
  if (zone.defaultTTL) {
    lines.push(`$TTL ${zone.defaultTTL}`);
  }
  
  if (lines.length > 0) {
    lines.push(''); // Empty line after directives
  }
  
  // Add records
  let lastOwner = '';
  for (const record of zone.records) {
    const owner = record.owner === lastOwner ? '' : record.owner;
    const ttl = record.ttl === zone.defaultTTL ? '' : record.ttl?.toString() || '';
    const parts = [owner, ttl, record.class, record.type, record.rdata].filter(Boolean);
    lines.push(parts.join('\t'));
    lastOwner = record.owner;
  }
  
  return lines.join('\n');
}