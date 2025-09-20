<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import '../styles/base.scss';
  import '../styles/variables.scss';
  import '../styles/components.scss';
  import '../styles/ref-pages.scss';
  import '../styles/diagnostics-pages.scss';
  import '../styles/pages.scss';

  import favicon from '$lib/assets/favicon.svg';
  import { getPageDetails, getPageDetailsWithIcon } from '$lib/constants/nav';
  import { generateFaviconDataUri } from '$lib/utils/favicon';
  import { site, author } from '$lib/constants/site';
  import { toolUsage } from '$lib/stores/toolUsage';
  import { ALL_PAGES } from '$lib/constants/nav';

  import Header from '$lib/components/furniture/Header.svelte';
  import SubHeader from '$lib/components/furniture/SubHeader.svelte';
  import Footer from '$lib/components/furniture/Footer.svelte';

  let { data, children } = $props(); // Gets data from the server load function
  let darkMode = $state(true); // Stores the theme mode
  let faviconTrigger = $state(0); // Trigger to force favicon updates

  // Get page-specific metadata or fallback to site defaults
  const seoData = $derived.by(() => {
    const currentPath = $page.url.pathname;
    const pageDetails = getPageDetails(currentPath);

    return {
      title: pageDetails?.title ? `${pageDetails.title} | ${site.title}` : site.title,
      description: pageDetails?.description || site.description,
      keywords: pageDetails?.keywords?.length ? pageDetails.keywords.join(', ') : site.keywords,
      url: `${site.url}${currentPath}`,
      image: site.image,
    };
  });

  // Dynamic favicon based on page icon
  const dynamicFavicon = $derived.by(() => {
    void faviconTrigger; // Include in order to force updates when theme changes
    const currentPath = $page.url.pathname;
    const pageDetailsWithIcon = getPageDetailsWithIcon(currentPath);
    if (pageDetailsWithIcon?.icon) {
      const faviconDataUri = generateFaviconDataUri(pageDetailsWithIcon.icon);
      if (faviconDataUri) {
        return faviconDataUri;
      }
    }

    // Fallback to default favicon
    return favicon;
  });

  onMount(() => {
    initializeTheme();
    toolUsage.init();
  });

  // Track tool visits when page changes
  $effect(() => {
    const currentPath = $page.url.pathname;

    // Check if current path is a tool page
    const toolPage = ALL_PAGES.find(tool => tool.href === currentPath);
    if (toolPage) {
      toolUsage.trackVisit(
        toolPage.href,
        toolPage.label,
        toolPage.icon,
        toolPage.description
      );
    }
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
      // Trigger favicon update 50ms after theme change
      setTimeout(() => {
        faviconTrigger++;
      }, 50);
    }
  }

  /* Uses the server-generated breadcrumb data, to build a JSON-LD breadcrumb object */
  function jsonLdTag(data: unknown, type = 'application/ld+json', nonce?: string) {
    if (!data) return '';
    const json = JSON.stringify(data).replace(/</g, '\\u003c').replace(/-->/g, '--\\>');
    const nonceAttr = nonce ? ` nonce="${nonce}"` : '';
    return `<script type="${type}"${nonceAttr}>${json} <${'/'}>script>`;
  }
</script>

<svelte:head>
  <link rel="icon" type="image/svg+xml" href={dynamicFavicon} />
  <link rel="shortcut icon" type="image/svg+xml" href={dynamicFavicon} />

  <!-- SEO Meta Tags -->
  <title>{seoData.title}</title>
  <meta name="description" content={seoData.description} />
  <meta name="keywords" content={seoData.keywords} />
  <meta name="author" content={author.name} />
  <link rel="canonical" href={seoData.url} />

  <!-- Open Graph Tags -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content={seoData.title} />
  <meta property="og:description" content={seoData.description} />
  <meta property="og:url" content={seoData.url} />
  <meta property="og:image" content={seoData.image} />
  <meta property="og:site_name" content={site.name} />

  <!-- Twitter Card Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={seoData.title} />
  <meta name="twitter:description" content={seoData.description} />
  <meta name="twitter:image" content={seoData.image} />

  <!-- Additional Meta Tags -->
  <meta name="robots" content="index, follow" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <!-- Structured Data -->
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
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
