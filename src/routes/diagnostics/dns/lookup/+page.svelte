<script lang="ts">
  import { tooltip } from '$lib/actions/tooltip.js';
  import Icon from '$lib/components/global/Icon.svelte';
  import { validateDNSLookupInput, formatDNSError } from '$lib/utils/dns-validation.js';
  import '../../../../styles/diagnostics-pages.scss';

  let domainName = $state('example.com');
  let recordType = $state('A');
  let resolver = $state('cloudflare');
  let customResolver = $state('');
  let useCustomResolver = $state(false);
  let loading = $state(false);
  let results = $state<unknown>(null);
  let error = $state<string | null>(null);
  let copiedState = $state(false);
  let selectedExampleIndex = $state<number | null>(null);

  // Reactive validation state
  const isInputValid = $derived(() => {
    const validation = validateDNSLookupInput(domainName, useCustomResolver, customResolver);
    return validation.isValid;
  });

  const recordTypes = [
    { value: 'A', label: 'A', description: 'IPv4 address records' },
    { value: 'AAAA', label: 'AAAA', description: 'IPv6 address records' },
    { value: 'CNAME', label: 'CNAME', description: 'Canonical name records' },
    { value: 'MX', label: 'MX', description: 'Mail exchange records' },
    { value: 'TXT', label: 'TXT', description: 'Text records' },
    { value: 'NS', label: 'NS', description: 'Name server records' },
    { value: 'SOA', label: 'SOA', description: 'Start of authority records' },
    { value: 'CAA', label: 'CAA', description: 'Certificate authority authorization' },
    { value: 'PTR', label: 'PTR', description: 'Pointer records' },
    { value: 'SRV', label: 'SRV', description: 'Service records' },
  ];

  const resolvers = [
    { value: 'cloudflare', label: 'Cloudflare (1.1.1.1)' },
    { value: 'google', label: 'Google (8.8.8.8)' },
    { value: 'quad9', label: 'Quad9 (9.9.9.9)' },
    { value: 'opendns', label: 'OpenDNS (208.67.222.222)' },
  ];

  const examples = [
    { domain: 'example.com', type: 'A', description: 'Basic A record lookup' },
    { domain: 'google.com', type: 'MX', description: 'Mail server records' },
    { domain: 'cloudflare.com', type: 'AAAA', description: 'IPv6 addresses' },
    { domain: '_dmarc.github.com', type: 'TXT', description: 'DMARC policy record' },
  ];

  async function performLookup() {
    loading = true;
    error = null;
    results = null;

    // Client-side validation
    const validation = validateDNSLookupInput(domainName, useCustomResolver, customResolver);
    if (!validation.isValid) {
      error = validation.error || 'Invalid input';
      loading = false;
      return;
    }

    try {
      const resolverOpts =
        useCustomResolver && customResolver ? { server: customResolver.trim(), preferDoH: false } : { doh: resolver };

      const response = await fetch('/api/internal/diagnostics/dns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'lookup',
          name: domainName.trim(),
          type: recordType,
          resolverOpts,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();

        try {
          const responseData = JSON.parse(errorText);

          // Handle 404 as "no records found" (warning, not error)
          if (response.status === 404 && responseData.noRecords) {
            results = {
              noRecords: true,
              message: responseData.message,
              name: responseData.name,
              type: responseData.type,
              resolver: useCustomResolver && customResolver ? customResolver.trim() : resolver,
            };
            return; // Don't throw error, just set results
          }

          // Handle other structured errors
          if (responseData.error) {
            throw new Error(responseData.error);
          }

          // Use API message if available
          if (responseData.message) {
            throw new Error(responseData.message);
          }
        } catch {
          // If not JSON, use status-based message
          if (response.status === 400) {
            throw new Error('Invalid request. Please check your input values.');
          } else if (response.status === 500) {
            throw new Error('DNS lookup service temporarily unavailable. Please try again.');
          }
        }

        throw new Error(`Lookup failed (${response.status})`);
      }

      results = await response.json();
    } catch (err: unknown) {
      // Enhanced error handling using utility
      error = formatDNSError(err);
    } finally {
      loading = false;
    }
  }

  function loadExample(example: (typeof examples)[0], index: number) {
    domainName = example.domain;
    recordType = example.type;
    selectedExampleIndex = index;
    performLookup();
  }

  function clearExampleSelection() {
    selectedExampleIndex = null;
  }

  async function copyResults() {
    if (!results?.Answer?.length) return;

    const text = results.Answer.map((r: unknown) => (r as { data: string }).data).join('\n');
    await navigator.clipboard.writeText(text);
    copiedState = true;
    setTimeout(() => (copiedState = false), 1500);
  }
</script>

