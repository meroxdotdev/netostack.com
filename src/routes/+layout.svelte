<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import '../styles/base.scss';
  import '../styles/variables.scss';
  import '../styles/components.scss';
  import '../styles/ref-pages.scss';
  import '../styles/diagnostics-pages.scss';
  import '../styles/pages.scss';
  import '../styles/a11y.scss';

  import favicon from '$lib/assets/favicon.svg';
  import { getPageDetails, getPageDetailsWithIcon } from '$lib/constants/nav';
  import { generateFaviconDataUri } from '$lib/utils/favicon';
  import { site, author } from '$lib/constants/site';
  import { toolUsage } from '$lib/stores/toolUsage';
  import { accessibility } from '$lib/stores/accessibility';
  import { theme } from '$lib/stores/theme';
  import { ALL_PAGES } from '$lib/constants/nav';
  import { initializeOfflineSupport } from '$lib/stores/offline';
  import { bookmarks } from '$lib/stores/bookmarks';

  import Header from '$lib/components/furniture/Header.svelte';
  import SubHeader from '$lib/components/furniture/SubHeader.svelte';
  import Footer from '$lib/components/furniture/Footer.svelte';
  import OfflineIndicator from '$lib/components/common/OfflineIndicator.svelte';

  let { data, children } = $props();
  let faviconTrigger = $state(0);
  let accessibilitySettings = $state(accessibility);
  let currentTheme = $state(theme);

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

  const dynamicFavicon = $derived.by(() => {
    void faviconTrigger;
    const currentPath = $page.url.pathname;
    const pageDetailsWithIcon = getPageDetailsWithIcon(currentPath);

    if (pageDetailsWithIcon?.icon) {
      const faviconDataUri = generateFaviconDataUri(pageDetailsWithIcon.icon);
      if (faviconDataUri) {
        return faviconDataUri;
      }
    }
    const coloredFaviconDataUri = generateFaviconDataUri('z-globe');
    if (coloredFaviconDataUri) {
      return coloredFaviconDataUri;
    }
    return favicon;
  });

  onMount(() => {
    theme.init();
    toolUsage.init();
    accessibility.init();
    bookmarks.init();
    initializeOfflineSupport();
  });

  $effect(() => {
    const currentPath = $page.url.pathname;
    const toolPage = ALL_PAGES.find((tool) => tool.href === currentPath);
    if (toolPage) {
      toolUsage.trackVisit(toolPage.href, toolPage.label, toolPage.icon, toolPage.description);
    }
  });

  $effect(() => {
    if (typeof document === 'undefined') return;
    const cssClasses = accessibility.getCSSClasses($accessibilitySettings);

    if (cssClasses.trim()) {
      document.documentElement.setAttribute('data-a11y', cssClasses);
    } else {
      document.documentElement.removeAttribute('data-a11y');
    }
  });

  $effect(() => {
    void $currentTheme;
    setTimeout(() => {
      faviconTrigger++;
    }, 50);
  });

  function jsonLdTag(data: unknown, type = 'application/ld+json', nonce?: string) {
    if (!data) return '';
    try {
      const json = JSON.stringify(data)
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/-->/g, '--\\u003e')
        .replace(/\//g, '\\/');
      const nonceAttr = nonce ? ` nonce="${nonce}"` : '';
      return `<script type="${type}"${nonceAttr}>${json}</${'script'}>`;
    } catch (error) {
      console.error('Error generating JSON-LD tag:', error);
      return '';
    }
  }
</script>

<svelte:head>
  <!-- Script pentru tema corectă înainte de randare -->
  <script>
    (function() {
      try {
        var savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.classList.add('theme-' + savedTheme);
      } catch (e) {
        document.documentElement.classList.add('theme-light');
      }
    })();
  </script>

  <link rel="icon" type="image/svg+xml" href={dynamicFavicon} />
  <link rel="shortcut icon" type="image/svg+xml" href={dynamicFavicon} />

  <title>{seoData.title}</title>
  <meta name="description" content={seoData.description} />
  <meta name="keywords" content={seoData.keywords} />
  <meta name="author" content={author.name} />
  <link rel="canonical" href={seoData.url} />

  <meta property="og:type" content="website" />
  <meta property="og:title" content={seoData.title} />
  <meta property="og:description" content={seoData.description} />
  <meta property="og:url" content={seoData.url} />
  <meta property="og:image" content={seoData.image} />
  <meta property="og:site_name" content={site.name} />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={seoData.title} />
  <meta name="twitter:description" content={seoData.description} />
  <meta name="twitter:image" content={seoData.image} />

  <meta name="robots" content="index, follow" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <link rel="manifest" href="/manifest.json" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="IP Calculator" />
  <meta name="application-name" content="IP Calculator" />
  <meta name="msapplication-TileColor" content="#2563eb" />
  <meta name="theme-color" content="#2563eb" />

  {@html jsonLdTag(data.breadcrumbJsonLd)}

  <script defer data-domain="networking-toolbox.as93.net" src="https://no-track.as93.net/js/script.js"></script>
</svelte:head>

<a href="#main-content" class="skip-link">Skip to main content</a>
<a href="#navigation" class="skip-link">Skip to navigation</a>

<Header />
<SubHeader />
<OfflineIndicator />
<main id="main-content" class="main-content">
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