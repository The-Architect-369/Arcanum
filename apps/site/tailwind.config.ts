import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0b0f1a",
        panel: "#0f1424"
      },
      ringColor: {
        pop: "rgb(167 139 250)",
        star: "rgb(147 197 253)"
      }
    }
  },
  plugins: []
} satisfies Config;
