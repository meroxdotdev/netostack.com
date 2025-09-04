<script lang="ts">
  import IPv6Normalize from '$lib/components/tools/IPv6Normalize.svelte';
</script>

<svelte:head>
  <title>IPv6 Normalizer - IP Calculator</title>
  <meta name="description" content="Normalize IPv6 addresses to RFC 5952 canonical form. Apply lowercase conversion, zero compression, leading zero removal with detailed step-by-step transformation.">
</svelte:head>

<IPv6Normalize />
