<script lang="ts">
  import NthIP from '$lib/components/tools/NthIP.svelte';
  import { site } from '$lib/constants/site';
</script>

<svelte:head>
  <title>Nth IP Calculator - Find IP at Index | {site.title}</title>
  <meta name="description" content="Resolve the IP address at a specific index within networks and ranges. Supports both IPv4 and IPv6 with flexible offset options and multiple input formats." />
  <meta name="keywords" content="{site.keywords}, nth IP, IP index, address lookup, IPv4, IPv6, network range" />
  <meta property="og:title" content="Nth IP Calculator - Find IP at Index" />
  <meta property="og:description" content="Find the IP address at a specific index within networks and IP ranges." />
  <meta property="og:url" content="{site.url}/ip-address-convertor/nth-ip" />
</svelte:head>

<div class="page-container">
  <NthIP />
</div>
