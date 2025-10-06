'use client'
import * as React from 'react'
import { BentoCarousel } from '../ui/BentoCarousel'
import { BentoCard } from '../ui/BentoCard'

export function BentoArrays() {
  const arcnet = [
    { title: 'The Decentralized Web of Light', desc: 'The ArcNet is a living network — powered by its users, owned by none.' },
    { title: 'Community Ownership', desc: 'Each Chain Code holder becomes a node — together, we form the constellation.' },
    { title: 'Interconnected Reality', desc: 'From thought to transmission, all data flows across the cosmic lattice.' },
    { title: 'Security and Privacy', desc: 'Your presence is encrypted, immutable, and free from centralized control.' },
    { title: 'Empowerment of the Many', desc: 'Every connection strengthens the grid — your light uplifts the whole.' },
  ]
  const mana = [
    { title: 'What Is MANA?', desc: 'MANA is the lifeblood of the ArcNet — the energy that flows through all actions.' },
    { title: 'Earn Through Alignment', desc: 'Daily rituals, cosmic events, and creative acts generate MANA rewards.' },
    { title: 'Trade and Transmute', desc: 'Use MANA to exchange artifacts, unlock modules, and empower your journey.' },
    { title: 'Staking and Growth', desc: 'Stake MANA to strengthen your node and participate in the shared treasury.' },
    { title: 'Value of Conscious Creation', desc: 'As your awareness expands, so does your MANA — wealth mirrors growth.' },
  ]
  const tempus = [
    { title: 'The Cosmic Clock', desc: 'Tempus aligns you to planetary cycles — every moment holds meaning.' },
    { title: 'Zodiacal Flow', desc: 'Track the dance of the constellations and feel their influence daily.' },
    { title: 'Planetary Hours', desc: 'Each hour bears its ruling planet — align actions with celestial timing.' },
    { title: 'Lunar Synchrony', desc: 'Live by the Moon’s rhythm — attune your rituals to its waxing and waning.' },
    { title: 'Seasonal Gates', desc: 'Walk through the 13 lunar months — each a passage in the grand design.' },
  ]

  const all = [arcnet, mana, tempus]

  return (
    <section className="py-24">
      {all.map((group, i) => (
        <div key={i} className="mb-16">
          <BentoCarousel>
            {group.map((t, j) => (
              <BentoCard key={j} title={t.title} description={t.desc} />
            ))}
          </BentoCarousel>
        </div>
      ))}
    </section>
  )
}
