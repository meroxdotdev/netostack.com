<script lang="ts">
  import { checkCIDRAlignment, type AlignmentResult } from '$lib/utils/cidr-alignment.js';
  import Icon from '$lib/components/global/Icon.svelte';
  
  let inputText = $state('192.168.1.0/24\n10.0.0.0-10.0.0.255\n172.16.1.5');
  let targetPrefix = $state(24);
  let result = $state<AlignmentResult | null>(null);
  let isLoading = $state(false);
  
  function checkAlignment() {
    if (!inputText.trim()) {
      result = null;
      return;
    }
    
    isLoading = true;
    
    try {
      const inputs = inputText.split('\n').filter(line => line.trim());
      result = checkCIDRAlignment(inputs, targetPrefix);
    } catch (error) {
      result = {
        checks: [],
        summary: { totalInputs: 0, alignedInputs: 0, misalignedInputs: 0, alignmentRate: 0 },
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
      const headers = 'Input,Type,Is Aligned,Target Prefix,Aligned CIDR,Reason';
      const rows = result.checks.map(check => 
        `"${check.input}","${check.type}","${check.isAligned}","${check.targetPrefix}","${check.alignedCIDR || ''}","${check.reason || ''}"`
      );
      content = [headers, ...rows].join('\n');
      filename = `cidr-alignment-${timestamp}.csv`;
    } else {
      content = JSON.stringify(result, null, 2);
      filename = `cidr-alignment-${timestamp}.json`;
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
  
  // Auto-check when inputs change
  $effect(() => {
    if (inputText.trim() && targetPrefix > 0) {
      const timeoutId = setTimeout(checkAlignment, 300);
      return () => clearTimeout(timeoutId);
    }
  });
</script>

<div class="card">
  <header class="card-header">
    <h2>CIDR Boundary Alignment</h2>
    <p>Check if IP addresses, ranges, and CIDR blocks align to specific prefix boundaries</p>
  </header>

  <div class="input-section">
    <div class="inputs-card">
      <h3>Network Inputs</h3>
      <div class="input-group">
        <label for="inputs">IP Addresses, CIDRs, or Ranges</label>
        <textarea
          id="inputs"
          bind:value={inputText}
          placeholder="192.168.1.0/24&#10;10.0.0.0-10.0.0.255&#10;172.16.1.5&#10;2001:db8::/32"
          rows="8"
        ></textarea>
        <div class="input-help">
          Enter one per line: CIDR blocks (192.168.1.0/24), IP ranges (10.0.0.1-10.0.0.100), or single IPs (172.16.1.5)
        </div>
      </div>

      <div class="input-group">
        <label for="prefix">Target Prefix Length</label>
        <input
          id="prefix"
          type="number"
          bind:value={targetPrefix}
          min="0"
          max="128"
          placeholder="24"
        />
        <div class="input-help">
          Prefix length to check alignment against (0-32 for IPv4, 0-128 for IPv6)
        </div>
      </div>
    </div>
  </div>

  {#if isLoading}
    <div class="loading">
      <Icon name="loader" />
      Checking alignment...
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

      {#if result.checks.length > 0}
        <div class="summary">
          <h3>Alignment Summary</h3>
          <div class="summary-stats">
            <div class="stat">
              <span class="stat-value">{result.summary.totalInputs}</span>
              <span class="stat-label">Total Inputs</span>
            </div>
            <div class="stat aligned">
              <span class="stat-value">{result.summary.alignedInputs}</span>
              <span class="stat-label">Aligned</span>
            </div>
            <div class="stat misaligned">
              <span class="stat-value">{result.summary.misalignedInputs}</span>
              <span class="stat-label">Misaligned</span>
            </div>
            <div class="stat">
              <span class="stat-value">{result.summary.alignmentRate}%</span>
              <span class="stat-label">Alignment Rate</span>
            </div>
          </div>
        </div>

        <div class="checks">
          <div class="checks-header">
            <h3>Alignment Checks</h3>
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

          <div class="checks-list">
            {#each result.checks as check}
              <div class="check-item" class:aligned={check.isAligned} class:misaligned={!check.isAligned}>
                <div class="check-header">
                  <div class="check-input">
                    <span class="input-text">{check.input}</span>
                    <span class="input-type">{check.type.toUpperCase()}</span>
                  </div>
                  <div class="check-status">
                    {#if check.isAligned}
                      <Icon name="check-circle" />
                      Aligned to /{check.targetPrefix}
                    {:else}
                      <Icon name="x-circle" />
                      Not aligned to /{check.targetPrefix}
                    {/if}
                  </div>
                </div>

                {#if check.alignedCIDR}
                  <div class="aligned-cidr">
                    <strong>Aligned CIDR:</strong>
                    <code onclick={() => copyToClipboard(check.alignedCIDR!)} title="Click to copy">
                      {check.alignedCIDR}
                    </code>
                  </div>
                {/if}

                {#if check.reason}
                  <div class="reason">
                    <strong>Reason:</strong> {check.reason}
                  </div>
                {/if}

                {#if check.suggestions.length > 0}
                  <div class="suggestions">
                    <strong>Suggestions:</strong>
                    {#each check.suggestions as suggestion}
                      <div class="suggestion">
                        <div class="suggestion-type">
                          {#if suggestion.type === 'larger'}
                            <Icon name="zoom-out" />
                          {:else if suggestion.type === 'smaller'}
                            <Icon name="zoom-in" />
                          {:else}
                            <Icon name="scissors" />
                          {/if}
                          {suggestion.description}
                        </div>
                        <div class="suggestion-cidrs">
                          {#each suggestion.cidrs as cidr}
                            <code onclick={() => copyToClipboard(cidr)} title="Click to copy">{cidr}</code>
                          {/each}
                        </div>
                        {#if suggestion.efficiency}
                          <div class="suggestion-efficiency">
                            Efficiency: {suggestion.efficiency}%
                          </div>
                        {/if}
                      </div>
                    {/each}
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
    margin-bottom: var(--spacing-lg);
  }

  .inputs-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-lg);
  }

  .inputs-card h3 {
    color: var(--text-primary);
    font-size: var(--font-size-lg);
    margin-bottom: var(--spacing-md);
    font-weight: 600;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-md);
  }

  .input-group:last-child {
    margin-bottom: 0;
  }

  .input-group label {
    font-weight: 600;
    color: var(--text-primary);
    font-size: var(--font-size-sm);
  }

  .input-group textarea,
  .input-group input {
    padding: var(--spacing-sm);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
    background: var(--bg-tertiary);
    color: var(--text-primary);
    transition: var(--transition-fast);
  }

  .input-group textarea:focus,
  .input-group input:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  .input-group textarea {
    resize: vertical;
    min-height: 200px;
  }

  .input-help {
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
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
    background: var(--bg-secondary);
    border: 1px solid var(--color-error);
    border-radius: var(--radius-lg);
    padding: var(--spacing-md);
  }

  .errors h3 {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-sm);
    color: var(--color-error);
  }

  .error-item {
    color: var(--color-error-light);
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
    margin-bottom: var(--spacing-xs);
  }

  .summary {
    background: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
  }

  .summary h3 {
    margin-bottom: var(--spacing-md);
    color: var(--text-primary);
    font-size: var(--font-size-lg);
  }

  .summary-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: var(--spacing-md);
  }

  .stat {
    text-align: center;
    padding: var(--spacing-md);
    background: var(--bg-tertiary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
  }

  .stat.aligned {
    border-color: var(--color-success);
  }

  .stat.misaligned {
    border-color: var(--color-error);
  }

  .stat-value {
    display: block;
    font-size: var(--font-size-xl);
    font-weight: 700;
    color: var(--text-primary);
  }

  .stat.aligned .stat-value {
    color: var(--color-success);
  }

  .stat.misaligned .stat-value {
    color: var(--color-error);
  }

  .stat-label {
    display: block;
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    margin-top: var(--spacing-xs);
  }

  .checks-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);
  }

  .checks-header h3 {
    color: var(--text-primary);
    font-size: var(--font-size-lg);
  }

  .export-buttons {
    display: flex;
    gap: var(--spacing-sm);
  }

  .export-buttons button {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--color-primary);
    color: var(--bg-primary);
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition-fast);
  }

  .export-buttons button:hover {
    background: var(--color-primary-hover);
  }

  .checks-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .check-item {
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    background: var(--bg-tertiary);
  }

  .check-item.aligned {
    border-color: var(--color-success);
  }

  .check-item.misaligned {
    border-color: var(--color-error);
  }

  .check-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: var(--spacing-md);
  }

  @media (max-width: 768px) {
    .check-header {
      flex-direction: column;
      gap: var(--spacing-sm);
    }
  }

  .check-input {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .input-text {
    font-family: var(--font-mono);
    font-weight: 600;
    color: var(--text-primary);
  }

  .input-type {
    font-size: var(--font-size-xs);
    font-weight: 600;
    text-transform: uppercase;
    color: var(--text-secondary);
    background: var(--bg-secondary);
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-sm);
    align-self: flex-start;
  }

  .check-status {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-weight: 600;
  }

  .check-item.aligned .check-status {
    color: var(--color-success);
  }

  .check-item.misaligned .check-status {
    color: var(--color-error);
  }

  .aligned-cidr,
  .reason {
    margin-bottom: var(--spacing-sm);
    color: var(--text-primary);
  }

  .aligned-cidr code,
  .suggestion-cidrs code {
    background: var(--color-primary);
    color: var(--bg-primary);
    padding: 0.375rem 0.75rem;
    border-radius: var(--radius-sm);
    font-family: var(--font-mono);
    cursor: pointer;
    display: inline-block;
    margin: 0.125rem;
    transition: var(--transition-fast);
    font-weight: 600;
  }

  .aligned-cidr code:hover,
  .suggestion-cidrs code:hover {
    background: var(--color-primary-hover);
  }

  .suggestions {
    border-top: 1px solid var(--border-primary);
    padding-top: var(--spacing-sm);
    margin-top: var(--spacing-md);
  }

  .suggestion {
    margin-bottom: var(--spacing-sm);
    padding: var(--spacing-sm);
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-primary);
  }

  .suggestion-type {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-xs);
    font-weight: 600;
    color: var(--text-primary);
  }

  .suggestion-cidrs {
    margin-bottom: var(--spacing-xs);
  }

  .suggestion-efficiency {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    font-weight: 600;
  }

  @media (max-width: 768px) {
    .container {
      padding: var(--spacing-md);
    }
    
    .summary-stats {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .export-buttons {
      flex-direction: column;
    }
  }
</style>
