<script lang="ts">
  import { site } from '$lib/constants/site';
  import favicon from '$lib/assets/favicon.svg';
  import Icon from '$lib/components/global/Icon.svelte';
  import GlobalSearch from '$lib/components/global/GlobalSearch.svelte';
  import BurgerMenu from '$lib/components/furniture/BurgerMenu.svelte';
  import TopNav from '$lib/components/furniture/TopNav.svelte';

  // Props from +layout for theme state & toggler
  export let darkMode: boolean;
  export let toggleTheme: () => void;
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<header class="header">
  <div class="container">
    <div class="header-content">
      <div class="logo">
        <div class="logo-icon">
          <a href="/" aria-label="Home">
            <Icon name="networking" size="lg" />
          </a>
        </div>
        <div>
          <h1><a href="/">{site.title}</a></h1>
          <p class="subtitle">The sysadmin's Swiss Army knife</p>
        </div>
      </div>

      <div class="header-actions">
        <TopNav />

        <div class="header-buttons">
          <GlobalSearch />

          <button
            class="theme-toggle"
            class:dark={darkMode}
            onclick={toggleTheme}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <div class="toggle-slider">
              {#if darkMode}
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clip-rule="evenodd"
                  />
                </svg>
              {:else}
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 716.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              {/if}
            </div>
          </button>

          <BurgerMenu />
        </div>
      </div>
    </div>
  </div>
</header>

<style lang="scss">
  .header-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }

  .header-buttons {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .theme-toggle {
    position: relative;
    width: 3rem;
    height: 1.5rem;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-primary);
    border-radius: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: var(--surface-hover);
    }

    &.dark {
      background: var(--color-primary);
      border-color: var(--color-primary);
    }
  }

  .toggle-slider {
    position: absolute;
    top: 1px;
    left: 1px;
    width: 1.25rem;
    height: 1.25rem;
    background: var(--bg-primary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease;
    box-shadow: var(--shadow-sm);

    svg {
      width: 0.75rem;
      height: 0.75rem;
      color: var(--text-secondary);
    }

    .dark & {
      transform: translateX(1.5rem);
      background: var(--bg-primary);

      svg {
        color: var(--color-primary);
      }
    }
  }
</style>
