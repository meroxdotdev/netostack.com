<script lang="ts">
  import CIDRContains from '$lib/components/CIDRContains.svelte';
  import { site } from '$lib/constants/site';
</script>

<svelte:head>
  <title>CIDR Containment Checker - Analyze Set Containment | {site.title}</title>
  <meta name="description" content="Check if CIDR blocks fully contain other networks. Many-to-many containment analysis with detailed classification and gap detection." />
  <meta name="keywords" content="{site.keywords}, CIDR containment, set containment, IP containment analysis, network containment, CIDR subset" />
  <meta property="og:title" content="CIDR Containment Checker - Analyze Set Containment" />
  <meta property="og:description" content="Perform containment analysis on IP address sets with detailed classification and visualization." />
  <meta property="og:url" content="{site.url}/cidr/set-operations/contains" />
</svelte:head>

<div class="page-container">
  <CIDRContains />
</div>