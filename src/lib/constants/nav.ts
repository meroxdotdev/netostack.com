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
