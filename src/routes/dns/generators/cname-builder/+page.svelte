<script lang="ts">
  import { site } from '$lib/constants/site';
  import { getPageDetails } from '$lib/constants/nav';
  import DNSCNAMEBuilder from '$lib/components/tools/DNSCNAMEBuilder.svelte';
  import '../../../../styles/pages.scss';

  const pageDetails = getPageDetails('/dns/generators/cname-builder');
</script>

<svelte:head>
  <title>{pageDetails?.title} | {site.title}</title>
  <meta name="description" content="{pageDetails?.description}" />
  <meta name="keywords" content="{site.keywords}, {pageDetails?.keywords?.join(', ')}" />
  <meta property="og:title" content="{pageDetails?.title}" />
  <meta property="og:description" content="{pageDetails?.description}" />
  <meta property="og:url" content="{site.url}/dns/generators/cname-builder" />
</svelte:head>

<DNSCNAMEBuilder />
