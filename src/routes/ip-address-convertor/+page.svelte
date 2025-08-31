<script lang="ts">
  import { goto } from '$app/navigation';
  import { pages } from '$lib/constants/site';
  import { onMount } from 'svelte';

  onMount(() => {
    goto('/ip-address-convertor/representations', { replaceState: true });
  });
</script>

<svelte:head>
  <title>{pages.ipConverter.title}</title>
  <meta name="description" content="{pages.ipConverter.description}" />
</svelte:head>

<!-- This page automatically redirects to the first sub-page -->
<div>Redirecting to IP Address Format Converter...</div>

