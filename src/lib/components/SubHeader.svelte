<script lang="ts">
  import { page } from '$app/stores';
  import { SUB_NAV, findSectionKey, isActive, type NavItem, type NavGroup } from '$lib/constants/nav';

  $: currentPath = $page.url.pathname;
  $: sectionKey = findSectionKey(currentPath); // e.g. '/reference' or '/cidr-convertor'
  $: navStructure = sectionKey ? SUB_NAV[sectionKey] : null;
  
  // Check if the structure contains groups or just items
  $: hasGroups = navStructure && navStructure.length > 0 && 'title' in navStructure[0];
</script>

{#if navStructure}
  <nav class="sub-nav" aria-label="Section">
    <div class="container">
      {#if hasGroups}
        <!-- Grouped navigation -->
        <div class="sub-nav-groups">
          {#each navStructure as group}
            {#if 'title' in group}
              <div class="nav-group">
                <div class="group-title">{group.title}</div>
                <div class="group-links">
                  {#each group.items as link}
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
  
  /* Grouped navigation styles (new) */
  .sub-nav-groups {
    display: flex;
    gap: var(--spacing-xl);
    flex-wrap: wrap;
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
    
    .sub-nav-groups {
      flex-direction: column;
      gap: var(--spacing-md);
    }
    
    .group-links {
      gap: var(--spacing-sm);
    }
  }
</style>
