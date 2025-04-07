"use client"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, useInView } from "framer-motion"
import { Utensils, Clock, CreditCard, Users } from "lucide-react"
import Link from "next/link"
import { useRef } from "react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

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
      {/* Barra de Acessibilidade GOV.BR */}
      <div className="bg-[#071D41] text-white text-[13.33px] leading-[19.2px]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-[36px]">
            <div className="flex items-center gap-[24px]">
              <button className="flex items-center gap-[4px] hover:text-yellow-400 transition-colors">
                <span className="font-bold">Acessibilidade</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[12px] h-[12px] mt-[2px]">
                  <path d="m4 6 4 4 4-4"/>
                </svg>
              </button>
              <button className="flex items-center gap-[4px] hover:text-yellow-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[12px] h-[12px]">
                  <path d="m12 12-4-4-4 4"/>
                </svg>
                <span>Ir para conteúdo</span>
              </button>
              <button className="flex items-center gap-[4px] hover:text-yellow-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[12px] h-[12px]">
                  <circle cx="7" cy="7" r="5"/>
                  <path d="m11 11 3 3"/>
                </svg>
                <span>Ir para busca</span>
              </button>
            </div>
            <div className="flex items-center gap-[24px]">
              <button className="hover:text-yellow-400 transition-colors flex items-center gap-[4px]">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[12px] h-[12px]">
                  <circle cx="8" cy="8" r="6"/>
                  <path d="M8 12v.01M8 4v5"/>
                </svg>
                <span>Ajuda</span>
              </button>
              <button className="hover:text-yellow-400 transition-colors flex items-center gap-[4px]">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[12px] h-[12px]">
                  <circle cx="8" cy="8" r="6"/>
                  <path d="M8 12v.01M8 4v5"/>
                </svg>
                <span>Suporte</span>
              </button>
              <div className="text-[11.67px] leading-[16.8px] text-[#FFFFFF] opacity-70">
                Teclas de atalho: Alt + 1 (conteúdo), Alt + 2 (menu), Alt + 3 (busca), Alt + 4 (contraste)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-[#1351B4] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl font-bold mb-6">
                Bem-vindo ao Restaurante Universitário
              </h1>
              <p className="text-lg mb-8 text-gray-100">
                Oferecemos refeições nutritivas e acessíveis para toda a comunidade
                acadêmica. Compre seu ticket de almoço de forma rápida e prática.
              </p>
              <div className="flex gap-4">
                <Link href="/entrar">
                  <Button size="lg" className="bg-white text-[#1351B4] hover:bg-white/50 ">
                    Entrar
                  </Button>
                </Link>
                <Link href="/cardapio">
                  <Button size="lg" variant="outline" className="border-white text-[#1351B4] bg-white hover:bg-white/50">
                    Ver Cardápio
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative h-[400px] rounded-lg overflow-hidden bg-[#0D47A1] flex items-center justify-center">
              <Utensils className="h-32 w-32 text-white/20" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4 dark:text-white">
              Nossos Serviços
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-white/50">
              Conheça as facilidades que oferecemos para tornar sua experiência
              mais agradável no restaurante universitário.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardHeader>
                <CreditCard className="h-10 w-10 text-[#1351B4] mb-2" />
                <CardTitle>Pagamento Digital</CardTitle>
                <CardDescription>
                  Compre seus tickets de forma rápida e segura através do nosso sistema.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="h-10 w-10 text-[#1351B4] mb-2" />
                <CardTitle>Horários Flexíveis</CardTitle>
                <CardDescription>
                  Atendimento em diversos horários para sua conveniência.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Utensils className="h-10 w-10 text-[#1351B4] mb-2" />
                <CardTitle>Cardápio Variado</CardTitle>
                <CardDescription>
                  Refeições balanceadas e nutritivas com opções vegetarianas.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-[#1351B4] mb-2" />
                <CardTitle>Preço Acessível</CardTitle>
                <CardDescription>
                  Valores subsidiados para estudantes e servidores.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className=" text-black dark:text-white py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-semibold mb-6">
            Pronto para começar?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Faça seu cadastro agora e aproveite todas as facilidades do nosso sistema
            de compra de tickets para o restaurante universitário.
          </p>
          <Link href="/cadastro">
            <Button size="lg" className="border-white text-white bg-[#1351B4] dark:bg-white dark:text-[#1351B4] hover:bg-[#1351B4]/70 dark:hover:bg-gray-400">
              Criar Conta
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Horários</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Segunda a Sexta: 11h às 14h</li>
                <li>Sábado: 11h às 13h</li>
                <li>Domingo: Fechado</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Contato</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Telefone: (XX) XXXX-XXXX</li>
                <li>Email: ru@universidade.edu.br</li>
                <li>Localização: Bloco X - Campus</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Links Úteis</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/sobre">Sobre Nós</Link></li>
                <li><Link href="/cardapio">Cardápio</Link></li>
                <li><Link href="/faq">Perguntas Frequentes</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Redes Sociais</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#">Instagram</Link></li>
                <li><Link href="#">Facebook</Link></li>
                <li><Link href="#">Twitter</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
            <p>&copy; {new Date().getFullYear()} Restaurante Universitário. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

