<script lang="ts">
  import { getPageDetails } from '$lib/constants/nav';
  import DNSSPFBuilder from '$lib/components/tools/DNSSPFBuilder.svelte';
  import '../../../../styles/pages.scss';

  const pageDetails = getPageDetails('/dns/generators/spf-builder');
</script>

<DNSSPFBuilder />
