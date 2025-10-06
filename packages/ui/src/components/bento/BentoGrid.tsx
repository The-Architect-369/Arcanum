'use client'
import * as React from 'react'

export function BentoGrid({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="
        grid gap-4 md:gap-5
        grid-cols-1
        sm:grid-cols-2
        xl:grid-cols-4
        auto-rows-[1fr]
      "
    >
      {children}
    </div>
  )
}

// Helpers for spanning cards different sizes
export const span = {
  wide: 'sm:col-span-2',
  tall: 'xl:row-span-2',
  full: 'sm:col-span-2 xl:col-span-4',
}
