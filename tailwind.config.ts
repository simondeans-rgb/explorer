import type { Config } from "tailwindcss";

// Worldly design system.
// A premium personal travel archive. Clean white surfaces, a confident
// sunset-coral accent, deep indigo ink, soft gradients and airy spacing.
// Tokens keep the legacy `passport-*` names so the whole app re-skins at once;
// semantics: navy = primary ink/surface, gold = brand accent (coral).
const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        // Body & interface — Plus Jakarta Sans (modern, premium, friendly).
        sans: [
          "Plus Jakarta Sans",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
        // Display & headings — Fraunces (editorial, travel-magazine character).
        display: [
          "Fraunces",
          "Georgia",
          "Cambria",
          "Times New Roman",
          "serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        // Handwritten accent — for warm, personal script flourishes.
        script: ["Caveat", "Brush Script MT", "cursive"],
      },
      colors: {
        // Named accent palette (the Worldly brand spectrum).
        navy: "#14213D",
        aqua: "#24D1C3",
        coral: "#FF6B9A",
        sunburst: "#FFB84D",
        lavender: "#9B7CFF",
        warmwhite: "#FAFAFC",
        passport: {
          // Primary ink / surfaces
          navy: "#14213D", // deep navy text & dark surfaces
          admiralty: "#243456",
          chart: "#9B7CFF", // lavender secondary
          // Brand accent — coral
          gold: "#FF6B9A", // coral accent: eyebrows, rules, primary highlights
          goldsoft: "#FF92B5",
          goldpale: "#FFE4EE",
          // Light foreground / text-on-navy
          parchment: "#FFFFFF",
          cartridge: "#FAFAFC", // warm white app background
          // Card / page surfaces
          card: "#FFFFFF",
          paged: "#F1F2F7",
          fieldlabel: "#8A90A6",
          fieldtext: "#5A607A",
          // Ink scale
          ink: "#14213D",
          ink2: "#48506B",
          ink3: "#8A90A6",
          // Secondary palette (verdicts / accents)
          oxblood: "#7A1F2B",
          burgundy: "#E0457B", // coral-red for "avoid"/errors
          expedition: "#FF6B9A",
          brass: "#24D1C3", // aqua — "worth visiting"
          amber: "#FFB84D", // sunburst
          vellum: "#E6FBF8",
          // Dark-mode surfaces
          night: "#0E1018",
          carddark: "#1B1E2E",
          parchmentdark: "#0E1018",
        },
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
      boxShadow: {
        // Soft, premium, low-tint elevation.
        card: "0 1px 2px rgba(16,18,42,0.04), 0 10px 30px rgba(16,18,42,0.07)",
        "card-hover":
          "0 2px 6px rgba(16,18,42,0.06), 0 18px 50px rgba(16,18,42,0.12)",
        float:
          "0 8px 24px rgba(16,18,42,0.10), 0 24px 60px rgba(16,18,42,0.14)",
        // Legacy aliases (kept so existing classes still resolve).
        page: "0 1px 2px rgba(16,18,42,0.04), 0 10px 30px rgba(16,18,42,0.07)",
        "page-hover":
          "0 2px 6px rgba(16,18,42,0.06), 0 18px 50px rgba(16,18,42,0.12)",
        "page-dark": "0 1px 2px rgba(0,0,0,0.4), 0 16px 40px rgba(0,0,0,0.5)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "rise-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 240ms ease-out",
        "rise-in": "rise-in 320ms cubic-bezier(0.22,1,0.36,1) both",
        "scale-in": "scale-in 260ms cubic-bezier(0.22,1,0.36,1) both",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
