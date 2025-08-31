<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
  onMount(() => {
    goto('/subnetting/subnet-calculator', { replaceState: true });
  });
</script>

<svelte:head>
  <title>Redirecting to Subnet Calculator...</title>
  <meta http-equiv="refresh" content="0; url=/subnetting/subnet-calculator" />
</svelte:head>

<div>
  <p>Redirecting to the new subnet calculator location...</p>
  <p>If you are not redirected automatically, <a href="/subnetting/subnet-calculator">click here</a>.</p>
</div>
