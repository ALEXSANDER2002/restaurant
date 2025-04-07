"use client"

import { useRef, type ReactNode } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

interface ParallaxSectionProps {
  children: ReactNode
  className?: string
  offset?: number
}

export function ParallaxSection({ children, className = "", offset = 50 }: ParallaxSectionProps) {
  const ref = useRef(null)
  const prefersReducedMotion = useReducedMotion()

  // Disable parallax effect if user prefers reduced motion
  const effectiveOffset = prefersReducedMotion ? 0 : offset

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [effectiveOffset, -effectiveOffset])

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  )
}

