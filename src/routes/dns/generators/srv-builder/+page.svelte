<script lang="ts">
  import { getPageDetails } from '$lib/constants/nav';
  import DNSSRVBuilder from '$lib/components/tools/DNSSRVBuilder.svelte';
  import '../../../../styles/pages.scss';

  const _pageDetails = getPageDetails('/dns/generators/srv-builder');
</script>

<DNSSRVBuilder />
