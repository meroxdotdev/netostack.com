<script lang="ts">
	import { cidrToMask, maskToCidr } from '$lib/utils/ip-calculations.js';
	import { validateSubnetMask } from '$lib/utils/ip-validation.js';
	import { COMMON_SUBNETS } from '$lib/constants/networks.js';
	import Tooltip from '$lib/components/Tooltip.svelte';
	
	let cidrValue = $state(24);
	let maskValue = $state('255.255.255.0');
	let selectedTab = $state<'cidr-to-mask' | 'mask-to-cidr'>('cidr-to-mask');
	
	/**
	 * Converts CIDR to mask when CIDR input changes
	 */
	$effect(() => {
		if (selectedTab === 'cidr-to-mask') {
			const mask = cidrToMask(cidrValue);
			maskValue = mask.octets.join('.');
		}
	});
	
	/**
	 * Converts mask to CIDR when mask input changes
	 */
	function handleMaskChange(event: Event) {
		const target = event.target as HTMLInputElement;
		maskValue = target.value;
		
		if (validateSubnetMask(maskValue).valid) {
			cidrValue = maskToCidr(maskValue);
		}
	}
	
	/**
	 * Gets subnet information for current values
	 */
	function getSubnetInfo(cidr: number) {
		const subnet = COMMON_SUBNETS.find(s => s.cidr === cidr);
		return subnet || { cidr, mask: cidrToMask(cidr).octets.join('.'), hosts: Math.pow(2, 32 - cidr) - 2 };
	}
	
	let subnetInfo = $derived(getSubnetInfo(cidrValue));
</script>

