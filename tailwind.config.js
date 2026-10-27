/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        hebrew: ['var(--font-heebo)', 'var(--font-rubik)', 'ui-sans-serif', 'sans-serif'],
      },
      colors: {
        brand: {
          gold: '#C9A84C',
          'gold-light': '#E8C97A',
          'gold-dark': '#A07830',
          cream: '#FDF8F0',
          navy: '#1A2B4A',
          'navy-light': '#2D4470',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
