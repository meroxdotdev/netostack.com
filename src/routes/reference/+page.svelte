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
        <li>IPv6 Prefix Lengths Guide</li>
        <li>Multicast Addressing Basics</li> 
        <li>NAT Types Explained</li>
        <li>Wildcard Masks for ACLs</li>
        <li>Common MTU/MSS Values</li>
        <li>And more...</li>
      </ul>
    </div>
  </div>
</div>

<style>
  .reference-link {
    text-decoration: none;
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