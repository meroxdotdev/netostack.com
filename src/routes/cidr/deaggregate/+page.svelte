<script lang="ts">
  import { site } from '$lib/constants/site';
  import CIDRDeaggregate from '$lib/components/tools/CIDRDeaggregate.svelte';
</script>

<svelte:head>
  <title>CIDR Deaggregate - Decompose to Uniform Prefixes | {site.title}</title>
  <meta name="description" content="Decompose arbitrary CIDR blocks and IP ranges into uniform target prefix subnets. Break large networks into /24s, /28s, or any target prefix length." />
  <meta name="keywords" content="cidr deaggregate, decompose, uniform prefix, break subnets, target prefix, network decomposition, subnet breakdown" />
  <meta property="og:title" content="CIDR Deaggregate - Uniform Prefix Decomposition" />
  <meta property="og:description" content="Break down CIDR blocks and ranges into consistent subnet sizes for efficient network management." />
  <meta property="og:url" content="{site.url}/cidr/deaggregate" />
</svelte:head>

<CIDRDeaggregate />
