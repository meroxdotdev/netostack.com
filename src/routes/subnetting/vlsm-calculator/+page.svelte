<script lang="ts">
  import VLSMCalculator from '$lib/components/VLSMCalculator.svelte';
  import { site, pages } from '$lib/constants/site';
  import '../../../styles/pages.scss';
</script>

<svelte:head>
  <title>VLSM Calculator - Variable Length Subnet Mask Tool | {site.name}</title>
  <meta name="description" content="Calculate VLSM subnets efficiently. Break down networks into multiple smaller subnets with optimal IP address allocation and minimal waste." />
  <meta name="keywords" content="{site.keywords}, VLSM, variable length subnet mask, subnet planning, network design" />
  <meta property="og:title" content="VLSM Calculator - Variable Length Subnet Mask Tool" />
  <meta property="og:description" content="Calculate VLSM subnets efficiently. Break down networks into multiple smaller subnets with optimal IP address allocation and minimal waste." />
  <meta property="og:url" content="{site.url}/subnetting/vlsm-calculator" />
</svelte:head>

<VLSMCalculator />