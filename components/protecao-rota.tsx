"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Skeleton } from "@/components/ui/skeleton"

interface ProtecaoRotaProps {
  children: React.ReactNode
  tipoPermitido?: "admin" | "usuario" | "caixa" | null
}

export function ProtecaoRota({ children, tipoPermitido }: ProtecaoRotaProps) {
  const { perfil, carregando, verificarSessao } = useAuth()
  const router = useRouter()
  const [verificado, setVerificado] = useState(false)

  useEffect(() => {
    let mounted = true

    const verificarAcesso = async () => {
      // Se ainda está carregando, não fazer nada
      if (carregando) {
        console.log("Carregando autenticação...")
        return
      }

      // Se não há perfil, verificar sessão
      if (!perfil) {
        console.log("Perfil não encontrado, verificando sessão...")
        const sessaoValida = await verificarSessao()
        if (!sessaoValida) {
          console.log("Sessão inválida, redirecionando para login...")
          router.push("/login")
          return
        }
        return // Aguardar próximo ciclo do useEffect com o perfil atualizado
      }

      console.log("Verificando acesso - Perfil:", perfil.tipo_usuario, "Tipo permitido:", tipoPermitido)

      // Se não há tipo permitido, permitir acesso
      if (!tipoPermitido) {
        console.log("Sem tipo permitido especificado, permitindo acesso...")
        if (mounted) setVerificado(true)
        return
      }

      // Se o tipo do usuário não corresponde ao permitido
      if (perfil.tipo_usuario !== tipoPermitido) {
        console.log("Tipo não corresponde:", perfil.tipo_usuario, tipoPermitido)
        // Redirecionar para a página apropriada
        switch (perfil.tipo_usuario) {
          case "admin":
            router.push("/admin")
            break
          case "usuario":
            router.push("/usuario")
            break
          case "caixa":
            router.push("/caixa")
            break
          default:
            router.push("/")
        }
        return
      }

      // Se chegou aqui, o acesso está permitido
      console.log("Acesso permitido!")
      if (mounted) setVerificado(true)
    }

    verificarAcesso()

    return () => {
      mounted = false
    }
  }, [carregando, perfil, tipoPermitido, router, verificarSessao])

  // Mostrar loading enquanto verifica
  if (carregando || !verificado) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  return <>{children}</>
}

