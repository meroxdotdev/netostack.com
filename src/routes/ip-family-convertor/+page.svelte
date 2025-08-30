<script lang="ts">
  import { goto } from '$app/navigation';
  import { pages } from '$lib/constants/site';
  import { onMount } from 'svelte';

  onMount(() => {
    goto('/ip-family-convertor/ipv4-to-ipv6', { replaceState: true });
  });
</script>

<svelte:head>
  <title>IPv4/IPv6 Converter - IP Family Conversion Tools</title>
  <meta name="description" content="Convert between IPv4 and IPv6 address formats. IPv4-mapped IPv6 conversion tools." />
</svelte:head>

<!-- This page automatically redirects to the first sub-page -->
<div>Redirecting to IPv4 to IPv6 converter...</div>