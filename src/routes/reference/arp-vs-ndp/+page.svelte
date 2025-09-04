<script lang="ts">
  import { arpVsNdpContent } from '$lib/content/arp-vs-ndp.js';
  import { site } from '$lib/constants/site';
  import Icon from '$lib/components/global/Icon.svelte';
</script>

<svelte:head>
  <title>{arpVsNdpContent.title} | {site.title}</title>
  <meta name="description" content="{arpVsNdpContent.description}" />
  <meta name="keywords" content="{site.keywords}, ARP, NDP, neighbor discovery, address resolution, IPv4, IPv6" />
  <meta property="og:title" content="{arpVsNdpContent.title}" />
  <meta property="og:description" content="{arpVsNdpContent.description}" />
  <meta property="og:url" content="{site.url}/reference/arp-vs-ndp" />
</svelte:head>

<div class="page-container">
  <div class="ref-page">
    <div class="ref-header">
      <h1>{arpVsNdpContent.title}</h1>
      <p class="subtitle">{arpVsNdpContent.description}</p>
    </div>

    <div class="ref-section">
      <h2>{arpVsNdpContent.sections.overview.title}</h2>
      <p>{arpVsNdpContent.sections.overview.content}</p>
    </div>

    <div class="ref-section">
      <h2>Side-by-Side Comparison</h2>
      <table class="ref-table">
        <thead>
          <tr>
            <th>Aspect</th>
            <th>ARP (IPv4)</th>
            <th>NDP (IPv6)</th>
          </tr>
        </thead>
        <tbody>
          {#each arpVsNdpContent.comparison.basic as item}
            <tr>
              <td><strong>{item.aspect}</strong></td>
              <td>{item.arp}</td>
              <td>{item.ndp}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="ref-section">
      <h2>{arpVsNdpContent.arpDetails.title}</h2>
      
      <h3>ARP Message Types</h3>
      {#each arpVsNdpContent.arpDetails.messageTypes as type}
        <div class="ref-examples">
          <div class="examples-title">{type.type}</div>
          <div class="example-item">
            <div><strong>Description:</strong> {type.description}</div>
            <div><strong>Destination:</strong> {type.destination}</div>
            <div><strong>Response:</strong> {type.response}</div>
          </div>
        </div>
      {/each}

      <h3>ARP Process</h3>
      <ol>
        {#each arpVsNdpContent.arpDetails.process as step}
          <li>{step}</li>
        {/each}
      </ol>

      <h3>ARP Limitations</h3>
      <ul>
        {#each arpVsNdpContent.arpDetails.limitations as limitation}
          <li>{limitation}</li>
        {/each}
      </ul>
    </div>

    <div class="ref-section">
      <h2>{arpVsNdpContent.ndpDetails.title}</h2>
      
      <h3>NDP Message Types</h3>
      {#each arpVsNdpContent.ndpDetails.messageTypes as type}
        <div class="ref-examples">
          <div class="examples-title">{type.type}</div>
          <div class="example-item">
            <div><strong>ICMP Type:</strong> <code>{type.icmpType}</code></div>
            <div><strong>Description:</strong> {type.description}</div>
            <div><strong>Destination:</strong> {type.destination}</div>
            <div><strong>Purpose:</strong> {type.purpose}</div>
          </div>
        </div>
      {/each}

      <h3>NDP Process</h3>
      <ol>
        {#each arpVsNdpContent.ndpDetails.process as step}
          <li>{step}</li>
        {/each}
      </ol>

      <h3>NDP Advantages Over ARP</h3>
      <ul>
        {#each arpVsNdpContent.ndpDetails.advantages as advantage}
          <li>{advantage}</li>
        {/each}
      </ul>
    </div>

    <div class="ref-section">
      <h2>Practical Differences</h2>
      {#each arpVsNdpContent.practicalDifferences as diff}
        <div class="ref-examples">
          <div class="examples-title">{diff.scenario}</div>
          <div class="example-item">
            <div><strong>ARP (IPv4):</strong> {diff.arp}</div>
            <div><strong>NDP (IPv6):</strong> {diff.ndp}</div>
            <div><strong>Impact:</strong> {diff.impact}</div>
          </div>
        </div>
      {/each}
    </div>

    <div class="ref-section">
      <h2>Troubleshooting Commands</h2>
      <table class="ref-table">
        <thead>
          <tr>
            <th>Purpose</th>
            <th>IPv4 (ARP)</th>
            <th>IPv6 (NDP)</th>
            <th>Windows</th>
          </tr>
        </thead>
        <tbody>
          {#each arpVsNdpContent.troubleshootingCommands as cmd}
            <tr>
              <td><strong>{cmd.purpose}</strong></td>
              <td><code>{cmd.ipv4}</code></td>
              <td><code style="font-size: 0.8em;">{cmd.ipv6}</code></td>
              <td><code style="font-size: 0.8em;">{cmd.windows}</code></td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="ref-section">
      <h2>Common Issues</h2>
      {#each arpVsNdpContent.commonIssues as issue}
        <div class="ref-warning">
          <div class="warning-title">
            <Icon name="alert-triangle" size="sm" />
            {issue.issue} ({issue.protocol})
          </div>
          <div class="warning-content">
            <p><strong>Description:</strong> {issue.description}</p>
            <p><strong>Detection:</strong> {issue.detection}</p>
            <p><strong>Mitigation:</strong> {issue.mitigation}</p>
          </div>
        </div>
      {/each}
    </div>

    <div class="ref-section">
      <h2>Best Practices</h2>
      {#each arpVsNdpContent.bestPractices as practices}
        <h3>{practices.protocol} Best Practices</h3>
        <ul>
          {#each practices.practices as practice}
            <li>{practice}</li>
          {/each}
        </ul>
      {/each}
    </div>

    <div class="ref-section">
      <h2>Quick Reference</h2>
      <div class="ref-grid two-col">
        <div class="grid-item">
          <div class="item-title">ARP Key Points</div>
          {#each arpVsNdpContent.quickReference.arp as point}
            <div class="item-code">{point}</div>
          {/each}
        </div>
        
        <div class="grid-item">
          <div class="item-title">NDP Key Points</div>
          {#each arpVsNdpContent.quickReference.ndp as point}
            <div class="item-code">{point}</div>
          {/each}
        </div>
      </div>
    </div>

    <div class="ref-section">
      <h2>IPv4 to IPv6 Migration Tips</h2>
      <div class="ref-examples">
        <div class="examples-title">Important Considerations</div>
        {#each arpVsNdpContent.migrationTips as tip}
          <div class="example-item">
            <div class="example-description">{tip}</div>
          </div>
        {/each}
      </div>
      
      <div class="ref-highlight">
        <div class="highlight-title">
          <Icon name="arrow-right" size="sm" />
          Key Takeaway
        </div>
        <div class="highlight-content">
          While NDP is more complex than ARP, it's also much more capable and efficient. Understanding both protocols is essential for mixed IPv4/IPv6 environments.
        </div>
      </div>
    </div>
  </div>
</div>
