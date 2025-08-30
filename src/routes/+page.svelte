<script lang="ts">
  import '../styles/pages.scss';
  import { site, pages, about } from '$lib/constants/site';
  import { ALL_PAGES } from '$lib/constants/nav';
  import Icon from '$lib/components/Icon.svelte';
  
  let darkMode = $state(true); // Default to hacker theme

  /**
   * Initialize theme from localStorage
   */
  function initializeTheme() {
    if (typeof window === 'undefined') return;
    
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      darkMode = false;
      document.documentElement.classList.add('theme-light');
    }
  }

  /**
   * Toggle theme
   */
  function toggleTheme() {
    darkMode = !darkMode;
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', darkMode ? 'dark' : 'light');
      if (darkMode) {
        document.documentElement.classList.remove('theme-light');
      } else {
        document.documentElement.classList.add('theme-light');
      }
    }
  }

  // Initialize on mount
  $effect(() => {
    initializeTheme();
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
    <p class="hero-description">
      {about.line1}<br>
      {about.line2}
    </p>
  </div>
</section>

<!-- Tools Grid -->
<section class="tools-grid">
  {#each ALL_PAGES as page}
    <a href={page.href} class="tool-card">
      <div class="tool-icon">
        <Icon name={page.icon || 'default'} />
      </div>
      <div class="tool-content">
        <h3>{page.label}</h3>
        <p>{page.description}</p>
      </div>
      <div class="tool-arrow">
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
        </svg>
      </div>
    </a>
  {/each}
</section>

<style lang="scss">
/* Homepage specific styles */
.hero {
  text-align: center;
  padding: var(--spacing-xl) 0 var(--spacing-lg);
  
  .hero-content {
    max-width: 900px;
    margin: 0 auto;
    
    h2 {
      font-size: var(--font-size-2xl);
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

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
  
  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.tool-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: inherit;
  transition: all var(--transition-fast);
  position: relative;
  
  &:hover {
    background-color: var(--surface-hover);
    border-color: var(--color-primary);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    
    .tool-arrow {
      transform: translateX(4px);
      color: var(--color-primary);
    }
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    padding: var(--spacing-md);
  }
}

.tool-icon {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-primary);
  border-radius: var(--radius-lg);
  color: var(--bg-secondary);
  flex-shrink: 0;
}

.tool-content {
  flex: 1;
  
  h3 {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--spacing-xs) 0;
  }
  
  p {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.5;
  }
}

.tool-arrow {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
  flex-shrink: 0;
  
  svg {
    width: 100%;
    height: 100%;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
}
</style>

