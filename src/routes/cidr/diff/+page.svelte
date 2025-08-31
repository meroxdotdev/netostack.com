<script lang="ts">
  import CIDRDiff from '$lib/components/CIDRDiff.svelte';
  import { site } from '$lib/constants/site';
  import Icon from '$lib/components/Icon.svelte';
</script>

<svelte:head>
  <title>CIDR Set Difference Calculator - Compute A - B Operations | {site.title}</title>
  <meta name="description" content="Calculate CIDR set differences with A - B operations. Supports IPv4/IPv6 networks, ranges, and single IPs with visualization and alignment options." />
  <meta name="keywords" content="{site.keywords}, CIDR difference, set operations, network subtraction, IP set operations, CIDR calculator" />
  <meta property="og:title" content="CIDR Set Difference Calculator - Compute A - B Operations" />
  <meta property="og:description" content="Perform set difference operations on CIDR blocks with minimal alignment and visualization." />
  <meta property="og:url" content="{site.url}/cidr/diff" />
</svelte:head>

<div class="page-container">
  <CIDRDiff />
  
  <section class="explainer-section">
    <h3>About CIDR Set Operations</h3>
    <p>
      Set operations allow you to combine, subtract, and analyze IP address ranges mathematically. 
      The difference operation (A - B) returns all addresses in set A that are NOT in set B.
    </p>

    <div class="set-operations">
      <h4>Set Operations Quick Reference</h4>
      <div class="operations-grid">
        <div class="operation-card">
          <div class="operation-symbol">A ∪ B</div>
          <div class="operation-name">Union</div>
          <div class="operation-desc">All addresses in A OR B</div>
        </div>
        <div class="operation-card">
          <div class="operation-symbol">A ∩ B</div>
          <div class="operation-name">Intersection</div>
          <div class="operation-desc">Addresses in BOTH A AND B</div>
        </div>
        <div class="operation-card active">
          <div class="operation-symbol">A - B</div>
          <div class="operation-name">Difference</div>
          <div class="operation-desc">Addresses in A but NOT in B</div>
        </div>
        <div class="operation-card">
          <div class="operation-symbol">A ⊆ B</div>
          <div class="operation-name">Containment</div>
          <div class="operation-desc">Check if A is subset of B</div>
        </div>
      </div>
    </div>

    <div class="worked-examples">
      <h4>Worked Examples</h4>
      
      <div class="example-card ipv4">
        <h5><Icon name="network" size="sm" /> IPv4 Network Segmentation</h5>
        <div class="example-content">
          <div class="example-input">
            <strong>Set A:</strong> <code>192.168.1.0/24</code> (256 addresses)<br>
            <strong>Set B:</strong> <code>192.168.1.128/25</code> (128 addresses)
          </div>
          <div class="example-arrow">↓</div>
          <div class="example-result">
            <strong>A - B:</strong> <code>192.168.1.0/25</code> (128 addresses)<br>
            <span class="example-explanation">The first half remains after subtracting the second half</span>
          </div>
        </div>
      </div>

      <div class="example-card ipv6">
        <h5><Icon name="globe" size="sm" /> IPv6 Address Management</h5>
        <div class="example-content">
          <div class="example-input">
            <strong>Set A:</strong> <code>2001:db8::/48</code> (entire /48 block)<br>
            <strong>Set B:</strong> <code>2001:db8:1::/64</code> (single /64 subnet)
          </div>
          <div class="example-arrow">↓</div>
          <div class="example-result">
            <strong>A - B:</strong> Multiple CIDR blocks excluding the /64<br>
            <span class="example-explanation">All /48 addresses except the allocated /64 subnet</span>
          </div>
        </div>
      </div>

      <div class="example-card mixed">
        <h5><Icon name="layers" size="sm" /> Complex Range Operations</h5>
        <div class="example-content">
          <div class="example-input">
            <strong>Set A:</strong> <code>10.0.0.0/16</code> (65,536 addresses)<br>
            <strong>Set B:</strong> <code>10.0.10.0/24</code>, <code>10.0.20.50-10.0.20.100</code>
          </div>
          <div class="example-arrow">↓</div>
          <div class="example-result">
            <strong>A - B:</strong> Multiple optimized CIDR blocks<br>
            <span class="example-explanation">Original /16 with specific ranges carved out</span>
          </div>
        </div>
      </div>
    </div>

    <div class="edge-cases">
      <h4>Edge Cases & Considerations</h4>
      <div class="cases-grid">
        <div class="case-item">
          <h5>Non-aligned Ranges</h5>
          <p>
            When subtracting ranges that don't align to CIDR boundaries, the result may 
            require multiple smaller CIDR blocks to represent exactly.
          </p>
        </div>
        <div class="case-item">
          <h5>Duplicate Inputs</h5>
          <p>
            Overlapping ranges in the same set are automatically merged before processing. 
            <code>10.0.0.0/24</code> + <code>10.0.0.128/25</code> = <code>10.0.0.0/24</code>
          </p>
        </div>
        <div class="case-item">
          <h5>Mixed IP Families</h5>
          <p>
            IPv4 and IPv6 addresses are processed separately. You cannot subtract 
            IPv6 ranges from IPv4 ranges (and vice versa).
          </p>
        </div>
        <div class="case-item">
          <h5>Empty Results</h5>
          <p>
            If set B completely contains set A, the result is empty. For example: 
            <code>192.168.1.0/25 - 192.168.1.0/24 = ∅</code>
          </p>
        </div>
      </div>
    </div>

    <div class="alignment-modes">
      <h4>Alignment Modes</h4>
      <div class="alignment-comparison">
        <div class="alignment-mode">
          <h5><Icon name="minimize" size="sm" /> Minimal Alignment</h5>
          <p>
            Generates the most efficient CIDR representation with the fewest blocks. 
            Uses variable prefix lengths to exactly cover the result ranges.
          </p>
          <div class="alignment-example">
            <strong>Example:</strong> Result might use /25, /26, /30 prefixes for optimal coverage
          </div>
        </div>
        <div class="alignment-mode">
          <h5><Icon name="target" size="sm" /> Constrained Alignment</h5>
          <p>
            Forces results to align to specific prefix boundaries. Useful for 
            organizational policies or routing requirements.
          </p>
          <div class="alignment-example">
            <strong>Example:</strong> Force all results to /24 boundaries, may require more blocks
          </div>
        </div>
      </div>
    </div>

    <div class="use-cases">
      <h4>Common Use Cases</h4>
      <div class="use-case-list">
        <div class="use-case">
          <Icon name="shield" size="sm" />
          <div>
            <strong>Firewall Rules:</strong> Define allowed ranges by subtracting blocked addresses
          </div>
        </div>
        <div class="use-case">
          <Icon name="server" size="sm" />
          <div>
            <strong>IP Allocation:</strong> Track available addresses after assignments
          </div>
        </div>
        <div class="use-case">
          <Icon name="cloud" size="sm" />
          <div>
            <strong>Cloud Networks:</strong> Reserve address space while excluding system ranges
          </div>
        </div>
        <div class="use-case">
          <Icon name="analytics" size="sm" />
          <div>
            <strong>Network Analysis:</strong> Calculate unused address space in allocations
          </div>
        </div>
      </div>
    </div>

    <div class="visualization-guide">
      <h4>Understanding the Visualization</h4>
      <div class="viz-guide-content">
        <p>
          The overlay visualization shows how set operations work spatially across the address space:
        </p>
        <ul class="viz-guide-list">
          <li><strong>Blue bars:</strong> Set A (base ranges) - your starting address space</li>
          <li><strong>Orange overlay:</strong> Set B (subtract ranges) - what gets removed</li>
          <li><strong>Green segments:</strong> Final result - remaining address ranges</li>
          <li><strong>Hover details:</strong> Shows exact IP ranges, sizes, and CIDR notations</li>
        </ul>
        <p class="viz-tip">
          <Icon name="lightbulb" size="sm" />
          <strong>Tip:</strong> The visualization helps you understand why certain results 
          require multiple CIDR blocks - they represent the "holes" left after subtraction.
        </p>
      </div>
    </div>
  </section>
