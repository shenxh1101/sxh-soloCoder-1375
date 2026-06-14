/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
      },
    },
    extend: {
      colors: {
        brand: {
          50: '#FFF1F0',
          100: '#FFE0DC',
          200: '#FFC2B8',
          300: '#FFA394',
          400: '#FF8570',
          500: '#FF6B6B',
          600: '#E54C4C',
          700: '#CC2E2E',
          800: '#B31818',
          900: '#990000',
        },
        accent: {
          50: '#F0FFFD',
          100: '#DCFFF9',
          200: '#B8FFF3',
          300: '#94FFED',
          400: '#70FFE7',
          500: '#4ECDC4',
          600: '#2EB5AC',
          700: '#0E9D94',
          800: '#00857C',
          900: '#006D65',
        },
        warm: {
          50: '#FFF8F3',
          100: '#FFEFE4',
          200: '#FFDFC9',
          300: '#FFCFAE',
          400: '#FFBF93',
          500: '#FF8E53',
          600: '#E57034',
          700: '#CC5515',
          800: '#B33C00',
          900: '#992800',
        }
      },
      fontFamily: {
        sans: ['"Poppins"', '"Noto Sans SC"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['"Poppins"', '"Noto Sans SC"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'pulse-ring': 'pulseRing 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'check': 'check 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(78, 205, 196, 0.7)' },
          '70%': { transform: 'scale(1)', boxShadow: '0 0 0 12px rgba(78, 205, 196, 0)' },
          '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(78, 205, 196, 0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        check: {
          '0%': { strokeDashoffset: '50' },
          '100%': { strokeDashoffset: '0' },
        },
      },
      backgroundImage: {
        'grad-primary': 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
        'grad-secondary': 'linear-gradient(135deg, #4ECDC4 0%, #45B7D1 100%)',
        'grad-accent': 'linear-gradient(135deg, #A66CFF 0%, #FF6F91 100%)',
        'grad-warm': 'linear-gradient(135deg, #FFEAA7 0%, #FF8E53 100%)',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 8px 32px rgba(0, 0, 0, 0.1)',
        'card': '0 2px 12px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 28px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
};
