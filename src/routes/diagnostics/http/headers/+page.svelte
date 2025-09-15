<script lang="ts">
  import { tooltip } from '$lib/actions/tooltip.js';
  import Icon from '$lib/components/global/Icon.svelte';
  import { isValidDomainName, formatDNSError } from '$lib/utils/dns-validation.js';
  import '../../../../styles/diagnostics-pages.scss';
  
  let url = $state('https://example.com');
  let method = $state('GET');
  let customHeadersText = $state('');
  let loading = $state(false);
  let results = $state<any>(null);
  let error = $state<string | null>(null);
  let copiedState = $state(false);
  let selectedExampleIndex = $state<number | null>(null);

  const methods = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];

  const examples = [
    { url: 'https://httpbin.org/get', method: 'GET', description: 'Basic GET request headers' },
    { url: 'https://api.github.com', method: 'HEAD', description: 'GitHub API headers (HEAD)' },
    { url: 'https://www.cloudflare.com', method: 'GET', description: 'Cloudflare response headers' },
    { url: 'https://httpbin.org/status/404', method: 'GET', description: '404 status response' },
    { url: 'https://httpbin.org/redirect/3', method: 'GET', description: 'Redirect chain headers' },
    { url: 'https://httpbin.org/gzip', method: 'GET', description: 'Compressed response headers' }
  ];

  // Reactive validation
  const isInputValid = $derived(() => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return false;
    try {
      const parsed = new URL(trimmedUrl);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  });

  function parseCustomHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    if (!customHeadersText.trim()) return headers;
    
    const lines = customHeadersText.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex > 0) {
        const key = trimmed.slice(0, colonIndex).trim();
        const value = trimmed.slice(colonIndex + 1).trim();
        if (key && value) {
          headers[key] = value;
        }
      }
    }
    return headers;
  }

  async function checkHeaders() {
    loading = true;
    error = null;
    results = null;

    // Validation
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      error = 'URL is required';
      loading = false;
      return;
    }

    try {
      new URL(trimmedUrl);
    } catch {
      error = 'Invalid URL format';
      loading = false;
      return;
    }

    try {
      const customHeaders = parseCustomHeaders();
      
      const response = await fetch('/api/internal/diagnostics/http', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'headers',
          url: trimmedUrl,
          method,
          headers: customHeaders
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Request failed (${response.status})`;
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.message) errorMessage = errorData.message;
        } catch {}
        
        throw new Error(errorMessage);
      }

      results = await response.json();
    } catch (err: any) {
      error = formatDNSError(err);
    } finally {
      loading = false;
    }
  }

  function loadExample(example: typeof examples[0], index: number) {
    url = example.url;
    method = example.method;
    customHeadersText = '';
    selectedExampleIndex = index;
    checkHeaders();
  }
  
  function clearExampleSelection() {
    selectedExampleIndex = null;
  }

  async function copyResults() {
    if (!results?.headers) return;
    
    let text = `${method} ${results.url}\nStatus: ${results.status} ${results.statusText}\n\nResponse Headers:\n`;
    Object.entries(results.headers).forEach(([key, value]) => {
      text += `${key}: ${value}\n`;
    });
    
    if (results.size) {
      text += `\nContent-Length: ${results.size} bytes`;
    }
    
    await navigator.clipboard.writeText(text);
    copiedState = true;
    setTimeout(() => copiedState = false, 1500);
  }

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  function getStatusClass(status: number): string {
    if (status >= 200 && status < 300) return 'success';
    if (status >= 300 && status < 400) return 'warning'; 
    if (status >= 400) return 'error';
    return '';
  }
</script>

<div class="card">
  <header class="card-header">
    <h1>HTTP Headers Analyzer</h1>
    <p>Analyze HTTP response headers, status codes, and response metadata. Supports custom request methods and headers for comprehensive HTTP testing.</p>
  </header>

  <!-- Examples -->
  <div class="card examples-card">
    <details class="examples-details">
      <summary class="examples-summary">
        <Icon name="chevron-right" size="xs" />
        <h4>Header Examples</h4>
      </summary>
      <div class="examples-grid">
        {#each examples as example, i}
          <button 
            class="example-card" 
            class:selected={selectedExampleIndex === i}
            onclick={() => loadExample(example, i)}
            use:tooltip={`Analyze headers for ${example.url}`}
          >
            <h5>{example.method} {example.url}</h5>
            <p>{example.description}</p>
          </button>
        {/each}
      </div>
    </details>
  </div>

  <!-- Input Form -->
  <div class="card input-card">
    <div class="card-header">
      <h3>Request Configuration</h3>
    </div>
    <div class="card-content">
      <div class="form-grid">
        <div class="form-group">
          <label for="url" use:tooltip={"Enter the URL to analyze"}>
            URL
            <input 
              id="url" 
              type="url" 
              bind:value={url} 
              placeholder="https://example.com"
              class:invalid={url && !isInputValid()}
              onchange={() => { clearExampleSelection(); if (isInputValid()) checkHeaders(); }}
            />
            {#if url && !isInputValid()}
              <span class="error-text">Invalid URL format</span>
            {/if}
          </label>
        </div>

        <div class="form-group">
          <label for="method" use:tooltip={"HTTP method to use"}>
            Method
            <select id="method" bind:value={method} onchange={() => { clearExampleSelection(); if (isInputValid()) checkHeaders(); }}>
              {#each methods as methodOption}
                <option value={methodOption}>{methodOption}</option>
              {/each}
            </select>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label for="headers" use:tooltip={"Custom headers (one per line: 'Name: Value')"}>
          Custom Headers (Optional)
          <textarea 
            id="headers"
            bind:value={customHeadersText}
            placeholder="User-Agent: My Custom Agent&#10;Authorization: Bearer token123"
            rows="3"
            onchange={() => { clearExampleSelection(); if (isInputValid()) checkHeaders(); }}
          ></textarea>
        </label>
      </div>
      
      <div class="action-section">
        <button class="lookup-btn" onclick={checkHeaders} disabled={loading || !isInputValid}>
          {#if loading}
            <Icon name="loader-2" size="sm" animate="spin" />
            Analyzing Headers...
          {:else}
            <Icon name="globe" size="sm" />
            Analyze Headers
          {/if}
        </button>
      </div>
    </div>
  </div>

  <!-- Results -->
  {#if results}
    <div class="card results-card">
      <div class="card-header row">
        <h3>HTTP Response Analysis</h3>
        <button class="copy-btn" onclick={copyResults} disabled={copiedState}>
          <span class={copiedState ? "text-green-500" : ""}><Icon name={copiedState ? "check" : "copy"} size="xs" /></span>
          {copiedState ? "Copied!" : "Copy Results"}
        </button>
      </div>
      <div class="card-content">
        <!-- Status Overview -->
        <div class="status-overview">
          <div class="status-item {getStatusClass(results.status)}">
            <Icon name="activity" size="sm" />
            <div>
              <strong>{results.status} {results.statusText}</strong>
              <div class="status-text">HTTP Status</div>
            </div>
          </div>
          
          {#if results.size}
            <div class="status-item">
              <Icon name="file" size="sm" />
              <div>
                <strong>{formatBytes(results.size)}</strong>
                <div class="status-text">Response Size</div>
              </div>
            </div>
          {/if}

          {#if results.timings}
            <div class="status-item">
              <Icon name="clock" size="sm" />
              <div>
                <strong>{results.timings.total.toFixed(0)}ms</strong>
                <div class="status-text">Total Time</div>
              </div>
            </div>
          {/if}
        </div>

        <!-- Response Headers -->
        <div class="record-section card">
          <h4>Response Headers</h4>
          <div class="records-list">
            {#each Object.entries(results.headers) as [name, value]}
              <div class="record-item">
                <div class="record-data">
                  <strong>{name}:</strong> {value}
                </div>
              </div>
            {/each}
          </div>
        </div>

        {#if results.timings}
          <div class="record-section card">
            <h4>Performance Timing</h4>
            <div class="records-list">
              <div class="record-item">
                <div class="record-data">
                  <strong>DNS Resolution:</strong> ~{results.timings.dns.toFixed(1)}ms
                </div>
              </div>
              <div class="record-item">
                <div class="record-data">
                  <strong>TCP Connect:</strong> ~{results.timings.tcp.toFixed(1)}ms
                </div>
              </div>
              {#if results.timings.tls > 0}
                <div class="record-item">
                  <div class="record-data">
                    <strong>TLS Handshake:</strong> ~{results.timings.tls.toFixed(1)}ms
                  </div>
                </div>
              {/if}
              <div class="record-item">
                <div class="record-data">
                  <strong>Time to First Byte:</strong> ~{results.timings.ttfb.toFixed(1)}ms
                </div>
              </div>
            </div>
            <p class="help-text">* Timing values are approximations when not isolated</p>
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
            <strong>Request Failed</strong>
            <p>{error}</p>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Educational Content -->
  <div class="card info-card">
    <div class="card-header">
      <h3>About HTTP Headers</h3>
    </div>
    <div class="card-content">
      <div class="info-grid">
        <div class="info-section">
          <h4>Response Headers</h4>
          <p>HTTP headers provide metadata about the response, including content type, caching instructions, security policies, and server information.</p>
        </div>
        
        <div class="info-section">
          <h4>Status Codes</h4>
          <ul>
            <li><strong>2xx:</strong> Success responses</li>
            <li><strong>3xx:</strong> Redirection responses</li>
            <li><strong>4xx:</strong> Client error responses</li>
            <li><strong>5xx:</strong> Server error responses</li>
          </ul>
        </div>
        
        <div class="info-section">
          <h4>Common Headers</h4>
          <ul>
            <li><strong>Content-Type:</strong> MIME type of content</li>
            <li><strong>Cache-Control:</strong> Caching directives</li>
            <li><strong>Set-Cookie:</strong> Cookie instructions</li>
            <li><strong>Location:</strong> Redirect target URL</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .help-text {
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    margin-top: var(--spacing-sm);
    font-style: italic;
  }

  textarea {
    resize: vertical;
    min-height: 80px;
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
  }

  .error-text {
    color: var(--text-error);
    font-size: var(--font-size-xs);
    margin-top: var(--spacing-xs);
  }


  // Page-specific styles only (common utilities moved to diagnostics-pages.scss)
</style>
