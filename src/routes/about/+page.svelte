<script lang="ts">
  import '../../styles/pages.scss';
  import { site, author, license, pages } from '$lib/constants/site';
  
  let darkMode = $state(true);

  function initializeTheme() {
    if (typeof window === 'undefined') return;
    
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      darkMode = false;
      document.documentElement.classList.add('theme-light');
    }
  }

  function toggleTheme() {
    darkMode = !darkMode;
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', darkMode ? 'dark' : 'light');
      if (darkMode) {
        document.documentElement.classList.remove('theme-light');
      } else {
        document.documentElement.classList.add('theme-light');
      }
    }
  }

  $effect(() => {
    initializeTheme();
  });
</script>

<svelte:head>
  <title>{pages.about.title}</title>
  <meta name="description" content="{pages.about.description}" />
  <meta name="keywords" content="{site.keywords}" />
  <meta property="og:title" content="{pages.about.title}" />
  <meta property="og:description" content="{pages.about.ogDescription}" />
  <meta property="og:url" content="{site.url}/about" />
</svelte:head>

<div class="page">

  <!-- Main Content -->
  <main class="main-content">
    <div class="container">
      <div class="about-content">
        <section class="hero-section">
          <h2>About {site.title}</h2>
          <p class="lead">
            A comprehensive suite of networking tools designed for professionals, students, 
            and anyone working with IP addresses and network configurations.
          </p>
        </section>

        <section class="features-section">
          <h3>Features</h3>
          <div class="features-grid">
            <div class="feature-card">
              <h4>Subnet Calculator</h4>
              <p>Calculate subnet information, network addresses, broadcast addresses, and host ranges with visual network analysis.</p>
            </div>
            <div class="feature-card">
              <h4>CIDR Converter</h4>
              <p>Bidirectional conversion between CIDR notation and subnet mask formats with instant results.</p>
            </div>
            <div class="feature-card">
              <h4>IP Address Converter</h4>
              <p>Convert IP addresses between decimal, binary, hexadecimal, and octal number systems.</p>
            </div>
            <div class="feature-card">
              <h4>Network Reference</h4>
              <p>Comprehensive reference for network classes, reserved IP ranges, and common subnet configurations.</p>
            </div>
          </div>
        </section>

        <section class="tech-section">
          <h3>Technology Stack</h3>
          <p>Built with modern web technologies for optimal performance and user experience:</p>
          <ul class="tech-list">
            <li><strong>SvelteKit:</strong> Modern web framework with server-side rendering</li>
            <li><strong>TypeScript:</strong> Type-safe JavaScript for better code quality</li>
            <li><strong>SCSS:</strong> Advanced CSS with nesting and variables</li>
            <li><strong>Responsive Design:</strong> Works seamlessly across all devices</li>
            <li><strong>Progressive Web App:</strong> Fast loading and offline capabilities</li>
          </ul>
        </section>

        <section class="author-section">
          <h3>About the Author</h3>
          <p>
            {site.title} is developed and maintained by <a href="{author.githubUrl}" target="_blank" rel="noopener noreferrer">{author.name}</a>, 
            a software engineer passionate about networking, cybersecurity, and open-source development.
          </p>
          <div class="links-grid">
            <a href="{site.repo}" target="_blank" rel="noopener noreferrer" class="link-card">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <div>
                <h4>GitHub Repository</h4>
                <p>View source code and contribute</p>
              </div>
            </a>
            <a href="{author.portfolio}" target="_blank" rel="noopener noreferrer" class="link-card">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <div>
                <h4>Author's Website</h4>
                <p>Learn more about the developer</p>
              </div>
            </a>
          </div>
        </section>

        <section class="license-section">
          <h3>Open Source</h3>
          <p>
            {site.title} is open-source software licensed under the {license.name} License. 
            Feel free to use, modify, and distribute according to the license terms.
          </p>
          <p class="copyright">
            © {license.date} {author.name}. All rights reserved.
          </p>
        </section>
      </div>
    </div>
  </main>

</div>

<style lang="scss">
/* About page specific styles */
.about-content {
  max-width: 800px;
  margin: 0 auto;
  
  section {
    margin-bottom: var(--spacing-xl);
    
    h2, h3 {
      color: var(--text-primary);
      margin-bottom: var(--spacing-md);
    }
    
    p {
      color: var(--text-primary);
      line-height: 1.6;
      margin-bottom: var(--spacing-sm);
    }
  }
}

.hero-section {
  text-align: center;
  padding: var(--spacing-xl) 0;
  
  h2 {
    font-size: var(--font-size-2xl);
    margin-bottom: var(--spacing-lg);
  }
  
  .lead {
    font-size: var(--font-size-lg);
    color: var(--text-secondary);
  }
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-top: var(--spacing-lg);
  
  .feature-card {
    padding: var(--spacing-lg);
    background-color: var(--bg-secondary);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-primary);
    
    h4 {
      color: var(--color-primary);
      margin-bottom: var(--spacing-sm);
    }
    
    p {
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
      margin: 0;
    }
  }
}

.tech-list {
  list-style: none;
  padding: 0;
  
  li {
    padding: var(--spacing-sm) 0;
    border-bottom: 1px solid var(--border-primary);
    
    &:last-child {
      border-bottom: none;
    }
    
    strong {
      color: var(--color-primary);
    }
  }
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
  
  .link-card {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    background-color: var(--bg-secondary);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-primary);
    text-decoration: none;
    color: inherit;
    transition: all var(--transition-fast);
    
    &:hover {
      background-color: var(--surface-hover);
      border-color: var(--color-primary);
      transform: translateY(-2px);
    }
    
    svg {
      width: 2rem;
      height: 2rem;
      color: var(--color-primary);
      flex-shrink: 0;
    }
    
    h4 {
      color: var(--text-primary);
      margin: 0 0 var(--spacing-xs) 0;
    }
    
    p {
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
      margin: 0;
    }
  }
}

.copyright {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  text-align: center;
  margin-top: var(--spacing-lg);
}
</style>

