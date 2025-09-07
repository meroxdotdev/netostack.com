<script lang="ts">
  import { site } from '$lib/constants/site';
  import DNSLabelNormalizer from '$lib/components/tools/DNSLabelNormalizer.svelte';
</script>

<svelte:head>
  <title>DNS Label Normalizer - Domain Name Normalization and Security Analysis | {site.title}</title>
  <meta name="description" content="Normalize DNS labels: lowercase conversion, IDNA processing, dot trimming. Detect homograph attacks and mixed script security risks in domain names." />
  <meta name="keywords" content="dns label normalizer, domain normalization, idn punycode, homograph attack, mixed scripts, domain security, dns security, internationalized domains" />
  <meta property="og:title" content="DNS Label Normalizer - Domain Security Analysis" />
  <meta property="og:description" content="Normalize DNS labels and detect security risks including homograph attacks and mixed script domains." />
  <meta property="og:url" content="{site.url}/dns/label-normalizer" />
</svelte:head>

<DNSLabelNormalizer />