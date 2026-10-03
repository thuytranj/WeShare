/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b70df',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        canvas: {
          light: '#F4F7FC',
          dark: '#10131C',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#181B26',
        },
        inset: {
          light: '#EEF2F8',
          dark: '#0E1015',
        },
        pastel: {
          lavender: '#8B70DF',
          violet: '#7C3AED',
          mint: '#10B981',
          'mint-light': '#6EE7B7',
          'mint-soft': '#D1FAE5',
          rose: '#F43F5E',
          'rose-light': '#FDA4AF',
          'rose-soft': '#FFE4E6',
          periwinkle: '#93C5FD',
          amber: '#F59E0B',
          peach: '#FDBA74',
        },
      },
      boxShadow: {
        'neu-flat-light': '0 10px 30px rgba(150, 162, 185, 0.28), 0 2px 8px rgba(150, 162, 185, 0.16)',
        'neu-flat-dark': '-4px -4px 10px rgba(255, 255, 255, 0.03), 4px 4px 14px rgba(0, 0, 0, 0.65)',
        'neu-inset-light': 'inset 0 2px 5px rgba(150, 162, 185, 0.25)',
        'neu-inset-dark': 'inset 0 2px 5px rgba(0, 0, 0, 0.6)',
        'neu-glow-pastel': '0 0 20px rgba(139, 112, 223, 0.35)',
        'neu-glow-mint': '0 0 18px rgba(110, 231, 183, 0.35)',
        'neu-glow-rose': '0 0 18px rgba(244, 63, 94, 0.35)',
        'neu-pressed': 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
      },
      borderRadius: {
        '2xl': '1.25rem', // 20px squircle
        '3xl': '1.5rem',  // 24px
        '4xl': '2rem',    // 32px
      },
    },
  },
  plugins: [],
};
