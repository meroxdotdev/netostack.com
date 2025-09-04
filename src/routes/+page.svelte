<script lang="ts">
  import '../styles/pages.scss';
  import { site, pages, about } from '$lib/constants/site';
  import { ALL_PAGES, SUB_NAV, type NavItem, type NavGroup } from '$lib/constants/nav';
  import ToolsGrid from '$lib/components/ToolsGrid.svelte';
  import SearchFilter from '$lib/components/SearchFilter.svelte';
  
  // Helper function to extract nav items from mixed structure
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

  // Separate tools from reference pages
  const referencePages = extractNavItems(SUB_NAV['/reference'] || []);
  const toolPages = ALL_PAGES.filter(page => !page.href.startsWith('/reference'));
  
  let filteredTools: NavItem[] = $state(toolPages);
  let filteredReference: NavItem[] = $state(referencePages);
  let searchQuery: string = $state('');
  
  // Update filtered items when search changes
  $effect(() => {
    if (searchQuery.trim() === '') {
      filteredTools = toolPages;
      filteredReference = referencePages;
    } else {
      const query = searchQuery.toLowerCase().trim();
      filteredTools = toolPages.filter(tool => 
        tool.label.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.keywords?.some(keyword => keyword.toLowerCase().includes(query))
      );
      filteredReference = referencePages.filter(page => 
        page.label.toLowerCase().includes(query) ||
        page.description.toLowerCase().includes(query) ||
        page.keywords?.some(keyword => keyword.toLowerCase().includes(query))
      );
    }
  });
</script>

<svelte:head>
  <title>{pages.home.title}</title>
  <meta name="description" content="{pages.home.description}" />
  <meta name="keywords" content="{site.keywords}" />
  <meta property="og:title" content="{pages.home.title}" />
  <meta property="og:description" content="{pages.home.ogDescription}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="{site.url}" />
</svelte:head>


<!-- Hero Section -->
<section class="hero">
  <div class="hero-content">
    <h2>{site.title}</h2>
    <p class="hero-description">{about.line1}</p>
  </div>
</section>

<!-- Search Filter -->
<SearchFilter bind:filteredTools bind:searchQuery />

{#if searchQuery.trim() === ''}
  <!-- Tools Grid -->
  <ToolsGrid tools={filteredTools} {searchQuery} />

  <!-- Reference Pages Section -->
  {#if filteredReference.length > 0}
    <section class="reference-section">
      <div class="section-header">
        <h2>Reference & Documentation</h2>
        <p class="section-description">
          Comprehensive reference materials and documentation for network professionals.
        </p>
      </div>
      <ToolsGrid tools={filteredReference} {searchQuery} />
    </section>
  {/if}
{:else}
  <!-- Combined Search Results -->
  <ToolsGrid tools={[...filteredTools, ...filteredReference]} {searchQuery} />
{/if}

<style lang="scss">
/* Homepage specific styles */
.hero {
  text-align: center;
  padding: var(--spacing-xl) 0 var(--spacing-sm);
  .hero-content {
    max-width: 900px;
    margin: 0 auto;
    h2 {
      font-size: var(--font-size-3xl);
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: var(--spacing-md);
      line-height: 1.2;
      @media (max-width: 768px) {
        font-size: var(--font-size-xl);
      }
    }
    
    .hero-description {
      font-size: var(--font-size-lg);
      color: var(--text-secondary);
      line-height: 1.6;
      margin: 0;
      @media (max-width: 768px) {
        font-size: var(--font-size-md);
      }
    }
  }
}

.reference-section {
  margin-top: var(--spacing-xl);
  
  .section-header {
    text-align: center;
    margin-bottom: var(--spacing-lg);
    
    h2 {
      font-size: var(--font-size-xl);
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--spacing-sm);
    }
    
    .section-description {
      font-size: var(--font-size-md);
      color: var(--text-secondary);
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
    }
  }
}
</style>

