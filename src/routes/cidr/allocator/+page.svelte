<script lang="ts">
  import { site } from '$lib/constants/site';
  import CIDRAllocator from '$lib/components/tools/CIDRAllocator.svelte';
</script>

<svelte:head>
  <title>CIDR Allocator - Subnet Bin Packing | {site.title}</title>
  <meta name="description" content="Pack requested subnet sizes into network pools using advanced bin-packing algorithms. Optimize subnet allocation with first-fit and best-fit strategies." />
  <meta name="keywords" content="cidr allocator, subnet allocation, bin packing, first-fit, best-fit, network planning, subnet optimization, address space management" />
  <meta property="og:title" content="CIDR Allocator - Intelligent Subnet Packing" />
  <meta property="og:description" content="Efficiently allocate subnets into network pools using proven bin-packing algorithms for optimal address space utilization." />
  <meta property="og:url" content="{site.url}/cidr/allocator" />
</svelte:head>

<CIDRAllocator />
