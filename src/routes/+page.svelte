<script lang="ts">
  import '../styles/pages.scss';
  import { site, pages, about } from '$lib/constants/site';
  import { ALL_PAGES, type NavItem } from '$lib/constants/nav';
  import ToolsGrid from '$lib/components/ToolsGrid.svelte';
  import SearchFilter from '$lib/components/SearchFilter.svelte';
  let filteredTools: NavItem[] = $state(ALL_PAGES);
  let searchQuery: string = $state('');
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

<!-- Tools Grid -->
<ToolsGrid tools={filteredTools} {searchQuery} />

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
</style>

