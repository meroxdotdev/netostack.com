<script lang="ts">
  import { site } from '$lib/constants/site';
  import { SUB_NAV } from '$lib/constants/nav';
  import ToolsGrid from '$lib/components/ToolsGrid.svelte';
  import type { NavItem, NavGroup } from '$lib/constants/nav';
  import '../../styles/pages.scss';

  // Extract tools for CIDR section
  function extractNavItems(items: (NavItem | NavGroup)[]): NavItem[] {
    const navItems: NavItem[] = [];
    for (const item of items) {
      if ('href' in item) {
        navItems.push(item);
      } else if ('title' in item && 'items' in item) {
        navItems.push(...item.items);
      }
    }
    return navItems;
  }

  const cidrTools = extractNavItems(SUB_NAV['/cidr'] || []);
</script>

<svelte:head>
  <title>CIDR Tools & Converters | {site.title}</title>
  <meta name="description" content="Comprehensive CIDR tools including subnet mask converters, CIDR summarizer, splitter, and set operations for network analysis and optimization." />
  <meta name="keywords" content="{site.keywords}, CIDR, subnet mask converter, CIDR summarizer, network tools, IP range calculator" />
  <meta property="og:title" content="CIDR Tools & Converters" />
  <meta property="og:description" content="Professional CIDR tools for network engineers including converters, summarizers, and set operations." />
  <meta property="og:url" content="{site.url}/cidr" />
</svelte:head>

<div class="page-container">
  <header class="page-header">
    <h1>CIDR Tools & Converters</h1>
    <p class="page-description">
      Comprehensive CIDR tools for network analysis, conversion, and optimization. 
      Convert between notation formats, summarize networks, split subnets, and perform set operations on IP ranges.
    </p>
  </header>

  <ToolsGrid tools={cidrTools} />

  <section class="about-cidr explainer-card no-hover">
    <h2>About CIDR (Classless Inter-Domain Routing)</h2>
    <p>
      <strong>CIDR</strong> is a method for allocating IP addresses and routing IP packets more efficiently than the old classful network addressing architecture. 
      CIDR notation uses a slash followed by the number of network bits (e.g., /24) to specify network boundaries.
    </p>
    
    <h3>Key Advantages</h3>
    <ul class="cidr-benefits">
      <li><strong>Flexible Addressing:</strong> Create networks of any size</li>
      <li><strong>Route Aggregation:</strong> Combine multiple routes into summaries</li>
      <li><strong>Efficient Allocation:</strong> Reduce IP address waste</li>
      <li><strong>Scalable Routing:</strong> Smaller routing tables</li>
    </ul>

    <h3>Common CIDR Blocks</h3>
    <div class="cidr-examples">
      <div class="cidr-item">
        <strong>/24</strong> - 256 addresses (254 hosts)
      </div>
      <div class="cidr-item">
        <strong>/28</strong> - 16 addresses (14 hosts)
      </div>
      <div class="cidr-item">
        <strong>/16</strong> - 65,536 addresses (65,534 hosts)
      </div>
      <div class="cidr-item">
        <strong>/8</strong> - 16,777,216 addresses (16,777,214 hosts)
      </div>
    </div>
  </section>
</div>

<style>
  .about-cidr {
    h3 {
      margin-top: var(--spacing-md);
    }
  }
  .cidr-examples {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-sm);
    margin-top: var(--spacing-md);
  }

  .cidr-benefits {
    padding-left: 1rem;
    margin-bottom: var(--spacing-md);
    list-style: none;
    li {
      &::before {
        content: '•';
        color: var(--color-primary);
        display: inline-block;
        width: 1em;
        margin-left: -1em;
      }
    }
  }

  .cidr-item {
    padding: var(--spacing-sm);
    background-color: var(--bg-secondary);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-primary);
    text-align: center;
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
  }

  .cidr-item strong {
    color: var(--color-primary);
    font-weight: 600;
  }
</style>
