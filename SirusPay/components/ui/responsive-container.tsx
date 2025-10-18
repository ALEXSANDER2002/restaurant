"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  mobileClassName?: string
  tabletClassName?: string
  desktopClassName?: string
  breakpoints?: {
    mobile?: number
    tablet?: number
  }
}

export function ResponsiveContainer({
  children,
  className,
  mobileClassName,
  tabletClassName,
  desktopClassName,
  breakpoints = {
    mobile: 640,
    tablet: 1024,
  },
}: ResponsiveContainerProps) {
  const [windowWidth, setWindowWidth] = useState<number | null>(null)

  useEffect(() => {
    // Set initial width
    setWindowWidth(window.innerWidth)

    // Update width on resize
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Determine device type based on window width
  const isMobile = windowWidth !== null && windowWidth < breakpoints.mobile!
  const isTablet = windowWidth !== null && windowWidth >= breakpoints.mobile! && windowWidth < breakpoints.tablet!
  const isDesktop = windowWidth !== null && windowWidth >= breakpoints.tablet!

  // Apply appropriate classes based on device type
  const responsiveClassName = cn(
    className,
    isMobile && mobileClassName,
    isTablet && tabletClassName,
    isDesktop && desktopClassName,
  )

  return <div className={responsiveClassName}>{children}</div>
}

