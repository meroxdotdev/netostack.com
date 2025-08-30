export type NavItem = {
  href: string;
  label: string;
};

export const TOP_NAV: NavItem[] = [
  { href: '/subnet-calculator', label: 'Subnet Calc' },
  { href: '/cidr-convertor',    label: 'CIDR Convert' },
  { href: '/ip-address-convertor', label: 'IP Convert' },
  { href: '/ip-reference',         label: 'Reference' }
];

// Sections that have sub-pages (drives the conditional SubHeader)
export const SUB_NAV: Record<string, NavItem[]> = {
  '/cidr-convertor': [
    { href: '/cidr-convertor/cidr-to-subnet-mask',     label: 'CIDR → Mask' },
    { href: '/cidr-convertor/subnet-mask-to-cidr',     label: 'Mask → CIDR' }
  ],
  '/ip-reference': [
    { href: '/ip-reference/network-classes',  label: 'Network Classes' },
    { href: '/ip-reference/reserved-ranges',  label: 'Reserved Ranges' },
    { href: '/ip-reference/common-subnets',   label: 'Common Subnets' }
  ]
};

// Helper: is a nav item active for a given pathname?
export function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

// Helper: find the section key (e.g. '/reference') that matches a pathname
export function findSectionKey(pathname: string): string | null {
  const keys = Object.keys(SUB_NAV);
  return keys.find((k) => isActive(pathname, k)) ?? null;
}
