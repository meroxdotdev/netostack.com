<script lang="ts">
  import { tooltip } from '$lib/actions/tooltip.js';
  import Icon from '$lib/components/global/Icon.svelte';
  import '../../../../styles/diagnostics-pages.scss';
  
  let domain = $state('gmail.com');
  let loading = $state(false);
  let results = $state<any>(null);
  let error = $state<string | null>(null);
  let copiedState = $state(false);
  let selectedExampleIndex = $state<number | null>(null);
  let checkPorts = $state(false);
  
  const examples = [
    { domain: 'gmail.com', description: 'Google Gmail MX infrastructure' },
    { domain: 'outlook.com', description: 'Microsoft Outlook mail servers' },
    { domain: 'yahoo.com', description: 'Yahoo Mail MX configuration' },
    { domain: 'protonmail.com', description: 'ProtonMail secure email setup' },
    { domain: 'fastmail.com', description: 'FastMail professional hosting' },
    { domain: 'github.com', description: 'GitHub enterprise email setup' }
  ];
  
  async function checkMXHealth() {
    loading = true;
    error = null;
    results = null;
    
    try {
      const response = await fetch('/api/internal/diagnostics/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mx-health',
          domain: domain.trim(),
          checkPorts
        })
      });
      
      if (!response.ok) {
        throw new Error(`MX health check failed: ${response.status}`);
      }
      
      results = await response.json();
    } catch (err: any) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
  
  function loadExample(example: typeof examples[0], index: number) {
    domain = example.domain;
    selectedExampleIndex = index;
    checkMXHealth();
  }
  
  function clearExampleSelection() {
    selectedExampleIndex = null;
  }
  
  function getHealthColor(isHealthy: boolean): string {
    return isHealthy ? 'success' : 'error';
  }
  
  function getPortStatus(portCheck: any): string {
    return portCheck.open ? 'success' : 'error';
  }
  
  function getPortDescription(port: number): string {
    switch (port) {
      case 25: return 'SMTP (Standard)';
      case 587: return 'Submission (TLS)';
      case 465: return 'SMTPS (SSL)';
      default: return `Port ${port}`;
    }
  }
  
  async function copyResults() {
    if (!results) return;
    
    let text = `MX Health Check for ${domain}\n`;
    text += `Generated at: ${new Date().toISOString()}\n\n`;
    
    text += `Summary:\n`;
    text += `  Total MX records: ${results.summary.totalMX}\n`;
    text += `  Healthy MX records: ${results.summary.healthyMX}\n`;
    if (results.summary.reachableMX !== null) {
      text += `  Reachable MX records: ${results.summary.reachableMX}\n`;
    }
    text += `  Overall health: ${results.summary.healthy ? 'Healthy' : 'Issues detected'}\n`;
    text += `  Redundancy: ${results.summary.hasRedundancy ? 'Yes' : 'No'}\n\n`;
    
    text += `MX Records (by priority):\n`;
    results.mxRecords.forEach((mx: any, index: number) => {
      text += `${index + 1}. ${mx.exchange} (Priority: ${mx.priority})\n`;
      if (mx.error) {
        text += `   Error: ${mx.error}\n`;
      } else if (mx.addresses) {
        text += `   IPv4: ${mx.addresses.ipv4.join(', ') || 'None'}\n`;
        text += `   IPv6: ${mx.addresses.ipv6.join(', ') || 'None'}\n`;
        if (mx.portChecks) {
          text += `   Port checks:\n`;
          mx.portChecks.forEach((port: any) => {
            text += `     ${port.port}: ${port.open ? 'Open' : 'Closed'}`;
            if (port.latency) text += ` (${port.latency}ms)`;
            text += `\n`;
          });
        }
      }
      text += `\n`;
    });
    
    await navigator.clipboard.writeText(text);
    copiedState = true;
    setTimeout(() => copiedState = false, 1500);
  }
</script>

