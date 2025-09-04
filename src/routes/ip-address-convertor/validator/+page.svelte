<script lang="ts">
  import { site } from '$lib/constants/site';
  import IPValidator from '$lib/components/tools/IPValidator.svelte';
</script>

<svelte:head>
  <title>IP Address Validator - Check IPv4 & IPv6 Format | {site.title}</title>
  <meta name="description" content="Validate IPv4 and IPv6 addresses instantly. Get detailed error explanations for invalid formats, octet ranges, leading zeros, and compression issues." />
  <meta name="keywords" content="ip address validator, ipv4 validator, ipv6 validator, ip format checker, validate ip address, check ip address, ip address verification, network address validation" />
  <meta property="og:title" content="IP Address Validator - Instant IPv4 & IPv6 Validation" />
  <meta property="og:description" content="Validate any IP address format with detailed error analysis and format checking for network administration." />
  <meta property="og:url" content="{site.url}/ip-address-convertor/validator" />
  
  <!-- Additional SEO for common searches -->
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="{site.url}/ip-address-convertor/validator" />
  
  <!-- Schema.org structured data for better search results -->
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "IP Address Validator",
      "description": "Online tool to validate IPv4 and IPv6 addresses with detailed error analysis",
      "url": `${site.url}/ip-address-convertor/validator`,
      "applicationCategory": "NetworkingApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "IPv4 address validation",
        "IPv6 address validation", 
        "Detailed error messages",
        "Format checking",
        "Real-time validation"
      ]
    })}
  </script>
</svelte:head>

<IPValidator />
