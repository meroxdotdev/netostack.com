<script lang="ts">
  import { site } from '$lib/constants/site';
  import FreeSpaceFinder from '$lib/components/tools/FreeSpaceFinder.svelte';
</script>

<svelte:head>
  <title>Free Space Finder - Find Available CIDR Blocks | {site.title}</title>
  <meta name="description" content="Find all free space within network pools minus allocations. Filter available blocks by target prefix length for efficient IP address planning." />
  <meta name="keywords" content="free space, gaps finder, CIDR blocks, network pools, IP allocations, prefix filtering, network planning" />
  <meta property="og:title" content="Free Space Finder - Available CIDR Blocks" />
  <meta property="og:description" content="Identify unused address space within network pools to optimize IP allocation and planning." />
  <meta property="og:url" content="{site.url}/cidr/gaps" />
</svelte:head>

<FreeSpaceFinder />
