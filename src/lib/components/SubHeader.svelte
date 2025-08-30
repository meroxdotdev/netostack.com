<script lang="ts">
  import { page } from '$app/stores';
  import { SUB_NAV, findSectionKey, isActive } from '$lib/constants/nav';

  $: currentPath = $page.url.pathname;
  $: sectionKey = findSectionKey(currentPath); // e.g. '/reference' or '/cidr-convertor'
  $: links = sectionKey ? SUB_NAV[sectionKey] : null;
</script>

{#if links}
  <nav class="sub-nav" aria-label="Section">
    <div class="container">
      <div class="sub-nav-links">
        {#each links as link}
          <a
            href={link.href}
            class="sub-nav-link {isActive(currentPath, link.href) ? 'active' : ''}"
            aria-current={isActive(currentPath, link.href) ? 'page' : undefined}
          >
            {link.label}
          </a>
        {/each}
      </div>
    </div>
  </nav>
{/if}
