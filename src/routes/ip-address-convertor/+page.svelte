<script lang="ts">
  import IPConverter from '$lib/components/IPConverter.svelte';
  import { site, pages } from '$lib/constants/site';
  import '../../styles/pages.scss';
  
</script>

<svelte:head>
  <title>{pages.ipConverter.title}</title>
  <meta name="description" content="{pages.ipConverter.description}" />
  <meta name="keywords" content="{site.keywords}" />
  <meta property="og:title" content="{pages.ipConverter.title}" />
  <meta property="og:description" content="{pages.ipConverter.description}" />
  <meta property="og:url" content="{site.url}/ip-address-convertor" />
</svelte:head>

  
<IPConverter />

