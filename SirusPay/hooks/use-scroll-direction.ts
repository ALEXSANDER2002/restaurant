export type ScrollDirection = "up" | "down" | null

import { useEffect, useState } from "react"

/**
 * Hook leve para detectar se o usuário está rolando para cima ou para baixo.
 * Throttle embutido para evitar múltiplas atualizações por frame.
 */
export function useScrollDirection(threshold: number = 10): ScrollDirection {
  const [scrollDir, setScrollDir] = useState<ScrollDirection>(null)

  useEffect(() => {
    let lastScrollY = window.scrollY
    let ticking = false

    const updateScrollDir = () => {
      const scrollY = window.scrollY
      if (Math.abs(scrollY - lastScrollY) < threshold) {
        ticking = false
        return
      }
      setScrollDir(scrollY > lastScrollY ? "down" : "up")
      lastScrollY = scrollY > 0 ? scrollY : 0
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDir)
        ticking = true
      }
    }

    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [threshold])

  return scrollDir
} 