"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIdioma } from "@/contexts/idioma-context"

type TipoFeedback = "sucesso" | "erro" | "info" | null

interface FeedbackUsuarioProps {
  mensagem: string
  tipo: TipoFeedback
  duracao?: number
  onClose?: () => void
}

export function FeedbackUsuario({ mensagem, tipo, duracao = 5000, onClose }: FeedbackUsuarioProps) {
  const [visivel, setVisivel] = useState(true)
  const { t } = useIdioma()

  useEffect(() => {
    if (duracao > 0) {
      const timer = setTimeout(() => {
        setVisivel(false)
        if (onClose) onClose()
      }, duracao)
      return () => clearTimeout(timer)
    }
  }, [duracao, onClose])

  if (!visivel || !tipo) return null

  const icones = {
    sucesso: <CheckCircle className="h-5 w-5" />,
    erro: <AlertCircle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
  }

  const cores = {
    sucesso: "bg-green-50 text-green-800 border-green-200",
    erro: "bg-red-50 text-red-800 border-red-200",
    info: "bg-blue-50 text-blue-800 border-blue-200",
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn("fixed bottom-4 right-4 z-50 max-w-md rounded-lg border p-4 shadow-md transition-all", cores[tipo])}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{icones[tipo]}</div>
        <div className="flex-1">
          <p className="font-medium">{mensagem}</p>
        </div>
        <button
          onClick={() => {
            setVisivel(false)
            if (onClose) onClose()
          }}
          className="flex-shrink-0 rounded-full p-1 hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
          aria-label={t("geral.fechar")}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// Contexto para gerenciar feedback global
import { createContext, useContext } from "react"

interface ContextoFeedback {
  mostrarFeedback: (mensagem: string, tipo: TipoFeedback, duracao?: number) => void
}

const ContextoFeedback = createContext<ContextoFeedback | undefined>(undefined)

export function ProvedorFeedback({ children }: { children: React.ReactNode }) {
  const [feedback, setFeedback] = useState<{
    mensagem: string
    tipo: TipoFeedback
    duracao?: number
  }>({ mensagem: "", tipo: null })

  const mostrarFeedback = (mensagem: string, tipo: TipoFeedback, duracao = 5000) => {
    setFeedback({ mensagem, tipo, duracao })
  }

  return (
    <ContextoFeedback.Provider value={{ mostrarFeedback }}>
      {children}
      <FeedbackUsuario
        mensagem={feedback.mensagem}
        tipo={feedback.tipo}
        duracao={feedback.duracao}
        onClose={() => setFeedback({ mensagem: "", tipo: null })}
      />
    </ContextoFeedback.Provider>
  )
}

export function useFeedback() {
  const contexto = useContext(ContextoFeedback)
  if (!contexto) {
    throw new Error("useFeedback deve ser usado dentro de um ProvedorFeedback")
  }
  return contexto
}

