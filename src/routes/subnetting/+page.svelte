<script lang="ts">
  import { site } from '$lib/constants/site';
  import { SUB_NAV } from '$lib/constants/nav';
  import Icon from '$lib/components/Icon.svelte';
  import '../../styles/pages.scss';

  const subnettingTools = SUB_NAV['/subnetting'];
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

  <section class="explainer-card">
    <h2>About Subnetting</h2>
    <p>
      <strong>Subnetting</strong> is the practice of dividing a network into smaller, more manageable sub-networks (subnets). 
      This technique helps improve network performance, security, and organization by creating logical boundaries within your IP address space.
    </p>
    
    <h3>Key Benefits</h3>
    <ul>
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

  <section class="tools-grid">
    {#if Array.isArray(subnettingTools)}
      {#each subnettingTools as tool}
        <a href={tool.href} class="tool-card">
          <div class="tool-icon">
            {#if tool.icon}
              <Icon name={tool.icon} size="large" />
            {/if}
          </div>
          <div class="tool-content">
            <h3>{tool.label}</h3>
            <p>{tool.description}</p>
          </div>
        </a>
      {/each}
    {/if}
  </section>
</div>

<style>
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

  .tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-lg);
    margin-top: var(--spacing-xl);
  }

  .tool-card {
    display: flex;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    text-decoration: none;
    color: inherit;
    transition: all var(--transition-base);
  }

  .tool-card:hover {
    border-color: var(--color-primary);
    background-color: var(--surface-hover);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .tool-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background-color: var(--color-primary-alpha-10);
    border-radius: var(--radius-sm);
  }

  .tool-content {
    flex: 1;
  }

  .tool-content h3 {
    margin: 0 0 var(--spacing-xs) 0;
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--text-primary);
  }

  .tool-content p {
    margin: 0;
    color: var(--text-secondary);
    line-height: 1.5;
    font-size: var(--font-size-sm);
  }

  @media (max-width: 768px) {
    .tool-card {
      flex-direction: column;
      text-align: center;
    }

    .tool-icon {
      align-self: center;
    }
  }
</style>