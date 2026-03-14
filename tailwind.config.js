/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#0a0a0a",
        },
        accent: {
          light: "#fef9ec",
          DEFAULT: "#c9a84c",
          dark: "#b8943e",
        },
        nav: "#1c1c1c",
        topbar: "#111111",
      },
      fontFamily: {
        sans: ["Assistant", "Arial Hebrew", "Arial", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 8px 0 rgba(0,0,0,0.08)",
        "card-hover": "0 8px 24px 0 rgba(0,0,0,0.14)",
        nav: "0 2px 8px rgba(0,0,0,0.15)",
      },
    },
  },
  plugins: [],
};
