<script lang="ts">
  import { site } from '$lib/constants/site';
  import IPv6SolicitedNode from '$lib/components/IPv6SolicitedNode.svelte';
</script>

<svelte:head>
  <title>IPv6 Solicited-Node Multicast Calculator | {site.title}</title>
  <meta name="description" content="Calculate IPv6 solicited-node multicast addresses from unicast addresses for Neighbor Discovery Protocol (NDP). Understanding ff02::1:ff format and network operations." />
  <meta name="keywords" content="ipv6 solicited-node, multicast, ndp, neighbor discovery, ff02::1:ff, ipv6 multicast, network discovery, ipv6 protocol, solicited node" />
  <meta property="og:title" content="IPv6 Solicited-Node Multicast Calculator" />
  <meta property="og:description" content="Generate solicited-node multicast addresses for IPv6 Neighbor Discovery Protocol operations." />
  <meta property="og:url" content="{site.url}/ip-address-convertor/ipv6/solicited-node" />
</svelte:head>

<IPv6SolicitedNode />