/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          bg: "#060913",
          card: "#0b1224",
          panel: "#101a33",
          border: "#1d2c4e",
          hover: "#172445"
        },
        cyber: {
          cyan: "#00f0ff",
          blue: "#38bdf8",
          emerald: "#00ff88",
          amber: "#f59e0b",
          crimson: "#ff0055",
          purple: "#a855f7"
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 240, 255, 0.25)',
        'glow-crimson': '0 0 20px rgba(255, 0, 85, 0.35)',
        'glow-emerald': '0 0 20px rgba(0, 255, 136, 0.25)',
        'glow-amber': '0 0 20px rgba(245, 158, 11, 0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      }
    },
  },
  plugins: [],
}
