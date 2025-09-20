<script lang="ts">
  import IPv6NotationConverter from '$lib/components/tools/IPv6NotationConverter.svelte';
</script>

<IPv6NotationConverter
  mode="compress"
  title="IPv6 Address Compressor"
  description="Convert expanded IPv6 addresses to their compressed, shortened format. This tool uses :: notation to represent consecutive zero groups and removes leading zeros for a cleaner, more readable IPv6 address."
/>
