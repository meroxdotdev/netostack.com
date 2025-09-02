<script lang="ts">
  import { site } from '$lib/constants/site';
  import Icon from '$lib/components/Icon.svelte';

  const referencePages = [
    {
      title: "CIDR Notation Explained",
      path: "/reference/cidr",
      description: "What CIDR is, why it replaced IP classes, and how to read network prefixes",
      icon: "hash"
    },
    {
      title: "VLSM in Plain English", 
      path: "/reference/vlsm",
      description: "Variable Length Subnet Masking - when to use it and common pitfalls",
      icon: "scissors"
    },
    {
      title: "Route Summarization / Supernetting",
      path: "/reference/supernetting", 
      description: "Combine multiple networks into single routes for efficient routing",
      icon: "layers"
    },
    {
      title: "IPv6 Address Types & Key Prefixes",
      path: "/reference/ipv6-address-types",
      description: "Global unicast, ULA, link-local, multicast, and special IPv6 addresses",
      icon: "globe"
    },
    {
      title: "Common IPv6 Prefix Lengths",
      path: "/reference/ipv6-prefix-lengths",
      description: "Quick reference for /128, /127, /64, /60, /56, /48, /32 with typical uses",
      icon: "grid"
    },
    {
      title: "IPv4 in IPv6",
      path: "/reference/ipv6-embedded-ipv4", 
      description: "IPv4-mapped addresses, 6to4, Teredo, and transition mechanisms",
      icon: "shuffle"
    },
    {
      title: "IPv4 & IPv6 Multicast Basics",
      path: "/reference/multicast",
      description: "Multicast scopes, well-known groups, and local subnet limitations",
      icon: "radio"
    },
    {
      title: "Special-Use IPv4 Blocks (RFC 6890)",
      path: "/reference/special-use-ipv4",
      description: "Reserved IPv4 ranges including private networks, CGNAT, and test blocks", 
      icon: "shield"
    },
    {
      title: "Common TCP/UDP Ports",
      path: "/reference/ports",
      description: "Quick reference for frequently used port numbers and services",
      icon: "server"
    },
    {
      title: "ACL Wildcard Masks",
      path: "/reference/wildcard-masks",
      description: "Wildcard masks vs netmasks, quick conversions and ACL examples",
      icon: "filter"
    },
    {
      title: "Common MTU/MSS Values",
      path: "/reference/mtu-mss", 
      description: "MTU and MSS values for Ethernet, PPPoE, VPN, and overhead calculations",
      icon: "package"
    },
    {
      title: "Reverse DNS (PTR Records)",
      path: "/reference/reverse-dns",
      description: "How in-addr.arpa and ip6.arpa work with examples for IPv4 and IPv6",
      icon: "corner-down-left"
    },
    {
      title: "What is an ASN?",
      path: "/reference/asn",
      description: "Autonomous Systems, BGP basics, and how IP addresses map to ASNs",
      icon: "share-2"
    },
    {
      title: "ICMP & ICMPv6: Common Types",
      path: "/reference/icmp", 
      description: "Practical guide to ICMP message types for network troubleshooting",
      icon: "activity"
    },
    {
      title: "ARP vs NDP",
      path: "/reference/arp-vs-ndp",
      description: "Side-by-side comparison of IPv4 ARP and IPv6 Neighbor Discovery",
      icon: "git-compare"
    },
    {
      title: "Private vs Public IP Addresses",
      path: "/reference/private-vs-public-ip",
      description: "Understanding private/public IPs, NAT implications, and identification",
      icon: "lock"
    },
    {
      title: "Carrier-Grade NAT Explained", 
      path: "/reference/cgnat",
      description: "CGNAT (100.64.0.0/10), how to identify it, and service impacts",
      icon: "layers"
    },
    {
      title: "Link-Local & APIPA Addresses",
      path: "/reference/link-local-apipa",
      description: "IPv4 APIPA (169.254/16) and IPv6 link-local (fe80::/10) at a glance",
      icon: "wifi"
    },
    {
      title: "Reverse Zones for CIDR Delegation",
      path: "/reference/reverse-zones",
      description: "Minimal reverse DNS zones needed to delegate IPv4 and IPv6 CIDR blocks",
      icon: "corner-down-left"
    },
    {
      title: "IPv6 Privacy Addresses",
      path: "/reference/ipv6-privacy-addresses", 
      description: "SLAAC privacy extensions: temporary vs stable interface identifiers",
      icon: "eye-off"
    }
  ];
</script>

<svelte:head>
  <title>Networking Reference Guide | {site.title}</title>
  <meta name="description" content="Complete networking reference guide covering CIDR, VLSM, IPv6, special-use addresses, common ports, and more." />
  <meta name="keywords" content="{site.keywords}, networking reference, CIDR guide, IPv6 reference, port numbers, network documentation" />
  <meta property="og:title" content="Networking Reference Guide" />
  <meta property="og:description" content="Comprehensive networking reference covering IP addressing, routing, and common protocols." />
  <meta property="og:url" content="{site.url}/reference" />
</svelte:head>

<div class="page-container">
  <div class="ref-page">
    <div class="ref-header">
      <h1>Networking Reference Guide</h1>
      <p class="subtitle">Quick guides and cheat sheets for networking concepts, IP addressing, and common protocols</p>
    </div>

    <div class="ref-section">
      <h2>Available References</h2>
      <div class="ref-grid two-col">
        {#each referencePages as page}
          <a href={page.path} class="grid-item reference-link">
            <div class="item-title">
              <Icon name={page.icon} size="sm" />
              {page.title}
            </div>
            <div class="item-description">{page.description}</div>
          </a>
        {/each}
      </div>
    </div>

    <div class="ref-section">
      <h2>How to Use These References</h2>
      <p>Each reference page provides:</p>
      <ul>
        <li><strong>Plain English explanations</strong> - No confusing jargon</li>
        <li><strong>Practical examples</strong> - Real-world scenarios you'll encounter</li>
        <li><strong>Quick reference tables</strong> - Easy to scan and find what you need</li>
        <li><strong>Common pitfalls</strong> - Mistakes to avoid</li>
        <li><strong>Best practices</strong> - How to do things right</li>
      </ul>
      
      <div class="ref-highlight">
        <div class="highlight-title">
          <Icon name="lightbulb" size="sm" />
          Tip
        </div>
        <div class="highlight-content">
          These references pair perfectly with the calculators and tools on this site. Use them to understand the concepts, then use the tools to do the calculations.
        </div>
      </div>
    </div>

    <div class="ref-section">
      <h2>More References Coming Soon</h2>
      <p>We're continuously adding more networking references. Coming soon:</p>
      <ul>
        <li>DHCPv4 vs DHCPv6 Differences</li>
        <li>NAT Types and Behavior</li>
        <li>Network Troubleshooting Methodologies</li>
        <li>IPv6 Transition Mechanisms</li>
        <li>QoS Basics and DSCP Markings</li>
        <li>And more...</li>
      </ul>
    </div>
  </div>
</div>

<style>
  .reference-link {
    text-decoration: none !important;
    color: inherit;
    transition: var(--transition-fast);
    cursor: pointer;
  }
  
  .reference-link:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .reference-link .item-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    color: var(--color-primary);
  }
</style>
