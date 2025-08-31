<script lang="ts">
  import { page } from '$app/stores';
  import { SUB_NAV, findSectionKey, isActive, type NavItem, type NavGroup } from '$lib/constants/nav';

  $: currentPath = $page.url.pathname;
  $: sectionKey = findSectionKey(currentPath); // e.g. '/reference' or '/cidr'
  $: navStructure = sectionKey ? SUB_NAV[sectionKey] : null;
  
  // Check if the structure contains any groups
  $: hasGroups = navStructure && navStructure.some(item => 'title' in item);
</script>

{#if navStructure}
  <nav class="sub-nav" aria-label="Section">
    <div class="container">
      {#if hasGroups}
        <!-- Mixed navigation with groups and flat items -->
        <div class="mixed-nav">
          <!-- Render all groups first -->
          {#each navStructure as item}
            {#if 'title' in item}
              <div class="nav-group">
                <div class="group-title">{item.title}</div>
                <div class="group-links">
                  {#each item.items as link}
                    <a
                      href={link.href}
                      class="sub-nav-link {isActive(currentPath, link.href) ? 'active' : ''}"
                      aria-current={isActive(currentPath, link.href) ? 'page' : undefined}
                    >
                      {link.label}
                    </a>
                  {/each}
                </div>
              </div>
            {/if}
          {/each}
          
          <!-- Render standalone links under "More" group if any exist -->
          {#if navStructure.some(item => 'href' in item)}
            <div class="nav-group">
              <div class="group-title">More</div>
              <div class="group-links">
                {#each navStructure as item}
                  {#if 'href' in item}
                    <a
                      href={item.href}
                      class="sub-nav-link {isActive(currentPath, item.href) ? 'active' : ''}"
                      aria-current={isActive(currentPath, item.href) ? 'page' : undefined}
                    >
                      {item.label}
                    </a>
                  {/if}
                {/each}
              </div>
            </div>
          {/if}
        </div>
      {:else}
        <!-- Flat navigation -->
        <div class="sub-nav-links">
          {#each navStructure as link}
            {#if 'href' in link}
              <a
                href={link.href}
                class="sub-nav-link {isActive(currentPath, link.href) ? 'active' : ''}"
                aria-current={isActive(currentPath, link.href) ? 'page' : undefined}
              >
                {link.label}
              </a>
            {/if}
          {/each}
        </div>
      {/if}
    </div>
  </nav>
{/if}

<style>
  /* Base sub-nav styles */
  .sub-nav {
    background-color: var(--bg-tertiary);
    border-bottom: 1px solid var(--border-primary);
    padding: var(--spacing-sm) 0;
    @media (max-width: 768px) {
      display: none;
    }
  }
  
  /* Flat navigation styles (existing) */
  .sub-nav-links {
    display: flex;
    gap: var(--spacing-md);
  }
  
  .sub-nav-link {
    padding: var(--spacing-xs) var(--spacing-md);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    text-decoration: none;
    transition: all var(--transition-fast);
  }
  
  .sub-nav-link:hover {
    color: var(--color-primary);
    background-color: var(--surface-hover);
  }
  
  .sub-nav-link.active {
    color: var(--color-primary);
    background-color: var(--surface-hover);
    font-weight: 500;
  }
  
  /* Mixed navigation styles */
  .mixed-nav {
    display: flex;
    gap: var(--spacing-md);
    flex-wrap: wrap;
    align-items: flex-start;
  }
  
  .nav-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }
  
  .group-title {
    font-size: var(--font-size-xs);
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: var(--spacing-xs) var(--spacing-md);
  }
  
  .group-links {
    display: flex;
    gap: var(--spacing-md);
  }
  
  /* Responsive styles */
  @media (max-width: 768px) {
    .sub-nav-links {
      gap: var(--spacing-sm);
    }
    
    .mixed-nav,
    .sub-nav-groups {
      flex-direction: column;
      gap: var(--spacing-md);
    }
    
    .group-links {
      gap: var(--spacing-sm);
    }
  }
</style>
