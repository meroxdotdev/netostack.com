<script lang="ts">
  interface Props {
    name: string;
    size?: 'sm' | 'md' | 'lg';
  }

  let { name, size = 'md' }: Props = $props();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };
</script>

<div class="icon {sizeClasses[size]}">
  {#if name === 'calculator'}
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8-4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8-4H7V7h2v2zm4 0h-2V7h2v2zm4 0h-2V7h2v2z"/>
    </svg>
  {:else if name === 'transform'}
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  {:else if name === 'arrow-right'}
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
    </svg>
  {:else if name === 'arrow-left'}
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
    </svg>
  {:else if name === 'layers'}
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l-5.5 9h11z"/>
      <path d="M12 8.5L6.5 17h11z"/>
      <path d="M12 15l-5.5 9h11z"/>
    </svg>
  {:else if name === 'shield'}
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C14.8,12.4 14.4,13.8 13,13.8H11C9.6,13.8 9.2,12.4 9.2,11.5V10C9.2,8.6 10.6,7 12,7Z"/>
    </svg>
  {:else if name === 'grid'}
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/>
    </svg>
  {:else}
    <!-- Default fallback icon -->
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  {/if}
</div>

<style>
  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .icon svg {
    width: 100%;
    height: 100%;
  }
</style>