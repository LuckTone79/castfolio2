import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        "noto-kr": ["'Noto Sans KR'", "sans-serif"],
        "noto-en": ["'Noto Serif'", "serif"],
        "playfair": ["'Playfair Display'", "serif"],
        "inter": ["'Inter'", "sans-serif"],
      },
      keyframes: {
        "fade-in": { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "slide-in": { from: { opacity: "0", transform: "translateX(-20px)" }, to: { opacity: "1", transform: "translateX(0)" } },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in": "slide-in 0.4s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
