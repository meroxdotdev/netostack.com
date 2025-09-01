<script lang="ts">
  import CIDRAlignment from '$lib/components/CIDRAlignment.svelte';
  import { site } from '$lib/constants/site';
</script>

<svelte:head>
  <title>CIDR Boundary Alignment - Align Networks to Prefix Boundaries | {site.title}</title>
  <meta name="description" content="Check if IP addresses, ranges, and CIDR blocks align to specific prefix boundaries. Get alignment suggestions and optimization recommendations." />
  <meta name="keywords" content="{site.keywords}, CIDR alignment, prefix boundaries, network alignment, IP boundaries, subnet alignment" />
  <meta property="og:title" content="CIDR Boundary Alignment - Align Networks to Prefix Boundaries" />
  <meta property="og:description" content="Check network alignment to prefix boundaries with detailed analysis and optimization suggestions." />
  <meta property="og:url" content="{site.url}/cidr/alignment" />
</svelte:head>

<div class="page-container">
  <CIDRAlignment />
</div>