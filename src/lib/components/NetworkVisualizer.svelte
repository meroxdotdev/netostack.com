<script lang="ts">
	import type { SubnetInfo } from '../types/ip.js';
	import Tooltip from './Tooltip.svelte';
	
	interface Props {
		subnetInfo: SubnetInfo;
		class?: string;
	}
	
	let { subnetInfo, class: className = '' }: Props = $props();
	
	/**
	 * Generates visual representation of network range
	 */
	function generateNetworkBlocks() {
		const totalHosts = subnetInfo.hostCount;
		const usableHosts = subnetInfo.usableHosts;
		
		// For visualization, we'll show up to 256 blocks max
		const maxBlocks = 256;
		const blocksToShow = Math.min(totalHosts, maxBlocks);
		const blockSize = totalHosts > maxBlocks ? Math.ceil(totalHosts / maxBlocks) : 1;
		
		const blocks = [];
		
		for (let i = 0; i < blocksToShow; i++) {
			const isNetwork = i === 0;
			const isBroadcast = i === blocksToShow - 1 && totalHosts > 2;
			const isUsable = !isNetwork && !isBroadcast;
			
			blocks.push({
				id: i,
				type: isNetwork ? 'network' : isBroadcast ? 'broadcast' : 'usable',
				represents: blockSize,
				tooltip: isNetwork 
					? 'Network Address' 
					: isBroadcast 
						? 'Broadcast Address' 
						: `Usable Host${blockSize > 1 ? 's' : ''}`
			});
		}
		
		return blocks;
	}
	
	let networkBlocks = $derived(generateNetworkBlocks());
	let usablePercentage = $derived(subnetInfo.hostCount > 0 ? (subnetInfo.usableHosts / subnetInfo.hostCount) * 100 : 0);
</script>

