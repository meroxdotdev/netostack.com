<script lang="ts">
  import RandomIP from '$lib/components/tools/RandomIP.svelte';
  import { site } from '$lib/constants/site';
</script>

<svelte:head>
  <title>Random IP Generator - Generate Random IPs | {site.title}</title>
  <meta name="description" content="Generate random IP addresses from networks and ranges. Control uniqueness, use seeds for reproducible results, and export in multiple formats." />
  <meta name="keywords" content="{site.keywords}, random IP, IP generator, random addresses, IPv4, IPv6, network testing" />
  <meta property="og:title" content="Random IP Generator - Generate Random IPs" />
  <meta property="og:description" content="Generate random IP addresses from networks and ranges with advanced options." />
  <meta property="og:url" content="{site.url}/ip-address-convertor/random" />
</svelte:head>

<div class="page-container">
  <RandomIP />
</div>
