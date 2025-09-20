<script lang="ts">
  
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

