<script lang="ts">
  import { site } from '$lib/constants/site';
  import { SUB_NAV } from '$lib/constants/nav';
  import ToolsGrid from '$lib/components/global/ToolsGrid.svelte';
  import type { NavItem, NavGroup } from '$lib/constants/nav';
  import '../../styles/pages.scss';

  // Extract tools for subnetting section
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

  const subnettingTools = extractNavItems(SUB_NAV['/subnetting'] || []);
</script>

<svelte:head>
  <title>Subnetting Tools - Subnet, VLSM & Supernet Calculators | {site.name}</title>
  <meta name="description" content="Comprehensive subnetting and supernetting tools including subnet calculator, VLSM calculator, and supernet calculator for network planning, IP allocation, and route aggregation." />
  <meta name="keywords" content="{site.keywords}, subnetting, subnet calculator, VLSM, supernet, supernetting, route aggregation, network planning" />
  <meta property="og:title" content="Subnetting Tools - Subnet, VLSM & Supernet Calculators" />
  <meta property="og:description" content="Comprehensive subnetting and supernetting tools including subnet calculator, VLSM calculator, and supernet calculator for network planning, IP allocation, and route aggregation." />
  <meta property="og:url" content="{site.url}/subnetting" />
</svelte:head>

<div class="page-container">
  <header class="page-header">
    <h1>Subnetting Tools</h1>
    <p class="page-description">
      Comprehensive tools for subnet planning, network design, and IP address allocation. 
      Calculate traditional subnets, use VLSM for optimal address space utilization, or aggregate networks with supernetting.
    </p>
  </header>

  <ToolsGrid tools={subnettingTools} />

  <section class="explainer-card no-hover about-subnetting">
    <h2>About Subnetting</h2>
    <p>
      <strong>Subnetting</strong> is the practice of dividing a network into smaller, more manageable sub-networks (subnets). 
      This technique helps improve network performance, security, and organization by creating logical boundaries within your IP address space.
    </p>
    
    <h3>Key Benefits</h3>
    <ul class="subnetting-benefits">
      <li><strong>Improved Security:</strong> Isolate different network segments</li>
      <li><strong>Reduced Broadcast Traffic:</strong> Smaller broadcast domains</li>
      <li><strong>Better Organization:</strong> Logical grouping of devices</li>
      <li><strong>Efficient Address Usage:</strong> Optimal IP allocation with VLSM</li>
    </ul>

    <h3>Traditional vs VLSM Subnetting</h3>
    <div class="comparison-grid">
      <div class="comparison-item">
        <h4>Traditional Subnetting</h4>
        <p>All subnets use the same subnet mask, creating equal-sized networks. Simple but may waste IP addresses.</p>
      </div>
      <div class="comparison-item">
        <h4>VLSM (Variable Length Subnet Mask)</h4>
        <p>Each subnet can have a different mask size, allowing optimal allocation based on actual host requirements.</p>
      </div>
    </div>
  </section>
</div>

<style>
  .about-subnetting {
    h3 {
      margin-top: var(--spacing-md);
    }
    .subnetting-benefits {
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
  }
  .comparison-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--spacing-md);
    margin-top: var(--spacing-md);
  }

  .comparison-item {
    padding: var(--spacing-md);
    background-color: var(--bg-secondary);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-primary);
  }

  .comparison-item h4 {
    color: var(--color-primary);
    margin-bottom: var(--spacing-sm);
    font-size: var(--font-size-md);
  }

  .comparison-item p {
    color: var(--text-secondary);
    line-height: 1.5;
    margin: 0;
  }
</style>
