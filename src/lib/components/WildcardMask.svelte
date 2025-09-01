<script lang="ts">
  import { convertWildcardMasks, type WildcardResult } from '$lib/utils/wildcard-mask.js';
  import Icon from '$lib/components/Icon.svelte';
  
  let inputText = $state('192.168.1.0/24\n10.0.0.0 255.255.255.0\n172.16.0.0 0.0.255.255');
  let result = $state<WildcardResult | null>(null);
  let isLoading = $state(false);
  
  // ACL options
  let generateACL = $state(false);
  let aclType = $state<'permit' | 'deny'>('permit');
  let protocol = $state('ip');
  let destination = $state('any');
  
  function convertMasks() {
    if (!inputText.trim()) {
      result = null;
      return;
    }
    
    isLoading = true;
    
    try {
      const inputs = inputText.split('\n').filter(line => line.trim());
      result = convertWildcardMasks(inputs, {
        type: aclType,
        protocol: protocol || 'ip',
        destination: destination || 'any',
        generateACL
      });
    } catch (error) {
      result = {
        conversions: [],
        aclRules: { cisco: [], juniper: [], generic: [] },
        summary: { totalInputs: 0, validInputs: 0, invalidInputs: 0 },
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
      const headers = 'Input,Type,CIDR,Subnet Mask,Wildcard Mask,Prefix,Host Bits,Network,Broadcast,Total Hosts,Usable Hosts,Valid,Error';
      const rows = result.conversions.map(conv => 
        `"${conv.input}","${conv.inputType}","${conv.cidr}","${conv.subnetMask}","${conv.wildcardMask}","${conv.prefixLength}","${conv.hostBits}","${conv.networkAddress}","${conv.broadcastAddress}","${conv.totalHosts}","${conv.usableHosts}","${conv.isValid}","${conv.error || ''}"`
      );
      content = [headers, ...rows].join('\n');
      filename = `wildcard-masks-${timestamp}.csv`;
    } else {
      content = JSON.stringify(result, null, 2);
      filename = `wildcard-masks-${timestamp}.json`;
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
  
  function copyACLRules(type: 'cisco' | 'juniper' | 'generic') {
    if (!result) return;
    const rules = result.aclRules[type];
    if (rules.length > 0) {
      copyToClipboard(rules.join('\n'));
    }
  }
  
  // Auto-convert when inputs change
  $effect(() => {
    if (inputText.trim()) {
      const timeoutId = setTimeout(convertMasks, 300);
      return () => clearTimeout(timeoutId);
    }
  });
</script>

<div class="container">
  <div class="header">
    <h1>Wildcard Mask Converter</h1>
    <p>Convert between CIDR notation, subnet masks, and wildcard masks with ACL rule generation</p>
  </div>

  <div class="input-section">
    <div class="card">
      <h2>Network Inputs</h2>
      <div class="input-group">
        <label for="inputs">IP Addresses, CIDRs, or Ranges</label>
        <textarea
          id="inputs"
          bind:value={inputText}
          placeholder="192.168.1.0/24&#10;10.0.0.0 255.255.255.0&#10;172.16.0.0 0.0.255.255"
          rows="6"
        ></textarea>
        <div class="input-help">
          Enter one per line: CIDR (192.168.1.0/24), network + subnet mask (10.0.0.0 255.255.255.0), or network + wildcard mask (172.16.0.0 0.0.255.255)
        </div>
      </div>
    </div>

    <div class="card">
      <h2>ACL Options</h2>
      <div class="input-group">
        <label>
          <input type="checkbox" bind:checked={generateACL} />
          Generate ACL Rules
        </label>
      </div>
      
      {#if generateACL}
        <div class="acl-settings">
          <div class="input-group">
            <label for="acl-type">Action</label>
            <select id="acl-type" bind:value={aclType}>
              <option value="permit">Permit</option>
              <option value="deny">Deny</option>
            </select>
          </div>
          
          <div class="input-group">
            <label for="protocol">Protocol</label>
            <input
              id="protocol"
              type="text"
              bind:value={protocol}
              placeholder="ip"
            />
          </div>
          
          <div class="input-group">
            <label for="destination">Destination</label>
            <input
              id="destination"
              type="text"
              bind:value={destination}
              placeholder="any"
            />
          </div>
        </div>
      {/if}
    </div>
  </div>

  {#if isLoading}
    <div class="loading">
      <Icon name="loader" />
      Converting masks...
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

      {#if result.conversions.length > 0}
        <div class="summary">
          <h3>Conversion Summary</h3>
          <div class="summary-stats">
            <div class="stat">
              <span class="stat-value">{result.summary.totalInputs}</span>
              <span class="stat-label">Total Inputs</span>
            </div>
            <div class="stat aligned">
              <span class="stat-value">{result.summary.validInputs}</span>
              <span class="stat-label">Valid</span>
            </div>
            <div class="stat misaligned">
              <span class="stat-value">{result.summary.invalidInputs}</span>
              <span class="stat-label">Invalid</span>
            </div>
          </div>
        </div>

        <div class="conversions">
          <div class="conversions-header">
            <h3>Mask Conversions</h3>
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

          <div class="conversions-grid">
            {#each result.conversions as conversion}
              <div class="conversion-card" class:aligned={conversion.isValid} class:misaligned={!conversion.isValid}>
                <div class="check-header">
                  <div class="check-input">
                    <span class="input-text">{conversion.input}</span>
                    <span class="input-type">{conversion.inputType.replace('-', ' ').toUpperCase()}</span>
                  </div>
                  <div class="check-status">
                    {#if conversion.isValid}
                      <Icon name="check-circle" />
                      Valid
                    {:else}
                      <Icon name="x-circle" />
                      Invalid
                    {/if}
                  </div>
                </div>

                {#if conversion.isValid}
                  <div class="conversion-details">
                    <div class="detail-row">
                      <span class="label">CIDR:</span>
                      <code onclick={() => copyToClipboard(conversion.cidr)} title="Click to copy">
                        {conversion.cidr}
                      </code>
                    </div>
                    
                    <div class="detail-row">
                      <span class="label">Subnet Mask:</span>
                      <code onclick={() => copyToClipboard(conversion.subnetMask)} title="Click to copy">
                        {conversion.subnetMask}
                      </code>
                    </div>
                    
                    <div class="detail-row">
                      <span class="label">Wildcard Mask:</span>
                      <code onclick={() => copyToClipboard(conversion.wildcardMask)} title="Click to copy">
                        {conversion.wildcardMask}
                      </code>
                    </div>
                    
                    <div class="network-info">
                      <div class="info-grid">
                        <div>
                          <span class="info-label">Network:</span>
                          <span class="info-value">{conversion.networkAddress}</span>
                        </div>
                        <div>
                          <span class="info-label">Broadcast:</span>
                          <span class="info-value">{conversion.broadcastAddress}</span>
                        </div>
                        <div>
                          <span class="info-label">Host Bits:</span>
                          <span class="info-value">{conversion.hostBits}</span>
                        </div>
                        <div>
                          <span class="info-label">Usable Hosts:</span>
                          <span class="info-value">{conversion.usableHosts.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                {:else}
                  <div class="error-message">
                    <Icon name="alert-triangle" />
                    {conversion.error}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </div>

        {#if generateACL && (result.aclRules.cisco.length > 0 || result.aclRules.juniper.length > 0 || result.aclRules.generic.length > 0)}
          <div class="card">
            <h3>Generated ACL Rules</h3>
            
            {#if result.aclRules.cisco.length > 0}
              <div class="acl-section">
                <div class="acl-header">
                  <h4>Cisco ACL</h4>
                  <button onclick={() => copyACLRules('cisco')} class="copy-btn">
                    <Icon name="copy" />
                    Copy
                  </button>
                </div>
                <div class="acl-code">
                  {#each result.aclRules.cisco as rule}
                    <div class="acl-line">{rule}</div>
                  {/each}
                </div>
              </div>
            {/if}

            {#if result.aclRules.juniper.length > 0}
              <div class="acl-section">
                <div class="acl-header">
                  <h4>Juniper ACL</h4>
                  <button onclick={() => copyACLRules('juniper')} class="copy-btn">
                    <Icon name="copy" />
                    Copy
                  </button>
                </div>
                <div class="acl-code">
                  {#each result.aclRules.juniper as rule}
                    <div class="acl-line">{rule}</div>
                  {/each}
                </div>
              </div>
            {/if}

            {#if result.aclRules.generic.length > 0}
              <div class="acl-section">
                <div class="acl-header">
                  <h4>Generic ACL</h4>
                  <button onclick={() => copyACLRules('generic')} class="copy-btn">
                    <Icon name="copy" />
                    Copy
                  </button>
                </div>
                <div class="acl-code">
                  {#each result.aclRules.generic as rule}
                    <div class="acl-line">{rule}</div>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        {/if}
      {/if}
    </div>
  {/if}
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--spacing-lg);
  }

  .header {
    text-align: center;
    margin-bottom: var(--spacing-xl);
  }

  .header h1 {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    color: var(--color-primary);
    margin-bottom: var(--spacing-sm);
  }

  .header p {
    color: var(--text-secondary);
    font-size: var(--font-size-lg);
  }

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

  .card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-lg);
  }

  .card h2 {
    color: var(--text-primary);
    font-size: var(--font-size-lg);
    margin-bottom: var(--spacing-md);
    font-weight: 600;
  }

  .card h3 {
    color: var(--text-primary);
    font-size: var(--font-size-lg);
    margin-bottom: var(--spacing-md);
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
  .input-group input,
  .input-group select {
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
  .input-group input:focus,
  .input-group select:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  .input-group textarea {
    resize: vertical;
    min-height: 150px;
  }

  .input-help {
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
  }

  .acl-settings {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    margin-top: var(--spacing-md);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    background: var(--bg-tertiary);
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

  .conversions-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);
  }

  .conversions-header h3 {
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

  .conversions-grid {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .conversion-card {
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    background: var(--bg-tertiary);
  }

  .conversion-card.aligned {
    border-color: var(--color-success);
  }

  .conversion-card.misaligned {
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

  .conversion-card.aligned .check-status {
    color: var(--color-success);
  }

  .conversion-card.misaligned .check-status {
    color: var(--color-error);
  }

  .conversion-details {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-xs);
    background: var(--bg-secondary);
    border-radius: var(--radius-sm);
  }

  .label {
    font-weight: 600;
    color: var(--text-primary);
  }

  .detail-row code {
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

  .detail-row code:hover {
    background: var(--color-primary-hover);
  }

  .network-info {
    margin-top: var(--spacing-sm);
    padding: var(--spacing-sm);
    background: var(--bg-secondary);
    border-radius: var(--radius-sm);
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);
  }

  .info-label {
    display: block;
    font-size: var(--font-size-xs);
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
  }

  .info-value {
    display: block;
    font-family: var(--font-mono);
    font-weight: 600;
    color: var(--text-primary);
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    color: var(--color-error);
    font-size: var(--font-size-sm);
  }

  .acl-section {
    margin-bottom: var(--spacing-lg);
  }

  .acl-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-sm);
  }

  .acl-header h4 {
    color: var(--text-primary);
    font-size: var(--font-size-lg);
  }

  .copy-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
    background: var(--color-primary);
    color: var(--bg-primary);
    border: none;
    border-radius: var(--radius-sm);
    font-size: var(--font-size-sm);
    cursor: pointer;
    transition: var(--transition-fast);
  }

  .copy-btn:hover {
    background: var(--color-primary-hover);
  }

  .acl-code {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    padding: var(--spacing-md);
    border-radius: var(--radius-sm);
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
    overflow-x: auto;
    border: 1px solid var(--border-primary);
  }

  .acl-line {
    margin-bottom: 0.25rem;
    white-space: nowrap;
  }

  @media (max-width: 768px) {
    .container {
      padding: var(--spacing-md);
    }
    
    .input-section {
      grid-template-columns: 1fr;
    }
    
    .summary-stats {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .export-buttons {
      flex-direction: column;
    }
  }
</style>