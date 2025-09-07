<script lang="ts">
  import { site } from '$lib/constants/site';
  import ReverseZonesCalculator from '$lib/components/tools/ReverseZonesCalculator.svelte';
</script>

<svelte:head>
  <title>Reverse Zones Calculator - Minimal Set of Reverse Zones for CIDR Delegation | {site.title}</title>
  <meta name="description" content="Calculate the minimal set of reverse DNS zones needed to delegate a CIDR block. Handles IPv4 octet boundaries and IPv6 nibble math for proper zone delegation." />
  <meta name="keywords" content="reverse dns zones, zone delegation, cidr delegation, nibble boundaries, octet boundaries, in-addr.arpa zones, ip6.arpa zones, dns delegation" />
  <meta property="og:title" content="Reverse Zones Calculator - Minimal DNS Zone Delegation" />
  <meta property="og:description" content="Calculate the minimal set of reverse DNS zones needed for CIDR block delegation with proper boundary calculations." />
  <meta property="og:url" content="{site.url}/dns/reverse/reverse-zones" />
</svelte:head>

<ReverseZonesCalculator />