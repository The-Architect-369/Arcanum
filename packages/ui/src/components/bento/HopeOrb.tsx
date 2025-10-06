'use client'
import * as React from 'react'

export function HopeOrb({ size = 180, label = 'Summon Hope' }: { size?: number; label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className="relative rounded-full animate-pulse-glow"
        style={{ width: size, height: size, background:
          'radial-gradient(60% 60% at 50% 50%, rgba(147,197,253,.3), rgba(167,139,250,.15) 60%, rgba(15,20,36,.9) 62%)' }}
      >
        <div className="absolute inset-0 rounded-full border border-white/15" />
        <div className="absolute inset-0 rounded-full"
             style={{ background:
               'conic-gradient(from 0deg, rgba(147,197,253,.35), rgba(167,139,250,.25), rgba(245,214,110,.2), rgba(147,197,253,.35))',
             }}
        />
        <div className="absolute inset-0 rounded-full mix-blend-plus-lighter animate-orbit-slow"
             style={{ background:
               'radial-gradient(30% 30% at 70% 30%, rgba(245,214,110,.18), transparent 60%)' }}
        />
      </div>
      <span className="mt-3 text-white/90">{label}</span>
    </div>
  )
}
