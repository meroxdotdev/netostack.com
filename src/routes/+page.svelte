<script lang="ts">
  import '../styles/pages.scss';
  import { site, about } from '$lib/constants/site';
  import { ALL_PAGES, SUB_NAV, type NavItem, type NavGroup } from '$lib/constants/nav';
  import ToolsGrid from '$lib/components/global/ToolsGrid.svelte';
  import SearchFilter from '$lib/components/furniture/SearchFilter.svelte';
  import BookmarksGrid from '$lib/components/global/BookmarksGrid.svelte';
  import FrequentlyUsedGrid from '$lib/components/global/FrequentlyUsedGrid.svelte';
  import { bookmarks } from '$lib/stores/bookmarks';
  import { frequentlyUsedTools } from '$lib/stores/toolUsage';
  import Icon from '$lib/components/global/Icon.svelte';

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

  // Separate tools from reference pages and standalone pages
  const referencePages = extractNavItems(SUB_NAV['/reference'] || []);
  const toolPages = ALL_PAGES.filter(
    (page) =>
      !page.href.startsWith('/reference') && !page.href.startsWith('/bookmarks') && !page.href.startsWith('/offline'),
  );

  let filteredTools: NavItem[] = $state(toolPages);
  let filteredReference: NavItem[] = $state(referencePages);
  let searchQuery: string = $state('');

  // Pagination state for tools
  let toolsPerPage = 12;
  let currentPage: number = $state(1);

  // Update filtered items when search changes
  $effect(() => {
    if (searchQuery.trim() === '') {
      filteredTools = toolPages;
      filteredReference = referencePages;
      currentPage = 1;
    } else {
      const query = searchQuery.toLowerCase().trim();
      filteredTools = toolPages.filter(
        (tool) =>
          tool.label.toLowerCase().includes(query) ||
          tool.description?.toLowerCase().includes(query) ||
          tool.keywords?.some((keyword) => keyword.toLowerCase().includes(query)),
      );
      filteredReference = referencePages.filter(
        (page) =>
          page.label.toLowerCase().includes(query) ||
          page.description?.toLowerCase().includes(query) ||
          page.keywords?.some((keyword) => keyword.toLowerCase().includes(query)),
      );
      currentPage = 1;
    }
  });

  // Get paginated tools
  function getPaginatedTools(): NavItem[] {
    const start = (currentPage - 1) * toolsPerPage;
    return filteredTools.slice(start, start + toolsPerPage);
  }

  // Calculate total pages
  function getTotalPages(): number {
    return Math.ceil(filteredTools.length / toolsPerPage);
  }

  // Scroll to top of "All Tools" or search results grid on mobile
  function scrollToSectionOnMobile() {
    if (window.innerWidth <= 768) {
      let targetElement: Element | null = null;
      if (searchQuery.trim() === '') {
        // Scroll to "All Tools" section if no search query
        targetElement = document.querySelector('.tools-grid-sub-header') || document.querySelector('#tools-grid');
      } else {
        // Scroll to search results grid if there's a search query
        targetElement = document.querySelector('#search-grid');
      }
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // Fallback to page top if target not found
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }
</script>

<!-- Hero Section -->
<section class="hero">
  <div class="hero-content">
    <h2>{site.title}</h2>
    <p class="hero-description">{about.line1}</p>
    <a href="/sitemap" class="sitemap-link">Sitemap</a>
  </div>
</section>
<!-- umami -->
<script defer src="https://cloud.umami.is/script.js" data-website-id="92ab65fd-3453-4646-94e5-38179e927ef2"></script>


<!-- Search Filter -->
<SearchFilter bind:filteredTools bind:searchQuery />

{#if searchQuery.trim() === ''}
  <!-- Bookmarks Section -->
  <BookmarksGrid hideOther={true} />

  <!-- Frequently Used Tools Section -->
  <FrequentlyUsedGrid hideOther={true} />

  <!-- Show "All Tools" heading if there are bookmarks or frequently used tools -->
  {#if $bookmarks.length > 0 || $frequentlyUsedTools.length > 0}
    <section class="tools-grid-sub-header">
      <Icon name="network-port" size="md" />
      <h2>All Tools</h2>
      <span class="count">{toolPages.length}</span>
    </section>
  {/if}

  <!-- Tools Grid with Pagination -->
  <ToolsGrid idPrefix="tools" tools={getPaginatedTools()} {searchQuery} />
  {#if getTotalPages() > 1}
    <div class="pagination">
      <button
        disabled={currentPage === 1}
        onclick={() => {
          currentPage = Math.max(1, currentPage - 1);
          scrollToSectionOnMobile();
        }}
      >
        Previous
      </button>
      <span>{currentPage} / {getTotalPages()}</span>
      <button
        disabled={currentPage === getTotalPages()}
        onclick={() => {
          currentPage = Math.min(getTotalPages(), currentPage + 1);
          scrollToSectionOnMobile();
        }}
      >
        Next
      </button>
    </div>
  {/if}

  <!-- Reference Pages Section -->
  {#if filteredReference.length > 0}
    <section class="reference-section">
      <div class="section-header">
        <h2>Reference & Documentation</h2>
        <p class="section-description">
          Comprehensive reference materials and documentation for network professionals.
        </p>
      </div>
      <ToolsGrid idPrefix="reference" tools={filteredReference.slice(0, 6)} {searchQuery} />
      {#if filteredReference.length > 6}
        <a href="/reference" class="view-more">View All References</a>
      {/if}
    </section>
  {/if}
{:else}
  <!-- Combined Search Results -->
  <ToolsGrid idPrefix="search" tools={[...filteredTools, ...filteredReference].slice(0, toolsPerPage)} {searchQuery} />
  {#if [...filteredTools, ...filteredReference].length > toolsPerPage}
    <div class="pagination">
      <button
        disabled={currentPage === 1}
        onclick={() => {
          currentPage = Math.max(1, currentPage - 1);
          scrollToSectionOnMobile();
        }}
      >
        Previous
      </button>
      <span>{currentPage} / {Math.ceil([...filteredTools, ...filteredReference].length / toolsPerPage)}</span>
      <button
        disabled={currentPage === Math.ceil([...filteredTools, ...filteredReference].length / toolsPerPage)}
        onclick={() => {
          currentPage = Math.min(Math.ceil([...filteredTools, ...filteredReference].length / toolsPerPage), currentPage + 1);
          scrollToSectionOnMobile();
        }}
      >
        Next
      </button>
    </div>
  {/if}
{/if}

<style lang="scss">
  .sitemap-link {
    display: none;
  }
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

  .view-more {
    display: block;
    text-align: center;
    font-size: var(--font-size-md);
    color: var(--text-primary);
    text-decoration: none;
    margin-top: var(--spacing-md);
    &:hover {
      text-decoration: underline;
    }
    &:focus {
      outline: 2px solid var(--text-primary);
      outline-offset: 2px;
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--spacing-md);
    margin-top: var(--spacing-md);
    button {
      padding: var(--spacing-sm) var(--spacing-md);
      border: 1px solid var(--text-secondary);
      border-radius: 4px;
      background: none;
      color: var(--text-primary);
      cursor: pointer;
      font-size: var(--font-size-sm);
      transition: all 0.2s ease;
      &:hover:not(:disabled) {
        background: #f0f0f0; /* Light gray for clean hover */
        color: var(--text-primary);
        transform: scale(1.05);
      }
      &:focus {
        outline: 2px solid var(--text-primary);
        outline-offset: 2px;
      }
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
    span {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
    }
  }
</style>