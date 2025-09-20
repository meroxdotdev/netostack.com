<script lang="ts">
  import IPv6NotationConverter from '$lib/components/tools/IPv6NotationConverter.svelte';
  
</script>

<IPv6NotationConverter 
  mode="expand"
  title="IPv6 Address Expander"
  description="Convert compressed IPv6 addresses to their full 128-bit hexadecimal representation. This tool expands short IPv6 notation by adding leading zeros and replacing :: with the appropriate number of zero groups."
/>
