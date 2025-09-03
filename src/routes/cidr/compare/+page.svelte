<script lang="ts">
  import { site } from '$lib/constants/site';
  import CIDRCompare from '$lib/components/CIDRCompare.svelte';
</script>

<svelte:head>
  <title>CIDR Compare - Network Audit Tool | {site.title}</title>
  <meta name="description" content="Compare two lists of CIDR blocks to identify added, removed, and unchanged networks. Perfect for network audits and change management." />
  <meta name="keywords" content="cidr compare, network audit, diff, compare networks, added removed unchanged, cidr normalization, network change management" />
  <meta property="og:title" content="CIDR Compare - Network List Audit Tool" />
  <meta property="og:description" content="Audit network changes by comparing CIDR lists to see what was added, removed, or unchanged." />
  <meta property="og:url" content="{site.url}/cidr/compare" />
</svelte:head>

<CIDRCompare />