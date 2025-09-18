<script lang="ts">
  import { page } from '$app/stores';
  import { TOP_NAV, SUB_NAV, isActive, type NavItem, type NavGroup } from '$lib/constants/nav';
  import Icon from '$lib/components/global/Icon.svelte';

  $: currentPath = $page.url.pathname;

  let activeDropdown: string | null = null;
  let activeSubDropdown: string | null = null;
  let timeoutId: number | null = null;
  let subTimeoutId: number | null = null;

  function showDropdown(href: string) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      activeDropdown = href;
    }, 800);
  }

  function hideDropdown() {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      activeDropdown = null;
      activeSubDropdown = null;
    }, 200);
  }

  function keepDropdown() {
    if (timeoutId) clearTimeout(timeoutId);
  }

  function showSubDropdown(groupTitle: string) {
    if (subTimeoutId) clearTimeout(subTimeoutId);
    subTimeoutId = window.setTimeout(() => {
      activeSubDropdown = groupTitle;
    }, 300);
  }

  function hideSubDropdown() {
    if (subTimeoutId) clearTimeout(subTimeoutId);
    subTimeoutId = window.setTimeout(() => {
      activeSubDropdown = null;
    }, 200);
  }

  function keepSubDropdown() {
    if (subTimeoutId) clearTimeout(subTimeoutId);
  }

  function hasSubPages(href: string): boolean {
    return href in SUB_NAV;
  }

  function getSubPages(href: string): (NavItem | NavGroup)[] {
    const pages = SUB_NAV[href] || [];
    // Sort so that NavGroups (sub-sections) come before NavItems (top-level pages)
    return pages.sort((a, b) => {
      const aIsGroup = isNavGroup(a);
      const bIsGroup = isNavGroup(b);
      if (aIsGroup && !bIsGroup) return -1; // Groups first
      if (!aIsGroup && bIsGroup) return 1;  // Items second
      return 0; // Keep original order within same type
    });
  }

  function isNavGroup(item: NavItem | NavGroup): item is NavGroup {
    return 'title' in item && 'items' in item;
  }

</script>

