<script lang="ts">
  import '../styles/pages.scss';
  
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

  const sections = [
    {
      title: 'Subnet Calculator',
      description: 'Calculate subnet information, network addresses, and host ranges',
      href: '/subnet-calculator',
      icon: 'calculator'
    },
    {
      title: 'CIDR Converter',
      description: 'Convert between CIDR notation and subnet masks',
      href: '/cidr-convertor/cidr-to-subnet-mask',
      icon: 'convert'
    },
    {
      title: 'IP Address Converter',
      description: 'Convert IP addresses between different formats',
      href: '/ip-address-convertor',
      icon: 'transform'
    },
    {
      title: 'Network Reference',
      description: 'Essential networking information, classes, and reserved ranges',
      href: '/ip-reference/network-classes',
      icon: 'reference'
    }
  ];
</script>

<svelte:head>
  <title>IP Calc - Network Calculator & IP Tools</title>
  <meta name="description" content="Comprehensive IP address calculator with subnet calculations, CIDR conversion, IP format conversion, and network reference tools." />
  <meta name="keywords" content="IP calculator, subnet calculator, CIDR converter, network tools, IP tools, networking" />
  <meta property="og:title" content="IP Calc - Network Calculator & IP Tools" />
  <meta property="og:description" content="Comprehensive network calculator and IP tools for subnet calculations, CIDR conversion, and network analysis" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://ip-calc.as93.net" />
</svelte:head>


<!-- Hero Section -->
<section class="hero">
  <div class="hero-content">
    <h2>Professional Network Calculation Tools</h2>
    <p class="hero-description">
      Comprehensive suite of networking tools for subnet calculations, CIDR conversions, 
      IP format transformations, and network reference information.
    </p>
  </div>
</section>

<!-- Tools Grid -->
<section class="tools-grid">
  {#each sections as section}
    <a href={section.href} class="tool-card">
      <div class="tool-icon">
        {#if section.icon === 'calculator'}
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8-4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8-4H7V7h2v2zm4 0h-2V7h2v2zm4 0h-2V7h2v2z"/>
          </svg>
        {:else if section.icon === 'convert'}
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        {:else if section.icon === 'transform'}
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        {:else if section.icon === 'reference'}
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
        {/if}
      </div>
      <div class="tool-content">
        <h3>{section.title}</h3>
        <p>{section.description}</p>
      </div>
      <div class="tool-arrow">
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
        </svg>
      </div>
    </a>
  {/each}
</section>

