<script lang="ts">
  import Icon from '$lib/components/global/Icon.svelte';
</script>

<slot />

<section class="set-operations-reference">
  <h3>Set Operations Reference</h3>
  <p>
    Mathematical set operations allow you to combine, analyze, and manipulate IP address ranges 
    systematically. Each operation serves different network analysis and management purposes.
  </p>

  <div class="operations-grid">
    <div class="operation-card">
      <div class="operation-header">
        <div class="operation-symbol">A ∪ B</div>
        <div class="operation-name">Union</div>
      </div>
      <div class="operation-desc">
        Combines all addresses from both sets. Results in addresses that are in A OR B.
        Useful for merging address allocations or creating comprehensive allow-lists.
      </div>
      <div class="operation-example">
        <strong>Example:</strong> <code>192.168.1.0/24 ∪ 192.168.2.0/24</code> = both networks
      </div>
    </div>

    <div class="operation-card">
      <div class="operation-header">
        <div class="operation-symbol">A ∩ B</div>
        <div class="operation-name">Intersection</div>
      </div>
      <div class="operation-desc">
        Finds common addresses between sets. Results in addresses that are in BOTH A AND B.
        Essential for identifying conflicts or overlapping allocations.
      </div>
      <div class="operation-example">
        <strong>Example:</strong> <code>192.168.0.0/16 ∩ 192.168.1.0/24</code> = <code>192.168.1.0/24</code>
      </div>
    </div>

    <div class="operation-card">
      <div class="operation-header">
        <div class="operation-symbol">A - B</div>
        <div class="operation-name">Difference</div>
      </div>
      <div class="operation-desc">
        Removes B's addresses from A. Results in addresses that are in A but NOT in B.
        Critical for calculating remaining capacity or excluding reserved ranges.
      </div>
      <div class="operation-example">
        <strong>Example:</strong> <code>192.168.1.0/24 - 192.168.1.128/25</code> = <code>192.168.1.0/25</code>
      </div>
    </div>

    <div class="operation-card">
      <div class="operation-header">
        <div class="operation-symbol">A ⊆ B</div>
        <div class="operation-name">Containment</div>
      </div>
      <div class="operation-desc">
        Tests if A is completely contained within B. Returns boolean result plus coverage analysis.
        Valuable for validating subnet hierarchies and allocation compliance.
      </div>
      <div class="operation-example">
        <strong>Example:</strong> <code>192.168.1.0/25 ⊆ 192.168.1.0/24</code> = <code>true</code>
      </div>
    </div>
  </div>

  <div class="common-patterns">
    <h4>Common Network Patterns</h4>
    <div class="patterns-grid">
      <div class="pattern-card">
        <h5><Icon name="shield" size="sm" /> Firewall Management</h5>
        <ul class="pattern-list">
          <li><strong>Allow Lists:</strong> Union of trusted networks</li>
          <li><strong>Conflicts:</strong> Intersection of allow/deny rules</li>
          <li><strong>Exceptions:</strong> Difference to exclude specific ranges</li>
        </ul>
      </div>
      
      <div class="pattern-card">
        <h5><Icon name="server" size="sm" /> IP Allocation</h5>
        <ul class="pattern-list">
          <li><strong>Available Space:</strong> Difference from allocated ranges</li>
          <li><strong>Overlaps:</strong> Intersection of allocation requests</li>
          <li><strong>Validation:</strong> Containment within authorized blocks</li>
        </ul>
      </div>
      
      <div class="pattern-card">
        <h5><Icon name="analytics" size="sm" /> Network Analysis</h5>
        <ul class="pattern-list">
          <li><strong>Coverage:</strong> Union of monitoring ranges</li>
          <li><strong>Gaps:</strong> Difference to find unmonitored areas</li>
          <li><strong>Redundancy:</strong> Intersection of backup networks</li>
        </ul>
      </div>
      
      <div class="pattern-card">
        <h5><Icon name="cloud" size="sm" /> Cloud Networks</h5>
        <ul class="pattern-list">
          <li><strong>VPC Planning:</strong> Union of required address space</li>
          <li><strong>Peering:</strong> Intersection analysis for conflicts</li>
          <li><strong>Segmentation:</strong> Difference for isolation</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="implementation-notes">
    <h4>Implementation Notes</h4>
    <div class="notes-grid">
      <div class="note-item">
        <h5>IPv4 vs IPv6</h5>
        <p>
          All operations process IPv4 and IPv6 addresses separately. You cannot perform 
          set operations between different IP versions - they operate in distinct address spaces.
        </p>
      </div>
      
      <div class="note-item">
        <h5>CIDR Optimization</h5>
        <p>
          Results are automatically optimized into minimal CIDR representations. 
          Complex operations may require multiple CIDR blocks to exactly represent the result.
        </p>
      </div>
      
      <div class="note-item">
        <h5>Range Normalization</h5>
        <p>
          Input ranges are normalized and merged before operations. Overlapping inputs 
          within the same set are automatically combined for accurate results.
        </p>
      </div>
      
      <div class="note-item">
        <h5>Performance Considerations</h5>
        <p>
          Operations are optimized for network-sized ranges. Very large address spaces 
          or numerous small ranges may require additional processing time.
        </p>
      </div>
    </div>
  </div>

  <div class="best-practices-box">
    <h4>Best Practices</h4>
    <ul>
      <li><strong>Validate Inputs:</strong> Always verify CIDR notation and IP formats before operations</li>
      <li><strong>Document Operations:</strong> Export results and maintain records of set operations</li>
      <li><strong>Test in Stages:</strong> For complex operations, break into smaller steps for verification</li>
      <li><strong>Monitor Results:</strong> Use visualization to verify operations produce expected outcomes</li>
    </ul>
  </div>