<div class="card">
  <header class="card-header">
    <h1>DNS Lookup Tool</h1>
    <p>
      Resolve DNS records for any domain using various public resolvers or custom DNS servers. Supports all common
      record types with detailed response information.
    </p>
  </header>

  <!-- Examples -->
  <div class="card examples-card">
    <details class="examples-details">
      <summary class="examples-summary">
        <Icon name="chevron-right" size="xs" />
        <h4>Quick Examples</h4>
      </summary>
      <div class="examples-grid">
        {#each examples as example, i (i)}
          <button
            class="example-card"
            class:selected={selectedExampleIndex === i}
            onclick={() => loadExample(example, i)}
            use:tooltip={`Query ${example.type} records for ${example.domain}`}
          >
            <h5>{example.domain} ({example.type})</h5>
            <p>{example.description}</p>
          </button>
        {/each}
      </div>
    </details>
  </div>

  <!-- Input Form -->
  <div class="card input-card">
    <div class="card-header">
      <h3>Lookup Configuration</h3>
    </div>
    <div class="card-content">
      <!-- First Row: Domain Name -->
      <div class="form-row">
        <div class="form-group">
          <label for="domain" use:tooltip={'Enter the domain name to query'}> Domain Name </label>
          <input
            id="domain"
            type="text"
            bind:value={domainName}
            placeholder="example.com"
            onchange={() => {
              clearExampleSelection();
              if (domainName) performLookup();
            }}
          />
        </div>
      </div>

      <!-- Second Row: Record Type and DNS Resolver -->
      <div class="form-row two-columns">
        <div class="form-group">
          <label for="type" use:tooltip={'Select the DNS record type to query'}> Record Type </label>
          <select
            id="type"
            bind:value={recordType}
            onchange={() => {
              clearExampleSelection();
              if (domainName) performLookup();
            }}
          >
            {#each recordTypes as type, index (index)}
              <option value={type.value} title={type.description}>{type.label}</option>
            {/each}
          </select>
        </div>

        <div class="form-group">
          <label for="dns-resolver" use:tooltip={'Choose a DNS resolver to use for the query'}> DNS Resolver </label>
          {#if !useCustomResolver}
            <select
              id="dns-resolver"
              bind:value={resolver}
              onchange={() => {
                clearExampleSelection();
                if (domainName) performLookup();
              }}
            >
              {#each resolvers as res, index (index)}
                <option value={res.value}>{res.label}</option>
              {/each}
            </select>
          {/if}
          {#if useCustomResolver}
            <input
              type="text"
              bind:value={customResolver}
              placeholder="8.8.8.8 or custom IP"
              onchange={() => {
                clearExampleSelection();
                if (domainName) performLookup();
              }}
            />
          {/if}
          <label class="checkbox-group">
            <input
              type="checkbox"
              bind:checked={useCustomResolver}
              onchange={() => {
                clearExampleSelection();
                if (domainName) performLookup();
              }}
            />
            Use custom resolver
          </label>
        </div>
      </div>

      <div class="action-section">
        <button class="lookup-btn" onclick={performLookup} disabled={loading || !isInputValid}>
          {#if loading}
            <Icon name="loader-2" size="sm" animate="spin" />
            Performing Lookup...
          {:else}
            <Icon name="search" size="sm" />
            Lookup DNS Records
          {/if}
        </button>
      </div>
    </div>
  </div>

  <!-- Warnings -->
  {#if results?.warnings?.length > 0}
    <div class="card warning-card warns">
      <div class="card-content">
        <div class="warning-content">
          <Icon name="alert-triangle" size="sm" />
          <div class="warning-messages">
            {#each results.warnings as warning, index (index)}
              <p>{warning}</p>
            {/each}
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- No Records Warning -->
  {#if results?.noRecords}
    <div class="card warning-card">
      <div class="card-content">
        <div class="warning-content">
          <Icon name="info" size="md" />
          <div>
            <strong>No Records Found</strong>
            <p>{results.message}</p>
            <p class="help-text">Using resolver: {results.resolver}</p>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Results -->
  {#if results && !results.noRecords}
    <div class="card results-card">
      <div class="card-header row">
        <h3>DNS Records Found</h3>
        {#if results.Answer?.length > 0}
          <button class="copy-btn" onclick={copyResults} disabled={copiedState}>
            <span class={copiedState ? 'text-green-500' : ''}
              ><Icon name={copiedState ? 'check' : 'copy'} size="xs" /></span
            >
            {copiedState ? 'Copied!' : 'Copy Results'}
          </button>
        {/if}
      </div>
      <div class="card-content">
        {#if results.Answer?.length > 0}
          <div class="records-list">
            {#each results.Answer as record, i (i)}
              <div class="record-item">
                <div class="record-data mono">{record.data}</div>
                {#if record.TTL}
                  <div class="record-ttl" use:tooltip={'Time To Live - how long this record can be cached'}>
                    TTL: {record.TTL}s
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        {:else}
          <div class="card warning-card no-records">
            <div class="warning-content">
              <Icon name="alert-triangle" size="md" />
              <p>No records found for <code>{domainName}</code> ({recordType})</p>
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  {#if error}
    <div class="card error-card">
      <div class="card-content">
        <div class="error-content">
          <Icon name="alert-triangle" size="md" />
          <div>
            <strong>Lookup Failed</strong>
            <p>{error}</p>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  .action-section {
    display: flex;
    justify-content: center;
    margin-top: var(--spacing-xl);
  }

  .warns {
    margin-bottom: var(--spacing-md);
  }

  .mono {
    font-family: var(--font-mono);
  }
</style>
