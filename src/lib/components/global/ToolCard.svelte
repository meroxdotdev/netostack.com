<script lang="ts">
    import { tooltip } from '$lib/actions/tooltip';
  import Icon from '$lib/components/global/Icon.svelte';
  import type { NavItem } from '$lib/constants/nav';

  export let tool: NavItem;
  export let small: boolean = false;
</script>
{#if small}
  <a href={tool.href} class="tool-card small" aria-label={tool.label} use:tooltip={{ text: tool.description || '' }}>
    <div class="left">
      <h3>{tool.label}</h3>
      <div class="tool-icon">
        <Icon name={tool.icon || 'default'} />
      </div>
    </div>
    <div class="tool-arrow">
      <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
      </svg>
    </div>
  </a>
{:else}
  <a href={tool.href} class="tool-card" aria-label={tool.label}>
    <h3>{tool.label}</h3>
    <div class="right">
      <div class="tool-icon">
        <Icon name={tool.icon || 'default'} />
      </div>
      <div class="tool-content">
        <p>{tool.description}</p>
      </div>
      <div class="tool-arrow">
        <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
        </svg>
      </div>
    </div>
  </a>
{/if}


<style lang="scss">
.tool-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: inherit;
  transition: all var(--transition-fast);
  position: relative;
  height: 100%;
  min-width: 0;

  > h3 {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    line-height: 1.3;
    text-overflow: ellipsis;
    display: block;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
  }

  .right {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    min-width: 0;
  }

  .tool-content {
    min-width: 0;
  }
  
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
    text-align: left;
    padding: var(--spacing-md);
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
    p {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      margin: 0;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
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
}

.tool-card.small {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm);
  gap: var(--spacing-sm);
  background: var(--bg-tertiary);
  .left {
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
    gap: var(--spacing-md);
    min-width: 0;
  }

  h3 {
    font-size: var(--font-size-md);
    font-weight: 500;
    margin: 0;
    line-height: 1.2;
    text-overflow: ellipsis;
    display: block;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
  }

  .tool-icon {
    width: 2rem;
    height: 2rem;
    transition: all 0.25s;
    filter: saturate(0.9);
  }

  .tool-arrow {
    width: 1.25rem;
    height: 1.25rem;
    
    @media (max-width: 768px) {
      display: none;
    }
  }
  &:hover {
    .tool-icon {
      transform: scale(1.1);
      filter: saturate(1);
    }
  }

}

</style>
