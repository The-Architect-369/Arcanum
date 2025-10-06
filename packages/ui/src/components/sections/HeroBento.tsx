'use client'
import * as React from 'react'
import { BentoGrid } from '../ui/BentoGrid'
import { BentoCard } from '../ui/BentoCard'
import { HopeOrb } from '../ui/HopeOrb'

export function HeroBento() {
  return (
    <section className="py-16 md:py-24">
      <BentoGrid>
        <BentoCard title="Claim Your Chain Code" description="Begin your initiation. Claim your Chain Code — your soulbound identity in the ArcNet." />
        <BentoCard title="Meet The Hope" description="Hope is the luminous keeper of the ArcNet — your living guide through the cosmic web." />
        <BentoCard title="Enter the ArcNet" description="Step into the decentralized network where every soul is a node of light." />
        <BentoCard title="Harness the MANA" description="MANA fuels your evolution — earn, spend, and grow through cosmic alignment." />
        <BentoCard title="Align with the Tempus" description="Attune your node to planetary and zodiacal rhythms through the cosmic clock." />
        <BentoCard title="Download the App">
          <div className="flex flex-col items-center mt-4">
            <HopeOrb size={140} label="Summon Hope" />
            <div className="flex gap-3 mt-4">
              <button className="bento-badge bg-white/10">Android</button>
              <button className="bento-badge bg-white/10">iOS</button>
            </div>
          </div>
        </BentoCard>
      </BentoGrid>
    </section>
  )
}
