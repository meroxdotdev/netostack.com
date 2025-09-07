<script lang="ts">
  import { site } from '$lib/constants/site';
  import TTLCalculator from '$lib/components/tools/TTLCalculator.svelte';
</script>

<svelte:head>
  <title>DNS TTL Calculator - Humanize TTLs and Compute Cache Expiry Times | {site.title}</title>
  <meta name="description" content="Humanize DNS TTL values and compute cache expiry times from now or specific dates. Get TTL recommendations based on record stability and use case." />
  <meta name="keywords" content="dns ttl calculator, ttl humanize, cache expiry, dns cache, ttl recommendations, dns timing, record expiry, dns propagation" />
  <meta property="og:title" content="DNS TTL Calculator - TTL Analysis and Cache Expiry" />
  <meta property="og:description" content="Humanize DNS TTL values and compute cache expiry times with recommendations for optimal DNS performance." />
  <meta property="og:url" content="{site.url}/dns/ttl-calculator" />
</svelte:head>

<TTLCalculator />