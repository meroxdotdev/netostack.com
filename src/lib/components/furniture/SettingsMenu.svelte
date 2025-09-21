<script lang="ts">
  import { onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import Icon from '$lib/components/global/Icon.svelte';
  import { accessibility, type AccessibilityOption } from '$lib/stores/accessibility';
  import { tooltip } from '$lib/actions/tooltip';
  import { browser } from '$app/environment';
  import { theme, themes, type ThemeOption } from '$lib/stores/theme';
  import { site } from '$lib/constants/site';

  interface Props {
    onSearchTrigger?: () => void;
  }

  let { onSearchTrigger }: Props = $props();

  let isOpen = $state(false);
  let showMoreA11y = $state(false);
  let menuRef = $state<HTMLDivElement>();
  let triggerRef = $state<HTMLButtonElement>();
  let accessibilitySettings = $state(accessibility);
  let currentTheme = $state(theme);

  // Shortcut key detection
  const isMac = browser && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const shortcutKey = isMac ? '⌘' : 'Ctrl';

  // Language selection
  let selectedLanguage = $state('en');
  const languages = [
    { code: 'en', name: 'English', available: true, flag: '🇺🇸' },
    { code: 'es', name: 'Español', available: false, flag: '🇪🇸' },
    { code: 'fr', name: 'Français', available: false, flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', available: false, flag: '🇩🇪' },
  ];

  // Handle theme change
  function handleThemeChange(themeId: ThemeOption) {
    theme.setTheme(themeId);
  }

  // Handle accessibility setting toggle
  function handleAccessibilityToggle(optionId: string) {
    accessibility.toggle(optionId);
  }

  // Primary accessibility options (always visible)
  const primaryA11yOptions = ['reduce-motion'];
  // const primaryA11yOptions: string[] = [];

  // Get filtered accessibility options
  const primaryOptions = $derived($accessibilitySettings.options.filter((opt) => primaryA11yOptions.includes(opt.id)));

  const additionalOptions = $derived(
    $accessibilitySettings.options.filter((opt) => !primaryA11yOptions.includes(opt.id)),
  );

  // Handle clicks outside menu
  function handleClickOutside(event: MouseEvent) {
    if (isOpen && menuRef && !menuRef.contains(event.target as Node) && !triggerRef?.contains(event.target as Node)) {
      isOpen = false;
    }
  }

  // Handle escape key
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isOpen) {
      isOpen = false;
      triggerRef?.focus();
    }
  }

  // Handle search action
  function handleSearch() {
    isOpen = false;
    onSearchTrigger?.();
  }

  // Handle link clicks to close menu
  function handleLinkClick() {
    isOpen = false;
  }

  // Handle global keyboard shortcuts
  function handleGlobalKeydown(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key === ',') {
      event.preventDefault();
      isOpen = !isOpen;
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('keydown', handleGlobalKeydown);

    // Initialize stores
    accessibility.init();
    theme.init();

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('keydown', handleGlobalKeydown);
    };
  });
</script>

