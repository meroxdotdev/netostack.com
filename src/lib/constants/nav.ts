import { resolve } from '$app/paths';
import { site, author, license as _license } from '$lib/constants/site';

// Helper function to create paths with base path support
function makePath(path: string): string {
  return resolve(path as any) || path;
}

export type NavItem = {
  href: string;
  label: string;
  description?: string;
  icon?: string;
  keywords?: string[];
};

export type NavGroup = {
  title: string;
  description?: string;
  items: NavItem[];
};

// Individual standalone pages
export const STANDALONE_PAGES: NavItem[] = [
  {
    href: makePath('/bookmarks'),
    label: 'Bookmarks',
    description: 'Saved network calculations and frequently used tools',
    keywords: ['bookmarks', 'saved', 'favorites', 'shortcuts', 'calculations'],
  },
  {
    href: makePath('/offline'),
    label: 'Offline',
    description: 'Offline mode and cached calculations',
    keywords: ['offline', 'cache', 'no-internet', 'local'],
  },
];

export const TOP_NAV: NavItem[] = [
  {
    href: makePath('/subnetting'),
    label: 'Subnetting',
    description: 'Subnet calculators and network planning tools for IPv4, IPv6, VLSM, and supernetting',
    keywords: [
      'subnet',
      'calculator',
      'subnetting',
      'network',
      'planning',
      'ipv4',
      'ipv6',
      'vlsm',
      'supernet',
      'netmask',
      'cidr',
      'broadcast',
      'hosts',
      'addressing',
      'allocation',
    ],
  },
  {
    href: makePath('/cidr'),
    label: 'CIDR',
    description: 'CIDR tools and converters for network analysis and optimization',
    keywords: [
      'cidr',
      'subnet',
      'mask',
      'converter',
      'summarizer',
      'splitter',
      'set operations',
      'aggregation',
      'deaggregation',
      'prefix',
      'notation',
      'blocks',
      'ranges',
      'supernet',
      'allocation',
    ],
  },
  {
    href: makePath('/ip-address-convertor'),
    label: 'IP Tools',
    description: 'IP address converters, validators, generators, and format transformation tools',
    keywords: [
      'ip',
      'address',
      'converter',
      'validator',
      'generator',
      'format',
      'binary',
      'hex',
      'decimal',
      'ipv4',
      'ipv6',
      'distance',
      'random',
      'regex',
      'enumerate',
      'validation',
      'transformation',
    ],
  },
  {
    href: makePath('/dns'),
    label: 'DNS Tools',
    description: 'DNS record generators, validators, zone tools, and DNSSEC utilities',
    keywords: [
      'dns',
      'records',
      'generator',
      'validator',
      'zone',
      'dnssec',
      'ptr',
      'reverse',
      'a record',
      'aaaa',
      'cname',
      'mx',
      'txt',
      'srv',
      'caa',
      'spf',
      'dmarc',
      'dkim',
      'soa',
      'ns',
    ],
  },
  {
    href: makePath('/diagnostics'),
    label: 'Lookups',
    description: 'Network diagnostics, DNS lookups, HTTP analysis, TLS testing, and connectivity checks',
    keywords: [
      'diagnostics',
      'lookup',
      'dns',
      'http',
      'tls',
      'network',
      'connectivity',
      'ping',
      'port',
      'check',
      'security',
      'headers',
      'certificate',
      'propagation',
      'rdap',
      'whois',
      'analysis',
    ],
  },
  {
    href: makePath('/reference'),
    label: 'Ref',
    description: 'Networking reference guides, explanations, and quick lookup tables',
    keywords: [
      'reference',
      'guide',
      'explanation',
      'networking',
      'fundamentals',
      'cidr',
      'vlsm',
      'ipv6',
      'dns',
      'protocols',
      'ports',
      'asn',
      'icmp',
      'arp',
      'ndp',
      'multicast',
      'private',
      'public',
    ],
  },
];

