<script lang="ts">
  import { site, pages } from '$lib/constants/site';
  import IPFamilyConverter from '$lib/components/IPFamilyConverter.svelte';
</script>

<svelte:head>
  <title>IPv6 to IPv4 Converter - {site.title}</title>
  <meta name="description" content="Extract IPv4 addresses from IPv4-mapped IPv6 addresses. Analyze IPv6 address types and formats." />
  <meta name="keywords" content="IPv6, IPv4, conversion, IPv4-mapped IPv6, IP address converter, network tools" />
  <meta property="og:title" content="IPv6 to IPv4 Converter - {site.title}" />
  <meta property="og:description" content="Extract IPv4 addresses from IPv4-mapped IPv6 addresses" />
  <meta property="og:url" content="{site.url}/ip-family-convertor/ipv6-to-ipv4" />
</svelte:head>

<IPFamilyConverter 
  direction="ipv6-to-ipv4"
  title="IPv6 to IPv4 Converter"
  description="Extract IPv4 addresses from IPv4-mapped IPv6 addresses. This tool can identify and extract the original IPv4 address from IPv6 representations."
/>