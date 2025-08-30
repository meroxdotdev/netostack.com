<script lang="ts">
	import { NETWORK_CLASSES, RESERVED_RANGES, COMMON_SUBNETS } from '$lib/constants/networks.js';
	import Tooltip from '$lib/components/Tooltip.svelte';
	
	let selectedCategory = $state<'classes' | 'reserved' | 'subnets'>('classes');
</script>

<div class="card">
	<header class="card-header">
		<h2>Network Reference</h2>
		<p>Essential networking information and constants for IP address planning.</p>
	</header>
	
	<!-- Category Tabs -->
	<div class="tabs">
		<button
			type="button"
			class="tab {selectedCategory === 'classes' ? 'active' : ''}"
			onclick={() => selectedCategory = 'classes'}
		>
			Network Classes
		</button>
		<button
			type="button"
			class="tab {selectedCategory === 'reserved' ? 'active' : ''}"
			onclick={() => selectedCategory = 'reserved'}
		>
			Reserved Ranges
		</button>
		<button
			type="button"
			class="tab {selectedCategory === 'subnets' ? 'active' : ''}"
			onclick={() => selectedCategory = 'subnets'}
		>
			Common Subnets
		</button>
	</div>
	
	<!-- Network Classes -->
	{#if selectedCategory === 'classes'}
		<div class="reference-section fade-in">
			{#each Object.entries(NETWORK_CLASSES) as [className, classInfo]}
				<Tooltip text="Class {className} networks use {classInfo.defaultMask} as default subnet mask and support {classInfo.range}" position="top">
					<div class="reference-card">
						<div class="card-header-inline">
							<div class="class-info">
								<div class="class-badge {className.toLowerCase()}">
									{className}
								</div>
								<div class="class-details">
									<h3>Class {className}</h3>
									<span class="mask-info">
										{classInfo.defaultMask} (/{classInfo.cidr})
									</span>
								</div>
							</div>
							<span class="range-badge">
								{classInfo.range.split(' - ')[0]} - {classInfo.range.split(' - ')[1]}
							</span>
						</div>
						
						<p class="class-description">
							{classInfo.description}
						</p>
						
						<p class="usage-info">
							<strong>Typical Usage:</strong> {classInfo.usage}
						</p>
					</div>
				</Tooltip>
			{/each}
		</div>
	{/if}
	
	<!-- Reserved Ranges -->
	{#if selectedCategory === 'reserved'}
		<div class="reference-section fade-in">
			{#each Object.entries(RESERVED_RANGES) as [rangeName, rangeInfo]}
				<Tooltip text="{rangeInfo.description} - Defined in {rangeInfo.rfc}" position="top">
					<div class="reference-card">
						<div class="card-header-inline">
							<div class="range-info">
								<h3 class="range-address">
									{rangeInfo.range}
								</h3>
								<span class="range-description">
									{rangeInfo.description}
								</span>
							</div>
							<span class="rfc-badge">
								{rangeInfo.rfc}
							</span>
						</div>
						
						<!-- Special highlighting for private networks -->
						{#if rangeName.includes('PRIVATE')}
							<div class="private-notice">
								<strong>Private Network:</strong> Not routed on the public Internet
							</div>
						{/if}
					</div>
				</Tooltip>
			{/each}
		</div>
	{/if}
	
	<!-- Common Subnets -->
	{#if selectedCategory === 'subnets'}
		<div class="subnets-table fade-in">
			<div class="table-header">
				<span>CIDR</span>
				<span>Subnet Mask</span>
				<span>Hosts</span>
				<span>Usage</span>
			</div>
			
			{#each COMMON_SUBNETS as subnet}
				<Tooltip text="/{subnet.cidr} subnet with mask {subnet.mask} supports {subnet.hosts.toLocaleString()} hosts" position="top">
					<div class="table-row">
						<span class="cidr-cell">
							/{subnet.cidr}
						</span>
						<span class="mask-cell">
							{subnet.mask}
						</span>
						<span class="hosts-cell">
							{subnet.hosts.toLocaleString()}
						</span>
						<span class="usage-cell">
							{#if subnet.cidr === 8}
								Large ISPs
							{:else if subnet.cidr === 16}
								Universities
							{:else if subnet.cidr === 24}
								Small businesses
							{:else if subnet.cidr === 25}
								Departments
							{:else if subnet.cidr === 26}
								Teams
							{:else if subnet.cidr === 27}
								Small offices
							{:else if subnet.cidr === 28}
								Workgroups
							{:else if subnet.cidr === 29}
								Small groups
							{:else if subnet.cidr === 30}
								Point-to-point
							{:else}
								General use
							{/if}
						</span>
					</div>
				</Tooltip>
			{/each}
		</div>
	{/if}
	
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
	.reference-section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
		margin: var(--spacing-lg) 0;
	}

	.card-header-inline {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: var(--spacing-sm);
		
		@media (max-width: 768px) {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--spacing-sm);
		}
	}

	.class-info {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.class-badge {
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		color: var(--text-primary);
		
		&.a { background-color: var(--color-info); }
		&.b { background-color: var(--color-success); }
		&.c { background-color: var(--color-warning); }
	}

	.class-details {
		h3 {
			font-weight: 600;
			color: var(--text-primary);
			margin: 0;
		}
	}

	.mask-info {
		font-size: var(--font-size-sm);
		color: var(--text-secondary);
		font-family: var(--font-mono);
	}

	.range-badge {
		font-size: var(--font-size-xs);
		color: var(--text-secondary);
		background-color: var(--bg-tertiary);
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--radius-sm);
	}

	.class-description {
		font-size: var(--font-size-sm);
		color: var(--text-primary);
		margin-bottom: var(--spacing-sm);
	}

	.usage-info {
		font-size: var(--font-size-xs);
		color: var(--text-secondary);
	}

	.range-info {
		h3 {
			font-family: var(--font-mono);
			font-weight: 600;
			color: var(--text-primary);
			margin: 0;
		}
	}

	.range-description {
		font-size: var(--font-size-sm);
		color: var(--text-secondary);
	}

	.rfc-badge {
		font-size: var(--font-size-xs);
		color: var(--color-info-light);
		background-color: rgba(9, 105, 218, 0.1);
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--radius-sm);
	}

	.private-notice {
		margin-top: var(--spacing-sm);
		padding: var(--spacing-sm);
		background-color: rgba(35, 134, 54, 0.1);
		border-radius: var(--radius-sm);
		font-size: var(--font-size-xs);
		color: var(--color-success-light);
	}

	.subnets-table {
		margin: var(--spacing-lg) 0;
		
		:global(.tooltip-container) {
			width: 100%;
		}
	}

	.table-header {
		display: grid;
		grid-template-columns: 1fr 2fr 1.5fr 2fr;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm);
		font-size: var(--font-size-sm);
		font-weight: 600;
		color: var(--text-secondary);
		border-bottom: 1px solid var(--border-primary);
		margin-bottom: var(--spacing-sm);
		
		> span {
			display: flex;
			align-items: center;
			
			&:nth-child(1), &:nth-child(2), &:nth-child(4) {
				justify-content: flex-start;
			}
			
			&:nth-child(3) {
				justify-content: flex-end;
			}
		}
		
		@media (max-width: 768px) {
			display: none;
		}
	}

	.table-row {
		display: grid;
		grid-template-columns: 1fr 2fr 1.5fr 2fr;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm);
		background-color: var(--bg-tertiary);
		border-radius: var(--radius-lg);
		margin-bottom: var(--spacing-xs);
		transition: background-color var(--transition-fast);
		cursor: help;
		
		&:hover {
			background-color: var(--surface-hover);
		}
		
		@media (max-width: 768px) {
			display: flex;
			flex-direction: column;
			grid-template-columns: 1fr;
			gap: var(--spacing-xs);
			padding: var(--spacing-md);
		}
	}

	.cidr-cell, .mask-cell, .hosts-cell, .usage-cell {
		display: flex;
		align-items: center;
		font-family: var(--font-mono);
		
		@media (max-width: 768px) {
			&::before {
				color: var(--text-secondary);
				font-weight: normal;
			}
		}
	}

	.cidr-cell {
		font-weight: 700;
		color: var(--color-info-light);
		justify-content: flex-start;
		
		@media (max-width: 768px) {
			&::before {
				content: 'CIDR: ';
			}
		}
	}

	.mask-cell {
		font-size: var(--font-size-sm);
		color: var(--text-primary);
		justify-content: flex-start;
		
		@media (max-width: 768px) {
			&::before {
				content: 'Mask: ';
			}
		}
	}

	.hosts-cell {
		font-size: var(--font-size-sm);
		color: var(--color-success-light);
		justify-content: flex-end;
		
		@media (max-width: 768px) {
			&::before {
				content: 'Hosts: ';
			}
		}
	}

	.usage-cell {
		font-size: var(--font-size-sm);
		color: var(--text-secondary);
		justify-content: flex-start;
		font-family: inherit;
		
		@media (max-width: 768px) {
			&::before {
				content: 'Usage: ';
			}
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
				width: 1rem;
				height: 1rem;
				color: var(--color-warning);
			}
		}
		
		.tips-list {
			list-style: none;
			font-size: var(--font-size-sm);
			color: var(--text-primary);
			line-height: 1.6;
			display: flex;
			flex-direction: column;
			gap: var(--spacing-xs);
		}
	}
</style>
