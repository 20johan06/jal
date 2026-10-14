/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hts: {
          navy: {
            950: '#070b14', // Deepest background
            900: '#0b1120', // Main background
            850: '#0f172a', // Card surface
            800: '#17223b', // Elevated card / border
            700: '#263558', // Highlight border
          },
          green: {
            400: '#34d399',
            500: '#10b981', // Brand green
            600: '#059669', // Darker green
            900: '#064e3b',
          },
          accent: '#10b981',
          crimson: '#f43f5e',
          amber: '#f59e0b',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Menlo', 'Consolas', 'Courier New', 'monospace'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
