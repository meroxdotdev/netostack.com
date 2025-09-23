<script lang="ts">
  import { tooltip } from '$lib/actions/tooltip.js';
  import Icon from '$lib/components/global/Icon.svelte';
  import '../../../../styles/diagnostics-pages.scss';

  let targets = $state('google.com:443\ngithub.com:443\nstackoverflow.com:443');
  let timeout = $state(5000);
  let loading = $state(false);
  let results = $state<any>(null);
  let error = $state<string | null>(null);
  let copiedState = $state(false);
  let selectedExampleIndex = $state<number | null>(null);

  const examples = [
    {
      targets: 'google.com:443\ngithub.com:443\nstackoverflow.com:443',
      description: 'Common HTTPS ports',
    },
    {
      targets: 'smtp.gmail.com:587\nsmtp.gmail.com:465\nsmtp.gmail.com:25',
      description: 'Gmail SMTP ports',
    },
    {
      targets: 'dns.google:53\n1.1.1.1:53\n8.8.8.8:53',
      description: 'DNS server ports',
    },
    {
      targets: 'reddit.com:80\nreddit.com:443\napi.reddit.com:443',
      description: 'HTTP vs HTTPS ports',
    },
    {
      targets: 'localhost:22\nlocalhost:80\nlocalhost:443\nlocalhost:3306\nlocalhost:5432',
      description: 'Local development ports',
    },
    {
      targets: 'microsoft.com:443\noffice.com:443\noutlook.com:443',
      description: 'Microsoft services',
    },
  ];

  const commonPorts = [
    { port: '22', service: 'SSH', description: 'Secure Shell' },
    { port: '80', service: 'HTTP', description: 'Web traffic' },
    { port: '443', service: 'HTTPS', description: 'Secure web traffic' },
    { port: '25', service: 'SMTP', description: 'Email sending' },
    { port: '587', service: 'SMTP', description: 'Email submission' },
    { port: '993', service: 'IMAPS', description: 'Secure IMAP' },
    { port: '995', service: 'POP3S', description: 'Secure POP3' },
    { port: '53', service: 'DNS', description: 'Domain resolution' },
  ];

  // Reactive validation
  const targetsList = $derived(() => {
    return targets
      .split('\n')
      .map((t) => t.trim())
      .filter((t) => t)
      .slice(0, 50); // Limit to 50 targets
  });

  const isInputValid = $derived(() => {
    return targetsList().length > 0 && targetsList().every((target: string) => /^[a-zA-Z0-9.-]+:\d+$/.test(target));
  });

  async function checkPorts() {
    loading = true;
    error = null;
    results = null;

    // Calculate targets list at function call time
    const currentTargets = targets
      .split('\n')
      .map((t) => t.trim())
      .filter((t) => t)
      .slice(0, 50);

    try {
      const response = await fetch('/api/internal/diagnostics/network', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'tcp-port-check',
          targets: currentTargets,
          timeout,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || `Port check failed (${response.status})`);
        } catch {
          // If JSON parsing fails, use the raw error text or status
          throw new Error(errorText || `Port check failed (${response.status})`);
        }
      }

      results = await response.json();
    } catch (err: unknown) {
      error = (err as Error).message;
    } finally {
      loading = false;
    }
  }

  function loadExample(example: (typeof examples)[0], index: number) {
    targets = example.targets;
    timeout = 5000;
    selectedExampleIndex = index;
    checkPorts();
  }

  function clearExampleSelection() {
    selectedExampleIndex = null;
  }

  function addCommonPort(port: string) {
    const currentTargets = targets.trim();
    const newTarget = `example.com:${port}`;
    targets = currentTargets ? `${currentTargets}\n${newTarget}` : newTarget;
    clearExampleSelection();
  }

  function getPortStatus(result: { open: boolean; latency?: number; error?: string }): {
    icon: string;
    class: string;
    text: string;
  } {
    if (result.open) {
      return {
        icon: 'check-circle',
        class: 'success',
        text: `Open (${result.latency}ms)`,
      };
    } else {
      return {
        icon: 'x-circle',
        class: 'error',
        text: result.error || 'Closed',
      };
    }
  }

  async function copyResults() {
    if (!results) return;

    let text = `TCP Port Check Results\n`;
    text += `Generated at: ${new Date().toISOString()}\n\n`;
    text += `Summary:\n`;
    text += `  Total ports: ${results.summary.total}\n`;
    text += `  Open: ${results.summary.open}\n`;
    text += `  Closed: ${results.summary.closed}\n`;
    if (results.summary.avgLatency) {
      text += `  Average latency: ${results.summary.avgLatency}ms\n`;
    }
    text += `\nResults:\n`;

    (
      results as { results: Array<{ host: string; port: number; open: boolean; latency?: number; error?: string }> }
    ).results.forEach((result) => {
      const status = result.open ? `OPEN (${result.latency}ms)` : `CLOSED${result.error ? ` - ${result.error}` : ''}`;
      text += `  ${result.host}:${result.port} - ${status}\n`;
    });

    await navigator.clipboard.writeText(text);
    copiedState = true;
    setTimeout(() => (copiedState = false), 1500);
  }
