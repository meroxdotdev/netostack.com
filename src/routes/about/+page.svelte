<script lang="ts">
  import '../../styles/pages.scss';
  import { site, pages } from '$lib/constants/site';
  import ToolsCarousel from '$lib/components/global/ToolsCarousel.svelte';
  import { SUB_NAV } from '$lib/constants/nav';

  // Import section components
  import ApiSection from '$lib/components/page-specific/about/ApiSection.svelte';
  import SelfHostingSection from '$lib/components/page-specific/about/SelfHostingSection.svelte';
  import BuildingSection from '$lib/components/page-specific/about/BuildingSection.svelte';
  import AuthorSection from '$lib/components/page-specific/about/AuthorSection.svelte';
  import AttributionsSection from '$lib/components/page-specific/about/AttributionsSection.svelte';
  import LicenseSection from '$lib/components/page-specific/about/LicenseSection.svelte';
</script>

<svelte:head>
  <title>{pages.about.title}</title>
  <meta name="description" content={pages.about.description} />
  <meta name="keywords" content={site.keywords} />
  <meta property="og:title" content={pages.about.title} />
  <meta property="og:description" content={pages.about.ogDescription} />
  <meta property="og:url" content="{site.url}/about" />
</svelte:head>

<!-- Section 0: Hero -->
<div class="hero">
  <h2>About {site.title}</h2>
  <p class="lead">
    Networking Toolbox is a collection of free, open-source networking utilities designed to simplify common
    network-related tasks for system administrators and network engineers.
  </p>
</div>
<section>
  <ToolsCarousel sections={SUB_NAV} speedBase={36} gap="var(--spacing-sm)" pauseOnHover reverseAlternate />
</section>
<!-- Links #1: GitHub -->
<!-- Links #1: Live Demo, DockerHub, CodeBerg Mirror, Sponsor, More Apps -->


<ApiSection />
<SelfHostingSection />
<BuildingSection />
<AuthorSection />
<AttributionsSection />
<LicenseSection />

<style lang="scss">
  .hero {
    margin-bottom: var(--spacing-xl);
    h2 {
      font-size: var(--font-size-2xl);
      margin-bottom: var(--spacing-lg);
    }
    .lead {
      font-size: var(--font-size-md);
      color: var(--text-secondary);
    }
  }

  .contents {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-2xl);
    @media (max-width: 700px) {
      grid-template-columns: 1fr;
    }
  }
</style>
