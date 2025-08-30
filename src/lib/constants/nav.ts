export type NavItem = {
  href: string;
  label: string;
  description?: string;
  icon?: string;
};

// Individual standalone pages
export const STANDALONE_PAGES: NavItem[] = [
  {
    href: '/subnet-calculator',
    label: 'Subnet Calculator',
    description: 'Calculate subnet information, network addresses, broadcast addresses, and host ranges with visual network analysis',
    icon: 'calculator'
  },
  {
    href: '/ip-address-convertor',
    label: 'IP Address Converter',
    description: 'Convert IP addresses between decimal, binary, hexadecimal, and octal number systems',
    icon: 'transform'
  }
];

export const TOP_NAV: NavItem[] = [
  { href: '/subnet-calculator', label: 'Subnet Calc' },
  { href: '/cidr-convertor', label: 'CIDR Convert' },
  { href: '/ip-address-convertor', label: 'IP Convert' },
  { href: '/ip-reference', label: 'Reference' }
];

// Sections that have sub-pages (drives the conditional SubHeader)
export const SUB_NAV: Record<string, NavItem[]> = {
  '/cidr-convertor': [
    { 
      href: '/cidr-convertor/cidr-to-subnet-mask', 
      label: 'CIDR → Mask',
      description: 'Convert CIDR notation (e.g. /24) to subnet mask format (255.255.255.0)',
      icon: 'arrow-right'
    },
    { 
      href: '/cidr-convertor/subnet-mask-to-cidr', 
      label: 'Mask → CIDR',
      description: 'Convert subnet mask format (255.255.255.0) to CIDR notation (/24)',
      icon: 'arrow-left'
    }
  ],
  '/ip-reference': [
    { 
      href: '/ip-reference/network-classes', 
      label: 'Network Classes',
      description: 'IP address classes (A, B, C, D, E) and their characteristics',
      icon: 'layers'
    },
    { 
      href: '/ip-reference/reserved-ranges', 
      label: 'Reserved Ranges',
      description: 'Private networks, loopback, multicast, and special IP ranges',
      icon: 'shield'
    },
    { 
      href: '/ip-reference/common-subnets', 
      label: 'Common Subnets',
      description: 'Quick reference for frequently used subnet configurations',
      icon: 'grid'
    }
  ]
};

// Helper: is a nav item active for a given pathname?
export function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

// All pages for homepage navigation - combines standalone pages with sub-pages
export const ALL_PAGES: NavItem[] = [
  ...STANDALONE_PAGES,
  ...Object.values(SUB_NAV).flat()
];

// Helper: find the section key (e.g. '/reference') that matches a pathname
export function findSectionKey(pathname: string): string | null {
  const keys = Object.keys(SUB_NAV);
  return keys.find((k) => isActive(pathname, k)) ?? null;
}
