import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: "#CF9D7B",
        ink: "#E8E0D4",
        cream: "#0C1519",
        jungle: "#162127",
        jet: "#2A3038",
        coffee: "#724B39",
        brass: "#CF9D7B",
        "vault-red": "#E8341A",
        amber: "#D97706",
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "Arial", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
