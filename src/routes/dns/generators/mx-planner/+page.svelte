<script lang="ts">
  import { getPageDetails } from '$lib/constants/nav';
  import DNSMXPlanner from '$lib/components/tools/DNSMXPlanner.svelte';
  import '../../../../styles/pages.scss';

  const pageDetails = getPageDetails('/dns/generators/mx-planner');
</script>

<DNSMXPlanner />
