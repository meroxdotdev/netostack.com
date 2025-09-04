<script lang="ts">
  import CIDRDiff from '$lib/components/tools/CIDRDiff.svelte';
  import { site } from '$lib/constants/site';
</script>

<svelte:head>
  <title>CIDR Set Difference Calculator - Compute A - B Operations | {site.title}</title>
  <meta name="description" content="Calculate CIDR set differences with A - B operations. Supports IPv4/IPv6 networks, ranges, and single IPs with visualization and alignment options." />
  <meta name="keywords" content="{site.keywords}, CIDR difference, set operations, network subtraction, IP set operations, CIDR calculator" />
  <meta property="og:title" content="CIDR Set Difference Calculator - Compute A - B Operations" />
  <meta property="og:description" content="Perform set difference operations on CIDR blocks with minimal alignment and visualization." />
  <meta property="og:url" content="{site.url}/cidr/set-operations/diff" />
</svelte:head>

<div class="page-container">
  <CIDRDiff />
</div>
