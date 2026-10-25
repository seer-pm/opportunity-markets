import { useLayoutEffect, useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';
const STORAGE_KEY = 'seer-opportunity-theme';
const CHANGE_EVENT = 'seer-opportunity-theme-change';
let sessionPreference: Theme | null = null;

function readPreference(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

function getTheme(): Theme {
  return (
    sessionPreference ??
    readPreference() ??
    (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );
}

function subscribe(onChange: () => void) {
  const media = matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', onChange);
  window.addEventListener('storage', onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    media.removeEventListener('change', onChange);
    window.removeEventListener('storage', onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function useTheme() {
  const theme = useSyncExternalStore(
    subscribe,
    getTheme,
    () => 'light' as Theme,
  );
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  return {
    theme,
    toggleTheme: () => {
      const next = theme === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // The theme still changes in this tab when storage is unavailable.
        sessionPreference = next;
        document.documentElement.dataset.theme = next;
      }
      window.dispatchEvent(new Event(CHANGE_EVENT));
    },
  };
}
