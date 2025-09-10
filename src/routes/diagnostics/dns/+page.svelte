<script lang="ts">
  import { site } from '$lib/constants/site';
  import { SUB_NAV } from '$lib/constants/nav';
  import ToolsGrid from '$lib/components/global/ToolsGrid.svelte';
  import type { NavItem, NavGroup } from '$lib/constants/nav';
  import '../../../styles/pages.scss';

  // Extract DNS diagnostics tools
  function extractNavItems(items: (NavItem | NavGroup)[]): NavItem[] {
    const navItems: NavItem[] = [];
    for (const item of items) {
      if ('href' in item) {
        navItems.push(item);
      } else if ('title' in item && 'items' in item) {
        // Filter for DNS diagnostics only
        if (item.title === 'DNS Diagnostics') {
          navItems.push(...item.items);
        }
      }
    }
    return navItems;
  }

  const dnsTools = extractNavItems(SUB_NAV['/diagnostics'] || []);
</script>

<svelte:head>
  <title>DNS Diagnostics Tools | {site.title}</title>
  <meta name="description" content="Comprehensive DNS diagnostic tools for troubleshooting, propagation checking, SPF evaluation, DMARC analysis, and nameserver verification." />
  <meta name="keywords" content="{site.keywords}, DNS diagnostics, propagation checker, SPF evaluator, DMARC analyzer, CAA checker, nameserver verification, reverse DNS" />
  <meta property="og:title" content="DNS Diagnostics Tools" />
  <meta property="og:description" content="Professional DNS diagnostic tools for network troubleshooting and policy analysis." />
  <meta property="og:url" content="{site.url}/diagnostics/dns" />
</svelte:head>

<div class="page-container">
  <header class="page-header">
    <h1>DNS Diagnostics Tools</h1>
    <p class="page-description">
      Comprehensive DNS diagnostic and troubleshooting tools for network administrators.
      Verify DNS propagation, analyze email security policies, check certificate authority authorization, and diagnose nameserver consistency issues.
    </p>
  </header>

  <ToolsGrid tools={dnsTools} />

</div>

<style>


</style>