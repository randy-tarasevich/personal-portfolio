/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Astro.build inspired palette
        'bg-primary': '#0D1117',
        'bg-secondary': '#161B22',
        'bg-tertiary': '#21262D',
        'border-subtle': '#30363D',
        'border-light': '#484F58',
        'text-primary': '#E6EDF3',
        'text-secondary': '#8B949E',
        'text-muted': '#6E7681',
        'accent-purple': '#A371F7',
        'accent-blue': '#58A6FF',
        'accent-pink': '#F778BA',
      },
    },
  },
  plugins: [],
};
