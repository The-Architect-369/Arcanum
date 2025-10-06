'use client'
import * as React from 'react'
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'

export type BentoCarouselProps = {
  children: React.ReactNode[]
  initial?: number
  className?: string
}

export function BentoCarousel({ children, initial = 0, className }: BentoCarouselProps) {
  const [index, setIndex] = React.useState(initial)
  const x = useMotionValue(0)
  const width = 320 // logical width for swipe threshold

  function paginate(direction: number) {
    setIndex((i) => (i + direction + children.length) % children.length)
  }

  return (
    <div className={`relative w-full overflow-hidden ${className ?? ''}`}>
      <AnimatePresence initial={false} custom={index}>
        <motion.div
          key={index}
          className="bento-card p-4 md:p-6"
          drag="x"
          style={{ x }}
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(_, info) => {
            if (info.offset.x < -width / 3) paginate(1)
            else if (info.offset.x > width / 3) paginate(-1)
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {children[index]}
        </motion.div>
      </AnimatePresence>

      <div className="mt-3 flex items-center justify-center gap-2">
        {children.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${i === index ? 'w-8 bg-white/80' : 'w-3 bg-white/30'}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
