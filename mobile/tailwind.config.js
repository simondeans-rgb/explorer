/** Worldly design tokens, ported to NativeWind. Mirrors the web tailwind config
 *  so the same palette and type system carry across web + mobile. */
module.exports = {
  darkMode: 'media',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        sans: ['PlusJakarta'],
        display: ['Fraunces'],
        script: ['Caveat'],
      },
      colors: {
        card: '#1A2138',
        navy: '#14213D',
        aqua: '#24D1C3',
        coral: '#FF6B9A',
        sunburst: '#FFB84D',
        lavender: '#9B7CFF',
        warmwhite: '#FAFAFC',
        passport: {
          navy: '#14213D',
          chart: '#9B7CFF',
          gold: '#FF6B9A',
          goldsoft: '#FF92B5',
          goldpale: '#FFE4EE',
          card: '#FFFFFF',
          cartridge: '#FAFAFC',
          ink: '#14213D',
          ink2: '#48506B',
          // Matches theme.ts: #8A90A6 was only ~3.16:1 on white (failed WCAG AA);
          // darkened to #6B7185 (4.5:1) so this token can never reintroduce the gap.
          ink3: '#6B7185',
          brass: '#24D1C3',
          amber: '#FFB84D',
          night: '#0E1018',
          carddark: '#1B1E2E',
        },
      },
    },
  },
  plugins: [],
};
