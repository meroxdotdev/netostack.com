<script>
  import NameLengthChecker from '$lib/components/tools/NameLengthChecker.svelte';
</script>

<svelte:head>
  <title>DNS Name Length Checker - IP Calculator</title>
  <meta name="description" content="Validate DNS names against RFC length limits. Check for labels exceeding 63 characters and FQDNs exceeding 255 characters." />
</svelte:head>

<NameLengthChecker />