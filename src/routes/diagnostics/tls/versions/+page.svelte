<script lang="ts">
  import { tooltip } from '$lib/actions/tooltip.js';
  import Icon from '$lib/components/global/Icon.svelte';
  import '../../../../styles/diagnostics-pages.scss';

  let host = $state('google.com:443');
  let servername = $state('');
  let useCustomServername = $state(false);
  let loading = $state(false);
  let results = $state<unknown>(null);
  let error = $state<string | null>(null);
  let copiedState = $state(false);
  let selectedExampleIndex = $state<number | null>(null);

  const examples = [
    { host: 'google.com:443', description: 'Google TLS version support' },
    { host: 'github.com:443', description: 'GitHub TLS versions' },
    { host: 'cloudflare.com:443', description: 'Cloudflare TLS support' },
    { host: 'microsoft.com:443', description: 'Microsoft TLS versions' },
    { host: 'amazon.com:443', description: 'Amazon TLS configuration' },
    { host: 'facebook.com:443', description: 'Facebook TLS versions' },
  ];

  const tlsVersions = [
    { version: 'TLSv1', name: 'TLS 1.0', deprecated: true },
    { version: 'TLSv1.1', name: 'TLS 1.1', deprecated: true },
    { version: 'TLSv1.2', name: 'TLS 1.2', deprecated: false },
    { version: 'TLSv1.3', name: 'TLS 1.3', deprecated: false },
  ];

  // Reactive validation
  const isInputValid = $derived(() => {
    const trimmedHost = host.trim();
    if (!trimmedHost) return false;
    return /^[a-zA-Z0-9.-]+(?::\d+)?$/.test(trimmedHost);
  });

  async function probeTLSVersions() {
    loading = true;
    error = null;
    results = null;

    try {
      const response = await fetch('/api/internal/diagnostics/tls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'versions',
          host: host.trim(),
          servername: useCustomServername && servername ? servername.trim() : undefined,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || `TLS versions probe failed (${response.status})`);
        } catch {
          throw new Error(`TLS versions probe failed (${response.status})`);
        }
      }

      results = await response.json();
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : 'Unknown error occurred';
    } finally {
      loading = false;
    }
  }

  function loadExample(example: (typeof examples)[0], index: number) {
    host = example.host;
    servername = '';
    useCustomServername = false;
    selectedExampleIndex = index;
    probeTLSVersions();
  }

  function clearExampleSelection() {
    selectedExampleIndex = null;
  }

  function getVersionStatus(
    version: string,
    supported: boolean,
    deprecated: boolean,
  ): { status: string; icon: string; class: string } {
    if (!supported) {
      return { status: 'Not Supported', icon: 'x-circle', class: 'error' };
    }
    if (deprecated) {
      return { status: 'Supported (Deprecated)', icon: 'alert-triangle', class: 'warning' };
    }
    return { status: 'Supported', icon: 'check-circle', class: 'success' };
  }

  function getOverallSecurity(): { level: string; class: string; icon: string; description: string } {
    if (!results)
      return { level: 'Unknown', class: 'secondary', icon: 'help-circle', description: 'No results available' };

    const supportedVersions = results.supportedVersions || [];
    const hasDeprecated = supportedVersions.some((v: string) => v === 'TLSv1' || v === 'TLSv1.1');
    const hasModern = supportedVersions.includes('TLSv1.3');
    const hasSecure = supportedVersions.includes('TLSv1.2');

    if (hasModern && hasSecure && !hasDeprecated) {
      return {
        level: 'Excellent',
        class: 'success',
        icon: 'shield-check',
        description: 'Only modern TLS versions supported',
      };
    }
    if (hasSecure && !hasDeprecated) {
      return { level: 'Good', class: 'success', icon: 'shield', description: 'Secure TLS versions only' };
    }
    if (hasDeprecated && hasSecure) {
      return {
        level: 'Warning',
        class: 'warning',
        icon: 'shield-alert',
        description: 'Deprecated versions still supported',
      };
    }
    if (supportedVersions.length === 0) {
      return { level: 'Critical', class: 'error', icon: 'shield-off', description: 'No TLS versions detected' };
    }
    return { level: 'Poor', class: 'error', icon: 'shield-x', description: 'Only deprecated versions supported' };
  }

  async function copyVersionsInfo() {
    if (!results) return;

    let text = `TLS Versions Analysis for ${host}\n`;
    text += `Generated at: ${new Date().toISOString()}\n\n`;
    text += `Supported Versions (${results.totalSupported}):\n`;

    tlsVersions.forEach((tlsVer) => {
      const supported = results.supported[tlsVer.version];
      text += `  ${tlsVer.name} (${tlsVer.version}): ${supported ? 'Supported' : 'Not Supported'}`;
      if (supported && tlsVer.deprecated) {
        text += ' (DEPRECATED)';
      }
      text += '\n';
    });

    const security = getOverallSecurity();
    text += `\nSecurity Level: ${security.level}\n`;
    text += `Description: ${security.description}\n`;

    if (results.minVersion || results.maxVersion) {
      text += `\nVersion Range:\n`;
      text += `  Minimum: ${results.minVersion || 'Unknown'}\n`;
      text += `  Maximum: ${results.maxVersion || 'Unknown'}\n`;
    }

    await navigator.clipboard.writeText(text);
    copiedState = true;
    setTimeout(() => (copiedState = false), 1500);
  }
