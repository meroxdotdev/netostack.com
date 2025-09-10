<script lang="ts">
  import { tooltip } from '$lib/actions/tooltip.js';
  import Icon from '$lib/components/global/Icon.svelte';
  // import '../../../styles/diagnostics-pages.scss';
  
  let domainName = $state('example.com');
  let recordType = $state('A');
  let loading = $state(false);
  let results = $state<any>(null);
  let error = $state<string | null>(null);
  let copiedState = $state(false);
  let lastQuery = $state<{domain: string, type: string} | null>(null);
  
  const recordTypes = [
    { value: 'A', label: 'A', description: 'IPv4 address records' },
    { value: 'AAAA', label: 'AAAA', description: 'IPv6 address records' },
    { value: 'CNAME', label: 'CNAME', description: 'Canonical name records' },
    { value: 'MX', label: 'MX', description: 'Mail exchange records' },
    { value: 'TXT', label: 'TXT', description: 'Text records' },
    { value: 'NS', label: 'NS', description: 'Name server records' }
  ];
  
  const resolverInfo = {
    cloudflare: { name: 'Cloudflare', ip: '1.1.1.1', location: 'Global' },
    google: { name: 'Google', ip: '8.8.8.8', location: 'Global' },
    quad9: { name: 'Quad9', ip: '9.9.9.9', location: 'Global' },
    opendns: { name: 'OpenDNS', ip: '208.67.222.222', location: 'Global' }
  };
  
  const examples = [
    { domain: 'google.com', type: 'A', description: 'Check A record propagation' },
    { domain: 'github.com', type: 'AAAA', description: 'IPv6 propagation check' },
    { domain: 'gmail.com', type: 'MX', description: 'Mail server propagation' },
    { domain: '_dmarc.google.com', type: 'TXT', description: 'DMARC policy propagation' }
  ];
  
  async function checkPropagation() {
    loading = true;
    error = null;
    results = null;
    lastQuery = { domain: domainName.trim(), type: recordType };
    
    try {
      const response = await fetch('/api/internal/diagnostics/dns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'propagation',
          name: domainName.trim(),
          type: recordType
        })
      });
      
      if (!response.ok) {
        throw new Error(`Propagation check failed: ${response.status}`);
      }
      
      const data = await response.json();
      results = data.results;
    } catch (err: any) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
  
  function loadExample(example: typeof examples[0]) {
    domainName = example.domain;
    recordType = example.type;
    checkPropagation();
  }
  
  function getStatusColor(result: any): string {
    if (result.error) return 'error';
    if (!result.result?.Answer?.length) return 'warning';
    return 'success';
  }
  
  function getStatusIcon(result: any): string {
    if (result.error) return 'x-circle';
    if (!result.result?.Answer?.length) return 'alert-circle';
    return 'check-circle';
  }
  
  function areResultsConsistent(): boolean {
    if (!results || results.length === 0) return false;
    
    const successfulResults = results.filter((r: any) => !r.error && r.result?.Answer?.length > 0);
    if (successfulResults.length === 0) return false;
    
    const firstAnswer = successfulResults[0].result.Answer.map((a: any) => a.data).sort();
    return successfulResults.every((r: any) => {
      const answers = r.result.Answer.map((a: any) => a.data).sort();
      return JSON.stringify(answers) === JSON.stringify(firstAnswer);
    });
  }
  
  async function copyAllResults() {
    if (!results?.length) return;
    
    let text = `DNS Propagation Check for ${lastQuery?.domain} (${lastQuery?.type})\n`;
    text += `Checked at: ${new Date().toISOString()}\n\n`;
    
    results.forEach((result: any) => {
      const info = resolverInfo[result.resolver as keyof typeof resolverInfo];
      text += `${info?.name || result.resolver} (${info?.ip || 'N/A'}):\n`;
      
      if (result.error) {
        text += `  Error: ${result.error}\n`;
      } else if (result.result?.Answer?.length > 0) {
        result.result.Answer.forEach((answer: any) => {
          text += `  ${answer.data}${answer.TTL ? ` (TTL: ${answer.TTL}s)` : ''}\n`;
        });
      } else {
        text += `  No records found\n`;
      }
      text += '\n';
    });
    
    await navigator.clipboard.writeText(text);
    copiedState = true;
    setTimeout(() => copiedState = false, 1500);
  }
