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
      },
      colors: {
        passport: {
          // Primary ink / surfaces (deep premium indigo)
          navy: "#181B2E", // primary buttons, headings, dark surfaces
          admiralty: "#262A45",
          chart: "#5B6CFF", // secondary accent — electric indigo
          // Brand accent — sunset coral
          gold: "#FF6A55", // accent: eyebrows, rules, icon tints, primary CTA
          goldsoft: "#FF8B79", // lighter coral (dark-mode accents / headings)
          goldpale: "#FFE9E4",
          // Light foreground / text-on-navy
          parchment: "#FFFFFF",
          cartridge: "#F6F7FB",
          // Card / page surfaces
          card: "#FFFFFF", // clean white cards
          paged: "#EEF0F7",
          fieldlabel: "#9AA0B4", // cool muted label
          fieldtext: "#5C6276",
          // Ink scale
          ink: "#181B2E",
          ink2: "#4B5167",
          ink3: "#9298AD",
          // Secondary palette (verdicts / stamps) — ocean + sunset
          oxblood: "#7A1F2B",
          burgundy: "#C24A55", // "avoid" red
          expedition: "#E86F86",
          brass: "#11A6C4", // teal — "worth visiting"
          amber: "#F2A65A",
          vellum: "#EAF6F9",
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
