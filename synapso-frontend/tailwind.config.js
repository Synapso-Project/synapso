/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#1a2b4b",
        teal: "#008080",
        skyblue: "#87ceeb",
        beige: "#f5f5dc",
      },
    },
  },
  plugins: [],
}
