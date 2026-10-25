import discussionsPreset from '@seer-pm/discussions/tailwind';
import seerPreset from '@seer-pm/ui-kit/tailwind';

// Tailwind 3 opacity modifiers mix the kit's theme-aware hex custom properties.
const token = (name) =>
  `color-mix(in srgb, var(${name}) calc(<alpha-value> * 100%), transparent)`;

/** @type {import('tailwindcss').Config} */
export default {
  presets: [discussionsPreset, seerPreset],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@seer-pm/discussions/dist/**/*.{js,mjs}',
    './node_modules/@seer-pm/ui-kit/dist/**/*.{js,mjs}',
  ],
  // The kit composes these mask class names from runtime theme and social IDs.
  safelist: [
    'seer-icon-sun',
    'seer-icon-moon',
    'seer-icon-discord',
    'seer-icon-telegram',
    'seer-icon-x',
    'seer-icon-github',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--seer-font-sans)'],
        sans: ['var(--seer-font-sans)'],
        mono: ['ui-monospace', 'monospace'],
      },
      colors: {
        wall: token('--seer-page'),
        plaque: token('--seer-surface'),
        'plaque-edge': token('--seer-surface-raised'),
        paper: token('--seer-text'),
        muted: token('--seer-muted'),
        brand: token('--seer-brand-purple'),
        'brand-hover': token('--seer-brand-purple-hover'),
        up: token('--seer-accent-text'),
        down: token('--seer-negative'),
        'down-ink': token('--seer-negative'),
        edge: token('--seer-border'),
        'edge-strong':
          'color-mix(in srgb, var(--seer-border), var(--seer-text) 20%)',
      },
      borderRadius: {
        DEFAULT: 'var(--seer-radius-sm)',
        sm: 'var(--seer-radius-sm)',
        md: 'var(--seer-radius-sm)',
        lg: 'var(--seer-radius-md)',
        xl: 'var(--seer-radius-md)',
        '2xl': 'var(--seer-radius-md)',
        '3xl': 'var(--seer-radius-md)',
        panel: 'var(--seer-radius-md)',
        control: 'var(--seer-radius-sm)',
        custom: 'var(--seer-radius-md)',
        full: 'var(--seer-radius-full)',
      },
      boxShadow: {
        panel:
          '0 12px 32px color-mix(in srgb, var(--seer-brand-ink) 18%, transparent)',
        lot: 'none',
      },
      maxWidth: { shell: '1350px' },
    },
  },
  plugins: [],
};
