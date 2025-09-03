// const { addIconSelectors } = require('@iconify/tailwind')
const plugin = require('tailwindcss/plugin')
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      height: {
        workspace: 'calc(100vh - 20px)',
        'control-panel-content': 'calc(100vh - 65px - 20px)',
        'control-panel-content-low': 'calc(100vh - 65px - 20px - 65px - 20px)',
        'collection-explorer': 'calc(100vh - 65px - 20px - 65px - 20px)',
        'product-table': 'calc(100vh - 64px - 64px - 20px)',
        panel: 'calc(100vh - 65px - 65px - 20px - 64px)',
        // 'product-table-panel':
      },
    },
  },
  plugins: [
    // addIconSelectors(['mdi']),
    // plugin(function ({ addBase, theme }) {
    //   addBase({
    //     h1: { fontSize: theme('fontSize.2xl') },
    //     // h2: { fontSize: theme('fontSize.xl') },
    //     // h3: { fontSize: theme('fontSize.lg') },
    //   })
    // }),
  ],
}
