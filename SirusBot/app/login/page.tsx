"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FormularioLogin } from "@/components/formulario-login"
import { LeitorQRCode } from "@/components/leitor-qrcode"
import { LoginFacial } from "@/components/login-facial"
import { useIdioma } from "@/contexts/idioma-context"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Sparkles, Shield, Zap } from "lucide-react"
import { useTema } from "@/components/provedor-tema"
import { cn } from "@/lib/utils"

export default function PaginaLogin() {
  const { t } = useIdioma()
  const { usuario, login } = useAuth()
  const { contraste } = useTema()
  const router = useRouter()
  const [mostrarDemo, setMostrarDemo] = useState(false)

  useEffect(() => {
    if (usuario) {
      let prox = "/usuario"

      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search)
        const nextParam = params.get("next")
        if (nextParam) prox = nextParam
      }

      router.replace(prox)
    }
  }, [usuario, router])

  const handleFacialLoginSuccess = async (email: string) => {
    try {
      console.log('🚀 Iniciando login facial para:', email)
      
      const res = await fetch("/api/login-facial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      })
      
      console.log('📡 Resposta da API de login facial:', res.status, res.statusText)
      
      if (res.ok) {
        const data = await res.json()
        console.log('✅ Dados recebidos da API:', data)
        
        if (data.usuario) {
          console.log('🔄 Aguardando cookie ser definido e redirecionando...')
          setTimeout(() => {
            window.location.href = "/usuario"
          }, 500)
        } else {
          throw new Error('Dados do usuário não encontrados na resposta')
        }
      } else {
        const errorData = await res.json()
        console.error('❌ Erro na API:', errorData)
        throw new Error(errorData.erro || 'Falha no login facial')
      }
    } catch (error) {
      console.error('❌ Erro no login facial:', error)
      handleFacialLoginError(error instanceof Error ? error.message : 'Erro ao realizar login facial')
    }
  }

  const handleFacialLoginError = (message: string) => {
    console.error('Erro no login facial:', message)
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        delay: 0.1,
      },
    },
  }

  return (
    <section className={cn(
      "flex flex-col flex-1 items-center justify-center min-h-[calc(100vh-200px)]",
      contraste === "alto" 
        ? "bg-black" 
        : "bg-gray-50 dark:bg-slate-900"
    )}>
      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-8">
        
        {/* Card principal de login */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          <Card className={cn(
            "border shadow-lg",
            contraste === "alto" 
              ? "bg-black border-2 border-white" 
              : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
          )}>
            <CardHeader className={cn(
              "text-center space-y-1 pb-6",
              contraste === "alto" 
                ? "border-b-2 border-white" 
                : "border-b border-gray-200 dark:border-slate-700"
            )}>
              <CardTitle className={cn(
                "text-2xl font-semibold",
                contraste === "alto" ? "text-white" : "text-gray-900 dark:text-white"
              )}>
                {t("login.titulo")}
              </CardTitle>
              <CardDescription className={cn(
                "text-base",
                contraste === "alto" ? "text-white/70" : "text-gray-600 dark:text-gray-300"
              )}>
                {t("login.descricao")}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6">
              <Tabs defaultValue="credenciais" className="w-full">
                <TabsList className={cn(
                  "grid w-full grid-cols-3 mb-8 h-auto p-1",
                  contraste === "alto" 
                    ? "bg-black border-2 border-white" 
                    : "bg-gray-100 dark:bg-slate-700"
                )}>
                  <TabsTrigger 
                    value="credenciais"
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200",
                      contraste === "alto" 
                        ? "data-[state=active]:bg-white data-[state=active]:text-black text-white" 
                        : "data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-gray-700 dark:text-gray-200 dark:data-[state=active]:bg-slate-600 dark:data-[state=active]:text-white"
                    )}
                  >
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">{t("login.credenciais")}</span>
                    <span className="sm:hidden">Login</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="qrcode"
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200",
                      contraste === "alto" 
                        ? "data-[state=active]:bg-white data-[state=active]:text-black text-white" 
                        : "data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-gray-700 dark:text-gray-200 dark:data-[state=active]:bg-slate-600 dark:data-[state=active]:text-white"
                    )}
                  >
                    <Zap className="h-4 w-4" />
                    <span className="hidden sm:inline">{t("login.qrcode")}</span>
                    <span className="sm:hidden">QR</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="facial"
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200",
                      contraste === "alto" 
                        ? "data-[state=active]:bg-white data-[state=active]:text-black text-white" 
                        : "data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-gray-700 dark:text-gray-200 dark:data-[state=active]:bg-slate-600 dark:data-[state=active]:text-white"
                    )}
                  >
                    <Sparkles className="h-4 w-4" />
                    <span className="hidden sm:inline">{t("login.facial")}</span>
                    <span className="sm:hidden">Face</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="credenciais" className="mt-6">
                  <FormularioLogin />
                </TabsContent>
                
                <TabsContent value="qrcode" className="mt-6">
                  <LeitorQRCode />
                </TabsContent>
                
                <TabsContent value="facial" className="mt-6">
                  <LoginFacial 
                    onSuccess={handleFacialLoginSuccess}
                    onError={handleFacialLoginError}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
            
            <CardFooter className={cn(
              "flex flex-col gap-4 p-6 border-t",
              contraste === "alto" 
                ? "border-white" 
                : "bg-gray-50 dark:bg-slate-750 border-gray-200 dark:border-slate-700"
            )}>
              <div className="text-center w-full">
                <p className={cn(
                  "text-sm mb-4 font-medium",
                  contraste === "alto" ? "text-white/80" : "text-gray-600 dark:text-gray-300"
                )}>
                  Não possui uma conta?
                </p>
                <Link href="/cadastro">
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full font-semibold transition-all duration-200",
                      contraste === "alto" 
                        ? "bg-transparent border-2 border-white text-white hover:bg-white hover:text-black" 
                        : "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-slate-900"
                    )}
                  >
                    Criar Conta
                  </Button>
                </Link>
              </div>
              
              <div className={cn(
                "border-t pt-4 w-full text-center",
                contraste === "alto" ? "border-white/20" : "border-gray-200 dark:border-slate-600"
              )}>
                <p className={cn(
                  "text-xs",
                  contraste === "alto" ? "text-white/50" : "text-gray-500 dark:text-gray-400"
                )}>
                  {t("login.suporte")}
                </p>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}