<nav class="top-nav" aria-label="Primary navigation">
  {#each TOP_NAV as item}
    <div
      class="nav-item"
      class:has-dropdown={hasSubPages(item.href)}
      role="presentation"
      on:mouseenter={() => showDropdown(item.href)}
      on:mouseleave={hideDropdown}
    >
      <a
        href={item.href}
        class="nav-link {isActive(currentPath, item.href) ? 'active' : ''}"
        aria-current={isActive(currentPath, item.href) ? 'page' : undefined}
        aria-expanded={activeDropdown === item.href}
        aria-haspopup={hasSubPages(item.href)}
      >
        {item.label}
        {#if hasSubPages(item.href)}
          <svg class="dropdown-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        {/if}
      </a>

      {#if hasSubPages(item.href) && activeDropdown === item.href}
        <div
          class="dropdown-container"
          role="menu"
          tabindex="-1"
          on:mouseenter={keepDropdown}
          on:mouseleave={hideDropdown}
        >
          <div class="primary-dropdown">
            <div class="primary-content">
              {#each getSubPages(item.href) as subItem}
                {#if 'href' in subItem}
                  <!-- Direct nav item -->
                  <a
                    href={subItem.href}
                    class="dropdown-link {isActive(currentPath, subItem.href) ? 'active' : ''}"
                    aria-current={isActive(currentPath, subItem.href) ? 'page' : undefined}
                  >
                    <div class="link-content">
                      {#if subItem.icon}<Icon name={subItem.icon} size="sm" />{/if}
                      <span class="link-title">{subItem.label}</span>
                    </div>
                    {#if subItem.description}
                      <span class="link-description">{subItem.description}</span>
                    {/if}
                  </a>
                {:else if 'title' in subItem}
                  <!-- Nav group with secondary dropdown -->
                  <div
                    class="nav-group"
                    class:has-secondary={subItem.items.length > 0}
                    role="menuitem"
                    tabindex="0"
                    on:mouseenter={() => showSubDropdown(subItem.title)}
                    on:mouseleave={hideSubDropdown}
                  >
                    <div class="group-title">
                      {subItem.title}
                      {#if subItem.items.length > 0}
                        <svg class="secondary-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      {/if}
                    </div>
                  </div>
                {/if}
              {/each}
            </div>
          </div>

          <!-- Secondary dropdowns positioned outside primary container -->
          {#each getSubPages(item.href) as subItem}
            {#if 'title' in subItem && activeSubDropdown === subItem.title && subItem.items.length > 0}
              <div
                class="secondary-dropdown"
                role="menu"
                tabindex="-1"
                on:mouseenter={keepSubDropdown}
                on:mouseleave={hideSubDropdown}
              >
                <div class="secondary-content">
                  {#each subItem.items as groupItem}
                    <a
                      href={groupItem.href}
                      class="dropdown-link {isActive(currentPath, groupItem.href) ? 'active' : ''}"
                      aria-current={isActive(currentPath, groupItem.href) ? 'page' : undefined}
                    >
                      <div class="link-content">
                        {#if groupItem.icon}<Icon name={groupItem.icon} size="sm" />{/if}
                        <span class="link-title">{groupItem.label}</span>
                      </div>
                      {#if groupItem.description}
                        <span class="link-description">{groupItem.description}</span>
                      {/if}
                    </a>
                  {/each}
                </div>
              </div>
            {/if}
          {/each}
        </div>
      {/if}
    </div>
  {/each}
</nav>

<style lang="scss">
  .top-nav {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .nav-item {
    position: relative;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: var(--spacing-sm) var(--spacing-sm) var(--spacing-sm) 0.75rem;
    font-weight: 500;
    color: var(--text-secondary);
    text-decoration: none;
    border-radius: var(--radius-md);
    transition: all 0.2s ease;
    .dropdown-icon {
      opacity: 0.4;
    }

    &:hover {
      color: var(--text-primary);
      background: var(--surface-hover);
      .dropdown-icon {
        opacity: 1;
      }
    }

    &.active {
      color: var(--color-primary);
      background: color-mix(in srgb, var(--color-primary), transparent 90%);
    }
  }

  .dropdown-icon {
    transition: transform 0.2s ease;
  }

  .has-dropdown .nav-link[aria-expanded="true"] .dropdown-icon {
    transform: rotate(180deg);
    opacity: 1;
  }

  .dropdown-container {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 5;
    overflow: visible;
  }

  .primary-dropdown {
    min-width: 20rem;
    max-width: 24rem;
    background: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    animation: dropdown-enter 0.15s ease-out;
    transform-origin: top left;
    overflow: visible;
  }

  @keyframes dropdown-enter {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(-0.5rem);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .primary-content {
    padding: 0.5rem;
    max-height: 80vh;
    overflow-y: auto;
    overflow-x: visible;
  }

  .dropdown-link {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem;
    color: var(--text-primary);
    text-decoration: none;
    border-radius: var(--radius-md);
    transition: background-color 0.15s ease;

    :global(svg) {
      flex-shrink: 0;
      opacity: 0.7;
      transition: all 0.2s ease;
    }

    &:hover {
      background: var(--surface-hover);

      :global(svg) {
        opacity: 1;
        transform: scale(1.05);
        color: var(--color-primary);
      }
    }

    &.active {
      background: color-mix(in srgb, var(--color-primary), transparent 90%);

      .link-title {
        color: var(--color-primary);
      }

      :global(svg) {
        opacity: 1;
        color: var(--color-primary);
      }
    }
  }

  .link-content {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .link-title {
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 1.25;
  }

  .link-description {
    font-size: 0.75rem;
    line-height: 1.25;
    color: var(--text-secondary);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .nav-group {
    overflow: visible;

    & + .nav-group {
      margin-top: var(--spacing-xs);
      padding-top: var(--spacing-xs);
      border-top: 1px solid var(--border-secondary);
    }

    &.has-secondary {
      cursor: pointer;

      .group-title {
        border-radius: var(--radius-md);
        transition: background-color 0.15s ease;

        &:hover {
          background: var(--surface-hover);
        }
      }
    }
  }

  .group-title {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-secondary);
    padding: 0.25rem 0.5rem 0.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .secondary-icon {
    transition: transform 0.2s ease;
    opacity: 0.7;
  }

  .has-secondary:hover .secondary-icon {
    transform: translateX(0.125rem);
    opacity: 1;
  }

  .secondary-dropdown {
    position: absolute;
    top: 0;
    left: calc(100% + 0.5rem);
    min-width: 18rem;
    max-width: 28rem;
    background: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    z-index: 6;
    animation: secondary-enter 0.15s ease-out;
    transform-origin: left center;
    pointer-events: auto;
    white-space: normal;
  }

  @keyframes secondary-enter {
    from {
      opacity: 0;
      transform: scale(0.95) translateX(-0.5rem);
    }
    to {
      opacity: 1;
      transform: scale(1) translateX(0);
    }
  }

  .secondary-content {
    padding: 0.5rem;
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    .top-nav {
      display: none;
    }
  }
</style>
