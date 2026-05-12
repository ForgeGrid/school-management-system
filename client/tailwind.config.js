/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx,html}',
    './public/index.html',
  ],
  darkMode: 'class', // or 'media' if you prefer system preference
  theme: {
    extend: {
      width: {
        '22': '5.5rem', // 22 * 0.25rem = 5.5rem
        '23': '5.75rem', // 23 * 0.25rem = 5.75rem
      },
      height: {
        '22': '5.5rem',
        '23': '5.75rem',
      },
      animation: {
        "border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
      },
      keyframes: {
        "border-beam": {
          "100%": {
            "offset-distance": "100%",
          },
        },
      },
    },
    // extend already defined above
  },
  plugins: [],
};
