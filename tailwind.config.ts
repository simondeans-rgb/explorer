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
        hand: ["Caveat", "Comic Sans MS", "cursive"],
      },
      colors: {
        canvas: {
          light: "#F2EFE6",
          dark: "#1A1916",
        },
      },
      boxShadow: {
        note: "0 1px 2px rgba(20, 17, 14, 0.06), 0 8px 18px rgba(20, 17, 14, 0.10)",
        "note-hover":
          "0 2px 4px rgba(20, 17, 14, 0.08), 0 14px 28px rgba(20, 17, 14, 0.14)",
        "note-drag":
          "0 8px 16px rgba(20, 17, 14, 0.20), 0 24px 48px rgba(20, 17, 14, 0.24)",
        "note-dark":
          "0 1px 2px rgba(0, 0, 0, 0.35), 0 10px 22px rgba(0, 0, 0, 0.45)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
