/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        surface: { DEFAULT: "#141922", hover: "#1a2130" },
        line: "#2a3344",
        ink: "#e8ecf4",
        muted: "#8b95a8",
        accent: { DEFAULT: "#3dd6c3", dim: "rgba(61,214,195,0.15)" },
      },
      boxShadow: {
        glow: "0 0 40px rgba(61, 214, 195, 0.12)",
      },
    },
  },
  plugins: [],
};
