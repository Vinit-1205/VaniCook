/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/frontend/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // VaniCook Brand Identity Palette
        forest: {
          DEFAULT: '#173D2E', // Primary brand forest green
          deep: '#102B21',    // Deep green
          dark: '#102B21',
          light: '#245944',
        },
        fresh: {
          DEFAULT: '#A5BE83', // Fresh leaf green
          light: '#BCD39F',
          dark: '#8DA66A',
        },
        leaf: {
          DEFAULT: '#A5BE83',
          light: '#BCD39F',
          dark: '#8DA66A',
        },
        ivory: {
          DEFAULT: '#F8F5EC', // Warm ivory page background
          soft: '#F0EBDD',    // Soft cream secondary
        },
        cream: {
          DEFAULT: '#F8F5EC', // Warm ivory
          soft: '#F0EBDD',    // Soft cream
          card: '#FFFFFF',    // Pure crisp card white
          alt: '#F0EBDD',
          border: '#E7E3D9',
        },
        terracotta: {
          DEFAULT: '#C47755', // Terracotta accent (sparingly)
          light: '#D48E6E',
          dark: '#A65D3C',
        },
        charcoal: {
          DEFAULT: '#252923', // Charcoal dark body text
          muted: '#77796F',   // Muted descriptive text
          light: '#919489',
        },
        border: {
          DEFAULT: '#E7E3D9', // Subtle crisp border
          subtle: '#EFECE3',
          dark: '#D5D0C3',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        label: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(23, 61, 46, 0.05)',
        'premium': '0 12px 36px -4px rgba(23, 61, 46, 0.08)',
        'card': '0 1px 3px 0 rgba(37, 41, 35, 0.03), 0 1px 2px -1px rgba(37, 41, 35, 0.03)',
        'elevated': '0 20px 40px -12px rgba(23, 61, 46, 0.12)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}

