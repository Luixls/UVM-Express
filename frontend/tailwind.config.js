// RUTA: frontend/tailwind.config.js
// ESM, con "type":"module" en package.json
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'], // ok para Vite
  theme: {
    container: { center: true, padding: '1rem' },
    extend: {
      colors: {
        brand: {
          DEFAULT: '#3f8b56', // para clases como text-brand / bg-brand
          50:  '#eef8f0',
          100: '#d8eedc',
          200: '#b5dfbf',
          300: '#8fcea0',
          400: '#6bbd82',
          500: '#4ea96a',
          600: '#3f8b56', // verde principal
          700: '#356f47',
          800: '#2a5839',
          900: '#21452d',
        },
        beige: {
          50:  '#F5F0E6',
          100: '#E7DFD1',
          200: '#D9CFBD',
          300: '#CBBEA8',
          400: '#BDAE94',
          500: '#B09F81',
          600: '#937F67',
          700: '#766451',
          800: '#5A4D3E',
          900: '#3F362B',
        },
        grayx: {
          50:  '#f7f7f7',
          100: '#eeeeee',
          200: '#e2e2e2',
          300: '#cfcfcf',
          400: '#a1a1a1',
          500: '#767676',
          600: '#5b5b5b',
          700: '#444444',
          800: '#2e2e2e',
          900: '#1c1c1c'
        },
      },
      boxShadow: { soft: '0 10px 30px rgba(0,0,0,0.08)' },
      borderRadius: { xl2: '1rem' },
    },
  },
  plugins: [],
};
