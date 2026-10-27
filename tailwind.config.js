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
          gold: '#C86D88', // Warm bridal rose
          'gold-light': '#EAA8BC', // Soft rose petal
          'gold-dark': '#A84865', // Deep rose accent
          'gold-hover': '#B85573', // Rose hover
          cream: '#FFF7F8', // Soft blush ivory/cream
          navy: '#4A1528', // Deep elegant plum/wine (warm bridal primary)
          'navy-light': '#6B223D', // Soft wine-rose
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
