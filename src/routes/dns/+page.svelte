<script lang="ts">
  import { site } from '$lib/constants/site';
  import { SUB_NAV } from '$lib/constants/nav';
  import ToolsGrid from '$lib/components/global/ToolsGrid.svelte';
  import type { NavItem, NavGroup } from '$lib/constants/nav';
  import '../../styles/pages.scss';

  // Extract tools for DNS section
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

  const dnsTools = extractNavItems(SUB_NAV['/dns'] || []);
</script>

<svelte:head>
  <title>DNS Tools & Record Generators | {site.title}</title>
  <meta name="description" content="Professional DNS tools for generating PTR records, reverse DNS lookups, and zone file management for IPv4 and IPv6 networks." />
  <meta name="keywords" content="{site.keywords}, DNS tools, PTR records, reverse DNS, in-addr.arpa, ip6.arpa, zone files, DNS generators" />
  <meta property="og:title" content="DNS Tools & Record Generators" />
  <meta property="og:description" content="Professional DNS tools for network engineers including PTR record generation and reverse DNS management." />
  <meta property="og:url" content="{site.url}/dns" />
</svelte:head>

<div class="page-container">
  <header class="page-header">
    <h1>DNS Tools & Record Generators</h1>
    <p class="page-description">
      Professional DNS management tools for network administrators. 
      Generate PTR records, create zone files, and manage reverse DNS lookups for both IPv4 and IPv6 networks.
    </p>
  </header>

  <ToolsGrid tools={dnsTools} />

</div>

<style>


</style>

