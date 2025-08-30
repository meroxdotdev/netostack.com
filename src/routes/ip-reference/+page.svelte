<script lang="ts">
	  import SvgIcon from '$lib/components/SvgIcon.svelte';
</script>

<div class="card">
	<header class="card-header">
		<h2>Network Reference</h2>
		<p>Essential networking information and constants for IP address planning.</p>
	</header>

	<section class="grid grid-3 landing-cards">
		<a class="ref-card" href="/ip-reference/network-classes" aria-label="Network Classes reference">
			<h3>Network Classes</h3>
			<p>Class A/B/C summary with default masks, ranges, and usage.</p>
			<span class="cta">View →</span>
		</a>

		<a class="ref-card" href="/ip-reference/reserved-ranges" aria-label="Reserved Ranges reference">
			<h3>Reserved Ranges</h3>
			<p>Loopback, link-local, private (RFC 1918), multicast & more.</p>
			<span class="cta">View →</span>
		</a>

		<a class="ref-card" href="/ip-reference/common-subnets" aria-label="Common Subnets reference">
			<h3>Common Subnets</h3>
			<p>Handy CIDR ↔ mask table with typical usage and host counts.</p>
			<span class="cta">View →</span>
		</a>
	</section>

	<!-- Quick Tips -->
	<section class="tips-section">
		<h4 class="tips-header">
			<SvgIcon icon="bulb" size="md" />
			Pro Tips
		</h4>
		<ul class="tips-list">
			<li>Always plan for future growth when choosing subnet sizes</li>
			<li>Use /30 subnets for point-to-point links to save addresses</li>
			<li>Consider VLSM (Variable Length Subnet Masking) for efficient allocation</li>
			<li>Private addresses (RFC 1918) are not routable on the Internet</li>
		</ul>
	</section>
</div>

<style lang="scss">
	.landing-cards {
		margin: var(--spacing-lg) 0;
	}

	.ref-card {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
		padding: var(--spacing-md);
		border: 1px solid var(--border-primary);
		border-radius: var(--radius-lg);
		background-color: var(--bg-secondary);
		text-decoration: none;
		transition: all var(--transition-fast);

		h3 { margin: 0; color: var(--text-primary); }
		p  { margin: 0; color: var(--text-secondary); }
		.cta { margin-top: auto; color: var(--color-primary); font-weight: 600; }

		&:hover {
			border-color: var(--color-primary);
			background-color: var(--surface-hover);
			transform: translateY(-2px);
			box-shadow: var(--shadow-md);
		}
	}
	
	.tips-section {
    background-color: var(--bg-primary);
    border: 1px solid var(--color-warning);
    border-radius: var(--radius-md);
    padding: var(--spacing-md);
    
    h4 {
      color: var(--color-warning);
      margin-bottom: var(--spacing-sm);
    }
    
    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    
    li {
      margin-bottom: var(--spacing-sm);
      color: var(--text-primary);
      font-size: var(--font-size-sm);
      line-height: 1.6;
      
      &::before {
        content: "•";
        color: var(--color-warning);
        font-weight: bold;
        display: inline-block;
        width: 1em;
        margin-right: var(--spacing-xs);
      }
    }
	}
</style>
