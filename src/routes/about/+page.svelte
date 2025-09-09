<script lang="ts">
  import '../../styles/pages.scss';
  import { site, author, license, pages } from '$lib/constants/site';
  

</script>

<svelte:head>
  <title>{pages.about.title}</title>
  <meta name="description" content="{pages.about.description}" />
  <meta name="keywords" content="{site.keywords}" />
  <meta property="og:title" content="{pages.about.title}" />
  <meta property="og:description" content="{pages.about.ogDescription}" />
  <meta property="og:url" content="{site.url}/about" />
</svelte:head>

<div class="card about-content">
  <!-- Section 0: Hero -->
  <div class="hero">
    <h2>About {site.title}</h2>
    <p class="lead">
      A comprehensive suite of networking tools designed for professionals, students, 
      and anyone working with IP addresses and network configurations.
    </p>
    <!-- Links #1: GitHub -->
    <!-- Links #1: Live Demo, DockerHub, CodeBerg Mirror, Sponsor, More Apps -->
  </div>
  

  <!-- Section 1: Features -->
  <section class="features-section">
    <h2>Features</h2>
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

  <!-- Section 2: API -->
   <section>
    <h2>API</h2>
    <p>
      Yes, we have an API! It's free to use, doesn't require an API key nor CORS.
    </p>
   </section>

  <!-- Section 3: Self-Hosting -->
   <section>
    <h2>Self-Hosting</h2>
    <p>
      {site.title} can be easily deployed to your own server. 
      Just run the following command:
    </p>
    <div class="code">
      <code>docker run -p 8080:8080 lissy93/networking-toolbox</code>
    </div>
    <p>
      You can also checkout our <a href="https://github.com/Lissy93/networking-toolbox/blob/main/docker-compose.yml"><code>docker-compose.yml</code></a>,
      using the <a href="https://hub.docker.com/r/lissy93/networking-toolbox"><code>lissy93/networking-toolbox</code></a> image from DockerHub.
    </p>
   </section>

  <!-- Section 4: Building -->
   <section>
    <h2>Building from Source</h2>
    <h3>Prerequisites</h3>
    <p>
      Make sure you have <a href="https://nodejs.org/en/download/" target="_blank" rel="noopener noreferrer">Node.js</a> (v22 or higher) and <a href="https://git-scm.com/downloads" target="_blank" rel="noopener noreferrer">Git</a> installed on your machine.
    </p>
    <h3>Getting the Code</h3>
    <div class="code">
      <code>git clone git@github.com:Lissy93/networking-toolbox.git</code>
      <code>cd networking-toolbox</code>
      <code>npm install</code>
    </div>

    <h3>Development</h3>
    <div class="code">
      <code>npm run dev</code>
    </div>

    <h3>Checking</h3>
    <div class="code">
      <code>npm run test</code>
      <code>npm run tsc</code>
      <code>npm run lint</code>
    </div>

    <h3>Deploying</h3>
    <ul>
      <li>
        <strong>Option #1 - Source:</strong><br>
        Run <code>npm run build</code>, and then upload the contents of <code>./dist</code>
        to any web server, CDN or static hosting provider
      </li>
      <li>
        <strong>Option #2 - Cloud:</strong><br>
        Just <a href="https://github.com/Lissy93/networking-toolbox/fork">fork the repo</a>,
        and import into Vercel, Netlify or any other cloud provider for instant deployment
      </li>
      <li>
        <strong>Option #3 - Docker:</strong><br>
        Build the Docker image, with <code>docker build -t networking-toolbox .</code>
        then run <code>docker run -p 8080:8080 networking-toolbox</code>
      </li>
    </ul>

    <h3>Contributing</h3>
    <p>
      Contributions of any kind are welcome (and much appreciated!)<br>
      Please read our <a href="https://github.com/lissy93/networking-toolbox/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">contribution guidelines</a>
      before submitting a pull request.
    </p>

    <h3>Bugs</h3>
    <p>
      Found something that's not working as expected?
      You can raise an issue <a href="https://github.com/Lissy93/networking-toolbox/issues/new/choose" target="_blank" rel="noopener noreferrer">here</a>
      and I'll look into getting it fixed for you.<br>
      For security issues, please see our <a href="/security.txt"><code>security.txt</code></a>
    </p>
   </section>

   
   <!-- Section 5: Actual About -->
   <section>
    <h2>About Networking Toolbox</h2>
    <h3>Motive</h3>
    <p>
      I built this, because these are basic networking tasks that I find myself doing frequently, yet nothing existing on the web quite fit my use case.
      
      <br><br>
      Some websites came close, but I dislike ads, paywalls, tracking, and clunky UIs. And most importantly, I wanted a single place with all the tools I needed.
      And often when I needed these utilities, it was because I was working on a server without internet access, so I needed something with offline functionality.
      <br>
      <br>
      Then, I wanted to help make life <i>slightly</i> easier for sysadmins, so I've polished, tested, documented and open sourced this project.
      It can now be used by anyone, anywhere, anytime. Totally free either at <a href="#-">networking-toolbox.net</a> or self-hosted.
    </p>
   </section>

  <!-- Section 6: Author -->
   <section>
    <h2>Author</h2>
    <div class="author-section">
      <div class="author-bio">
        <p>
          This was built by me, <a href="{author.url}" target="_blank" rel="noopener noreferrer">{author.name}</a>
          (<a target="_blank" rel="noopener noreferrer" href="{author.githubUrl}">@{author.github}</a> on GitHub).
          I'm an open source developer, passionate about Linux, security and the web.
        </p>
        <p>
          I build free and open source software for the developers, sysadmins and sometimes humans.
          My objective is to build tools that respect a user's privacy and are accessible to everyone.
          I have a particular interest in security, Linux and self-hosting.
          But also just love to build things that are fun and (sometimes, maybe) useful.
        </p>
      </div>
      <img class="profile-photo" src="{author.avatar}" alt="{author.name}" width="128" />
    </div>
    <!-- About, more apps, sponsor -->
   </section>

   <!-- Section 7: License -->
   <section>
    <h2>License</h2>
   </section>

   <!-- Section 8: More Apps -->
   <section>
    <h2>More Apps</h2>
    <p>
      If you've found this app useful, you might also like some of my other projects:
    </p>
   </section>

  <section class="tech-section">
    <h3>Technology Stack</h3>
    <p>Built with modern web technologies for optimal performance and user experience:</p>
    <ul class="tech-list">
      <li><strong>SvelteKit:</strong>Modern web framework with server-side rendering</li>
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


