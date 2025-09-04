<script lang="ts">
  import IPDistance from '$lib/components/tools/IPDistance.svelte';
  import { site } from '$lib/constants/site';
</script>

<svelte:head>
  <title>IP Distance Calculator - Calculate Addresses Between IPs | {site.title}</title>
  <meta name="description" content="Calculate the number of addresses between two IP addresses with inclusive/exclusive counting. Supports both IPv4 and IPv6 with intermediate address display." />
  <meta name="keywords" content="{site.keywords}, IP distance, address calculation, IPv4, IPv6, IP range" />
  <meta property="og:title" content="IP Distance Calculator - Calculate Addresses Between IPs" />
  <meta property="og:description" content="Calculate the number of addresses between two IP addresses with comprehensive counting options." />
  <meta property="og:url" content="{site.url}/ip-address-convertor/distance" />
</svelte:head>

<div class="page-container">
  <IPDistance />
</div>
