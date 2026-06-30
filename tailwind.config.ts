import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0F1F3D',
          light: '#1A3160',
          dark: '#080F1E',
        },
        gold: {
          DEFAULT: '#C9A84C',
          light: '#E2C06A',
          dark: '#9A7C30',
        },
        saffron: {
          DEFAULT: '#E8722A',
          light: '#F0935A',
          dark: '#BF5518',
        },
        cream: {
          DEFAULT: '#FAF6EE',
          dark: '#F0E8D8',
        },
      },
      fontFamily: {
        display: ['var(--font-poppins)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        hindi: ['var(--font-hind)', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
      },
      maxWidth: {
        app: '428px',
      },
    },
  },
  plugins: [],
};

export default config;
