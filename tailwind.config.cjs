/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    "bg-rose-400",
    "shadow-rose-400/50",
    "bg-emerald-400",
    "shadow-emerald-400/50",
    "bg-sky-400",
    "shadow-sky-400/50",
  ]
};
