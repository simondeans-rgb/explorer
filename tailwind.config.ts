import type { Config } from "tailwindcss";

// Tokens follow the Explorer's Passport Brand Book (First Edition).
// Palette A — Navigator (primary): deep navy + gold, passport-official.
// Palette B — Cartographer (secondary): burgundy + brass, for stamps / premium.
// Interior — Parchment: passport page bodies only.
const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        // Body & interface — DM Sans.
        sans: [
          "DM Sans",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
        // Display & headings — Cormorant Garamond.
        display: [
          "Cormorant Garamond",
          "Georgia",
          "Cambria",
          "Times New Roman",
          "serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        passport: {
          // Navigator (primary)
          navy: "#0D1B2E", // Midnight — primary surface / header band
          admiralty: "#1A2E4A", // Admiralty
          chart: "#2A4568", // Chart Blue
          gold: "#C9A84C", // Gold Seal — accent only
          goldsoft: "#E8C97A", // Pale Gold
          goldpale: "#F5E9CC",
          parchment: "#F8F4EC", // Cartridge — foreground on navy / app bg (light)
          cartridge: "#F8F4EC",
          // Interior — Parchment (passport page bodies)
          card: "#F2EDE0", // Parchment
          paged: "#E6DFC8", // Aged Parchment (MRZ)
          fieldlabel: "#8B7B4E", // Field Label
          fieldtext: "#6B5E3E", // Field Text
          // Ink
          ink: "#1C1A17",
          ink2: "#4A4540",
          ink3: "#8A8480",
          // Cartographer (secondary — stamps / special editions)
          oxblood: "#3D0E18",
          burgundy: "#5C1A28",
          expedition: "#9E3B52",
          brass: "#B87333",
          amber: "#D4955A",
          vellum: "#F0E8DC",
          // Dark-mode surfaces (navy night)
          night: "#0B1422",
          carddark: "#16263D",
          parchmentdark: "#0B1422",
        },
      },
      boxShadow: {
        page: "0 1px 2px rgba(13, 27, 46, 0.08), 0 10px 30px rgba(13, 27, 46, 0.10)",
        "page-hover":
          "0 2px 4px rgba(13, 27, 46, 0.10), 0 16px 40px rgba(13, 27, 46, 0.16)",
        "page-dark":
          "0 1px 2px rgba(0, 0, 0, 0.4), 0 12px 30px rgba(0, 0, 0, 0.55)",
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
