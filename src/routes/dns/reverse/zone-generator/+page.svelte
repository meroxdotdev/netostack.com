<script lang="ts">
  import { site } from '$lib/constants/site';
  import ReverseZoneGenerator from '$lib/components/tools/ReverseZoneGenerator.svelte';
</script>

<svelte:head>
  <title>Reverse Zone Generator - Generate Full Reverse Zones from CIDR & Hostname Template | {site.title}</title>
  <meta name="description" content="Generate complete reverse DNS zone files from CIDR blocks with customizable hostname templates. Create in-addr.arpa and ip6.arpa zone files with SOA, NS, and PTR records." />
  <meta name="keywords" content="reverse dns zone, zone file generator, in-addr.arpa, ip6.arpa, cidr to zone file, dns zone template, ptr records, hostname template" />
  <meta property="og:title" content="Reverse Zone Generator - Full Zone Files from CIDR" />
  <meta property="og:description" content="Generate complete reverse DNS zone files from CIDR blocks with customizable hostname templates." />
  <meta property="og:url" content="{site.url}/dns/reverse/zone-generator" />
</svelte:head>

<ReverseZoneGenerator />