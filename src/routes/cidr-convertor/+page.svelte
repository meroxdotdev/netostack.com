<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  onMount(() => {
    goto('/cidr-convertor/cidr-to-subnet-mask', { replaceState: true });
  });
</script>

<svelte:head>
  <title>CIDR Converter - IP Calc</title>
  <meta name="description" content="Convert between CIDR notation and subnet masks. Professional networking tools." />
</svelte:head>

<!-- This page automatically redirects to the first sub-page -->
<div>Redirecting to CIDR to Subnet Mask converter...</div>
