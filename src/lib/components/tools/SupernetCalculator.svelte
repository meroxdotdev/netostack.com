<script lang="ts">
  import { 
    calculateSupernet, 
    generateNetworkId,
    validateNetworkInput,
    analyzeAggregation,
    type NetworkInput,
    type SupernetResult
  } from '$lib/utils/supernet-calculations.js';
  import { validateIPv4 } from '$lib/utils/ip-validation.js';
  import IPInput from './IPInput.svelte';
  import Tooltip from '$lib/components/global/Tooltip.svelte';
  import Icon from '$lib/components/global/Icon.svelte';

  let networks = $state<NetworkInput[]>([]);
  let supernetResult = $state<SupernetResult | null>(null);
  let copiedStates = $state<Record<string, boolean>>({});
  let showVisualization = $state(false);

  // Add initial network
  $effect(() => {
    if (networks.length === 0) {
      addNetwork();
      addNetwork();
    }
  });

  /* Add a new network input */
  function addNetwork() {
    networks.push({
      id: generateNetworkId(),
      network: '',
      cidr: 24,
      description: ''
    });
  }

  /* Remove a network input */
  function removeNetwork(id: string) {
    networks = networks.filter(net => net.id !== id);
    if (networks.length === 0) {
      supernetResult = null;
    }
  }

  /* Update network input */
  function updateNetwork(id: string, field: keyof NetworkInput, value: any) {
    const index = networks.findIndex(n => n.id === id);
    if (index !== -1) {
      networks[index] = { ...networks[index], [field]: value };
    }
  }

  /* Calculate supernet - now handled by reactive effect */

  /* Copy text to clipboard */
  async function copyToClipboard(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      copiedStates[id] = true;
      setTimeout(() => {
        copiedStates[id] = false;
      }, 3000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }

  /* Add preset example networks */
  function loadExample(type: 'contiguous' | 'scattered') {
    if (type === 'contiguous') {
      networks = [
        { id: generateNetworkId(), network: '192.168.0.0', cidr: 25, description: 'Sales Department' },
        { id: generateNetworkId(), network: '192.168.0.128', cidr: 25, description: 'Marketing Department' },
        { id: generateNetworkId(), network: '192.168.1.0', cidr: 25, description: 'Engineering Department' },
        { id: generateNetworkId(), network: '192.168.1.128', cidr: 25, description: 'HR Department' }
      ];
    } else {
      networks = [
        { id: generateNetworkId(), network: '10.1.0.0', cidr: 24, description: 'Branch Office A' },
        { id: generateNetworkId(), network: '10.3.0.0', cidr: 24, description: 'Branch Office B' },
        { id: generateNetworkId(), network: '10.5.0.0', cidr: 24, description: 'Branch Office C' }
      ];
    }
  }

  /* Get efficiency color based on aggregation analysis */
  function getEfficiencyColor(efficiency: number): string {
    if (efficiency >= 75) return 'var(--color-success)';
    if (efficiency >= 50) return 'var(--color-warning)';
    return 'var(--color-error)';
  }

  // Aggregation analysis - reactive
  let aggregationAnalysis = $state(analyzeAggregation([]));

  // Single reactive effect for all calculations
  $effect(() => {
    const validNetworks = networks.filter(net => net.network.trim() !== '');
    
    // Update aggregation analysis
    aggregationAnalysis = analyzeAggregation(validNetworks);
    
    // Calculate supernet if we have networks
    if (validNetworks.length > 0) {
      const result = calculateSupernet(validNetworks);
      supernetResult = result;
      
      if (result.success) {
        showVisualization = true;
      }
    } else {
      supernetResult = null;
      showVisualization = false;
    }
  });
</script>

<div class="card supernet-calc-car">
  <header class="card-header">
    <h2>Supernet Calculator</h2>
    <p>Aggregate multiple networks into a single supernet for route summarization and efficient routing table management.</p>
  </header>

  <!-- Quick Examples -->
  <div class="examples-section">
    <h3>Quick Examples</h3>
    <div class="examples-buttons">
      <button type="button" class="btn btn-secondary" onclick={() => loadExample('contiguous')}>
        <Icon name="contiguous" size="md" />
        Contiguous Networks
      </button>
      <button type="button" class="btn btn-secondary" onclick={() => loadExample('scattered')}>
        <Icon name="scattered" size="md" />
        Scattered Networks
      </button>
    </div>
  </div>

  <!-- Network Inputs -->
  <div class="network-inputs">
    <div class="inputs-header">
      <h3>Input Networks</h3>
      <button type="button" class="btn btn-primary" onclick={addNetwork}>
        <Icon name="plus" size="sm" />
        Add Network
      </button>
    </div>

    <div class="inputs-list">
      {#each networks as network, index (network.id)}
        <div class="network-item">
          <div class="network-header">
            <span class="network-number">{index + 1}</span>
            <div class="network-inputs-row">
              <div class="network-input">
                <IPInput 
                  bind:value={network.network}
                  placeholder="192.168.1.0"
                />
              </div>
              <div class="cidr-input">
                <label>CIDR</label>
                <div class="cidr-controls">
                  <span class="cidr-display">/{network.cidr}</span>
                  <input
                    type="range"
                    min="8"
                    max="30"
                    bind:value={network.cidr}
                    class="cidr-slider"
                  />
                  <input
                    type="number"
                    min="8"
                    max="30"
                    bind:value={network.cidr}
                    class="cidr-number"
                  />
                </div>
              </div>
            </div>
            <button
              type="button"
              class="btn btn-danger-ghost"
              onclick={() => removeNetwork(network.id)}
              disabled={networks.length <= 1}
            >
              <Icon name="trash" size="sm" />
            </button>
          </div>
          
          <div class="network-description">
            <input
              type="text"
              placeholder="Description (optional)"
              bind:value={network.description}
              class="description-input"
            />
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Aggregation Analysis -->
  {#if aggregationAnalysis && networks.filter(n => n.network.trim()).length > 1}
    <div class="analysis-section">
      <h3>Aggregation Analysis</h3>
      <div class="analysis-card">
        <div class="analysis-header">
          <div class="analysis-stat">
            <span class="stat-label">Aggregation Efficiency</span>
            <span class="stat-value" style="color: {getEfficiencyColor(aggregationAnalysis.efficiency)}">
              {aggregationAnalysis.efficiency.toFixed(1)}%
            </span>
          </div>
          <div class="analysis-status" class:can-aggregate={aggregationAnalysis.canAggregate}>
            <Icon name={aggregationAnalysis.canAggregate ? "check-circle" : "alert-triangle"} size="sm" />
            {aggregationAnalysis.canAggregate ? 'Can Aggregate' : 'Limited Aggregation'}
          </div>
        </div>
        
        {#if aggregationAnalysis.recommendations.length > 0}
          <div class="recommendations">
            <h4>Recommendations</h4>
            <ul>
              {#each aggregationAnalysis.recommendations as recommendation}
                <li>{recommendation}</li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Results -->
  {#if supernetResult}
    <div class="results-section">
      {#if supernetResult.success && supernetResult.supernet}
        <!-- Summary Statistics -->
        <div class="info-panel success">
          <h3>Supernet Summary</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-label">Supernet Address</span>
              <div class="value-copy">
                <span class="ip-value success">{supernetResult.supernet.network}/{supernetResult.supernet.cidr}</span>
                <button 
                  class="btn btn-icon copy-btn" 
                  class:copied={copiedStates['supernet']}
                  onclick={() => supernetResult?.supernet && copyToClipboard(`${supernetResult.supernet.network}/${supernetResult.supernet.cidr}`, 'supernet')}
                >
                  <Icon name={copiedStates['supernet'] ? 'check' : 'copy'} size="sm" />
                </button>
              </div>
            </div>
            <div class="summary-item">
              <span class="summary-label">Total Hosts</span>
              <span class="summary-value">{supernetResult.supernet.totalHosts.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <!-- Route Aggregation Savings -->
        {#if supernetResult.savingsAnalysis}
          <div class="info-panel info">
            <h3>Route Aggregation Benefits</h3>
            <div class="savings-grid">
              <div class="savings-item">
                <span class="savings-label">Original Routes</span>
                <span class="savings-value">{supernetResult.savingsAnalysis.originalRoutes}</span>
              </div>
              <div class="savings-item">
                <span class="savings-label">Aggregated Routes</span>
                <span class="savings-value success">{supernetResult.savingsAnalysis.aggregatedRoutes}</span>
              </div>
              <div class="savings-item">
                <span class="savings-label">Routes Saved</span>
                <span class="savings-value success">{supernetResult.savingsAnalysis.routeReduction}</span>
              </div>
              <div class="savings-item">
                <span class="savings-label">Reduction</span>
                <span class="savings-value success">{supernetResult.savingsAnalysis.reductionPercentage.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        {/if}

        <!-- Detailed Information -->
        <div class="details-section">
          <div class="details-header">
            <h3>Supernet Details</h3>
          </div>
          
          <div class="details-grid">
            <div class="detail-item">
              <div class="detail-label-wrapper">
                <span class="detail-label">Network Address</span>
                <Tooltip text="The first IP address in the supernet that identifies the network itself">
                  <Icon name="help" size="sm" />
                </Tooltip>
              </div>
              <div class="value-copy">
                <code class="detail-value">{supernetResult.supernet.network}</code>
                <button 
                  class="btn btn-icon copy-btn" 
                  class:copied={copiedStates['network']}
                  onclick={() => supernetResult?.supernet && copyToClipboard(supernetResult.supernet.network, 'network')}
                >
                  <Icon name={copiedStates['network'] ? 'check' : 'copy'} size="sm" />
                </button>
              </div>
            </div>

            <div class="detail-item">
              <div class="detail-label-wrapper">
                <span class="detail-label">Subnet Mask</span>
                <Tooltip text="Defines which portion of the IP address represents the network vs host bits">
                  <Icon name="help" size="sm" />
                </Tooltip>
              </div>
              <div class="value-copy">
                <code class="detail-value">{supernetResult.supernet.subnetMask}</code>
                <button 
                  class="btn btn-icon copy-btn" 
                  class:copied={copiedStates['mask']}
                  onclick={() => supernetResult?.supernet && copyToClipboard(supernetResult.supernet.subnetMask, 'mask')}
                >
                  <Icon name={copiedStates['mask'] ? 'check' : 'copy'} size="sm" />
                </button>
              </div>
            </div>

            <div class="detail-item">
              <div class="detail-label-wrapper">
                <span class="detail-label">Wildcard Mask</span>
                <Tooltip text="Inverse of subnet mask, used in access control lists and routing protocols">
                  <Icon name="help" size="sm" />
                </Tooltip>
              </div>
              <div class="value-copy">
                <code class="detail-value">{supernetResult.supernet.wildcardMask}</code>
                <button 
                  class="btn btn-icon copy-btn" 
                  class:copied={copiedStates['wildcard']}
                  onclick={() => supernetResult?.supernet && copyToClipboard(supernetResult.supernet.wildcardMask, 'wildcard')}
                >
                  <Icon name={copiedStates['wildcard'] ? 'check' : 'copy'} size="sm" />
                </button>
              </div>
            </div>

            <div class="detail-item">
              <div class="detail-label-wrapper">
                <span class="detail-label">Address Range</span>
                <Tooltip text="First and last usable IP addresses in the supernet (excluding network and broadcast)">
                  <Icon name="help" size="sm" />
                </Tooltip>
              </div>
              <div class="value-copy">
                <code class="detail-value">
                  {supernetResult.supernet.addressRange.first} - {supernetResult.supernet.addressRange.last}
                </code>
                <button 
                  class="btn btn-icon copy-btn" 
                  class:copied={copiedStates['range']}
                  onclick={() => supernetResult?.supernet && copyToClipboard(`${supernetResult.supernet.addressRange.first} - ${supernetResult.supernet.addressRange.last}`, 'range')}
                >
                  <Icon name={copiedStates['range'] ? 'check' : 'copy'} size="sm" />
                </button>
              </div>
            </div>

            <div class="detail-item full-width">
              <div class="detail-label-wrapper">
                <span class="detail-label">Binary Subnet Mask</span>
                <Tooltip text="Binary representation of the subnet mask showing network (1) and host (0) bits">
                  <Icon name="help" size="sm" />
                </Tooltip>
              </div>
              <div class="value-copy">
                <code class="detail-value binary-mask">{supernetResult.supernet.binaryMask}</code>
                <button 
                  class="btn btn-icon copy-btn" 
                  class:copied={copiedStates['binary']}
                  onclick={() => supernetResult?.supernet && copyToClipboard(supernetResult.supernet.binaryMask, 'binary')}
                >
                  <Icon name={copiedStates['binary'] ? 'check' : 'copy'} size="sm" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Network Visualization -->
        {#if showVisualization}
          <div class="visualization-section">
            <h3>Network Visualization</h3>
            <div class="visualization-card">
              <div class="visualization-header">
                <h4>Input Networks vs Supernet</h4>
                <p>Visual representation of how individual networks are aggregated into a supernet</p>
              </div>
              
              <div class="network-diagram">
                <div class="input-networks">
                  <h5>Input Networks</h5>
                  {#each supernetResult.inputNetworks as network, index}
                    <div class="network-visual">
                      <div class="network-bar" style="--network-index: {index}">
                        <span class="network-label">{network.network}/{network.cidr}</span>
                        {#if network.description}
                          <span class="network-desc">{network.description}</span>
                        {/if}
                      </div>
                    </div>
                  {/each}
                </div>
                
                <div class="aggregation-arrow">
                  <Icon name="arrow-down" size="lg" />
                  <span>Aggregates to</span>
                </div>
                
                <div class="supernet-visual">
                  <h5>Supernet</h5>
                  <div class="supernet-bar">
                    <span class="supernet-label">{supernetResult.supernet.network}/{supernetResult.supernet.cidr}</span>
                    <span class="supernet-hosts">{supernetResult.supernet.totalHosts.toLocaleString()} hosts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        {/if}

      {:else}
        <!-- Error Display -->
        <div class="info-panel error">
          <h3>Calculation Error</h3>
          <p class="error-message">{supernetResult.error}</p>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .supernet-calc-car .btn {
    :global(.icon) {
      width: 1.2rem;
      height: 1.2rem;
      vertical-align: middle;
    }
  }

  .examples-section {
    margin-bottom: var(--spacing-lg);
  }

  .examples-buttons {
    display: flex;
    gap: var(--spacing-md);
    margin-top: var(--spacing-sm);
    flex-wrap: wrap;
  }

  .network-inputs {
    margin-bottom: var(--spacing-lg);
  }

  .inputs-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);
  }

  .inputs-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .network-item {
    padding: var(--spacing-md);
    background-color: var(--bg-tertiary);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-primary);
  }

  .network-header {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-sm);
  }

  .network-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    background-color: var(--color-primary);
    color: var(--bg-primary);
    border-radius: 50%;
    font-weight: 600;
    font-size: var(--font-size-sm);
    flex-shrink: 0;
    margin-top: 1.5rem; /* Align with input labels */
  }

  .network-inputs-row {
    display: flex;
    gap: var(--spacing-lg);
    flex: 1;
    align-items: center;
  }

  .network-input {
    flex: 1;
    min-width: 200px;
  }

  .cidr-input {
    min-width: 180px;
  }

  .cidr-controls {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-xs);
  }

  .cidr-display {
    font-family: var(--font-mono);
    font-weight: 600;
    color: var(--color-primary);
    font-size: var(--font-size-md);
    min-width: 2.5rem;
  }

  .cidr-slider {
    flex: 1;
    height: 0.5rem;
    background-color: var(--bg-secondary);
    border-radius: var(--radius-lg);
    appearance: none;
    cursor: pointer;
    outline: none;
    
    &::-webkit-slider-thumb {
      appearance: none;
      height: 1.25rem;
      width: 1.25rem;
      border-radius: 50%;
      background: var(--color-primary);
      cursor: pointer;
      box-shadow: var(--shadow-md);
      transition: transform var(--transition-fast);
      
      &:hover {
        transform: scale(1.1);
      }
    }

    &::-moz-range-thumb {
      height: 1.25rem;
      width: 1.25rem;
      border-radius: 50%;
      background: var(--color-primary);
      cursor: pointer;
      border: none;
      box-shadow: var(--shadow-md);
      transition: transform var(--transition-fast);
      
      &:hover {
        transform: scale(1.1);
      }
    }
  }

  .cidr-number {
    width: 3.5rem;
    text-align: center;
    
    /* Hide number input arrows */
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    
    &[type=number] {
      -moz-appearance: textfield;
      appearance: textfield;
    }
  }

  .network-description {
    margin-left: 3rem;
  }

  .description-input {
    width: 100%;
  }

  .analysis-section {
    margin-bottom: var(--spacing-lg);
  }

  .analysis-card {
    background-color: var(--bg-tertiary);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-primary);
    padding: var(--spacing-md);
  }

  .analysis-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);
  }

  .analysis-stat {
    display: flex;
    flex-direction: column;
  }

  .stat-label {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    margin-bottom: var(--spacing-xs);
  }

  .stat-value {
    font-size: var(--font-size-xl);
    font-weight: 600;
  }

  .analysis-status {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-sm);
    font-weight: 500;
    
    &.can-aggregate {
      color: var(--color-success);
      background-color: rgba(35, 134, 54, 0.1);
    }
    
    &:not(.can-aggregate) {
      color: var(--color-warning);
      background-color: rgba(210, 153, 34, 0.1);
    }

    :global(.icon) {
      max-width: 2rem;
      display: inherit;
    }
  }

  .recommendations {
    h4 {
      font-size: var(--font-size-sm);
      color: var(--text-primary);
      margin-bottom: var(--spacing-sm);
    }
    
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      
      li {
        color: var(--text-secondary);
        font-size: var(--font-size-sm);
        
        &::before {
          content: "•";
          color: var(--color-primary);
          margin-right: var(--spacing-sm);
        }
      }
    }
  }

  .results-section {
    margin-top: var(--spacing-xl);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-md);
    margin-top: var(--spacing-md);
  }

  .summary-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .summary-label {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    margin-bottom: var(--spacing-sm);
  }

  .summary-value {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--text-primary);
  }

  .value-copy {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .ip-value {
    font-family: var(--font-mono);
    font-size: var(--font-size-lg);
    font-weight: 600;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
    
    &.success {
      color: var(--color-success);
      background-color: rgba(35, 134, 54, 0.1);
    }
  }

  .savings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: var(--spacing-md);
    margin-top: var(--spacing-md);
  }

  .savings-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .savings-label {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    margin-bottom: var(--spacing-xs);
  }

  .savings-value {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--text-primary);
    
    &.success {
      color: var(--color-success);
    }
  }

  .details-section {
    background-color: var(--bg-secondary);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
  }

  .details-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-lg);
    
    h3 {
      margin: 0;
      color: var(--color-primary);
    }
  }

  .details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-lg);
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    &.full-width {
      grid-column: span 2;
    }
    :global(.icon) {
      width: var(--spacing-md)
    }
  }

  .detail-label-wrapper {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-xs);
    :global(.tooltip-trigger) {
      display: flex;
      align-items: center;
      color: var(--text-secondary);
      opacity: 0.7;
      transition: opacity var(--transition-fast);
      
      &:hover {
        opacity: 1;
        color: var(--color-info);
      }
    }
  }

  .detail-label {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    font-weight: 600;
    
  }

  .value-copy {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    width: 100%;
  }

  .detail-value {
    font-family: var(--font-mono);
    background-color: var(--bg-tertiary);
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-primary);
    flex: 1;
    min-width: 0; /* Allow text to wrap/truncate */
    font-size: var(--font-size-sm);
    
    &.binary-mask {
      font-size: var(--font-size-xs);
      word-break: break-all;
      line-height: 1.4;
    }
  }

  .copy-btn {
    transition: all var(--transition-fast);
    
    &.copied {
      color: var(--color-success);
      background-color: rgba(35, 134, 54, 0.1);
      border-color: var(--color-success);
      transform: scale(1.05);
    }
  }

  .visualization-section {
    background-color: var(--bg-secondary);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
  }

  .visualization-card {
    background-color: var(--bg-tertiary);
    border-radius: var(--radius-md);
    padding: var(--spacing-md);
  }

  .visualization-header {
    text-align: center;
    margin-bottom: var(--spacing-lg);
    
    h4 {
      color: var(--color-primary);
      margin-bottom: var(--spacing-sm);
    }
    
    p {
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
      margin: 0;
    }
  }

  .network-diagram {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
    align-items: center;
  }

  .input-networks {
    width: 100%;
    
    h5 {
      text-align: center;
      color: var(--text-primary);
      margin-bottom: var(--spacing-md);
    }
  }

  .network-visual {
    margin-bottom: var(--spacing-sm);
  }

  .network-bar {
    padding: var(--spacing-md);
    background: linear-gradient(135deg, 
      hsl(calc(200 + var(--network-index) * 40), 70%, 50%), 
      hsl(calc(220 + var(--network-index) * 40), 60%, 60%)
    );
    border-radius: var(--radius-md);
    color: var(--bg-primary);
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .network-label {
      font-family: var(--font-mono);
      font-weight: 600;
    }
    
    .network-desc {
      font-size: var(--font-size-sm);
      opacity: 0.9;
    }
  }

  .aggregation-arrow {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-xs);
    color: var(--color-primary);
    font-weight: 500;
    
    :global(.icon) {
      width: 2rem;
      height: 2rem;
    }
  }

  .supernet-visual {
    width: 100%;
    
    h5 {
      text-align: center;
      color: var(--text-primary);
      margin-bottom: var(--spacing-md);
    }
  }

  .supernet-bar {
    padding: var(--spacing-lg);
    background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
    border-radius: var(--radius-lg);
    color: var(--bg-primary);
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: var(--shadow-md);
    
    .supernet-label {
      font-family: var(--font-mono);
      font-weight: 700;
      font-size: var(--font-size-lg);
    }
    
    .supernet-hosts {
      font-size: var(--font-size-sm);
      opacity: 0.9;
    }
  }

  .error-message {
    color: var(--color-error);
    font-weight: 500;
    margin: 0;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .network-inputs-row {
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .network-input,
    .cidr-input {
      min-width: auto;
    }

    .network-number {
      margin-top: 0;
      align-self: flex-start;
    }

    .examples-buttons {
      flex-direction: column;
    }

    .summary-grid,
    .savings-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .details-grid {
      grid-template-columns: 1fr;
      gap: var(--spacing-md);
    }

    .details-section {
      padding: var(--spacing-md);
    }

    .network-bar,
    .supernet-bar {
      flex-direction: column;
      gap: var(--spacing-xs);
      text-align: center;
    }
  }

  @media (max-width: 480px) {
    .summary-grid,
    .savings-grid {
      grid-template-columns: 1fr;
    }

    .analysis-header {
      flex-direction: column;
      gap: var(--spacing-md);
    }
  }
</style>
