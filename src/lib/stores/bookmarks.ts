import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface BookmarkedTool {
  href: string;
  label: string;
  description: string;
  icon: string;
}

const STORAGE_KEY = 'bookmarked-tools';

function createBookmarksStore() {
  const { subscribe, set, update } = writable<BookmarkedTool[]>([]);

  return {
    subscribe,
    init: () => {
      if (browser) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            set(JSON.parse(stored));
          } catch {
            set([]);
          }
        }
      }
    },
    add: (tool: BookmarkedTool) => {
      update((bookmarks) => {
        if (!bookmarks.find((b) => b.href === tool.href)) {
          const newBookmarks = [...bookmarks, tool];
          if (browser) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newBookmarks));
          }
          return newBookmarks;
        }
        return bookmarks;
      });
    },
    remove: (href: string) => {
      update((bookmarks) => {
        const newBookmarks = bookmarks.filter((b) => b.href !== href);
        if (browser) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newBookmarks));
        }
        return newBookmarks;
      });
    },
    toggle: (tool: BookmarkedTool) => {
      update((bookmarks) => {
        const existing = bookmarks.find((b) => b.href === tool.href);
        const newBookmarks = existing ? bookmarks.filter((b) => b.href !== tool.href) : [...bookmarks, tool];
        if (browser) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newBookmarks));
        }
        return newBookmarks;
      });
    },
    isBookmarked: (href: string, bookmarks: BookmarkedTool[]) => {
      return bookmarks.some((b) => b.href === href);
    },
  };
}

export const bookmarks = createBookmarksStore();
