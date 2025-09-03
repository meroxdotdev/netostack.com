<script lang="ts">
  import { site } from '$lib/constants/site';
  import IPEnumerate from '$lib/components/IPEnumerate.svelte';
</script>

<svelte:head>
  <title>IP Enumerate - List All IPs in CIDR/Range | {site.title}</title>
  <meta name="description" content="Safely enumerate and list all IP addresses in CIDR blocks and ranges. Export to CSV or JSON with memory-safe processing for network administration." />
  <meta name="keywords" content="ip enumerate, list all ips, cidr enumerate, ip range list, generate ip list, csv export, json export, network enumeration, ip address list" />
  <meta property="og:title" content="IP Enumerate - Generate Complete IP Address Lists" />
  <meta property="og:description" content="Generate comprehensive lists of IP addresses from CIDR blocks and ranges with safe export options." />
  <meta property="og:url" content="{site.url}/ip-address-convertor/enumerate" />
</svelte:head>

<IPEnumerate />