<style lang="scss">
/* About page specific styles */

h3 {
  margin-bottom: var(--spacing-sm);
  opacity: 0.8;
  font-size: var(--font-size-md);
}

a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
  
  &:hover {
    color: var(--color-primary-dark);
    text-decoration: underline;
  }
}

p, ul, .code {
  margin: var(--spacing-sm) 0 var(--spacing-md) 0;
  color: var(--text-primary);
  line-height: 1.6;
}

.code {
  background-color: var(--bg-secondary);
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-family: 'Courier New', Courier, monospace;
  display: inline-block;
  width: 100%;
  background: var(--bg-tertiary);
  display: flex;
  flex-direction: column;
  line-height: 1;
}

ul {
  list-style: disc;
  padding-left: var(--spacing-md);
}

.about-content {
  max-width: 1200px;
  margin: 0 auto;
  
  section {
    margin-bottom: var(--spacing-xl);
    &:not(:last-child) {
      border-bottom: 1px solid var(--border-primary);
      padding-bottom: var(--spacing-xl);
    }
    
    h2, h3 {
      color: var(--text-primary);
      // margin-bottom: var(--spacing-md);
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

.author-section {
  display: flex;
  flex-direction: row;
  gap: var(--spacing-md);
  
  .profile-photo {
    border-radius: var(--radius-sm);
    width: 128px;
    border: 2px solid var(--color-primary);
    box-shadow: 0px 0px 5px var(--color-primary-hover);
  }
}

</style>

