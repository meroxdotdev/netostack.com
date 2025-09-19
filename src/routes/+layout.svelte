<script lang="ts">
	import { onMount } from 'svelte';
	import '../styles/base.scss';
	import '../styles/variables.scss';
	import '../styles/components.scss';
	import '../styles/ref-pages.scss';
	import '../styles/diagnostics-pages.scss';
	import '../styles/pages.scss';

  import favicon from '$lib/assets/favicon.svg';

  import Header from '$lib/components/furniture/Header.svelte';
  import SubHeader from '$lib/components/furniture/SubHeader.svelte';
  import Footer from '$lib/components/furniture/Footer.svelte';
  
  let { data, children } = $props(); // Gets data from the server load function

  let darkMode = $state(true); // Stores the theme mode

  onMount(() => {
    initializeTheme();
  });

  /* Reads and applies user's theme from localstorage on initial load */
  function initializeTheme() {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      darkMode = false;
      document.documentElement.classList.add('theme-light');
    }
  }

  /* Toggles between dark and light themes, saving preference to localstorage */
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

  /* Uses the server-generated breadcrumb data, to build a JSON-LD breadcrumb object */
  function jsonLdTag(data: unknown, type = 'application/ld+json', nonce?: string) {
    if (!data) return '';
    const json = JSON.stringify(data)
      .replace(/</g, '\\u003c')
      .replace(/-->/g, '--\\>');
    const nonceAttr = nonce ? ` nonce="${nonce}"` : '';
    return `<script type="${type}"${nonceAttr}>${json} <\/script>`;
  }
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  {@html jsonLdTag(data.breadcrumbJsonLd)}
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

