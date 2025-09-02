<script lang="ts">
  import { icmpContent } from '$lib/content/icmp.js';
  import { site } from '$lib/constants/site';
  import Icon from '$lib/components/Icon.svelte';
</script>

<svelte:head>
  <title>{icmpContent.title} | {site.title}</title>
  <meta name="description" content="{icmpContent.description}" />
  <meta name="keywords" content="{site.keywords}, ICMP, ICMPv6, ping, traceroute, network troubleshooting, echo request" />
  <meta property="og:title" content="{icmpContent.title}" />
  <meta property="og:description" content="{icmpContent.description}" />
  <meta property="og:url" content="{site.url}/reference/icmp" />
</svelte:head>

<div class="page-container">
  <div class="ref-page">
    <div class="ref-header">
      <h1>{icmpContent.title}</h1>
      <p class="subtitle">{icmpContent.description}</p>
    </div>

    <div class="ref-section">
      <h2>{icmpContent.sections.overview.title}</h2>
      <p>{icmpContent.sections.overview.content}</p>
    </div>

    <div class="ref-section">
      <h2>Common ICMPv4 Types</h2>
      {#each icmpContent.icmpv4Types as type}
        <div class="ref-examples">
          <div class="examples-title">Type {type.type}: {type.name}</div>
          <div class="example-item">
            <div><strong>Description:</strong> {type.description}</div>
            <div><strong>Common Use:</strong> {type.commonUse}</div>
            <div><strong>Example:</strong> {type.example}</div>
            <div><strong>Troubleshooting:</strong> {type.troubleshooting}</div>
            {#if type.codes}
              <div><strong>Common Codes:</strong></div>
              <ul>
                {#each type.codes as code}
                  <li>Code {code.code}: {code.meaning}</li>
                {/each}
              </ul>
            {/if}
          </div>
        </div>
      {/each}
    </div>

    <div class="ref-section">
      <h2>Common ICMPv6 Types</h2>
      {#each icmpContent.icmpv6Types as type}
        <div class="ref-examples">
          <div class="examples-title">Type {type.type}: {type.name}</div>
          <div class="example-item">
            <div><strong>Description:</strong> {type.description}</div>
            <div><strong>Common Use:</strong> {type.commonUse}</div>
            <div><strong>Example:</strong> {type.example}</div>
            <div><strong>Troubleshooting:</strong> {type.troubleshooting}</div>
            {#if type.codes}
              <div><strong>Common Codes:</strong></div>
              <ul>
                {#each type.codes as code}
                  <li>Code {code.code}: {code.meaning}</li>
                {/each}
              </ul>
            {/if}
          </div>
        </div>
      {/each}
    </div>

    <div class="ref-section">
      <h2>Practical Troubleshooting Scenarios</h2>
      {#each icmpContent.practicalExamples as scenario}
        <div class="ref-warning">
          <div class="warning-title">
            <Icon name="search" size="sm" />
            {scenario.scenario}
          </div>
          <div class="warning-content">
            <p><strong>ICMP Types Involved:</strong> {scenario.icmpTypes.join(', ')}</p>
            <p><strong>What to Check:</strong></p>
            <ul>
              {#each scenario.whatToCheck as check}
                <li>{check}</li>
              {/each}
            </ul>
            <p><strong>Common Causes:</strong> {scenario.commonCauses.join(', ')}</p>
          </div>
        </div>
      {/each}
    </div>

    <div class="ref-section">
      <h2>Common ICMP Filtering Issues</h2>
      {#each icmpContent.filteringIssues as issue}
        <div class="ref-examples">
          <div class="examples-title">{issue.issue}</div>
          <div class="example-item">
            <div><strong>Problem:</strong> {issue.problem}</div>
            <div><strong>Solution:</strong> {issue.solution}</div>
            <div><strong>Recommendation:</strong> {issue.recommendation}</div>
          </div>
        </div>
      {/each}
    </div>

    <div class="ref-section">
      <h2>Troubleshooting Commands</h2>
      <table class="ref-table">
        <thead>
          <tr>
            <th>Command</th>
            <th>Purpose</th>
            <th>ICMP Type Used</th>
          </tr>
        </thead>
        <tbody>
          {#each icmpContent.troubleshootingCommands as cmd}
            <tr>
              <td><code>{cmd.command}</code></td>
              <td>{cmd.purpose}</td>
              <td>{cmd.icmpType}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="ref-section">
      <h2>Best Practices for ICMP</h2>
      <ul>
        {#each icmpContent.bestPractices as practice}
          <li>{practice}</li>
        {/each}
      </ul>
    </div>

    <div class="ref-section">
      <h2>ICMP Quick Reference</h2>
      
      <div class="ref-grid two-col">
        <div class="grid-item">
          <div class="item-title">Always Allow These</div>
          {#each icmpContent.quickReference.mustAllow as type}
            <div class="item-code">{type}</div>
          {/each}
        </div>
        
        <div class="grid-item">
          <div class="item-title">Never Filter These</div>
          {#each icmpContent.quickReference.neverFilter as type}
            <div class="item-code">{type}</div>
          {/each}
          <div class="item-description">Critical for proper network operation</div>
        </div>
      </div>
    </div>

    <div class="ref-section">
      <h2>Common Mistakes to Avoid</h2>
      <div class="ref-examples">
        <div class="examples-title">Don't Do These</div>
        {#each icmpContent.commonMistakes as mistake}
          <div class="example-item">
            <div class="example-description">{mistake}</div>
          </div>
        {/each}
      </div>
      
      <div class="ref-highlight">
        <div class="highlight-title">
          <Icon name="shield-check" size="sm" />
          Security vs Functionality
        </div>
        <div class="highlight-content">
          Don't block all ICMP for security. Instead, use rate limiting and allow essential types. Blocking ICMP completely breaks critical network functions like Path MTU Discovery and IPv6 Neighbor Discovery.
        </div>
      </div>
    </div>
  </div>
</div>