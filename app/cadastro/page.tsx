"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, User, Mail, Lock, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTema } from "@/components/provedor-tema"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export default function CadastroPage() {
  const { contraste } = useTema()
  const router = useRouter()
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [mostrarConfirmacaoSenha, setMostrarConfirmacaoSenha] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState("")
  const [sucesso, setSucesso] = useState("")
  
  const [dados, setDados] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmacaoSenha: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setDados(prev => ({ ...prev, [name]: value }))
    setErro("") // Limpar erro ao digitar
  }

  const validarFormulario = () => {
    if (!dados.nome.trim()) {
      setErro("Por favor, informe seu nome completo")
      return false
    }
    
    if (!dados.email.trim()) {
      setErro("Por favor, informe seu email")
      return false
    }
    
    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(dados.email)) {
      setErro("Por favor, informe um email válido")
      return false
    }
    
    if (!dados.senha) {
      setErro("Por favor, informe uma senha")
      return false
    }
    
    if (dados.senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres")
      return false
    }
    
    if (dados.senha !== dados.confirmacaoSenha) {
      setErro("As senhas não coincidem")
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro("")
    setSucesso("")
    
    if (!validarFormulario()) {
      return
    }
    
    setCarregando(true)
    
    try {
      const response = await fetch("/api/cadastro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: dados.nome.trim(),
          email: dados.email.trim().toLowerCase(),
          senha: dados.senha,
        }),
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setSucesso("Conta criada com sucesso! Redirecionando para o login...")
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        setErro(result.erro || "Erro ao criar conta. Tente novamente.")
      }
    } catch (error) {
      console.error("Erro no cadastro:", error)
      setErro("Erro de conexão. Verifique sua internet e tente novamente.")
    } finally {
      setCarregando(false)
    }
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
        
        {/* Card principal de cadastro */}
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
                Criar Conta
              </CardTitle>
              <CardDescription className={cn(
                "text-base",
                contraste === "alto" ? "text-white/70" : "text-gray-600 dark:text-gray-300"
              )}>
                Preencha os dados abaixo para criar sua conta no SIRUS
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6 space-y-4">
              {erro && (
                <Alert className={cn(
                  "border",
                  contraste === "alto" ? "bg-black border-red-500 text-white" : "border-red-200 bg-red-50 dark:bg-red-900/20"
                )}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className={cn(
                    contraste === "alto" ? "text-white" : "text-red-700 dark:text-red-200"
                  )}>
                    {erro}
                  </AlertDescription>
                </Alert>
              )}

              {sucesso && (
                <Alert className={cn(
                  "border",
                  contraste === "alto" ? "bg-black border-green-500 text-white" : "border-green-200 bg-green-50 dark:bg-green-900/20"
                )}>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className={cn(
                    contraste === "alto" ? "text-white" : "text-green-700 dark:text-green-200"
                  )}>
                    {sucesso}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nome */}
                <div className="space-y-2">
                  <Label htmlFor="nome" className={cn(
                    "flex items-center gap-2 text-sm font-medium",
                    contraste === "alto" ? "text-white" : "text-gray-700 dark:text-gray-200"
                  )}>
                    <User className="h-4 w-4" />
                    Nome Completo
                  </Label>
                  <Input
                    id="nome"
                    name="nome"
                    type="text"
                    placeholder="Digite seu nome completo"
                    value={dados.nome}
                    onChange={handleChange}
                    disabled={carregando}
                    className={cn(
                      "transition-all duration-200",
                      contraste === "alto" 
                        ? "bg-black border-2 border-white text-white placeholder:text-white/60" 
                        : "border-gray-300 focus:border-blue-500 dark:border-slate-600 dark:bg-slate-700"
                    )}
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className={cn(
                    "flex items-center gap-2 text-sm font-medium",
                    contraste === "alto" ? "text-white" : "text-gray-700 dark:text-gray-200"
                  )}>
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Digite seu email"
                    value={dados.email}
                    onChange={handleChange}
                    disabled={carregando}
                    className={cn(
                      "transition-all duration-200",
                      contraste === "alto" 
                        ? "bg-black border-2 border-white text-white placeholder:text-white/60" 
                        : "border-gray-300 focus:border-blue-500 dark:border-slate-600 dark:bg-slate-700"
                    )}
                    required
                  />
                </div>

                {/* Senha */}
                <div className="space-y-2">
                  <Label htmlFor="senha" className={cn(
                    "flex items-center gap-2 text-sm font-medium",
                    contraste === "alto" ? "text-white" : "text-gray-700 dark:text-gray-200"
                  )}>
                    <Lock className="h-4 w-4" />
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="senha"
                      name="senha"
                      type={mostrarSenha ? "text" : "password"}
                      placeholder="Digite sua senha (mínimo 6 caracteres)"
                      value={dados.senha}
                      onChange={handleChange}
                      disabled={carregando}
                      className={cn(
                        "pr-10 transition-all duration-200",
                        contraste === "alto" 
                          ? "bg-black border-2 border-white text-white placeholder:text-white/60" 
                          : "border-gray-300 focus:border-blue-500 dark:border-slate-600 dark:bg-slate-700"
                      )}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      className={cn(
                        "absolute right-3 top-1/2 -translate-y-1/2 transition-colors",
                        contraste === "alto" 
                          ? "text-white/70 hover:text-white" 
                          : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      )}
                    >
                      {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirmação de Senha */}
                <div className="space-y-2">
                  <Label htmlFor="confirmacaoSenha" className={cn(
                    "flex items-center gap-2 text-sm font-medium",
                    contraste === "alto" ? "text-white" : "text-gray-700 dark:text-gray-200"
                  )}>
                    <Lock className="h-4 w-4" />
                    Confirmar Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmacaoSenha"
                      name="confirmacaoSenha"
                      type={mostrarConfirmacaoSenha ? "text" : "password"}
                      placeholder="Digite sua senha novamente"
                      value={dados.confirmacaoSenha}
                      onChange={handleChange}
                      disabled={carregando}
                      className={cn(
                        "pr-10 transition-all duration-200",
                        contraste === "alto" 
                          ? "bg-black border-2 border-white text-white placeholder:text-white/60" 
                          : "border-gray-300 focus:border-blue-500 dark:border-slate-600 dark:bg-slate-700"
                      )}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarConfirmacaoSenha(!mostrarConfirmacaoSenha)}
                      className={cn(
                        "absolute right-3 top-1/2 -translate-y-1/2 transition-colors",
                        contraste === "alto" 
                          ? "text-white/70 hover:text-white" 
                          : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      )}
                    >
                      {mostrarConfirmacaoSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Botão de Cadastro */}
                <Button
                  type="submit"
                  className={cn(
                    "w-full font-semibold mt-6 transition-all duration-200",
                    contraste === "alto" 
                      ? "bg-white text-black hover:bg-white/90 border-2 border-white" 
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  )}
                  disabled={carregando}
                >
                  {carregando ? "Criando conta..." : "Criar Conta"}
                </Button>
              </form>

              {/* Link para Login */}
              <div className={cn(
                "text-center pt-4 border-t",
                contraste === "alto" ? "border-white/20" : "border-gray-200 dark:border-slate-600"
              )}>
                <p className={cn(
                  "text-sm mb-3 font-medium",
                  contraste === "alto" ? "text-white/80" : "text-gray-600 dark:text-gray-300"
                )}>
                  Já tem uma conta?
                </p>
                <Link href="/login">
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full font-semibold transition-all duration-200",
                      contraste === "alto" 
                        ? "bg-transparent border-2 border-white text-white hover:bg-white hover:text-black" 
                        : "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-slate-900"
                    )}
                  >
                    Fazer Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Informação adicional */}
        <div className={cn(
          "mt-6 text-center max-w-md",
          contraste === "alto" ? "text-white/80" : "text-gray-500 dark:text-gray-400"
        )}>
          <p className="text-sm">
            Estudantes da UNIFESSPA têm acesso automático aos preços subsidiados (R$ 2,00 por refeição).
          </p>
        </div>
      </div>
    </section>
  )
} 