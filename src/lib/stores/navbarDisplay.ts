import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type NavbarDisplayMode = 'default' | 'bookmarked' | 'frequent' | 'none';

export interface NavbarDisplayOption {
  id: NavbarDisplayMode;
  name: string;
  description: string;
}

const STORAGE_KEY = 'navbar-display';

// Available navbar display options
export const navbarDisplayOptions: NavbarDisplayOption[] = [
  {
    id: 'default',
    name: 'Default/All',
    description: 'Show dropdown links for each page/sub-page',
  },
  {
    id: 'bookmarked',
    name: 'Bookmarked',
    description: 'Show bookmarked links in the top nav',
  },
  {
    id: 'frequent',
    name: 'Frequent',
    description: 'Show most frequently used tools',
  },
  {
    id: 'none',
    name: 'None',
    description: "Don't show any links in the top nav",
  },
];

function createNavbarDisplayStore() {
  const { subscribe, set } = writable<NavbarDisplayMode>('default');

  return {
    subscribe,

    // Initialize from localStorage or default
    init: () => {
      if (browser) {
        const stored = localStorage.getItem(STORAGE_KEY);
        const isValidMode = navbarDisplayOptions.some((option) => option.id === stored);
        const initialMode = isValidMode ? (stored as NavbarDisplayMode) : 'default';

        set(initialMode);
        return initialMode;
      }
      return 'default';
    },

    // Set navbar display mode and persist to localStorage
    setMode: (mode: NavbarDisplayMode) => {
      const option = navbarDisplayOptions.find((opt) => opt.id === mode);
      if (!option) {
        console.warn(`Navbar display mode "${mode}" is not valid`);
        return;
      }

      set(mode);

      if (browser) {
        localStorage.setItem(STORAGE_KEY, mode);
      }
    },

    // Get option configuration
    getOption: (mode: NavbarDisplayMode): NavbarDisplayOption | undefined => {
      return navbarDisplayOptions.find((opt) => opt.id === mode);
    },

    // Get all available options
    getAllOptions: (): NavbarDisplayOption[] => {
      return navbarDisplayOptions;
    },
  };
}

export const navbarDisplay = createNavbarDisplayStore();
