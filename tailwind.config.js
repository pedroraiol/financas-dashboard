/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: {
          light: "#fcfcfb",
          dark: "#1a1a19",
        },
        plane: {
          light: "#f9f9f7",
          dark: "#0d0d0d",
        },
        ink: {
          primary: { light: "#0b0b0b", dark: "#ffffff" },
          secondary: { light: "#52514e", dark: "#c3c2b7" },
          muted: "#898781",
        },
        series: {
          1: { DEFAULT: "#2a78d6", dark: "#3987e5" },
          2: { DEFAULT: "#eb6834", dark: "#d95926" },
          3: { DEFAULT: "#1baf7a", dark: "#199e70" },
          4: { DEFAULT: "#eda100", dark: "#c98500" },
          5: { DEFAULT: "#e87ba4", dark: "#d55181" },
          6: { DEFAULT: "#008300", dark: "#008300" },
          7: { DEFAULT: "#4a3aa7", dark: "#9085e9" },
          8: { DEFAULT: "#e34948", dark: "#e66767" },
        },
        status: {
          good: "#0ca30c",
          warning: "#fab219",
          serious: "#ec835a",
          critical: "#d03b3b",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
      },
    },
  },
  plugins: [],
};
