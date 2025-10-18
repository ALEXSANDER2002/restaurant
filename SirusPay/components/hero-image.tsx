"use client"

import Image from "next/image"
import { motion } from "framer-motion"

interface HeroImageProps {
  src?: string
  alt?: string
}

export function HeroImage({ src = "/Siruschicken.png", alt = "Refeitório universitário" }: HeroImageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative h-[380px] md:h-[440px] w-full rounded-xl overflow-hidden -xl"
    >
      <Image src={src} alt={alt} fill className="object-contain" priority sizes="(max-width:768px) 100vw, 50vw" />
      {/* Overlay gradiente para manter contraste */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-[#0B2F67]/30 to-[#001B44]/30" /> */}
    </motion.div>
  )
} 