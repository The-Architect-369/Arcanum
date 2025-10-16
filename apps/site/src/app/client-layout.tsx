'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import ConstellationCanvas from '@/components/ConstellationCanvas'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return (
    <>
      <div className="constellation-bg">
        <ConstellationCanvas />
      </div>
      <Header brand="Arcanum" />
      <div className="layer-content">{children}</div>
    </>
  )
}
