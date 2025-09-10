<script lang="ts">
  import { tooltip } from '$lib/actions/tooltip.js';
  import Icon from '$lib/components/global/Icon.svelte';
  import '../../../../styles/diagnostics-pages.scss';
  
  let host = $state('google.com:443');
  let servername = $state('');
  let useCustomServername = $state(false);
  let protocols = $state('h2,http/1.1');
  let loading = $state(false);
  let results = $state<any>(null);
  let error = $state<string | null>(null);
  let copiedState = $state(false);
  let selectedExampleIndex = $state<number | null>(null);
  
  const examples = [
    { host: 'google.com:443', protocols: 'h2,http/1.1', description: 'Google HTTP/2 support' },
    { host: 'github.com:443', protocols: 'h2,http/1.1', description: 'GitHub ALPN negotiation' },
    { host: 'cloudflare.com:443', protocols: 'h2,http/1.1,h3', description: 'Cloudflare HTTP/3 support' },
    { host: 'wikipedia.org:443', protocols: 'h2,http/1.1', description: 'Wikipedia HTTP/2 support' },
    { host: 'cdn.jsdelivr.net:443', protocols: 'h2,http/1.1', description: 'CDN ALPN support' },
    { host: 'api.github.com:443', protocols: 'h2,http/1.1', description: 'API server ALPN' }
  ];
  
  const commonProtocols = [
    { value: 'h2,http/1.1', label: 'HTTP/2 + HTTP/1.1', description: 'Standard web protocols' },
    { value: 'h3,h2,http/1.1', label: 'HTTP/3 + HTTP/2 + HTTP/1.1', description: 'Including experimental HTTP/3' },
    { value: 'h2', label: 'HTTP/2 only', description: 'Test HTTP/2 exclusively' },
    { value: 'http/1.1', label: 'HTTP/1.1 only', description: 'Fallback protocol only' }
  ];
  
  // Reactive validation
  const isInputValid = $derived(() => {
    const trimmedHost = host.trim();
    if (!trimmedHost) return false;
    return /^[a-zA-Z0-9.-]+(?::\d+)?$/.test(trimmedHost);
  });
  
  const protocolsArray = $derived(() => {
    return protocols.split(',').map(p => p.trim()).filter(p => p);
  });
  
  async function probeALPN() {
    loading = true;
    error = null;
    results = null;
    
    try {
      const response = await fetch('/api/internal/diagnostics/tls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'alpn',
          host: host.trim(),
          protocols: protocolsArray,
          servername: useCustomServername && servername ? servername.trim() : undefined
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || `ALPN probe failed (${response.status})`);
        } catch {
          throw new Error(`ALPN probe failed (${response.status})`);
        }
      }
      
      results = await response.json();
    } catch (err: any) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
  
  function loadExample(example: typeof examples[0], index: number) {
    host = example.host;
    protocols = example.protocols;
    servername = '';
    useCustomServername = false;
    selectedExampleIndex = index;
    probeALPN();
  }
  
  function clearExampleSelection() {
    selectedExampleIndex = null;
  }
  
  function setCommonProtocols(protocolSet: string) {
    protocols = protocolSet;
    clearExampleSelection();
    if (isInputValid) probeALPN();
  }
  
  function getProtocolInfo(protocol: string): { name: string, description: string, version: string } {
    switch (protocol) {
      case 'h3':
        return { name: 'HTTP/3', description: 'Latest HTTP version over QUIC', version: 'HTTP/3' };
      case 'h2':
        return { name: 'HTTP/2', description: 'Binary, multiplexed HTTP protocol', version: 'HTTP/2' };
      case 'http/1.1':
        return { name: 'HTTP/1.1', description: 'Traditional HTTP protocol', version: 'HTTP/1.1' };
      case 'http/1.0':
        return { name: 'HTTP/1.0', description: 'Legacy HTTP protocol', version: 'HTTP/1.0' };
      default:
        return { name: protocol, description: 'Custom or unknown protocol', version: protocol };
    }
  }
  
  function getNegotiationStatus(): { status: string, icon: string, class: string, description: string } {
    if (!results) return { status: 'Unknown', icon: 'help-circle', class: 'secondary', description: 'No results available' };
    
    if (results.success && results.negotiatedProtocol) {
      const protocol = getProtocolInfo(results.negotiatedProtocol);
      return { 
        status: 'Successful', 
        icon: 'check-circle', 
        class: 'success', 
        description: `Server selected ${protocol.name}` 
      };
    } else if (!results.success) {
      return { 
        status: 'Failed', 
        icon: 'x-circle', 
        class: 'error', 
        description: 'No protocol was negotiated' 
      };
    } else {
      return { 
        status: 'No Selection', 
        icon: 'minus-circle', 
        class: 'warning', 
        description: 'Server did not select any protocol' 
      };
    }
  }
  
  async function copyALPNInfo() {
    if (!results) return;
    
    let text = `ALPN Negotiation Results for ${host}\n`;
    text += `Generated at: ${new Date().toISOString()}\n\n`;
    text += `Requested Protocols: ${results.requestedProtocols.join(', ')}\n`;
    text += `Negotiated Protocol: ${results.negotiatedProtocol || 'None'}\n`;
    text += `TLS Version: ${results.tlsVersion || 'Unknown'}\n`;
    text += `Success: ${results.success ? 'Yes' : 'No'}\n`;
    
    const status = getNegotiationStatus();
    text += `\nNegotiation Status: ${status.status}\n`;
    text += `Description: ${status.description}\n`;
    
    if (results.negotiatedProtocol) {
      const protocolInfo = getProtocolInfo(results.negotiatedProtocol);
      text += `\nSelected Protocol Info:\n`;
      text += `  Name: ${protocolInfo.name}\n`;
      text += `  Description: ${protocolInfo.description}\n`;
    }
    
    await navigator.clipboard.writeText(text);
    copiedState = true;
    setTimeout(() => copiedState = false, 1500);
  }
