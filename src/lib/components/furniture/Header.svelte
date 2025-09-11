<script lang="ts">
  import { page } from '$app/stores';
  import { TOP_NAV, isActive } from '$lib/constants/nav';
  import { site } from '$lib/constants/site';
  import favicon from '$lib/assets/favicon.svg';
  import Icon from '$lib/components/global/Icon.svelte';
  import GlobalSearch from '$lib/components/global/GlobalSearch.svelte';
  import BurgerMenu from '$lib/components/furniture/BurgerMenu.svelte';

  // Props from +layout for theme state & toggler
  export let darkMode: boolean;
  export let toggleTheme: () => void;
  $: currentPath = $page.url.pathname;
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
        <nav class="nav-links" aria-label="Primary">
          {#each TOP_NAV as item}
            <a
              href={item.href}
              class="nav-link {isActive(currentPath, item.href) ? 'active' : ''}"
              aria-current={isActive(currentPath, item.href) ? 'page' : undefined}
            >
              {item.label}
            </a>
          {/each}
        </nav>

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
                  <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
                </svg>
              {:else}
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 716.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
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
