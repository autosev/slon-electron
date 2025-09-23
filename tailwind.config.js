// const { addIconSelectors } = require('@iconify/tailwind')
// const plugin = require('tailwindcss/plugin')
/** @type {import('tailwindcss').Config} */
import PrimeUI from 'tailwindcss-primeui'

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: ['selector', '[class~="app-dark"]'],
  plugins: [PrimeUI, require('@tailwindcss/container-queries')],
  theme: {
    extend: {
      containers: {
        sm: '576px',
        md: '768px',
        lg: '992px',
        xl: '1200px',
        '2xl': '1920px',
      },
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
    screens: {
      sm: '576px',
      md: '768px',
      lg: '992px',
      xl: '1200px',
      '2xl': '1920px',
    },
  },
}
