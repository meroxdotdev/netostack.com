import { site, author, license } from '$lib/constants/site';

export type NavItem = {
  href: string;
  label: string;
  description?: string;
  icon?: string;
  keywords?: string[];
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

// Individual standalone pages
export const STANDALONE_PAGES: NavItem[] = [];

export const TOP_NAV: NavItem[] = [
  { href: '/subnetting', label: 'Subnetting' },
  { href: '/cidr', label: 'CIDR' },
  { href: '/ip-address-convertor', label: 'IP Tools' },
  { href: '/dns', label: 'DNS Tools' },
  { href: '/diagnostics', label: 'Lookups' },
  { href: '/reference', label: 'Ref' }
];

// Sections that have sub-pages (drives the conditional SubHeader)
export const SUB_NAV: Record<string, (NavItem | NavGroup)[]> = {
  '/subnetting': [
    { 
      href: '/subnetting/ipv4-subnet-calculator', 
      label: 'IPv4 Subnet Calculator',
      description: 'Calculate subnet information, network addresses, broadcast addresses, and host ranges with visual network analysis',
      icon: 'subnet-calculator',
      keywords: ['subnet', 'calculator', 'ipv4', 'network', 'broadcast', 'hosts', 'cidr', 'netmask']
    },
    { 
      href: '/subnetting/ipv6-subnet-calculator', 
      label: 'IPv6 Subnet Calculator',
      description: 'Calculate IPv6 subnets with 128-bit addressing and modern network prefix planning',
      icon: 'ipv6-subnet-calculator',
      keywords: ['subnet', 'calculator', 'ipv6', 'network', 'prefix', '128-bit', 'addressing']
    },
    { 
      href: '/subnetting/vlsm-calculator', 
      label: 'VLSM Calculator',
      description: 'Variable Length Subnet Mask calculator to break networks into multiple smaller subnets with optimal allocation',
      icon: 'vlsm-calculator',
      keywords: ['vlsm', 'variable', 'length', 'subnet', 'mask', 'calculator', 'subnets', 'allocation']
    },
    { 
      href: '/subnetting/supernet-calculator', 
      label: 'Supernet Calculator',
      description: 'Aggregate multiple networks into supernets for route summarization and efficient routing table management',
      icon: 'supernet-calculator',
      keywords: ['supernet', 'calculator', 'aggregate', 'route', 'summarization', 'routing', 'table']
    },
    { 
      href: '/subnetting/planner', 
      label: 'Subnet Planner',
      description: 'Design VLSM networks with drag-and-drop subnet planning and optimize address allocation strategies',
      icon: 'subnet-planner',
      keywords: ['subnet', 'planner', 'design', 'vlsm', 'networks', 'planning', 'allocation']
    }
  ],
  '/cidr': [
    {
      title: 'CIDR Masks',
      items: [
        {
          href: '/cidr/mask-converter/cidr-to-subnet-mask', 
          label: 'CIDR → Mask',
          description: 'Convert CIDR notation (e.g. /24) to subnet mask format (255.255.255.0)',
          icon: 'cidr-convertor',
          keywords: ['cidr', 'convert', 'converter', 'mask', 'subnet', 'notation', '/24', '255.255.255.0']
        },
        { 
          href: '/cidr/mask-converter/subnet-mask-to-cidr',
          label: 'Mask → CIDR',
          description: 'Convert subnet mask format (255.255.255.0) to CIDR notation (/24)',
          icon: 'cidr-convertor-mask',
          keywords: ['mask', 'convert', 'converter', 'cidr', 'subnet', 'notation', '/24', '255.255.255.0']
        },
      ],
    },
    { 
      href: '/cidr/summarize',
      label: 'CIDR Summarizer',
      description: 'Optimize mixed IP addresses, CIDR blocks, and ranges into minimal CIDR prefixes',
      icon: 'cidr-summarize',
      keywords: ['cidr', 'summarize', 'summarizer', 'optimize', 'ip', 'blocks', 'ranges', 'prefixes']
    },
    { 
      href: '/cidr/split',
      label: 'CIDR Split',
      description: 'Split a network into N equal child subnets or to a target prefix length',
      icon: 'subnet-splitter',
      keywords: ['cidr', 'split', 'splitter', 'network', 'subnets', 'child', 'prefix']
    },
    { 
      href: '/cidr/next-available',
      label: 'Next Available Subnet',
      description: 'Find available subnets from pools minus allocations with first-fit or best-fit policies',
      icon: 'next-available-subnet',
      keywords: ['next', 'available', 'subnet', 'pools', 'allocations', 'first-fit', 'best-fit']
    },
    { 
      href: '/cidr/gaps',
      label: 'Free Space Finder',
      description: 'List all free blocks in pool CIDRs minus allocations, filterable by target prefix length',
      icon: 'cidr-gaps',
      keywords: ['free', 'space', 'gaps', 'finder', 'blocks', 'pools', 'allocations', 'prefix']
    },
    { 
      href: '/cidr/deaggregate',
      label: 'CIDR Deaggregate',
      description: 'Decompose CIDR blocks and ranges into uniform target prefix subnets (e.g., break into /24s)',
      icon: 'cidr-deaggregate',
      keywords: ['cidr', 'deaggregate', 'decompose', 'break', 'uniform', 'prefix', 'subnets', 'split']
    },
    { 
      href: '/cidr/compare',
      label: 'CIDR Compare',
      description: 'Compare two lists of CIDR blocks to identify added, removed, and unchanged entries after normalization',
      icon: 'cidr-compare',
      keywords: ['cidr', 'compare', 'diff', 'audit', 'added', 'removed', 'unchanged', 'normalization']
    },
    { 
      href: '/cidr/allocator',
      label: 'CIDR Allocator',
      description: 'Pack requested subnet sizes into network pools using bin-packing algorithms (first-fit, best-fit)',
      icon: 'cidr-allocator',
      keywords: ['cidr', 'allocator', 'bin-packing', 'first-fit', 'best-fit', 'subnet', 'allocation', 'packing']
    },
    { 
      href: '/cidr/alignment',
      label: 'CIDR Alignment',
      description: 'Check if IP addresses and ranges align to CIDR prefix boundaries with optimization suggestions',
      icon: 'cidr-alignment'
    },
    { 
      href: '/cidr/wildcard-mask',
      label: 'Wildcard Mask Converter',
      description: 'Convert between CIDR, subnet masks, and wildcard masks with ACL rule generation',
      icon: 'wildcard-mask'
    },
    {
      title: 'Set Operations',
      items: [
        { 
          href: '/cidr/set-operations/diff',
          label: 'Difference (A - B)',
          description: 'Compute A - B set operations on CIDR blocks, ranges, and IP addresses',
          icon: 'diff'
        },
        { 
          href: '/cidr/set-operations/overlap',
          label: 'Overlap (A ∩ B)',
          description: 'Detect intersections between two sets of IP addresses and ranges',
          icon: 'intersection'
        },
        { 
          href: '/cidr/set-operations/contains',
          label: 'Contains (A ⊆ B)',
          description: 'Check if one set fully contains another with detailed containment analysis',
          icon: 'containment'
        }
      ]
    }
  ],
  '/ip-address-convertor': [
    {
      title: 'Number Formats',
      items: [
        {
          href: '/ip-address-convertor/representations',
          label: 'Format Representations',
          description: 'Convert IP addresses between decimal, binary, hexadecimal, and octal number systems',
          icon: 'ip-convertor',
          keywords: ['ip', 'convert', 'converter', 'format', 'decimal', 'binary', 'hexadecimal', 'octal', 'representation']
        }
      ]
    },
    {
      title: 'Address Calculations',
      items: [
        {
          href: '/ip-address-convertor/distance',
          label: 'IP Distance Calculator',
          description: 'Calculate the number of addresses between two IPs with inclusive/exclusive counting',
          icon: 'ip-distance',
          keywords: ['ip', 'distance', 'calculator', 'addresses', 'between', 'counting', 'range']
        },
        {
          href: '/ip-address-convertor/nth-ip',
          label: 'Nth IP Calculator',
          description: 'Resolve the IP address at a specific index within networks and ranges with offset support',
          icon: 'nth-ip'
        },
        {
          href: '/ip-address-convertor/random',
          label: 'Random IP Generator',
          description: 'Generate random IP addresses from networks with uniqueness control and seeded randomness',
          icon: 'random-ip',
          keywords: ['random', 'ip', 'generator', 'generate', 'addresses', 'networks', 'seeded']
        },
        {
          href: '/ip-address-convertor/regex',
          label: 'IP Regex Generator',
          description: 'Generate safe regular expressions for matching IPv4 and IPv6 addresses with customizable validation options',
          icon: 'ip-regex-generator',
          keywords: ['regex', 'regular', 'expression', 'ipv4', 'ipv6', 'pattern', 'matching', 'validation']
        },
        {
          href: '/ip-address-convertor/validator',
          label: 'IP Address Validator',
          description: 'Validate IPv4 and IPv6 addresses with detailed error analysis and format checking',
          icon: 'ip-validator',
          keywords: ['ip', 'validator', 'validation', 'check', 'verify', 'ipv4', 'ipv6', 'format', 'address']
        },
        {
          href: '/ip-address-convertor/enumerate',
          label: 'IP Enumerate',
          description: 'Safely enumerate all IP addresses in CIDR blocks and ranges with CSV/JSON export',
          icon: 'ip-enumerate',
          keywords: ['enumerate', 'list', 'generate', 'cidr', 'range', 'all', 'ips', 'export', 'csv', 'json']
        }
      ]
    },
    {
      title: 'IPv6 Notation',
      items: [
        {
          href: '/ip-address-convertor/notation/ipv6-expand',
          label: 'IPv6 Expand',
          description: 'Expand compressed IPv6 addresses to full 128-bit hexadecimal format',
          icon: 'ipv6-expand'
        },
        {
          href: '/ip-address-convertor/notation/ipv6-compress',
          label: 'IPv6 Compress',
          description: 'Compress expanded IPv6 addresses using :: notation and removing leading zeros',
          icon: 'ipv6-compress'
        },
        {
          href: '/ip-address-convertor/notation/normalize',
          label: 'IPv6 Normalizer',
          description: 'Normalize IPv6 addresses to RFC 5952 canonical form with step-by-step transformation',
          icon: 'ip-normalize'
        },
        {
          href: '/ip-address-convertor/notation/zone-id',
          label: 'IPv6 Zone ID Handler',
          description: 'Process IPv6 addresses with zone identifiers for link-local and multicast addresses',
          icon: 'zone-id-handler'
        },
        {
          href: '/ip-address-convertor/ipv6/solicited-node',
          label: 'IPv6 Solicited-Node',
          description: 'Compute solicited-node multicast addresses from IPv6 unicast for Neighbor Discovery Protocol',
          icon: 'ipv6-solicited-node',
          keywords: ['ipv6', 'solicited-node', 'multicast', 'ndp', 'neighbor', 'discovery', 'ff02::1:ff']
        },
        {
          href: '/ip-address-convertor/ipv6/teredo',
          label: 'IPv6 Teredo Parser',
          description: 'Parse Teredo IPv6 addresses to extract server IPv4, flags, mapped port, and client IPv4 components',
          icon: 'ipv6-teredo',
          keywords: ['ipv6', 'teredo', 'tunnel', '2001:0000', 'parse', 'server', 'client', 'port', 'flags']
        },
        {
          href: '/ip-address-convertor/ipv6/nat64',
          label: 'IPv6 NAT64 Translator',
          description: 'Translate between IPv4 and IPv6 addresses using NAT64 prefix (64:ff9b::/96 or custom)',
          icon: 'ipv6-nat64',
          keywords: ['ipv6', 'nat64', 'translate', 'ipv4', 'prefix', '64:ff9b', 'converter', 'translation']
        }
      ]
    },
    {
      title: 'IP Families',
      items: [
        {
          href: '/ip-address-convertor/families/ipv4-to-ipv6',
          label: 'IPv4 → IPv6',
          description: 'Convert IPv4 addresses to IPv6 format using IPv4-mapped IPv6 addressing',
          icon: 'ipv4-ipv6'
        },
        {
          href: '/ip-address-convertor/families/ipv6-to-ipv4',
          label: 'IPv6 → IPv4',
          description: 'Extract IPv4 addresses from IPv4-mapped IPv6 addresses',
          icon: 'ipv6-ipv4'
        }
      ]
    },
    {
      title: 'Address Generation',
      items: [
        {
          href: '/ip-address-convertor/eui64',
          label: 'EUI-64 Converter',
          description: 'Convert between MAC addresses and IPv6 EUI-64 interface identifiers with IPv6 generation',
          icon: 'eui64-converter'
        },
        {
          href: '/ip-address-convertor/ula-generator',
          label: 'ULA Generator',
          description: 'Generate RFC 4193 Unique Local Addresses with cryptographically secure Global IDs',
          icon: 'ula-generator'
        }
      ]
    }
  ],
  '/dns': [
    {
      title: 'Reverse DNS',
      items: [
        {
          href: '/dns/reverse/ptr-generator',
          label: 'PTR Generator',
          description: 'Convert IPs/CIDRs to PTR names (in-addr.arpa / ip6.arpa) and example zone lines',
          icon: 'ptr-generator',
          keywords: ['ptr', 'generator', 'reverse', 'dns', 'in-addr.arpa', 'ip6.arpa', 'cidr', 'zone']
        },
        {
          href: '/dns/reverse/zone-generator',
          label: 'Reverse Zone Generator',
          description: 'Generate full reverse zone files from CIDR + hostname template',
          icon: 'dns-reverse-zones-gen',
          keywords: ['reverse', 'zone', 'generator', 'cidr', 'hostname', 'template', 'zone', 'file', 'soa', 'ns']
        },
        {
          href: '/dns/reverse/reverse-zones',
          label: 'Reverse Zones Calculator',
          description: 'Minimal set of reverse zones needed to delegate a CIDR (v4 & v6 nibble math)',
          icon: 'dns-reverse-zones-calc',
          keywords: ['reverse', 'zones', 'calculator', 'delegation', 'cidr', 'nibble', 'octet', 'boundaries']
        },
        {
          href: '/dns/reverse/ptr-sweep-planner',
          label: 'PTR Sweep Planner',
          description: 'Plan PTR coverage for a block; list missing/extra PTRs against naming pattern',
          icon: 'dns-ptr-sweep',
          keywords: ['ptr', 'sweep', 'planner', 'coverage', 'missing', 'extra', 'naming', 'pattern', 'analysis']
        }
      ]
    },
    {
      title: 'Record Generators',
      items: [
        {
          href: '/dns/generators/a-aaaa-bulk',
          label: 'A/AAAA Bulk Generator',
          description: 'Bulk create A and AAAA record sets from IP lists with TTL and RRset controls',
          icon: 'dns-a-records',
          keywords: ['dns', 'a', 'aaaa', 'records', 'bulk', 'generator', 'ttl', 'rrset']
        },
        {
          href: '/dns/generators/cname-builder',
          label: 'CNAME Builder',
          description: 'Build valid CNAME records with loop detection and self-target checks',
          icon: 'dns-cname',
          keywords: ['dns', 'cname', 'canonical', 'alias', 'builder', 'loop', 'detection', 'validation']
        },
        {
          href: '/dns/generators/mx-planner',
          label: 'MX Record Planner',
          description: 'Plan MX record priorities with fallback guidance and sample configurations',
          icon: 'dns-mx',
          keywords: ['dns', 'mx', 'mail', 'exchange', 'priority', 'fallback', 'planner', 'email']
        },
        {
          href: '/dns/generators/srv-builder',
          label: 'SRV Record Builder',
          description: 'Compose SRV records with service, protocol, priority, weight, port, and target validation',
          icon: 'dns-srv',
          keywords: ['dns', 'srv', 'service', 'protocol', 'priority', 'weight', 'port', 'target', 'builder']
        },
        {
          href: '/dns/generators/txt-escape',
          label: 'TXT Record Escape Tool',
          description: 'Safely escape and split TXT record strings into 255-character chunks with validation',
          icon: 'dns-txt',
          keywords: ['dns', 'txt', 'escape', 'split', 'chunks', 'validation', 'text', 'records']
        },
        {
          href: '/dns/generators/spf-builder',
          label: 'SPF Policy Builder',
          description: 'Craft SPF policies with mechanism validation, qualifier control, and DNS lookup counting',
          icon: 'dns-spf',
          keywords: ['dns', 'spf', 'policy', 'sender', 'framework', 'mechanisms', 'qualifiers', 'validation']
        },
        {
          href: '/dns/generators/dkim-keygen',
          label: 'DKIM Key Generator',
          description: 'Generate DKIM RSA keypairs (1024/2048-bit) with selectors and DNS TXT records',
          icon: 'dns-dkim',
          keywords: ['dns', 'dkim', 'keys', 'rsa', 'domainkeys', 'selector', 'txt', 'records', 'generator']
        },
        {
          href: '/dns/generators/dmarc-builder',
          label: 'DMARC Policy Builder',
          description: 'Create DMARC policies with alignment options, reporting addresses, and failure handling',
          icon: 'dns-dmarc',
          keywords: ['dns', 'dmarc', 'policy', 'alignment', 'reporting', 'quarantine', 'reject', 'builder']
        },
        {
          href: '/dns/generators/caa-builder',
          label: 'CAA Record Builder',
          description: 'Build CAA records for certificate authority authorization with misconfiguration warnings',
          icon: 'dns-caa',
          keywords: ['dns', 'caa', 'certificate', 'authority', 'authorization', 'ssl', 'tls', 'builder']
        },
        {
          href: '/dns/generators/tlsa-generator',
          label: 'TLSA Generator',
          description: 'Create TLSA (DANE) records from certificates or hashes with usage, selector, and matching type options',
          icon: 'dns-tlsa',
          keywords: ['dns', 'tlsa', 'dane', 'certificate', 'hash', 'usage', 'selector', 'matching', 'tls', 'ssl']
        },
        {
          href: '/dns/generators/sshfp-generator',
          label: 'SSHFP Generator',
          description: 'Generate SSHFP records from SSH public keys or fingerprints with algorithm and fingerprint type selection',
          icon: 'dns-sshfp',
          keywords: ['dns', 'sshfp', 'ssh', 'public', 'key', 'fingerprint', 'algorithm', 'security']
        },
        {
          href: '/dns/generators/svcb-https-builder',
          label: 'SVCB/HTTPS Builder',
          description: 'Build SVCB and HTTPS resource records with service parameters like ALPN, port, and ECH configuration',
          icon: 'dns-svcb',
          keywords: ['dns', 'svcb', 'https', 'service', 'binding', 'alpn', 'port', 'ech', 'parameters']
        },
        {
          href: '/dns/generators/naptr-builder',
          label: 'NAPTR Builder',
          description: 'Construct NAPTR records for service discovery with order, preference, flags, service, regexp, and replacement fields',
          icon: 'dns-naptr',
          keywords: ['dns', 'naptr', 'service', 'discovery', 'order', 'preference', 'flags', 'regexp', 'replacement']
        },
        {
          href: '/dns/generators/loc-builder',
          label: 'LOC Builder',
          description: 'Create LOC records from coordinates and convert between latitude/longitude and DNS LOC format',
          icon: 'dns-loc',
          keywords: ['dns', 'loc', 'location', 'coordinates', 'latitude', 'longitude', 'altitude', 'precision']
        },
        {
          href: '/dns/generators/rp-builder',
          label: 'RP Builder', 
          description: 'Generate RP (Responsible Person) records with mailbox and TXT domain name references',
          icon: 'dns-rp',
          keywords: ['dns', 'rp', 'responsible', 'person', 'mailbox', 'contact', 'txt', 'domain']
        },
        {
          href: '/dns/generators/idn-punycode',
          label: 'IDN Punycode Converter',
          description: 'Convert Unicode domain names to Punycode and back with IDNA2008 normalization support',
          icon: 'dns-idn',
          keywords: ['dns', 'idn', 'punycode', 'unicode', 'domain', 'international', 'idna2008', 'normalization']
        }
      ]
    },
    {
      title: 'DNS Utilities',
      items: [
        {
          href: '/dns/record-validator',
          label: 'DNS Record Validator',
          description: 'Validate individual DNS resource record syntax (A/AAAA/CNAME/MX/TXT/SRV/CAA) with error detection',
          icon: 'dns-record-validator',
          keywords: ['dns', 'record', 'validator', 'syntax', 'a', 'aaaa', 'cname', 'mx', 'txt', 'srv', 'caa', 'validation']
        },
        {
          href: '/dns/ttl-calculator',
          label: 'TTL Calculator',
          description: 'Humanize DNS TTL values and compute cache expiry times with recommendations',
          icon: 'dns-ttl',
          keywords: ['dns', 'ttl', 'time', 'live', 'cache', 'expiry', 'calculator', 'humanize', 'recommendations']
        },
        {
          href: '/dns/edns-size-estimator',
          label: 'EDNS Size Estimator',
          description: 'Estimate DNS message size and UDP fragmentation risk with EDNS buffer recommendations',
          icon: 'dns-edns',
          keywords: ['dns', 'edns', 'message', 'size', 'udp', 'fragmentation', 'buffer', 'estimator', 'optimization']
        },
        {
          href: '/dns/label-normalizer',
          label: 'DNS Label Normalizer',
          description: 'Normalize domain labels with homograph attack detection and script mixing warnings',
          icon: 'dns-label-normalize',
          keywords: ['dns', 'label', 'normalize', 'domain', 'homograph', 'attack', 'script', 'mixing', 'security', 'idn']
        }
      ]
    },
    {
      title: 'Zone File Tools',
      items: [
        {
          href: '/dns/zone/linter',
          label: 'Zone Linter',
          description: 'Normalize and canonicalize BIND zone files with error checking and formatting',
          icon: 'dns-zone-linter',
          keywords: ['dns', 'zone', 'linter', 'normalize', 'canonicalize', 'bind', 'error', 'checking', 'format']
        },
        {
          href: '/dns/zone/diff',
          label: 'Zone Diff',
          description: 'Compare two zone files and identify added, removed, and changed DNS records',
          icon: 'dns-zone-diff',
          keywords: ['dns', 'zone', 'diff', 'compare', 'changes', 'added', 'removed', 'modified', 'migration']
        },
        {
          href: '/dns/zone/stats',
          label: 'Zone Statistics',
          description: 'Analyze zone file structure, record distribution, and configuration health',
          icon: 'dns-zone-stats',
          keywords: ['dns', 'zone', 'statistics', 'analysis', 'records', 'distribution', 'health', 'metrics']
        },
        {
          href: '/dns/zone/name-length-checker',
          label: 'Name Length Checker',
          description: 'Validate DNS names against RFC length limits: 63 bytes per label, 255 bytes per FQDN',
          icon: 'dns-name-length',
          keywords: ['dns', 'name', 'length', 'validator', 'rfc', 'limits', 'label', 'fqdn', 'validation']
        }
      ]
    },
    {
      title: 'DNSSEC Tools',
      items: [
        {
          href: '/dns/dnssec/dnskey-tag',
          label: 'DNSKEY Key Tag Calculator',
          description: 'Compute the DNSKEY key tag from a DNSKEY RR (RFC 4034 algorithm) and display it alongside key meta',
          icon: 'dns-dnskey',
          keywords: ['dnssec', 'dnskey', 'key', 'tag', 'calculator', 'rfc', '4034', 'algorithm', 'ksk', 'zsk']
        },
        {
          href: '/dns/dnssec/ds-generator',
          label: 'DS Record Generator',
          description: 'Generate DS records (SHA-1/256/384) from a DNSKEY or public key, with copyable output for parent submission',
          icon: 'dns-ds',
          keywords: ['dnssec', 'ds', 'delegation', 'signer', 'sha1', 'sha256', 'sha384', 'parent', 'zone', 'trust']
        },
        {
          href: '/dns/dnssec/nsec3-hash',
          label: 'NSEC3 Hash Calculator',
          description: 'Calculate NSEC3 owner hashes for a name given salt, iterations, and algorithm, showing the hashed owner FQDN',
          icon: 'dns-nsec3',
          keywords: ['dnssec', 'nsec3', 'hash', 'calculator', 'salt', 'iterations', 'algorithm', 'sha1', 'privacy']
        },
        {
          href: '/dns/dnssec/cds-cdnskey-builder',
          label: 'CDS/CDNSKEY Builder',
          description: 'Build CDS/CDNSKEY RRs from child DNSKEYs to enable automated DS updates at the parent',
          icon: 'dns-cds',
          keywords: ['dnssec', 'cds', 'cdnskey', 'builder', 'automated', 'ds', 'updates', 'parent', 'child', 'delegation']
        },
        {
          href: '/dns/dnssec/rrsig-planner',
          label: 'RRSIG Planner',
          description: 'Suggest RRSIG validity windows (inception/expiration) based on TTLs and desired overlap, with renewal lead-time guidance',
          icon: 'dns-rrsig',
          keywords: ['dnssec', 'rrsig', 'planner', 'validity', 'windows', 'inception', 'expiration', 'ttl', 'overlap', 'renewal']
        }
      ]
    }
  ],
  '/diagnostics': [
    {
      title: 'DNS Diagnostics',
      items: [
        {
          href: '/diagnostics/dns/lookup',
          label: 'DNS Lookup',
          description: 'Resolve DNS records (A, AAAA, CNAME, MX, TXT, NS, SOA, CAA) using various public resolvers or custom DNS servers',
          icon: 'dns-lookup',
          keywords: ['dns', 'lookup', 'resolver', 'a', 'aaaa', 'cname', 'mx', 'txt', 'ns', 'soa', 'caa', 'query']
        },
        {
          href: '/diagnostics/dns/reverse-lookup',
          label: 'Reverse DNS Lookup',
          description: 'Perform reverse DNS lookups (PTR records) for IPv4 and IPv6 addresses with automatic zone formatting',
          icon: 'dns-reverse',
          keywords: ['dns', 'reverse', 'ptr', 'lookup', 'ipv4', 'ipv6', 'in-addr.arpa', 'ip6.arpa', 'hostname']
        },
        {
          href: '/diagnostics/dns/propagation',
          label: 'DNS Propagation Checker',
          description: 'Check DNS record propagation across multiple public resolvers (Cloudflare, Google, Quad9, OpenDNS)',
          icon: 'dns-propagation',
          keywords: ['dns', 'propagation', 'check', 'cloudflare', 'google', 'quad9', 'opendns', 'consistency', 'global']
        },
        {
          href: '/diagnostics/dns/spf-evaluator',
          label: 'SPF Record Evaluator',
          description: 'Analyze SPF records with recursive expansion of includes/redirects and DNS lookup limit tracking',
          icon: 'dns-spf-eval',
          keywords: ['spf', 'evaluator', 'recursive', 'includes', 'redirects', 'dns', 'lookups', 'sender', 'policy']
        },
        {
          href: '/diagnostics/dns/dmarc-check',
          label: 'DMARC Policy Checker',
          description: 'Analyze DMARC policies, check alignment settings, and identify configuration issues',
          icon: 'dns-dmarc-check',
          keywords: ['dmarc', 'policy', 'check', 'alignment', 'quarantine', 'reject', 'rua', 'ruf', 'analysis']
        },
        {
          href: '/diagnostics/dns/caa-effective',
          label: 'CAA Effective Policy',
          description: 'Walk domain label chain to find effective CAA policies for certificate authority authorization',
          icon: 'dns-caa-check',
          keywords: ['caa', 'effective', 'policy', 'certificate', 'authority', 'authorization', 'chain', 'domain', 'ssl']
        },
        {
          href: '/diagnostics/dns/ns-soa-check',
          label: 'NS/SOA Consistency Check',
          description: 'Verify nameserver resolution and analyze SOA record parameters for DNS configuration health',
          icon: 'dns-ns-soa',
          keywords: ['ns', 'soa', 'nameserver', 'consistency', 'check', 'resolution', 'parameters', 'health', 'serial']
        },
        {
          href: '/diagnostics/dns/dnssec-adflag',
          label: 'DNSSEC AD Flag Checker',
          description: 'Query DNS records via DoH and report if the AD (Authenticated Data) bit is set for DNSSEC validation',
          icon: 'dns-adflag',
          keywords: ['dnssec', 'ad', 'flag', 'authenticated', 'data', 'doh', 'validation', 'security', 'dns']
        },
        {
          href: '/diagnostics/dns/soa-serial',
          label: 'SOA Serial Analyzer',
          description: 'Analyze Start of Authority records to interpret serial number formats and examine DNS zone timing parameters',
          icon: 'dns-soa',
          keywords: ['soa', 'serial', 'analyzer', 'zone', 'timing', 'parameters', 'yyyymmddnn', 'unix', 'timestamp', 'dns']
        }
      ]
    },
    {
      title: 'HTTP Diagnostics',
      items: [
        {
          href: '/diagnostics/http/headers',
          label: 'HTTP Headers Analyzer',
          description: 'Analyze HTTP headers and response metadata with custom method and header support',
          icon: 'http-headers',
          keywords: ['http', 'headers', 'analyzer', 'response', 'metadata', 'custom', 'method', 'request']
        },
        {
          href: '/diagnostics/http/redirect-trace',
          label: 'Redirect Trace',
          description: 'Follow HTTP redirects and trace the full chain with security upgrade detection',
          icon: 'redirect-trace',
          keywords: ['http', 'redirect', 'trace', 'chain', 'hsts', 'security', 'upgrade', 'follow']
        },
        {
          href: '/diagnostics/http/security',
          label: 'Security Headers Analyzer',
          description: 'Analyze security headers (HSTS, CSP, X-Frame-Options) with grading and recommendations',
          icon: 'security-headers',
          keywords: ['http', 'security', 'headers', 'hsts', 'csp', 'x-frame-options', 'analyzer', 'grade']
        },
        {
          href: '/diagnostics/http/cors-check',
          label: 'CORS Policy Checker',
          description: 'Test CORS policies with preflight requests and origin validation',
          icon: 'cors-check',
          keywords: ['cors', 'policy', 'check', 'preflight', 'origin', 'validation', 'cross-origin', 'options']
        },
        {
          href: '/diagnostics/http/perf',
          label: 'HTTP Performance Analyzer',
          description: 'Measure HTTP performance timing including DNS, TCP, TLS, and TTFB metrics',
          icon: 'http-perf',
          keywords: ['http', 'performance', 'timing', 'dns', 'tcp', 'tls', 'ttfb', 'metrics', 'analyzer']
        }
      ]
    },
    {
      title: 'TLS Diagnostics',
      items: [
        {
          href: '/diagnostics/tls/certificate',
          label: 'TLS Certificate Analyzer',
          description: 'Analyze TLS certificates, view certificate chains, check expiration dates, and examine Subject Alternative Names',
          icon: 'tls-cert',
          keywords: ['tls', 'certificate', 'analyzer', 'chain', 'expiry', 'san', 'ssl', 'x509', 'fingerprint']
        },
        {
          href: '/diagnostics/tls/versions',
          label: 'TLS Versions Probe',
          description: 'Test which TLS protocol versions a server supports and assess overall security posture',
          icon: 'tls-version',
          keywords: ['tls', 'versions', 'probe', 'security', 'protocol', 'support', 'deprecated', 'assessment']
        },
        {
          href: '/diagnostics/tls/alpn',
          label: 'TLS ALPN Negotiation',
          description: 'Test Application-Layer Protocol Negotiation to see which protocol a server selects (HTTP/2, HTTP/3)',
          icon: 'tls-alpn',
          keywords: ['tls', 'alpn', 'negotiation', 'http2', 'http3', 'protocol', 'handshake', 'application']
        }
      ]
    },
    {
      title: 'Network Diagnostics',
      items: [
        {
          href: '/diagnostics/network/tcp-port-check',
          label: 'TCP Port Checker',
          description: 'Test TCP connectivity to host:port combinations and measure connection latency',
          icon: 'network-port',
          keywords: ['tcp', 'port', 'check', 'connectivity', 'latency', 'open', 'closed', 'firewall', 'scan']
        },
        {
          href: '/diagnostics/network/http-ping',
          label: 'HTTP Ping',
          description: 'Measure HTTP/HTTPS response latency with statistical analysis (median, p95) without raw ICMP',
          icon: 'network-ping',
          keywords: ['http', 'ping', 'latency', 'response', 'time', 'statistics', 'median', 'p95', 'web', 'api']
        }
      ]
    },
    {
      title: 'Email Diagnostics',
      items: [
        {
          href: '/diagnostics/email/mx-health',
          label: 'MX Health Checker',
          description: 'Check mail server (MX) health including DNS resolution and SMTP port connectivity testing',
          icon: 'email-mx',
          keywords: ['mx', 'health', 'check', 'mail', 'server', 'smtp', 'port', 'connectivity', 'dns', 'email']
        },
        {
          href: '/diagnostics/email/spf-check',
          label: 'SPF Policy Checker',
          description: 'Analyze SPF records with email deliverability focus and authentication policy evaluation',
          icon: 'email-spf',
          keywords: ['spf', 'policy', 'check', 'email', 'deliverability', 'authentication', 'sender', 'authorization']
        },
        {
          href: '/diagnostics/email/dmarc-check',
          label: 'DMARC Policy Checker',
          description: 'Check DMARC policies with email deliverability impact analysis and configuration recommendations',
          icon: 'email-dmarc',
          keywords: ['dmarc', 'policy', 'check', 'email', 'deliverability', 'authentication', 'reporting', 'alignment']
        }
      ]
    },
    {
      title: 'RDAP Diagnostics',
      items: [
        {
          href: '/diagnostics/rdap/domain',
          label: 'Domain RDAP Lookup',
          description: 'Query domain registration data using RDAP through IANA bootstrap registry with structured JSON responses',
          icon: 'dns-lookup',
          keywords: ['rdap', 'domain', 'registration', 'whois', 'iana', 'bootstrap', 'registry', 'json', 'lookup']
        },
        {
          href: '/diagnostics/rdap/ip',
          label: 'IP Address RDAP Lookup',
          description: 'Look up IP address allocation and registration data using RDAP through Regional Internet Registries',
          icon: 'rdap-ip',
          keywords: ['rdap', 'ip', 'allocation', 'registration', 'rir', 'arin', 'ripe', 'apnic', 'lacnic', 'afrinic']
        },
        {
          href: '/diagnostics/rdap/asn',
          label: 'ASN RDAP Lookup',
          description: 'Query Autonomous System Number allocation and registration data using RDAP through RIR services',
          icon: 'rdap-asn',
          keywords: ['rdap', 'asn', 'autonomous', 'system', 'number', 'allocation', 'registry', 'bgp', 'routing']
        }
      ]
    }
  ],
  '/reference': [
    {
      title: 'Fundamentals',
      items: [
        {
          href: '/reference/cidr',
          label: 'CIDR Notation Explained',
          description: 'What CIDR is, why it replaced IP classes, and how to read network prefixes',
          icon: 'ref-cidr'
        },
        {
          href: '/reference/vlsm',
          label: 'VLSM in Plain English',
          description: 'Variable Length Subnet Masking - when to use it and common pitfalls',
          icon: 'ref-vlsm'
        },
        {
          href: '/reference/supernetting',
          label: 'Route Summarization / Supernetting',
          description: 'Combine multiple networks into single routes for efficient routing',
          icon: 'ref-supernetting'
        }
      ]
    },
    {
      title: 'IPv6 Addressing',
      items: [
        {
          href: '/reference/ipv6-address-types',
          label: 'IPv6 Address Types & Key Prefixes',
          description: 'Global unicast, ULA, link-local, multicast, and special IPv6 addresses',
          icon: 'ref-ipv6-address-types'
        },
        {
          href: '/reference/ipv6-prefix-lengths',
          label: 'Common IPv6 Prefix Lengths',
          description: 'Quick reference for /128, /127, /64, /60, /56, /48, /32 with typical uses',
          icon: 'ref-ipv6-prefix-lens'
        },
        {
          href: '/reference/ipv6-embedded-ipv4',
          label: 'IPv4 in IPv6',
          description: 'IPv4-mapped addresses, 6to4, Teredo, and transition mechanisms',
          icon: 'ref-ipv4-in-ipv6'
        },
        {
          href: '/reference/ipv6-privacy-addresses',
          label: 'IPv6 Privacy Addresses',
          description: 'SLAAC privacy extensions: temporary vs stable interface identifiers',
          icon: 'ref-ipv6-privacy-address'
        }
      ]
    },
    {
      title: 'Special Addresses',
      items: [
        {
          href: '/reference/special-use-ipv4',
          label: 'Special-Use IPv4 Blocks (RFC 6890)',
          description: 'Reserved IPv4 ranges including private networks, CGNAT, and test blocks',
          icon: 'ref-special-blocks'
        },
        {
          href: '/reference/private-vs-public-ip',
          label: 'Private vs Public IP Addresses',
          description: 'Understanding private/public IPs, NAT implications, and identification',
          icon: 'ref-public-vs-private'
        },
        {
          href: '/reference/cgnat',
          label: 'Carrier-Grade NAT Explained',
          description: 'CGNAT (100.64.0.0/10), how to identify it, and service impacts',
          icon: 'ref-carrier-nat'
        },
        {
          href: '/reference/link-local-apipa',
          label: 'Link-Local & APIPA Addresses',
          description: 'IPv4 APIPA (169.254/16) and IPv6 link-local (fe80::/10) at a glance',
          icon: 'ref-link-local-apia'
        },
        {
          href: '/reference/multicast',
          label: 'IPv4 & IPv6 Multicast Basics',
          description: 'Multicast scopes, well-known groups, and local subnet limitations',
          icon: 'ref-multicast-basics'
        }
      ]
    },
    {
      title: 'DNS & Protocols',
      items: [
        {
          href: '/reference/reverse-dns',
          label: 'Reverse DNS (PTR Records)',
          description: 'How in-addr.arpa and ip6.arpa work with examples for IPv4 and IPv6',
          icon: 'ref-reverse-dns'
        },
        {
          href: '/reference/reverse-zones',
          label: 'Reverse Zones for CIDR Delegation',
          description: 'Minimal reverse DNS zones needed to delegate IPv4 and IPv6 CIDR blocks',
          icon: 'ref-reverse-zones'
        },
        {
          href: '/reference/icmp',
          label: 'ICMP & ICMPv6: Common Types',
          description: 'Practical guide to ICMP message types for network troubleshooting',
          icon: 'ref-icmp'
        },
        {
          href: '/reference/arp-vs-ndp',
          label: 'ARP vs NDP',
          description: 'Side-by-side comparison of IPv4 ARP and IPv6 Neighbor Discovery',
          icon: 'ref-arp-vs-ndp'
        }
      ]
    },
    {
      title: 'Network Operations',
      items: [
        {
          href: '/reference/asn',
          label: 'What is an ASN?',
          description: 'Autonomous Systems, BGP basics, and how IP addresses map to ASNs',
          icon: 'ref-asn'
        },
        {
          href: '/reference/ports',
          label: 'Common TCP/UDP Ports',
          description: 'Quick reference for frequently used port numbers and services',
          icon: 'ref-ports'
        },
        {
          href: '/reference/wildcard-masks',
          label: 'ACL Wildcard Masks',
          description: 'Wildcard masks vs netmasks, quick conversions and ACL examples',
          icon: 'ref-wildcard-masks'
        },
        {
          href: '/reference/mtu-mss',
          label: 'Common MTU/MSS Values',
          description: 'MTU and MSS values for Ethernet, PPPoE, VPN, and overhead calculations',
          icon: 'ref-mtu-mss'
        }
      ]
    }
  ],
};

export const footerLinks: NavItem[] = [
  { href: '/about', label: 'About' },
  { href: site.repo, label: 'GitHub' },
  { href: author.portfolio, label: 'More Apps →' },
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
    if ('href' in item) {
      // It's a NavItem
      items.push(item);
    } else if ('title' in item && 'items' in item) {
      // It's a NavGroup
      items.push(...item.items);
    }
  }
  
  return items;
}

// All pages for homepage navigation - combines standalone pages with sub-pages
export const ALL_PAGES: NavItem[] = [
  ...STANDALONE_PAGES,
  ...Object.values(SUB_NAV).map(section => extractAllNavItems(section as (NavItem | NavGroup)[])).flat()
];

// Helper: find the section key (e.g. '/reference') that matches a pathname
export function findSectionKey(pathname: string): string | null {
  const keys = Object.keys(SUB_NAV);
  return keys.find((k) => isActive(pathname, k)) ?? null;
}

// Helper: get page details for SEO from navigation
export function getPageDetails(href: string): { title: string; description: string; keywords: string[] } | null {
  for (const item of ALL_PAGES) {
    if (item.href === href) {
      return {
        title: item.label,
        description: item.description || '',
        keywords: item.keywords || []
      };
    }
  }
  return null;
}
