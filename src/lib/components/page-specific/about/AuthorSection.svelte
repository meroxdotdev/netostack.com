<script lang="ts">
  import { author } from '$lib/constants/site';

  const moreApps = [
    {
      name: 'domain-locker',
      title: 'Domain Locker',
      icon: 'https://storage.googleapis.com/as93-screenshots/project-logos/domain-locker.png',
      description: 'Domain name portfolio app for monitoring your domains',
      color: '#9571ff',
    },
    {
      name: 'web-check',
      title: 'Web Check',
      description: 'The ultimate all-in-one OSINT tool for analyzing any website',
      icon: 'https://raw.githubusercontent.com/Lissy93/web-check/master/public/android-chrome-192x192.png',
      color: '#9fef00',
    },
    {
      name: 'permissionator',
      title: 'Permissionator',
      description: 'A Linux chmod calculator, for generating safe file permissions',
      icon: 'https://github.com/Lissy93/permissionator/blob/main/public/logo.png?raw=true',
      color: '#05df72',
    },
    {
      name: 'personal-security-checklist',
      title: 'Digital Defense',
      description: 'The ultimate security checklist, for protecting your data online',
      icon: 'https://storage.googleapis.com/as93-screenshots/project-logos/digital-defense.png',
      color: '#a78bfa',
    },
    {
      name: 'awesome-privacy',
      title: 'Awesome Privacy',
      icon: 'https://storage.googleapis.com/as93-screenshots/project-logos/awesome-privacy.png',
      description: 'A curated list of services which respects your privacy',
      color: '#fc60a8',
    },
    {
      name: 'dashy',
      title: 'Dashy',
      description: 'A self-hostable personal server dashboard',
      icon: 'https://i.ibb.co/yhbt6CY/dashy.png',
      color: '#00efe3',
    },
  ];
</script>

<section id="author">
  <h2>Author</h2>
  <h3>About Me</h3>
  <div class="author-section">
    <div class="author-bio">
      <p>
        This was built by me, <a href={author.url} target="_blank" rel="noopener noreferrer">{author.name}</a>
        (<a target="_blank" rel="noopener noreferrer" href={author.githubUrl}>@{author.github}</a> on GitHub). I'm an open
        source developer, passionate about Linux, security and the web.
      </p>
      <p>
        I build free and open source software for the developers, sysadmins and sometimes humans. My objective is to
        build tools that respect a user's privacy and are accessible to everyone. I have a particular interest in
        security, Linux and self-hosting. But also just love to build things that are fun and (sometimes, maybe) useful.
      </p>
    </div>
    <img class="profile-photo" src={author.avatar} alt={author.name} width="128" />
  </div>
  <div class="link-button blue">
    <a href="https://aliciasykes.com" target="_blank">Website</a>
  </div>

  <h3>Sponsorship</h3>
  <p>
    I have developed, open sourced and maintain 100+ applications and libraries, used by over 1 million people every
    year. And pretty much everything I build is free to use, open source, and without ads, tracking or paywalls. Because
    I believe software should be free and accessible to everyone.
    <br /><br />
    But running these projects does cost money. And maintaining them takes time. So, if you've found this app useful, please
    consider <a href={author.sponsor} target="_blank" rel="noopener noreferrer">sponsoring me</a>. My sponsors mean the
    world to me, and it's because of their generosity that this app can remain free for everyone.
  </p>
  <div class="link-button pink">
    <a href="https://github.com/sponsors/lissy93" target="_blank">Sponsor</a>
  </div>

  <h3 id="more-apps">More Apps</h3>
  <p>If you've found this app useful, you might also like some of my other projects:</p>
  <div class="more-app-list">
    <div class="links-grid">
      {#each moreApps as app (app.name)}
        <a
          class="link-card"
          style="--app-color: {app.color}"
          href="https://github.com/lissy93/{app.name}"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h4>{app.title}</h4>
          <div class="right">
            <img src={app.icon} alt={app.title} width="40" height="40" />
            <p>{app.description}</p>
          </div>
        </a>
      {/each}
    </div>
  </div>
  <div class="link-button purple">
    <a href="https://lissy93.github.io" target="_blank">More Apps</a>
  </div>
</section>

<style lang="scss">
  .author-section {
    display: flex;
    flex-direction: row;
    gap: var(--spacing-md);

    p:first-child {
      margin-top: 0;
    }

    .profile-photo {
      border-radius: var(--radius-sm);
      width: 96px;
      height: fit-content;
      border: 2px solid var(--color-primary);
      box-shadow: 0px 0px 5px var(--color-primary-hover);
    }
  }

  .more-app-list {
    .links-grid {
      grid-template-columns: repeat(auto-fit, minmax(330px, 1fr));

      .link-card {
        border-width: 2px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-sm);
        padding: var(--spacing-md);

        h4 {
          font-size: var(--font-size-lg);
          margin: 0;
        }

        .right {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: var(--spacing-md);
        }

        &:hover {
          border-color: var(--app-color, var(--color-primary));

          h4 {
            color: var(--app-color, var(--color-primary));
          }
        }
      }
    }
  }
</style>
