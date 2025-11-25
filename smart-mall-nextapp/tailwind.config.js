/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#83A9CC',
          light: '#A2C0E8',
          soft: '#D9E6F4',
          dark: '#6B8FB5',
        },

        neutral: {
          50: '#F7F9FC',
          100: '#F5F6FA',
          200: '#E3E7EE',
          300: '#D0D6DF',
          500: '#555',
          600: '#444',
        },

        background: {
          DEFAULT: '#F7F9FC',
          subtle: '#F5F6FA',
        },

        success: '#2ECC71',
        warning: '#F1C40F',
        danger: '#E74C3C',
      },

      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #83A9CC, #A2C0E8)',
      },

      borderWidth: {
        3: '3px',
      },

      borderRadius: {
        card: '1rem',
        '2xl': '1rem',
      },

      boxShadow: {
        soft: '0 2px 8px rgba(0,0,0,0.06)',
        'soft-lg': '0 4px 20px rgba(0,0,0,0.06)',
      },

      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
};
