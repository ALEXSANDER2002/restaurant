"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export function BotaoSair() {
  const { usuario, logout } = useAuth()
  const router = useRouter()
  if (!usuario) return null
  return (
    <Button
      variant="ghost"
      onClick={async () => {
        await logout()
        router.replace("/login")
      }}
    >
      Sair
    </Button>
  )
} 