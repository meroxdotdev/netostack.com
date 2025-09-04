<script lang="ts">
  import { tooltip } from '$lib/actions/tooltip.js';
  import Icon from '$lib/components/global/Icon.svelte';
  
  type RegexType = 'ipv4' | 'ipv6' | 'both';
  type Mode = 'simple' | 'advanced';
  
  let mode = $state<Mode>('simple');
  let regexType = $state<RegexType>('ipv4');
  let copiedStates = $state<Record<string, boolean>>({});
  
  // Advanced options
  let ipv4Options = $state({
    allowLeadingZeros: false,
    requireAllOctets: true,
    allowPrivateOnly: false,
    allowPublicOnly: false,
    wordBoundaries: true,
    caseInsensitive: false
  });
  
  let ipv6Options = $state({
    allowCompressed: true,
    allowFullForm: true,
    allowZoneId: false,
    allowEmbeddedIPv4: true,
    wordBoundaries: true,
    caseInsensitive: true
  });

  interface RegexResult {
    pattern: string;
    flags: string;
    description: string;
    tradeoffs: string[];
    limitations: string[];
    testCases: {
      valid: string[];
      invalid: string[];
    };
  }

  let result = $state<RegexResult | null>(null);

  function generateIPv4Regex(): RegexResult {
    let pattern: string;
    let tradeoffs: string[] = [];
    let limitations: string[] = [];

    if (mode === 'simple') {
      // Simple but safe IPv4 pattern
      pattern = '(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)';
      tradeoffs = [
        'Allows leading zeros (001.002.003.004)',
        'May match invalid IPs in larger strings without word boundaries'
      ];
      limitations = [
        'Does not validate semantic meaning (e.g., allows 999.999.999.999 structure-wise)',
        'Allows octets like 01, 001 which some systems reject'
      ];
    } else {
      // Advanced IPv4 pattern with options
      let octetPattern: string;
      
      if (ipv4Options.allowLeadingZeros) {
        octetPattern = '(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)';
        tradeoffs.push('Allows leading zeros in octets');
      } else {
        octetPattern = '(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])';
        tradeoffs.push('Rejects leading zeros for stricter validation');
      }

      // Handle private/public IP restrictions
      if (ipv4Options.allowPrivateOnly) {
        pattern = '(?:10\\.(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\\.(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\\.(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])|172\\.(?:1[6-9]|2[0-9]|3[01])\\.(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\\.(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])|192\\.168\\.(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\\.(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9]))';
        tradeoffs.push('Only matches private IP ranges (10.x.x.x, 172.16-31.x.x, 192.168.x.x)');
        limitations.push('Complex pattern - harder to read and maintain');
      } else if (ipv4Options.allowPublicOnly) {
        // This would be very complex, so we'll note it as a limitation
        pattern = `(?:${octetPattern}\\.){3}${octetPattern}`;
        limitations.push('Public-only filtering requires additional validation logic - regex alone insufficient');
        tradeoffs.push('Pattern allows all valid IPs - public-only filtering needs post-processing');
      } else {
        pattern = `(?:${octetPattern}\\.){3}${octetPattern}`;
      }

      if (ipv4Options.wordBoundaries) {
        pattern = `\\b${pattern}\\b`;
        tradeoffs.push('Uses word boundaries to prevent partial matches');
      } else {
        limitations.push('May match partial IPs within larger strings');
      }
    }

    return {
      pattern,
      flags: ipv4Options.caseInsensitive ? 'i' : '',
      description: 'IPv4 address pattern matching standard dotted-decimal notation',
      tradeoffs,
      limitations,
      testCases: {
        valid: [
          '192.168.1.1',
          '10.0.0.1',
          '255.255.255.255',
          '0.0.0.0',
          ...(ipv4Options.allowLeadingZeros || mode === 'simple' ? ['001.002.003.004'] : [])
        ],
        invalid: [
          '256.256.256.256',
          '192.168.1',
          '192.168.1.1.1',
          'not.an.ip.address',
          '192.168.01.1',
          ...(!ipv4Options.allowLeadingZeros && mode === 'advanced' ? ['001.002.003.004'] : [])
        ]
      }
    };
  }

  function generateIPv6Regex(): RegexResult {
    let pattern: string;
    let tradeoffs: string[] = [];
    let limitations: string[] = [];

    if (mode === 'simple') {
      // Simplified IPv6 pattern - basic but functional
      pattern = '(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:)*::(?:[0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}|::';
      tradeoffs = [
        'Simplified pattern - may not catch all edge cases',
        'Allows some invalid forms for simplicity'
      ];
      limitations = [
        'Does not validate all IPv6 compression rules perfectly',
        'May allow multiple :: sequences (invalid)',
        'Basic pattern - not production-ready for strict validation'
      ];
    } else {
      // More comprehensive IPv6 pattern
      let parts: string[] = [];
      
      if (ipv6Options.allowFullForm) {
        parts.push('(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}');
        tradeoffs.push('Supports full uncompressed IPv6 format');
      }
      
      if (ipv6Options.allowCompressed) {
        parts.push(
          '(?:[0-9a-fA-F]{1,4}:)*::(?:[0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}',
          '(?:[0-9a-fA-F]{1,4}:)+::',
          '::(?:[0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}',
          '::'
        );
        tradeoffs.push('Supports IPv6 compression with :: notation');
        limitations.push('Complex compression validation - may allow some invalid forms');
      }

      if (ipv6Options.allowEmbeddedIPv4) {
        parts.push('(?:[0-9a-fA-F]{1,4}:){6}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])(?:\\.(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])){3}');
        parts.push('::(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])(?:\\.(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])){3}');
        tradeoffs.push('Supports IPv4-mapped IPv6 addresses');
      }

      pattern = parts.join('|');

      if (ipv6Options.allowZoneId) {
        pattern = `(?:${pattern})(?:%[0-9a-zA-Z-_.~]*)?`;
        tradeoffs.push('Supports zone IDs (e.g., %eth0, %1)');
        limitations.push('Zone ID validation is basic - allows most characters');
      }

      if (ipv6Options.wordBoundaries) {
        pattern = `\\b${pattern}\\b`;
        tradeoffs.push('Uses word boundaries for precise matching');
      }
    }

    return {
      pattern,
      flags: ipv6Options.caseInsensitive ? 'i' : '',
      description: 'IPv6 address pattern supporting various notation formats',
      tradeoffs,
      limitations: [
        ...limitations,
        'IPv6 regex is inherently complex - consider using dedicated parsing libraries',
        'Full RFC compliance requires more sophisticated validation'
      ],
      testCases: {
        valid: [
          '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
          '2001:db8:85a3::8a2e:370:7334',
          '::1',
          '::',
          ...(ipv6Options.allowEmbeddedIPv4 ? ['::ffff:192.168.1.1'] : []),
          ...(ipv6Options.allowZoneId ? ['fe80::1%eth0'] : [])
        ],
        invalid: [
          'gggg::1',
          '2001:db8::85a3::7334',
          '2001:db8:85a3:0000:0000:8a2e:0370:7334:extra',
          'not:an:ipv6:address',
          '12345::1'
        ]
      }
    };
  }

  function generateBothRegex(): RegexResult {
    const ipv4Result = generateIPv4Regex();
    const ipv6Result = generateIPv6Regex();
    
    return {
      pattern: `(?:${ipv4Result.pattern}|${ipv6Result.pattern})`,
      flags: (ipv4Options.caseInsensitive || ipv6Options.caseInsensitive) ? 'i' : '',
      description: 'Combined pattern matching both IPv4 and IPv6 addresses',
      tradeoffs: [
        ...ipv4Result.tradeoffs,
        ...ipv6Result.tradeoffs,
        'Large combined pattern - impacts performance',
        'May be overkill if you only need one IP version'
      ],
      limitations: [
        ...ipv4Result.limitations,
        ...ipv6Result.limitations,
        'Complex maintenance due to combined patterns',
        'Harder to debug when patterns conflict'
      ],
      testCases: {
        valid: [...ipv4Result.testCases.valid, ...ipv6Result.testCases.valid],
        invalid: [...ipv4Result.testCases.invalid, ...ipv6Result.testCases.invalid]
      }
    };
  }

  function generateRegex() {
    switch (regexType) {
      case 'ipv4':
        result = generateIPv4Regex();
        break;
      case 'ipv6':
        result = generateIPv6Regex();
        break;
      case 'both':
        result = generateBothRegex();
        break;
    }
  }

  function handleOptionChange() {
    generateRegex();
  }

  async function copyToClipboard(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      copiedStates[id] = true;
      setTimeout(() => {
        copiedStates[id] = false;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }

  function getRegexRUrl(): string {
    if (!result) return 'https://regexr.com';
    
    const pattern = encodeURIComponent(result.pattern);
    const flags = encodeURIComponent(result.flags);
    const testText = encodeURIComponent(result.testCases.valid.concat(result.testCases.invalid).join('\n'));
    
    return `https://regexr.com/?expression=${pattern}&flags=${flags}&text=${testText}`;
  }

  // Generate initial regex
  generateRegex();
</script>

<div class="card">
  <header class="card-header">
    <h2>IP Regex Generator</h2>
    <p>Generate safe and reliable regular expressions for IPv4 and IPv6 address validation</p>
  </header>

  <!-- Mode Selection -->
  <section class="mode-section">
    <div class="mode-toggle">
      <button
        class="mode-button {mode === 'simple' ? 'active' : ''}"
        onclick={() => { mode = 'simple'; generateRegex(); }}
      >
        <Icon name="zap" size="sm" />
        Simple Mode
      </button>
      <button
        class="mode-button {mode === 'advanced' ? 'active' : ''}"
        onclick={() => { mode = 'advanced'; generateRegex(); }}
      >
        <Icon name="settings" size="sm" />
        Advanced Mode
      </button>
    </div>
  </section>

  <!-- Type Selection -->
  <section class="type-section">
    <h4>IP Address Type</h4>
    <div class="type-options">
      <label class="type-option">
        <input
          type="radio"
          bind:group={regexType}
          value="ipv4"
          onchange={generateRegex}
        />
        <div class="option-content">
          <Icon name="globe" size="sm" />
          <span>IPv4 Only</span>
        </div>
      </label>

      <label class="type-option">
        <input
          type="radio"
          bind:group={regexType}
          value="ipv6"
          onchange={generateRegex}
        />
        <div class="option-content">
          <Icon name="globe-2" size="sm" />
          <span>IPv6 Only</span>
        </div>
      </label>

      <label class="type-option">
        <input
          type="radio"
          bind:group={regexType}
          value="both"
          onchange={generateRegex}
        />
        <div class="option-content">
          <Icon name="network" size="sm" />
          <span>Both IPv4 & IPv6</span>
        </div>
      </label>
    </div>
  </section>

  <!-- Advanced Options -->
  {#if mode === 'advanced'}
    <section class="options-section">
      <h4>Advanced Options</h4>
      
      {#if regexType === 'ipv4' || regexType === 'both'}
        <div class="options-group">
          <h5>IPv4 Options</h5>
          <div class="options-grid">
            <label class="checkbox-option">
              <input
                type="checkbox"
                bind:checked={ipv4Options.allowLeadingZeros}
                onchange={handleOptionChange}
              />
              <div class="checkbox-content">
                <span class="option-label">Allow Leading Zeros</span>
                <span class="option-description">Accept 001.002.003.004 format</span>
              </div>
            </label>

            <label class="checkbox-option">
              <input
                type="checkbox"
                bind:checked={ipv4Options.wordBoundaries}
                onchange={handleOptionChange}
              />
              <div class="checkbox-content">
                <span class="option-label">Word Boundaries</span>
                <span class="option-description">Prevent partial matches in text</span>
              </div>
            </label>

            <label class="checkbox-option">
              <input
                type="checkbox"
                bind:checked={ipv4Options.allowPrivateOnly}
                onchange={handleOptionChange}
              />
              <div class="checkbox-content">
                <span class="option-label">Private IPs Only</span>
                <span class="option-description">10.x.x.x, 172.16-31.x.x, 192.168.x.x</span>
              </div>
            </label>

            <label class="checkbox-option">
              <input
                type="checkbox"
                bind:checked={ipv4Options.caseInsensitive}
                onchange={handleOptionChange}
              />
              <div class="checkbox-content">
                <span class="option-label">Case Insensitive</span>
                <span class="option-description">Add 'i' flag for case insensitive matching</span>
              </div>
            </label>
          </div>
        </div>
      {/if}

      {#if regexType === 'ipv6' || regexType === 'both'}
        <div class="options-group">
          <h5>IPv6 Options</h5>
          <div class="options-grid">
            <label class="checkbox-option">
              <input
                type="checkbox"
                bind:checked={ipv6Options.allowCompressed}
                onchange={handleOptionChange}
              />
              <div class="checkbox-content">
                <span class="option-label">Allow Compressed</span>
                <span class="option-description">Support :: notation (2001:db8::1)</span>
              </div>
            </label>

            <label class="checkbox-option">
              <input
                type="checkbox"
                bind:checked={ipv6Options.allowFullForm}
                onchange={handleOptionChange}
              />
              <div class="checkbox-content">
                <span class="option-label">Allow Full Form</span>
                <span class="option-description">Support full 8-group format</span>
              </div>
            </label>

            <label class="checkbox-option">
              <input
                type="checkbox"
                bind:checked={ipv6Options.allowZoneId}
                onchange={handleOptionChange}
              />
              <div class="checkbox-content">
                <span class="option-label">Allow Zone ID</span>
                <span class="option-description">Support %eth0 suffixes</span>
              </div>
            </label>

            <label class="checkbox-option">
              <input
                type="checkbox"
                bind:checked={ipv6Options.allowEmbeddedIPv4}
                onchange={handleOptionChange}
              />
              <div class="checkbox-content">
                <span class="option-label">Allow Embedded IPv4</span>
                <span class="option-description">Support ::ffff:192.168.1.1</span>
              </div>
            </label>

            <label class="checkbox-option">
              <input
                type="checkbox"
                bind:checked={ipv6Options.wordBoundaries}
                onchange={handleOptionChange}
              />
              <div class="checkbox-content">
                <span class="option-label">Word Boundaries</span>
                <span class="option-description">Prevent partial matches in text</span>
              </div>
            </label>

            <label class="checkbox-option">
              <input
                type="checkbox"
                bind:checked={ipv6Options.caseInsensitive}
                onchange={handleOptionChange}
              />
              <div class="checkbox-content">
                <span class="option-label">Case Insensitive</span>
                <span class="option-description">Add 'i' flag (recommended for IPv6)</span>
              </div>
            </label>
          </div>
        </div>
      {/if}
    </section>
  {/if}

  <!-- Results -->
  {#if result}
    <section class="results-section">
      <div class="results-header">
        <h3>Generated Pattern</h3>
        <div class="results-actions">
          <a
            href={getRegexRUrl()}
            target="_blank"
            rel="noopener noreferrer"
            class="regexr-button"
            use:tooltip={"Test this pattern on RegexR.com"}
          >
            <Icon name="external-link" size="sm" />
            Test on RegexR
          </a>
        </div>
      </div>

      <!-- Regex Pattern -->
      <div class="regex-output">
        <div class="regex-pattern">
          <div class="pattern-header">
            <span class="pattern-label">Regular Expression</span>
            <button
              class="copy-button {copiedStates['pattern'] ? 'copied' : ''}"
              onclick={() => copyToClipboard(result.pattern, 'pattern')}
            >
              <Icon name={copiedStates['pattern'] ? 'check' : 'copy'} size="sm" />
              {copiedStates['pattern'] ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <code class="pattern-code">/{result.pattern}/{result.flags}</code>
        </div>

        {#if result.flags}
          <div class="regex-flags">
            <span class="flags-label">Flags:</span>
            <code class="flags-code">{result.flags}</code>
            <span class="flags-description">
              {#if result.flags.includes('i')}
                Case insensitive
              {/if}
            </span>
          </div>
        {/if}

        <div class="regex-description">
          <Icon name="info" size="sm" />
          {result.description}
        </div>
      </div>

      <!-- Language Examples -->
      <div class="language-examples">
        <h4>Implementation Examples</h4>
        <div class="examples-grid">
          <div class="example-card">
            <div class="example-header">
              <Icon name="code" size="sm" />
              <span class="example-title">JavaScript</span>
              <button
                class="copy-button {copiedStates['javascript'] ? 'copied' : ''}"
                onclick={() => copyToClipboard(`const ipRegex = /${result.pattern}/${result.flags};\nconst isValid = ipRegex.test(ipAddress);`, 'javascript')}
              >
                <Icon name={copiedStates['javascript'] ? 'check' : 'copy'} size="xs" />
              </button>
            </div>
            <code class="example-code">const ipRegex = /{result.pattern}/{result.flags};<br/>const isValid = ipRegex.test(ipAddress);</code>
          </div>

          <div class="example-card">
            <div class="example-header">
              <Icon name="code" size="sm" />
              <span class="example-title">Python</span>
              <button
                class="copy-button {copiedStates['python'] ? 'copied' : ''}"
                onclick={() => copyToClipboard(`import re\npattern = r'${result.pattern}'\nis_valid = bool(re.match(pattern, ip_address${result.flags ? ', re.IGNORECASE' : ''}))`, 'python')}
              >
                <Icon name={copiedStates['python'] ? 'check' : 'copy'} size="xs" />
              </button>
            </div>
            <code class="example-code">import re<br/>pattern = r'{result.pattern}'<br/>is_valid = bool(re.match(pattern, ip_address{result.flags ? ', re.IGNORECASE' : ''}))</code>
          </div>

          <div class="example-card">
            <div class="example-header">
              <Icon name="code" size="sm" />
              <span class="example-title">PHP</span>
              <button
                class="copy-button {copiedStates['php'] ? 'copied' : ''}"
                onclick={() => copyToClipboard(`$pattern = '/${result.pattern}/${result.flags}';\n$isValid = preg_match($pattern, $ipAddress);`, 'php')}
              >
                <Icon name={copiedStates['php'] ? 'check' : 'copy'} size="xs" />
              </button>
            </div>
            <code class="example-code">$pattern = '/{result.pattern}/{result.flags}';<br/>$isValid = preg_match($pattern, $ipAddress);</code>
          </div>
        </div>
      </div>

      <!-- Test Cases -->
      <div class="test-cases">
        <h4>Test Cases</h4>
        <div class="test-grid">
          <div class="test-group valid">
            <h5>
              <Icon name="check-circle" size="sm" />
              Should Match ({result.testCases.valid.length})
            </h5>
            <div class="test-list">
              {#each result.testCases.valid as testCase}
                <code class="test-case valid">{testCase}</code>
              {/each}
            </div>
          </div>

          <div class="test-group invalid">
            <h5>
              <Icon name="x-circle" size="sm" />
              Should Not Match ({result.testCases.invalid.length})
            </h5>
            <div class="test-list">
              {#each result.testCases.invalid as testCase}
                <code class="test-case invalid">{testCase}</code>
              {/each}
            </div>
          </div>
        </div>
      </div>

      <!-- Tradeoffs and Limitations -->
      <div class="documentation">
        <div class="doc-grid">
          {#if result.tradeoffs.length > 0}
            <div class="doc-section">
              <h4>
                <Icon name="balance-scale" size="sm" />
                Trade-offs
              </h4>
              <ul class="doc-list">
                {#each result.tradeoffs as tradeoff}
                  <li>{tradeoff}</li>
                {/each}
              </ul>
            </div>
          {/if}

          {#if result.limitations.length > 0}
            <div class="doc-section">
              <h4>
                <Icon name="alert-triangle" size="sm" />
                Limitations
              </h4>
              <ul class="doc-list">
                {#each result.limitations as limitation}
                  <li>{limitation}</li>
                {/each}
              </ul>
            </div>
          {/if}
        </div>

        <!-- Recommendations -->
        <div class="recommendations">
          <h4>
            <Icon name="lightbulb" size="sm" />
            Recommendations
          </h4>
          <div class="recommendation-list">
            <div class="recommendation">
              <Icon name="shield-check" size="sm" />
              <span>For production use, combine regex validation with dedicated IP parsing libraries</span>
            </div>
            <div class="recommendation">
              <Icon name="performance" size="sm" />
              <span>Test regex performance with your expected input size and patterns</span>
            </div>
            <div class="recommendation">
              <Icon name="test-tube" size="sm" />
              <span>Always validate regex patterns against your specific use case requirements</span>
            </div>
            <div class="recommendation">
              <Icon name="book" size="sm" />
              <span>Consider semantic validation beyond pattern matching (reserved ranges, etc.)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  {/if}
</div>

<style lang="scss">
  .mode-section {
    margin-bottom: var(--spacing-lg);
  }

  .mode-toggle {
    display: flex;
    gap: var(--spacing-sm);
    justify-content: center;
  }

  .mode-button {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-lg);
    background-color: var(--bg-secondary);
    border: 2px solid var(--border-primary);
    border-radius: var(--radius-lg);
    color: var(--text-primary);
    cursor: pointer;
    transition: all var(--transition-fast);
    font-weight: 600;

    &:hover {
      border-color: var(--color-primary);
      background-color: var(--surface-hover);
    }

    &.active {
      border-color: var(--color-primary);
      background-color: var(--color-primary);
      color: var(--bg-primary);
    }
  }

  .type-section {
    margin-bottom: var(--spacing-lg);
    
    h4 {
      margin-bottom: var(--spacing-md);
      color: var(--color-info-light);
    }
  }

  .type-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: var(--spacing-md);
    
    input {
      display: none;
    }
  }

  .type-option {
    display: flex;
    padding: var(--spacing-md);
    background-color: var(--bg-secondary);
    border: 2px solid var(--border-primary);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-fast);

    &:hover {
      border-color: var(--color-primary);
    }

    &:has(input:checked) {
      border-color: var(--color-primary);
      background-color: var(--surface-hover);
    }
  }

  .option-content {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-weight: 600;
    color: var(--text-primary);
  }

  .options-section {
    margin-bottom: var(--spacing-lg);
    padding: var(--spacing-lg);
    background-color: var(--bg-secondary);
    border-radius: var(--radius-lg);

    h4 {
      margin-bottom: var(--spacing-lg);
      color: var(--color-info-light);
    }
  }

  .options-group {
    margin-bottom: var(--spacing-lg);

    &:last-child {
      margin-bottom: 0;
    }

    h5 {
      margin-bottom: var(--spacing-md);
      color: var(--text-primary);
      font-size: var(--font-size-md);
      font-weight: 600;
    }
  }

  .options-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--spacing-md);
  }

  .checkbox-option {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    background-color: var(--bg-tertiary);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-fast);

    &:hover {
      background-color: var(--surface-hover);
    }
  }

  .checkbox-content {
    flex: 1;
  }

  .option-label {
    display: block;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 2px;
  }

  .option-description {
    display: block;
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
  }

  .results-section {
    border-top: 1px solid var(--border-secondary);
    padding-top: var(--spacing-lg);
  }

  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);

    h3 {
      color: var(--color-success-light);
      margin: 0;
    }
  }

  .regexr-button {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-md);
    background-color: var(--color-primary);
    color: var(--bg-primary);
    text-decoration: none;
    border-radius: var(--radius-md);
    font-weight: 600;
    transition: all var(--transition-fast);

    &:hover {
      background-color: var(--color-primary-dark);
      transform: translateY(-1px);
    }
  }

  .regex-output {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-lg);
  }

  .regex-pattern {
    margin-bottom: var(--spacing-md);
  }

  .pattern-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-sm);
  }

  .pattern-label {
    font-weight: 600;
    color: var(--text-primary);
    font-size: var(--font-size-sm);
  }

  .copy-button {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-secondary);
    border-radius: var(--radius-sm);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
    font-size: var(--font-size-xs);

    &:hover {
      background-color: var(--surface-hover);
      color: var(--text-primary);
    }

    &.copied {
      background-color: var(--color-success);
      color: var(--bg-primary);
      border-color: var(--color-success);
    }
  }

  .pattern-code {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--color-primary-light);
    background-color: var(--bg-tertiary);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    word-break: break-all;
    line-height: 1.4;
  }

  .regex-flags {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
    font-size: var(--font-size-sm);
  }

  .flags-label {
    color: var(--text-secondary);
    font-weight: 600;
  }

  .flags-code {
    font-family: var(--font-mono);
    color: var(--color-warning-light);
    font-weight: 600;
  }

  .flags-description {
    color: var(--text-secondary);
    font-style: italic;
  }

  .regex-description {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    color: var(--text-secondary);
    font-style: italic;
  }

  .language-examples {
    margin-bottom: var(--spacing-xl);

    h4 {
      color: var(--color-info-light);
      margin-bottom: var(--spacing-md);
    }
  }

  .examples-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-md);
  }

  .example-card {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    padding: var(--spacing-md);
  }

  .example-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--spacing-sm);
  }

  .example-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-weight: 600;
    color: var(--text-primary);
  }

  .example-code {
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    line-height: 1.4;
  }

  .test-cases {
    margin-bottom: var(--spacing-xl);

    h4 {
      color: var(--color-info-light);
      margin-bottom: var(--spacing-md);
    }
  }

  .test-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-lg);
  }

  .test-group {
    h5 {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      margin-bottom: var(--spacing-md);
      font-size: var(--font-size-md);
      font-weight: 600;
    }

    &.valid h5 {
      color: var(--color-success-light);
    }

    &.invalid h5 {
      color: var(--color-error-light);
    }
  }

  .test-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .test-case {
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);

    &.valid {
      background-color: var(--color-success);
      color: var(--bg-primary);
    }

    &.invalid {
      background-color: var(--color-error);
      color: var(--bg-primary);
    }
  }

  .documentation {
    .doc-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-xl);
    }
  }

  .doc-section {
    h4 {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      color: var(--color-warning-light);
      margin-bottom: var(--spacing-md);
      font-size: var(--font-size-md);
    }
  }

  .doc-list {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      padding: var(--spacing-sm);
      background-color: var(--bg-secondary);
      border-left: 3px solid var(--color-warning);
      border-radius: var(--radius-sm);
      margin-bottom: var(--spacing-xs);
      color: var(--text-secondary);
      font-size: var(--font-size-sm);

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .recommendations {
    h4 {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      color: var(--color-info-light);
      margin-bottom: var(--spacing-md);
      font-size: var(--font-size-md);
    }
  }

  .recommendation-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .recommendation {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    background-color: var(--bg-secondary);
    border-left: 3px solid var(--color-info);
    border-radius: var(--radius-sm);
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
  }

  @media (max-width: 768px) {
    .mode-toggle {
      flex-direction: column;
    }

    .type-options {
      grid-template-columns: 1fr;
    }

    .options-grid {
      grid-template-columns: 1fr;
    }

    .examples-grid {
      grid-template-columns: 1fr;
    }

    .test-grid {
      grid-template-columns: 1fr;
    }

    .doc-grid {
      grid-template-columns: 1fr;
    }

    .results-header {
      flex-direction: column;
      gap: var(--spacing-md);
      align-items: stretch;
    }

    .pattern-header {
      flex-direction: column;
      gap: var(--spacing-sm);
      align-items: stretch;
    }

    .example-header {
      flex-direction: column;
      gap: var(--spacing-sm);
      align-items: stretch;
    }
  }
</style>
