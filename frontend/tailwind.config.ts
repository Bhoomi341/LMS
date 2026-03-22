import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      colors: {
        surface: {
          DEFAULT: "#0f1419",
          card: "#1a2332",
          muted: "#243044",
        },
        accent: {
          DEFAULT: "#38bdf8",
          dim: "#0ea5e9",
        },
      },
    },
  },
  plugins: [],
};

export default config;
