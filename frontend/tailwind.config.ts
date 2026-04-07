import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './store/**/*.{ts,tsx}'
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        background: '#F6F7F9',
        foreground: '#0F172A',
        card: '#FFFFFF',
        primary: '#6B7280',
        secondary: '#D1D5DB',
        muted: '#E5E7EB',
        accent: '#9CA3AF',
        border: '#E2E8F0'
      },
      boxShadow: {
        soft: '0 6px 30px -20px rgba(15, 23, 42, 0.35)'
      }
    }
  },
  plugins: []
};

export default config;
