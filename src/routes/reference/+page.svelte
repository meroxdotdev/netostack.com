<script lang="ts">
  import { site } from '$lib/constants/site';
  import { SUB_NAV } from '$lib/constants/nav';
  import ToolsGrid from '$lib/components/ToolsGrid.svelte';
  import type { NavItem, NavGroup } from '$lib/constants/nav';

  // Extract reference pages from SUB_NAV
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

  const referencePages = extractNavItems(SUB_NAV['/reference'] || []);
</script>

<svelte:head>
  <title>Networking Reference Guide | {site.title}</title>
  <meta name="description" content="Complete networking reference guide covering CIDR, VLSM, IPv6, special-use addresses, common ports, and more." />
  <meta name="keywords" content="{site.keywords}, networking reference, CIDR guide, IPv6 reference, port numbers, network documentation" />
  <meta property="og:title" content="Networking Reference Guide" />
  <meta property="og:description" content="Comprehensive networking reference covering IP addressing, routing, and common protocols." />
  <meta property="og:url" content="{site.url}/reference" />
</svelte:head>

<div class="ref-header">
  <h1>Networking Pocket Reference</h1>
  <p>Offline quick guides, cheat sheets and reference info, for networking concepts, IP addressing, and common protocols</p>
</div>

<ToolsGrid tools={referencePages} />

<style>

</style>
