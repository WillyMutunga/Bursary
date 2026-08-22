/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cdf: {
          green: {
            50: '#f0fdf4',
            100: '#dcfce7',
            500: '#22c55e',
            600: '#16a34a',
            700: '#0B6B3A',
            800: '#084e2a',
            900: '#05331c',
          },
          gold: {
            50: '#fffbeb',
            100: '#fef3c7',
            400: '#fbbf24',
            500: '#D4A72C',
            600: '#b88c1b',
            700: '#926a10',
          },
          navy: {
            700: '#1e293b',
            800: '#111c38',
            900: '#0F172A',
            950: '#070b14',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
