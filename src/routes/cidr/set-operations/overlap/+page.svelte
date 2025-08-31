<script lang="ts">
  import CIDROverlap from '$lib/components/CIDROverlap.svelte';
  import { site } from '$lib/constants/site';
</script>

<svelte:head>
  <title>CIDR Overlap Checker - Detect Set Intersections | {site.title}</title>
  <meta name="description" content="Check if two sets of CIDR blocks, IP ranges, or addresses intersect. Shows overlapping regions with detailed visualization and statistics." />
  <meta name="keywords" content="{site.keywords}, CIDR overlap, set intersection, IP overlap detection, network intersection, CIDR analysis" />
  <meta property="og:title" content="CIDR Overlap Checker - Detect Set Intersections" />
  <meta property="og:description" content="Analyze overlapping IP address ranges with intersection detection and visualization." />
  <meta property="og:url" content="{site.url}/cidr/set-operations/overlap" />
</svelte:head>

<div class="page-container">
  <CIDROverlap />
</div>