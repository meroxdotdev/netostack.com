<script lang="ts">
  import { getPageDetails } from '$lib/constants/nav';
  import DNSTXTEscape from '$lib/components/tools/DNSTXTEscape.svelte';
  import '../../../../styles/pages.scss';

  const pageDetails = getPageDetails('/dns/generators/txt-escape');
</script>

<DNSTXTEscape />
