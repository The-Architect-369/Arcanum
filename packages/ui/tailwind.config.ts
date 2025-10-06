import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './apps/**/*.{ts,tsx}',
    './packages/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ATAU palette
        ink: '#0b0f1a',
        panel: '#0f1424',
        pop: '#a78bfa',     // purple accent
        aurum: '#f5d66e',   // gold accent
        starlight: '#93c5fd',
      },
      boxShadow: {
        bento: '0 8px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.03)',
        glow: '0 0 0 0 rgba(167,139,250,0), 0 0 0 0 rgba(147,197,253,0)',
      },
      borderRadius: {
        '2.5xl': '1.25rem',
      },
      keyframes: {
        'pop-in': { '0%': { transform: 'scale(.98)' }, '100%': { transform: 'scale(1)' } },
        'pulse-glow': {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(167,139,250,0.0)' },
          '50%': { boxShadow: '0 0 32px 4px rgba(167,139,250,0.25)' },
        },
        'orbit-spin': { to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        'pop-in': 'pop-in .2s ease-out both',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'orbit-slow': 'orbit-spin 20s linear infinite',
      },
    },
  },
  plugins: [],
}
export default config
