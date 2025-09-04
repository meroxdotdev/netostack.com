<script lang="ts">
  import { reverseDnsContent } from '$lib/content/reverse-dns.js';
  import { site } from '$lib/constants/site';
  import Icon from '$lib/components/global/Icon.svelte';
</script>

<svelte:head>
  <title>{reverseDnsContent.title} | {site.title}</title>
  <meta name="description" content="{reverseDnsContent.description}" />
  <meta name="keywords" content="{site.keywords}, reverse DNS, PTR records, in-addr.arpa, ip6.arpa, rDNS" />
  <meta property="og:title" content="{reverseDnsContent.title}" />
  <meta property="og:description" content="{reverseDnsContent.description}" />
  <meta property="og:url" content="{site.url}/reference/reverse-dns" />
</svelte:head>

<div class="page-container">
  <div class="ref-page">
    <div class="ref-header">
      <h1>{reverseDnsContent.title}</h1>
      <p class="subtitle">{reverseDnsContent.description}</p>
    </div>

    <div class="ref-section">
      <h2>{reverseDnsContent.sections.overview.title}</h2>
      <p>{reverseDnsContent.sections.overview.content}</p>
    </div>

    <div class="ref-section">
      <h2>{reverseDnsContent.sections.howWorks.title}</h2>
      <p>{reverseDnsContent.sections.howWorks.content}</p>
    </div>

    <div class="ref-section">
      <h2>{reverseDnsContent.ipv4Reverse.title}</h2>
      
      <h3>Process Steps</h3>
      <ol>
        {#each reverseDnsContent.ipv4Reverse.process as step}
          <li>{step}</li>
        {/each}
      </ol>

      <h3>IPv4 Examples</h3>
      {#each reverseDnsContent.ipv4Reverse.examples as example}
        <div class="ref-examples">
          <div class="examples-title">IP Address: {example.ip}</div>
          <div class="example-item">
            <div><strong>Reverse Name:</strong> <code>{example.reversed}</code></div>
            <div><strong>PTR Record:</strong> <code>{example.ptrRecord}</code></div>
            <div><strong>Explanation:</strong> {example.explanation}</div>
          </div>
        </div>
      {/each}

      <h3>Network Delegation</h3>
      <p>{reverseDnsContent.ipv4Reverse.delegation.explanation}</p>
      <table class="ref-table">
        <thead>
          <tr>
            <th>Network</th>
            <th>Reverse Zone</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {#each reverseDnsContent.ipv4Reverse.delegation.examples as example}
            <tr>
              <td><code>{example.network}</code></td>
              <td><code>{example.zone}</code></td>
              <td>{example.description}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="ref-section">
      <h2>{reverseDnsContent.ipv6Reverse.title}</h2>
      
      <h3>Process Steps</h3>
      <ol>
        {#each reverseDnsContent.ipv6Reverse.process as step}
          <li>{step}</li>
        {/each}
      </ol>

      <h3>IPv6 Examples</h3>
      {#each reverseDnsContent.ipv6Reverse.examples as example}
        <div class="ref-examples">
          <div class="examples-title">IP Address: {example.ip}</div>
          <div class="example-item">
            <div><strong>Expanded:</strong> <code>{example.expanded}</code></div>
            <div><strong>Reverse Name:</strong> <code style="font-size: 0.8em; word-break: break-all;">{example.nibbles}</code></div>
            <div><strong>PTR Record:</strong> <code>{example.ptrRecord}</code></div>
            <div><strong>Note:</strong> {example.explanation}</div>
          </div>
        </div>
      {/each}

      <div class="ref-warning">
        <div class="warning-title">
          <Icon name="info" size="sm" />
          IPv6 Complexity
        </div>
        <div class="warning-content">
          IPv6 reverse DNS names are much longer than IPv4 because each hex digit becomes a separate label. A single IPv6 address creates a 72-character reverse DNS name!
        </div>
      </div>
    </div>

    <div class="ref-section">
      <h2>{reverseDnsContent.practicalExamples.title}</h2>
      
      <h3>Command Examples</h3>
      <table class="ref-table">
        <thead>
          <tr>
            <th>Command</th>
            <th>Description</th>
            <th>Expected Result</th>
          </tr>
        </thead>
        <tbody>
          {#each reverseDnsContent.practicalExamples.digExamples as example}
            <tr>
              <td><code>{example.command}</code></td>
              <td>{example.description}</td>
              <td><code>{example.expectedResult}</code></td>
            </tr>
          {/each}
        </tbody>
      </table>

      <h3>Common Use Cases</h3>
      <ul>
        {#each reverseDnsContent.practicalExamples.commonChecks as check}
          <li>{check}</li>
        {/each}
      </ul>
    </div>

    <div class="ref-section">
      <h2>Troubleshooting Common Issues</h2>
      {#each reverseDnsContent.troubleshooting as issue}
        <div class="ref-warning">
          <div class="warning-title">
            <Icon name="help-circle" size="sm" />
            {issue.issue}
          </div>
          <div class="warning-content">
            <p><strong>Causes:</strong> {issue.causes.join(', ')}</p>
            <p><strong>Solutions:</strong> {issue.solutions.join(', ')}</p>
          </div>
        </div>
      {/each}
    </div>

    <div class="ref-section">
      <h2>Best Practices</h2>
      <ul>
        {#each reverseDnsContent.bestPractices as practice}
          <li>{practice}</li>
        {/each}
      </ul>
    </div>

    <div class="ref-section">
      <h2>Quick Reference & Tools</h2>
      
      <div class="ref-grid two-col">
        <div class="grid-item">
          <div class="item-title">IPv4 Quick Examples</div>
          {#each reverseDnsContent.quickReference.ipv4 as example}
            <div class="item-code">{example}</div>
          {/each}
        </div>
        
        <div class="grid-item">
          <div class="item-title">IPv6 Quick Examples</div>
          {#each reverseDnsContent.quickReference.ipv6 as example}
            <div class="item-code">{example}</div>
          {/each}
        </div>
      </div>

      <h3>Useful Tools</h3>
      <div class="ref-grid two-col">
        {#each reverseDnsContent.tools as tool}
          <div class="grid-item">
            <div class="item-title">{tool.name}</div>
            <div class="item-description">{tool.description}</div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
