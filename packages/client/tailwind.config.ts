import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: '#1e293b',
        panel: '#0f172a',
        panelAlt: '#111827',
        accent: '#8b5cf6',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(139, 92, 246, 0.2), 0 20px 60px rgba(15, 23, 42, 0.45)',
      },
    },
  },
  plugins: [],
} satisfies Config;