{#snippet accessibilityOption(option: AccessibilityOption)}
  <label class="toggle-option">
    <input
      type="checkbox"
      checked={option.enabled}
      onchange={() => handleAccessibilityToggle(option.id)}
      aria-describedby="a11y-{option.id}-desc"
    />
    <span class="toggle-slider"></span>
    <div class="toggle-content">
      <span>{option.name}</span>
      <small id="a11y-{option.id}-desc" class="toggle-description">{option.description}</small>
    </div>
  </label>
{/snippet}

<div class="settings-menu" bind:this={menuRef}>
  <button
    bind:this={triggerRef}
    class="action-button settings-trigger"
    onclick={() => (isOpen = !isOpen)}
    aria-label="Open Settings"
    aria-expanded={isOpen}
    aria-haspopup="menu"
    use:tooltip={`Settings (${shortcutKey}+,)`}
  >
    <Icon name="settings2" size="sm" />
  </button>

  {#if isOpen}
    <div class="settings-panel" role="menu">
      <!-- Theme Selection -->
      <div class="settings-section">
        <h3>Theme</h3>
        <div class="theme-options" role="radiogroup" aria-label="Theme selection">
          {#each themes as themeOption (themeOption.id)}
            <button
              class="theme-option"
              class:active={$currentTheme === themeOption.id}
              class:disabled={!themeOption.available}
              onclick={() => handleThemeChange(themeOption.id)}
              role="radio"
              aria-checked={$currentTheme === themeOption.id}
              disabled={!themeOption.available}
            >
              <div class="theme-preview theme-{themeOption.id}"></div>
              <span>
                {themeOption.name}
                {!themeOption.available ? ' (Soon)' : ''}
              </span>
            </button>
          {/each}
        </div>
      </div>

      <!-- Language Selection -->
      <div class="settings-section">
        <h3>Language</h3>
        <div class="language-dropdown">
          {#each languages as lang (lang.code)}
            <button
              class="language-option"
              class:active={selectedLanguage === lang.code}
              class:disabled={!lang.available}
              onclick={() => (selectedLanguage = lang.code)}
              disabled={!lang.available}
            >
              {lang.flag}
              {lang.name}
              {!lang.available ? ' (Soon)' : ''}
            </button>
          {/each}
        </div>
      </div>

      <!-- Accessibility Options -->
      <div class="settings-section">
        <h3>Accessibility</h3>
        <div class="accessibility-options">
          <!-- Primary options (always visible) -->
          {#each primaryOptions as option (option.id)}
            {@render accessibilityOption(option)}
          {/each}

          <!-- Expandable additional options -->
          {#if showMoreA11y}
            <div class="additional-options" transition:slide={{ duration: 300 }}>
              {#each additionalOptions as option (option.id)}
                {@render accessibilityOption(option)}
              {/each}
            </div>
          {/if}

          <!-- Show more/less button -->
          <button class="show-more-btn" onclick={() => (showMoreA11y = !showMoreA11y)} aria-expanded={showMoreA11y}>
            <Icon name={showMoreA11y ? 'chevron-up' : 'chevron-down'} size="sm" />
            <span>{showMoreA11y ? 'Show less' : 'Show all a11y options'}</span>
          </button>
        </div>
      </div>

      <!-- Navigation Links -->
      <div class="settings-section settings-links">
        <button class="settings-link" onclick={handleSearch}>
          <Icon name="search" size="sm" />
          <span>Search</span>
        </button>

        <a href="/bookmarks" class="settings-link" onclick={handleLinkClick}>
          <Icon name="bookmarks" size="sm" />
          <span>Bookmarks</span>
        </a>

        <a href="/about" class="settings-link" onclick={handleLinkClick}>
          <Icon name="info" size="sm" />
          <span>About</span>
        </a>

        <a href={site.repo} class="settings-link" target="_blank" rel="noopener noreferrer" onclick={handleLinkClick}>
          <Icon name="github" size="sm" />
          <span>GitHub</span>
        </a>
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  .settings-menu {
    position: relative;
  }

  .settings-trigger {
    :global(svg) {
      transition: transform var(--transition-normal);
    }

    &:hover {
      :global(svg) {
        transform: rotate(45deg);
      }
    }

    &[aria-expanded='true'] {
      background: var(--surface-active);
      color: var(--color-primary);
      border-color: var(--color-primary);

      :global(svg) {
        transform: rotate(45deg);
      }
    }
  }

  .settings-panel {
    position: absolute;
    top: calc(100% + var(--spacing-xs));
    right: 0;
    width: 16rem;
    background: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    padding: var(--spacing-md);
    z-index: 1000;
    animation: slideIn var(--transition-slow);

    @media (max-width: 768px) {
      position: fixed;
      top: auto;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      border-radius: var(--radius-lg) var(--radius-lg) 0 0;
      animation: slideUp var(--transition-slow);
    }
  }

  .settings-section {
    &:not(:last-child) {
      margin-bottom: var(--spacing-lg);
      padding-bottom: var(--spacing-md);
      border-bottom: 1px solid var(--border-primary);
    }

    h3 {
      font-size: var(--font-size-sm);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-sm) 0;
    }
  }

  .theme-options {
    display: flex;
    gap: var(--spacing-xs);
  }

  .theme-option {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm);
    background: var(--bg-tertiary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all var(--transition-normal);
    font-size: var(--font-size-xs);
    color: var(--text-secondary);

    &:hover:not(.disabled) {
      background: var(--surface-hover);
      border-color: var(--border-secondary);
    }

    &.active {
      background: color-mix(in srgb, var(--color-primary), transparent 90%);
      border-color: var(--color-primary);
      color: var(--text-primary);
    }

    &.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .theme-preview {
    width: 1.5rem;
    height: 1rem;
    border-radius: var(--radius-xs);
    border: 1px solid var(--border-secondary);

    &.theme-light {
      background: linear-gradient(135deg, #f4f2fa 50%, #fff 50%);
    }

    &.theme-dark {
      background: linear-gradient(135deg, #0d1117 50%, #161b22 50%);
    }

    &.theme-ocean {
      background: linear-gradient(135deg, #1a4c7a 50%, #2d5f8f 50%);
      opacity: 0.6;
    }
  }

  .language-dropdown {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .language-option {
    padding: var(--spacing-sm);
    background: var(--bg-tertiary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-sm);
    text-align: left;
    cursor: pointer;
    transition: all var(--transition-normal);
    font-size: var(--font-size-sm);
    color: var(--text-secondary);

    &:hover:not(.disabled) {
      background: var(--surface-hover);
      color: var(--text-primary);
    }

    &.active {
      background: color-mix(in srgb, var(--color-primary), transparent 90%);
      border-color: var(--color-primary);
      color: var(--text-primary);
    }

    &.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .accessibility-options {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .toggle-option {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm);
    cursor: pointer;
    font-size: var(--font-size-sm);
    color: var(--text-primary);
    padding: var(--spacing-xs) 0;

    input[type='checkbox'] {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;

      &:checked + .toggle-slider {
        background: var(--color-primary);

        &::before {
          transform: translateX(1rem);
        }
      }

      &:focus + .toggle-slider {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
      }
    }

    .toggle-slider {
      position: relative;
      width: 2rem;
      height: 1.125rem;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-primary);
      border-radius: 1rem;
      transition: all var(--transition-normal);
      flex-shrink: 0;
      margin-top: 0.125rem;

      &::before {
        content: '';
        position: absolute;
        top: 1px;
        left: 1px;
        width: 0.875rem;
        height: 0.875rem;
        background: var(--bg-primary);
        border-radius: 50%;
        transition: transform var(--transition-normal);
      }
    }

    .toggle-content {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
      min-width: 0;
      flex: 1;

      .toggle-description {
        color: var(--text-secondary);
        font-size: var(--font-size-xs);
        line-height: 1.3;
      }
    }
  }

  .additional-options {
    overflow: hidden;
  }

  .show-more-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    width: 100%;
    padding: var(--spacing-sm);
    background: transparent;
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-sm);
    color: var(--text-secondary);
    font-size: var(--font-size-xs);
    cursor: pointer;
    transition: all var(--transition-normal);
    margin-top: var(--spacing-sm);
    justify-content: center;

    &:hover {
      background: var(--surface-hover);
      color: var(--text-primary);
      border-color: var(--border-secondary);
    }

    &[aria-expanded='true'] {
      color: var(--color-primary);
      border-color: var(--color-primary);
    }
  }

  .settings-links {
    border-bottom: none;
    padding-bottom: 0;
    margin-bottom: 0;

    .settings-link {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      width: 100%;
      padding: var(--spacing-xs);
      background: transparent;
      border: none;
      border-radius: var(--radius-sm);
      text-align: left;
      text-decoration: none;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--transition-normal);
      font-size: var(--font-size-sm);

      &:hover {
        background: var(--surface-hover);
        color: var(--text-primary);
      }
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-0.5rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(100%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
