<script lang="ts">
  import { site } from '$lib/constants/site';
  import { SUB_NAV } from '$lib/constants/nav';
  import ToolsGrid from '$lib/components/global/ToolsGrid.svelte';
  import type { NavItem, NavGroup } from '$lib/constants/nav';
  import '../../styles/pages.scss';

  // Extract tools for IP address converter section
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

  const ipTools = extractNavItems(SUB_NAV['/ip-address-convertor'] || []);
</script>

<svelte:head>
  <title>IP Address Tools & Converters | {site.title}</title>
  <meta name="description" content="Comprehensive IP address tools including format converters, distance calculators, random generators, and IPv6 notation tools." />
  <meta name="keywords" content="{site.keywords}, IP address converter, IPv6 tools, IP distance calculator, random IP generator, EUI-64, ULA generator" />
  <meta property="og:title" content="IP Address Tools & Converters" />
  <meta property="og:description" content="Professional IP address tools for network engineers including converters, calculators, and generators." />
  <meta property="og:url" content="{site.url}/ip-address-convertor" />
</svelte:head>

<div class="page-container">
  <header class="page-header">
    <h1>IP Address Tools & Converters</h1>
    <p class="page-description">
      Comprehensive IP address manipulation tools for IPv4 and IPv6. 
      Convert between formats, calculate distances, generate addresses, and work with advanced IPv6 features.
    </p>
  </header>

  <ToolsGrid tools={ipTools} />

</div>

<style>


</style>

