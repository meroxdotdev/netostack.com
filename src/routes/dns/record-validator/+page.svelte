<script lang="ts">
  import { site } from '$lib/constants/site';
  import DNSRecordValidator from '$lib/components/tools/DNSRecordValidator.svelte';
</script>

<svelte:head>
  <title>DNS Record Validator - Validate Individual RR Syntax | {site.title}</title>
  <meta name="description" content="Validate individual DNS resource record syntax for A/AAAA/CNAME/MX/TXT/SRV/CAA records. Check formatting, detect errors, and get best practice recommendations." />
  <meta name="keywords" content="dns record validator, dns syntax, resource records, a record, aaaa record, cname, mx record, txt record, srv record, caa record, dns validation" />
  <meta property="og:title" content="DNS Record Validator - RR Syntax Validation" />
  <meta property="og:description" content="Validate individual DNS resource record syntax with error detection and best practice recommendations." />
  <meta property="og:url" content="{site.url}/dns/record-validator" />
</svelte:head>

<DNSRecordValidator />