<div class="card">
  <header class="card-header">
    <h1>Email MX Health Checker</h1>
    <p>Check mail server (MX) health including DNS resolution and optional SMTP port connectivity testing. Verify your email infrastructure is properly configured and reachable.</p>
  </header>

  <!-- Examples -->
  <div class="card examples-card">
    <details class="examples-details">
      <summary class="examples-summary">
        <Icon name="chevron-right" size="xs" />
        <h4>MX Health Examples</h4>
      </summary>
      <div class="examples-grid">
        {#each examples as example, i}
          <button 
            class="example-card" 
            class:selected={selectedExampleIndex === i}
            onclick={() => loadExample(example, i)}
            use:tooltip={`Check MX health for ${example.domain}`}
          >
            <h5>{example.domain}</h5>
            <p>{example.description}</p>
          </button>
        {/each}
      </div>
    </details>
  </div>

  <!-- Input Form -->
  <div class="card input-card">
    <div class="card-header">
      <h3>MX Health Check</h3>
    </div>
    <div class="card-content">
      <div class="form-group">
        <label for="domain" use:tooltip={"Enter the domain to check email server health for"}>
          Domain Name
          <input 
            id="domain" 
            type="text" 
            bind:value={domain} 
            placeholder="example.com"
            onchange={() => { clearExampleSelection(); if (domain) checkMXHealth(); }}
          />
        </label>
      </div>
      
      <div class="form-group checkbox-group">
        <label class="checkbox-label">
          <input type="checkbox" bind:checked={checkPorts} />
          <span class="checkbox-text">Check SMTP port connectivity (25, 587, 465)</span>
        </label>
      </div>
      
      <div class="action-section">
        <button class="check-btn lookup-btn" onclick={checkMXHealth} disabled={loading || !domain.trim()}>
          {#if loading}
            <Icon name="loader" size="sm" animate="spin" />
            Checking MX Health...
          {:else}
            <Icon name="mail-check" size="sm" />
            Check MX Health
          {/if}
        </button>
      </div>
    </div>
  </div>

  <!-- Results -->
  {#if results}
    <div class="card results-card">
      <div class="card-header row">
        <h3>MX Health Results</h3>
        <button class="copy-btn" onclick={copyResults} disabled={copiedState}>
          <Icon name={copiedState ? "check" : "copy"} size="xs" />
          {copiedState ? "Copied!" : "Copy Results"}
        </button>
      </div>
      <div class="card-content">
        <!-- Health Summary -->
        <div class="summary-section">
          <div class="health-overview {getHealthColor(results.summary.healthy)}">
            <Icon name={results.summary.healthy ? 'check-circle' : 'alert-circle'} size="md" />
            <div>
              <h4>
                {#if results.summary.healthy}
                  Mail Infrastructure Healthy
                {:else}
                  Mail Infrastructure Issues
                {/if}
              </h4>
              <p>
                {results.summary.healthyMX} of {results.summary.totalMX} MX records resolved successfully
                {#if checkPorts && results.summary.reachableMX !== null}
                  • {results.summary.reachableMX} reachable via SMTP
                {/if}
              </p>
            </div>
          </div>
          
          <div class="summary-stats">
            <div class="stat-item">
              <Icon name="server" size="sm" />
              <div>
                <span class="stat-label">MX Records</span>
                <span class="stat-value">{results.summary.totalMX}</span>
              </div>
            </div>
            
            <div class="stat-item">
              <Icon name="shield-check" size="sm" />
              <div>
                <span class="stat-label">Healthy</span>
                <span class="stat-value {getHealthColor(results.summary.healthy)}">{results.summary.healthyMX}</span>
              </div>
            </div>
            
            {#if checkPorts && results.summary.reachableMX !== null}
              <div class="stat-item">
                <Icon name="wifi" size="sm" />
                <div>
                  <span class="stat-label">Reachable</span>
                  <span class="stat-value {getHealthColor(results.summary.reachableMX > 0)}">{results.summary.reachableMX}</span>
                </div>
              </div>
            {/if}
            
            <div class="stat-item">
              <Icon name="copy" size="sm" />
              <div>
                <span class="stat-label">Redundancy</span>
                <span class="stat-value {getHealthColor(results.summary.hasRedundancy)}">{results.summary.hasRedundancy ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- MX Records -->
        <div class="mx-section">
          <h4>MX Records (by priority)</h4>
          <div class="mx-list">
            {#each results.mxRecords as mx, index}
              <div class="mx-record {mx.error ? 'error' : 'success'}">
                <div class="mx-header">
                  <div class="mx-info">
                    <div class="mx-exchange">
                      <Icon name="server" size="sm" />
                      <span class="exchange-name">{mx.exchange}</span>
                      <span class="priority-badge">Priority {mx.priority}</span>
                    </div>
                    {#if mx.error}
                      <div class="mx-error">
                        <Icon name="alert-triangle" size="xs" />
                        <span>{mx.error}</span>
                      </div>
                    {/if}
                  </div>
                  
                  <div class="mx-status">
                    <Icon name={mx.error ? 'x-circle' : 'check-circle'} size="sm" class={mx.error ? 'text-error' : 'text-success'} />
                  </div>
                </div>
                
                {#if mx.addresses && !mx.error}
                  <div class="mx-details">
                    <!-- IP Addresses -->
                    <div class="addresses-section">
                      <div class="address-group">
                        <div class="address-header">
                          <Icon name="globe" size="xs" />
                          <span>IPv4 Addresses</span>
                        </div>
                        <div class="address-list">
                          {#if mx.addresses.ipv4.length > 0}
                            {#each mx.addresses.ipv4 as ip}
                              <code class="ip-address">{ip}</code>
                            {/each}
                          {:else}
                            <span class="no-addresses">None</span>
                          {/if}
                        </div>
                      </div>
                      
                      <div class="address-group">
                        <div class="address-header">
                          <Icon name="globe" size="xs" />
                          <span>IPv6 Addresses</span>
                        </div>
                        <div class="address-list">
                          {#if mx.addresses.ipv6.length > 0}
                            {#each mx.addresses.ipv6 as ip}
                              <code class="ip-address">{ip}</code>
                            {/each}
                          {:else}
                            <span class="no-addresses">None</span>
                          {/if}
                        </div>
                      </div>
                    </div>
                    
                    <!-- Port Checks -->
                    {#if mx.portChecks && checkPorts}
                      <div class="ports-section">
                        <div class="ports-header">
                          <Icon name="wifi" size="xs" />
                          <span>SMTP Port Connectivity</span>
                        </div>
                        <div class="port-checks">
                          {#each mx.portChecks as portCheck}
                            <div class="port-check {getPortStatus(portCheck)}">
                              <div class="port-info">
                                <span class="port-number">{portCheck.port}</span>
                                <span class="port-description">{getPortDescription(portCheck.port)}</span>
                              </div>
                              <div class="port-result">
                                <Icon name={portCheck.open ? 'check' : 'x'} size="xs" />
                                <span class="port-status">{portCheck.open ? 'Open' : 'Closed'}</span>
                                {#if portCheck.latency}
                                  <span class="port-latency">({portCheck.latency}ms)</span>
                                {/if}
                              </div>
                            </div>
                          {/each}
                        </div>
                      </div>
                    {/if}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  {/if}

  {#if error}
    <div class="card error-card">
      <div class="card-content">
        <div class="error-content">
          <Icon name="alert-triangle" size="md" />
          <div>
            <strong>MX Health Check Failed</strong>
            <p>{error}</p>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Educational Content -->
  <div class="card info-card">
    <div class="card-header">
      <h3>Understanding MX Records</h3>
    </div>
    <div class="card-content">
      <div class="info-grid">
        <div class="info-section">
          <h4>MX Record Basics</h4>
          <ul>
            <li><strong>Priority:</strong> Lower numbers have higher priority</li>
            <li><strong>Exchange:</strong> The mail server hostname</li>
            <li><strong>Redundancy:</strong> Multiple MX records provide failover</li>
            <li><strong>Load balancing:</strong> Equal priorities distribute load</li>
          </ul>
        </div>
        
        <div class="info-section">
          <h4>SMTP Ports</h4>
          <div class="port-explanations">
            <div class="port-explanation">
              <strong>Port 25:</strong> Standard SMTP (server-to-server)
            </div>
            <div class="port-explanation">
              <strong>Port 587:</strong> Mail submission (client-to-server, TLS)
            </div>
            <div class="port-explanation">
              <strong>Port 465:</strong> SMTPS (deprecated but still used)
            </div>
          </div>
        </div>
        
        <div class="info-section">
          <h4>Health Indicators</h4>
          <ul>
            <li>All MX records should resolve to IP addresses</li>
            <li>At least one SMTP port should be reachable</li>
            <li>Multiple MX records provide redundancy</li>
            <li>Lower priority servers should be reachable</li>
          </ul>
        </div>
        
        <div class="info-section">
          <h4>Common Issues</h4>
          <ul>
            <li>MX pointing to non-existent hosts</li>
            <li>All SMTP ports blocked by firewall</li>
            <li>Single point of failure (one MX record)</li>
            <li>Incorrect priority configuration</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .checkbox-group {
    margin: var(--spacing-md) 0;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    cursor: pointer;
    
    input[type="checkbox"] {
      margin: 0;
    }
    
    .checkbox-text {
      color: var(--text-primary);
      font-size: var(--font-size-sm);
    }
  }

  .action-section {
    display: flex;
    justify-content: center;
    margin-top: var(--spacing-xl);
  }

  .summary-section {
    margin-bottom: var(--spacing-lg);
  }

  .health-overview {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    border-radius: var(--radius-md);
    border: 2px solid;
    margin-bottom: var(--spacing-md);

    &.success {
      background: color-mix(in srgb, var(--color-success), transparent 95%);
      border-color: var(--color-success);
    }

    &.error {
      background: color-mix(in srgb, var(--color-error), transparent 95%);
      border-color: var(--color-error);
    }

    h4 {
      margin: 0;
      color: var(--text-primary);
    }

    p {
      margin: 0;
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
    }
  }

  .summary-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: var(--spacing-md);
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);

    .stat-label {
      font-size: var(--font-size-xs);
      color: var(--text-secondary);
      display: block;
    }

    .stat-value {
      font-weight: 600;
      color: var(--text-primary);
      
      &.success { color: var(--color-success); }
      &.error { color: var(--color-error); }
    }
  }

  .mx-section {
    h4 {
      color: var(--text-primary);
      margin: 0 0 var(--spacing-md) 0;
    }
  }

  .mx-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .mx-record {
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
    border-left: 4px solid;

    &.success {
      border-left-color: var(--color-success);
    }

    &.error {
      border-left-color: var(--color-error);
    }
  }

  .mx-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: var(--spacing-md);
  }

  .mx-info {
    flex: 1;
  }

  .mx-exchange {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-xs);

    .exchange-name {
      font-family: var(--font-mono);
      font-weight: 600;
      color: var(--text-primary);
    }

    .priority-badge {
      background: var(--bg-primary);
      padding: 2px 6px;
      border-radius: var(--radius-sm);
      font-size: var(--font-size-xs);
      color: var(--text-secondary);
    }
  }

  .mx-error {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    color: var(--color-error);
    font-size: var(--font-size-xs);
  }

  .mx-details {
    padding: 0 var(--spacing-md) var(--spacing-md);
    border-top: 1px solid var(--border-color);
    padding-top: var(--spacing-md);
  }

  .addresses-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-md);
  }

  .address-group {
    .address-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      margin-bottom: var(--spacing-xs);
      font-size: var(--font-size-xs);
      color: var(--text-secondary);
      font-weight: 500;
    }

    .address-list {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-xs);

      .ip-address {
        font-family: var(--font-mono);
        background: var(--bg-primary);
        padding: var(--spacing-xs);
        border-radius: var(--radius-sm);
        font-size: var(--font-size-xs);
      }

      .no-addresses {
        color: var(--text-secondary);
        font-style: italic;
        font-size: var(--font-size-xs);
      }
    }
  }

  .ports-section {
    .ports-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      margin-bottom: var(--spacing-sm);
      font-size: var(--font-size-xs);
      color: var(--text-secondary);
      font-weight: 500;
    }

    .port-checks {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: var(--spacing-sm);
    }
  }

  .port-check {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm);
    background: var(--bg-primary);
    border-radius: var(--radius-sm);
    border: 1px solid;

    &.success {
      border-color: var(--color-success);
      background: color-mix(in srgb, var(--color-success), transparent 95%);
    }

    &.error {
      border-color: var(--color-error);
      background: color-mix(in srgb, var(--color-error), transparent 95%);
    }

    .port-info {
      .port-number {
        font-family: var(--font-mono);
        font-weight: 600;
        color: var(--text-primary);
      }

      .port-description {
        font-size: var(--font-size-xs);
        color: var(--text-secondary);
        display: block;
      }
    }

    .port-result {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: var(--font-size-xs);

      .port-status {
        font-weight: 500;
      }

      .port-latency {
        color: var(--text-secondary);
      }
    }
  }

  .port-explanations {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);

    .port-explanation {
      font-size: var(--font-size-xs);
      color: var(--text-secondary);
      
      strong {
        color: var(--text-primary);
        font-family: var(--font-mono);
      }
    }
  }

  .text-success { color: var(--color-success); }
  .text-error { color: var(--color-error); }
</style>