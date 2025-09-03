<script lang="ts">
  import { site } from '$lib/constants/site';
  import IPv6NAT64 from '$lib/components/IPv6NAT64.svelte';
</script>

<svelte:head>
  <title>IPv6 NAT64 Translator - IPv4 ↔ IPv6 Address Translation | {site.title}</title>
  <meta name="description" content="Translate between IPv4 and IPv6 addresses using NAT64 prefix mechanism. Supports default 64:ff9b::/96 prefix and custom NAT64 prefixes with bidirectional conversion." />
  <meta name="keywords" content="ipv6 nat64, nat64 translator, ipv4 to ipv6, ipv6 to ipv4, address translation, 64:ff9b, nat64 prefix, dual stack, ip conversion" />
  <meta property="og:title" content="IPv6 NAT64 Translator - Bidirectional Address Translation" />
  <meta property="og:description" content="Convert IPv4 addresses to IPv6 using NAT64 prefix mechanism and vice versa with support for custom prefixes." />
  <meta property="og:url" content="{site.url}/ip-address-convertor/ipv6/nat64" />
</svelte:head>

<IPv6NAT64 />