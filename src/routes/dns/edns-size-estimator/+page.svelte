<script lang="ts">
  import { site } from '$lib/constants/site';
  import EDNSSizeEstimator from '$lib/components/tools/EDNSSizeEstimator.svelte';
</script>

<svelte:head>
  <title>EDNS Size Estimator - Estimate Message Size and UDP Fragmentation Risk | {site.title}</title>
  <meta name="description" content="Estimate DNS message size and UDP fragmentation risk with EDNS buffer recommendations. Analyze response sizes and optimize for reliable DNS delivery." />
  <meta name="keywords" content="edns size estimator, dns message size, udp fragmentation, edns buffer, dns response size, dns optimization, fragmentation risk, edns0" />
  <meta property="og:title" content="EDNS Size Estimator - DNS Message Size Analysis" />
  <meta property="og:description" content="Estimate DNS message sizes and fragmentation risk with EDNS buffer recommendations for optimal DNS performance." />
  <meta property="og:url" content="{site.url}/dns/edns-size-estimator" />
</svelte:head>

<EDNSSizeEstimator />