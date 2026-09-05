/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: "#01472e",
          dark: "#022317",
          deep: "#01170f",
          card: "#063020",
          border: "#134934"
        },
        sage: {
          DEFAULT: "#ccd5ae",
          dark: "#aab38a",
          light: "#e2e7cb"
        },
        olive: {
          DEFAULT: "#e9edc9",
          dark: "#c7cb9d"
        },
        cream: {
          DEFAULT: "#fefae0",
          muted: "#e4dfc0"
        },
        moss: {
          DEFAULT: "#a3b18a",
          dark: "#588157",
          light: "#b5c29f"
        }
      },
      fontFamily: {
        display: ['Anton', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        '2.5xl': '2.5rem',
        '3xl': '3rem',
        '4xl': '4rem',
        '5xl': '5rem',
      },
      boxShadow: {
        'forest-lg': '0 20px 40px -15px rgba(1, 71, 46, 0.4)',
        'forest-2xl': '0 30px 60px -15px rgba(1, 71, 46, 0.5)',
      }
    },
  },
  plugins: [],
}