<div class="card">
	<header class="card-header">
		<h2>CIDR ↔ Subnet Mask Converter</h2>
		<p>Convert between CIDR notation and subnet mask formats.</p>
	</header>
	
	<!-- Tab Navigation -->
	<div class="tabs">
		<button
			type="button"
			class="tab {selectedTab === 'cidr-to-mask' ? 'active' : ''}"
			onclick={() => selectedTab = 'cidr-to-mask'}
		>
			CIDR → Subnet Mask
		</button>
		<button
			type="button"
			class="tab {selectedTab === 'mask-to-cidr' ? 'active' : ''}"
			onclick={() => selectedTab = 'mask-to-cidr'}
		>
			Subnet Mask → CIDR
		</button>
	</div>
	
	<!-- CIDR to Mask Tab -->
	{#if selectedTab === 'cidr-to-mask'}
		<div class="converter-section fade-in">
			<!-- CIDR Input -->
			<div class="form-group">
				<Tooltip text="Drag slider to adjust CIDR prefix length - higher values create smaller subnets" position="right">
					<label for="cidr-slider" class="slider-label">
						CIDR Prefix Length: /{cidrValue}
					</label>
				</Tooltip>
				<div class="slider-container">
					<input
						id="cidr-slider"
						type="range"
						min="0"
						max="32"
						bind:value={cidrValue}
						class="cidr-slider"
					/>
					<div class="slider-markers">
						<span>0</span>
						<span>8</span>
						<span>16</span>
						<span>24</span>
						<span>32</span>
					</div>
				</div>
			</div>
			
			<!-- Result Display -->
			<div class="result-display info">
				<div class="result-content">
					<span class="result-label">Subnet Mask</span>
					<span class="result-value">
						{maskValue}
					</span>
				</div>
			</div>
		</div>
	{/if}
	
	<!-- Mask to CIDR Tab -->
	{#if selectedTab === 'mask-to-cidr'}
		<div class="converter-section fade-in">
			<!-- Mask Input -->
			<div class="form-group">
				<label for="mask-input">Subnet Mask</label>
				<input
					id="mask-input"
					type="text"
					value={maskValue}
					placeholder="255.255.255.0"
					class="mask-input"
					oninput={handleMaskChange}
				/>
			</div>
			
			<!-- Result Display -->
			<div class="result-display success">
				<div class="result-content">
					<span class="result-label">CIDR Notation</span>
					<span class="result-value">
						/{cidrValue}
					</span>
				</div>
			</div>
		</div>
	{/if}
	
	<!-- Subnet Information -->
	<section class="info-panel">
		<h3>Subnet Information</h3>
		<div class="grid grid-3">
			<Tooltip text="Number of bits used for network identification - higher values create smaller, more specific subnets" position="top">
				<div class="info-metric">
					<span class="info-label">Network Bits</span>
					<span class="metric-value info">{cidrValue}</span>
				</div>
			</Tooltip>
			<Tooltip text="Number of bits available for host addresses - more host bits allow for more devices" position="top">
				<div class="info-metric">
					<span class="info-label">Host Bits</span>
					<span class="metric-value info">{32 - cidrValue}</span>
				</div>
			</Tooltip>
			<Tooltip text="Number of IP addresses available for devices (excludes network and broadcast addresses)" position="top">
				<div class="info-metric">
					<span class="info-label">Usable Hosts</span>
					<span class="metric-value success">
						{(subnetInfo.hosts).toLocaleString()}
					</span>
				</div>
			</Tooltip>
		</div>
	</section>
	
	<!-- Common Subnets Reference -->
	<section class="common-subnets-section">
		<h3>Common Subnets</h3>
		<div class="subnets-grid">
			{#each COMMON_SUBNETS as subnet}
				<Tooltip text="Click to select this common subnet configuration" position="top">
					<button
						type="button"
						class="subnet-card {cidrValue === subnet.cidr ? 'active' : ''}"
						onclick={() => cidrValue = subnet.cidr}
						aria-label="Select /{subnet.cidr} subnet with {subnet.hosts.toLocaleString()} hosts"
					>
						<div class="subnet-info">
							<div class="subnet-cidr">
								<span class="cidr-notation">/{subnet.cidr}</span>
								<span class="subnet-mask">{subnet.mask}</span>
							</div>
							<span class="host-count">{subnet.hosts.toLocaleString()} hosts</span>
						</div>
					</button>
				</Tooltip>
			{/each}
		</div>
	</section>

	<!-- Explainer Section -->
	<section class="explainer-section">
		<h3>Understanding CIDR and Subnet Masks</h3>
		
		<div class="explainer-grid">
			<div class="explainer-card">
				<h4>CIDR Notation</h4>
				<p>CIDR (Classless Inter-Domain Routing) uses a slash followed by a number (e.g., /24) to indicate how many bits are used for the network portion of an IP address.</p>
			</div>

			<div class="explainer-card">
				<h4>Subnet Mask</h4>
				<p>A 32-bit number that masks an IP address to divide it into network and host portions. Written in dotted decimal notation (e.g., 255.255.255.0).</p>
			</div>

			<div class="explainer-card">
				<h4>Network Bits</h4>
				<p>The leftmost bits in an IP address that identify the network. More network bits mean smaller subnets with fewer available host addresses.</p>
			</div>

			<div class="explainer-card">
				<h4>Host Bits</h4>
				<p>The remaining bits used for host addresses within the network. More host bits allow for more devices but fewer possible subnets.</p>
			</div>
		</div>

		<div class="conversion-examples">
			<h4>Common Conversions</h4>
			<div class="examples-grid">
				<div class="example-item">
					<span class="example-cidr">/24</span>
					<span class="example-arrow">↔</span>
					<span class="example-mask">255.255.255.0</span>
					<span class="example-desc">254 hosts</span>
				</div>
				<div class="example-item">
					<span class="example-cidr">/25</span>
					<span class="example-arrow">↔</span>
					<span class="example-mask">255.255.255.128</span>
					<span class="example-desc">126 hosts</span>
				</div>
				<div class="example-item">
					<span class="example-cidr">/26</span>
					<span class="example-arrow">↔</span>
					<span class="example-mask">255.255.255.192</span>
					<span class="example-desc">62 hosts</span>
				</div>
				<div class="example-item">
					<span class="example-cidr">/30</span>
					<span class="example-arrow">↔</span>
					<span class="example-mask">255.255.255.252</span>
					<span class="example-desc">2 hosts</span>
				</div>
			</div>
		</div>

		<div class="tips-box">
			<h4>🔧 Usage Tips</h4>
			<ul>
				<li><strong>Smaller CIDR = Bigger Network:</strong> /16 has more hosts than /24</li>
				<li><strong>Binary Thinking:</strong> Each bit doubles or halves the number of addresses</li>
				<li><strong>/30 for Links:</strong> Perfect for point-to-point connections (only 2 usable IPs)</li>
				<li><strong>Planning:</strong> Start with larger subnets and subdivide as needed</li>
			</ul>
		</div>
	</section>
</div>

<style>
	.converter-section {
		margin: var(--spacing-lg) 0;
	}

	.slider-label {
		display: block;
		font-size: var(--font-size-sm);
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: var(--spacing-sm);
		cursor: help;
	}

	.slider-container {
		position: relative;
	}

	.cidr-slider {
		width: 100%;
		height: 0.5rem;
		background-color: var(--bg-tertiary);
		border-radius: var(--radius-lg);
		appearance: none;
		cursor: pointer;
		outline: none;
	}

	.cidr-slider::-webkit-slider-thumb {
		appearance: none;
		height: 1.25rem;
		width: 1.25rem;
		border-radius: 50%;
		background: var(--color-primary);
		cursor: pointer;
		box-shadow: var(--shadow-md);
		transition: transform var(--transition-fast);
	}

	.cidr-slider::-webkit-slider-thumb:hover {
		transform: scale(1.1);
	}

	.cidr-slider::-moz-range-thumb {
		height: 1.25rem;
		width: 1.25rem;
		border-radius: 50%;
		background: var(--color-primary);
		cursor: pointer;
		border: none;
		box-shadow: var(--shadow-md);
		transition: transform var(--transition-fast);
	}

	.cidr-slider::-moz-range-thumb:hover {
		transform: scale(1.1);
	}

	.slider-markers {
		display: flex;
		justify-content: space-between;
		font-size: var(--font-size-xs);
		color: var(--text-secondary);
		margin-top: var(--spacing-xs);
	}

	.mask-input {
		font-family: var(--font-mono);
		font-size: var(--font-size-lg);
	}

	.result-display {
		padding: var(--spacing-md);
		border-radius: var(--radius-lg);
		margin-top: var(--spacing-md);
	}

	.result-display.info {
		background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary));
		border: 1px solid var(--color-info);
	}

	.result-display.success {
		background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary));
		border: 1px solid var(--color-success);
	}

	.result-content {
		text-align: center;
	}

	.result-label {
		display: block;
		font-size: var(--font-size-sm);
		color: var(--text-secondary);
		margin-bottom: var(--spacing-xs);
	}

	.result-value {
		display: block;
		font-size: var(--font-size-2xl);
		font-family: var(--font-mono);
		font-weight: 700;
		color: var(--text-primary);
	}

	.info-panel {
		margin-top: var(--spacing-xl);
	}

	.info-metric {
		text-align: center;
	}

	.info-metric .info-label {
		display: block;
		font-size: var(--font-size-sm);
		color: var(--text-secondary);
		margin-bottom: var(--spacing-xs);
	}

	.common-subnets-section {
		margin-top: var(--spacing-lg);
	}

	.subnets-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--spacing-sm);
		margin-top: var(--spacing-md);
		justify-content: space-between;
	}

	.subnet-card {
		padding: var(--spacing-sm);
		text-align: left;
		border: 1px solid var(--border-primary);
		border-radius: var(--radius-lg);
		background-color: var(--bg-secondary);
		transition: all var(--transition-fast);
		cursor: pointer;
		width: 100%;
	}

	.subnet-card:hover {
		background-color: var(--surface-hover);
		border-color: var(--color-primary);
	}

	.subnet-card.active {
		background-color: var(--surface-hover);
		border-color: var(--color-primary);
		box-shadow: var(--shadow-md);
	}

	.subnet-info {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.subnet-cidr {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.cidr-notation {
		font-family: var(--font-mono);
		font-weight: 700;
		font-size: var(--font-size-sm);
		color: var(--text-primary);
	}

	.subnet-mask {
		font-family: var(--font-mono);
		font-size: var(--font-size-xs);
		color: var(--text-secondary);
	}

	.host-count {
		font-size: var(--font-size-xs);
		color: var(--text-secondary);
		text-align: right;
	}

	@media (max-width: 768px) {
		.subnet-info {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--spacing-xs);
		}

		.host-count {
			text-align: left;
		}
	}

	.explainer-section {
		margin-top: var(--spacing-xl);
		padding: var(--spacing-lg);
		background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary));
		border-radius: var(--radius-lg);
		border: 1px solid var(--border-secondary);
	}

	.explainer-section h3 {
		margin-bottom: var(--spacing-lg);
		text-align: center;
		color: var(--color-primary);
	}

	.explainer-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-lg);
	}

	.explainer-card {
		background-color: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-radius: var(--radius-md);
		padding: var(--spacing-md);
		transition: all var(--transition-fast);
	}

	.explainer-card:hover {
		border-color: color-mix(in srgb, var(--color-primary) 33%, transparent);
		box-shadow: var(--shadow-md);
		transform: translateY(-2px);
	}

	.explainer-card h4 {
		color: var(--color-primary);
		font-size: var(--font-size-md);
		margin-bottom: var(--spacing-sm);
		font-weight: 600;
	}

	.explainer-card p {
		color: var(--text-primary);
		font-size: var(--font-size-sm);
		line-height: 1.6;
		margin: 0;
	}

	.conversion-examples {
		margin-bottom: var(--spacing-lg);
		padding: var(--spacing-md);
		background-color: var(--bg-primary);
		border-radius: var(--radius-md);
		border: 1px solid var(--border-primary);
	}

	.conversion-examples h4 {
		color: var(--color-info-light);
		margin-bottom: var(--spacing-md);
		text-align: center;
	}

	.examples-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--spacing-sm);
	}

	.example-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-sm);
		background-color: var(--bg-secondary);
		border-radius: var(--radius-sm);
		font-family: var(--font-mono);
		font-size: var(--font-size-sm);
	}

	.example-cidr {
		color: var(--color-info-light);
		font-weight: 700;
		min-width: 2rem;
	}

	.example-arrow {
		color: var(--text-secondary);
		margin: 0 var(--spacing-xs);
	}

	.example-mask {
		color: var(--color-success-light);
		font-weight: 600;
		flex: 1;
		text-align: center;
	}

	.example-desc {
		color: var(--text-secondary);
		font-size: var(--font-size-xs);
		min-width: 4rem;
		text-align: right;
	}

	.tips-box {
		background-color: var(--bg-primary);
		border: 1px solid var(--color-warning);
		border-radius: var(--radius-md);
		padding: var(--spacing-md);
	}

	.tips-box h4 {
		color: var(--color-warning);
		margin-bottom: var(--spacing-sm);
	}

	.tips-box ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.tips-box li {
		margin-bottom: var(--spacing-sm);
		color: var(--text-primary);
		font-size: var(--font-size-sm);
		line-height: 1.6;
	}

	.tips-box li::before {
		content: "•";
		color: var(--color-warning);
		font-weight: bold;
		display: inline-block;
		width: 1em;
		margin-right: var(--spacing-xs);
	}

	@media (max-width: 768px) {
		.explainer-grid {
			grid-template-columns: 1fr;
		}
		
		.examples-grid {
			grid-template-columns: 1fr;
		}

		.example-item {
			flex-direction: column;
			gap: var(--spacing-xs);
			text-align: center;
		}

		.explainer-section {
			padding: var(--spacing-md);
		}
	}
</style>
