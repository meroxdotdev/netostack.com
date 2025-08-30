<!-- src/routes/reference/+page.svelte -->
<script lang="ts">
	// No heavy logic needed on the landing page
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
			<svg class="tip-icon" fill="currentColor" viewBox="0 0 20 20">
				<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
			</svg>
			Pro Tips
		</h4>
		<ul class="tips-list">
			<li>• Always plan for future growth when choosing subnet sizes</li>
			<li>• Use /30 subnets for point-to-point links to save addresses</li>
			<li>• Consider VLSM (Variable Length Subnet Masking) for efficient allocation</li>
			<li>• Private addresses (RFC 1918) are not routable on the Internet</li>
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
		margin-top: var(--spacing-xl);
		padding: var(--spacing-md);
		background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary));
		border-radius: var(--radius-lg);
		border: 1px solid var(--border-secondary);

		.tips-header {
			display: flex;
			align-items: center;
			gap: var(--spacing-sm);
			font-weight: 600;
			color: var(--text-primary);
			margin-bottom: var(--spacing-sm);

			.tip-icon {
				width: 1rem; height: 1rem; color: var(--color-warning);
			}
		}

		.tips-list {
			list-style: none;
			font-size: var(--font-size-sm);
			color: var(--text-primary);
			line-height: 1.6;
			display: flex; flex-direction: column; gap: var(--spacing-xs);
			margin: 0; padding: 0;
		}
	}
</style>
