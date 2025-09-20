<script lang="ts">
  import ToolsGrid from '$lib/components/global/ToolsGrid.svelte';
  import { SUB_NAV, type NavGroup } from '$lib/constants/nav';

  // Extract set operations tools from the CIDR section
  const cidrNav = SUB_NAV['/cidr'] || [];
  const setOperationsGroup = cidrNav.find(
    (item): item is NavGroup => 'title' in item && item.title === 'Set Operations',
  );
  const setOperationTools = setOperationsGroup?.items || [];
</script>

<h2>Set Operation Tools</h2>
<ToolsGrid tools={setOperationTools} />
