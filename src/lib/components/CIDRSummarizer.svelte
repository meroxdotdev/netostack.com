<script lang="ts">
  import { summarizeCIDRs, type SummarizationResult } from '$lib/utils/cidr-summarization-fixed.js';
  import Tooltip from './Tooltip.svelte';
  import Icon from './Icon.svelte';

  let inputText = $state(`192.168.1.1
192.168.1.0/24
10.0.0.5-10.0.0.13
2001:db8::1
2001:db8::/64`);
  let mode = $state<'exact-merge' | 'minimal-cover'>('exact-merge');
  let result = $state<SummarizationResult | null>(null);
  let copiedStates = $state<Record<string, boolean>>({});

  const modes = [
    {
      value: 'exact-merge' as const,
      label: 'Exact Merge',
      description: 'Merge overlapping ranges exactly without additional aggregation'
    },
    {
      value: 'minimal-cover' as const,
      label: 'Minimal Cover',
      description: 'Find the smallest set of CIDR blocks that covers all inputs'
    }
  ];

  const examples = [
    {
      label: 'Mixed IPv4/IPv6',
      content: `192.168.1.0/24
10.0.0.0/16
2001:db8::/32
::1`
    },
    {
      label: 'Overlapping Ranges',
      content: `192.168.1.0-192.168.1.100
192.168.1.50-192.168.1.200
192.168.2.0/24`
    },
    {
      label: 'Single IPs',
      content: `10.0.0.1
10.0.0.2
10.0.0.3
10.0.0.4`
    },
    {
      label: 'Complex Mix',
      content: `172.16.0.0/12
192.168.1.1
192.168.1.5-192.168.1.10
10.0.0.0/8
2001:db8::/48
fe80::/10`
    }
  ];

  /* Set example content */
  function setExample(content: string) {
    inputText = content;
    performSummarization();
  }

  /* Copy text to clipboard */
  async function copyToClipboard(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      copiedStates[id] = true;
      setTimeout(() => copiedStates[id] = false, 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  /* Copy all results */
  function copyAllResults() {
    if (!result) return;
    
    const sections = [];
    if (result.ipv4.length > 0) {
      sections.push('IPv4:', ...result.ipv4);
    }
    if (result.ipv6.length > 0) {
      sections.push('IPv6:', ...result.ipv6);
    }
    
    copyToClipboard(sections.join('\n'), 'all-results');
  }

  /* Clear input */
  function clearInput() {
    inputText = '';
    result = null;
  }

  /* Perform summarization */
  function performSummarization() {
    if (!inputText.trim()) {
      result = null;
      return;
    }
    
    try {
      result = summarizeCIDRs(inputText, mode);
    } catch (error) {
      result = {
        ipv4: [],
        ipv6: [],
        stats: { originalIpv4Count: 0, originalIpv6Count: 0, summarizedIpv4Count: 0, summarizedIpv6Count: 0, totalAddressesCovered: '0' },
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // Reactive summarization
  $effect(() => {
    if (inputText.trim() || mode) {
      performSummarization();
    }
  });
</script>

<div class="card">
  <header class="card-header">
    <h2>CIDR Summarization Tool</h2>
    <p>Convert mixed IP addresses, CIDR blocks, and ranges into optimized CIDR prefixes with separate IPv4/IPv6 results.</p>
  </header>

  <!-- Mode Selection -->
  <div class="mode-section">
    <h3>Summarization Mode</h3>
    <div class="tabs">
      {#each modes as modeOption}
        <button 
          type="button"
          class="tab"
          class:active={mode === modeOption.value}
          onclick={() => mode = modeOption.value}
        >
          {modeOption.label}
          <Tooltip text={modeOption.description} position="top">
            <Icon name="help" size="sm" />
          </Tooltip>
        </button>
      {/each}
    </div>
  </div>

  <!-- Input Section -->
  <div class="input-section">
    <h3>Input Data</h3>
    <div class="form-group">
      <label for="input-text">
        Enter IP addresses, CIDR blocks, or ranges (one per line)
        <Tooltip text="Supports: single IPs (192.168.1.1), CIDR blocks (10.0.0.0/8), ranges (172.16.0.1-172.16.0.100)">
          <Icon name="help" size="sm" />
        </Tooltip>
      </label>
      <div class="input-wrapper">
        <textarea
          id="input-text"
          bind:value={inputText}
          placeholder="192.168.1.0/24&#10;10.0.0.1-10.0.0.10&#10;2001:db8::/32"
          class="input-textarea"
          rows="8"
        ></textarea>
        <button 
          type="button" 
          class="btn btn-secondary btn-sm clear-btn"
          onclick={clearInput}
        >
          <Icon name="trash" size="sm" />
          Clear
        </button>
      </div>
    </div>

    <!-- Examples -->
    <div class="examples-section">
      <h4>Quick Examples</h4>
      <div class="examples-grid">
        {#each examples as example}
          <button 
            type="button"
            class="example-btn"
            onclick={() => setExample(example.content)}
          >
            {example.label}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Results Section -->
  {#if result}
    <div class="results-section">
      {#if result.errors.length > 0}
        <div class="info-panel error">
          <h3>Parsing Errors</h3>
          <ul class="error-list">
            {#each result.errors as error}
              <li>{error}</li>
            {/each}
          </ul>
        </div>
      {/if}

      {#if result.ipv4.length > 0 || result.ipv6.length > 0}
        <div class="summary-header">
          <h3>Summarization Results</h3>
          <button 
            type="button"
            class="btn btn-primary btn-sm"
            class:copied={copiedStates['all-results']}
            onclick={copyAllResults}
          >
            <Icon name={copiedStates['all-results'] ? 'check' : 'copy'} size="sm" />
            Copy All
          </button>
        </div>

        <div class="results-grid">
          <!-- IPv4 Results -->
          {#if result.ipv4.length > 0}
            <div class="result-panel ipv4">
              <div class="panel-header">
                <h4>IPv4 CIDR Blocks ({result.ipv4.length})</h4>
                <button 
                  type="button"
                  class="btn btn-icon"
                  class:copied={copiedStates['ipv4']}
                  onclick={() => copyToClipboard(result.ipv4.join('\n'), 'ipv4')}
                >
                  <Icon name={copiedStates['ipv4'] ? 'check' : 'copy'} size="sm" />
                </button>
              </div>
              <div class="cidr-list">
                {#each result.ipv4 as cidr}
                  <div class="cidr-item">
                    <code class="cidr-block">{cidr}</code>
                    <button 
                      type="button"
                      class="btn btn-icon btn-xs"
                      class:copied={copiedStates[cidr]}
                      onclick={() => copyToClipboard(cidr, cidr)}
                    >
                      <Icon name={copiedStates[cidr] ? 'check' : 'copy'} size="xs" />
                    </button>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          <!-- IPv6 Results -->
          {#if result.ipv6.length > 0}
            <div class="result-panel ipv6">
              <div class="panel-header">
                <h4>IPv6 CIDR Blocks ({result.ipv6.length})</h4>
                <button 
                  type="button"
                  class="btn btn-icon"
                  class:copied={copiedStates['ipv6']}
                  onclick={() => copyToClipboard(result.ipv6.join('\n'), 'ipv6')}
                >
                  <Icon name={copiedStates['ipv6'] ? 'check' : 'copy'} size="sm" />
                </button>
              </div>
              <div class="cidr-list">
                {#each result.ipv6 as cidr}
                  <div class="cidr-item">
                    <code class="cidr-block">{cidr}</code>
                    <button 
                      type="button"
                      class="btn btn-icon btn-xs"
                      class:copied={copiedStates[cidr]}
                      onclick={() => copyToClipboard(cidr, cidr)}
                    >
                      <Icon name={copiedStates[cidr] ? 'check' : 'copy'} size="xs" />
                    </button>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>

        <!-- Statistics -->
        <div class="stats-section">
          <h4>Summarization Statistics</h4>
          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-label">Original IPv4 Items</span>
              <span class="stat-value">{result.stats.originalIpv4Count}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Summarized IPv4 Blocks</span>
              <span class="stat-value">{result.stats.summarizedIpv4Count}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Original IPv6 Items</span>
              <span class="stat-value">{result.stats.originalIpv6Count}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Summarized IPv6 Blocks</span>
              <span class="stat-value">{result.stats.summarizedIpv6Count}</span>
            </div>
            <div class="stat-card span-full">
              <span class="stat-label">Total Addresses Covered</span>
              <span class="stat-value large">{result.stats.totalAddressesCovered}</span>
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .mode-section {
    margin-bottom: var(--spacing-lg);
    
    h3 {
      color: var(--color-primary);
      margin-bottom: var(--spacing-md);
    }
    
    .tabs {
      .tab {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        
        :global(.tooltip-trigger) {
          opacity: 0.7;
          transition: opacity var(--transition-fast);
          
          &:hover {
            opacity: 1;
          }
        }
      }
    }
  }

  .input-section {
    margin-bottom: var(--spacing-lg);
    
    h3, h4 {
      color: var(--color-primary);
      margin-bottom: var(--spacing-md);
    }
    
    .input-wrapper {
      position: relative;
      
      .clear-btn {
        position: absolute;
        top: var(--spacing-sm);
        right: var(--spacing-sm);
      }
    }
    
    .input-textarea {
      width: 100%;
      min-height: 200px;
      font-family: var(--font-mono);
      font-size: var(--font-size-sm);
      resize: vertical;
      padding-right: 4rem;
    }
  }

  .examples-section {
    margin-top: var(--spacing-md);
    
    .examples-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: var(--spacing-sm);
    }
    
    .example-btn {
      padding: var(--spacing-sm);
      background-color: var(--bg-tertiary);
      border: 1px solid var(--border-secondary);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-sm);
      transition: all var(--transition-fast);
      
      &:hover {
        background-color: var(--surface-hover);
        border-color: var(--color-primary);
        transform: translateY(-1px);
      }
    }
  }

  .results-section {
    border-top: 2px solid var(--border-secondary);
    padding-top: var(--spacing-lg);
  }

  .summary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
    
    h3 {
      color: var(--color-primary);
      margin: 0;
    }
  }

  .results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-lg);
  }

  .result-panel {
    background-color: var(--bg-secondary);
    border-radius: var(--radius-lg);
    overflow: hidden;
    
    &.ipv4 {
      border: 2px solid var(--color-info);
    }
    
    &.ipv6 {
      border: 2px solid var(--color-success);
    }
    
    .panel-header {
      padding: var(--spacing-md);
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h4 {
        margin: 0;
        color: var(--text-primary);
        font-size: var(--font-size-md);
      }
    }
    
    &.ipv4 .panel-header {
      background: linear-gradient(135deg, var(--color-info), var(--color-info-light));
      color: white;
      
      h4 {
        color: white;
      }
    }
    
    &.ipv6 .panel-header {
      background: linear-gradient(135deg, var(--color-success), var(--color-success-light));
      color: white;
      
      h4 {
        color: white;
      }
    }
  }

  .cidr-list {
    padding: var(--spacing-md);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .cidr-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm);
    background-color: var(--bg-tertiary);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-primary);
  }

  .cidr-block {
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
    color: var(--text-primary);
  }

  .stats-section {
    h4 {
      color: var(--color-primary);
      margin-bottom: var(--spacing-md);
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-md);
  }

  .stat-card {
    padding: var(--spacing-md);
    background-color: var(--bg-secondary);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-primary);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    
    &.span-full {
      grid-column: 1 / -1;
    }
  }

  .stat-label {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    margin-bottom: var(--spacing-xs);
  }

  .stat-value {
    font-family: var(--font-mono);
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--color-primary);
    
    &.large {
      font-size: var(--font-size-xl);
    }
  }

  .error-list {
    margin: var(--spacing-sm) 0;
    padding-left: var(--spacing-md);
    
    li {
      color: var(--color-error);
      margin-bottom: var(--spacing-xs);
    }
  }

  label {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    
    :global(.tooltip-trigger) {
      color: var(--text-secondary);
      opacity: 0.7;
      transition: opacity var(--transition-fast);
      
      &:hover {
        opacity: 1;
        color: var(--color-info);
      }
    }
  }

  .btn {
    &.copied {
      color: var(--color-success);
      background-color: rgba(35, 134, 54, 0.1);
      border-color: var(--color-success);
    }
    
    :global(.icon) {
      width: 1rem;
      height: 1rem;
    }
    
    &.btn-xs :global(.icon) {
      width: 0.75rem;
      height: 0.75rem;
    }
  }

  @media (max-width: 768px) {
    .results-grid {
      grid-template-columns: 1fr;
    }
    
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .examples-grid {
      grid-template-columns: 1fr;
    }
    
    .summary-header {
      flex-direction: column;
      gap: var(--spacing-sm);
      align-items: stretch;
    }
  }
</style>