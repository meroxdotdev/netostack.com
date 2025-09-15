<script lang="ts">
  import { generateRandomIPAddresses, type RandomIPResult } from '$lib/utils/random-ip.js';
  import Icon from '$lib/components/global/Icon.svelte';
  
  let inputText = $state('192.168.1.0/24 x 10\n10.0.0.0-10.0.0.255 5\n172.16.0.0/16 * 3\n2001:db8::/64[15]');
  let defaultCount = $state(5);
  let unique = $state(true);
  let seed = $state('');
  let result = $state<RandomIPResult | null>(null);
  let isLoading = $state(false);
  
  function generateIPs() {
    if (!inputText.trim()) {
      result = null;
      return;
    }
    
    isLoading = true;
    
    try {
      const inputs = inputText.split('\n').filter(line => line.trim());
      const actualSeed = seed.trim() || undefined;
      result = generateRandomIPAddresses(inputs, defaultCount, unique, actualSeed);
    } catch (error) {
      result = {
        generations: [],
        summary: { totalNetworks: 0, validNetworks: 0, invalidNetworks: 0, totalIPsGenerated: 0, uniqueIPsGenerated: 0 },
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        allGeneratedIPs: []
      };
    } finally {
      isLoading = false;
    }
  }
  
  function exportResults(format: 'csv' | 'json' | 'txt') {
    if (!result) return;
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    let content = '';
    let filename = '';
    let mimeType = 'text/plain';
    
    if (format === 'csv') {
      const headers = 'Network,Type,Version,Requested,Generated,Seed,Valid,Error';
      const rows = result.generations.map(gen => 
        `"${gen.network}","${gen.networkType}","IPv${gen.version}","${gen.requestedCount}","${gen.generatedIPs.length}","${gen.seed || ''}","${gen.isValid}","${gen.error || ''}"`
      );
      content = [headers, ...rows].join('\n');
      filename = `random-ips-${timestamp}.csv`;
      mimeType = 'text/csv';
    } else if (format === 'json') {
      content = JSON.stringify(result, null, 2);
      filename = `random-ips-${timestamp}.json`;
      mimeType = 'application/json';
    } else {
      // Plain text format with just the IPs
      content = result.allGeneratedIPs.join('\n');
      filename = `random-ips-${timestamp}.txt`;
      mimeType = 'text/plain';
    }
    
    const blob = new Blob([content], { type: mimeType });
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
  
  function copyAllIPs() {
    if (result && result.allGeneratedIPs.length > 0) {
      copyToClipboard(result.allGeneratedIPs.join('\n'));
    }
  }
  
  function generateNewSeed() {
    seed = Math.random().toString(36).substring(2, 15);
  }
  
  // Auto-generate when inputs change
  $effect(() => {
    if (inputText.trim()) {
      const timeoutId = setTimeout(generateIPs, 300);
      return () => clearTimeout(timeoutId);
    }
  });
</script>

<div class="card">
  <header class="card-header">
    <h2>Random IP Generator</h2>
    <p>Generate random IP addresses from networks and ranges with uniqueness control and seeded randomness</p>
  </header>

  <div class="input-section">
      <div class="input-group">
      <label for="inputs">Networks and Counts</label>
      <textarea
        id="inputs"
        bind:value={inputText}
        placeholder="192.168.1.0/24 x 10&#10;10.0.0.0-10.0.0.255 5&#10;172.16.0.0/16 * 3&#10;2001:db8::/64[15]"
        rows="6"
      ></textarea>
      <div class="input-help">
        Formats: network x count, network * count, network count, network#count, network[count]
      </div>
    </div>

      <div class="options">
        <div class="option-group">
        <label for="default-count">Default Count</label>
        <input
          id="default-count"
          type="number"
          bind:value={defaultCount}
          min="1"
          max="1000"
          placeholder="5"
        />
        <div class="option-help">
          Number of IPs to generate when count is not specified
        </div>
      </div>
      
      <div class="option-group">
        <label>
          <input type="checkbox" bind:checked={unique} />
          Unique IPs Only
        </label>
        <div class="option-help">
          Ensure all generated IPs are unique within each network
        </div>
      </div>
      
      <div class="option-group">
        <label for="seed">Random Seed</label>
        <div class="seed-input">
          <input
            id="seed"
            type="text"
            bind:value={seed}
            placeholder="Optional seed for reproducible results"
          />
          <button onclick={generateNewSeed} type="button" title="Generate new seed">
            <Icon name="refresh-cw" />
          </button>
        </div>
        <div class="option-help">
          Use the same seed for reproducible random results
        </div>
      </div>
    </div>
  </div>

  {#if isLoading}
    <div class="loading">
      <Icon name="loader" />
      Generating random IPs...
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

      {#if result.generations.length > 0}
        <div class="summary">
          <h3>Generation Summary</h3>
          <div class="summary-stats">
            <div class="stat">
              <span class="stat-value">{result.summary.totalNetworks}</span>
              <span class="stat-label">Total Networks</span>
            </div>
            <div class="stat valid">
              <span class="stat-value">{result.summary.validNetworks}</span>
              <span class="stat-label">Valid</span>
            </div>
            <div class="stat invalid">
              <span class="stat-value">{result.summary.invalidNetworks}</span>
              <span class="stat-label">Invalid</span>
            </div>
            <div class="stat">
              <span class="stat-value">{result.summary.totalIPsGenerated}</span>
              <span class="stat-label">Total IPs</span>
            </div>
            <div class="stat">
              <span class="stat-value">{result.summary.uniqueIPsGenerated}</span>
              <span class="stat-label">Unique IPs</span>
            </div>
          </div>
        </div>

        <div class="all-ips">
          <div class="all-ips-header">
            <h3>All Generated IPs ({result.allGeneratedIPs.length})</h3>
            <div class="export-buttons">
              <button onclick={copyAllIPs}>
                <Icon name="copy" />
                Copy All
              </button>
              <button onclick={() => exportResults('txt')}>
                <Icon name="download" />
                Export TXT
              </button>
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
          
          {#if result.allGeneratedIPs.length > 0}
            <div class="all-ips-list">
              {#each result.allGeneratedIPs as ip}
                <button type="button" class="code-button all-ips-code" onclick={() => copyToClipboard(ip)} title="Click to copy">{ip}</button>
              {/each}
            </div>
          {/if}
        </div>

        <div class="generations">
          <h3>Network Generations</h3>
          
          <div class="generations-list">
            {#each result.generations as generation}
              <div class="generation-card" class:valid={generation.isValid} class:invalid={!generation.isValid}>
                <div class="card-header">
                  <div class="network-info">
                    <span class="network-text">{generation.network}</span>
                    <div class="network-meta">
                      <span class="network-type">{generation.networkType.toUpperCase()}</span>
                      <span class="ip-version">IPv{generation.version}</span>
                    </div>
                  </div>
                  
                  <div class="status">
                    {#if generation.isValid}
                      <Icon name="check-circle" />
                    {:else}
                      <Icon name="x-circle" />
                    {/if}
                  </div>
                </div>

                {#if generation.isValid}
                  <div class="generation-details">
                    <div class="generation-info">
                      <div class="info-grid">
                        <div class="info-item">
                          <span class="info-label">Requested:</span>
                          <span class="info-value">{generation.requestedCount}</span>
                        </div>
                        
                        <div class="info-item">
                          <span class="info-label">Generated:</span>
                          <span class="info-value">{generation.generatedIPs.length}</span>
                        </div>
                        
                        <div class="info-item">
                          <span class="info-label">Unique:</span>
                          <span class="info-value">{generation.uniqueIPs ? 'Yes' : 'No'}</span>
                        </div>
                        
                        {#if generation.seed}
                          <div class="info-item">
                            <span class="info-label">Seed:</span>
                            <button type="button" class="code-button info-code" onclick={() => copyToClipboard(generation.seed!)} title="Click to copy">
                              {generation.seed}
                            </button>
                          </div>
                        {/if}
                      </div>
                    </div>

                    {#if generation.networkDetails}
                      <div class="network-details">
                        <h4>Network Range</h4>
                        <div class="range-info">
                          <div class="range-item">
                            <span class="range-label">Start:</span>
                            <button type="button" class="code-button range-code" onclick={() => copyToClipboard(generation.networkDetails!.start)} title="Click to copy">
                              {generation.networkDetails.start}
                            </button>
                          </div>
                          
                          <div class="range-item">
                            <span class="range-label">End:</span>
                            <button type="button" class="code-button range-code" onclick={() => copyToClipboard(generation.networkDetails!.end)} title="Click to copy">
                              {generation.networkDetails.end}
                            </button>
                          </div>
                          
                          <div class="range-item">
                            <span class="range-label">Total:</span>
                            <span class="range-value">{generation.networkDetails.totalAddresses}</span>
                          </div>
                        </div>
                      </div>
                    {/if}

                    {#if generation.generatedIPs.length > 0}
                      <div class="generated-ips">
                        <h4>Generated IPs</h4>
                        <div class="ips-list">
                          {#each generation.generatedIPs as ip}
                            <button type="button" class="code-button selected-ips-code" onclick={() => copyToClipboard(ip)} title="Click to copy">{ip}</button>
                          {/each}
                        </div>
                      </div>
                    {/if}
                  </div>
                {:else}
                  <div class="error-message">
                    <Icon name="alert-triangle" />
                    {generation.error}
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

  .option-group label:has(input[type="checkbox"]) {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    cursor: pointer;
  }

  .option-group input[type="number"],
  .option-group input[type="text"] {
    padding: var(--spacing-xs);
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    color: var(--text-primary);
    font-family: var(--font-mono);
  }

  .seed-input {
    display: flex;
    gap: var(--spacing-xs);
  }

  .seed-input input {
    flex: 1;
  }

  .seed-input button {
    padding: var(--spacing-xs);
    background: var(--color-primary);
    color: var(--bg-primary);
    border: none;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .seed-input button:hover {
    background: var(--color-primary-hover);
    transform: translateY(-1px);
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
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
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

  .stat-value {
    font-weight: 600;
    color: var(--text-primary);
  }

  .stat-label {
    color: var(--text-secondary);
  }

  .stat.valid .stat-value {
    color: var(--color-success);
  }

  .stat.invalid .stat-value {
    color: var(--color-error);
  }

  .all-ips {
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-md);
  }

  .all-ips-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);
  }

  @media (max-width: 767px) {
    .all-ips-header {
      flex-direction: column;
      gap: var(--spacing-sm);
      align-items: stretch;
    }
  }

  .all-ips-header h3 {
    color: var(--text-primary);
  }

  .export-buttons {
    display: flex;
    gap: var(--spacing-xs);
    flex-wrap: wrap;
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
    white-space: nowrap;
  }

  .export-buttons button:hover {
    background: var(--color-primary-hover);
    transform: translateY(-1px);
  }

  .all-ips-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
    max-height: 300px;
    overflow-y: auto;
    padding: var(--spacing-sm);
    background: var(--bg-secondary);
    border-radius: var(--border-radius);
    border: 1px solid var(--border-color);
  }

  .code-button {
    font-family: var(--font-mono);
    cursor: pointer;
    transition: all var(--transition-fast);
    border: none;

    &.all-ips-code {
      background: var(--bg-tertiary);
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
      padding: var(--spacing-xs);
      border-radius: var(--border-radius);
      font-size: var(--font-size-xs);
      white-space: nowrap;

      &:hover {
        background: var(--bg-primary);
        transform: translateY(-1px);
      }
    }

    &.info-code, &.range-code {
      background: var(--bg-secondary);
      color: var(--color-primary);
      border: 1px solid var(--border-color);
      padding: var(--spacing-xs);
      border-radius: var(--border-radius);
      font-size: var(--font-size-sm);
      word-break: break-all;

      &:hover {
        background: var(--bg-primary);
        transform: translateY(-1px);
      }
    }

    &.selected-ips-code {
      background: var(--bg-tertiary);
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
      padding: var(--spacing-xs);
      border-radius: var(--border-radius);
      font-size: var(--font-size-xs);
      white-space: nowrap;

      &:hover {
        background: var(--bg-primary);
        transform: translateY(-1px);
      }
    }
  }

  .generations h3 {
    margin: 0 0 var(--spacing-sm) 0;
    color: var(--text-primary);
  }

  .generations-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .generation-card {
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    padding: var(--spacing-md);
    background: var(--bg-tertiary);
    margin-bottom: var(--spacing-md);
  }

  .generation-card.valid {
    border-color: var(--color-success);
  }

  .generation-card.invalid {
    border-color: var(--color-error);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: var(--spacing-md);
  }

  .network-info {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .network-text {
    font-family: var(--font-mono);
    font-weight: 600;
    color: var(--text-primary);
  }

  .network-meta {
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

  .generation-card.invalid .status {
    color: var(--color-error);
  }

  .generation-details {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .generation-info {
    padding: var(--spacing-sm);
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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

  .info-value {
    font-family: var(--font-mono);
    font-weight: 600;
    color: var(--text-primary);
  }


  .network-details,
  .generated-ips {
    padding: var(--spacing-sm);
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
  }

  .network-details h4,
  .generated-ips h4 {
    margin-bottom: var(--spacing-sm);
    color: var(--text-primary);
    font-size: var(--font-size-md);
  }

  .range-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-sm);
  }

  .range-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .range-label {
    font-weight: 500;
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
  }


  .range-value {
    font-family: var(--font-mono);
    font-weight: 600;
    color: var(--text-primary);
    font-size: var(--font-size-sm);
  }

  .ips-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
    max-height: 200px;
    overflow-y: auto;
  }

  .ips-list code {
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    border: 1px solid var(--border-color);
    padding: var(--spacing-xs);
    border-radius: var(--border-radius);
    font-family: var(--font-mono);
    font-size: var(--font-size-xs);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .ips-list code:hover {
    background: var(--bg-primary);
    transform: translateY(-1px);
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
    .random-ip {
      padding: 0 var(--spacing-sm);
    }
    
    .header h1 {
      font-size: 1.5rem;
    }
    
    .summary-stats {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .info-grid,
    .range-info {
      grid-template-columns: 1fr;
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
