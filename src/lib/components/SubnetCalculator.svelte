<script lang="ts">
  import { calculateSubnet } from '../utils/ip-calculations.js';
  import { validateCIDR } from '../utils/ip-validation.js';
  import CIDRInput from './CIDRInput.svelte';
  import NetworkVisualizer from './NetworkVisualizer.svelte';
  import Tooltip from './Tooltip.svelte';
  import SvgIcon from './SvgIcon.svelte';
  import type { SubnetInfo } from '../types/ip.js';

  let cidrInput = $state('192.168.1.0/24');
  let subnetInfo: SubnetInfo | null = $state(null);
  let isCalculating = $state(false);
  let hasEverShownResults = $state(false);

  /**
   * Calculate subnet info when input changes
   */
  $effect(() => {
    if (cidrInput && validateCIDR(cidrInput).valid) {
      isCalculating = true;
      const [ip, cidr] = cidrInput.split('/');
      setTimeout(() => {
        subnetInfo = calculateSubnet(ip, parseInt(cidr, 10));
        isCalculating = false;
        if (!hasEverShownResults) {
          hasEverShownResults = true;
        }
      }, 100);
    } else {
      subnetInfo = null;
    }
  });

  /**
   * Format large numbers
   */
  function formatNumber(num: number): string {
    return num.toLocaleString();
  }

  let copiedStates = $state<Record<string, boolean>>({});

  /**
   * Copy to clipboard with visual feedback
   */
  async function copyToClipboard(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      copiedStates[id] = true;
      setTimeout(() => {
        copiedStates[id] = false;
      }, 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }
</script>

<div class="card">
  <header class="card-header">
    <h2>Subnet Calculator</h2>
    <p>Calculate network, broadcast, and host information for any subnet.</p>
  </header>

  <!-- Input -->
  <div class="form-group">
    <CIDRInput 
      bind:value={cidrInput}
      label="Network Address (CIDR)"
      placeholder="192.168.1.0/24"
    />
  </div>

  <!-- Results -->
  {#if subnetInfo}
    <div class="grid grid-2 {!hasEverShownResults ? 'fade-in' : ''} {isCalculating ? 'calculating' : ''}">
      <!-- Network Info -->
      <section>
        <h3 style="margin-bottom: var(--spacing-md); border-bottom: 1px solid var(--border-primary); padding-bottom: var(--spacing-xs);">
          Network Information
        </h3>
        
        <div class="info-cards">
          <div class="info-card">
            <span class="info-label">Network Address</span>
            <div class="value-copy">
              <code class="ip-value success">{subnetInfo.network.octets.join('.')}</code>
              <Tooltip text={copiedStates['network'] ? 'Copied!' : 'Copy network address to clipboard'} position="top">
                <button 
                  type="button" 
                  class="btn-icon copy-btn {copiedStates['network'] ? 'copied' : ''}" 
                  onclick={() => copyToClipboard(subnetInfo!.network.octets.join('.'), 'network')}
                  aria-label="Copy network address"
                >
                  <SvgIcon icon={copiedStates['network'] ? 'check' : 'clipboard'} size="md" />
                </button>
              </Tooltip>
            </div>
          </div>

          <div class="info-card">
            <span class="info-label">Broadcast Address</span>
            <div class="value-copy">
              <code class="ip-value error">{subnetInfo.broadcast.octets.join('.')}</code>
              <Tooltip text={copiedStates['broadcast'] ? 'Copied!' : 'Copy broadcast address to clipboard'} position="top">
                <button 
                  type="button" 
                  class="btn-icon copy-btn {copiedStates['broadcast'] ? 'copied' : ''}" 
                  onclick={() => copyToClipboard(subnetInfo!.broadcast.octets.join('.'), 'broadcast')}
                  aria-label="Copy broadcast address"
                >
                  <SvgIcon icon={copiedStates['broadcast'] ? 'check' : 'clipboard'} size="md" />
                </button>
              </Tooltip>
            </div>
          </div>

          <div class="info-card">
            <span class="info-label">Subnet Mask</span>
            <div class="value-copy">
              <code class="ip-value info">{subnetInfo.subnet.octets.join('.')}</code>
              <span class="cidr">/{subnetInfo.cidr}</span>
            </div>
          </div>

          <div class="info-card">
            <span class="info-label">Wildcard Mask</span>
            <code class="ip-value warning">{subnetInfo.wildcardMask.octets.join('.')}</code>
          </div>
        </div>
      </section>

      <!-- Host Info -->
      <section>
        <h3 style="margin-bottom: var(--spacing-md); border-bottom: 1px solid var(--border-primary); padding-bottom: var(--spacing-xs);">
          Host Information
        </h3>
        
        <div class="info-cards">
          <div class="info-card">
            <span class="info-label">Total Hosts</span>
            <span class="metric-value info">{formatNumber(subnetInfo.hostCount)}</span>
          </div>

          <div class="info-card">
            <span class="info-label">Usable Hosts</span>
            <span class="metric-value success">{formatNumber(subnetInfo.usableHosts)}</span>
          </div>

          <div class="info-card">
            <span class="info-label">First Host</span>
            <code class="ip-value success">{subnetInfo.firstHost.octets.join('.')}</code>
          </div>

          <div class="info-card">
            <span class="info-label">Last Host</span>
            <code class="ip-value success">{subnetInfo.lastHost.octets.join('.')}</code>
          </div>
        </div>
      </section>
    </div>

    <!-- Binary Representation -->
    <section class="info-panel" style="margin-top: var(--spacing-lg);">
      <h3>Binary Representation</h3>
      <div class="binary-display">
        <div class="binary-row">
          <span class="info-label">Network:</span>
          <code class="binary-value success">{subnetInfo.network.binary}</code>
        </div>
        <div class="binary-row">
          <span class="info-label">Mask:</span>
          <code class="binary-value info">{subnetInfo.subnet.binary}</code>
        </div>
        <div class="binary-row">
          <span class="info-label">Broadcast:</span>
          <code class="binary-value error">{subnetInfo.broadcast.binary}</code>
        </div>
      </div>
    </section>

    <!-- Network Visualization -->
    <section style="margin-top: var(--spacing-lg);">
      <NetworkVisualizer {subnetInfo} />
    </section>
  {/if}

  <!-- Loading -->
  {#if isCalculating}
    <div class="loading" style="justify-content: center; padding: var(--spacing-xl);">
      <div class="spinner"></div>
      Calculating subnet...
    </div>
  {/if}

  <!-- Explainer Section -->
  <section class="explainer-section">
    <h3>Understanding Subnet Calculations</h3>
    
    <div class="explainer-grid">
      <div class="explainer-card">
        <h4>Network Address</h4>
        <p>The first IP address in a subnet, used to identify the network itself. Hosts cannot be assigned this address as it represents the entire network segment.</p>
      </div>

      <div class="explainer-card">
        <h4>Broadcast Address</h4>
        <p>The last IP address in a subnet, used to send messages to all devices on the network. When a packet is sent to this address, it reaches every host in the subnet.</p>
      </div>

      <div class="explainer-card">
        <h4>Subnet Mask</h4>
        <p>Defines which portion of an IP address represents the network and which represents the host. A mask of /24 means the first 24 bits identify the network.</p>
      </div>

      <div class="explainer-card">
        <h4>Wildcard Mask</h4>
        <p>The inverse of a subnet mask, used in access control lists. Where the subnet mask has 1s, the wildcard has 0s, and vice versa.</p>
      </div>

      <div class="explainer-card">
        <h4>Usable Hosts</h4>
        <p>The number of IP addresses available for devices. Always 2 less than total addresses because network and broadcast addresses are reserved.</p>
      </div>

      <div class="explainer-card">
        <h4>CIDR Notation</h4>
        <p>Classless Inter-Domain Routing notation (e.g., /24) indicates how many bits are used for the network portion. Higher numbers mean smaller subnets with fewer hosts.</p>
      </div>
    </div>

    <div class="tips-box">
      <h4>💡 Pro Tips</h4>
      <ul>
        <li><strong>Plan for Growth:</strong> Choose subnet sizes that accommodate future expansion</li>
        <li><strong>Binary Understanding:</strong> Learning binary helps understand how subnetting works</li>
        <li><strong>Common Sizes:</strong> /24 (254 hosts), /25 (126 hosts), /26 (62 hosts), /30 (2 hosts for point-to-point)</li>
        <li><strong>Private Networks:</strong> Use RFC 1918 addresses (10.x.x.x, 172.16-31.x.x, 192.168.x.x) for internal networks</li>
      </ul>
    </div>
  </section>
</div>

<style>
  .calculating {
    opacity: 0.7;
    pointer-events: none;
    transition: opacity var(--transition-fast);
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
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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
    
    .explainer-section {
      padding: var(--spacing-md);
    }
  }
</style>
