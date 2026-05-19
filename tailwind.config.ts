import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
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
      boxShadow: {
        note: "0 2px 4px rgba(20, 17, 14, 0.08), 0 6px 16px rgba(20, 17, 14, 0.10)",
        "note-lift":
          "0 6px 10px rgba(20, 17, 14, 0.14), 0 16px 32px rgba(20, 17, 14, 0.16)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "pop-in": {
          from: { opacity: "0", transform: "scale(0.92) rotate(-2deg)" },
          to: { opacity: "1", transform: "scale(1) rotate(var(--tilt, 0deg))" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out",
        "pop-in": "pop-in 220ms cubic-bezier(0.16,1,0.3,1)",
      },
    },
  },
  plugins: [],
};

export default config;
