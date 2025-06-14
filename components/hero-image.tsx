"use client"

import Image from "next/image"
import { motion } from "framer-motion"

interface HeroImageProps {
  src?: string
  alt?: string
}

export function HeroImage({ src = "https://images.unsplash.com/photo-1555905743-043c8d761ac7?auto=format&fit=crop&w=800&q=80", alt = "Refeitório universitário" }: HeroImageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative h-[380px] md:h-[440px] w-full rounded-xl overflow-hidden shadow-xl"
    >
      <Image src={src} alt={alt} fill className="object-cover" priority sizes="(max-width:768px) 100vw, 50vw" />
      {/* Overlay gradiente para manter contraste */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B2F67]/70 to-[#001B44]/70" />
    </motion.div>
  )
} 