</script>

<div class="card">
  <header class="card-header">
    <h1>TCP Port Checker</h1>
    <p>
      Test TCP connectivity to one or more host:port combinations. Attempts direct TCP connections to check if ports are
      open and measures connection latency.
    </p>
  </header>

  <!-- Examples -->
  <div class="card examples-card">
    <details class="examples-details">
      <summary class="examples-summary">
        <Icon name="chevron-right" size="xs" />
        <h4>Port Check Examples</h4>
      </summary>
      <div class="examples-grid">
        {#each examples as example, i (i)}
          <button
            class="example-card"
            class:selected={selectedExampleIndex === i}
            onclick={() => loadExample(example, i)}
            use:tooltip={`Test ports: ${example.targets.split('\n').join(', ')}`}
          >
            <h5>{example.description}</h5>
            <div class="example-targets">
              {#each example.targets.split('\n').slice(0, 3) as target, index (index)}
                <span class="target-item mono">{target}</span>
              {/each}
              {#if example.targets.split('\n').length > 3}
                <span class="more-targets">+{example.targets.split('\n').length - 3} more</span>
              {/if}
            </div>
          </button>
        {/each}
      </div>
    </details>
  </div>

  <!-- Input Form -->
  <div class="card input-card">
    <div class="card-header">
      <h3>Port Check Configuration</h3>
    </div>
    <div class="card-content">
      <div class="form-row">
        <div class="form-group">
          <label for="targets" use:tooltip={'Enter host:port combinations, one per line (max 50)'}>
            Target Hosts & Ports
            <textarea
              id="targets"
              bind:value={targets}
              placeholder="google.com:443&#10;github.com:22&#10;example.com:80"
              rows="6"
              class:invalid={targets && !isInputValid()}
              onchange={() => {
                clearExampleSelection();
                if (isInputValid()) checkPorts();
              }}
            ></textarea>
            <div class="input-help">
              <span class="target-count">{targetsList.length}/50 targets</span>
              {#if targets && !isInputValid}
                <span class="error-text">Use format: hostname:port (one per line)</span>
              {/if}
            </div>
          </label>
        </div>
      </div>

      <!-- Common Ports -->
      <div class="form-row">
        <div class="form-group">
          <h3>Common Ports</h3>
          <div class="port-shortcuts">
            {#each commonPorts as port, index (index)}
              <button
                type="button"
                class="port-btn"
                onclick={() => addCommonPort(port.port)}
                use:tooltip={`${port.service}: ${port.description}`}
              >
                {port.port} ({port.service})
              </button>
            {/each}
          </div>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="timeout" use:tooltip={'Connection timeout in milliseconds'}>
            Timeout (ms)
            <input
              id="timeout"
              type="number"
              bind:value={timeout}
              min="1000"
              max="30000"
              step="1000"
              onchange={() => {
                clearExampleSelection();
                if (isInputValid()) checkPorts();
              }}
            />
          </label>
        </div>
      </div>

      <div class="action-section">
        <button class="lookup-btn" onclick={checkPorts} disabled={loading || !isInputValid}>
          {#if loading}
            <Icon name="loader-2" size="sm" animate="spin" />
            Checking Ports...
          {:else}
            <Icon name="activity" size="sm" />
            Check Ports
          {/if}
        </button>
      </div>
    </div>
  </div>

  <!-- Results -->
  {#if results}
    <div class="card results-card">
      <div class="card-header row">
        <h3>Port Check Results</h3>
        <button class="copy-btn" onclick={copyResults} disabled={copiedState}>
          <Icon name={copiedState ? 'check' : 'copy'} size="xs" />
          {copiedState ? 'Copied!' : 'Copy Results'}
        </button>
      </div>
      <div class="card-content">
        <!-- Summary -->
        <div class="status-overview">
          <div class="status-item success">
            <Icon name="check-circle" size="sm" />
            <div>
              <span class="status-title">{results.summary.open} Open</span>
              <p class="status-desc">Ports accepting connections</p>
            </div>
          </div>
          <div class="status-item error">
            <Icon name="x-circle" size="sm" />
            <div>
              <span class="status-title">{results.summary.closed} Closed</span>
              <p class="status-desc">Ports not responding</p>
            </div>
          </div>
          {#if results.summary.avgLatency}
            <div class="status-item">
              <Icon name="zap" size="sm" />
              <div>
                <span class="status-title">{results.summary.avgLatency}ms</span>
                <p class="status-desc">Average latency</p>
              </div>
            </div>
          {/if}
        </div>

        <!-- Detailed Results -->
        <div class="ports-section">
          <h4>Port Status ({results.results.length} targets)</h4>
          <div class="ports-list">
            {#each results.results as result, index (index)}
              {@const status = getPortStatus(result)}
              <div class="port-result {status.class}">
                <div class="port-header">
                  <div class="port-target">
                    <Icon name={status.icon} size="sm" />
                    <span class="host-port mono">{result.host}:{result.port}</span>
                  </div>
                  <span class="port-status">{status.text}</span>
                </div>
                {#if result.error && !result.open}
                  <div class="port-error">
                    <span class="error-detail">{result.error}</span>
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
            <strong>Port Check Failed</strong>
            <p>{error}</p>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Educational Content -->
  <div class="card info-card">
    <div class="card-header">
      <h3>Understanding TCP Port Connectivity</h3>
    </div>
    <div class="card-content">
      <div class="info-grid">
        <div class="info-section">
          <h4>Port States</h4>
          <ul>
            <li><strong>Open:</strong> Port accepts connections and responds</li>
            <li><strong>Closed:</strong> Port actively refuses connections</li>
            <li><strong>Filtered:</strong> Port blocked by firewall (appears as timeout)</li>
            <li><strong>Timeout:</strong> No response within timeout period</li>
          </ul>
        </div>

        <div class="info-section">
          <h4>Common Ports</h4>
          <ul>
            <li><strong>SSH (22):</strong> Secure remote access</li>
            <li><strong>HTTP (80):</strong> Web traffic</li>
            <li><strong>HTTPS (443):</strong> Secure web traffic</li>
            <li><strong>SMTP (25/587):</strong> Email sending</li>
          </ul>
        </div>

        <div class="info-section">
          <h4>Troubleshooting Tips</h4>
          <ul>
            <li>Timeouts often indicate firewall blocking</li>
            <li>Connection refused means service is not running</li>
            <li>Check both client and server firewalls</li>
            <li>Verify service is listening on expected port</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .example-targets {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-top: var(--spacing-xs);
  }

  .target-item {
    background: var(--bg-tertiary);
    padding: 2px var(--spacing-xs);
    border-radius: var(--radius-xs);
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
  }

  .more-targets {
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    font-style: italic;
  }

  .input-help {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: var(--spacing-xs);
  }

  .target-count {
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
  }

  .port-shortcuts {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
    margin-top: var(--spacing-xs);
  }

  .port-btn {
    font-size: var(--font-size-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
    background: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-sm);
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

  .ports-section {
    margin: var(--spacing-lg) 0;

    h4 {
      color: var(--text-primary);
      margin: 0 0 var(--spacing-md) 0;
      border-bottom: 1px solid var(--border-primary);
      padding-bottom: var(--spacing-xs);
    }
  }

  .ports-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .port-result {
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-sm);
    padding: var(--spacing-md);

    &.success {
      border-left: 4px solid var(--color-success);
      background: color-mix(in srgb, var(--color-success), transparent 97%);
    }

    &.error {
      border-left: 4px solid var(--color-error);
      background: color-mix(in srgb, var(--color-error), transparent 97%);
    }
  }

  .port-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-xs);
  }

  .port-target {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .host-port {
    font-weight: 600;
    color: var(--text-primary);
  }

  .port-status {
    font-size: var(--font-size-sm);
    font-weight: 500;
    color: var(--text-primary);
  }

  .port-error {
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

  .mono {
    font-family: var(--font-mono);
  }

  textarea {
    resize: vertical;
    min-height: 120px;
  }
</style>
