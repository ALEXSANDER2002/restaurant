"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { useIdioma } from "@/contexts/idioma-context"
import { AjudaContextual } from "./ajuda-contextual"
import { useFeedback } from "./feedback-usuario"

export function FormularioLogin() {
  const { entrar, carregando: carregandoAuth } = useAuth()
  const { t } = useIdioma()
  const { mostrarFeedback } = useFeedback()
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [lembrar, setLembrar] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro(null)
    setCarregando(true)

    try {
      const { erro: erroLogin } = await entrar(email, senha)

      if (erroLogin) {
        setErro(erroLogin)
        mostrarFeedback(erroLogin, "erro")
      } else {
        mostrarFeedback(t("login.sucessoLogin"), "sucesso")
      }
    } catch (error: any) {
      const mensagemErro = "Ocorreu um erro ao fazer login. Tente novamente."
      setErro(mensagemErro)
      mostrarFeedback(mensagemErro, "erro")
    } finally {
      setCarregando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {erro && (
        <Alert variant="destructive" role="alert">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{erro}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="email" className="text-sm font-medium">
            {t("login.email")}
          </Label>
          <AjudaContextual titulo={t("login.ajuda.email.titulo")} descricao={t("login.ajuda.email.descricao")} />
        </div>
        <Input
          id="email"
          type="email"
          placeholder="seu.email@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-required="true"
          aria-invalid={!!erro}
          autoComplete="email"
          className="focus-visible:ring-2 focus-visible:ring-primary"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="senha" className="text-sm font-medium">
            {t("login.senha")}
          </Label>
          <AjudaContextual titulo={t("login.ajuda.senha.titulo")} descricao={t("login.ajuda.senha.descricao")} />
        </div>
        <div className="relative">
          <Input
            id="senha"
            type={mostrarSenha ? "text" : "password"}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            aria-required="true"
            aria-invalid={!!erro}
            autoComplete="current-password"
            className="pr-10 focus-visible:ring-2 focus-visible:ring-primary"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 text-muted-foreground"
            onClick={() => setMostrarSenha(!mostrarSenha)}
            aria-label={mostrarSenha ? t("login.ocultarSenha") : t("login.mostrarSenha")}
          >
            {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="lembrar"
          checked={lembrar}
          onCheckedChange={(checked) => setLembrar(checked as boolean)}
          aria-label={t("login.lembrar")}
        />
        <Label htmlFor="lembrar" className="text-sm cursor-pointer">
          {t("login.lembrar")}
        </Label>
      </div>

      <Button
        type="submit"
        className="w-full focus-visible:ring-2 focus-visible:ring-offset-2"
        disabled={carregando || carregandoAuth}
        aria-busy={carregando || carregandoAuth}
      >
        {carregando || carregandoAuth ? t("login.entrando") : t("login.entrar")}
      </Button>
    </form>
  )
}

