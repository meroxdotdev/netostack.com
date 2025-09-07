<script lang="ts">
  import { site } from '$lib/constants/site';
  import PTRSweepPlanner from '$lib/components/tools/PTRSweepPlanner.svelte';
</script>

<svelte:head>
  <title>PTR Sweep Planner - Plan PTR Coverage for Network Blocks | {site.title}</title>
  <meta name="description" content="Plan PTR record coverage for network blocks. Analyze missing and extra PTR records against naming patterns, identify coverage gaps, and generate remediation plans." />
  <meta name="keywords" content="ptr coverage, reverse dns analysis, ptr sweep, dns audit, reverse dns gaps, ptr records analysis, network dns coverage" />
  <meta property="og:title" content="PTR Sweep Planner - DNS Coverage Analysis" />
  <meta property="og:description" content="Analyze PTR record coverage for network blocks and identify missing or extra records against naming patterns." />
  <meta property="og:url" content="{site.url}/dns/reverse/ptr-sweep-planner" />
</svelte:head>

<PTRSweepPlanner />