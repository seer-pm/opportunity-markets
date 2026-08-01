/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Archivo', 'system-ui', 'sans-serif'],
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        wall: '#0b0d10',
        plaque: '#161a20',
        'plaque-edge': '#2c323c',
        paper: '#f2f4f6',
        muted: '#9aa3b2',
        up: '#16c784',
        down: '#ea3943',
      },
      borderRadius: {
        panel: '8px',
        control: '6px',
        custom: '8px',
      },
      boxShadow: {
        panel: '0 12px 40px rgba(0, 0, 0, 0.45)',
        lot: '0 8px 28px rgba(0, 0, 0, 0.35)',
      },
      maxWidth: {
        shell: '1350px',
      },
    },
  },
  plugins: [],
};
