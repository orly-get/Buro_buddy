/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#AD2C4E',
          50: '#FDF4F6',
          100: '#FCE8EC',
          200: '#F9D1D9',
          300: '#F4AFC0',
          400: '#EB7A95',
          500: '#AD2C4E',
          600: '#8B2340',
          700: '#6B1C33',
          800: '#4B1526',
          900: '#2B0F19',
        },
        secondary: {
          DEFAULT: '#934656',
        },
        accent: {
          DEFAULT: '#BA1340',
        },
        background: '#FCF9F8',
        surface: '#FFFFFF',
        text: '#1B1C1C',
        error: '#BA1A1A',
        success: '#27AE60',
        border: {
          input: '#FF9EAF',
        },
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        'card': '16px',
        'input': '12px',
        'button': '16px',
      },
      boxShadow: {
        'card': '0 4px 20px rgba(173, 44, 78, 0.08)',
        'soft': '0 2px 8px rgba(173, 44, 78, 0.06)',
      },
      fontSize: {
        'h1': ['24px', { lineHeight: '32px', fontWeight: '700' }],
        'h2': ['20px', { lineHeight: '28px', fontWeight: '700' }],
        'body': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '16px', fontWeight: '500' }],
        'button': ['16px', { lineHeight: '24px', fontWeight: '600' }],
      },
    },
  },
  plugins: [],
};
