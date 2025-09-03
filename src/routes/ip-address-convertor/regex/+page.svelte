<script lang="ts">
  import { site } from '$lib/constants/site';
  import IPRegexGenerator from '$lib/components/IPRegexGenerator.svelte';
</script>

<svelte:head>
  <title>IP Regex Generator - IPv4 & IPv6 Pattern Builder | {site.title}</title>
  <meta name="description" content="Generate safe and accurate regular expressions for matching IPv4 and IPv6 addresses. Includes customizable validation options and RegexR.com integration." />
  <meta name="keywords" content="ip regex generator, ipv4 regex, ipv6 regex, regular expression, pattern matching, ip validation, regex builder, network validation" />
  <meta property="og:title" content="IP Regex Generator - Safe IPv4/IPv6 Patterns" />
  <meta property="og:description" content="Build reliable regex patterns for IP address validation with customizable options and live testing capabilities." />
  <meta property="og:url" content="{site.url}/ip-address-convertor/regex" />
</svelte:head>

<IPRegexGenerator />