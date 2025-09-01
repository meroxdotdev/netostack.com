export type NavItem = {
  href: string;
  label: string;
  description?: string;
  icon?: string;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

// Individual standalone pages
export const STANDALONE_PAGES: NavItem[] = [];

export const TOP_NAV: NavItem[] = [
  { href: '/subnetting', label: 'Subnetting' },
  { href: '/cidr', label: 'CIDR Convert' },
  { href: '/ip-address-convertor', label: 'IP Tools' },
  { href: '/ip-reference', label: 'Reference' }
];

// Sections that have sub-pages (drives the conditional SubHeader)
export const SUB_NAV: Record<string, (NavItem | NavGroup)[]> = {
  '/subnetting': [
    { 
      href: '/subnetting/ipv4-subnet-calculator', 
      label: 'IPv4 Subnet Calculator',
      description: 'Calculate subnet information, network addresses, broadcast addresses, and host ranges with visual network analysis',
      icon: 'subnet-calculator'
    },
    { 
      href: '/subnetting/ipv6-subnet-calculator', 
      label: 'IPv6 Subnet Calculator',
      description: 'Calculate IPv6 subnets with 128-bit addressing and modern network prefix planning',
      icon: 'ipv6-subnet-calculator'
    },
    { 
      href: '/subnetting/vlsm-calculator', 
      label: 'VLSM Calculator',
      description: 'Variable Length Subnet Mask calculator to break networks into multiple smaller subnets with optimal allocation',
      icon: 'vlsm-calculator'
    },
    { 
      href: '/subnetting/supernet-calculator', 
      label: 'Supernet Calculator',
      description: 'Aggregate multiple networks into supernets for route summarization and efficient routing table management',
      icon: 'supernet-calculator'
    },
    { 
      href: '/subnetting/planner', 
      label: 'Subnet Planner',
      description: 'Design VLSM networks with drag-and-drop subnet planning and optimize address allocation strategies',
      icon: 'subnet-planner'
    }
  ],
  '/cidr': [
    {
      title: 'CIDR',
      items: [
        {
          href: '/cidr/mask-converter/cidr-to-subnet-mask', 
          label: 'CIDR → Mask',
          description: 'Convert CIDR notation (e.g. /24) to subnet mask format (255.255.255.0)',
          icon: 'cidr-convertor'
        },
        { 
          href: '/cidr/mask-converter/subnet-mask-to-cidr',
          label: 'Mask → CIDR',
          description: 'Convert subnet mask format (255.255.255.0) to CIDR notation (/24)',
          icon: 'cidr-convertor-mask'
        },
      ],
    },
    { 
      href: '/cidr/summarize',
      label: 'CIDR Summarizer',
      description: 'Optimize mixed IP addresses, CIDR blocks, and ranges into minimal CIDR prefixes',
      icon: 'cidr-summarize'
    },
    { 
      href: '/cidr/split',
      label: 'CIDR Split',
      description: 'Split a network into N equal child subnets or to a target prefix length',
      icon: 'subnet-splitter'
    },
    { 
      href: '/cidr/next-available',
      label: 'Next Available Subnet',
      description: 'Find available subnets from pools minus allocations with first-fit or best-fit policies',
      icon: 'next-available-subnet'
    },
    { 
      href: '/cidr/alignment',
      label: 'CIDR Alignment',
      description: 'Check if IP addresses and ranges align to CIDR prefix boundaries with optimization suggestions',
      icon: 'alignment'
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
          icon: 'ip-convertor'
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
          icon: 'calculator'
        },
        {
          href: '/ip-address-convertor/nth-ip',
          label: 'Nth IP Calculator',
          description: 'Resolve the IP address at a specific index within networks and ranges with offset support',
          icon: 'hash'
        },
        {
          href: '/ip-address-convertor/random',
          label: 'Random IP Generator',
          description: 'Generate random IP addresses from networks with uniqueness control and seeded randomness',
          icon: 'shuffle'
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
          icon: 'check-square'
        },
        {
          href: '/ip-address-convertor/notation/zone-id',
          label: 'IPv6 Zone ID Handler',
          description: 'Process IPv6 addresses with zone identifiers for link-local and multicast addresses',
          icon: 'link'
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
          icon: 'shuffle'
        },
        {
          href: '/ip-address-convertor/ula-generator',
          label: 'ULA Generator',
          description: 'Generate RFC 4193 Unique Local Addresses with cryptographically secure Global IDs',
          icon: 'key'
        }
      ]
    }
  ],
  '/ip-reference': [
    { 
      href: '/ip-reference/network-classes', 
      label: 'Network Classes',
      description: 'IP address classes (A, B, C, D, E) and their characteristics',
      icon: 'network-classes'
    },
    { 
      href: '/ip-reference/reserved-ranges', 
      label: 'Reserved Ranges',
      description: 'Private networks, loopback, multicast, and special IP ranges',
      icon: 'reserved-ranges'
    },
    { 
      href: '/ip-reference/common-subnets', 
      label: 'Common Subnets',
      description: 'Quick reference for frequently used subnet configurations',
      icon: 'common-subnets'
    }
  ]
};

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
