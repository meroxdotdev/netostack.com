<script lang="ts">
  import { convertIPFormats, decimalToIP, binaryToIP, hexToIP, getIPClass } from '../utils/ip-conversions.js';
  import { validateIPv4 } from '../utils/ip-validation.js';
  import IPInput from './IPInput.svelte';
  import Tooltip from './Tooltip.svelte';

  let ipAddress = $state('192.168.1.1');
  let formats = $state({
    binary: '',
    decimal: '',
    hex: '',
    octal: ''
  });
  let ipClass = $state({ class: '', type: '', description: '' });
  let copiedStates = $state<Record<string, boolean>>({});

  /**
   * Updates all format conversions when IP changes
   */
  $effect(() => {
    if (ipAddress && validateIPv4(ipAddress).valid) {
      formats = convertIPFormats(ipAddress);
      ipClass = getIPClass(ipAddress);
    }
  });

  /**
   * Converts from decimal to IP
   */
  function handleDecimalInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const decimal = parseInt(target.value);
    
    if (!isNaN(decimal) && decimal >= 0 && decimal <= 4294967295) {
      try {
        ipAddress = decimalToIP(decimal);
      } catch (err) {
        console.error('Invalid decimal conversion:', err);
      }
    }
  }

  /**
   * Converts from binary to IP
   */
  function handleBinaryInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const binary = target.value.replace(/[^01.\s]/g, '');
    
    if (binary.replace(/[.\s]/g, '').length === 32) {
      try {
        ipAddress = binaryToIP(binary);
      } catch (err) {
        console.error('Invalid binary conversion:', err);
      }
    }
  }

  /**
   * Converts from hex to IP
   */
  function handleHexInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const hex = target.value.replace(/[^0-9a-fA-F.x]/g, '');
    
    if (hex.replace(/[.x]/g, '').length === 8) {
      try {
        ipAddress = hexToIP(hex);
      } catch (err) {
        console.error('Invalid hex conversion:', err);
      }
    }
  }

  /**
   * Copies text to clipboard with visual feedback
   */
  async function copyToClipboard(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      copiedStates[id] = true;
      setTimeout(() => {
        copiedStates[id] = false;
      }, 3000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }
</script>

<div class="card">
  <header class="card-header">
    <h2>IP Address Converter</h2>
    <p>Convert IP addresses between different number formats.</p>
  </header>

  <!-- Main IP Input -->
  <div class="form-group">
    <IPInput 
      bind:value={ipAddress}
      label="IP Address"
      placeholder="192.168.1.1"
    />
  </div>

  {#if validateIPv4(ipAddress).valid}
    <div class="results-section fade-in">
      <!-- IP Class Information -->
      <section class="info-panel info">
        <h3>IP Class Information</h3>
        <div class="grid grid-3">
          <div class="class-info">
            <span class="info-label">Class</span>
            <span class="class-value">{ipClass.class}</span>
          </div>
          <div class="class-info">
            <span class="info-label">Type</span>
            <span class="class-value type">{ipClass.type}</span>
          </div>
          <div class="class-info">
            <span class="info-label">Usage</span>
            <span class="class-description">{ipClass.description}</span>
          </div>
        </div>
      </section>

      <!-- Format Conversions -->
      <div class="grid grid-2 conversions-grid">
        <!-- Binary Format -->
        <div class="format-group">
          <label for="binary-input">Binary Format</label>
          <div class="format-input">
            <input
              id="binary-input"
              type="text"
              value={formats.binary}
              placeholder="11000000.10101000.00000001.00000001"
              class="format-field binary"
              oninput={handleBinaryInput}
            />
            <Tooltip text={copiedStates['binary'] ? 'Copied!' : 'Copy binary format to clipboard'} position="left">
              <button
                type="button"
                class="copy-btn {copiedStates['binary'] ? 'copied' : ''}"
                onclick={() => copyToClipboard(formats.binary, 'binary')}
                aria-label="Copy binary format to clipboard"
              >
                {#if copiedStates['binary']}
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                {:else}
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                  </svg>
                {/if}
              </button>
            </Tooltip>
          </div>
        </div>

        <!-- Decimal Format -->
        <div class="format-group">
          <label for="decimal-input">Decimal Format</label>
          <div class="format-input">
            <input
              id="decimal-input"
              type="text"
              value={formats.decimal}
              placeholder="3232235777"
              class="format-field decimal"
              oninput={handleDecimalInput}
            />
            <Tooltip text={copiedStates['decimal'] ? 'Copied!' : 'Copy decimal format to clipboard'} position="left">
              <button
                type="button"
                class="copy-btn {copiedStates['decimal'] ? 'copied' : ''}"
                onclick={() => copyToClipboard(formats.decimal, 'decimal')}
                aria-label="Copy decimal format to clipboard"
              >
                {#if copiedStates['decimal']}
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                {:else}
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                  </svg>
                {/if}
              </button>
            </Tooltip>
          </div>
        </div>

        <!-- Hexadecimal Format -->
        <div class="format-group">
          <label for="hex-input">Hexadecimal Format</label>
          <div class="format-input">
            <input
              id="hex-input"
              type="text"
              value={formats.hex}
              placeholder="0xC0.0xA8.0x01.0x01"
              class="format-field hex"
              oninput={handleHexInput}
            />
            <Tooltip text={copiedStates['hex'] ? 'Copied!' : 'Copy hexadecimal format to clipboard'} position="left">
              <button
                type="button"
                class="copy-btn {copiedStates['hex'] ? 'copied' : ''}"
                onclick={() => copyToClipboard(formats.hex, 'hex')}
                aria-label="Copy hexadecimal format to clipboard"
              >
                {#if copiedStates['hex']}
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                {:else}
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                  </svg>
                {/if}
              </button>
            </Tooltip>
          </div>
        </div>

        <!-- Octal Format -->
        <div class="format-group">
          <label for="octal-input">Octal Format</label>
          <div class="format-input">
            <input
              id="octal-input"
              type="text"
              value={formats.octal}
              placeholder="0300.0250.001.001"
              class="format-field octal"
              readonly
            />
            <Tooltip text={copiedStates['octal'] ? 'Copied!' : 'Copy octal format to clipboard'} position="left">
              <button
                type="button"
                class="copy-btn {copiedStates['octal'] ? 'copied' : ''}"
                onclick={() => copyToClipboard(formats.octal, 'octal')}
                aria-label="Copy octal format to clipboard"
              >
                {#if copiedStates['octal']}
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                {:else}
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                  </svg>
                {/if}
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      <!-- Format Examples -->
      <section class="examples-section">
        <h3>Format Examples</h3>
        <div class="grid grid-4">
          <div class="example">
            <span class="example-label binary">Binary</span>
            <code class="example-value">11000000.10101000...</code>
          </div>
          <div class="example">
            <span class="example-label decimal">Decimal</span>
            <code class="example-value">3232235777</code>
          </div>
          <div class="example">
            <span class="example-label hex">Hexadecimal</span>
            <code class="example-value">0xC0A80101</code>
          </div>
          <div class="example">
            <span class="example-label octal">Octal</span>
            <code class="example-value">030052000401</code>
          </div>
        </div>
      </section>
    </div>
  {/if}
</div>

<style>
  .results-section {
    margin-top: var(--spacing-lg);
  }

  .class-info {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .class-value {
    display: block;
    font-size: var(--font-size-xl);
    font-weight: 700;
    font-family: var(--font-mono);
    color: var(--color-primary);
    margin-top: var(--spacing-xs);
  }

  .class-value.type {
    color: var(--color-info-light);
  }

  .class-description {
    display: block;
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    margin-top: var(--spacing-xs);
  }

  .conversions-grid {
    margin-top: var(--spacing-lg);
  }

  .format-group {
    margin-bottom: var(--spacing-md);
  }

  .format-input {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .format-field {
    flex: 1;
    font-family: var(--font-mono);
    font-size: var(--font-size-md);
  }

  .format-field.binary {
    border-color: var(--color-info);
  }

  .format-field.decimal {
    border-color: var(--color-success);
  }

  .format-field.hex {
    border-color: var(--color-warning);
  }

  .format-field.octal {
    border-color: var(--text-secondary);
    background-color: var(--bg-tertiary);
    cursor: default;
  }

  .copy-btn {
    width: 2rem;
    height: 2rem;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    color: var(--text-secondary);
    transition: all var(--transition-fast);
  }

  .copy-btn svg {
    width: 1rem;
    height: 1rem;
  }

  .copy-btn:hover {
    background-color: var(--surface-hover);
    color: var(--text-primary);
    border-color: var(--color-primary);
  }


  .examples-section {
    margin-top: var(--spacing-lg);
    padding: var(--spacing-md);
    background-color: var(--bg-tertiary);
    border-radius: var(--radius-lg);
  }

  .example {
    text-align: center;
  }

  .example-label {
    display: block;
    font-size: var(--font-size-xs);
    font-weight: 600;
    margin-bottom: var(--spacing-xs);
  }

  .example-label.binary {
    color: var(--color-info-light);
  }

  .example-label.decimal {
    color: var(--color-success-light);
  }

  .example-label.hex {
    color: var(--color-warning-light);
  }

  .example-label.octal {
    color: var(--text-secondary);
  }

  .example-value {
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
  }

  @media (max-width: 768px) {
    .format-input {
      flex-direction: column;
      align-items: stretch;
    }

    .copy-btn {
      align-self: center;
    }
  }
</style>