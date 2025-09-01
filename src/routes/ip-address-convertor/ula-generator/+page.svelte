<script lang="ts">
  import ULAGenerator from '$lib/components/ULAGenerator.svelte';
</script>

<svelte:head>
  <title>ULA Generator - IP Calculator</title>
  <meta name="description" content="Generate RFC 4193 Unique Local Addresses with cryptographically secure Global IDs. Create IPv6 ULA prefixes for private networks with collision avoidance.">
</svelte:head>

<ULAGenerator />