import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#090b10",
        panel: "#111621",
        line: "#273043",
      },
      boxShadow: {
        glow: "0 0 34px rgba(56, 189, 248, 0.16)",
      },
    },
  },
  plugins: [],
};

export default config;
