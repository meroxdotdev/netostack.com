<script lang="ts">
  import { site } from '$lib/constants/site';
  import { getPageDetails } from '$lib/constants/nav';
  import DNSTXTEscape from '$lib/components/tools/DNSTXTEscape.svelte';
  import '../../../../styles/pages.scss';

  const pageDetails = getPageDetails('/dns/generators/txt-escape');
</script>

<svelte:head>
  <title>{pageDetails?.title} | {site.title}</title>
  <meta name="description" content="{pageDetails?.description}" />
  <meta name="keywords" content="{site.keywords}, {pageDetails?.keywords?.join(', ')}" />
  <meta property="og:title" content="{pageDetails?.title}" />
  <meta property="og:description" content="{pageDetails?.description}" />
  <meta property="og:url" content="{site.url}/dns/generators/txt-escape" />
</svelte:head>

<DNSTXTEscape />