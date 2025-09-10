<script lang="ts">
	import '../styles/base.scss';
	import '../styles/variables.scss';
	import '../styles/components.scss';
	import '../styles/ref-pages.scss';
	import '../styles/diagnostics-pages.scss';
	import favicon from '$lib/assets/favicon.svg';

  
  import Header from '$lib/components/furniture/Header.svelte';
  import SubHeader from '$lib/components/furniture/SubHeader.svelte';
  import Footer from '$lib/components/furniture/Footer.svelte';

	let { children } = $props();

  import '../styles/pages.scss';
  
  let darkMode = $state(true);

  function initializeTheme() {
    if (typeof window === 'undefined') return;
    
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      darkMode = false;
      document.documentElement.classList.add('theme-light');
    }
  }

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

  $effect(() => {
    initializeTheme();
  });
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>


<Header {darkMode} {toggleTheme} />
<SubHeader />
<main class="main-content">
  {@render children?.()}
</main>
<Footer />

<style>
main {
  max-width: 1200px;
  min-height: 76vh;
  margin: 1.5rem auto 1rem;
  padding: 0 var(--spacing-md);
  margin: 1rem auto;
  background: var(--bg-primary);
  padding: var(--spacing-lg) var(--spacing-md);
}
</style>

