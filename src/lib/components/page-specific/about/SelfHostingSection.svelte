<script lang="ts">
  import { site } from '$lib/constants/site';
</script>

<section id="self-hosting">
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