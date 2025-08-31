<script lang="ts">
  import { site, pages } from '$lib/constants/site';
  import IPFamilyConverter from '$lib/components/IPFamilyConverter.svelte';
</script>

<svelte:head>
  <title>IPv4 to IPv6 Converter - {site.title}</title>
  <meta name="description" content="Convert IPv4 addresses to IPv6 format using IPv4-mapped IPv6 addressing. Support for compressed, expanded, and dotted notations." />
  <meta name="keywords" content="IPv4, IPv6, conversion, IPv4-mapped IPv6, IP address converter, network tools" />
  <meta property="og:title" content="IPv4 to IPv6 Converter - {site.title}" />
  <meta property="og:description" content="Convert IPv4 addresses to IPv6 format using IPv4-mapped IPv6 addressing" />
  <meta property="og:url" content="{site.url}/ip-address-convertor/families/ipv4-to-ipv6" />
</svelte:head>

<IPFamilyConverter 
  direction="ipv4-to-ipv6"
  title="IPv4 to IPv6 Converter"
  description="Convert IPv4 addresses to IPv6 format using IPv4-mapped IPv6 addressing. This creates IPv6 addresses that embed IPv4 addresses for compatibility purposes."
/>