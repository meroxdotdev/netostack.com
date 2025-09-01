<script lang="ts">
  import WildcardMask from '$lib/components/WildcardMask.svelte';
</script>

<svelte:head>
  <title>Wildcard Mask Converter - IP Calculator</title>
  <meta name="description" content="Convert between CIDR notation, subnet masks, and wildcard masks. Generate Cisco, Juniper, and generic ACL rules with automatic mask conversion.">
</svelte:head>

<WildcardMask />