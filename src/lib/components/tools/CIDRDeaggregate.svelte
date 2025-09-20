<script lang="ts">
  import { tooltip } from '$lib/actions/tooltip.js';
  import Icon from '$lib/components/global/Icon.svelte';
  import { SvelteSet } from 'svelte/reactivity';
  import '../../../styles/diagnostics-pages.scss';

  let input = $state(`192.168.0.0/22
10.0.0.0-10.0.0.255`);
  let targetPrefix = $state(24);
  let result = $state<{
    success: boolean;
    error?: string;
    subnets: string[];
    totalSubnets: number;
    totalAddresses: number;
    inputSummary: {
      totalInputs: number;
      totalInputAddresses: number;
    };
  } | null>(null);
  let copiedStates = $state<Record<string, boolean>>({});
  let _selectedExample = $state<string | null>(null);
  let selectedExampleIndex = $state<number | null>(null);
  let _userModified = $state(false);

  const examples = [
    {
      label: 'Break /22 into /24s',
      input: '192.168.0.0/22',
      targetPrefix: 24,
    },
    {
      label: 'Decompose Range to /28s',
      input: '10.0.0.0-10.0.0.255',
      targetPrefix: 28,
    },
    {
      label: 'Multiple Blocks to /26s',
      input: `172.16.0.0/24
172.16.2.0/25`,
      targetPrefix: 26,
    },
    {
      label: 'Enterprise Campus to /25s',
      input: `10.10.0.0/16
10.20.0.0/17`,
      targetPrefix: 25,
    },
    {
      label: 'Data Center Racks to /29s',
      input: `192.168.100.0/24
192.168.101.0-192.168.101.127`,
      targetPrefix: 29,
    },
    {
      label: 'Service Provider to /30s',
      input: `203.0.113.0/26
198.51.100.64/27
198.51.100.96/28`,
      targetPrefix: 30,
    },
  ];

  function loadExample(example: (typeof examples)[0], index: number) {
    input = example.input;
    targetPrefix = example.targetPrefix;
    _selectedExample = example.label;
    selectedExampleIndex = index;
    _userModified = false;
    performDeaggregation();
  }

  function parseIP(ip: string): number {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
  }

  function ipToString(ip: number): string {
    return [(ip >>> 24) & 0xff, (ip >>> 16) & 0xff, (ip >>> 8) & 0xff, ip & 0xff].join('.');
  }

  function parseCIDR(cidr: string): { network: number; prefixLength: number; size: number } {
    const [networkStr, prefixStr] = cidr.split('/');
    const prefixLength = parseInt(prefixStr);
    const network = parseIP(networkStr) & (0xffffffff << (32 - prefixLength));
    const size = Math.pow(2, 32 - prefixLength);
    return { network, prefixLength, size };
  }

  function parseRange(range: string): { start: number; end: number } {
    const [startStr, endStr] = range.split('-');
    return {
      start: parseIP(startStr.trim()),
      end: parseIP(endStr.trim()),
    };
  }

  function deaggregateBlock(network: number, size: number, targetPrefix: number): string[] | { error: string } {
    const targetSize = Math.pow(2, 32 - targetPrefix);
    const subnets: string[] = [];

    if (targetSize > size) {
      // Target prefix is larger than the block, return the block as-is if it aligns
      const currentPrefix = 32 - Math.log2(size);
      if (Number.isInteger(currentPrefix) && network % size === 0) {
        subnets.push(`${ipToString(network)}/${currentPrefix}`);
      }
      return subnets;
    }

    // Calculate how many subnets this would generate
    const subnetCount = size / targetSize;

    // Safety limit to prevent browser crashes (max 10,000 subnets per block)
    if (subnetCount > 10000) {
      const sourcePrefix = 32 - Math.log2(size);
      return {
        error: `Block ${ipToString(network)}/${sourcePrefix} would generate ${subnetCount.toLocaleString()} subnets of /${targetPrefix}. This exceeds the safety limit of 10,000 subnets per block to prevent browser crashes.`,
      };
    }

    // Generate subnets of target size
    for (let addr = network; addr < network + size; addr += targetSize) {
      subnets.push(`${ipToString(addr)}/${targetPrefix}`);
    }

    return subnets;
  }

  function performDeaggregation() {
    try {
      if (!input.trim()) {
        result = null;
        return;
      }

      const lines = input
        .trim()
        .split('\n')
        .filter((line) => line.trim());
      const allSubnets: string[] = [];
      let totalInputAddresses = 0;
      const seenSubnets = new SvelteSet<string>();

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        let network: number;
        let size: number;

        if (trimmed.includes('/')) {
          // CIDR notation
          try {
            const parsed = parseCIDR(trimmed);
            network = parsed.network;
            size = parsed.size;
            totalInputAddresses += size;
          } catch {
            throw new Error(`Invalid CIDR: ${trimmed}`);
          }
        } else if (trimmed.includes('-')) {
          // IP range
          try {
            const { start, end } = parseRange(trimmed);
            if (start > end) {
              throw new Error(`Invalid range: start IP is greater than end IP in ${trimmed}`);
            }
            network = start;
            size = end - start + 1;
            totalInputAddresses += size;
          } catch {
            throw new Error(`Invalid range: ${trimmed}`);
          }
        } else if (trimmed.match(/^\d+\.\d+\.\d+\.\d+$/)) {
          // Single IP
          network = parseIP(trimmed);
          size = 1;
          totalInputAddresses += 1;
        } else {
          throw new Error(`Invalid input format: ${trimmed}`);
        }

        // Deaggregate this block
        const blockResult = deaggregateBlock(network, size, targetPrefix);

        // Check if it returned an error
        if ('error' in blockResult) {
          throw new Error(blockResult.error);
        }

        // Add unique subnets
        for (const subnet of blockResult) {
          if (!seenSubnets.has(subnet)) {
            seenSubnets.add(subnet);
            allSubnets.push(subnet);
          }
        }
      }

      // Overall safety check for total subnets
      if (allSubnets.length > 25000) {
        throw new Error(
          `Total would generate ${allSubnets.length.toLocaleString()} subnets. This exceeds the safety limit of 25,000 total subnets to prevent browser performance issues.`,
        );
      }

      // Sort subnets by network address
      allSubnets.sort((a, b) => {
        const aNet = parseIP(a.split('/')[0]);
        const bNet = parseIP(b.split('/')[0]);
        return aNet - bNet;
      });

      const targetSize = Math.pow(2, 32 - targetPrefix);
      const totalAddresses = allSubnets.length * targetSize;

      result = {
        success: true,
        subnets: allSubnets,
        totalSubnets: allSubnets.length,
        totalAddresses: totalAddresses,
        inputSummary: {
          totalInputs: lines.length,
          totalInputAddresses: totalInputAddresses,
        },
      };
    } catch (error) {
      result = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        subnets: [],
        totalSubnets: 0,
        totalAddresses: 0,
        inputSummary: {
          totalInputs: 0,
          totalInputAddresses: 0,
        },
      };
    }
  }

  function handleInputChange() {
    _userModified = true;
    _selectedExample = null;
    selectedExampleIndex = null;
    performDeaggregation();
  }

  async function copyToClipboard(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      copiedStates[id] = true;
      setTimeout(() => {
        copiedStates[id] = false;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }

  async function copyAllSubnets() {
    if (!result?.subnets.length) return;

    const allText = result.subnets.join('\n');
    await copyToClipboard(allText, 'all-subnets');
  }

  // Calculate on component load
  performDeaggregation();
</script>

<div class="card">
  <header class="card-header">
    <h2>CIDR Deaggregate</h2>
    <p>Decompose CIDR blocks and ranges into uniform target prefix subnets</p>
  </header>

  <!-- Examples -->
  <div class="card examples-card">
    <details class="examples-details">
      <summary class="examples-summary">
        <Icon name="chevron-right" size="xs" />
        <h4>Quick Examples</h4>
      </summary>
      <div class="examples-grid">
        {#each examples as example, i (example.label)}
          <button
            class="example-card"
            class:selected={selectedExampleIndex === i}
            onclick={() => loadExample(example, i)}
          >
            <div class="example-label">{example.label}</div>
            <div class="example-preview">
              Target: /{example.targetPrefix}
            </div>
          </button>
        {/each}
      </div>
    </details>
  </div>

  <!-- Input Section -->
  <section class="input-section">
    <div class="input-grid">
      <div class="input-group">
        <label for="input" use:tooltip={'Enter CIDR blocks, IP ranges, or individual IPs - one per line'}>
          Input Networks/Ranges
        </label>
        <textarea
          id="input"
          bind:value={input}
          oninput={handleInputChange}
          placeholder="192.168.0.0/22&#10;10.0.0.0-10.0.255.255&#10;172.16.1.1"
          rows="6"
          required
        ></textarea>
      </div>

      <div class="input-group">
        <label
          for="target-prefix"
          use:tooltip={'Target prefix length for uniform decomposition (e.g., 24 for /24 subnets)'}
        >
          Target Prefix Length
        </label>
        <div class="prefix-input-wrapper">
          <input
            id="target-prefix"
            type="number"
            bind:value={targetPrefix}
            oninput={handleInputChange}
            min="1"
            max="32"
            required
          />
          <span class="prefix-hint">/{targetPrefix}</span>
        </div>
        <div class="prefix-info">
          {#if targetPrefix}
            {@const addresses = Math.pow(2, 32 - targetPrefix)}
            Each /{targetPrefix} subnet = {addresses.toLocaleString()} addresses
          {/if}
        </div>
      </div>
    </div>
  </section>

  <!-- Results Section -->
  {#if result}
    <section class="results-section">
      {#if result.success}
        <div class="results-header">
          <h3 use:tooltip={'Generated uniform subnets from input networks and ranges'}>Deaggregated Subnets</h3>
          <div class="results-actions">
            <div class="results-summary">
              <span class="metric">
                <Icon name="network" size="sm" />
                {result.totalSubnets} subnets
              </span>
              <span class="metric">
                <Icon name="database" size="sm" />
                {result.totalAddresses.toLocaleString()} addresses
              </span>
            </div>
            {#if result.subnets.length > 0}
              <button class="copy-all-button {copiedStates['all-subnets'] ? 'copied' : ''}" onclick={copyAllSubnets}>
                <Icon name={copiedStates['all-subnets'] ? 'check' : 'copy'} size="sm" />
                {copiedStates['all-subnets'] ? 'Copied!' : 'Copy All'}
              </button>
            {/if}
          </div>
        </div>

        <!-- Input Summary -->
        <div class="input-summary">
          <div class="summary-item">
            <span class="summary-label" use:tooltip={'Original networks, ranges, and addresses provided'}>Input:</span>
            <span class="summary-value">
              {result.inputSummary.totalInputs} items, {result.inputSummary.totalInputAddresses.toLocaleString()} addresses
            </span>
          </div>
          <div class="summary-item">
            <span class="summary-label" use:tooltip={'Uniform subnets generated from input'}>Output:</span>
            <span class="summary-value">
              {result.totalSubnets} /{targetPrefix} subnets, {result.totalAddresses.toLocaleString()} addresses
            </span>
          </div>
          {#if result.totalAddresses !== result.inputSummary.totalInputAddresses}
            <div class="summary-item">
              <span class="summary-label" use:tooltip={'Address count difference due to subnet boundary alignment'}
                >Note:</span
              >
              <span class="summary-value address-diff">
                {result.totalAddresses > result.inputSummary.totalInputAddresses ? 'Expanded' : 'Reduced'} by {Math.abs(
                  result.totalAddresses - result.inputSummary.totalInputAddresses,
                ).toLocaleString()} addresses (due to alignment to /{targetPrefix} boundaries)
              </span>
            </div>
          {/if}
        </div>

        {#if result.subnets.length > 0}
          <div class="subnets-grid">
            {#each result.subnets as subnet, index (subnet)}
              {@const subnetSize = Math.pow(2, 32 - targetPrefix)}
              <div class="subnet-card">
                <div class="subnet-header">
                  <code class="subnet-cidr">{subnet}</code>
                  <button
                    class="copy-button {copiedStates[`subnet-${index}`] ? 'copied' : ''}"
                    onclick={() => copyToClipboard(subnet, `subnet-${index}`)}
                    aria-label="Copy CIDR block"
                  >
                    <Icon name={copiedStates[`subnet-${index}`] ? 'check' : 'copy'} size="xs" />
                  </button>
                </div>
                <div class="subnet-info">
                  <span class="address-count">
                    {subnetSize.toLocaleString()} addresses
                  </span>
                  {#if subnetSize >= 256}
                    <span class="subnet-size">
                      {subnetSize >= 65536
                        ? `${(subnetSize / 65536).toFixed(0)}×/16`
                        : subnetSize >= 256
                          ? `${(subnetSize / 256).toFixed(0)}×/24`
                          : ''}
                    </span>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="no-subnets">
            <Icon name="alert-circle" />
            <h4>No Subnets Generated</h4>
            <p>The target prefix length may be too large for the input networks, or the input is empty.</p>
          </div>
        {/if}
      {:else}
        <div class="error-message">
          <Icon name="alert-triangle" />
          <h4>Deaggregation Error</h4>
          <p>{result.error || 'Unknown error occurred'}</p>
        </div>
      {/if}
    </section>
  {/if}
</div>

<style lang="scss">
  .input-section {
    margin-bottom: var(--spacing-lg);
  }

  .input-grid {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: var(--spacing-md);
  }

  .prefix-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;

    input {
      padding-right: 3rem;
      width: 100%;
    }

    .prefix-hint {
      position: absolute;
      right: var(--spacing-md);
      color: var(--text-secondary);
      font-family: var(--font-mono);
      font-size: var(--font-size-sm);
      pointer-events: none;
    }
  }

  .prefix-info {
    margin-top: var(--spacing-xs);
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    font-family: var(--font-mono);
  }

  .results-section {
    border-top: 1px solid var(--border-secondary);
    padding-top: var(--spacing-lg);
  }

  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--spacing-lg);
    gap: var(--spacing-md);

    h3 {
      color: var(--color-success-light);
      margin: 0;
    }
  }

  .results-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--spacing-sm);
  }

  .results-summary {
    display: flex;
    gap: var(--spacing-md);
    flex-wrap: wrap;
  }

  .metric {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--font-size-sm);
    color: var(--text-secondary);

    :global(.icon) {
      color: var(--color-info);
    }
  }

  .copy-all-button {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-md);
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    color: var(--text-primary);
    cursor: pointer;
    transition: all var(--transition-fast);

    &:hover {
      background-color: var(--surface-hover);
      border-color: var(--color-primary);
    }

    &.copied {
      background-color: var(--color-success);
      color: var(--bg-primary);
      border-color: var(--color-success);
    }
  }

  .input-summary {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-secondary);
    border-radius: var(--radius-md);
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
  }

  .summary-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--spacing-xs);

    &:last-child {
      margin-bottom: 0;
    }
  }

  .summary-label {
    color: var(--text-secondary);
    font-weight: 600;
  }

  .summary-value {
    color: var(--text-primary);

    &.address-diff {
      color: var(--color-warning-light);
    }
  }

  .subnets-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--spacing-md);
  }

  .subnet-card {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    padding: var(--spacing-md);
    transition: all var(--transition-fast);

    &:hover {
      border-color: var(--color-primary);
      box-shadow: var(--shadow-sm);
    }
  }

  .subnet-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-sm);
  }

  .subnet-cidr {
    font-family: var(--font-mono);
    font-size: var(--font-size-md);
    font-weight: 600;
    color: var(--color-primary-light);
    background-color: var(--bg-tertiary);
    padding: var(--spacing-xs);
    border-radius: var(--radius-sm);
  }

  .copy-button {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: var(--spacing-xs);
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);

    &:hover {
      background-color: var(--surface-hover);
      color: var(--text-primary);
    }

    &.copied {
      color: var(--color-success);
    }
  }

  .subnet-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }

  .address-count {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    font-family: var(--font-mono);
  }

  .subnet-size {
    font-size: var(--font-size-xs);
    color: var(--color-info);
    font-family: var(--font-mono);
    background-color: var(--bg-tertiary);
    padding: 2px var(--spacing-xs);
    border-radius: var(--radius-sm);
  }

  .no-subnets {
    text-align: center;
    padding: var(--spacing-xl);
    color: var(--text-secondary);

    :global(.icon) {
      font-size: 2rem;
      color: var(--color-warning);
      margin-bottom: var(--spacing-md);
    }

    h4 {
      color: var(--text-primary);
      margin-bottom: var(--spacing-sm);
    }
  }

  .error-message {
    text-align: center;
    padding: var(--spacing-lg);
    background-color: var(--bg-secondary);
    border: 1px solid var(--color-error);
    border-radius: var(--radius-md);

    :global(.icon) {
      font-size: 1.5rem;
      color: var(--color-error);
      margin-bottom: var(--spacing-sm);
    }

    h4 {
      color: var(--color-error-light);
      margin-bottom: var(--spacing-sm);
    }
  }

  @media (max-width: 768px) {
    .input-grid {
      grid-template-columns: 1fr;
    }

    .subnets-grid {
      grid-template-columns: 1fr;
    }

    .results-header {
      flex-direction: column;
      align-items: stretch;
    }

    .results-actions {
      align-items: stretch;
    }

    .results-summary {
      justify-content: center;
    }
  }
</style>
