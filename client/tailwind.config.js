/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/*.jsx"
  ],
  theme: {
    extend: {
      fontFamily:{
        'poppins':['Poppins', 'sans-serif'],
        'josefin':['Josefin Sans', 'sans-serif']
      }
    },
  },
  plugins: [],
}

