<script>
  import ZoneDiff from '$lib/components/tools/ZoneDiff.svelte';
</script>

<svelte:head>
  <title>DNS Zone Diff - IP Calculator</title>
  <meta name="description" content="Compare two DNS zone files and identify added, removed, and changed records. Perfect for migration planning and change auditing." />
</svelte:head>

<ZoneDiff />