// Sections that have sub-pages (drives the conditional SubHeader)
export const SUB_NAV: Record<string, (NavItem | NavGroup)[]> = {
  '/subnetting': [
    {
      href: makePath('/subnetting/ipv4-subnet-calculator'),
      label: 'IPv4 Subnet Calculator',
      description:
        'Calculate subnet information, network addresses, broadcast addresses, and host ranges with visual network analysis',
      icon: 'subnet-calculator',
      keywords: ['subnet', 'calculator', 'ipv4', 'network', 'broadcast', 'hosts', 'cidr', 'netmask'],
    },
    {
      href: makePath('/subnetting/ipv6-subnet-calculator'),
      label: 'IPv6 Subnet Calculator',
      description: 'Calculate IPv6 subnets with 128-bit addressing and modern network prefix planning',
      icon: 'ipv6-subnet-calculator',
      keywords: ['subnet', 'calculator', 'ipv6', 'network', 'prefix', '128-bit', 'addressing'],
    },
    {
      href: makePath('/subnetting/vlsm-calculator'),
      label: 'VLSM Calculator',
      description:
        'Variable Length Subnet Mask calculator to break networks into multiple smaller subnets with optimal allocation',
      icon: 'vlsm-calculator',
      keywords: ['vlsm', 'variable', 'length', 'subnet', 'mask', 'calculator', 'subnets', 'allocation'],
    },
    {
      href: makePath('/subnetting/supernet-calculator'),
      label: 'Supernet Calculator',
      description:
        'Aggregate multiple networks into supernets for route summarization and efficient routing table management',
      icon: 'supernet-calculator',
      keywords: ['supernet', 'calculator', 'aggregate', 'route', 'summarization', 'routing', 'table'],
    },
    {
      href: makePath('/subnetting/planner'),
      label: 'Subnet Planner',
      description: 'Design VLSM networks with drag-and-drop subnet planning and optimize address allocation strategies',
      icon: 'subnet-planner',
      keywords: ['subnet', 'planner', 'design', 'vlsm', 'networks', 'planning', 'allocation'],
    },
  ],
  '/cidr': [
    {
      href: makePath('/cidr/mask-converter'),
      title: 'CIDR Masks',
      description: 'Convert between CIDR notation and subnet masks',
      items: [
        {
          href: makePath('/cidr/mask-converter/cidr-to-subnet-mask'),
          label: 'CIDR → Mask',
          description: 'Convert CIDR notation (e.g. /24) to subnet mask format (255.255.255.0)',
          icon: 'cidr-convertor',
          keywords: ['cidr', 'convert', 'converter', 'mask', 'subnet', 'notation', '/24', '255.255.255.0'],
        },
        {
          href: makePath('/cidr/mask-converter/subnet-mask-to-cidr'),
          label: 'Mask → CIDR',
          description: 'Convert subnet mask format (255.255.255.0) to CIDR notation (/24)',
          icon: 'cidr-convertor-mask',
          keywords: ['mask', 'convert', 'converter', 'cidr', 'subnet', 'notation', '/24', '255.255.255.0'],
        },
      ],
    },
    {
      href: makePath('/cidr/summarize'),
      label: 'CIDR Summarizer',
      description: 'Optimize mixed IP addresses, CIDR blocks, and ranges into minimal CIDR prefixes',
      icon: 'cidr-summarize',
      keywords: ['cidr', 'summarize', 'summarizer', 'optimize', 'ip', 'blocks', 'ranges', 'prefixes'],
    },
    {
      href: makePath('/cidr/split'),
      label: 'CIDR Split',
      description: 'Split a network into N equal child subnets or to a target prefix length',
      icon: 'subnet-splitter',
      keywords: ['cidr', 'split', 'splitter', 'network', 'subnets', 'child', 'prefix'],
    },
    {
      href: makePath('/cidr/next-available'),
      label: 'Next Available Subnet',
      description: 'Find available subnets from pools minus allocations with first-fit or best-fit policies',
      icon: 'next-available-subnet',
      keywords: ['next', 'available', 'subnet', 'pools', 'allocations', 'first-fit', 'best-fit'],
    },
    {
      href: makePath('/cidr/gaps'),
      label: 'Free Space Finder',
      description: 'List all free blocks in pool CIDRs minus allocations, filterable by target prefix length',
      icon: 'cidr-gaps',
      keywords: ['free', 'space', 'gaps', 'finder', 'blocks', 'pools', 'allocations', 'prefix'],
    },
    {
      href: makePath('/cidr/deaggregate'),
      label: 'CIDR Deaggregate',
      description: 'Decompose CIDR blocks and ranges into uniform target prefix subnets (e.g., break into /24s)',
      icon: 'cidr-deaggregate',
      keywords: ['cidr', 'deaggregate', 'decompose', 'break', 'uniform', 'prefix', 'subnets', 'split'],
    },
    {
      href: makePath('/cidr/compare'),
      label: 'CIDR Compare',
      description:
        'Compare two lists of CIDR blocks to identify added, removed, and unchanged entries after normalization',
      icon: 'cidr-compare',
      keywords: ['cidr', 'compare', 'diff', 'audit', 'added', 'removed', 'unchanged', 'normalization'],
    },
    {
      href: makePath('/cidr/allocator'),
      label: 'CIDR Allocator',
      description: 'Pack requested subnet sizes into network pools using bin-packing algorithms (first-fit, best-fit)',
      icon: 'cidr-allocator',
      keywords: ['cidr', 'allocator', 'bin-packing', 'first-fit', 'best-fit', 'subnet', 'allocation', 'packing'],
    },
    {
      href: makePath('/cidr/alignment'),
      label: 'CIDR Alignment',
      description: 'Check if IP addresses and ranges align to CIDR prefix boundaries with optimization suggestions',
      icon: 'cidr-alignment',
      keywords: [
        'cidr',
        'alignment',
        'check',
        'boundary',
        'prefix',
        'optimization',
        'network',
        'boundary',
        'validation',
        'subnet',
        'addressing',
        'efficiency',
      ],
    },
    {
      href: makePath('/cidr/wildcard-mask'),
      label: 'Wildcard Mask Converter',
      description: 'Convert between CIDR, subnet masks, and wildcard masks with ACL rule generation',
      icon: 'wildcard-mask',
      keywords: [
        'wildcard',
        'mask',
        'converter',
        'acl',
        'access',
        'control',
        'list',
        'cisco',
        'juniper',
        'subnet',
        'cidr',
        'netmask',
        'inverse',
        'routing',
        'firewall',
      ],
    },
    {
      href: makePath('/cidr/set-operations'),
      title: 'Set Operations',
      items: [
        {
          href: makePath('/cidr/set-operations/diff'),
          label: 'Difference (A - B)',
          description: 'Compute A - B set operations on CIDR blocks, ranges, and IP addresses',
          icon: 'diff',
          keywords: [
            'set',
            'operations',
            'difference',
            'subtract',
            'exclude',
            'minus',
            'cidr',
            'blocks',
            'ranges',
            'ip',
            'addresses',
            'network',
            'math',
            'complement',
          ],
        },
        {
          href: makePath('/cidr/set-operations/overlap'),
          label: 'Overlap (A ∩ B)',
          description: 'Detect intersections between two sets of IP addresses and ranges',
          icon: 'intersection',
          keywords: [
            'set',
            'operations',
            'overlap',
            'intersection',
            'intersect',
            'common',
            'shared',
            'cidr',
            'blocks',
            'ranges',
            'conflict',
            'collision',
            'detection',
          ],
        },
        {
          href: makePath('/cidr/set-operations/contains'),
          label: 'Contains (A ⊆ B)',
          description: 'Check if one set fully contains another with detailed containment analysis',
          icon: 'containment',
          keywords: [
            'set',
            'operations',
            'contains',
            'subset',
            'superset',
            'containment',
            'analysis',
            'inclusion',
            'hierarchy',
            'cidr',
            'blocks',
            'ranges',
            'network',
            'topology',
          ],
        },
      ],
    },
  ],
  '/ip-address-convertor': [
    {
      title: 'Number Formats',
      items: [
        {
          href: makePath('/ip-address-convertor/representations'),
          label: 'Format Representations',
          description: 'Convert IP addresses between decimal, binary, hexadecimal, and octal number systems',
          icon: 'ip-convertor',
          keywords: [
            'ip',
            'convert',
            'converter',
            'format',
            'decimal',
            'binary',
            'hexadecimal',
            'octal',
            'representation',
          ],
        },
      ],
    },
    {
      title: 'Address Calculations',
      items: [
        {
          href: makePath('/ip-address-convertor/distance'),
          label: 'IP Distance Calculator',
          description: 'Calculate the number of addresses between two IPs with inclusive/exclusive counting',
          icon: 'ip-distance',
          keywords: ['ip', 'distance', 'calculator', 'addresses', 'between', 'counting', 'range'],
        },
        {
          href: makePath('/ip-address-convertor/nth-ip'),
          label: 'Nth IP Calculator',
          description: 'Resolve the IP address at a specific index within networks and ranges with offset support',
          icon: 'nth-ip',
          keywords: [
            'nth',
            'ip',
            'calculator',
            'index',
            'offset',
            'position',
            'network',
            'range',
            'addressing',
            'sequence',
            'cidr',
            'subnet',
            'host',
            'enumerate',
          ],
        },
        {
          href: makePath('/ip-address-convertor/random'),
          label: 'Random IP Generator',
          description: 'Generate random IP addresses from networks with uniqueness control and seeded randomness',
          icon: 'random-ip',
          keywords: ['random', 'ip', 'generator', 'generate', 'addresses', 'networks', 'seeded'],
        },
        {
          href: makePath('/ip-address-convertor/regex'),
          label: 'IP Regex Generator',
          description:
            'Generate safe regular expressions for matching IPv4 and IPv6 addresses with customizable validation options',
          icon: 'ip-regex-generator',
          keywords: ['regex', 'regular', 'expression', 'ipv4', 'ipv6', 'pattern', 'matching', 'validation'],
        },
        {
          href: makePath('/ip-address-convertor/validator'),
          label: 'IP Address Validator',
          description: 'Validate IPv4 and IPv6 addresses with detailed error analysis and format checking',
          icon: 'ip-validator',
          keywords: ['ip', 'validator', 'validation', 'check', 'verify', 'ipv4', 'ipv6', 'format', 'address'],
        },
        {
          href: makePath('/ip-address-convertor/enumerate'),
          label: 'IP Enumerate',
          description: 'Safely enumerate all IP addresses in CIDR blocks and ranges with CSV/JSON export',
          icon: 'ip-enumerate',
          keywords: ['enumerate', 'list', 'generate', 'cidr', 'range', 'all', 'ips', 'export', 'csv', 'json'],
        },
      ],
    },
    {
      title: 'IPv6 Notation',
      items: [
        {
          href: makePath('/ip-address-convertor/notation/ipv6-expand'),
          label: 'IPv6 Expand',
          description: 'Expand compressed IPv6 addresses to full 128-bit hexadecimal format',
          icon: 'ipv6-expand',
          keywords: [
            'ipv6',
            'expand',
            'expansion',
            'full',
            'format',
            '128-bit',
            'hexadecimal',
            'compressed',
            'double-colon',
            'address',
            'canonical',
            'notation',
          ],
        },
        {
          href: makePath('/ip-address-convertor/notation/ipv6-compress'),
          label: 'IPv6 Compress',
          description: 'Compress expanded IPv6 addresses using :: notation and removing leading zeros',
          icon: 'ipv6-compress',
          keywords: [
            'ipv6',
            'compress',
            'compression',
            'shorten',
            'double-colon',
            'notation',
            'leading',
            'zeros',
            'compact',
            'format',
            'address',
            'optimization',
          ],
        },
        {
          href: makePath('/ip-address-convertor/notation/normalize'),
          label: 'IPv6 Normalizer',
          description: 'Normalize IPv6 addresses to RFC 5952 canonical form with step-by-step transformation',
          icon: 'ip-normalize',
          keywords: [
            'ipv6',
            'normalize',
            'normalizer',
            'canonical',
            'form',
            'rfc',
            '5952',
            'standard',
            'format',
            'address',
            'transformation',
            'consistent',
          ],
        },
        {
          href: makePath('/ip-address-convertor/notation/zone-id'),
          label: 'IPv6 Zone ID Handler',
          description: 'Process IPv6 addresses with zone identifiers for link-local and multicast addresses',
          icon: 'zone-id-handler',
          keywords: [
            'ipv6',
            'zone',
            'id',
            'identifier',
            'link-local',
            'multicast',
            'scope',
            'interface',
            'fe80',
            'ff02',
            'address',
            'scoped',
          ],
        },
        {
          href: makePath('/ip-address-convertor/ipv6/solicited-node'),
          label: 'IPv6 Solicited-Node',
          description: 'Compute solicited-node multicast addresses from IPv6 unicast for Neighbor Discovery Protocol',
          icon: 'ipv6-solicited-node',
          keywords: ['ipv6', 'solicited-node', 'multicast', 'ndp', 'neighbor', 'discovery', 'ff02::1:ff'],
        },
        {
          href: makePath('/ip-address-convertor/ipv6/teredo'),
          label: 'IPv6 Teredo Parser',
          description:
            'Parse Teredo IPv6 addresses to extract server IPv4, flags, mapped port, and client IPv4 components',
          icon: 'ipv6-teredo',
          keywords: ['ipv6', 'teredo', 'tunnel', '2001:0000', 'parse', 'server', 'client', 'port', 'flags'],
        },
        {
          href: makePath('/ip-address-convertor/ipv6/nat64'),
          label: 'IPv6 NAT64 Translator',
          description: 'Translate between IPv4 and IPv6 addresses using NAT64 prefix (64:ff9b::/96 or custom)',
          icon: 'ipv6-nat64',
          keywords: ['ipv6', 'nat64', 'translate', 'ipv4', 'prefix', '64:ff9b', 'converter', 'translation'],
        },
      ],
    },
    {
      title: 'IP Families',
      items: [
        {
          href: makePath('/ip-address-convertor/families/ipv4-to-ipv6'),
          label: 'IPv4 → IPv6',
          description: 'Convert IPv4 addresses to IPv6 format using IPv4-mapped IPv6 addressing',
          icon: 'ipv4-ipv6',
          keywords: [
            'ipv4',
            'ipv6',
            'convert',
            'converter',
            'mapped',
            'family',
            'translation',
            'dual-stack',
            'transition',
            'ffff',
            'embedding',
            'address',
          ],
        },
        {
          href: makePath('/ip-address-convertor/families/ipv6-to-ipv4'),
          label: 'IPv6 → IPv4',
          description: 'Extract IPv4 addresses from IPv4-mapped IPv6 addresses',
          icon: 'ipv6-ipv4',
          keywords: [
            'ipv6',
            'ipv4',
            'extract',
            'extractor',
            'mapped',
            'family',
            'reverse',
            'dual-stack',
            'transition',
            'ffff',
            'embedded',
            'address',
          ],
        },
      ],
    },
    {
      title: 'Address Generation',
      items: [
        {
          href: makePath('/ip-address-convertor/eui64'),
          label: 'EUI-64 Converter',
          description: 'Convert between MAC addresses and IPv6 EUI-64 interface identifiers with IPv6 generation',
          icon: 'eui64-converter',
          keywords: [
            'eui-64',
            'eui64',
            'mac',
            'address',
            'converter',
            'ipv6',
            'interface',
            'identifier',
            'slaac',
            'auto-configuration',
            'link-layer',
            'ethernet',
          ],
        },
        {
          href: makePath('/ip-address-convertor/ula-generator'),
          label: 'ULA Generator',
          description: 'Generate RFC 4193 Unique Local Addresses with cryptographically secure Global IDs',
          icon: 'ula-generator',
          keywords: [
            'ula',
            'unique',
            'local',
            'address',
            'generator',
            'rfc',
            '4193',
            'global',
            'id',
            'cryptographic',
            'private',
            'fc00',
            'fd00',
            'ipv6',
          ],
        },
      ],
    },
  ],
  '/dns': [
    {
      href: makePath('/dns/generators'),
      title: 'DNS Generators',
      description: 'DNS record generators and zone file tools',
      items: [
        {
          href: makePath('/dns/generators/ptr-generator'),
          label: 'PTR Generator',
          description: 'Generate PTR records for reverse DNS zones',
          icon: 'ptr-generator',
          keywords: ['ptr', 'reverse', 'dns', 'generator'],
        },
      ],
    },
    {
      title: 'Reverse DNS',
      items: [
        {
          href: makePath('/dns/reverse/ptr-generator'),
          label: 'PTR Generator',
          description: 'Convert IPs/CIDRs to PTR names (in-addr.arpa / ip6.arpa) and example zone lines',
          icon: 'ptr-generator',
          keywords: ['ptr', 'generator', 'reverse', 'dns', 'in-addr.arpa', 'ip6.arpa', 'cidr', 'zone'],
        },
        {
          href: makePath('/dns/reverse/zone-generator'),
          label: 'Reverse Zone Generator',
          description: 'Generate full reverse zone files from CIDR + hostname template',
          icon: 'dns-reverse-zones-gen',
          keywords: ['reverse', 'zone', 'generator', 'cidr', 'hostname', 'template', 'zone', 'file', 'soa', 'ns'],
        },
        {
          href: makePath('/dns/reverse/reverse-zones'),
          label: 'Reverse Zones Calculator',
          description: 'Minimal set of reverse zones needed to delegate a CIDR (v4 & v6 nibble math)',
          icon: 'dns-reverse-zones-calc',
          keywords: ['reverse', 'zones', 'calculator', 'delegation', 'cidr', 'nibble', 'octet', 'boundaries'],
        },
        {
          href: makePath('/dns/reverse/ptr-sweep-planner'),
          label: 'PTR Sweep Planner',
          description: 'Plan PTR coverage for a block; list missing/extra PTRs against naming pattern',
          icon: 'dns-ptr-sweep',
          keywords: ['ptr', 'sweep', 'planner', 'coverage', 'missing', 'extra', 'naming', 'pattern', 'analysis'],
        },
      ],
    },
    {
      title: 'Record Generators',
      items: [
        {
          href: makePath('/dns/generators/a-aaaa-bulk'),
          label: 'A/AAAA Bulk Generator',
          description: 'Bulk create A and AAAA record sets from IP lists with TTL and RRset controls',
          icon: 'dns-a-records',
          keywords: ['dns', 'A record', 'AAAA', 'records', 'bulk', 'generator', 'ttl', 'rrset'],
        },
        {
          href: makePath('/dns/generators/cname-builder'),
          label: 'CNAME Builder',
          description: 'Build valid CNAME records with loop detection and self-target checks',
          icon: 'dns-cname',
          keywords: ['dns', 'cname', 'canonical', 'alias', 'builder', 'loop', 'detection', 'validation'],
        },
        {
          href: makePath('/dns/generators/mx-planner'),
          label: 'MX Record Planner',
          description: 'Plan MX record priorities with fallback guidance and sample configurations',
          icon: 'dns-mx',
          keywords: ['dns', 'mx', 'mail', 'exchange', 'priority', 'fallback', 'planner', 'email'],
        },
        {
          href: makePath('/dns/generators/srv-builder'),
          label: 'SRV Record Builder',
          description: 'Compose SRV records with service, protocol, priority, weight, port, and target validation',
          icon: 'dns-srv',
          keywords: ['dns', 'srv', 'service', 'protocol', 'priority', 'weight', 'port', 'target', 'builder'],
        },
        {
          href: makePath('/dns/generators/txt-escape'),
          label: 'TXT Record Escape Tool',
          description: 'Safely escape and split TXT record strings into 255-character chunks with validation',
          icon: 'dns-txt',
          keywords: ['dns', 'txt', 'escape', 'split', 'chunks', 'validation', 'text', 'records'],
        },
        {
          href: makePath('/dns/generators/spf-builder'),
          label: 'SPF Policy Builder',
          description: 'Craft SPF policies with mechanism validation, qualifier control, and DNS lookup counting',
          icon: 'dns-spf',
          keywords: ['dns', 'spf', 'policy', 'sender', 'framework', 'mechanisms', 'qualifiers', 'validation'],
        },
        {
          href: makePath('/dns/generators/dkim-keygen'),
          label: 'DKIM Key Generator',
          description: 'Generate DKIM RSA keypairs (1024/2048-bit) with selectors and DNS TXT records',
          icon: 'dns-dkim',
          keywords: ['dns', 'dkim', 'keys', 'rsa', 'domainkeys', 'selector', 'txt', 'records', 'generator'],
        },
        {
          href: makePath('/dns/generators/dmarc-builder'),
          label: 'DMARC Policy Builder',
          description: 'Create DMARC policies with alignment options, reporting addresses, and failure handling',
          icon: 'dns-dmarc',
          keywords: ['dns', 'dmarc', 'policy', 'alignment', 'reporting', 'quarantine', 'reject', 'builder'],
        },
        {
          href: makePath('/dns/generators/caa-builder'),
          label: 'CAA Record Builder',
          description: 'Build CAA records for certificate authority authorization with misconfiguration warnings',
          icon: 'dns-caa',
          keywords: ['dns', 'caa', 'certificate', 'authority', 'authorization', 'ssl', 'tls', 'builder'],
        },
        {
          href: makePath('/dns/generators/tlsa-generator'),
          label: 'TLSA Generator',
          description:
            'Create TLSA (DANE) records from certificates or hashes with usage, selector, and matching type options',
          icon: 'dns-tlsa',
          keywords: ['dns', 'tlsa', 'dane', 'certificate', 'hash', 'usage', 'selector', 'matching', 'tls', 'ssl'],
        },
        {
          href: makePath('/dns/generators/sshfp-generator'),
          label: 'SSHFP Generator',
          description:
            'Generate SSHFP records from SSH public keys or fingerprints with algorithm and fingerprint type selection',
          icon: 'dns-sshfp',
          keywords: ['dns', 'sshfp', 'ssh', 'public', 'key', 'fingerprint', 'algorithm', 'security'],
        },
        {
          href: makePath('/dns/generators/svcb-https-builder'),
          label: 'SVCB/HTTPS Builder',
          description:
            'Build SVCB and HTTPS resource records with service parameters like ALPN, port, and ECH configuration',
          icon: 'dns-svcb',
          keywords: ['dns', 'svcb', 'https', 'service', 'binding', 'alpn', 'port', 'ech', 'parameters'],
        },
        {
          href: makePath('/dns/generators/naptr-builder'),
          label: 'NAPTR Builder',
          description:
            'Construct NAPTR records for service discovery with order, preference, flags, service, regexp, and replacement fields',
          icon: 'dns-naptr',
          keywords: ['dns', 'naptr', 'service', 'discovery', 'order', 'preference', 'flags', 'regexp', 'replacement'],
        },
        {
          href: makePath('/dns/generators/loc-builder'),
          label: 'LOC Builder',
          description: 'Create LOC records from coordinates and convert between latitude/longitude and DNS LOC format',
          icon: 'dns-loc',
          keywords: ['dns', 'loc', 'location', 'coordinates', 'latitude', 'longitude', 'altitude', 'precision'],
        },
        {
          href: makePath('/dns/generators/rp-builder'),
          label: 'RP Builder',
          description: 'Generate RP (Responsible Person) records with mailbox and TXT domain name references',
          icon: 'dns-rp',
          keywords: ['dns', 'rp', 'responsible', 'person', 'mailbox', 'contact', 'txt', 'domain'],
        },
        {
          href: makePath('/dns/generators/idn-punycode'),
          label: 'IDN Punycode Converter',
          description: 'Convert Unicode domain names to Punycode and back with IDNA2008 normalization support',
          icon: 'dns-idn',
          keywords: ['dns', 'idn', 'punycode', 'unicode', 'domain', 'international', 'idna2008', 'normalization'],
        },
      ],
    },
    {
      title: 'DNS Utilities',
      items: [
        {
          href: makePath('/dns/record-validator'),
          label: 'DNS Record Validator',
          description:
            'Validate individual DNS resource record syntax (A/AAAA/CNAME/MX/TXT/SRV/CAA) with error detection',
          icon: 'dns-record-validator',
          keywords: [
            'dns',
            'record',
            'validator',
            'syntax',
            'A record',
            'AAAA',
            'CNAME',
            'MX',
            'TXT',
            'SRV',
            'CAA',
            'validation',
          ],
        },
        {
          href: makePath('/dns/ttl-calculator'),
          label: 'TTL Calculator',
          description: 'Humanize DNS TTL values and compute cache expiry times with recommendations',
          icon: 'dns-ttl',
          keywords: ['dns', 'ttl', 'time', 'live', 'cache', 'expiry', 'calculator', 'humanize', 'recommendations'],
        },
        {
          href: makePath('/dns/edns-size-estimator'),
          label: 'EDNS Size Estimator',
          description: 'Estimate DNS message size and UDP fragmentation risk with EDNS buffer recommendations',
          icon: 'dns-edns',
          keywords: ['dns', 'edns', 'message', 'size', 'udp', 'fragmentation', 'buffer', 'estimator', 'optimization'],
        },
        {
          href: makePath('/dns/label-normalizer'),
          label: 'DNS Label Normalizer',
          description: 'Normalize domain labels with homograph attack detection and script mixing warnings',
          icon: 'dns-label-normalize',
          keywords: [
            'dns',
            'label',
            'normalize',
            'domain',
            'homograph',
            'attack',
            'script',
            'mixing',
            'security',
            'idn',
          ],
        },
      ],
    },
    {
      title: 'Zone File Tools',
      items: [
        {
          href: makePath('/dns/zone/linter'),
          label: 'Zone Linter',
          description: 'Normalize and canonicalize BIND zone files with error checking and formatting',
          icon: 'dns-zone-linter',
          keywords: ['dns', 'zone', 'linter', 'normalize', 'canonicalize', 'bind', 'error', 'checking', 'format'],
        },
        {
          href: makePath('/dns/zone/diff'),
          label: 'Zone Diff',
          description: 'Compare two zone files and identify added, removed, and changed DNS records',
          icon: 'dns-zone-diff',
          keywords: ['dns', 'zone', 'diff', 'compare', 'changes', 'added', 'removed', 'modified', 'migration'],
        },
        {
          href: makePath('/dns/zone/stats'),
          label: 'Zone Statistics',
          description: 'Analyze zone file structure, record distribution, and configuration health',
          icon: 'dns-zone-stats',
          keywords: ['dns', 'zone', 'statistics', 'analysis', 'records', 'distribution', 'health', 'metrics'],
        },
        {
          href: makePath('/dns/zone/name-length-checker'),
          label: 'Name Length Checker',
          description: 'Validate DNS names against RFC length limits: 63 bytes per label, 255 bytes per FQDN',
          icon: 'dns-name-length',
          keywords: ['dns', 'name', 'length', 'validator', 'rfc', 'limits', 'label', 'fqdn', 'validation'],
        },
      ],
    },
    {
      title: 'DNSSEC Tools',
      items: [
        {
          href: makePath('/dns/dnssec/dnskey-tag'),
          label: 'DNSKEY Key Tag Calculator',
          description:
            'Compute the DNSKEY key tag from a DNSKEY RR (RFC 4034 algorithm) and display it alongside key meta',
          icon: 'dns-dnskey',
          keywords: ['dnssec', 'dnskey', 'key', 'tag', 'calculator', 'rfc', '4034', 'algorithm', 'ksk', 'zsk'],
        },
        {
          href: makePath('/dns/dnssec/ds-generator'),
          label: 'DS Record Generator',
          description:
            'Generate DS records (SHA-1/256/384) from a DNSKEY or public key, with copyable output for parent submission',
          icon: 'dns-ds',
          keywords: ['dnssec', 'ds', 'delegation', 'signer', 'sha1', 'sha256', 'sha384', 'parent', 'zone', 'trust'],
        },
        {
          href: makePath('/dns/dnssec/nsec3-hash'),
          label: 'NSEC3 Hash Calculator',
          description:
            'Calculate NSEC3 owner hashes for a name given salt, iterations, and algorithm, showing the hashed owner FQDN',
          icon: 'dns-nsec3',
          keywords: ['dnssec', 'nsec3', 'hash', 'calculator', 'salt', 'iterations', 'algorithm', 'sha1', 'privacy'],
        },
        {
          href: makePath('/dns/dnssec/cds-cdnskey-builder'),
          label: 'CDS/CDNSKEY Builder',
          description: 'Build CDS/CDNSKEY RRs from child DNSKEYs to enable automated DS updates at the parent',
          icon: 'dns-cds',
          keywords: [
            'dnssec',
            'cds',
            'cdnskey',
            'builder',
            'automated',
            'ds',
            'updates',
            'parent',
            'child',
            'delegation',
          ],
        },
        {
          href: makePath('/dns/dnssec/rrsig-planner'),
          label: 'RRSIG Planner',
          description:
            'Suggest RRSIG validity windows (inception/expiration) based on TTLs and desired overlap, with renewal lead-time guidance',
          icon: 'dns-rrsig',
          keywords: [
            'dnssec',
            'rrsig',
            'planner',
            'validity',
            'windows',
            'inception',
            'expiration',
            'ttl',
            'overlap',
            'renewal',
          ],
        },
      ],
    },
  ],
  '/diagnostics': [
    {
      title: 'DNS Diagnostics',
      items: [
        {
          href: makePath('/diagnostics/dns/lookup'),
          label: 'DNS Lookup',
          description:
            'Resolve DNS records (A, AAAA, CNAME, MX, TXT, NS, SOA, CAA) using various public resolvers or custom DNS servers',
          icon: 'dns-lookup',
          keywords: [
            'dns',
            'lookup',
            'resolver',
            'A record',
            'AAAA',
            'CNAME',
            'MX',
            'TXT',
            'NS',
            'SOA',
            'CAA',
            'query',
          ],
        },
        {
          href: makePath('/diagnostics/dns/reverse-lookup'),
          label: 'Reverse DNS Lookup',
          description:
            'Perform reverse DNS lookups (PTR records) for IPv4 and IPv6 addresses with automatic zone formatting',
          icon: 'dns-reverse',
          keywords: ['dns', 'reverse', 'ptr', 'lookup', 'ipv4', 'ipv6', 'in-addr.arpa', 'ip6.arpa', 'hostname'],
        },
        {
          href: makePath('/diagnostics/dns/propagation'),
          label: 'DNS Propagation Checker',
          description:
            'Check DNS record propagation across multiple public resolvers (Cloudflare, Google, Quad9, OpenDNS)',
          icon: 'dns-propagation',
          keywords: [
            'dns',
            'propagation',
            'check',
            'cloudflare',
            'google',
            'quad9',
            'opendns',
            'consistency',
            'global',
          ],
        },
        {
          href: makePath('/diagnostics/dns/spf-evaluator'),
          label: 'SPF Record Evaluator',
          description:
            'Analyze SPF records with recursive expansion of includes/redirects and DNS lookup limit tracking',
          icon: 'dns-spf-eval',
          keywords: ['spf', 'evaluator', 'recursive', 'includes', 'redirects', 'dns', 'lookups', 'sender', 'policy'],
        },
        {
          href: makePath('/diagnostics/dns/dmarc-check'),
          label: 'DMARC Policy Checker',
          description: 'Analyze DMARC policies, check alignment settings, and identify configuration issues',
          icon: 'dns-dmarc-check',
          keywords: ['dmarc', 'policy', 'check', 'alignment', 'quarantine', 'reject', 'rua', 'ruf', 'analysis'],
        },
        {
          href: makePath('/diagnostics/dns/caa-effective'),
          label: 'CAA Effective Policy',
          description: 'Walk domain label chain to find effective CAA policies for certificate authority authorization',
          icon: 'dns-caa-check',
          keywords: [
            'caa',
            'effective',
            'policy',
            'certificate',
            'authority',
            'authorization',
            'chain',
            'domain',
            'ssl',
          ],
        },
        {
          href: makePath('/diagnostics/dns/ns-soa-check'),
          label: 'NS/SOA Consistency Check',
          description: 'Verify nameserver resolution and analyze SOA record parameters for DNS configuration health',
          icon: 'dns-ns-soa',
          keywords: ['ns', 'soa', 'nameserver', 'consistency', 'check', 'resolution', 'parameters', 'health', 'serial'],
        },
        {
          href: makePath('/diagnostics/dns/dnssec-adflag'),
          label: 'DNSSEC AD Flag Checker',
          description:
            'Query DNS records via DoH and report if the AD (Authenticated Data) bit is set for DNSSEC validation',
          icon: 'dns-adflag',
          keywords: ['dnssec', 'ad', 'flag', 'authenticated', 'data', 'doh', 'validation', 'security', 'dns'],
        },
        {
          href: makePath('/diagnostics/dns/soa-serial'),
          label: 'SOA Serial Analyzer',
          description:
            'Analyze Start of Authority records to interpret serial number formats and examine DNS zone timing parameters',
          icon: 'dns-soa',
          keywords: [
            'soa',
            'serial',
            'analyzer',
            'zone',
            'timing',
            'parameters',
            'yyyymmddnn',
            'unix',
            'timestamp',
            'dns',
          ],
        },
      ],
    },
    {
      title: 'HTTP Diagnostics',
      items: [
        {
          href: makePath('/diagnostics/http/headers'),
          label: 'HTTP Headers Analyzer',
          description: 'Analyze HTTP headers and response metadata with custom method and header support',
          icon: 'http-headers',
          keywords: ['http', 'headers', 'analyzer', 'response', 'metadata', 'custom', 'method', 'request'],
        },
        {
          href: makePath('/diagnostics/http/redirect-trace'),
          label: 'Redirect Trace',
          description: 'Follow HTTP redirects and trace the full chain with security upgrade detection',
          icon: 'redirect-trace',
          keywords: ['http', 'redirect', 'trace', 'chain', 'hsts', 'security', 'upgrade', 'follow'],
        },
        {
          href: makePath('/diagnostics/http/security'),
          label: 'Security Headers Analyzer',
          description: 'Analyze security headers (HSTS, CSP, X-Frame-Options) with grading and recommendations',
          icon: 'security-headers',
          keywords: ['http', 'security', 'headers', 'hsts', 'csp', 'x-frame-options', 'analyzer', 'grade'],
        },
        {
          href: makePath('/diagnostics/http/cors-check'),
          label: 'CORS Policy Checker',
          description: 'Test CORS policies with preflight requests and origin validation',
          icon: 'cors-check',
          keywords: ['cors', 'policy', 'check', 'preflight', 'origin', 'validation', 'cross-origin', 'options'],
        },
        {
          href: makePath('/diagnostics/http/perf'),
          label: 'HTTP Performance Analyzer',
          description: 'Measure HTTP performance timing including DNS, TCP, TLS, and TTFB metrics',
          icon: 'http-perf',
          keywords: ['http', 'performance', 'timing', 'dns', 'tcp', 'tls', 'ttfb', 'metrics', 'analyzer'],
        },
      ],
    },
    {
      title: 'TLS Diagnostics',
      items: [
        {
          href: makePath('/diagnostics/tls/certificate'),
          label: 'TLS Certificate Analyzer',
          description:
            'Analyze TLS certificates, view certificate chains, check expiration dates, and examine Subject Alternative Names',
          icon: 'tls-cert',
          keywords: ['tls', 'certificate', 'analyzer', 'chain', 'expiry', 'san', 'ssl', 'x509', 'fingerprint'],
        },
        {
          href: makePath('/diagnostics/tls/versions'),
          label: 'TLS Versions Probe',
          description: 'Test which TLS protocol versions a server supports and assess overall security posture',
          icon: 'tls-version',
          keywords: ['tls', 'versions', 'probe', 'security', 'protocol', 'support', 'deprecated', 'assessment'],
        },
        {
          href: makePath('/diagnostics/tls/alpn'),
          label: 'TLS ALPN Negotiation',
          description:
            'Test Application-Layer Protocol Negotiation to see which protocol a server selects (HTTP/2, HTTP/3)',
          icon: 'tls-alpn',
          keywords: ['tls', 'alpn', 'negotiation', 'http2', 'http3', 'protocol', 'handshake', 'application'],
        },
      ],
    },
    {
      title: 'Network Diagnostics',
      items: [
        {
          href: makePath('/diagnostics/network/tcp-port-check'),
          label: 'TCP Port Checker',
          description: 'Test TCP connectivity to host:port combinations and measure connection latency',
          icon: 'network-port',
          keywords: ['tcp', 'port', 'check', 'connectivity', 'latency', 'open', 'closed', 'firewall', 'scan'],
        },
        {
          href: makePath('/diagnostics/network/http-ping'),
          label: 'HTTP Ping',
          description: 'Measure HTTP/HTTPS response latency with statistical analysis (median, p95) without raw ICMP',
          icon: 'network-ping',
          keywords: ['http', 'ping', 'latency', 'response', 'time', 'statistics', 'median', 'p95', 'web', 'api'],
        },
      ],
    },
    {
      title: 'Email Diagnostics',
      items: [
        {
          href: makePath('/diagnostics/email/mx-health'),
          label: 'MX Health Checker',
          description: 'Check mail server (MX) health including DNS resolution and SMTP port connectivity testing',
          icon: 'email-mx',
          keywords: ['mx', 'health', 'check', 'mail', 'server', 'smtp', 'port', 'connectivity', 'dns', 'email'],
        },
        {
          href: makePath('/diagnostics/email/spf-check'),
          label: 'SPF Policy Checker',
          description: 'Analyze SPF records with email deliverability focus and authentication policy evaluation',
          icon: 'email-spf',
          keywords: ['spf', 'policy', 'check', 'email', 'deliverability', 'authentication', 'sender', 'authorization'],
        },
        {
          href: makePath('/diagnostics/email/dmarc-check'),
          label: 'DMARC Policy Checker',
          description:
            'Check DMARC policies with email deliverability impact analysis and configuration recommendations',
          icon: 'email-dmarc',
          keywords: ['dmarc', 'policy', 'check', 'email', 'deliverability', 'authentication', 'reporting', 'alignment'],
        },
      ],
    },
    {
      title: 'RDAP Diagnostics',
      items: [
        {
          href: makePath('/diagnostics/rdap/domain'),
          label: 'Domain RDAP Lookup',
          description:
            'Query domain registration data using RDAP through IANA bootstrap registry with structured JSON responses',
          icon: 'dns-lookup',
          keywords: ['rdap', 'domain', 'registration', 'whois', 'iana', 'bootstrap', 'registry', 'json', 'lookup'],
        },
        {
          href: makePath('/diagnostics/rdap/ip'),
          label: 'IP Address RDAP Lookup',
          description:
            'Look up IP address allocation and registration data using RDAP through Regional Internet Registries',
          icon: 'rdap-ip',
          keywords: ['rdap', 'ip', 'allocation', 'registration', 'rir', 'arin', 'ripe', 'apnic', 'lacnic', 'afrinic'],
        },
        {
          href: makePath('/diagnostics/rdap/asn'),
          label: 'ASN RDAP Lookup',
          description:
            'Query Autonomous System Number allocation and registration data using RDAP through RIR services',
          icon: 'rdap-asn',
          keywords: ['rdap', 'asn', 'autonomous', 'system', 'number', 'allocation', 'registry', 'bgp', 'routing'],
        },
      ],
    },
  ],
  '/reference': [
    {
      title: 'Fundamentals',
      items: [
        {
          href: makePath('/reference/cidr'),
          label: 'CIDR Notation Explained',
          description: 'What CIDR is, why it replaced IP classes, and how to read network prefixes',
          icon: 'ref-cidr',
          keywords: [
            'cidr',
            'notation',
            'explained',
            'classless',
            'routing',
            'prefix',
            'subnet',
            'mask',
            'ip',
            'classes',
            'network',
            'addressing',
            'fundamentals',
            'slash',
            'notation',
          ],
        },
        {
          href: makePath('/reference/vlsm'),
          label: 'VLSM in Plain English',
          description: 'Variable Length Subnet Masking - when to use it and common pitfalls',
          icon: 'ref-vlsm',
          keywords: [
            'vlsm',
            'variable',
            'length',
            'subnet',
            'masking',
            'explained',
            'subnetting',
            'networks',
            'efficiency',
            'addressing',
            'design',
            'planning',
            'pitfalls',
            'best',
            'practices',
          ],
        },
        {
          href: makePath('/reference/supernetting'),
          label: 'Route Summarization / Supernetting',
          description: 'Combine multiple networks into single routes for efficient routing',
          icon: 'ref-supernetting',
          keywords: [
            'supernetting',
            'route',
            'summarization',
            'aggregation',
            'routing',
            'table',
            'optimization',
            'bgp',
            'ospf',
            'networks',
            'consolidation',
            'efficiency',
            'prefix',
            'summary',
          ],
        },
      ],
    },
    {
      title: 'IPv6 Addressing',
      items: [
        {
          href: makePath('/reference/ipv6-address-types'),
          label: 'IPv6 Address Types & Key Prefixes',
          description: 'Global unicast, ULA, link-local, multicast, and special IPv6 addresses',
          icon: 'ref-ipv6-address-types',
          keywords: [
            'ipv6',
            'address',
            'types',
            'prefixes',
            'global',
            'unicast',
            'ula',
            'link-local',
            'multicast',
            'loopback',
            'special',
            'fe80',
            'fc00',
            'fd00',
            'ff00',
            '2001',
          ],
        },
        {
          href: makePath('/reference/ipv6-prefix-lengths'),
          label: 'Common IPv6 Prefix Lengths',
          description: 'Quick reference for /128, /127, /64, /60, /56, /48, /32 with typical uses',
          icon: 'ref-ipv6-prefix-lens',
          keywords: [
            'ipv6',
            'prefix',
            'lengths',
            'reference',
            '/128',
            '/127',
            '/64',
            '/60',
            '/56',
            '/48',
            '/32',
            'subnet',
            'network',
            'addressing',
            'allocation',
            'hierarchy',
          ],
        },
        {
          href: makePath('/reference/ipv6-embedded-ipv4'),
          label: 'IPv4 in IPv6',
          description: 'IPv4-mapped addresses, 6to4, Teredo, and transition mechanisms',
          icon: 'ref-ipv4-in-ipv6',
          keywords: [
            'ipv6',
            'ipv4',
            'embedded',
            'mapped',
            '6to4',
            'teredo',
            'transition',
            'mechanisms',
            'dual-stack',
            'tunneling',
            'ffff',
            '2002',
            '2001:0000',
            'migration',
          ],
        },
        {
          href: makePath('/reference/ipv6-privacy-addresses'),
          label: 'IPv6 Privacy Addresses',
          description: 'SLAAC privacy extensions: temporary vs stable interface identifiers',
          icon: 'ref-ipv6-privacy-address',
          keywords: [
            'ipv6',
            'privacy',
            'addresses',
            'slaac',
            'extensions',
            'temporary',
            'stable',
            'interface',
            'identifiers',
            'rfc',
            '4941',
            'auto-configuration',
            'randomization',
          ],
        },
      ],
    },
    {
      title: 'Special Addresses',
      items: [
        {
          href: makePath('/reference/common-subnets'),
          label: 'Common Subnet Sizes',
          description: 'Quick reference for common subnet sizes and host counts',
          icon: 'ref-common-subnets',
          keywords: ['common', 'subnets', 'sizes', 'host', 'counts', 'reference', 'quick'],
        },
        {
          href: makePath('/reference/network-classes'),
          label: 'Network Classes (A/B/C)',
          description: 'Legacy network classes and their modern CIDR equivalents',
          icon: 'ref-network-classes',
          keywords: ['network', 'classes', 'class-a', 'class-b', 'class-c', 'legacy', 'cidr'],
        },
        {
          href: makePath('/reference/reserved-ranges'),
          label: 'Reserved IP Ranges',
          description: 'Comprehensive list of reserved and special-use IP address ranges',
          icon: 'ref-reserved-ranges',
          keywords: ['reserved', 'ranges', 'special', 'use', 'ip', 'addresses', 'rfc'],
        },
        {
          href: makePath('/reference/special-use-ipv4'),
          label: 'Special-Use IPv4 Blocks (RFC 6890)',
          description: 'Reserved IPv4 ranges including private networks, CGNAT, and test blocks',
          icon: 'ref-special-blocks',
          keywords: [
            'special',
            'use',
            'ipv4',
            'blocks',
            'rfc',
            '6890',
            'reserved',
            'private',
            'networks',
            'cgnat',
            'test',
            'loopback',
            '127.0.0.1',
            '10.0.0.0',
            '192.168.0.0',
            '172.16.0.0',
          ],
        },
        {
          href: makePath('/reference/private-vs-public-ip'),
          label: 'Private vs Public IP Addresses',
          description: 'Understanding private/public IPs, NAT implications, and identification',
          icon: 'ref-public-vs-private',
          keywords: [
            'private',
            'public',
            'ip',
            'addresses',
            'nat',
            'rfc',
            '1918',
            'routable',
            'non-routable',
            'internet',
            'identification',
            'comparison',
            'difference',
            'explained',
          ],
        },
        {
          href: makePath('/reference/cgnat'),
          label: 'Carrier-Grade NAT Explained',
          description: 'CGNAT (100.64.0.0/10), how to identify it, and service impacts',
          icon: 'ref-carrier-nat',
          keywords: [
            'cgnat',
            'carrier',
            'grade',
            'nat',
            '100.64.0.0',
            'rfc',
            '6598',
            'shared',
            'address',
            'space',
            'service',
            'provider',
            'impacts',
            'detection',
            'isp',
          ],
        },
        {
          href: makePath('/reference/link-local-apipa'),
          label: 'Link-Local & APIPA Addresses',
          description: 'IPv4 APIPA (169.254/16) and IPv6 link-local (fe80::/10) at a glance',
          icon: 'ref-link-local-apia',
          keywords: [
            'link-local',
            'apipa',
            'addresses',
            '169.254.0.0',
            'fe80::',
            'automatic',
            'configuration',
            'zero-conf',
            'local',
            'subnet',
            'self-assigned',
            'ipv4',
            'ipv6',
          ],
        },
        {
          href: makePath('/reference/multicast'),
          label: 'IPv4 & IPv6 Multicast Basics',
          description: 'Multicast scopes, well-known groups, and local subnet limitations',
          icon: 'ref-multicast-basics',
          keywords: [
            'multicast',
            'basics',
            'ipv4',
            'ipv6',
            'scopes',
            'groups',
            'igmp',
            'mld',
            '224.0.0.0',
            'ff00::',
            'broadcast',
            'unicast',
            'anycast',
            'communication',
          ],
        },
      ],
    },
    {
      title: 'DNS & Protocols',
      items: [
        {
          href: makePath('/reference/reverse-dns'),
          label: 'Reverse DNS (PTR Records)',
          description: 'How in-addr.arpa and ip6.arpa work with examples for IPv4 and IPv6',
          icon: 'ref-reverse-dns',
          keywords: [
            'reverse',
            'dns',
            'ptr',
            'records',
            'in-addr.arpa',
            'ip6.arpa',
            'lookup',
            'ipv4',
            'ipv6',
            'hostname',
            'resolution',
            'explained',
            'examples',
          ],
        },
        {
          href: makePath('/reference/reverse-zones'),
          label: 'Reverse Zones for CIDR Delegation',
          description: 'Minimal reverse DNS zones needed to delegate IPv4 and IPv6 CIDR blocks',
          icon: 'ref-reverse-zones',
          keywords: [
            'reverse',
            'zones',
            'cidr',
            'delegation',
            'dns',
            'minimal',
            'ipv4',
            'ipv6',
            'blocks',
            'nibble',
            'octet',
            'boundaries',
            'authority',
            'nameserver',
          ],
        },
        {
          href: makePath('/reference/icmp'),
          label: 'ICMP & ICMPv6: Common Types',
          description: 'Practical guide to ICMP message types for network troubleshooting',
          icon: 'ref-icmp',
          keywords: [
            'icmp',
            'icmpv6',
            'message',
            'types',
            'ping',
            'traceroute',
            'destination',
            'unreachable',
            'time',
            'exceeded',
            'troubleshooting',
            'network',
            'protocol',
            'error',
          ],
        },
        {
          href: makePath('/reference/arp-vs-ndp'),
          label: 'ARP vs NDP',
          description: 'Side-by-side comparison of IPv4 ARP and IPv6 Neighbor Discovery',
          icon: 'ref-arp-vs-ndp',
          keywords: [
            'arp',
            'ndp',
            'neighbor',
            'discovery',
            'comparison',
            'ipv4',
            'ipv6',
            'address',
            'resolution',
            'protocol',
            'layer2',
            'mac',
            'solicitation',
            'advertisement',
          ],
        },
      ],
    },
    {
      title: 'Network Operations',
      items: [
        {
          href: makePath('/reference/asn'),
          label: 'What is an ASN?',
          description: 'Autonomous Systems, BGP basics, and how IP addresses map to ASNs',
          icon: 'ref-asn',
          keywords: [
            'asn',
            'autonomous',
            'system',
            'number',
            'bgp',
            'routing',
            'internet',
            'explained',
            'ip',
            'addresses',
            'mapping',
            'iana',
            'rir',
            'allocation',
            'lookup',
          ],
        },
        {
          href: makePath('/reference/ports'),
          label: 'Common TCP/UDP Ports',
          description: 'Quick reference for frequently used port numbers and services',
          icon: 'ref-ports',
          keywords: [
            'tcp',
            'udp',
            'ports',
            'common',
            'reference',
            'services',
            'well-known',
            'registered',
            'dynamic',
            'ephemeral',
            'firewall',
            'security',
            'protocols',
          ],
        },
        {
          href: makePath('/reference/wildcard-masks'),
          label: 'ACL Wildcard Masks',
          description: 'Wildcard masks vs netmasks, quick conversions and ACL examples',
          icon: 'ref-wildcard-masks',
          keywords: [
            'wildcard',
            'masks',
            'acl',
            'access',
            'control',
            'list',
            'netmasks',
            'inverse',
            'cisco',
            'juniper',
            'conversions',
            'examples',
            'firewall',
            'security',
          ],
        },
        {
          href: makePath('/reference/mtu-mss'),
          label: 'Common MTU/MSS Values',
          description: 'MTU and MSS values for Ethernet, PPPoE, VPN, and overhead calculations',
          icon: 'ref-mtu-mss',
          keywords: [
            'mtu',
            'mss',
            'maximum',
            'transmission',
            'unit',
            'segment',
            'size',
            'ethernet',
            'pppoe',
            'vpn',
            'overhead',
            'fragmentation',
            'jumbo',
            'frames',
          ],
        },
      ],
    },
  ],
};

