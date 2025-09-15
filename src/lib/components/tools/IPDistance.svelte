<script lang="ts">
  import { calculateIPDistances, type DistanceResult } from '$lib/utils/ip-distance.js';
  import Icon from '$lib/components/global/Icon.svelte';
  
  let inputText = $state('192.168.1.1 -> 192.168.1.100\n10.0.0.1 -> 10.0.0.255\n2001:db8::1 -> 2001:db8::ffff');
  let inclusive = $state(true);
  let showIntermediates = $state(false);
  let result = $state<DistanceResult | null>(null);
  let isLoading = $state(false);
  
  function calculateDistances() {
    if (!inputText.trim()) {
      result = null;
      return;
    }
    
    isLoading = true;
    
    try {
      const inputs = inputText.split('\n').filter(line => line.trim());
      result = calculateIPDistances(inputs, inclusive, showIntermediates);
    } catch (error) {
      result = {
        calculations: [],
        summary: { totalCalculations: 0, validCalculations: 0, invalidCalculations: 0, totalDistance: '0', averageDistance: '0' },
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    } finally {
      isLoading = false;
    }
  }
  
  function exportResults(format: 'csv' | 'json') {
    if (!result) return;
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    let content = '';
    let filename = '';
    
    if (format === 'csv') {
      const headers = 'Start IP,End IP,Distance,Version,Inclusive,Direction,Valid,Error';
      const rows = result.calculations.map(calc => 
        `"${calc.startIP}","${calc.endIP}","${calc.distance}","IPv${calc.version}","${calc.inclusive}","${calc.direction}","${calc.isValid}","${calc.error || ''}"`
      );
      content = [headers, ...rows].join('\n');
      filename = `ip-distances-${timestamp}.csv`;
    } else {
      content = JSON.stringify(result, null, 2);
      filename = `ip-distances-${timestamp}.json`;
    }
    
    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }
  
  function formatDirection(direction: 'forward' | 'backward'): string {
    return direction === 'forward' ? '→' : '←';
  }
  
  function getDirectionColor(direction: 'forward' | 'backward'): string {
    return direction === 'forward' ? '#059669' : '#d97706';
  }
  
  // Auto-calculate when inputs change
  $effect(() => {
    if (inputText.trim()) {
      const timeoutId = setTimeout(calculateDistances, 300);
      return () => clearTimeout(timeoutId);
    }
  });
</script>

<div class="card">
  <header class="card-header">
    <h2>IP Distance Calculator</h2>
    <p>Calculate the number of addresses between two IP addresses with inclusive/exclusive counting</p>
  </header>

  <div class="input-section">
      <div class="input-group">
        <label for="inputs">IP Address Pairs</label>
        <textarea
          id="inputs"
          bind:value={inputText}
          placeholder="192.168.1.1 -> 192.168.1.100&#10;10.0.0.1 -> 10.0.0.255&#10;2001:db8::1 -> 2001:db8::ffff"
          rows="6"
        ></textarea>
        <div class="input-help">
          Enter one pair per line. Formats: start → end, start -> end, start end, start - end
        </div>
      </div>

      <div class="input-group">
        <label>
          <input type="checkbox" bind:checked={inclusive} />
          Inclusive Counting
        </label>
        <div class="input-help">
          Include both start and end addresses in the count
        </div>
      </div>
      
      <div class="input-group">
        <label>
          <input type="checkbox" bind:checked={showIntermediates} />
          Show Intermediate IPs
        </label>
        <div class="input-help">
          Display sample addresses between start and end (max 10)
        </div>
      </div>
    </div>

    {#if isLoading}
      <div class="loading">
        <Icon name="loader" />
        Calculating distances...
      </div>
    {/if}

    {#if result}
    <div class="results">
      {#if result.errors.length > 0}
        <div class="errors">
          <h3><Icon name="alert-triangle" /> Errors</h3>
          {#each result.errors as error}
            <div class="error-item">{error}</div>
          {/each}
        </div>
      {/if}

      {#if result.calculations.length > 0}
        <div class="summary">
          <h3>Distance Summary</h3>
          <div class="summary-stats">
            <div class="stat">
              <span class="stat-value">{result.summary.totalCalculations}</span>
              <span class="stat-label">Total Pairs</span>
            </div>
            <div class="stat valid">
              <span class="stat-value">{result.summary.validCalculations}</span>
              <span class="stat-label">Valid</span>
            </div>
            <div class="stat invalid">
              <span class="stat-value">{result.summary.invalidCalculations}</span>
              <span class="stat-label">Invalid</span>
            </div>
            <div class="stat">
              <span class="stat-value">{result.summary.totalDistance}</span>
              <span class="stat-label">Total Distance</span>
            </div>
            <div class="stat">
              <span class="stat-value">{result.summary.averageDistance}</span>
              <span class="stat-label">Average Distance</span>
            </div>
          </div>
        </div>

        <div class="calculations">
          <div class="calculations-header">
            <h3>Distance Calculations</h3>
            <div class="export-buttons">
              <button onclick={() => exportResults('csv')}>
                <Icon name="download" />
                Export CSV
              </button>
              <button onclick={() => exportResults('json')}>
                <Icon name="download" />
                Export JSON
              </button>
            </div>
          </div>

          <div class="calculations-list">
            {#each result.calculations as calculation}
              <div class="calculation-card" class:valid={calculation.isValid} class:invalid={!calculation.isValid}>
                <div class="card-header">
                  <div class="ip-pair">
                    <div class="ip-address">
                      <span class="ip-label">Start</span>
                      <button type="button" class="code-button" onclick={() => copyToClipboard(calculation.startIP)} title="Click to copy">
                        {calculation.startIP}
                      </button>
                    </div>
                    
                    <div class="direction-arrow" style="color: {getDirectionColor(calculation.direction)}">
                      {formatDirection(calculation.direction)}
                    </div>
                    
                    <div class="ip-address">
                      <span class="ip-label">End</span>
                      <button type="button" class="code-button" onclick={() => copyToClipboard(calculation.endIP)} title="Click to copy">
                        {calculation.endIP}
                      </button>
                    </div>
                  </div>
                  
                  <div class="status">
                    {#if calculation.isValid}
                      <Icon name="check-circle" />
                    {:else}
                      <Icon name="x-circle" />
                    {/if}
                  </div>
                </div>

                {#if calculation.isValid}
                  <div class="calculation-details">
                    <div class="distance-info">
                      <div class="distance-value">
                        <span class="distance-number" onclick={() => copyToClipboard(calculation.distance)} title="Click to copy">
                          {calculation.distance}
                        </span>
                        <span class="distance-label">
                          address{calculation.distanceNumber === 1n ? '' : 'es'}
                          ({calculation.inclusive ? 'inclusive' : 'exclusive'})
                        </span>
                      </div>
                      
                      <div class="calculation-meta">
                        <span class="meta-item">
                          <Icon name="globe" />
                          IPv{calculation.version}
                        </span>
                        <span class="meta-item" style="color: {getDirectionColor(calculation.direction)}">
                          <Icon name="arrow-right" />
                          {calculation.direction}
                        </span>
                      </div>
                    </div>

                    {#if calculation.intermediateAddresses.length > 0}
                      <div class="intermediates">
                        <h4>Intermediate Addresses</h4>
                        <div class="intermediate-list">
                          {#each calculation.intermediateAddresses as ip}
                            <button type="button" class="code-button" onclick={() => copyToClipboard(ip)} title="Click to copy">{ip}</button>
                          {/each}
                          {#if calculation.distanceNumber > BigInt(calculation.intermediateAddresses.length + 2)}
                            <span class="more-indicator">
                              ... and {(calculation.distanceNumber - BigInt(calculation.intermediateAddresses.length + 2)).toLocaleString()} more
                            </span>
                          {/if}
                        </div>
                      </div>
                    {/if}
                  </div>
                {:else}
                  <div class="error-message">
                    <Icon name="alert-triangle" />
                    {calculation.error}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>



  .input-section {
    display: grid;
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
  }

  @media (min-width: 768px) {
    .input-section {
      grid-template-columns: 2fr 1fr;
    }
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .input-group label {
    display: block;
    color: var(--text-primary);
    font-weight: 500;
    margin-bottom: var(--spacing-xs);
  }

  .input-group textarea {
    width: 100%;
    padding: var(--spacing-sm);
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    color: var(--text-primary);
    font-family: var(--font-mono);
    resize: vertical;
    min-height: 150px;
  }

  .input-help {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    margin-top: var(--spacing-xs);
  }


  .loading {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    justify-content: center;
    padding: var(--spacing-lg);
    color: var(--color-primary);
  }

  .results {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .errors {
    background: var(--bg-tertiary);
    border: 1px solid var(--color-error);
    border-radius: var(--border-radius);
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-md);
  }

  .errors h3 {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-sm);
    color: var(--color-error);
  }

  .error-item {
    color: var(--color-error);
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
    margin-bottom: var(--spacing-xs);
  }

  .summary {
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-md);
  }

  .summary h3 {
    margin: 0 0 var(--spacing-sm) 0;
    color: var(--text-primary);
  }

  .summary-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: var(--spacing-md);
  }

  .stat {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm);
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
  }

  .stat-label {
    color: var(--text-secondary);
  }

  .stat-value {
    font-weight: 600;
    color: var(--text-primary);
    font-family: var(--font-mono);
  }

  .stat.valid .stat-value {
    color: var(--color-success);
  }

  .stat.invalid .stat-value {
    color: var(--color-error);
  }

  .calculations-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);
  }

  .calculations-header h3 {
    color: var(--text-primary);
  }

  .export-buttons {
    display: flex;
    gap: var(--spacing-sm);
  }

  .export-buttons button {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
    background: var(--color-primary);
    color: var(--bg-primary);
    border: none;
    border-radius: var(--border-radius);
    font-size: var(--font-size-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .export-buttons button:hover {
    background: var(--color-primary-hover);
    transform: translateY(-1px);
  }

  .calculations-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .calculation-card {
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    padding: var(--spacing-md);
    background: var(--bg-tertiary);
    margin-bottom: var(--spacing-md);
  }

  .calculation-card.valid {
    border-color: var(--color-success);
  }

  .calculation-card.invalid {
    border-color: var(--color-error);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);
  }

  .ip-pair {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    flex-wrap: wrap;
  }

  @media (max-width: 767px) {
    .ip-pair {
      flex-direction: column;
      gap: var(--spacing-sm);
      align-items: stretch;
    }
  }

  .ip-address {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-xs);
  }

  .ip-label {
    font-size: var(--font-size-xs);
    font-weight: 500;
    text-transform: uppercase;
    color: var(--text-secondary);
  }


  .direction-arrow {
    font-size: 1.5rem;
    font-weight: 700;
  }

  @media (max-width: 767px) {
    .direction-arrow {
      transform: rotate(90deg);
    }
  }

  .status {
    color: var(--color-success);
  }

  .calculation-card.invalid .status {
    color: var(--color-error);
  }

  .calculation-details {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .distance-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    background: rgba(255, 255, 255, 0.6);
    border-radius: 0.25rem;
  }

  @media (max-width: 767px) {
    .distance-info {
      flex-direction: column;
      gap: var(--spacing-sm);
      text-align: center;
    }
  }

  .distance-value {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .distance-number {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    font-family: var(--font-mono);
    color: var(--color-primary);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .distance-number:hover {
    color: var(--color-primary-hover);
    transform: translateY(-1px);
  }

  .distance-label {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    font-weight: 500;
  }

  .calculation-meta {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--font-size-sm);
    font-weight: 500;
    color: var(--text-primary);
  }

  .intermediates {
    padding: var(--spacing-md);
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
  }

  .intermediates h4 {
    margin-bottom: var(--spacing-sm);
    color: var(--text-primary);
    font-size: var(--font-size-md);
  }

  .intermediate-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
    align-items: center;
  }


  .more-indicator {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    font-style: italic;
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    color: var(--color-error);
    font-size: var(--font-size-sm);
    padding: var(--spacing-sm);
    background: var(--bg-tertiary);
    border: 1px solid var(--color-error);
    border-radius: var(--border-radius);
  }

  @media (max-width: 767px) {
    .summary-stats {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .card-header {
      flex-direction: column;
      gap: var(--spacing-sm);
      align-items: stretch;
    }
    
    .export-buttons {
      justify-content: stretch;
    }

    .export-buttons button {
      flex: 1;
      justify-content: center;
    }
  }

  .code-button {
    background: var(--bg-code);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-sm);
    padding: var(--spacing-xs) var(--spacing-sm);
    margin: 0 var(--spacing-xs) 0 0;
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
    color: var(--text-code);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: var(--bg-code-hover);
      border-color: var(--color-primary);
    }

    &:active {
      transform: translateY(1px);
    }
  }
</style>
