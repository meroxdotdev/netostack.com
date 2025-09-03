<script lang="ts">
  import { site } from '$lib/constants/site';
  import PTRGenerator from '$lib/components/PTRGenerator.svelte';
</script>

<svelte:head>
  <title>PTR Record Generator - DNS Reverse Lookup (in-addr.arpa & ip6.arpa) | {site.title}</title>
  <meta name="description" content="Generate PTR record names for IPv4 and IPv6 addresses and CIDR blocks. Creates proper in-addr.arpa and ip6.arpa reverse DNS entries with zone file stubs." />
  <meta name="keywords" content="ptr records, reverse dns, in-addr.arpa, ip6.arpa, zone file, dns generator, reverse lookup, dns records" />
  <meta property="og:title" content="PTR Record Generator - DNS Reverse Lookup Generator" />
  <meta property="og:description" content="Generate PTR record names and zone file stubs for IPv4 and IPv6 reverse DNS lookups." />
  <meta property="og:url" content="{site.url}/dns/ptr-generator" />
</svelte:head>

<PTRGenerator />