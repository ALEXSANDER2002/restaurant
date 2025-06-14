"use client"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, useInView } from "framer-motion"
import { Utensils, Clock, CreditCard, Users, ChevronDown } from "lucide-react"
import Link from "next/link"
import { useRef } from "react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { DepoimentosCarrossel } from "@/components/depoimentos-carrossel"
import { HeroImage } from "@/components/hero-image"

// Create motion versions of our components
const MotionCard = motion(Card)

export default function Home() {
  const prefersReducedMotion = useReducedMotion()

  // References for scroll animations
  const heroRef = useRef(null)
  const servicesRef = useRef(null)
  const hoursRef = useRef(null)

  // Check if elements are in view
  const heroInView = useInView(heroRef, { once: true, amount: 0.3 })
  const servicesInView = useInView(servicesRef, { once: true, amount: 0.2 })
  const hoursInView = useInView(hoursRef, { once: true, amount: 0.5 })

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    hover: {
      y: -5,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      transition: {
        duration: 0.2,
      },
    },
  }

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0B2F67] to-[#001B44] text-white overflow-hidden mb-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 grid md:grid-cols-2 gap-12 items-center min-h-[70vh]">
            <div>
            <h1 className="font-extrabold mb-6 leading-tight drop-shadow-lg text-[clamp(2.5rem,5vw,3.5rem)]">
              Refeições de qualidade,
              <br className="hidden sm:block" />
              preço que cabe no bolso.
              </h1>
            <p className="text-lg mb-8 text-white/90 max-w-lg">
              Nutrição, sabor e praticidade em um só lugar. Garanta agora o seu almoço no Restaurante Universitário.
              </p>
              <div className="flex gap-4">
              <Link href="/login">
                <Button size="lg" className="bg-yellow-400 text-[#0B2F67] font-bold hover:bg-yellow-300 shadow-lg">
                    Entrar
                  </Button>
                </Link>
                <Link href="/cardapio">
                <Button size="lg" className="bg-white text-[#0B2F67] font-bold hover:bg-white/90 shadow-lg border-transparent">
                    Ver Cardápio
                  </Button>
                </Link>
              </div>
            </div>
          <HeroImage />
          <ChevronDown className="absolute left-1/2 -translate-x-1/2 bottom-8 animate-bounce text-white/70" />
          {/* Wave */}
          <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 100" xmlns="http://www.w3.org/2000/svg"><path fill="#ffffff" d="M0,0 C360,100 720,100 1080,0 L1440,0 L1440,100 L0,100 Z"/></svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-[#0B2F67] mb-4">
              Nossos Serviços
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Conheça as facilidades que oferecemos para tornar sua experiência
              mais agradável no restaurante universitário.
            </p>
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            <MotionCard 
                variants={cardVariants} 
                whileHover="hover"
                className="bg-gradient-to-br from-[#0B2F67] to-[#001B44] text-white border border-gray-200" // Adicionado fundo branco e borda sutil
              >
                <CardHeader>
                  <CreditCard className="h-10 w-10 text-[white] mb-2" /> {/* Mantido azul principal */}
                  <CardTitle>Pagamento Digital</CardTitle> {/* Texto azul */}
                  <CardDescription>
                    Compre seus tickets de forma rápida e segura através do nosso sistema.
                  </CardDescription>
                </CardHeader>
              </MotionCard>

            <MotionCard variants={cardVariants}
            className="bg-gradient-to-br from-[#0B2F67] to-[#001B44] text-white" whileHover="hover">
              <CardHeader>
                <Clock className="h-10 w-10 text-white mb-2" />
                <CardTitle>Horários Flexíveis</CardTitle>
                <CardDescription>
                  Atendimento em diversos horários para sua conveniência.
                </CardDescription>
              </CardHeader>
            </MotionCard>

            <MotionCard variants={cardVariants} 
            className="bg-gradient-to-br from-[#0B2F67] to-[#001B44] text-white" whileHover="hover">
              <CardHeader>
                <Utensils className="h-10 w-10 mb-2" />
                <CardTitle>Cardápio Variado</CardTitle>
                <CardDescription>
                  Refeições balanceadas e nutritivas com opções vegetarianas.
                </CardDescription>
              </CardHeader>
            </MotionCard>

            <MotionCard variants={cardVariants}
            className="bg-gradient-to-br from-[#0B2F67] to-[#001B44] text-white" whileHover="hover">
              <CardHeader>
                <Users className="h-10 w-10 mb-2" />
                <CardTitle>Preço Acessível</CardTitle>
                <CardDescription>
                  Valores subsidiados para estudantes e servidores.
                </CardDescription>
              </CardHeader>
            </MotionCard>
          </motion.div>
          </div>
      </section>

      {/* Depoimentos */}
      <section className="py-24 bg-[#F4F7FA]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-semibold text-[#0B2F67] mb-12">O que dizem sobre nós</h2>
          <DepoimentosCarrossel />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#FFD200] text-[#0B2F67] py-20 relative overflow-hidden">
        <svg className="absolute top-0 left-0 w-full rotate-180" viewBox="0 0 1440 100" xmlns="http://www.w3.org/2000/svg"><path fill="#ffffff" d="M0,0 C360,100 720,100 1080,0 L1440,0 L1440,100 L0,100 Z"/></svg>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl font-semibold mb-6 drop-shadow-lg">
            Pronto para começar?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Crie sua conta agora e aproveite todas as facilidades do nosso sistema!
          </p>
          <Link href="/cadastro">
            <Button size="lg" className="bg-white text-[#0B2F67] font-bold hover:bg-white/90 shadow-xl">
              Criar Conta
            </Button>
          </Link>
        </div>
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 100" xmlns="http://www.w3.org/2000/svg"><path fill="#ffffff" d="M0,0 C360,100 720,100 1080,0 L1440,0 L1440,100 L0,100 Z"/></svg>
      </section>
    </div>
  )
}

