"use client"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion, useInView } from "framer-motion"
import { Utensils, Clock, CreditCard, Users, ChevronDown, CheckCircle, X, Mail, Phone } from "lucide-react"
import Link from "next/link"
import { useRef, useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { DepoimentosCarrossel } from "@/components/depoimentos-carrossel"
import { HeroImage } from "@/components/hero-image"
import { CardapioSemana } from "@/components/cardapio-semana"
import { useTema } from "@/components/provedor-tema"
import { cn } from "@/lib/utils"

// Create motion versions of our components
const MotionCard = motion(Card)

function HomePage() {
  const searchParams = useSearchParams()
  const qrLogin = searchParams.get('qr-login')
  const [mostrarNotificacao, setMostrarNotificacao] = useState(false)

  useEffect(() => {
    if (qrLogin === 'success') {
      setMostrarNotificacao(true)
      // Esconder notificação após 10 segundos
      const timer = setTimeout(() => {
        setMostrarNotificacao(false)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [qrLogin])
  const prefersReducedMotion = useReducedMotion()
  const { contraste } = useTema()

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
    <div className="min-h-screen flex flex-col bg-white">
      {/* Notificação de Login QR Code */}
      {mostrarNotificacao && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <Alert className="border-green-200 bg-green-50 shadow-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700 pr-8">
              <strong>Login QR Code realizado com sucesso!</strong> Bem-vindo de volta ao SIRUS.
            </AlertDescription>
            <button
              onClick={() => setMostrarNotificacao(false)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-green-100 transition-colors"
            >
              <X className="h-4 w-4 text-green-600" />
            </button>
          </Alert>
        </div>
      )}
      {/* Hero Section - Mantém gradiente fixo */}
      <section
        className={cn(
          "relative text-white overflow-hidden mb-0",
          contraste === "alto" ? "bg-black" : "bg-gradient-to-br from-[#0B2F67] to-[#001B44]"
        )}
        ref={heroRef}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 grid md:grid-cols-2 gap-12 items-center min-h-[70vh]">
          <div>
            <h1 className="font-extrabold mb-6 leading-tight drop-shadow-lg text-[clamp(2.5rem,5vw,3.5rem)]">
              Refeições de qualidade,
              <br className="hidden sm:block" />
              preço que cabe no bolso.
            </h1>
            <p className={cn(
              "text-lg mb-8 max-w-lg",
              contraste === "alto" ? "text-white" : "text-white/90"
            )}>
              Nutrição, sabor e praticidade em um só lugar. Garanta agora o seu almoço no Restaurante Universitário.
            </p>
            <div className="flex gap-4">
              <Link href="/login">
                <Button size="lg" className={cn(
                  "font-bold shadow-lg",
                  contraste === "alto" ? "bg-white text-black border-2 border-white hover:bg-white/90" : "bg-yellow-400 text-[#0B2F67] hover:bg-yellow-300"
                )}>
                  Entrar
                </Button>
              </Link>
              <Link href="/cardapio">
                <Button size="lg" className={cn(
                  "font-bold shadow-lg border-transparent",
                  contraste === "alto" ? "bg-white text-black border-2 border-white hover:bg-white/90" : "bg-white text-[#0B2F67] hover:bg-white/90"
                )}>
                  Ver Cardápio
                </Button>
              </Link>
            </div>
          </div>
          <motion.div variants={imageVariants} initial="hidden" animate={heroInView ? "visible" : "hidden"}>
            <HeroImage />
          </motion.div>
          <ChevronDown className={cn(
            "absolute left-1/2 -translate-x-1/2 bottom-8 animate-bounce",
            contraste === "alto" ? "text-white" : "text-white/70"
          )} />
          {/* Wave */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
            <svg
              className="relative block w-full h-[120px]"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1440 320"
              preserveAspectRatio="none"
            >
              <path
                fill={contraste === "alto" ? "#000000" : "#ffffff"}
                d="M0,192L48,170.7C96,149,192,107,288,117.3C384,128,480,192,576,229.3C672,267,768,277,864,240C960,203,1056,117,1152,85.3C1248,53,1344,75,1392,85.3L1440,96V320H0Z"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* Main Content - Envolve as seções principais */}
      <main id="main-content">
        {/* Cardápio da Semana */}
        <CardapioSemana />

        {/* Features Section - Fundo escuro e cards com fundo dinâmico */}
        <section className="py-24 bg-white dark:bg-gradient-to-br dark:from-[#0a1a33] dark:to-[#051224] relative" ref={servicesRef}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-semibold text-[#0B2F67] dark:text-white mb-4">
                Nossos Serviços
              </h2>
              <p className="text-lg text-gray-600 dark:text-white/70 max-w-2xl mx-auto">
                Conheça as facilidades que oferecemos para tornar sua experiência
                mais agradável no restaurante universitário.
              </p>
            </div>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={servicesInView ? "visible" : "hidden"}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              <MotionCard 
                variants={cardVariants} 
                whileHover={contraste === "alto" ? undefined : "hover"}
                className={cn(
                  contraste === "alto" ? "bg-black text-white border-2 border-white" : "bg-gradient-to-br from-[#0B2F67] to-[#001B44] text-white",
                  "rounded-xl overflow-hidden shadow-lg"
                )}
              >
                <CardHeader>
                  <CreditCard className="h-10 w-10 text-white mb-2" />
                  <CardTitle>Pagamento Digital</CardTitle>
                  <CardDescription className={cn(
                    "text-white/80",
                    contraste === "alto" && "text-white/90"
                  )}>
                    Compre seus tickets de forma rápida e segura através do nosso sistema.
                  </CardDescription>
                </CardHeader>
              </MotionCard>

              <MotionCard 
                variants={cardVariants}
                whileHover={contraste === "alto" ? undefined : "hover"}
                className={cn(
                  contraste === "alto" ? "bg-black text-white border-2 border-white" : "bg-gradient-to-br from-[#0B2F67] to-[#001B44] text-white",
                  "rounded-xl overflow-hidden shadow-lg"
                )}
              >
                <CardHeader>
                  <Clock className="h-10 w-10 text-white mb-2" />
                  <CardTitle>Horários Flexíveis</CardTitle>
                  <CardDescription className={cn(
                    "text-white/80",
                    contraste === "alto" && "text-white/90"
                  )}>
                    Atendimento em diversos horários para sua conveniência.
                  </CardDescription>
                </CardHeader>
              </MotionCard>

              <MotionCard 
                variants={cardVariants} 
                whileHover={contraste === "alto" ? undefined : "hover"}
                className={cn(
                  contraste === "alto" ? "bg-black text-white border-2 border-white" : "bg-gradient-to-br from-[#0B2F67] to-[#001B44] text-white",
                  "rounded-xl overflow-hidden shadow-lg"
                )}
              >
                <CardHeader>
                  <Utensils className="h-10 w-10 text-white mb-2" />
                  <CardTitle>Cardápio Variado</CardTitle>
                  <CardDescription className={cn(
                    "text-white/80",
                    contraste === "alto" && "text-white/90"
                  )}>
                    Refeições balanceadas e nutritivas com opções vegetarianas.
                  </CardDescription>
                </CardHeader>
              </MotionCard>

              <MotionCard 
                variants={cardVariants}
                whileHover={contraste === "alto" ? undefined : "hover"}
                className={cn(
                  contraste === "alto" ? "bg-black text-white border-2 border-white" : "bg-gradient-to-br from-[#0B2F67] to-[#001B44] text-white",
                  "rounded-xl overflow-hidden shadow-lg"
                )}
              >
                <CardHeader>
                  <Users className="h-10 w-10 text-white mb-2" />
                  <CardTitle>Preço Acessível</CardTitle>
                  <CardDescription className={cn(
                    "text-white/80",
                    contraste === "alto" && "text-white/90"
                  )}>
                    Valores subsidiados para estudantes e servidores.
                  </CardDescription>
                </CardHeader>
              </MotionCard>
            </motion.div>
          </div>
        </section>

        {/* Depoimentos */}
        <section className={cn(
          "py-24 bg-[#F4F7FA] dark:bg-gradient-to-br dark:from-[#0a1a33] dark:to-[#051224]",
          contraste === "alto" && "bg-black"
        )}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className={cn(
              "text-3xl font-semibold text-[#0B2F67] dark:text-white mb-12",
              contraste === "alto" && "text-white"
            )}>
              O que dizem sobre nós
            </h2>
            <DepoimentosCarrossel />
          </div>
        </section>

        {/* FAQ Section */}
        <section className={cn(
          "py-24 bg-white dark:bg-gradient-to-br dark:from-[#0a1a33] dark:to-[#051224]",
          contraste === "alto" && "bg-black"
        )}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className={cn(
                "text-3xl font-semibold text-[#0B2F67] dark:text-white mb-4",
                contraste === "alto" && "text-white"
              )}>
                Perguntas Frequentes
              </h2>
              <p className={cn(
                "text-lg text-gray-600 dark:text-white/70 max-w-2xl mx-auto",
                contraste === "alto" && "text-white/80"
              )}>
                Tire suas principais dúvidas sobre o sistema SIRUS e o Restaurante Universitário
              </p>
            </div>

            <div className="space-y-4">
              {/* Pergunta 1 */}
              <div className={cn(
                "border rounded-lg overflow-hidden",
                contraste === "alto" ? "border-white bg-black" : "border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700"
              )}>
                <details className="group">
                  <summary className={cn(
                    "flex justify-between items-center p-6 cursor-pointer font-medium text-left",
                    contraste === "alto" ? "text-white" : "text-[#0B2F67] dark:text-white"
                  )}>
                    Como compro tickets para o restaurante universitário?
                    <span className="ml-4 flex-shrink-0 transform group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <div className={cn(
                    "px-6 pb-6",
                    contraste === "alto" ? "text-white/80" : "text-gray-600 dark:text-gray-300"
                  )}>
                    <p>Você pode comprar tickets através do sistema SIRUS de duas formas:</p>
                    <ul className="list-disc ml-6 mt-2 space-y-1">
                      <li>Acesse nossa plataforma online, faça login e compre com cartão de crédito via Mercado Pago</li>
                      <li>Use o QR Code disponível no restaurante para acesso rápido sem login</li>
                    </ul>
                    <p className="mt-2">Os tickets são digitais e ficam disponíveis em sua conta para uso imediato.</p>
                  </div>
                </details>
              </div>

              {/* Pergunta 2 */}
              <div className={cn(
                "border rounded-lg overflow-hidden",
                contraste === "alto" ? "border-white bg-black" : "border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700"
              )}>
                <details className="group">
                  <summary className={cn(
                    "flex justify-between items-center p-6 cursor-pointer font-medium text-left",
                    contraste === "alto" ? "text-white" : "text-[#0B2F67] dark:text-white"
                  )}>
                    Quais são os valores das refeições?
                    <span className="ml-4 flex-shrink-0 transform group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <div className={cn(
                    "px-6 pb-6",
                    contraste === "alto" ? "text-white/80" : "text-gray-600 dark:text-gray-300"
                  )}>
                    <p>Os valores variam conforme o tipo de usuário:</p>
                    <ul className="list-disc ml-6 mt-2 space-y-1">
                      <li><strong>Estudantes subsidiados:</strong> R$ 2,00 por refeição</li>
                      <li><strong>Não subsidiados e visitantes:</strong> R$ 13,00 por refeição</li>
                    </ul>
                    <p className="mt-2">Os preços são mantidos acessíveis graças ao subsídio da universidade para estudantes cadastrados.</p>
                  </div>
                </details>
              </div>

              {/* Pergunta 3 */}
              <div className={cn(
                "border rounded-lg overflow-hidden",
                contraste === "alto" ? "border-white bg-black" : "border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700"
              )}>
                <details className="group">
                  <summary className={cn(
                    "flex justify-between items-center p-6 cursor-pointer font-medium text-left",
                    contraste === "alto" ? "text-white" : "text-[#0B2F67] dark:text-white"
                  )}>
                    Quais são os horários de funcionamento?
                    <span className="ml-4 flex-shrink-0 transform group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <div className={cn(
                    "px-6 pb-6",
                    contraste === "alto" ? "text-white/80" : "text-gray-600 dark:text-gray-300"
                  )}>
                    <p>O Restaurante Universitário funciona:</p>
                    <ul className="list-disc ml-6 mt-2 space-y-1">
                      <li><strong>Segunda a Sexta:</strong> 11h00 às 14h00 (apenas almoço)</li>
                      <li><strong>Fins de semana:</strong> Fechado</li>
                      <li><strong>Jantar:</strong> Não oferecemos este serviço</li>
                    </ul>
                  </div>
                </details>
              </div>

              {/* Pergunta 4 */}
              <div className={cn(
                "border rounded-lg overflow-hidden",
                contraste === "alto" ? "border-white bg-black" : "border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700"
              )}>
                <details className="group">
                  <summary className={cn(
                    "flex justify-between items-center p-6 cursor-pointer font-medium text-left",
                    contraste === "alto" ? "text-white" : "text-[#0B2F67] dark:text-white"
                  )}>
                    Como funciona o login facial?
                    <span className="ml-4 flex-shrink-0 transform group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <div className={cn(
                    "px-6 pb-6",
                    contraste === "alto" ? "text-white/80" : "text-gray-600 dark:text-gray-300"
                  )}>
                    <p>O sistema oferece autenticação biométrica facial para maior praticidade:</p>
                    <ul className="list-disc ml-6 mt-2 space-y-1">
                      <li>Primeiro, faça seu cadastro facial na área do usuário</li>
                      <li>O sistema captura e armazena características únicas do seu rosto de forma segura</li>
                      <li>Após o cadastro, você pode fazer login apenas mostrando o rosto para a câmera</li>
                      <li>É uma forma rápida e segura de acessar sua conta</li>
                    </ul>
                  </div>
                </details>
              </div>

              {/* Pergunta 5 */}
              <div className={cn(
                "border rounded-lg overflow-hidden",
                contraste === "alto" ? "border-white bg-black" : "border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700"
              )}>
                <details className="group">
                  <summary className={cn(
                    "flex justify-between items-center p-6 cursor-pointer font-medium text-left",
                    contraste === "alto" ? "text-white" : "text-[#0B2F67] dark:text-white"
                  )}>
                    O que fazer se meu ticket não foi validado?
                    <span className="ml-4 flex-shrink-0 transform group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <div className={cn(
                    "px-6 pb-6",
                    contraste === "alto" ? "text-white/80" : "text-gray-600 dark:text-gray-300"
                  )}>
                    <p>Se houver problemas com a validação do seu ticket:</p>
                    <ul className="list-disc ml-6 mt-2 space-y-1">
                      <li>Procure um funcionário do restaurante imediatamente</li>
                      <li>Mostre seu QR Code na tela do celular</li>
                      <li>Entre em contato com o suporte técnico: suporte.sirus@unifesspa.edu.br</li>
                      <li>Ligue para (94) 2101-7041 para assistência</li>
                    </ul>
                  </div>
                </details>
              </div>

              {/* Pergunta 6 */}
              <div className={cn(
                "border rounded-lg overflow-hidden",
                contraste === "alto" ? "border-white bg-black" : "border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700"
              )}>
                <details className="group">
                  <summary className={cn(
                    "flex justify-between items-center p-6 cursor-pointer font-medium text-left",
                    contraste === "alto" ? "text-white" : "text-[#0B2F67] dark:text-white"
                  )}>
                    Posso consultar o cardápio da semana?
                    <span className="ml-4 flex-shrink-0 transform group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <div className={cn(
                    "px-6 pb-6",
                    contraste === "alto" ? "text-white/80" : "text-gray-600 dark:text-gray-300"
                  )}>
                    <p>Sim! O cardápio está sempre disponível:</p>
                    <ul className="list-disc ml-6 mt-2 space-y-1">
                      <li>Na página inicial do site você encontra o cardápio da semana atual</li>
                      <li>O cardápio é atualizado semanalmente</li>
                      <li>Inclui opções vegetarianas e informações nutricionais</li>
                      <li>Você pode acessar mesmo sem fazer login</li>
                    </ul>
                  </div>
                </details>
              </div>

              {/* Pergunta 7 */}
              <div className={cn(
                "border rounded-lg overflow-hidden",
                contraste === "alto" ? "border-white bg-black" : "border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700"
              )}>
                <details className="group">
                  <summary className={cn(
                    "flex justify-between items-center p-6 cursor-pointer font-medium text-left",
                    contraste === "alto" ? "text-white" : "text-[#0B2F67] dark:text-white"
                  )}>
                    Como criar uma conta no sistema?
                    <span className="ml-4 flex-shrink-0 transform group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <div className={cn(
                    "px-6 pb-6",
                    contraste === "alto" ? "text-white/80" : "text-gray-600 dark:text-gray-300"
                  )}>
                    <p>Para criar sua conta no SIRUS:</p>
                    <ul className="list-disc ml-6 mt-2 space-y-1">
                      <li>Clique em "Cadastrar" na página inicial</li>
                      <li>Preencha seus dados pessoais (nome, email, senha)</li>
                      <li>Confirme sua conta através do email enviado</li>
                      <li>Faça login e aproveite todas as funcionalidades</li>
                    </ul>
                    <p className="mt-2">Estudantes da UNIFESSPA têm acesso aos preços subsidiados automaticamente.</p>
                  </div>
                </details>
              </div>

              {/* Pergunta 8 */}
              <div className={cn(
                "border rounded-lg overflow-hidden",
                contraste === "alto" ? "border-white bg-black" : "border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700"
              )}>
                <details className="group">
                  <summary className={cn(
                    "flex justify-between items-center p-6 cursor-pointer font-medium text-left",
                    contraste === "alto" ? "text-white" : "text-[#0B2F67] dark:text-white"
                  )}>
                    O sistema oferece suporte para pessoas com deficiência?
                    <span className="ml-4 flex-shrink-0 transform group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <div className={cn(
                    "px-6 pb-6",
                    contraste === "alto" ? "text-white/80" : "text-gray-600 dark:text-gray-300"
                  )}>
                    <p>Sim! O SIRUS foi desenvolvido com foco em acessibilidade:</p>
                    <ul className="list-disc ml-6 mt-2 space-y-1">
                      <li>Integração com VLibras para tradução em Libras</li>
                      <li>Suporte a leitores de tela</li>
                      <li>Opção de alto contraste</li>
                      <li>Navegação por teclado</li>
                      <li>Textos alternativos em imagens</li>
                    </ul>
                  </div>
                </details>
              </div>
            </div>

            {/* Contato para mais dúvidas */}
            <div className={cn(
              "mt-12 p-6 rounded-lg text-center",
              contraste === "alto" ? "bg-black border-2 border-white" : "bg-gray-50 dark:bg-gray-800"
            )}>
              <h3 className={cn(
                "text-lg font-semibold mb-2",
                contraste === "alto" ? "text-white" : "text-[#0B2F67] dark:text-white"
              )}>
                Não encontrou sua dúvida?
              </h3>
              <p className={cn(
                "mb-4",
                contraste === "alto" ? "text-white/80" : "text-gray-600 dark:text-gray-300"
              )}>
                Entre em contato conosco através dos canais de suporte
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">suporte.sirus@unifesspa.edu.br</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">(94) 2101-7041</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          className={cn(
            "relative bg-yellow-400 py-24 text-[#0B2F67] overflow-hidden",
            contraste === "alto" && "bg-black text-white"
          )}
          ref={hoursRef}
        >
          {/* SVG ONDA */}
          <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] rotate-180">
            <svg
              className="relative block w-full h-[120px]"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1440 320"
              preserveAspectRatio="none"
            >
              <path
                fill={contraste === "alto" ? "#000000" : "#F4F7FA"}
                d="M0,192L48,170.7C96,149,192,107,288,117.3C384,128,480,192,576,229.3C672,267,768,277,864,240C960,203,1056,117,1152,85.3C1248,53,1344,75,1392,85.3L1440,96V320H0Z"
              />
            </svg>
          </div>
          <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
            <h2 className="text-4xl font-bold drop-shadow mb-4">
              Pronto para começar?
            </h2>
            <p className="text-lg mb-8">
              Faça login agora e aproveite todas as facilidades do nosso sistema!
            </p>
            <Link href="/login">
              <Button
                size="lg"
                className={cn(
                  "bg-white text-[#0B2F67] font-semibold shadow-lg hover:shadow-xl hover:bg-white/90 transition",
                  contraste === "alto" && "bg-white text-black border-2 border-white"
                )}
              >
                Fazer Login
              </Button>
            </Link>
          </div>
          {/* SVG ONDA */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
            <svg
              className="relative block w-full h-[120px]"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1440 320"
              preserveAspectRatio="none"
            >
              <path
                fill={contraste === "alto" ? "#000000" : "#0B2F67"}
                d="M0,192L48,170.7C96,149,192,107,288,117.3C384,128,480,192,576,229.3C672,267,768,277,864,240C960,203,1056,117,1152,85.3C1248,53,1344,75,1392,85.3L1440,96V320H0Z"
              />
            </svg>
          </div>
        </section>
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <HomePage />
    </Suspense>
  )
}