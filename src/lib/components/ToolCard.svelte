<script lang="ts">
  import Icon from './Icon.svelte';
  import type { NavItem } from '$lib/constants/nav';

  export let tool: NavItem;
</script>

<a href={tool.href} class="tool-card">
  <h3>{tool.label}</h3>
  <div class="right">
    <div class="tool-icon">
      <Icon name={tool.icon || 'default'} />
    </div>
    <div class="tool-content">
      <p>{tool.description}</p>
    </div>
    <div class="tool-arrow">
      <svg fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
      </svg>
    </div>
  </div>
</a>

<style lang="scss">
.tool-card {
  display: flex;
  // align-items: center;
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
  .right {
    display: flex;
    gap: 1rem;
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
    margin: 0;
    height: 1.4em;
    line-height: 1.4;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 0;
  }
  
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
</style>
