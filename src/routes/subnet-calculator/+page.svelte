<script lang="ts">
  import SubnetCalculator from '$lib/components/SubnetCalculator.svelte';
  import '../../styles/pages.scss';
  
</script>

<svelte:head>
  <title>Subnet Calculator - IP Calc</title>
  <meta name="description" content="Calculate subnet information, network addresses, broadcast addresses, and host ranges. Professional subnet calculator with visual network analysis." />
  <meta name="keywords" content="subnet calculator, network calculator, IP subnetting, CIDR, network analysis" />
  <meta property="og:title" content="Subnet Calculator - IP Calc" />
  <meta property="og:description" content="Professional subnet calculator with network visualization and detailed analysis" />
  <meta property="og:url" content="https://ip-calc.as93.net/subnet-calculator" />
</svelte:head>

<div class="page">

  <!-- Main Content -->
  <div class="container">
    <SubnetCalculator />
  </div>
</div>

