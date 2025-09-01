<script lang="ts">
  import EUI64 from '$lib/components/EUI64.svelte';
  import { site } from '$lib/constants/site';
</script>

<svelte:head>
  <title>EUI-64 Converter - Convert MAC to IPv6 EUI-64 | {site.title}</title>
  <meta name="description" content="Convert between MAC addresses and IPv6 EUI-64 interface identifiers. Generate IPv6 link-local and global addresses with detailed bit analysis." />
  <meta name="keywords" content="{site.keywords}, EUI-64, MAC address, IPv6, interface identifier, link-local, global address, SLAAC" />
  <meta property="og:title" content="EUI-64 Converter - Convert MAC to IPv6 EUI-64" />
  <meta property="og:description" content="Convert MAC addresses to IPv6 EUI-64 identifiers with automatic IPv6 address generation." />
  <meta property="og:url" content="{site.url}/ip-address-convertor/eui64" />
</svelte:head>

<div class="page-container">
  <EUI64 />
</div>