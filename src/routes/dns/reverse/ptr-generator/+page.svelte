<script lang="ts">
  import { site } from '$lib/constants/site';
  import ReversePTRGenerator from '$lib/components/tools/ReversePTRGenerator.svelte';
</script>

<svelte:head>
  <title>Reverse PTR Generator - IPs/CIDRs to PTR Names & Zone Lines | {site.title}</title>
  <meta name="description" content="Generate PTR record names and zone file lines from IP addresses or CIDR blocks. Convert IPv4 and IPv6 addresses to in-addr.arpa and ip6.arpa reverse DNS entries." />
  <meta name="keywords" content="ptr records, reverse dns, in-addr.arpa, ip6.arpa, zone file, dns generator, reverse lookup, cidr to ptr" />
  <meta property="og:title" content="Reverse PTR Generator - IPs/CIDRs to PTR Names" />
  <meta property="og:description" content="Generate PTR record names and zone file lines from IP addresses or CIDR blocks for reverse DNS setup." />
  <meta property="og:url" content="{site.url}/dns/reverse/ptr-generator" />
</svelte:head>

<ReversePTRGenerator />