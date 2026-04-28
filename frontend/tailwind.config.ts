import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0e27',
        surface: '#1a1f3a',
        'accent-primary': '#00d4ff',
        'accent-secondary': '#ff006e',
        success: '#00ff41',
        warning: '#ffd60a',
        danger: '#ff006e',
        'text-primary': '#e0e0ff',
        'text-secondary': '#a0a0c0',
        border: '#2a3555',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};

export default config;
