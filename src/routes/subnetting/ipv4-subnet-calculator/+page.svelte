<script lang="ts">
  import SubnetCalculator from '$lib/components/SubnetCalculator.svelte';
  import { site, pages } from '$lib/constants/site';
  import '../../../styles/pages.scss';
  
</script>

<svelte:head>
  <title>{pages.subnetCalculator.title}</title>
  <meta name="description" content="{pages.subnetCalculator.description}" />
  <meta name="keywords" content="{site.keywords}" />
  <meta property="og:title" content="{pages.subnetCalculator.title}" />
  <meta property="og:description" content="{pages.subnetCalculator.description}" />
  <meta property="og:url" content="{site.url}/subnet-calculator" />
</svelte:head>

<SubnetCalculator />
