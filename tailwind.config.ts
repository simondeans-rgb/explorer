import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
        display: ["Fraunces", "Georgia", "Cambria", "Times New Roman", "serif"],
      },
      colors: {
        // The Society of Discovery house palette.
        passport: {
          navy: "#15233f",
          ink: "#1c1a14",
          gold: "#c0974a",
          goldsoft: "#d8b970",
          parchment: "#f5efe1",
          parchmentdark: "#1a1916",
          card: "#fbf7ec",
          carddark: "#23211b",
        },
      },
      boxShadow: {
        page: "0 1px 2px rgba(20, 17, 14, 0.06), 0 10px 30px rgba(20, 17, 14, 0.08)",
        "page-hover":
          "0 2px 4px rgba(20, 17, 14, 0.08), 0 16px 40px rgba(20, 17, 14, 0.14)",
        "page-dark":
          "0 1px 2px rgba(0, 0, 0, 0.4), 0 12px 30px rgba(0, 0, 0, 0.5)",
        stamp: "inset 0 0 0 2px currentColor",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "rise-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 220ms ease-out",
        "rise-in": "rise-in 260ms ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
