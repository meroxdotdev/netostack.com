<script lang="ts">
  import { getPageDetails } from '$lib/constants/nav';
  import DNSAAAAABulk from '$lib/components/tools/DNSAAAAABulk.svelte';
  import '../../../../styles/pages.scss';

  const _pageDetails = getPageDetails('/dns/generators/a-aaaa-bulk');
</script>

<DNSAAAAABulk />
