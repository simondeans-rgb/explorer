/** Worldly design tokens, ported to NativeWind. Mirrors the web tailwind config
 *  so the same palette and type system carry across web + mobile. */
module.exports = {
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
          ink3: '#8A90A6',
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
