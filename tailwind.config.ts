import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#050606",
          900: "#0a0c0a",
          800: "#13161a",
          700: "#1c2026",
          600: "#2a2f37",
        },
        neon: {
          green: "#76B900",
          cyan: "#22d3ee",
          magenta: "#ff2bd6",
          amber: "#ffb020",
          rose: "#ff5577",
          lime: "#a3e635",
          violet: "#a78bfa",
          orange: "#fb923c",
        },
      },
      fontFamily: {
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        "glow-green": "0 0 18px -2px rgba(118,185,0,0.55)",
        "glow-cyan": "0 0 18px -2px rgba(34,211,238,0.5)",
        "glow-magenta": "0 0 18px -2px rgba(255,43,214,0.5)",
        "glow-amber": "0 0 18px -2px rgba(255,176,32,0.5)",
        "glow-rose": "0 0 18px -2px rgba(255,85,119,0.5)",
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        "pulse-soft": "pulse-soft 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
