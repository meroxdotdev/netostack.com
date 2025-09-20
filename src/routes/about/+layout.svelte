<script>
  import '../../styles/page-specific/about-page.scss';
</script>

<main class="card about-content">
  <slot />
</main>

<style lang="scss">
  .about-content {
    max-width: 1200px;
    margin: 0 auto;
  }
</style>
