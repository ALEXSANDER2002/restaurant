"use client"

import { createContext, useContext, useEffect, useState } from "react"

interface Usuario {
  id: string
  nome: string
  email: string
  tipo_usuario: string
  avatar_url?: string
}

interface AuthContextValue {
  usuario: Usuario | null
  carregando: boolean
  login: (email: string, senha: string) => Promise<Usuario | null>
  logout: () => Promise<void>
  atualizarUsuario: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [carregando, setCarregando] = useState(true)

  const buscarDadosUsuario = async () => {
    try {
      const res = await fetch("/api/session")
      const data = await res.json()
      if (data.autenticado) {
        setUsuario(data.usuario)
      } else {
        setUsuario(null)
      }
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error)
      setUsuario(null)
    }
  }

  useEffect(() => {
    buscarDadosUsuario().finally(() => setCarregando(false))
  }, [])

  async function login(email: string, senha: string) {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
      credentials: "include",
    })
    if (!res.ok) return null
    const data = await res.json()
    if (data.usuario) {
      setUsuario(data.usuario)
      return data.usuario as Usuario
    }
    return null
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" })
    setUsuario(null)
  }

  async function atualizarUsuario() {
    await buscarDadosUsuario()
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, logout, atualizarUsuario }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth deve estar dentro de AuthProvider")
  return ctx
} 