<script lang="ts">
  import WildcardMask from '$lib/components/tools/WildcardMask.svelte';
  import { site } from '$lib/constants/site';
</script>

<svelte:head>
  <title>Wildcard Mask Converter - Convert CIDR to Wildcard Masks | {site.title}</title>
  <meta name="description" content="Convert between CIDR notation, subnet masks, and wildcard masks. Generate Cisco, Juniper, and generic ACL rules with automatic mask conversion." />
  <meta name="keywords" content="{site.keywords}, wildcard mask, CIDR converter, ACL rules, Cisco ACL, Juniper ACL, subnet mask converter" />
  <meta property="og:title" content="Wildcard Mask Converter - Convert CIDR to Wildcard Masks" />
  <meta property="og:description" content="Convert between network masks and generate ACL rules with automatic wildcard mask conversion." />
  <meta property="og:url" content="{site.url}/cidr/wildcard-mask" />
</svelte:head>

<div class="page-container">
  <WildcardMask />
</div>
