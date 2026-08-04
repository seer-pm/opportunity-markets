/** @type {import('tailwindcss').Config} */
import discussionsPreset from '@seer-pm/discussions/tailwind';

export default {
  presets: [discussionsPreset],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@seer-pm/discussions/dist/**/*.{js,mjs}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Urbanist', 'system-ui', 'sans-serif'],
        sans: ['Urbanist', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        wall: '#0A0814',
        plaque: '#110d1c',
        'plaque-edge': '#1e1830',
        paper: '#ECE8F5',
        muted: '#8B83A3',
        brand: '#520078',
        up: '#A774D1',
        down: '#ea3943',
        edge: 'rgba(167, 116, 209, 0.12)',
        'edge-strong': 'rgba(167, 116, 209, 0.25)',
      },
      borderRadius: {
        panel: '8px',
        control: '6px',
        custom: '8px',
      },
      boxShadow: {
        panel: '0 12px 40px rgba(0, 0, 0, 0.45)',
        lot: '0 8px 28px rgba(10, 8, 20, 0.55)',
      },
      maxWidth: {
        shell: '1350px',
      },
    },
  },
  plugins: [],
};
