/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        "mainBackground":"#0D1117",
        "columnBackground":"#161c22"
      }
    },
  },
  plugins: [],
}

