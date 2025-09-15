<script lang="ts">
  import { tooltip } from '$lib/actions/tooltip.js';
  import Icon from '$lib/components/global/Icon.svelte';
  
  let listA = $state(`192.168.0.0/16
10.0.0.0/8
172.16.0.0/12`);
  let listB = $state(`192.168.0.0/16
10.0.0.0/8
192.168.100.0/24
172.16.5.0/24`);
  let result = $state<{
    success: boolean;
    error?: string;
    added: string[];
    removed: string[];
    unchanged: string[];
    normalizedA: string[];
    normalizedB: string[];
    summary: {
      totalA: number;
      totalB: number;
      addedCount: number;
      removedCount: number;
      unchangedCount: number;
    };
  } | null>(null);
  let copiedStates = $state<Record<string, boolean>>({});
  let selectedExample = $state<string | null>(null);
  let userModified = $state(false);

  const examples = [
    {
      label: 'Network Addition',
      listA: `192.168.1.0/24
10.0.0.0/16`,
      listB: `192.168.1.0/24
10.0.0.0/16
172.16.0.0/24`,
      description: 'Added 172.16.0.0/24'
    },
    {
      label: 'Network Removal',
      listA: `192.168.0.0/16
10.0.0.0/8
172.16.0.0/12`,
      listB: `192.168.0.0/16
10.0.0.0/8`,
      description: 'Removed 172.16.0.0/12'
    },
    {
      label: 'Mixed Changes',
      listA: `192.168.1.0/24
10.0.0.0/16
172.16.1.0/24`,
      listB: `192.168.1.0/24
10.0.1.0/24
172.16.2.0/24`,
      description: 'Swapped subnets'
    }
  ];

  function loadExample(example: typeof examples[0]) {
    listA = example.listA;
    listB = example.listB;
    selectedExample = example.label;
    userModified = false;
    performComparison();
  }

  function parseIP(ip: string): number {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
  }

  function ipToString(ip: number): string {
    return [
      (ip >>> 24) & 0xff,
      (ip >>> 16) & 0xff,
      (ip >>> 8) & 0xff,
      ip & 0xff
    ].join('.');
  }

  function normalizeCIDR(cidr: string): string {
    if (!cidr.includes('/')) {
      // Single IP, convert to /32
      return `${cidr}/32`;
    }

    const [ipStr, prefixStr] = cidr.split('/');
    const prefixLength = parseInt(prefixStr);
    
    if (prefixLength < 0 || prefixLength > 32) {
      throw new Error(`Invalid prefix length: /${prefixLength}`);
    }

    // Calculate network address
    const ip = parseIP(ipStr);
    const mask = 0xffffffff << (32 - prefixLength);
    const networkAddress = ip & mask;

    return `${ipToString(networkAddress)}/${prefixLength}`;
  }

  function parseAndNormalizeList(input: string): string[] {
    if (!input.trim()) return [];

    const lines = input.trim().split('\n').filter(line => line.trim());
    const normalized = new Set<string>();

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      try {
        if (trimmed.includes('-')) {
          // IP range - convert to CIDR blocks
          const [startStr, endStr] = trimmed.split('-').map(s => s.trim());
          const startIP = parseIP(startStr);
          const endIP = parseIP(endStr);
          
          if (startIP > endIP) {
            throw new Error(`Invalid range: start IP is greater than end IP in ${trimmed}`);
          }

          // Convert range to CIDR blocks (simplified - assumes aligned blocks)
          let current = startIP;
          while (current <= endIP) {
            // Find the largest CIDR block that fits
            let prefixLength = 32;
            let blockSize = 1;
            
            // Find largest power of 2 that fits
            for (let p = 0; p <= 32; p++) {
              const size = Math.pow(2, 32 - p);
              if (current % size === 0 && current + size - 1 <= endIP) {
                prefixLength = p;
                blockSize = size;
              } else {
                break;
              }
            }
            
            normalized.add(`${ipToString(current)}/${prefixLength}`);
            current += blockSize;
          }
        } else if (trimmed.match(/^\d+\.\d+\.\d+\.\d+(\/\d+)?$/)) {
          // CIDR or single IP
          normalized.add(normalizeCIDR(trimmed));
        } else {
          throw new Error(`Invalid format: ${trimmed}`);
        }
      } catch (error) {
        throw new Error(`Error processing "${trimmed}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Sort by network address
    return Array.from(normalized).sort((a, b) => {
      const aNetwork = parseIP(a.split('/')[0]);
      const bNetwork = parseIP(b.split('/')[0]);
      if (aNetwork !== bNetwork) {
        return aNetwork - bNetwork;
      }
      // If same network, sort by prefix length (more specific first)
      const aPrefix = parseInt(a.split('/')[1]);
      const bPrefix = parseInt(b.split('/')[1]);
      return bPrefix - aPrefix;
    });
  }

  function performComparison() {
    try {
      const normalizedA = parseAndNormalizeList(listA);
      const normalizedB = parseAndNormalizeList(listB);

      const setA = new Set(normalizedA);
      const setB = new Set(normalizedB);

      const added = normalizedB.filter(item => !setA.has(item));
      const removed = normalizedA.filter(item => !setB.has(item));
      const unchanged = normalizedA.filter(item => setB.has(item));

      result = {
        success: true,
        added: added,
        removed: removed,
        unchanged: unchanged,
        normalizedA: normalizedA,
        normalizedB: normalizedB,
        summary: {
          totalA: normalizedA.length,
          totalB: normalizedB.length,
          addedCount: added.length,
          removedCount: removed.length,
          unchangedCount: unchanged.length
        }
      };
    } catch (error) {
      result = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        added: [],
        removed: [],
        unchanged: [],
        normalizedA: [],
        normalizedB: [],
        summary: {
          totalA: 0,
          totalB: 0,
          addedCount: 0,
          removedCount: 0,
          unchangedCount: 0
        }
      };
    }
  }

  function handleInputChange() {
    userModified = true;
    selectedExample = null;
    performComparison();
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

  async function copyCategory(items: string[], category: string) {
    if (!items.length) return;
    
    const text = items.join('\n');
    await copyToClipboard(text, `category-${category}`);
  }

  function swapLists() {
    const temp = listA;
    listA = listB;
    listB = temp;
    userModified = true;
    selectedExample = null;
    performComparison();
  }

  // Calculate on component load
  performComparison();
</script>

<div class="card">
  <header class="card-header">
    <h2>CIDR Compare</h2>
    <p>Compare two lists of networks to identify changes for auditing</p>
  </header>

  <!-- Examples -->
  <section class="examples-section">
    <h4>Quick Examples</h4>
    <div class="examples-grid">
      {#each examples as example}
        <button
          class="example-card {selectedExample === example.label ? 'active' : ''}"
          onclick={() => loadExample(example)}
        >
          <div class="example-label">{example.label}</div>
          <div class="example-preview">{example.description}</div>
        </button>
      {/each}
    </div>
  </section>

  <!-- Input Section -->
  <section class="input-section">
    <div class="input-header">
      <h3>Network Lists</h3>
      <button
        class="swap-button"
        onclick={swapLists}
        use:tooltip={"Swap List A and List B"}
      >
        <Icon name="swap" size="sm" />
        Swap
      </button>
    </div>

    <div class="input-grid">
      <div class="input-group">
        <label 
          for="list-a"
          use:tooltip="{"Original or 'before' state - CIDR blocks, IP ranges, or individual IPs"}"
        >
          <Icon name="list" size="sm" />
          List A (Before)
        </label>
        <textarea
          id="list-a"
          bind:value={listA}
          oninput={handleInputChange}
          placeholder="192.168.0.0/16&#10;10.0.0.0/8&#10;172.16.1.0-172.16.1.255"
          rows="8"
        ></textarea>
      </div>

      <div class="input-group">
        <label 
          for="list-b"
          use:tooltip="{"Updated or 'after' state - CIDR blocks, IP ranges, or individual IPs"}"
        >
          <Icon name="list-check" size="sm" />
          List B (After)
        </label>
        <textarea
          id="list-b"
          bind:value={listB}
          oninput={handleInputChange}
          placeholder="192.168.0.0/16&#10;10.0.0.0/8&#10;192.168.100.0/24"
          rows="8"
        ></textarea>
      </div>
    </div>
  </section>

  <!-- Results Section -->
  {#if result}
    <section class="results-section">
      {#if result.success}
        <!-- Summary -->
        <div class="comparison-summary">
          <h3>Comparison Summary</h3>
          <div class="summary-grid">
            <div class="summary-card">
              <div class="summary-icon added">
                <Icon name="plus-circle" />
              </div>
              <div class="summary-content">
                <div class="summary-number">{result.summary.addedCount}</div>
                <div class="summary-label">Added</div>
              </div>
            </div>
            
            <div class="summary-card">
              <div class="summary-icon removed">
                <Icon name="minus-circle" />
              </div>
              <div class="summary-content">
                <div class="summary-number">{result.summary.removedCount}</div>
                <div class="summary-label">Removed</div>
              </div>
            </div>
            
            <div class="summary-card">
              <div class="summary-icon unchanged">
                <Icon name="check-circle" />
              </div>
              <div class="summary-content">
                <div class="summary-number">{result.summary.unchangedCount}</div>
                <div class="summary-label">Unchanged</div>
              </div>
            </div>
          </div>
          
          <div class="list-totals">
            <span class="total-item">
              List A: {result.summary.totalA} items
            </span>
            <span class="total-item">
              List B: {result.summary.totalB} items
            </span>
          </div>
        </div>

        <!-- Changes Categories -->
        <div class="changes-grid">
          <!-- Added -->
          <div class="change-category added">
            <div class="category-header">
              <h4>
                <Icon name="plus-circle" size="sm" />
                Added Networks ({result.added.length})
              </h4>
              {#if result.added.length > 0}
                <button
                  class="copy-category {copiedStates['category-added'] ? 'copied' : ''}"
                  onclick={() => result && copyCategory(result.added, 'added')}
                >
                  <Icon name={copiedStates['category-added'] ? 'check-circle' : 'copy'} size="xs" />
                </button>
              {/if}
            </div>
            
            {#if result.added.length > 0}
              <div class="networks-list">
                {#each result.added as network}
                  <div class="network-item added">
                    <code class="network-cidr">{network}</code>
                    <button
                      class="copy-button {copiedStates[`added-${network}`] ? 'copied' : ''}"
                      onclick={() => copyToClipboard(network, `added-${network}`)}
                    >
                      <Icon name={copiedStates[`added-${network}`] ? 'check-circle' : 'copy'} size="xs" />
                    </button>
                  </div>
                {/each}
              </div>
            {:else}
              <div class="empty-category">
                <Icon name="check" />
                <span>No networks added</span>
              </div>
            {/if}
          </div>

          <!-- Removed -->
          <div class="change-category removed">
            <div class="category-header">
              <h4>
                <Icon name="minus-circle" size="sm" />
                Removed Networks ({result.removed.length})
              </h4>
              {#if result.removed.length > 0}
                <button
                  class="copy-category {copiedStates['category-removed'] ? 'copied' : ''}"
                  onclick={() => result && copyCategory(result.removed, 'removed')}
                >
                  <Icon name={copiedStates['category-removed'] ? '192.168.0.0/16' : 'copy'} size="xs" />
                </button>
              {/if}
            </div>
            
            {#if result.removed.length > 0}
              <div class="networks-list">
                {#each result.removed as network}
                  <div class="network-item removed">
                    <code class="network-cidr">{network}</code>
                    <button
                      class="copy-button {copiedStates[`removed-${network}`] ? 'copied' : ''}"
                      onclick={() => copyToClipboard(network, `removed-${network}`)}
                    >
                      <Icon name={copiedStates[`removed-${network}`] ? 'check-circle' : 'copy'} size="xs" />
                    </button>
                  </div>
                {/each}
              </div>
            {:else}
              <div class="empty-category">
                <Icon name="check" />
                <span>No networks removed</span>
              </div>
            {/if}
          </div>

          <!-- Unchanged -->
          <div class="change-category unchanged">
            <div class="category-header">
              <h4>
                <Icon name="check-circle" size="sm" />
                Unchanged Networks ({result.unchanged.length})
              </h4>
              {#if result.unchanged.length > 0}
                <button
                  class="copy-category {copiedStates['category-unchanged'] ? 'copied' : ''}"
                  onclick={() => copyCategory(result?.unchanged || [], 'unchanged')}
                >
                  <Icon name={copiedStates['category-unchanged'] ? 'check-circle' : 'copy'} size="xs" />
                </button>
              {/if}
            </div>
            
            {#if result.unchanged.length > 0}
              <div class="networks-list">
                {#each result.unchanged as network}
                  <div class="network-item unchanged">
                    <code class="network-cidr">{network}</code>
                    <button
                      class="copy-button {copiedStates[`unchanged-${network}`] ? 'copied' : ''}"
                      onclick={() => copyToClipboard(network, `unchanged-${network}`)}
                    >
                      <Icon name={copiedStates[`unchanged-${network}`] ? 'check-circle' : 'copy'} size="xs" />
                    </button>
                  </div>
                {/each}
              </div>
            {:else}
              <div class="empty-category">
                <Icon name="alert-circle" />
                <span>No networks remained unchanged</span>
              </div>
            {/if}
          </div>
        </div>

      {:else}
        <div class="error-message">
          <Icon name="alert-triangle" />
          <h4>Comparison Error</h4>
          <p>{result.error || 'Unknown error occurred'}</p>
        </div>
      {/if}
    </section>
  {/if}
</div>

<style lang="scss">
  .examples-section {
    margin-bottom: var(--spacing-lg);
    
    h4 {
      margin-bottom: var(--spacing-md);
      color: var(--color-info-light);
    }
  }

  .examples-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-sm);
  }

  .example-card {
    padding: var(--spacing-sm);
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-fast);
    text-align: left;

    &:hover {
      background-color: var(--surface-hover);
      border-color: var(--color-primary);
    }

    &.active {
      background-color: var(--surface-hover);
      border-color: var(--color-primary);
      box-shadow: var(--shadow-sm);
    }
  }

  .example-label {
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-xs);
  }

  .example-preview {
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
  }

  .input-section {
    margin-bottom: var(--spacing-lg);
  }

  .input-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);

    h3 {
      margin: 0;
      color: var(--text-primary);
    }
  }

  .swap-button {
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
  }

  .input-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-md);
  }

  .input-group label {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-sm);
    font-weight: 600;
    color: var(--text-primary);
  }

  .results-section {
    border-top: 1px solid var(--border-secondary);
    padding-top: var(--spacing-lg);
  }

  .comparison-summary {
    margin-bottom: var(--spacing-xl);

    h3 {
      color: var(--color-info-light);
      margin-bottom: var(--spacing-md);
    }
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-md);
  }

  .summary-card {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    padding: var(--spacing-md);
  }

  .summary-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;

    &.added {
      background-color: var(--color-success);
      color: var(--bg-primary);
    }

    &.removed {
      background-color: var(--color-error);
      color: var(--bg-primary);
    }

    &.unchanged {
      background-color: var(--color-info);
      color: var(--bg-primary);
    }
  }

  .summary-content {
    flex: 1;
  }

  .summary-number {
    font-size: var(--font-size-xl);
    font-weight: 700;
    color: var(--text-primary);
  }

  .summary-label {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
  }

  .list-totals {
    display: flex;
    justify-content: center;
    gap: var(--spacing-lg);
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--border-secondary);
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
  }

  .changes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-lg);
  }

  .change-category {
    background-color: var(--bg-secondary);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);

    &.added {
      border: 1px solid var(--color-success);
    }

    &.removed {
      border: 1px solid var(--color-error);
    }

    &.unchanged {
      border: 1px solid var(--color-info);
    }
  }

  .category-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);

    h4 {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      margin: 0;
      color: var(--text-primary);
    }
  }

  .copy-category {
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

  .networks-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .network-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm);
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);

    &.added {
      background-color: var(--color-success);
      color: var(--bg-primary);
      
      .network-cidr {
        background-color: rgba(255, 255, 255, 0.1);
      }
    }

    &.removed {
      background-color: var(--color-error);
      color: var(--bg-primary);
      
      .network-cidr {
        background-color: rgba(255, 255, 255, 0.1);
      }
    }

    &.unchanged {
      background-color: var(--bg-tertiary);
      border: 1px solid var(--border-secondary);
    }

    &:hover {
      transform: translateX(2px);
    }
  }

  .network-cidr {
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
    font-weight: 600;
    padding: 2px var(--spacing-xs);
    border-radius: var(--radius-sm);
    background-color: var(--bg-tertiary);
  }

  .copy-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: var(--spacing-xs);
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
    color: inherit;
    opacity: 0.7;

    &:hover {
      opacity: 1;
      background-color: rgba(255, 255, 255, 0.1);
    }

    &.copied {
      opacity: 1;
    }
  }

  .empty-category {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-md);
    color: var(--text-secondary);
    font-style: italic;
    justify-content: center;
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

    .examples-grid {
      grid-template-columns: 1fr;
    }

    .summary-grid {
      grid-template-columns: 1fr;
    }

    .changes-grid {
      grid-template-columns: 1fr;
    }

    .list-totals {
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .input-header {
      flex-direction: column;
      gap: var(--spacing-sm);
      align-items: stretch;
    }
  }
</style>