</section>

<style lang="scss">
  .set-operations-reference {
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
    
    > p {
      color: var(--text-secondary);
      margin-bottom: var(--spacing-lg);
      line-height: 1.6;
    }
  }

  /* Operations grid */
  .operations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-xl);
  }

  .operation-card {
    padding: var(--spacing-md);
    background-color: var(--bg-primary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    
    .operation-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-sm);
      
      .operation-symbol {
        font-size: var(--font-size-xl);
        font-weight: bold;
        color: var(--color-primary);
        width: 69px;
        text-align: center;
      }
      
      .operation-name {
        font-weight: 600;
        color: var(--text-primary);
        font-size: var(--font-size-md);
      }
    }
    
    .operation-desc {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      line-height: 1.5;
      margin-bottom: var(--spacing-sm);
    }
    
    .operation-example {
      padding: var(--spacing-sm);
      background-color: var(--bg-tertiary);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-sm);
      
      strong {
        color: var(--color-primary);
      }
      
      code {
        font-family: var(--font-mono);
        background-color: var(--bg-secondary);
        padding: 1px var(--spacing-xs);
        border-radius: var(--radius-xs);
        font-size: var(--font-size-xs);
      }
    }
  }

  /* Common patterns */
  .patterns-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-xl);
  }

  .pattern-card {
    padding: var(--spacing-md);
    background-color: var(--bg-primary);
    border: 1px solid var(--border-secondary);
    border-left: 4px solid var(--color-info);
    border-radius: var(--radius-md);
    
    h5 {
      margin-bottom: var(--spacing-sm);
    }
    
    .pattern-list {
      list-style: none;
      padding: 0;
      margin: 0;
      
      li {
        margin-bottom: var(--spacing-xs);
        font-size: var(--font-size-sm);
        color: var(--text-secondary);
        
        strong {
          color: var(--color-primary);
        }
      }
    }
  }

  /* Implementation notes */
  .notes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-xl);
  }

  .note-item {
    padding: var(--spacing-md);
    background-color: var(--bg-primary);
    border: 1px solid var(--border-secondary);
    border-radius: var(--radius-md);
    
    h5 {
      margin-bottom: var(--spacing-sm);
    }
    
    p {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      line-height: 1.5;
      margin: 0;
    }
  }

  /* Best practices */
  .best-practices-box {
    background-color: var(--bg-primary);
    border: 1px solid var(--color-info);
    border-radius: var(--radius-md);
    padding: var(--spacing-md);

    h4 {
      color: var(--color-info);
      margin: 0 0 var(--spacing-sm) 0;
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 0;

      li {
        margin-bottom: var(--spacing-xs);
        color: var(--text-primary);
        font-size: var(--font-size-sm);
        &::before {
          content: "•";
          color: var(--color-info);
          font-weight: bold;
          display: inline-block;
          width: 1em;
          margin-right: var(--spacing-xs);
        }
        
        strong {
          color: var(--color-info);
        }
      }
    }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .operations-grid,
    .patterns-grid,
    .notes-grid {
      grid-template-columns: 1fr;
    }
    
    .operation-header {
      flex-direction: column;
      text-align: center;
      gap: var(--spacing-sm);
    }
  }
</style>