<div class="network-visualizer {className}">
	<section class="visualizer-section">
		<h3>Network Visualization</h3>
		
		<!-- Network Range Bar -->
		<div class="range-section">
			<div class="range-header">
				<span class="range-label">Address Range</span>
				<span class="range-count">
					{subnetInfo.hostCount.toLocaleString()} total addresses
				</span>
			</div>
			
			<div class="range-bar">
				<!-- Network Address -->
				<div 
					class="range-segment network"
					style="width: {100 / subnetInfo.hostCount}%"
					title="Network Address"
				>
					{#if subnetInfo.hostCount <= 32}
						<span class="segment-label">N</span>
					{/if}
				</div>
				
				<!-- Usable Hosts -->
				<div 
					class="range-segment usable"
					style="left: {100 / subnetInfo.hostCount}%; width: {usablePercentage * (1 - 2 / subnetInfo.hostCount)}%"
					title="Usable Host Addresses"
				></div>
				
				<!-- Broadcast Address -->
				{#if subnetInfo.hostCount > 1}
					<div 
						class="range-segment broadcast"
						style="width: {100 / subnetInfo.hostCount}%"
						title="Broadcast Address"
					>
						{#if subnetInfo.hostCount <= 32}
							<span class="segment-label">B</span>
						{/if}
					</div>
				{/if}
			</div>
			
			<!-- Legend -->
			<div class="range-legend">
				<div class="legend-item">
					<div class="legend-color network"></div>
					<span>Network</span>
				</div>
				<div class="legend-item">
					<div class="legend-color usable"></div>
					<span>Usable Hosts ({subnetInfo.usableHosts.toLocaleString()})</span>
				</div>
				{#if subnetInfo.hostCount > 1}
					<div class="legend-item">
						<div class="legend-color broadcast"></div>
						<span>Broadcast</span>
					</div>
				{/if}
			</div>
		</div>
	</section>
	
	<!-- Binary Subnet Mask Visualization -->
	<section class="binary-section">
		<h4>Subnet Mask Binary Breakdown</h4>
		
		<div class="binary-display">
			{#each subnetInfo.subnet.octets as octet, i}
				<div class="binary-row">
					<span class="octet-decimal">
						{octet.toString().padStart(3, '0')}
					</span>
					<span class="arrow">→</span>
					<div class="bits-group">
						{#each octet.toString(2).padStart(8, '0').split('') as bit, bitIndex}
							<Tooltip text="{bit === '1' ? 'Network bit (1)' : 'Host bit (0)'} - Position {i * 8 + bitIndex + 1}" position="top">
								<span class="bit-box {bit === '1' ? 'network-bit' : 'host-bit'}">
									{bit}
								</span>
							</Tooltip>
						{/each}
					</div>
					<span class="octet-label">
						(Octet {i + 1})
					</span>
				</div>
			{/each}
		</div>
		
		<div class="binary-summary">
			<div class="bit-stats">
				<div class="bit-stat">
					<div class="legend-color network"></div>
					<span>Network bits: {subnetInfo.cidr}</span>
				</div>
				<div class="bit-stat">
					<div class="legend-color host"></div>
					<span>Host bits: {32 - subnetInfo.cidr}</span>
				</div>
			</div>
		</div>
	</section>
	
	<!-- Address Grid (for smaller subnets) -->
	{#if subnetInfo.hostCount <= 64}
		<section class="grid-section">
			<h4>Address Grid</h4>
			
			<div class="address-grid-wrap">
				<div class="address-grid">
					{#each networkBlocks as block}
						<Tooltip text="{block.tooltip}" position="top">
							<div class="address-block {block.type}">
								{#if block.type === 'network'}
									N
								{:else if block.type === 'broadcast'}
									B
								{:else}
									{block.id}
								{/if}
							</div>
						</Tooltip>
					{/each}
				</div>
			</div>
		</section>
	{/if}
	
	<!-- Efficiency Metrics -->
	<section class="efficiency-section">
		<h4>Network Efficiency</h4>
		
		<div class="efficiency-grid">
			<div class="efficiency-metric">
				<div class="metric-value">
					{usablePercentage.toFixed(1)}%
				</div>
				<div class="metric-label">
					Address Utilization
				</div>
			</div>
			
			<div class="efficiency-metric">
				<div class="metric-value">
					{subnetInfo.cidr}/32
				</div>
				<div class="metric-label">
					Network Specificity
				</div>
			</div>
		</div>
	</section>
</div>

<style>
	.network-visualizer {
		max-width: 100%;
	}

	.visualizer-section {
		margin-bottom: var(--spacing-lg);
	}

	.visualizer-section h3 {
		margin-bottom: var(--spacing-md);
	}

	.range-section {
		margin-bottom: var(--spacing-md);
	}

	.range-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-sm);
	}

	.range-label {
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--text-primary);
	}

	.range-count {
		font-size: var(--font-size-sm);
		color: var(--text-secondary);
	}

	.range-bar {
		position: relative;
		height: 2rem;
		background-color: var(--bg-tertiary);
		border-radius: var(--radius-lg);
		overflow: hidden;
		border: 1px solid var(--border-primary);
	}

	.range-segment {
		position: absolute;
		top: 0;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.range-segment.network {
		left: 0;
		background-color: var(--color-info);
	}

	.range-segment.usable {
		background-color: var(--color-success);
	}

	.range-segment.broadcast {
		right: 0;
		background-color: var(--color-error);
	}

	.segment-label {
		font-size: var(--font-size-xs);
		color: var(--text-primary);
		font-weight: 600;
	}

	.range-legend {
		display: flex;
		justify-content: center;
		gap: var(--spacing-lg);
		margin-top: var(--spacing-sm);
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		font-size: var(--font-size-sm);
		color: var(--text-secondary);
	}

	.legend-color {
		width: 0.75rem;
		height: 0.75rem;
		border-radius: var(--radius-sm);
	}

	.legend-color.network {
		background-color: var(--color-info);
	}

	.legend-color.usable {
		background-color: var(--color-success);
	}

	.legend-color.broadcast {
		background-color: var(--color-error);
	}

	.legend-color.host {
		background-color: var(--text-secondary);
	}

	.binary-section {
		background-color: var(--bg-tertiary);
		border-radius: var(--radius-lg);
		padding: var(--spacing-md);
		margin-bottom: var(--spacing-lg);
	}

	.binary-section h4 {
		margin-bottom: var(--spacing-sm);
	}

	.binary-display {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
		font-family: var(--font-mono);
		font-size: var(--font-size-sm);
	}

	.binary-row {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.octet-decimal {
		width: 3rem;
		color: var(--text-secondary);
		text-align: right;
	}

	.arrow {
		font-size: var(--font-size-lg);
		color: var(--text-secondary);
	}

	.bits-group {
		display: flex;
		gap: var(--spacing-xs);
	}

	.bit-box {
		width: 1.5rem;
		height: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--font-size-xs);
		border-radius: var(--radius-sm);
		cursor: help;
	}

	.bit-box.network-bit {
		background-color: var(--color-info);
		color: var(--text-primary);
	}

	.bit-box.host-bit {
		background-color: var(--bg-secondary);
		color: var(--text-secondary);
		border: 1px solid var(--border-primary);
	}

	.octet-label {
		color: var(--text-secondary);
		font-size: var(--font-size-xs);
	}

	.binary-summary {
		margin-top: var(--spacing-md);
		padding-top: var(--spacing-sm);
		border-top: 1px solid var(--border-primary);
	}

	.bit-stats {
		display: flex;
		justify-content: space-between;
		font-size: var(--font-size-sm);
	}

	.bit-stat {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		color: var(--text-secondary);
	}

	.grid-section {
		margin-bottom: var(--spacing-lg);
	}

	.grid-section h4 {
		margin-bottom: var(--spacing-sm);
	}

	.address-grid-wrap {
		padding: var(--spacing-md);
		background-color: var(--bg-tertiary);
		border-radius: var(--radius-lg);
		width: 100%;
	}
	.address-grid {
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		gap: var(--spacing-xs);
		width: fit-content;
	}

	.address-block {
		width: 3rem;
		height: 3rem;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--font-size-xs);
		font-weight: 600;
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: transform var(--transition-fast);
	}

	.address-block:hover {
		transform: scale(1.1);
	}

	.address-block.network {
		background-color: var(--color-info);
		color: var(--text-primary);
	}

	.address-block.broadcast {
		background-color: var(--color-error);
		color: var(--text-primary);
	}

	.address-block.usable {
		background-color: var(--color-success);
		color: var(--text-primary);
	}

	.address-block.usable:hover {
		background-color: var(--color-success-light);
	}

	.efficiency-section {
		padding: var(--spacing-md);
		background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary));
		border-radius: var(--radius-lg);
		border: 1px solid var(--border-secondary);
	}

	.efficiency-section h4 {
		margin-bottom: var(--spacing-sm);
	}

	.efficiency-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--spacing-md);
	}

	.efficiency-metric {
		text-align: center;
	}

	.efficiency-metric .metric-value {
		font-size: var(--font-size-2xl);
		font-weight: 700;
		color: var(--color-info-light);
		margin-bottom: var(--spacing-xs);
	}

	.efficiency-metric .metric-label {
		font-size: var(--font-size-sm);
		color: var(--text-secondary);
	}

	@media (max-width: 768px) {
		.range-legend {
			flex-direction: column;
			align-items: center;
			gap: var(--spacing-sm);
		}

		.binary-row {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--spacing-xs);
		}

		.bit-stats {
			flex-direction: column;
			gap: var(--spacing-sm);
		}

		.efficiency-grid {
			grid-template-columns: 1fr;
		}

		.address-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}
</style>
