<script lang="ts">
  import { ipv6PrivacyContent } from '$lib/content/ipv6-privacy-addresses.js';
  import { site } from '$lib/constants/site';
  import Icon from '$lib/components/Icon.svelte';
</script>

<svelte:head>
  <title>{ipv6PrivacyContent.title} | {site.title}</title>
  <meta name="description" content="{ipv6PrivacyContent.description}" />
  <meta name="keywords" content="{site.keywords}, IPv6 privacy, temporary addresses, RFC 4941, RFC 8981, SLAAC privacy extensions" />
  <meta property="og:title" content="{ipv6PrivacyContent.title}" />
  <meta property="og:description" content="{ipv6PrivacyContent.description}" />
  <meta property="og:url" content="{site.url}/reference/ipv6-privacy-addresses" />
</svelte:head>

<div class="page-container">
  <div class="ref-page">
    <div class="ref-header">
      <h1>{ipv6PrivacyContent.title}</h1>
      <p class="subtitle">{ipv6PrivacyContent.description}</p>
    </div>

    <div class="ref-section">
      <h2>{ipv6PrivacyContent.sections.overview.title}</h2>
      <p>{ipv6PrivacyContent.sections.overview.content}</p>
    </div>

    <div class="ref-section">
      <h2>{ipv6PrivacyContent.sections.problem.title}</h2>
      <p>{ipv6PrivacyContent.sections.problem.content}</p>
    </div>

    <div class="ref-section">
      <h2>IPv6 Address Types</h2>
      {#each ipv6PrivacyContent.addressTypes as type}
        <div class="ref-examples">
          <div class="examples-title">{type.type}</div>
          <div class="example-item">
            <div><strong>Formation:</strong> {type.formation}</div>
            <div><strong>Example:</strong> <code>{type.example}</code></div>
            <div><strong>Privacy Level:</strong> {type.privacy}</div>
            
            <h4>Characteristics:</h4>
            <ul>
              {#each type.characteristics as characteristic}
                <li>{characteristic}</li>
              {/each}
            </ul>
          </div>
        </div>
      {/each}
    </div>

    <div class="ref-section">
      <h2>{ipv6PrivacyContent.howItWorks.title}</h2>
      
      <h3>Address Generation Process</h3>
      <ol>
        {#each ipv6PrivacyContent.howItWorks.addressGeneration as step}
          <li>{step}</li>
        {/each}
      </ol>

      <h3>Temporary Address Lifecycle</h3>
      <ol>
        {#each ipv6PrivacyContent.howItWorks.temporaryLifecycle as step}
          <li>{step}</li>
        {/each}
      </ol>

      <h3>Default Operating System Behavior</h3>
      <ul>
        {#each ipv6PrivacyContent.howItWorks.defaultBehavior as behavior}
          <li>{behavior}</li>
        {/each}
      </ul>
    </div>

    <div class="ref-section">
      <h2>{ipv6PrivacyContent.lifetimes.title}</h2>
      
      <div class="ref-grid two-col">
        <div class="grid-item">
          <div class="item-title">Preferred Lifetime</div>
          <div class="item-description">{ipv6PrivacyContent.lifetimes.preferredLifetime.description}</div>
          <div><strong>Typical:</strong> {ipv6PrivacyContent.lifetimes.preferredLifetime.typical}</div>
          <div><strong>Behavior:</strong> {ipv6PrivacyContent.lifetimes.preferredLifetime.behavior}</div>
        </div>

        <div class="grid-item">
          <div class="item-title">Valid Lifetime</div>
          <div class="item-description">{ipv6PrivacyContent.lifetimes.validLifetime.description}</div>
          <div><strong>Typical:</strong> {ipv6PrivacyContent.lifetimes.validLifetime.typical}</div>
          <div><strong>Behavior:</strong> {ipv6PrivacyContent.lifetimes.validLifetime.behavior}</div>
        </div>

        <div class="grid-item">
          <div class="item-title">Regeneration Interval</div>
          <div class="item-description">{ipv6PrivacyContent.lifetimes.regenerationInterval.description}</div>
          <div><strong>Typical:</strong> {ipv6PrivacyContent.lifetimes.regenerationInterval.typical}</div>
          <div><strong>Behavior:</strong> {ipv6PrivacyContent.lifetimes.regenerationInterval.behavior}</div>
        </div>

        <div class="grid-item">
          <div class="item-title">Max Temporary Addresses</div>
          <div class="item-description">{ipv6PrivacyContent.lifetimes.maxTempAddresses.description}</div>
          <div><strong>Typical:</strong> {ipv6PrivacyContent.lifetimes.maxTempAddresses.typical}</div>
          <div><strong>Behavior:</strong> {ipv6PrivacyContent.lifetimes.maxTempAddresses.behavior}</div>
        </div>
      </div>
    </div>

    <div class="ref-section">
      <h2>{ipv6PrivacyContent.osImplementations.title}</h2>
      
      {#each Object.entries(ipv6PrivacyContent.osImplementations) as [key, os]}
        {#if typeof os === 'object' && os.os}
          <div class="ref-examples">
            <div class="examples-title">{os.os}</div>
            <div class="example-item">
              <div><strong>Default Behavior:</strong> {os.defaultBehavior}</div>
              
              <h4>Configuration:</h4>
              {#each os.configuration as config}
                <code class="example-input">{config}</code>
              {/each}
              
              {#if os.values}
                <h4>Values:</h4>
                <ul>
                  {#each os.values as value}
                    <li><code>{value}</code></li>
                  {/each}
                </ul>
              {/if}
              
              <h4>Useful Commands:</h4>
              {#each os.commands as command}
                <code class="example-input">{command}</code>
              {/each}
              
              {#if os.behavior}
                <div><strong>Behavior:</strong> {os.behavior}</div>
              {/if}
            </div>
          </div>
        {/if}
      {/each}
    </div>

    <div class="ref-section">
      <h2>Identifying Address Types</h2>
      <table class="ref-table">
        <thead>
          <tr>
            <th>Method</th>
            <th>Stable Address</th>
            <th>Temporary Address</th>
            <th>Example</th>
          </tr>
        </thead>
        <tbody>
          {#each ipv6PrivacyContent.identifyingAddresses as method}
            <tr>
              <td><strong>{method.method}</strong></td>
              <td>{method.stable}</td>
              <td>{method.temporary}</td>
              <td>{method.example}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="ref-section">
      <h2>Troubleshooting</h2>
      {#each ipv6PrivacyContent.troubleshooting as issue}
        <div class="ref-warning">
          <div class="warning-title">
            <Icon name="help-circle" size="sm" />
            {issue.issue}
          </div>
          <div class="warning-content">
            <p><strong>Symptoms:</strong> {issue.symptoms.join(', ')}</p>
            <p><strong>Diagnosis:</strong> {issue.diagnosis}</p>
            <div><strong>Solutions:</strong></div>
            <ul>
              {#each issue.solutions as solution}
                <li>{solution}</li>
              {/each}
            </ul>
          </div>
        </div>
      {/each}
    </div>

    <div class="ref-section">
      <h2>Security Considerations</h2>
      {#each ipv6PrivacyContent.securityConsiderations as security}
        <div class="ref-examples">
          <div class="examples-title">{security.aspect}</div>
          <div class="example-item">
            <h4>Benefits:</h4>
            <ul>
              {#each security.benefits as benefit}
                <li>{benefit}</li>
              {/each}
            </ul>
            
            <h4>{security.limitations ? 'Limitations' : 'Challenges'}:</h4>
            <ul>
              {#each (security.limitations || security.challenges) as item}
                <li>{item}</li>
              {/each}
            </ul>
          </div>
        </div>
      {/each}
    </div>

    <div class="ref-section">
      <h2>When to Use Privacy Addresses</h2>
      {#each ipv6PrivacyContent.whenToUse as scenario}
        <div class="ref-examples">
          <div class="examples-title">{scenario.scenario}</div>
          <div class="example-item">
            <div><strong>Recommendation:</strong> {scenario.recommendation}</div>
            <div><strong>Reasoning:</strong> {scenario.reasoning}</div>
            <div><strong>Configuration:</strong> {scenario.configuration}</div>
          </div>
        </div>
      {/each}
    </div>

    <div class="ref-section">
      <h2>Best Practices</h2>
      <ul>
        {#each ipv6PrivacyContent.bestPractices as practice}
          <li>{practice}</li>
        {/each}
      </ul>
    </div>

    <div class="ref-section">
      <h2>Common Mistakes</h2>
      <ul>
        {#each ipv6PrivacyContent.commonMistakes as mistake}
          <li>{mistake}</li>
        {/each}
      </ul>
    </div>

    <div class="ref-section">
      <h2>Quick Reference</h2>
      
      <div class="ref-grid two-col">
        <div class="grid-item">
          <div class="item-title">Address Types</div>
          {#each ipv6PrivacyContent.quickReference.addressTypes as type}
            <div class="item-description">{type}</div>
          {/each}
        </div>
        
        <div class="grid-item">
          <div class="item-title">Identification</div>
          {#each ipv6PrivacyContent.quickReference.identification as tip}
            <div class="item-description">{tip}</div>
          {/each}
        </div>
      </div>

      <div class="ref-grid two-col">
        <div class="grid-item">
          <div class="item-title">Configuration</div>
          {#each ipv6PrivacyContent.quickReference.configuration as config}
            <div class="item-code">{config}</div>
          {/each}
        </div>
        
        <div class="grid-item">
          <div class="item-title">Troubleshooting</div>
          {#each ipv6PrivacyContent.quickReference.troubleshooting as tip}
            <div class="item-description">{tip}</div>
          {/each}
        </div>
      </div>
      
      <div class="ref-highlight">
        <div class="highlight-title">
          <Icon name="key" size="sm" />
          Key Point
        </div>
        <div class="highlight-content">
          Privacy extensions create multiple IPv6 addresses per interface. Temporary addresses change periodically for privacy, while stable addresses remain consistent for services. Both can coexist on the same interface.
        </div>
      </div>
    </div>

    <div class="ref-section">
      <h2>Useful Tools</h2>
      <div class="ref-grid two-col">
        {#each ipv6PrivacyContent.tools as tool}
          <div class="grid-item">
            <div class="item-title">{tool.tool}</div>
            <div class="item-description">{tool.purpose}</div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>