</div>

<style lang="scss">
  .explainer-section {
    margin-top: var(--spacing-xl);
    padding: var(--spacing-xl);
    background-color: var(--bg-secondary);
    border-radius: var(--radius-lg);
    
    h3 {
      color: var(--color-primary);
      margin-bottom: var(--spacing-md);
      font-size: var(--font-size-lg);
      font-weight: 600;
    }
    
    h4 {
      color: var(--text-primary);
      margin: var(--spacing-xl) 0 var(--spacing-md) 0;
      font-size: var(--font-size-md);
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }
    
    h5 {
      color: var(--color-primary);
      margin-bottom: var(--spacing-sm);
      font-size: var(--font-size-sm);
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }
  }

  /* Set Operations */
  .operations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
  }

  .operation-card {
    padding: var(--spacing-md);
    background-color: var(--bg-primary);
    border: 1px solid var(--border-secondary);
    border-radius: var(--radius-md);
    text-align: center;
    
    &.active {
      border-color: var(--color-primary);
      background-color: var(--surface-hover);
    }
    
    .operation-symbol {
      font-size: 2rem;
      font-weight: bold;
      color: var(--color-primary);
      margin-bottom: var(--spacing-sm);
    }
    
    .operation-name {
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--spacing-xs);
    }
    
    .operation-desc {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
    }
  }

  /* Worked Examples */
  .example-card {
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-md);
    background: var(--bg-primary);
    
    &.ipv4 { border-left: 4px solid var(--color-info); }
    &.ipv6 { border-left: 4px solid var(--color-success); }
    &.mixed { border-left: 4px solid var(--color-warning); }
    
    .example-content {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      
      .example-input, .example-result {
        padding: var(--spacing-sm);
        background-color: var(--bg-tertiary);
        border-radius: var(--radius-sm);
        
        code {
          background-color: var(--bg-secondary);
          padding: 2px var(--spacing-xs);
          border-radius: var(--radius-xs);
          font-family: var(--font-mono);
          font-size: var(--font-size-sm);
        }
      }
      
      .example-arrow {
        text-align: center;
        font-size: var(--font-size-lg);
        color: var(--color-primary);
        font-weight: bold;
      }
      
      .example-explanation {
        display: block;
        margin-top: var(--spacing-xs);
        font-size: var(--font-size-sm);
        color: var(--text-secondary);
        font-style: italic;
      }
    }
  }

  /* Edge Cases */
  .cases-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--spacing-md);
  }

  .case-item {
    padding: var(--spacing-md);
    background-color: var(--bg-primary);
    border: 1px solid var(--border-secondary);
    border-radius: var(--radius-md);
    
    h5 {
      margin-bottom: var(--spacing-sm);
      color: var(--color-primary);
    }
    
    p {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      margin: 0;
      
      code {
        background-color: var(--bg-secondary);
        padding: 1px var(--spacing-xs);
        border-radius: var(--radius-xs);
        font-family: var(--font-mono);
        font-size: var(--font-size-xs);
      }
    }
  }

  /* Alignment Modes */
  .alignment-comparison {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-lg);
  }

  .alignment-mode {
    padding: var(--spacing-md);
    background-color: var(--bg-primary);
    border: 1px solid var(--border-primary);
    border-left: 4px solid var(--color-info);
    border-radius: var(--radius-md);
    
    h5 {
      margin-bottom: var(--spacing-sm);
    }
    
    p {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      margin-bottom: var(--spacing-sm);
    }
    
    .alignment-example {
      padding: var(--spacing-sm);
      background-color: var(--bg-tertiary);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-sm);
      
      strong {
        color: var(--color-primary);
      }
    }
  }

  /* Use Cases */
  .use-case-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .use-case {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background-color: var(--bg-primary);
    border: 1px solid var(--border-secondary);
    border-radius: var(--radius-md);
    
    :global(.icon) {
      color: var(--color-primary);
      flex-shrink: 0;
    }
    
    div strong {
      color: var(--color-primary);
    }
  }

  /* Visualization Guide */
  .viz-guide-content {
    p {
      margin-bottom: var(--spacing-sm);
    }
    
    .viz-guide-list {
      margin: var(--spacing-md) 0;
      padding-left: var(--spacing-lg);
      
      li {
        margin-bottom: var(--spacing-sm);
        font-size: var(--font-size-sm);
        
        strong {
          color: var(--color-primary);
        }
      }
    }
    
    .viz-tip {
      padding: var(--spacing-md);
      background-color: var(--bg-primary);
      border: 1px solid var(--border-secondary);
      border-left: 4px solid var(--color-warning);
      border-radius: var(--radius-md);
      margin-top: var(--spacing-md);
      
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-sm);
      
      :global(.icon) {
        color: var(--color-warning);
        flex-shrink: 0;
        margin-top: 2px;
      }
      
      strong {
        color: var(--color-primary);
      }
    }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .operations-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .cases-grid,
    .alignment-comparison {
      grid-template-columns: 1fr;
    }
    
    .example-content {
      .example-arrow {
        transform: rotate(90deg);
        margin: var(--spacing-sm) 0;
      }
    }
    
    .viz-tip {
      flex-direction: column;
      
      :global(.icon) {
        align-self: flex-start;
      }
    }
  }
</style>
