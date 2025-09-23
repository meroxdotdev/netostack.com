<script lang="ts">
  import { browser } from '$app/environment';
    import Icon from '$lib/components/global/Icon.svelte';
  import { onMount } from 'svelte';

  let isOffline = false;
  let isStaticDeployment = false;

  onMount(() => {
    if (browser) {
      // Check if browser is offline
      isOffline = !navigator.onLine;

      // Listen for online/offline events
      const handleOnline = () => (isOffline = false);
      const handleOffline = () => (isOffline = true);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Check for static deployment environment
      // This checks for common static deployment indicators
      isStaticDeployment =
        import.meta.env.DEPLOY_ENV === 'static' ||
        import.meta.env.DEPLOY_ENV === 'STATIC' ||
        import.meta.env.VITE_DEPLOY_ENV === 'static' ||
        import.meta.env.VITE_DEPLOY_ENV === 'STATIC' ||
        // Fallback: check if we're missing server-side features
        typeof window !== 'undefined' && !window.fetch;

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  });

  $: showWarning = isOffline || isStaticDeployment;
</script>

{#if showWarning}
  <div class="warning-banner" role="alert" aria-live="polite">
    <div class="warning-content">
      <Icon name="warning" size="sm" />
      <div class="warning-text">
        <strong>Limited Functionality:</strong>
        {#if isOffline && isStaticDeployment}
          Diagnostic tools are unavailable due to offline status and static deployment.
        {:else if isOffline}
          Diagnostic tools are unavailable while offline.
        {:else}
          Diagnostic tools will not work properly on static deployments.
        {/if}
      </div>
    </div>
  </div>
{/if}

<slot />

<style lang="scss">
  .warning-banner {
    background: linear-gradient(135deg,
      color-mix(in srgb, var(--color-warning), transparent 90%),
      color-mix(in srgb, var(--color-warning), transparent 95%));
    border: 1px solid color-mix(in srgb, var(--color-warning), transparent 70%);
    border-radius: var(--radius-md);
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
    animation: slideIn 0.3s ease-out;

    .warning-content {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-sm);
      max-width: 100%;
    }

    :global(.icon) {
      color: var(--color-warning);
    }

    .warning-text {
      color: var(--text-primary);
      font-size: 0.875rem;
      line-height: 1.5;
      flex: 1;
      min-width: 0;

      strong {
        font-weight: 600;
        color: var(--color-warning);
      }
    }
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-0.5rem); }
    to { opacity: 1; transform: translateY(0); }
  }

</style>