</script>

<div class="card">
  <header class="card-header">
    <h1>TLS Versions Probe</h1>
    <p>
      Test which TLS protocol versions a server supports by attempting connections with different TLS version
      constraints. Identify deprecated versions and assess overall TLS security posture.
    </p>
  </header>

  <!-- Examples -->
  <div class="card examples-card">
    <details class="examples-details">
      <summary class="examples-summary">
        <Icon name="chevron-right" size="xs" />
        <h4>TLS Version Examples</h4>
      </summary>
      <div class="examples-grid">
        {#each examples as example, i (i)}
          <button
            class="example-card"
            class:selected={selectedExampleIndex === i}
            onclick={() => loadExample(example, i)}
            use:tooltip={`Probe TLS versions for ${example.host} (${example.description})`}
          >
            <h5>{example.host}</h5>
            <p>{example.description}</p>
          </button>
        {/each}
      </div>
    </details>
  </div>

  <!-- Input Form -->
  <div class="card input-card">
    <div class="card-header">
      <h3>TLS Versions Probe Configuration</h3>
    </div>
    <div class="card-content">
      <div class="form-row">
        <div class="form-group">
          <label for="host" use:tooltip={'Enter hostname:port (e.g., google.com:443)'}>
            Host:Port
            <input
              id="host"
              type="text"
              bind:value={host}
              placeholder="google.com:443"
              class:invalid={host && !isInputValid}
              onchange={() => {
                clearExampleSelection();
                if (isInputValid()) probeTLSVersions();
              }}
            />
            {#if host && !isInputValid}
              <span class="error-text">Invalid host:port format</span>
            {/if}
          </label>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="checkbox-group">
            <input
              type="checkbox"
              bind:checked={useCustomServername}
              onchange={() => {
                clearExampleSelection();
                if (isInputValid()) probeTLSVersions();
              }}
            />
            Use custom SNI servername
          </label>
          {#if useCustomServername}
            <input
              type="text"
              bind:value={servername}
              placeholder="example.com"
              use:tooltip={'Custom servername for SNI (Server Name Indication)'}
              onchange={() => {
                clearExampleSelection();
                if (isInputValid()) probeTLSVersions();
              }}
            />
          {/if}
        </div>
      </div>

      <div class="action-section">
        <button class="lookup-btn" onclick={probeTLSVersions} disabled={loading || !isInputValid}>
          {#if loading}
            <Icon name="loader-2" size="sm" animate="spin" />
            Probing TLS Versions...
          {:else}
            <Icon name="search" size="sm" />
            Probe TLS Versions
          {/if}
        </button>
      </div>
    </div>
  </div>

  <!-- Results -->
  {#if results}
    <div class="card results-card">
      <div class="card-header row">
        <h3>TLS Versions Probe Results</h3>
        <button class="copy-btn" onclick={copyVersionsInfo} disabled={copiedState}>
          <Icon name={copiedState ? 'check' : 'copy'} size="xs" />
          {copiedState ? 'Copied!' : 'Copy Results'}
        </button>
      </div>
      <div class="card-content">
        <!-- Security Overview -->
        {#if results.supported}
          {@const security = getOverallSecurity()}

          <div class="security-overview">
            <div class="status-overview">
              <div class="status-item {security.class}">
                <Icon name={security.icon} size="sm" />
                <div>
                  <span class="status-title">Security Level: {security.level}</span>
                  <p class="status-desc">{security.description}</p>
                </div>
              </div>
              <div class="status-item success">
                <Icon name="check-square" size="sm" />
                <div>
                  <span class="status-title">{results.totalSupported} Versions Supported</span>
                  <p class="status-desc">Out of {tlsVersions.length} tested</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Version Details -->
          <div class="versions-section">
            <h4>TLS Version Support</h4>
            <div class="versions-grid">
              {#each tlsVersions as tlsVer (tlsVer.version)}
                {@const supported = results.supported[tlsVer.version]}
                {@const status = getVersionStatus(tlsVer.version, supported, tlsVer.deprecated)}

                <div class="version-item {status.class}">
                  <div class="version-header">
                    <div class="version-info">
                      <Icon name={status.icon} size="sm" />
                      <div>
                        <span class="version-name">{tlsVer.name}</span>
                        <span class="version-code mono">({tlsVer.version})</span>
                      </div>
                    </div>
                    <span class="version-status">{status.status}</span>
                  </div>

                  {#if !supported && results.errors[tlsVer.version]}
                    <div class="version-error">
                      <span class="error-detail">{results.errors[tlsVer.version]}</span>
                    </div>
                  {/if}

                  {#if tlsVer.deprecated}
                    <div class="version-warning">
                      <Icon name="alert-triangle" size="xs" />
                      <span>This version is deprecated and should not be used</span>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          </div>

          <!-- Version Range Summary -->
          {#if results.minVersion || results.maxVersion}
            <div class="range-section">
              <h4>Supported Version Range</h4>
              <div class="range-info">
                <div class="range-item">
                  <span class="range-label">Minimum Version:</span>
                  <span class="range-value mono">{results.minVersion || 'Unknown'}</span>
                </div>
                <div class="range-item">
                  <span class="range-label">Maximum Version:</span>
                  <span class="range-value mono">{results.maxVersion || 'Unknown'}</span>
                </div>
              </div>
            </div>
          {/if}
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
            <strong>TLS Versions Probe Failed</strong>
            <p>{error}</p>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Educational Content -->
  <div class="card info-card">
    <div class="card-header">
      <h3>Understanding TLS Versions</h3>
    </div>
    <div class="card-content">
      <div class="info-grid">
        <div class="info-section">
          <h4>TLS Version Security</h4>
          <ul>
            <li><strong>TLS 1.3:</strong> Latest version with improved security and performance</li>
            <li><strong>TLS 1.2:</strong> Widely supported, secure when properly configured</li>
            <li><strong>TLS 1.1:</strong> Deprecated, should not be used</li>
            <li><strong>TLS 1.0:</strong> Deprecated, contains security vulnerabilities</li>
          </ul>
        </div>

        <div class="info-section">
          <h4>Best Practices</h4>
          <ul>
            <li>Enable TLS 1.2 and 1.3 only</li>
            <li>Disable deprecated versions (TLS 1.0, 1.1)</li>
            <li>Regularly update TLS implementations</li>
            <li>Use strong cipher suites</li>
          </ul>
        </div>

        <div class="info-section">
          <h4>Compliance Requirements</h4>
          <p>
            Many compliance standards (PCI DSS, HIPAA) require disabling deprecated TLS versions. Check your specific
            requirements.
          </p>
        </div>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .security-overview {
    margin-bottom: var(--spacing-lg);
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

  .versions-section {
    margin-bottom: var(--spacing-lg);

    h4 {
      color: var(--text-primary);
      margin: 0 0 var(--spacing-md) 0;
      border-bottom: 1px solid var(--border-primary);
      padding-bottom: var(--spacing-xs);
    }
  }

  .versions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-md);
  }

  .version-item {
    border: 2px solid;
    border-radius: var(--radius-md);
    padding: var(--spacing-md);

    &.success {
      border-color: var(--color-success);
      background: color-mix(in srgb, var(--color-success), transparent 95%);
    }

    &.warning {
      border-color: var(--color-warning);
      background: color-mix(in srgb, var(--color-warning), transparent 95%);
    }

    &.error {
      border-color: var(--color-error);
      background: color-mix(in srgb, var(--color-error), transparent 95%);
    }
  }

  .version-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-xs);
  }

  .version-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);

    div {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
  }

  .version-name {
    font-weight: 600;
    color: var(--text-primary);
  }

  .version-code {
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
  }

  .version-status {
    font-size: var(--font-size-sm);
    font-weight: 500;
    color: var(--text-primary);
  }

  .version-error {
    margin-top: var(--spacing-xs);
    padding: var(--spacing-xs);
    background: color-mix(in srgb, var(--color-error), transparent 90%);
    border-radius: var(--radius-xs);
    border-left: 3px solid var(--color-error);
  }

  .error-detail {
    font-size: var(--font-size-xs);
    color: var(--text-primary);
    font-family: var(--font-mono);
  }

  .version-warning {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    margin-top: var(--spacing-xs);
    padding: var(--spacing-xs);
    background: color-mix(in srgb, var(--color-warning), transparent 90%);
    border-radius: var(--radius-xs);
    font-size: var(--font-size-xs);
    color: var(--text-primary);
  }

  .range-section {
    margin-bottom: var(--spacing-lg);

    h4 {
      color: var(--text-primary);
      margin: 0 0 var(--spacing-md) 0;
      border-bottom: 1px solid var(--border-primary);
      padding-bottom: var(--spacing-xs);
    }
  }

  .range-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-md);
  }

  .range-item {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    padding: var(--spacing-md);
    background: var(--bg-secondary);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-primary);
  }

  .range-label {
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    font-weight: 500;
  }

  .range-value {
    color: var(--text-primary);
    font-weight: 600;
  }

  .error-text {
    color: var(--color-error);
    font-size: var(--font-size-xs);
    margin-top: var(--spacing-xs);
  }

  .mono {
    font-family: var(--font-mono);
  }
</style>
