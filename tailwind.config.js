/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0d1117',
        surface: '#161b22',
        surface2: '#1c2330',
        border: '#21262d',
        accent: '#2ea043',
        accent2: '#388bfd',
        accent3: '#f0883e',
        accent4: '#da3633',
        text: '#e6edf3',
        text2: '#8b949e',
        text3: '#6e7681',
      },
      fontFamily: {
        'serif': ['DM Serif Display', 'serif'],
        'sans': ['DM Sans', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}