<script lang="ts">
  import NextAvailable from '$lib/components/tools/NextAvailable.svelte';
  import { site } from '$lib/constants/site';
</script>

<svelte:head>
  <title>Next Available Subnet Finder - Find Free Subnets in Pools | {site.title}</title>
  <meta name="description" content="Find available subnets from IP address pools minus allocations. Support for first-fit and best-fit policies with detailed free space analysis." />
  <meta name="keywords" content="{site.keywords}, subnet finder, IP allocation, free subnets, network planning, IPAM, address management" />
  <meta property="og:title" content="Next Available Subnet Finder - Find Free Subnets in Pools" />
  <meta property="og:description" content="Efficiently find available subnets from pools with advanced allocation policies and visualization." />
  <meta property="og:url" content="{site.url}/cidr/next-available" />
</svelte:head>

<div class="page-container">
  <NextAvailable />
</div>
