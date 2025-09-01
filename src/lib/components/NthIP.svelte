<script lang="ts">
  import { calculateNthIPs, type NthIPResult } from '$lib/utils/nth-ip.js';
  import Icon from '$lib/components/Icon.svelte';
  
  let inputText = $state('192.168.1.0/24 @ 10\n10.0.0.0-10.0.0.255 [50]\n172.16.0.0/16 100\n2001:db8::/64#1000');
  let globalOffset = $state(0);
  let result = $state<NthIPResult | null>(null);
  let isLoading = $state(false);
  
  function calculateIPs() {
    if (!inputText.trim()) {
      result = null;
      return;
    }
    
    isLoading = true;
    
    try {
      const inputs = inputText.split('\n').filter(line => line.trim());
      result = calculateNthIPs(inputs, globalOffset);
    } catch (error) {
      result = {
        calculations: [],
        summary: { totalCalculations: 0, validCalculations: 0, invalidCalculations: 0, outOfBoundsCalculations: 0 },
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
      const headers = 'Input,Network,Index,Offset,Result IP,Version,Total Addresses,In Bounds,Valid,Error';
      const rows = result.calculations.map(calc => 
        `"${calc.input}","${calc.network}","${calc.index}","${calc.offset}","${calc.resultIP}","IPv${calc.version}","${calc.totalAddresses}","${calc.isInBounds}","${calc.isValid}","${calc.error || ''}"`
      );
      content = [headers, ...rows].join('\n');
      filename = `nth-ip-${timestamp}.csv`;
    } else {
      content = JSON.stringify(result, null, 2);
      filename = `nth-ip-${timestamp}.json`;
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
  
  // Auto-calculate when inputs change
  $effect(() => {
    if (inputText.trim()) {
      const timeoutId = setTimeout(calculateIPs, 300);
      return () => clearTimeout(timeoutId);
    }
  });
</script>

<div class="card">
  <header class="card-header">
    <h2>Nth IP Calculator</h2>
    <p>Resolve the IP address at a specific index within networks and ranges with optional offset</p>
  </header>

  <div class="input-section">
      <div class="input-group">
      <label for="inputs">Network and Index Specifications</label>
      <textarea
        id="inputs"
        bind:value={inputText}
        placeholder="192.168.1.0/24 @ 10&#10;10.0.0.0-10.0.0.255 [50]&#10;172.16.0.0/16 100&#10;2001:db8::/64#1000"
        rows="6"
      ></textarea>
      <div class="input-help">
        Formats: network @ index, network [index], network index, or network#index. Optional offset: + number
      </div>
    </div>

      <div class="options">
        <div class="option-group">
        <label for="offset">Global Offset</label>
        <input
          id="offset"
          type="number"
          bind:value={globalOffset}
          placeholder="0"
          min="0"
        />
        <div class="option-help">
          Add this value to all index calculations (0-based indexing)
        </div>
      </div>
    </div>
  </div>

  {#if isLoading}
    <div class="loading">
      <Icon name="loader" />
      Calculating IPs...
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
          <h3>Calculation Summary</h3>
          <div class="summary-stats">
            <div class="stat">
              <span class="stat-value">{result.summary.totalCalculations}</span>
              <span class="stat-label">Total Calculations</span>
            </div>
            <div class="stat valid">
              <span class="stat-value">{result.summary.validCalculations}</span>
              <span class="stat-label">Valid</span>
            </div>
            <div class="stat invalid">
              <span class="stat-value">{result.summary.invalidCalculations}</span>
              <span class="stat-label">Invalid</span>
            </div>
            <div class="stat out-of-bounds">
              <span class="stat-value">{result.summary.outOfBoundsCalculations}</span>
              <span class="stat-label">Out of Bounds</span>
            </div>
          </div>
        </div>

        <div class="calculations">
          <div class="calculations-header">
            <h3>IP Calculations</h3>
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
              <div class="calculation-card" 
                   class:valid={calculation.isValid && calculation.isInBounds} 
                   class:out-of-bounds={calculation.isValid && !calculation.isInBounds}
                   class:invalid={!calculation.isValid}>
                <div class="card-header">
                  <div class="input-info">
                    <span class="input-text">{calculation.input}</span>
                    <div class="input-meta">
                      <span class="network-type">{calculation.inputType.toUpperCase()}</span>
                      <span class="ip-version">IPv{calculation.version}</span>
                    </div>
                  </div>
                  
                  <div class="status">
                    {#if calculation.isValid && calculation.isInBounds}
                      <Icon name="check-circle" />
                    {:else if calculation.isValid && !calculation.isInBounds}
                      <Icon name="alert-circle" />
                    {:else}
                      <Icon name="x-circle" />
                    {/if}
                  </div>
                </div>

                {#if calculation.isValid}
                  <div class="calculation-details">
                    <div class="result-section">
                      <div class="result-ip">
                        <span class="result-label">Result IP:</span>
                        <code onclick={() => copyToClipboard(calculation.resultIP)} title="Click to copy">
                          {calculation.resultIP}
                        </code>
                      </div>
                      
                      {#if !calculation.isInBounds}
                        <div class="bounds-warning">
                          <Icon name="alert-triangle" />
                          Index out of bounds
                        </div>
                      {/if}
                    </div>

                    <div class="calculation-info">
                      <div class="info-grid">
                        <div class="info-item">
                          <span class="info-label">Network:</span>
                          <code onclick={() => copyToClipboard(calculation.network)} title="Click to copy">
                            {calculation.network}
                          </code>
                        </div>
                        
                        <div class="info-item">
                          <span class="info-label">Total Addresses:</span>
                          <span class="info-value">{calculation.totalAddresses}</span>
                        </div>
                        
                        <div class="info-item">
                          <span class="info-label">Index:</span>
                          <span class="info-value">{calculation.index}</span>
                        </div>
                        
                        <div class="info-item">
                          <span class="info-label">Offset:</span>
                          <span class="info-value">{calculation.offset}</span>
                        </div>
                      </div>
                    </div>

                    {#if calculation.details}
                      <div class="network-details">
                        <h4>Network Details</h4>
                        <div class="details-grid">
                          <div class="detail-item">
                            <span class="detail-label">Start:</span>
                            <code onclick={() => copyToClipboard(calculation.details.networkStart)} title="Click to copy">
                              {calculation.details.networkStart}
                            </code>
                          </div>
                          
                          <div class="detail-item">
                            <span class="detail-label">End:</span>
                            <code onclick={() => copyToClipboard(calculation.details.networkEnd)} title="Click to copy">
                              {calculation.details.networkEnd}
                            </code>
                          </div>
                          
                          <div class="detail-item">
                            <span class="detail-label">Actual Index:</span>
                            <span class="detail-value">{calculation.details.actualIndex}</span>
                          </div>
                          
                          <div class="detail-item">
                            <span class="detail-label">Max Index:</span>
                            <span class="detail-value">{calculation.details.maxIndex}</span>
                          </div>
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

  .card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-lg);
  }

  .card h2 {
    color: var(--color-primary);
    margin: 0 0 var(--spacing-sm) 0;
    font-size: var(--font-size-xl);
  }

  .card p {
    color: var(--text-secondary);
    margin-bottom: var(--spacing-md);
    line-height: 1.5;
  }

  .input-section {
    display: grid;
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-lg);
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

  .options {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .option-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .option-group label {
    color: var(--text-primary);
    font-weight: 500;
  }

  .option-group input {
    padding: var(--spacing-xs);
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    color: var(--text-primary);
    font-family: var(--font-mono);
    width: 120px;
  }

  .option-help {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
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
    margin: 0 0 var(--spacing-sm) 0;
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
  }

  .stat.valid .stat-value {
    color: var(--color-success);
  }

  .stat.invalid .stat-value {
    color: var(--color-error);
  }

  .stat.out-of-bounds .stat-value {
    color: var(--color-warning);
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

  .calculation-card.out-of-bounds {
    border-color: var(--color-warning);
  }

  .calculation-card.invalid {
    border-color: var(--color-error);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: var(--spacing-md);
  }

  .input-info {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .input-text {
    font-family: var(--font-mono);
    font-weight: 600;
    color: var(--text-primary);
  }

  .input-meta {
    display: flex;
    gap: var(--spacing-xs);
  }

  .network-type,
  .ip-version {
    font-size: var(--font-size-xs);
    font-weight: 500;
    padding: var(--spacing-xs);
    border-radius: var(--border-radius);
    background: var(--bg-secondary);
    color: var(--text-secondary);
    border: 1px solid var(--border-color);
  }

  .status {
    color: var(--color-success);
  }

  .calculation-card.out-of-bounds .status {
    color: var(--color-warning);
  }

  .calculation-card.invalid .status {
    color: var(--color-error);
  }

  .calculation-details {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .result-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
  }

  .result-ip {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .result-label {
    font-weight: 500;
    color: var(--text-primary);
  }

  .result-ip code {
    background: var(--color-primary);
    color: var(--bg-primary);
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--border-radius);
    font-family: var(--font-mono);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-fast);
    font-size: var(--font-size-lg);
  }

  .result-ip code:hover {
    background: var(--color-primary-hover);
    transform: translateY(-1px);
  }

  .bounds-warning {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    color: var(--color-warning);
    font-weight: 500;
    font-size: var(--font-size-sm);
  }

  .calculation-info {
    padding: var(--spacing-sm);
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-sm);
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .info-label {
    font-weight: 500;
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
  }

  .info-item code {
    background: var(--bg-secondary);
    color: var(--color-primary);
    border: 1px solid var(--border-color);
    padding: var(--spacing-xs);
    border-radius: var(--border-radius);
    font-family: var(--font-mono);
    cursor: pointer;
    transition: all var(--transition-fast);
    font-size: var(--font-size-sm);
  }

  .info-item code:hover {
    background: var(--bg-primary);
    transform: translateY(-1px);
  }

  .info-value {
    font-family: var(--font-mono);
    font-weight: 600;
    color: var(--text-primary);
  }

  .network-details {
    padding: var(--spacing-sm);
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
  }

  .network-details h4 {
    margin-bottom: var(--spacing-sm);
    color: var(--text-primary);
    font-size: var(--font-size-md);
  }

  .details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-sm);
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .detail-label {
    font-weight: 500;
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
  }

  .detail-item code {
    background: var(--bg-secondary);
    color: var(--color-primary);
    border: 1px solid var(--border-color);
    padding: var(--spacing-xs);
    border-radius: var(--border-radius);
    font-family: var(--font-mono);
    cursor: pointer;
    transition: all var(--transition-fast);
    font-size: var(--font-size-sm);
  }

  .detail-item code:hover {
    background: var(--bg-primary);
    transform: translateY(-1px);
  }

  .detail-value {
    font-family: var(--font-mono);
    font-weight: 600;
    color: var(--text-primary);
    font-size: var(--font-size-sm);
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
    
    .info-grid,
    .details-grid {
      grid-template-columns: 1fr;
    }
    
    .result-section {
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
</style>