</script>

<div class="card">
  <header class="card-header">
    <h1>TLS ALPN Negotiation</h1>
    <p>Test Application-Layer Protocol Negotiation (ALPN) to see which protocol a server selects from your offered list. Commonly used to negotiate HTTP/2, HTTP/3, or other application protocols during TLS handshake.</p>
  </header>

  <!-- Examples -->
  <div class="card examples-card">
    <details class="examples-details">
      <summary class="examples-summary">
        <Icon name="chevron-right" size="xs" />
        <h4>ALPN Examples</h4>
      </summary>
      <div class="examples-grid">
        {#each examples as example, i}
          <button 
            class="example-card" 
            class:selected={selectedExampleIndex === i}
            onclick={() => loadExample(example, i)}
            use:tooltip={`Test ALPN for ${example.host} (${example.description})`}
          >
            <h5>{example.host}</h5>
            <p>{example.description}</p>
            <div class="example-protocols mono">{example.protocols}</div>
          </button>
        {/each}
      </div>
    </details>
  </div>

  <!-- Input Form -->
  <div class="card input-card">
    <div class="card-header">
      <h3>ALPN Negotiation Configuration</h3>
    </div>
    <div class="card-content">
      <div class="form-row">
        <div class="form-group">
          <label for="host" use:tooltip={"Enter hostname:port (e.g., google.com:443)"}>
            Host:Port
            <input 
              id="host" 
              type="text" 
              bind:value={host} 
              placeholder="google.com:443"
              class:invalid={host && !isInputValid}
              onchange={() => { clearExampleSelection(); if (isInputValid) probeALPN(); }}
            />
            {#if host && !isInputValid}
              <span class="error-text">Invalid host:port format</span>
            {/if}
          </label>
        </div>
      </div>

      <!-- Protocol Selection -->
      <div class="form-row">
        <div class="form-group">
          <label for="protocols" use:tooltip={"Comma-separated list of protocols to offer (e.g., h2,http/1.1)"}>
            ALPN Protocols
            <input 
              id="protocols" 
              type="text" 
              bind:value={protocols} 
              placeholder="h2,http/1.1"
              onchange={() => { clearExampleSelection(); if (isInputValid) probeALPN(); }}
            />
          </label>
          <div class="protocol-presets">
            <span class="preset-label">Quick select:</span>
            {#each commonProtocols as preset}
              <button 
                type="button" 
                class="preset-btn" 
                onclick={() => setCommonProtocols(preset.value)}
                use:tooltip={preset.description}
              >
                {preset.label}
              </button>
            {/each}
          </div>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label class="checkbox-group">
            <input 
              type="checkbox" 
              bind:checked={useCustomServername}
              onchange={() => { clearExampleSelection(); if (isInputValid) probeALPN(); }}
            />
            Use custom SNI servername
          </label>
          {#if useCustomServername}
            <input 
              type="text" 
              bind:value={servername} 
              placeholder="example.com"
              use:tooltip={"Custom servername for SNI (Server Name Indication)"}
              onchange={() => { clearExampleSelection(); if (isInputValid) probeALPN(); }}
            />
          {/if}
        </div>
      </div>
      
      <div class="action-section">
        <button class="lookup-btn" onclick={probeALPN} disabled={loading || !isInputValid}>
          {#if loading}
            <Icon name="loader-2" size="sm" class="animate-spin" />
            Testing ALPN...
          {:else}
            <Icon name="shuffle" size="sm" />
            Test ALPN Negotiation
          {/if}
        </button>
      </div>
    </div>
  </div>

  <!-- Results -->
  {#if results}
    <div class="card results-card">
      <div class="card-header row">
        <h3>ALPN Negotiation Results</h3>
        <button class="copy-btn" onclick={copyALPNInfo} disabled={copiedState}>
          <Icon name={copiedState ? "check" : "copy"} size="xs" />
          {copiedState ? "Copied!" : "Copy Results"}
        </button>
      </div>
      <div class="card-content">
        
        <!-- Negotiation Overview -->
        {#if results}
          {@const status = getNegotiationStatus()}
          <div class="status-overview">
            <div class="status-item {status.class}">
              <Icon name={status.icon} size="sm" />
              <div>
                <span class="status-title">Negotiation: {status.status}</span>
                <p class="status-desc">{status.description}</p>
              </div>
            </div>
            {#if results.tlsVersion}
              <div class="status-item success">
                <Icon name="shield-check" size="sm" />
                <div>
                  <span class="status-title">TLS Version: {results.tlsVersion}</span>
                  <p class="status-desc">Connection established successfully</p>
                </div>
              </div>
            {/if}
          </div>
        {/if}

        <!-- Protocol Details -->
        <div class="protocols-section">
          <h4>Protocol Negotiation Details</h4>
          
          <div class="protocol-details">
            <div class="detail-section">
              <h5>Requested Protocols</h5>
              <div class="protocol-list">
                {#each results.requestedProtocols as protocol, i}
                  {@const protocolInfo = getProtocolInfo(protocol)}
                  <div class="protocol-item requested">
                    <div class="protocol-header">
                      <span class="protocol-name">{protocolInfo.name}</span>
                      <span class="protocol-id mono">({protocol})</span>
                      <span class="protocol-priority">Priority {i + 1}</span>
                    </div>
                    <p class="protocol-desc">{protocolInfo.description}</p>
                  </div>
                {/each}
              </div>
            </div>

            {#if results.negotiatedProtocol}
              {@const selectedProtocol = getProtocolInfo(results.negotiatedProtocol)}
              <div class="detail-section">
                <h5>Selected Protocol</h5>
                <div class="selected-protocol">
                  <div class="protocol-item selected">
                    <div class="protocol-header">
                      <Icon name="check-circle" size="sm" class="success-icon" />
                      <span class="protocol-name">{selectedProtocol.name}</span>
                      <span class="protocol-id mono">({results.negotiatedProtocol})</span>
                    </div>
                    <p class="protocol-desc">{selectedProtocol.description}</p>
                  </div>
                </div>
              </div>
            {:else}
              <div class="detail-section">
                <h5>Selected Protocol</h5>
                <div class="no-selection">
                  <Icon name="x-circle" size="sm" />
                  <span>No protocol was selected by the server</span>
                </div>
              </div>
            {/if}
          </div>
        </div>

        <!-- Connection Info -->
        {#if results.servername || results.tlsVersion}
          <div class="connection-section">
            <h4>Connection Information</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Server Name:</span>
                <span class="detail-value mono">{results.servername}</span>
              </div>
              {#if results.tlsVersion}
                <div class="detail-item">
                  <span class="detail-label">TLS Version:</span>
                  <span class="detail-value">{results.tlsVersion}</span>
                </div>
              {/if}
            </div>
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
            <strong>ALPN Negotiation Failed</strong>
            <p>{error}</p>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Educational Content -->
  <div class="card info-card">
    <div class="card-header">
      <h3>Understanding ALPN</h3>
    </div>
    <div class="card-content">
      <div class="info-grid">
        <div class="info-section">
          <h4>What is ALPN?</h4>
          <p>Application-Layer Protocol Negotiation (ALPN) is a TLS extension that allows the client and server to negotiate which application protocol to use during the TLS handshake.</p>
        </div>
        
        <div class="info-section">
          <h4>Common Protocols</h4>
          <ul>
            <li><strong>h2:</strong> HTTP/2 - Binary, multiplexed protocol</li>
            <li><strong>h3:</strong> HTTP/3 - Latest HTTP over QUIC</li>
            <li><strong>http/1.1:</strong> Traditional HTTP/1.1</li>
            <li><strong>spdy/3.1:</strong> Legacy SPDY protocol</li>
          </ul>
        </div>
        
        <div class="info-section">
          <h4>Protocol Priority</h4>
          <p>Protocols are offered in preference order. The server selects the first protocol from your list that it supports. Order matters!</p>
        </div>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .example-protocols {
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    margin-top: var(--spacing-xs);
    background: var(--bg-tertiary);
    padding: 2px var(--spacing-xs);
    border-radius: var(--radius-xs);
  }

  .protocol-presets {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--spacing-xs);
    margin-top: var(--spacing-xs);
  }

  .preset-label {
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    margin-right: var(--spacing-xs);
  }

  .preset-btn {
    font-size: var(--font-size-xs);
    padding: 2px var(--spacing-xs);
    background: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-xs);
    color: var(--text-primary);
    cursor: pointer;
    transition: all var(--transition-fast);

    &:hover {
      background: var(--color-primary);
      color: var(--bg-primary);
      border-color: var(--color-primary);
    }
  }

  .status-title {
    font-weight: 600;
    color: var(--text-primary);
  }

  .status-desc {
    font-size: var(--font-size-xs);
    margin: 2px 0 0 0;
    opacity: 0.8;
  }

  .protocols-section {
    margin: var(--spacing-lg) 0;
    
    h4 {
      color: var(--text-primary);
      margin: 0 0 var(--spacing-md) 0;
      border-bottom: 1px solid var(--border-primary);
      padding-bottom: var(--spacing-xs);
    }
  }

  .protocol-details {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .detail-section {
    h5 {
      color: var(--text-primary);
      margin: 0 0 var(--spacing-md) 0;
      font-size: var(--font-size-md);
    }
  }

  .protocol-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .protocol-item {
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-sm);
    padding: var(--spacing-md);
    
    &.requested {
      background: var(--bg-secondary);
    }
    
    &.selected {
      background: color-mix(in srgb, var(--color-success), transparent 95%);
      border-color: var(--color-success);
    }
  }

  .protocol-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-xs);
  }

  .protocol-name {
    font-weight: 600;
    color: var(--text-primary);
  }

  .protocol-id {
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
  }

  .protocol-priority {
    font-size: var(--font-size-xs);
    background: var(--bg-tertiary);
    padding: 2px var(--spacing-xs);
    border-radius: var(--radius-xs);
    color: var(--text-secondary);
    margin-left: auto;
  }

  .protocol-desc {
    margin: 0;
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    line-height: 1.4;
  }

  .selected-protocol {
    .success-icon {
      color: var(--color-success);
    }
  }

  .no-selection {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    background: color-mix(in srgb, var(--color-error), transparent 95%);
    border: 1px solid var(--color-error);
    border-radius: var(--radius-sm);
    color: var(--color-error);
  }

  .connection-section {
    margin-top: var(--spacing-lg);
    
    h4 {
      color: var(--text-primary);
      margin: 0 0 var(--spacing-md) 0;
      border-bottom: 1px solid var(--border-primary);
      padding-bottom: var(--spacing-xs);
    }
  }

  .detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-md);
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .detail-label {
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    font-weight: 500;
  }

  .detail-value {
    color: var(--text-primary);
    font-weight: 500;
  }

  .mono {
    font-family: var(--font-mono);
  }
</style>