export const aboutPages: NavItem[] = [
  {
    href: makePath('/about/api'),
    label: 'API Usage',
    description: 'Using our free public REST API for network calculations and IP tools',
    keywords: ['api', 'networking', 'ipv4', 'ipv6', 'network', 'tools', 'dns', 'cidr', 'subnet'],
  },
  {
    href: makePath('/about/attributions'),
    label: 'Attributions',
    description: 'Shout outs to sponsors, contributors and other authors who made Networking Toolbox possible',
    keywords: ['attributions', 'credits', 'thanks', 'sponsors', 'contributors', 'libraries'],
  },
  {
    href: makePath('/about/author'),
    label: 'Author',
    description: 'About Alicia Sykes, and how and why she built Networking Toolbox',
    keywords: ['author', 'about', 'bio', 'Alicia Sykes', 'github'],
  },
  {
    href: makePath('/about/building'),
    label: 'Building',
    description: 'Build Networking Toolbox from source, self-host, edit, or contribute to the project',
    keywords: ['building', 'sveltekit', 'github', 'npm', 'svelte', 'typescript', 'developing documentation'],
  },
  {
    href: makePath('/about/license'),
    label: 'MIT License',
    description: `Networking Toolbox's MIT license, summary, and what it means for you`,
    keywords: ['license', 'mit', 'opensource', 'permissions', 'limitations', 'conditions'],
  },
  {
    href: makePath('/about/self-hosting'),
    label: 'Self-Hosting',
    description: 'Guide to self-hosting Networking Toolbox on your own server or infrastructure',
    keywords: ['self-hosting', 'deployment', 'docker', 'portainer', 'vercel', 'node', 'nginx'],
  },
];

