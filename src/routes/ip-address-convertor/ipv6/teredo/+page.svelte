<script lang="ts">
  import { site } from '$lib/constants/site';
  import IPv6Teredo from '$lib/components/tools/IPv6Teredo.svelte';
</script>

<svelte:head>
  <title>IPv6 Teredo Parser - Extract Components | {site.title}</title>
  <meta name="description" content="Parse IPv6 Teredo addresses to extract server IPv4, client IPv4, mapped port, and flags. Understand Teredo tunneling components and structure." />
  <meta name="keywords" content="ipv6 teredo, teredo parser, teredo tunnel, 2001:0000, teredo server, teredo client, ipv6 transition, tunnel parsing, teredo flags" />
  <meta property="og:title" content="IPv6 Teredo Parser - Extract Tunnel Components" />
  <meta property="og:description" content="Decode Teredo IPv6 addresses to understand their embedded IPv4 server, client, and port information." />
  <meta property="og:url" content="{site.url}/ip-address-convertor/ipv6/teredo" />
</svelte:head>

<IPv6Teredo />
