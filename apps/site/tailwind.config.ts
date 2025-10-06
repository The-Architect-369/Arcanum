import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        arc: {
          bg: "#0a0e17",
          light: "#a5b4fc",  // purple glow
          gold: "#f3c969",
          blue: "#60a5fa",
          silver: "#cbd5e1"
        }
      },
      boxShadow: {
        pane: "0 8px 30px rgba(80,110,255,0.15)"
      },
      borderRadius: { "2xl": "1.25rem" }
    }
  },
  plugins: []
} satisfies Config;
