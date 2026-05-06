/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // — core palette —
        teal: {
          500: '#0E4D3C', // navbar, hero, btn
          600: '#093829', // footer, hover
          100: '#B3DBCF', // light fills
        },
        mint: {
          300: '#45CDA4', // CTA, focus ring, links
          100: '#C2F0E0', // badge bg
        },
        cream: {
          300: '#E8D67A', // headings on dark bg
        },
        sage: {
          50: '#F2F7F5', // page bg
          100: '#D5E5DF', // borders, dividers
          300: '#728F87', // muted / hint text
          500: '#2A3D35', // body text
        },

        // — functional colors —
        coral: {
          500: '#EB5757', // error, destructive actions
          600: '#D94343', // error hover
        },
        emerald: {
          500: '#27AE60', // success
        },
        amber: {
          500: '#F2C94C', // warning
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

