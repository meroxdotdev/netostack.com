import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type ThemeOption = 'light' | 'dark' | 'ocean';

export interface Theme {
  id: ThemeOption;
  name: string;
  available: boolean;
  preview?: string;
}

const STORAGE_KEY = 'theme';

// Available themes configuration
export const themes: Theme[] = [
  {
    id: 'light',
    name: 'Light',
    available: true,
  },
  {
    id: 'dark',
    name: 'Dark',
    available: true,
  },
  {
    id: 'ocean',
    name: 'Ocean',
    available: true,
  },
];

function createThemeStore() {
  const { subscribe, set, update } = writable<ThemeOption>('dark');

  return {
    subscribe,

    // Initialize theme from localStorage or default
    init: () => {
      if (browser) {
        const saved = localStorage.getItem(STORAGE_KEY);
        const initialTheme =
          saved === 'light' || saved === 'dark' || saved === 'ocean' ? (saved as ThemeOption) : 'dark';

        set(initialTheme);

        // Apply theme to document
        if (initialTheme === 'light') {
          document.documentElement.classList.add('theme-light');
          document.documentElement.classList.remove('theme-dark', 'theme-ocean');
        } else if (initialTheme === 'ocean') {
          document.documentElement.classList.add('theme-ocean');
          document.documentElement.classList.remove('theme-light', 'theme-dark');
        } else {
          document.documentElement.classList.remove('theme-light', 'theme-ocean');
        }

        return initialTheme;
      }
      return 'dark';
    },

    // Set theme and persist to localStorage
    setTheme: (theme: ThemeOption) => {
      // Only set if theme is available
      const themeConfig = themes.find((t) => t.id === theme);
      if (!themeConfig?.available) {
        console.warn(`Theme "${theme}" is not available`);
        return;
      }

      set(theme);

      if (browser) {
        localStorage.setItem(STORAGE_KEY, theme);

        // Apply theme classes to document
        if (theme === 'light') {
          document.documentElement.classList.add('theme-light');
          document.documentElement.classList.remove('theme-dark', 'theme-ocean');
        } else if (theme === 'ocean') {
          document.documentElement.classList.add('theme-ocean');
          document.documentElement.classList.remove('theme-light', 'theme-dark');
        } else {
          // Default to dark
          document.documentElement.classList.remove('theme-light', 'theme-ocean');
        }
      }
    },

    // Toggle between light and dark themes (legacy support)
    toggle: () => {
      update((currentTheme) => {
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        if (browser) {
          localStorage.setItem(STORAGE_KEY, newTheme);

          if (newTheme === 'light') {
            document.documentElement.classList.add('theme-light');
            document.documentElement.classList.remove('theme-dark');
          } else {
            document.documentElement.classList.remove('theme-light');
          }
        }

        return newTheme;
      });
    },

    // Check if current theme is dark
    isDark: (theme: ThemeOption): boolean => {
      return theme === 'dark';
    },

    // Check if current theme is light
    isLight: (theme: ThemeOption): boolean => {
      return theme === 'light';
    },

    // Get theme configuration
    getThemeConfig: (theme: ThemeOption): Theme | undefined => {
      return themes.find((t) => t.id === theme);
    },

    // Get all available themes
    getAvailableThemes: (): Theme[] => {
      return themes.filter((t) => t.available);
    },
  };
}

export const theme = createThemeStore();