export const footerLinks: NavItem[] = [
  { href: makePath('/about'), label: 'About' },
  { href: ('https://merox.dev'), label: 'Blog' },
  { href: ('github.com/meroxdotdev'), label: '' },
];

// Helper: is a nav item active for a given pathname?
export function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

// Helper function to extract all nav items from mixed structure
function extractAllNavItems(navStructure: (NavItem | NavGroup)[]): NavItem[] {
  const items: NavItem[] = [];

  for (const item of navStructure) {
    if ('items' in item) {
      // It's a NavGroup (might have href too, but we only want its items)
      items.push(...item.items);
    } else if ('href' in item && 'label' in item) {
      // It's a NavItem (has href and label)
      items.push(item as NavItem);
    }
  }

  return items;
}

// All pages for homepage navigation - combines standalone pages with sub-pages
export const ALL_PAGES: NavItem[] = [
  ...STANDALONE_PAGES,
  ...Object.values(SUB_NAV)
    .map((section) => extractAllNavItems(section as (NavItem | NavGroup)[]))
    .flat(),
];

// Helper: find the section key (e.g. '/reference') that matches a pathname
export function findSectionKey(pathname: string): string | null {
  const keys = Object.keys(SUB_NAV);
  return keys.find((k) => isActive(pathname, k)) ?? null;
}

