<script lang="ts">
  import { goto } from '$app/navigation';
  import { pages } from '$lib/constants/site';
  import { onMount } from 'svelte';

  onMount(() => {
    goto('/cidr-convertor/cidr-to-subnet-mask', { replaceState: true });
  });
</script>

<svelte:head>
  <title>{pages.cidrConverter.title}</title>
  <meta name="description" content="{pages.cidrConverter.description}" />
</svelte:head>

<!-- This page automatically redirects to the first sub-page -->
<div>Redirecting to CIDR to Subnet Mask converter...</div>
