<script lang="ts">
  import IPv6ZoneID from '$lib/components/tools/IPv6ZoneID.svelte';
</script>

<svelte:head>
  <title>IPv6 Zone ID Handler - IP Calculator</title>
  <meta name="description" content="Process IPv6 addresses with zone identifiers for link-local and multicast addresses. Validate zone IDs and get suggested interface names.">
</svelte:head>

<IPv6ZoneID />