</script>

<div class="card">
  <header class="card-header">
    <h1>DNS Propagation Checker</h1>
    <p>Check DNS record propagation across multiple public DNS resolvers. Compare responses from Cloudflare, Google, Quad9, and OpenDNS to verify consistent DNS propagation worldwide.</p>
  </header>

  <!-- Examples -->
  <div class="card examples-card">
    <details class="examples-details">
      <summary class="examples-summary">
        <Icon name="chevron-right" size="xs" />
        <h4>Propagation Examples</h4>
      </summary>
      <div class="examples-grid">
        {#each examples as example, i}
          <button class="example-card" onclick={() => loadExample(example)}>
            <h5>{example.domain} ({example.type})</h5>
            <p>{example.description}</p>
          </button>
        {/each}
      </div>
    </details>
  </div>

  <!-- Input Form -->
  <div class="card input-card">
    <div class="card-header">
      <h3>Propagation Check Configuration</h3>
    </div>
    <div class="card-content">
      <div class="form-grid">
        <div class="form-group">
          <label for="domain" use:tooltip={"Enter the domain name to check propagation for"}>
            Domain Name
            <input 
              id="domain" 
              type="text" 
              bind:value={domainName} 
              placeholder="example.com"
              onchange={() => { if (domainName) checkPropagation(); }}
            />
          </label>
        </div>
        
        <div class="form-group">
          <label for="type" use:tooltip={"Select the DNS record type to check"}>
            Record Type
            <select id="type" bind:value={recordType} onchange={() => { if (domainName) checkPropagation(); }}>
              {#each recordTypes as type}
                <option value={type.value} title={type.description}>{type.label}</option>
              {/each}
            </select>
          </label>
        </div>
      </div>
      
      <div class="action-section">
        <button class="check-btn" onclick={checkPropagation} disabled={loading || !domainName.trim()}>
          {#if loading}
            <Icon name="loader-2" size="sm" class="animate-spin" />
            Checking Propagation...
          {:else}
            <Icon name="globe" size="sm" />
            Check DNS Propagation
          {/if}
        </button>
      </div>
    </div>
  </div>

  <!-- Results -->
  {#if results}
    <div class="card results-card">
      <div class="card-header">
        <div>
          <h3>Propagation Results</h3>
          <div class="consistency-status">
            {#if areResultsConsistent()}
              <Icon name="check-circle" size="xs" class="text-green-500" />
              <span class="status-text success">Fully Propagated</span>
            {:else}
              <Icon name="alert-circle" size="xs" class="text-orange-500" />
              <span class="status-text warning">Inconsistent Results</span>
            {/if}
          </div>
        </div>
        <button class="copy-btn" onclick={copyAllResults} disabled={copiedState}>
          <Icon name={copiedState ? "check" : "copy"} size="xs" class={copiedState ? "text-green-500" : ""} />
          {copiedState ? "Copied!" : "Copy All Results"}
        </button>
      </div>
      <div class="card-content">
        <div class="resolvers-grid">
          {#each results as result}
            {@const info = resolverInfo[result.resolver as keyof typeof resolverInfo]}
            {@const status = getStatusColor(result)}
            {@const icon = getStatusIcon(result)}
            
            <div class="resolver-card {status}">
              <div class="resolver-header">
                <div class="resolver-info">
                  <Icon name={icon} size="sm" />
                  <div>
                    <h4>{info?.name || result.resolver}</h4>
                    <p>{info?.ip || 'Custom'} • {info?.location || 'Unknown'}</p>
                  </div>
                </div>
              </div>
              
              <div class="resolver-content">
                {#if result.error}
                  <div class="error-message">
                    <Icon name="alert-triangle" size="xs" />
                    <span>Error: {result.error}</span>
                  </div>
                {:else if result.result?.Answer?.length > 0}
                  <div class="records">
                    {#each result.result.Answer as record}
                      <div class="record">
                        <span class="record-data mono">{record.data}</span>
                        {#if record.TTL}
                          <span class="record-ttl" use:tooltip={"Time To Live"}>TTL: {record.TTL}s</span>
                        {/if}
                      </div>
                    {/each}
                  </div>
                {:else}
                  <div class="no-records">
                    <Icon name="minus-circle" size="xs" />
                    <span>No records found</span>
                  </div>
                {/if}
              </div>
            </div>
          {/each}
        </div>
        
        {#if lastQuery}
          <div class="query-info">
            <span>Last checked: {lastQuery.domain} ({lastQuery.type}) at {new Date().toLocaleString()}</span>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  {#if error}
    <div class="card error-card">
      <div class="card-content">
        <div class="error-content">
          <Icon name="alert-triangle" size="md" />
          <div>
            <strong>Propagation Check Failed</strong>
            <p>{error}</p>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Educational Content -->
  <div class="card info-card">
    <div class="card-header">
      <h3>Understanding DNS Propagation</h3>
    </div>
    <div class="card-content">
      <div class="info-grid">
        <div class="info-section">
          <h4>What is DNS Propagation?</h4>
          <p>DNS propagation refers to the time it takes for DNS changes to spread across the internet. Different resolvers may cache records for different periods, leading to temporary inconsistencies.</p>
        </div>
        
        <div class="info-section">
          <h4>Factors Affecting Propagation</h4>
          <ul>
            <li><strong>TTL Values:</strong> Lower TTL means faster propagation</li>
            <li><strong>Resolver Caching:</strong> Each resolver has its own cache policies</li>
            <li><strong>Geographic Location:</strong> Physical distance affects update speed</li>
            <li><strong>DNS Infrastructure:</strong> Authoritative server response time</li>
          </ul>
        </div>
        
        <div class="info-section">
          <h4>Interpreting Results</h4>
          <div class="status-legend">
            <div class="legend-item">
              <Icon name="check-circle" size="xs" class="text-green-500" />
              <span><strong>Fully Propagated:</strong> All resolvers return identical results</span>
            </div>
            <div class="legend-item">
              <Icon name="alert-circle" size="xs" class="text-orange-500" />
              <span><strong>Inconsistent:</strong> Different resolvers return different results</span>
            </div>
            <div class="legend-item">
              <Icon name="x-circle" size="xs" class="text-red-500" />
              <span><strong>Error:</strong> Resolver failed to respond or returned an error</span>
            </div>
          </div>
        </div>
        
        <div class="info-section">
          <h4>DNS Resolvers Tested</h4>
          <div class="resolvers-info">
            {#each Object.entries(resolverInfo) as [key, info]}
              <div class="resolver-info-item">
                <strong>{info.name}</strong> ({info.ip})
                <span>{info.location}</span>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  // Page-specific styles not covered by shared diagnostics-pages.scss

  .form-group {
    label {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
      color: var(--text-primary);
      font-weight: 500;
    }
  }

  .action-section {
    display: flex;
    justify-content: center;
    margin-top: var(--spacing-xl);
  }

  .check-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--color-primary);
    color: var(--bg-primary);
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--font-size-md);
    cursor: pointer;
    transition: all var(--transition-fast);

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:not(:disabled):hover {
      background: var(--color-primary-dark);
    }
  }

  .consistency-status {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }

  .resolver-header {
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--border-color);
  }

  .resolver-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);

    h4 {
      margin: 0;
      color: var(--text-primary);
      font-size: var(--font-size-sm);
    }

    p {
      margin: 0;
      color: var(--text-secondary);
      font-size: var(--font-size-xs);
      font-family: var(--font-mono);
    }
  }

  .resolver-content {
    padding: var(--spacing-md);
  }

  .records {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .record {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--spacing-sm);
    
    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  .query-info {
    text-align: center;
    color: var(--text-secondary);
    font-size: var(--font-size-xs);
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--border-color);
  }



  .legend-item {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-xs);
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    
    strong {
      color: var(--text-primary);
    }
  }

  .resolvers-info {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .resolver-info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    
    strong {
      color: var(--text-primary);
      font-family: var(--font-mono);
    }
  }

  .mono {
    font-family: var(--font-mono);
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .text-green-500 {
    color: var(--color-success);
  }

  .text-orange-500 {
    color: var(--color-warning);
  }

  .text-red-500 {
    color: var(--color-error);
  }
</style>
