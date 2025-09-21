import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface AccessibilityOption {
  id: string;
  name: string;
  description: string;
  category: 'visual' | 'motion' | 'reading' | 'interaction';
  enabled: boolean;
  cssClass: string;
  systemPreference?: () => boolean; // Function to check system preference
}

export interface AccessibilitySettings {
  options: AccessibilityOption[];
}

const STORAGE_KEY = 'accessibility-settings';

// Define all available accessibility options
const DEFAULT_OPTIONS: AccessibilityOption[] = [
  {
    id: 'reduce-motion',
    name: 'Reduce motion',
    description: 'Minimize animations and transitions',
    category: 'motion',
    enabled: false,
    cssClass: 'reduce-motion',
    systemPreference: () => browser && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  },
  {
    id: 'high-contrast',
    name: 'High contrast',
    description: 'Increase visual contrast for better readability',
    category: 'visual',
    enabled: false,
    cssClass: 'contrast-high',
  },
  {
    id: 'large-text',
    name: 'Large text',
    description: 'Increase font size across the application',
    category: 'visual',
    enabled: false,
    cssClass: 'scale-large',
  },
  {
    id: 'dyslexia-font',
    name: 'Dyslexia-friendly font',
    description: 'Use OpenDyslexic font for better readability',
    category: 'reading',
    enabled: false,
    cssClass: 'dyslexia-font',
  },
  {
    id: 'always-underline-links',
    name: 'Always underline links',
    description: 'Show underlines on all links, not just on hover',
    category: 'visual',
    enabled: false,
    cssClass: 'links-always-underline',
  },
  {
    id: 'no-icons',
    name: 'Hide decorative icons',
    description: 'Hide non-essential icons to reduce visual clutter',
    category: 'visual',
    enabled: false,
    cssClass: 'no-icons',
  },
  {
    id: 'focus-visible',
    name: 'Enhanced focus indicators',
    description: 'Make keyboard focus more visible',
    category: 'interaction',
    enabled: false,
    cssClass: 'focus-enhanced',
  },
  {
    id: 'dark-mode-high-contrast',
    name: 'Dark mode high contrast',
    description: 'Extra contrast when using dark theme',
    category: 'visual',
    enabled: false,
    cssClass: 'dark-contrast-high',
  },
];

function createAccessibilityStore() {
  const { subscribe, set, update } = writable<AccessibilitySettings>({
    options: DEFAULT_OPTIONS,
  });

  return {
    subscribe,

    init: () => {
      if (browser) {
        const stored = localStorage.getItem(STORAGE_KEY);
        let storedSettings: Partial<AccessibilitySettings> = {};

        if (stored) {
          try {
            storedSettings = JSON.parse(stored);
          } catch {
            storedSettings = {};
          }
        }

        // Merge stored settings with defaults, checking system preferences
        const options = DEFAULT_OPTIONS.map((defaultOption) => {
          const storedOption = storedSettings.options?.find((opt) => opt.id === defaultOption.id);

          // If no stored preference, check system preference
          const enabled = storedOption?.enabled ?? defaultOption.systemPreference?.() ?? defaultOption.enabled;

          return {
            ...defaultOption,
            enabled,
          };
        });

        set({ options });
      }
    },

    toggle: (optionId: string) => {
      update((settings) => {
        const newOptions = settings.options.map((option) =>
          option.id === optionId ? { ...option, enabled: !option.enabled } : option,
        );

        const newSettings = { ...settings, options: newOptions };

        if (browser) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
        }

        return newSettings;
      });
    },

    enable: (optionId: string) => {
      update((settings) => {
        const newOptions = settings.options.map((option) =>
          option.id === optionId ? { ...option, enabled: true } : option,
        );

        const newSettings = { ...settings, options: newOptions };

        if (browser) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
        }

        return newSettings;
      });
    },

    disable: (optionId: string) => {
      update((settings) => {
        const newOptions = settings.options.map((option) =>
          option.id === optionId ? { ...option, enabled: false } : option,
        );

        const newSettings = { ...settings, options: newOptions };

        if (browser) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
        }

        return newSettings;
      });
    },

    // Get the CSS classes string for data-a11y attribute
    getCSSClasses: (settings: AccessibilitySettings): string => {
      return settings.options
        .filter((option) => option.enabled)
        .map((option) => option.cssClass)
        .join(' ');
    },

    // Get options by category
    getOptionsByCategory: (settings: AccessibilitySettings, category: AccessibilityOption['category']) => {
      return settings.options.filter((option) => option.category === category);
    },

    // Check if an option is enabled
    isEnabled: (settings: AccessibilitySettings, optionId: string): boolean => {
      return settings.options.find((option) => option.id === optionId)?.enabled ?? false;
    },

    // Reset all settings to defaults
    reset: () => {
      const defaultSettings = { options: DEFAULT_OPTIONS };
      set(defaultSettings);

      if (browser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings));
      }
    },
  };
}

export const accessibility = createAccessibilityStore();
