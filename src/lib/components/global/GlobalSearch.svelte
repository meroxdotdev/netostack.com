<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import Icon from './Icon.svelte';
  import { ALL_PAGES } from '$lib/constants/nav';
  import type { NavItem } from '$lib/constants/nav';

  let isOpen = $state(false);
  let query = $state('');
  let results = $state<NavItem[]>([]);
  let selectedIndex = $state(0);
  let searchInput: HTMLInputElement;
  
  const isMac = browser && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const shortcutKey = isMac ? '⌘' : 'Ctrl';

  function search(q: string): NavItem[] {
    if (!q.trim()) return [];
    
    const normalizedQuery = q.toLowerCase().trim();
    const tokens = normalizedQuery.split(/\s+/);
    
    return ALL_PAGES
      .map(page => {
        let score = 0;
        const searchText = `${page.label} ${page.description || ''} ${page.keywords?.join(' ') || ''}`.toLowerCase();
        
        // Exact label match (highest priority)
        if (page.label.toLowerCase() === normalizedQuery) score += 1000;
        
        // Label starts with query
        if (page.label.toLowerCase().startsWith(normalizedQuery)) score += 500;
        
        // Label contains query
        if (page.label.toLowerCase().includes(normalizedQuery)) score += 200;
        
        // All tokens found
        const allTokensFound = tokens.every(token => searchText.includes(token));
        if (allTokensFound) score += 100;
        
        // Keywords match
        if (page.keywords) {
          tokens.forEach(token => {
            if (page.keywords!.some(keyword => keyword.toLowerCase().includes(token))) {
              score += 50;
            }
          });
        }
        
        // Description match
        if (page.description && tokens.some(token => page.description!.toLowerCase().includes(token))) {
          score += 25;
        }
        
        return { ...page, score };
      })
      .filter(page => page.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }

  function open() {
    isOpen = true;
    setTimeout(() => searchInput?.focus(), 0);
  }

  function close() {
    isOpen = false;
    query = '';
    results = [];
    selectedIndex = 0;
  }

  function selectResult(index: number) {
    const result = results[index];
    if (result) {
      goto(result.href);
      close();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        close();
        break;
      case 'ArrowDown':
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        break;
      case 'Enter':
        e.preventDefault();
        selectResult(selectedIndex);
        break;
    }
  }

  function handleGlobalKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      open();
    }
  }

  $effect(() => {
    results = search(query);
    selectedIndex = 0;
  });

  onMount(() => {
    document.addEventListener('keydown', handleGlobalKeydown);
    return () => document.removeEventListener('keydown', handleGlobalKeydown);
  });

  export { open };
</script>

<!-- Trigger Button -->
<button class="search-trigger" onclick={open} aria-label="Open search">
  <Icon name="search" size="sm" />
  <span class="shortcut">{shortcutKey}K</span>
</button>

<!-- Search Modal -->
{#if isOpen}
  <div class="search-overlay" onclick={close}>
    <div class="search-modal" onclick={(e) => e.stopPropagation()}>
      <div class="search-header">
        <Icon name="search" size="sm" />
        <input
          bind:this={searchInput}
          bind:value={query}
          onkeydown={handleKeydown}
          placeholder="Search tools and pages..."
          class="search-input"
          autocomplete="off"
          spellcheck="false"
        />
        <button class="close-btn" onclick={close} aria-label="Close search">
          <Icon name="x" size="sm" />
        </button>
      </div>
      
      {#if query.trim() && results.length > 0}
        <div class="search-results">
          {#each results as result, index}
            <button
              class="result-item"
              class:selected={index === selectedIndex}
              onclick={() => selectResult(index)}
              onmouseenter={() => selectedIndex = index}
            >
              <div class="result-content">
                <div class="result-title">{result.label}</div>
                {#if result.description}
                  <div class="result-description">{result.description}</div>
                {/if}
              </div>
              <div class="result-meta">
                <span class="result-path">{result.href}</span>
                {#if index === selectedIndex}
                  <Icon name="corner-down-left" size="xs" />
                {/if}
              </div>
            </button>
          {/each}
        </div>
      {:else if query.trim()}
        <div class="no-results">
          <Icon name="search" size="md" />
          <span>No results found for "{query}"</span>
        </div>
      {:else}
        <div class="search-help">
          <div class="help-item">
            <Icon name="search" size="xs" />
            <span>Search for tools, calculators, and diagnostics</span>
          </div>
          <div class="help-item">
            <Icon name="navigation" size="xs" />
            <span>Use ↑↓ to navigate, Enter to select</span>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style lang="scss">
  .search-trigger {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--bg-tertiary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
    
    &:hover {
      background: var(--surface-hover);
      color: var(--text-primary);
    }
    
    .shortcut {
      padding: var(--spacing-xs) var(--spacing-sm);
      background: var(--bg-secondary);
      border: 1px solid var(--border-secondary);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-xs);
      font-family: var(--font-mono);
    }
  }

  .search-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 15vh;
    animation: fadeIn var(--transition-fast);
  }

  .search-modal {
    width: 100%;
    max-width: 600px;
    background: var(--bg-primary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    overflow: hidden;
    animation: slideDown var(--transition-normal);
    
    @media (max-width: 768px) {
      margin: 0 var(--spacing-md);
      max-width: calc(100vw - 2rem);
    }
  }

  .search-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--border-primary);
    
    .search-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: var(--text-primary);
      font-size: var(--font-size-lg);
      
      &::placeholder {
        color: var(--text-tertiary);
      }
    }
    
    .close-btn {
      padding: var(--spacing-xs);
      background: transparent;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);
      
      &:hover {
        background: var(--surface-hover);
        color: var(--text-primary);
      }
    }
  }

  .search-results {
    max-height: 60vh;
    overflow-y: auto;
  }

  .result-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: var(--spacing-md) var(--spacing-lg);
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--border-secondary);
    cursor: pointer;
    text-align: left;
    transition: background var(--transition-fast);
    
    &:hover,
    &.selected {
      background: var(--surface-hover);
    }
    
    &:last-child {
      border-bottom: none;
    }
    
    .result-content {
      flex: 1;
      min-width: 0;
      
      .result-title {
        color: var(--text-primary);
        font-weight: 500;
        margin-bottom: var(--spacing-xs);
      }
      
      .result-description {
        color: var(--text-secondary);
        font-size: var(--font-size-sm);
        line-height: 1.4;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    }
    
    .result-meta {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin-left: var(--spacing-md);
      
      .result-path {
        color: var(--text-tertiary);
        font-size: var(--font-size-xs);
        font-family: var(--font-mono);
      }
    }
  }

  .no-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-2xl);
    color: var(--text-secondary);
    text-align: center;
  }

  .search-help {
    padding: var(--spacing-lg);
    border-top: 1px solid var(--border-secondary);
    
    .help-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-sm) 0;
      color: var(--text-tertiary);
      font-size: var(--font-size-sm);
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
</style>