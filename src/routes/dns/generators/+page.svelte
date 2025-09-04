<script lang="ts">
  import { site } from '$lib/constants/site';
  import { SUB_NAV } from '$lib/constants/nav';
  import ToolsGrid from '$lib/components/global/ToolsGrid.svelte';
  import type { NavItem, NavGroup } from '$lib/constants/nav';
  import '../../../styles/pages.scss';

  function extractNavItems(items: (NavItem | NavGroup)[]): NavItem[] {
    const navItems: NavItem[] = [];
    for (const item of items) {
      if ('href' in item) {
        navItems.push(item);
      } else if ('title' in item && 'items' in item) {
        navItems.push(...item.items);
      }
    }
    return navItems;
  }

  const dnsGenerators = extractNavItems(SUB_NAV['/dns']?.find(section => 'title' in section && section.title === 'Record Generators')?.items || []);
</script>

<svelte:head>
  <title>DNS Record Generators | {site.title}</title>
  <meta name="description" content="Professional DNS record generators for A/AAAA bulk creation, CNAME building with validation, and MX record planning with fallback guidance." />
  <meta name="keywords" content="{site.keywords}, DNS generators, A records, AAAA records, CNAME, MX records, bulk DNS, record builder" />
  <meta property="og:title" content="DNS Record Generators" />
  <meta property="og:description" content="Generate DNS records efficiently with validation and best practices built-in." />
  <meta property="og:url" content="{site.url}/dns/generators" />
</svelte:head>

<div class="page-container">
  <header class="page-header">
    <h1>DNS Record Generators</h1>
    <p class="page-description">
      Professional DNS record generation tools with built-in validation and best practices. 
      Create bulk A/AAAA records, build validated CNAME chains, and plan MX configurations with proper fallback strategies.
    </p>
  </header>

  <ToolsGrid tools={dnsGenerators} />
</div>
