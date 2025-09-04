<script lang="ts">
  import IPv6NotationConverter from '$lib/components/tools/IPv6NotationConverter.svelte';
  import { site } from '$lib/constants/site';
</script>

<svelte:head>
  <title>IPv6 Address Expander - Convert Compressed to Full Format | {site.name}</title>
  <meta name="description" content="Expand compressed IPv6 addresses to full 128-bit format. Convert short IPv6 notation like 2001:db8::1 to complete format 2001:0db8:0000:0000:0000:0000:0000:0001." />
  <meta name="keywords" content="{site.keywords}, IPv6 expand, IPv6 address expander, IPv6 full format, IPv6 128-bit, compressed to expanded IPv6" />
  <meta property="og:title" content="IPv6 Address Expander - Convert Compressed to Full Format" />
  <meta property="og:description" content="Expand compressed IPv6 addresses to full 128-bit format. Convert short IPv6 notation to complete hexadecimal representation." />
  <meta property="og:url" content="{site.url}/ip-address-convertor/notation/ipv6-expand" />
</svelte:head>

<IPv6NotationConverter 
  mode="expand"
  title="IPv6 Address Expander"
  description="Convert compressed IPv6 addresses to their full 128-bit hexadecimal representation. This tool expands short IPv6 notation by adding leading zeros and replacing :: with the appropriate number of zero groups."
/>