// Helper: get page details for SEO from navigation
export function getPageDetails(href: string): { title: string; description: string; keywords: string[] } | null {
  // First check ALL_PAGES (sub-pages)
  for (const item of ALL_PAGES) {
    if (item.href === href) {
      return {
        title: item.label,
        description: item.description || '',
        keywords: item.keywords || [],
      };
    }
  }

  // Then check TOP_NAV (top-level pages)
  for (const item of TOP_NAV) {
    if (item.href === href) {
      return {
        title: item.label,
        description: item.description || '',
        keywords: item.keywords || [],
      };
    }
  }

  // Check SUB_NAV for section-level metadata (e.g. /cidr)
  const sectionData = SUB_NAV[href];
  if (sectionData && sectionData.length > 0) {
    const firstItem = sectionData[0];
    // Check if it's a NavGroup with title/description
    if ('title' in firstItem && 'description' in firstItem) {
      return {
        title: firstItem.title,
        description: firstItem.description || '',
        keywords: [],
      };
    }
  }

  // Fallback: check for parent section if current path is a sub-path
  // e.g. /cidr/mask-converter should use /cidr section metadata
  const pathSegments = href.split('/').filter(Boolean);
  if (pathSegments.length > 1) {
    const parentPath = '/' + pathSegments[0];
    const parentSectionData = SUB_NAV[parentPath];
    if (parentSectionData && parentSectionData.length > 0) {
      const firstItem = parentSectionData[0];
      if ('title' in firstItem && 'description' in firstItem) {
        return {
          title: firstItem.title,
          description: firstItem.description || '',
          keywords: [],
        };
      }
    }
  }

  return null;
}

