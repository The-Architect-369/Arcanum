'use client'
import * as React from 'react'
import { motion } from 'framer-motion'

type Badge = { icon?: React.ReactNode; label: string }
export type BentoCardProps = {
  title: string
  subtitle?: string
  description?: string
  badges?: Badge[]
  footer?: React.ReactNode
  onClick?: () => void
  as?: keyof JSX.IntrinsicElements
  className?: string
  children?: React.ReactNode
}

export function BentoCard({
  title,
  subtitle,
  description,
  badges,
  footer,
  onClick,
  as = 'div',
  className,
  children,
}: BentoCardProps) {
  const Tag = motion[as as 'div'] as any
  return (
    <Tag
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.995 }}
      className={`bento-card group relative overflow-hidden p-5 md:p-6 ${className ?? ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={0}
    >
      <div className="bento-ring" />
      <div className="flex items-start justify-between gap-3">
        <div>
          {subtitle && <p className="text-starlight/80 text-xs tracking-wide">{subtitle}</p>}
          <h3 className="text-xl md:text-2xl font-semibold text-white">{title}</h3>
        </div>
        {badges && badges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {badges.map((b, i) => (
              <span className="bento-badge text-white/90" key={i}>
                {b.icon}{b.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {description && (
        <p className="mt-3 text-white/70 text-sm md:text-base">{description}</p>
      )}

      {children && <div className="mt-4">{children}</div>}

      {footer && <div className="mt-5 pt-4 border-t border-white/10">{footer}</div>}
    </Tag>
  )
}
