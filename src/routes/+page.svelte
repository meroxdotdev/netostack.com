<script lang="ts">
  import SubnetCalculator from '$lib/components/SubnetCalculator.svelte';
  import CIDRConverter from '$lib/components/CIDRConverter.svelte';
  import IPConverter from '$lib/components/IPConverter.svelte';
  import InfoPanel from '$lib/components/InfoPanel.svelte';

  let activeTab = $state<'subnet' | 'cidr' | 'converter' | 'reference'>('subnet');
  let darkMode = $state(true); // Default to hacker theme

  /**
   * Initialize theme from localStorage
   */
  function initializeTheme() {
    if (typeof window === 'undefined') return;
    
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      darkMode = false;
      document.documentElement.classList.add('theme-light');
    }
  }

  /**
   * Toggle theme
   */
  function toggleTheme() {
    darkMode = !darkMode;
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', darkMode ? 'dark' : 'light');
      if (darkMode) {
        document.documentElement.classList.remove('theme-light');
      } else {
        document.documentElement.classList.add('theme-light');
      }
    }
  }

  // Initialize on mount
  $effect(() => {
    initializeTheme();
  });

  const tabs = [
    { id: 'subnet' as const, label: 'Subnet Calc' },
    { id: 'cidr' as const, label: 'CIDR Convert' },
    { id: 'converter' as const, label: 'IP Convert' },
    { id: 'reference' as const, label: 'Reference' }
  ];
</script>

<svelte:head>
  <title>IP Calc - Network Calculator</title>
  <meta name="description" content="IP address calculator with subnet calculations, CIDR conversion, and network analysis tools." />
  <meta name="keywords" content="IP calculator, subnet calculator, CIDR converter, network tools" />
  <meta property="og:title" content="IP Calc" />
  <meta property="og:description" content="Network calculator and IP tools" />
  <meta property="og:type" content="website" />
</svelte:head>

<div class="page">
  <!-- Header -->
  <header class="header">
    <div class="container">
      <div class="header-content">
        <div class="logo">
          <div class="logo-icon">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div>
            <h1>IP Calc</h1>
            <p class="subtitle">Network Calculator</p>
          </div>
        </div>
        
        <button 
          class="theme-toggle" 
          class:dark={darkMode}
          onclick={toggleTheme}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <div class="toggle-slider">
            {#if darkMode}
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
              </svg>
            {:else}
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
              </svg>
            {/if}
          </div>
        </button>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="main-content">
    <div class="container">
      <!-- Tab Navigation -->
      <nav class="tabs">
        {#each tabs as tab}
          <button
            type="button"
            class="tab"
            class:active={activeTab === tab.id}
            onclick={() => activeTab = tab.id}
          >
            {tab.label}
          </button>
        {/each}
      </nav>

      <!-- Tab Content -->
      <div class="fade-in">
        {#if activeTab === 'subnet'}
          <SubnetCalculator />
        {:else if activeTab === 'cidr'}
          <CIDRConverter />
        {:else if activeTab === 'converter'}
          <IPConverter />
        {:else if activeTab === 'reference'}
          <InfoPanel />
        {/if}
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="footer">
    <div class="footer-content">
      <p>Built with 🩷 and 🍺 by <a href="https://github.com/lissy93" target="_blank" rel="noopener noreferrer">Lissy93</a>. <a href="https://github.com/lissy93/ip-calc" target="_blank" rel="noopener noreferrer">View on GitHub</a></p>
      <p class="footer-sub"><a href="https://ip-calc.as93.net" target="_blank" rel="noopener noreferrer">IP-Calc</a> is licensed under <a href="https://github.com/lissy93/ip-calc/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">MIT</a>, (C) <a href="https://github.com/lissy93" target="_blank" rel="noopener noreferrer">Alicia Sykes</a> 2025</p>
    </div>
  </footer>
</div>

<style>
  .footer {
    text-align: center;
    padding: var(--spacing-lg);
    border-top: 1px solid var(--border-primary);
    margin-top: var(--spacing-xl);
  }

  .footer-content {
    max-width: 600px;
    margin: 0 auto;
  }

  .footer-content p {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    margin-bottom: var(--spacing-xs);
  }

  .footer-sub {
    font-size: var(--font-size-xs) !important;
    opacity: 0.8;
  }

  .footer a {
    color: var(--color-primary);
    text-decoration: none;
    transition: color var(--transition-fast);
  }

  .footer a:hover {
    color: var(--color-primary-light);
    text-decoration: underline;
  }
</style>