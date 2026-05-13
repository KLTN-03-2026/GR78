import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand — matches main frontend teal/cyan palette
        brand: {
          DEFAULT: '#0d9488', // teal-600
          dark: '#0f766e',    // teal-700
          light: '#14b8a6',   // teal-500
          tint: '#f0fdfa',    // teal-50
        },
        sidebar: '#0f172a',   // slate-900 (kept for dark sidebar)
      },
    },
  },
  plugins: [],
}

export default config
