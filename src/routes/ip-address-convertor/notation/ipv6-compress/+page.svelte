<script lang="ts">
  import IPv6NotationConverter from '$lib/components/tools/IPv6NotationConverter.svelte';
  import { site } from '$lib/constants/site';
</script>

<svelte:head>
  <title>IPv6 Address Compressor - Convert Full to Shortened Format | {site.name}</title>
  <meta name="description" content="Compress expanded IPv6 addresses to shortened format. Convert full 128-bit IPv6 addresses like 2001:0db8:0000:0000:0000:0000:0000:0001 to compact 2001:db8::1." />
  <meta name="keywords" content="{site.keywords}, IPv6 compress, IPv6 address compressor, IPv6 short format, IPv6 compression, expanded to compressed IPv6" />
  <meta property="og:title" content="IPv6 Address Compressor - Convert Full to Shortened Format" />
  <meta property="og:description" content="Compress expanded IPv6 addresses to shortened format using :: notation and removing leading zeros." />
  <meta property="og:url" content="{site.url}/ip-address-convertor/notation/ipv6-compress" />
</svelte:head>

<IPv6NotationConverter 
  mode="compress"
  title="IPv6 Address Compressor"
  description="Convert expanded IPv6 addresses to their compressed, shortened format. This tool uses :: notation to represent consecutive zero groups and removes leading zeros for a cleaner, more readable IPv6 address."
/>
