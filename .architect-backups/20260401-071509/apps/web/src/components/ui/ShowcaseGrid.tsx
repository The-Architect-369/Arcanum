"use client"

import { motion } from "framer-motion"
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid"
import { useNarrative } from "@/hooks/useNarrative"
import { Network, Sparkles, Timer } from "lucide-react"

// Shared motion variants bridging your .popcard logic
const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.18, 0.86, 0.26, 0.99] },
  },
}

export default function ShowcaseGrid() {
  const { content } = useNarrative()
  const copy = content?.copy ?? {}
  const showcases = [
    {
      key: "arcnet",
      Icon: Network,
      title: copy.showcase.arcnet.heading,
      description: copy.showcase.arcnet.sub,
      href: "#activate",
      cta: "Explore",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-indigo-500/10" />
      ),
    },
    {
      key: "mana",
      Icon: Sparkles,
      title: copy.showcase.mana.heading,
      description: copy.showcase.mana.sub,
      href: "#activate",
      cta: "Learn More",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-400/10 to-cyan-500/10" />
      ),
    },
    {
      key: "tempus",
      Icon: Timer,
      title: copy.showcase.tempus.heading,
      description: copy.showcase.tempus.sub,
      href: "#activate",
      cta: "See More",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-violet-500/10" />
      ),
    },
  ]

  return (
    <motion.section
      id="showcase"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      className="relative snap-section py-16 sm:py-24 lg:py-32"
    >
      <motion.div
        variants={fadeInUp}
        className="text-center mb-10 sm:mb-16 space-y-2"
      >
        <h2 className="text-3xl md:text-5xl font-bold gradient-text">
          {copy.showcase.arcnet.heading.split(" ")[0]} • MANA • TEMPUS
        </h2>
        <p className="lead opacity-80 max-w-2xl mx-auto">
          Discover the pillars of the Arcanum Network.
        </p>
      </motion.div>

      <BentoGrid className="bento-width auto-rows-[22rem] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {showcases.map(({ key, Icon, title, description, href, cta, background }) => (
          <motion.div
            key={key}
            variants={fadeInUp}
            transition={{ delay: 0.15 }}
            className="popcard"
          >
            <BentoCard
              name={title}
              Icon={Icon}
              description={description}
              href={href}
              cta={cta}
              background={background}
              className="overflow-hidden relative"
            />
          </motion.div>
        ))}
      </BentoGrid>
    </motion.section>
  )
}