// Enhanced helper: get page details including icon for dynamic favicon
export function getPageDetailsWithIcon(
  href: string,
): { title: string; description: string; keywords: string[]; icon?: string } | null {
  // First check ALL_PAGES (sub-pages)
  for (const item of ALL_PAGES) {
    if (item.href === href) {
      return {
        title: item.label,
        description: item.description || '',
        keywords: item.keywords || [],
        icon: item.icon,
      };
    }
  }

  // Then check TOP_NAV (top-level pages)
  for (const item of TOP_NAV) {
    if (item.href === href) {
      return {
        title: item.label,
        description: item.description || '',
        keywords: item.keywords || [],
        icon: item.icon,
      };
    }
  }

  // Fallback: check for parent section if current path is a sub-path
  const pathSegments = href.split('/').filter(Boolean);
  if (pathSegments.length > 1) {
    const parentPath = '/' + pathSegments[0];
    const parentSectionData = SUB_NAV[parentPath];
    if (parentSectionData && parentSectionData.length > 0) {
      const firstItem = parentSectionData[0];
      if ('title' in firstItem && 'description' in firstItem) {
        return {
          title: firstItem.title,
          description: firstItem.description || '',
          keywords: [],
          icon: undefined,
        };
      }
    }
  }

  return null;
}
