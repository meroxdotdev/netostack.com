<script>
  import { TOP_NAV } from '$lib/constants/nav';
</script>

<footer class="footer">
  <!-- <p>
    Built with 🩷 and 🍺 by
    <a href="https://github.com/lissy93" target="_blank" rel="noopener noreferrer">Lissy93</a>.
    <a href="https://github.com/lissy93/ip-calc" target="_blank" rel="noopener noreferrer">View on GitHub</a>
  </p> -->
  <p class="footer-sub">
    <a href="https://ip-calc.as93.net" target="_blank" rel="noopener noreferrer">IP-Calc</a>
    is licensed under
    <a href="https://github.com/lissy93/ip-calc/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">MIT</a>,
    (C)
    <a href="https://github.com/lissy93" target="_blank" rel="noopener noreferrer">Alicia Sykes</a> 2025
  </p>
  <p class="footer-sub">
    {#each TOP_NAV as item, i}
      <a href="{item.href}">{item.label}</a>{i < TOP_NAV.length - 1 ? ' • ' : ''}
    {/each}
    • <a href="/about">About</a>
  </p>
</footer>

<style>
  
.footer {
  text-align: center;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-top: 1px solid var(--border-primary);
  margin-top: var(--spacing-xl);
  display: flex;
  width: 100%;
  justify-content: space-between;
  flex-wrap: wrap;
  flex-direction: row-reverse;
  margin: 0 auto;

  @media (max-width: 800px) {
    justify-content: center;
  }
  
  p {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    margin-bottom: var(--spacing-xs);
  }
  
  .footer-sub {
    font-size: var(--font-size-xs) !important;
    opacity: 0.8;
  }
  
  a {
    color: var(--color-primary);
    text-decoration: none;
    transition: color var(--transition-fast);
    
    &:hover {
      color: var(--color-primary-light);
      text-decoration: underline;
    }
  }

}
</style>
