"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

type ModoTema = "claro" | "escuro" | "sistema"
type ModoContraste = "normal" | "alto"

interface ConfiguracoesTema {
  tema: ModoTema
  alterarTema: (tema: ModoTema) => void
  contraste: ModoContraste
  alterarContraste: (contraste: ModoContraste) => void
}

const ContextoTema = createContext<ConfiguracoesTema | undefined>(undefined)

export function ProvedorTema({ children, ...props }: ThemeProviderProps) {
  return (
      <NextThemesProvider attribute="class" defaultTheme="system" enableSystem {...props}>
        <GerenciadorTema>{children}</GerenciadorTema>
      </NextThemesProvider>
  )
}

function GerenciadorTema({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme()
  const [contraste, setContraste] = useState<ModoContraste>("normal")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const temaArmazenado = localStorage.getItem("tema") as ModoTema | null
    const contrasteArmazenado = localStorage.getItem("contraste") as ModoContraste | null

    if (temaArmazenado) {
      alterarTema(temaArmazenado)
    }

    if (contrasteArmazenado) {
      alterarContraste(contrasteArmazenado)
    }
  }, [])

  const alterarTema = (novoTema: ModoTema) => {
    setTheme(novoTema === "claro" ? "light" : novoTema === "escuro" ? "dark" : "system")
    localStorage.setItem("tema", novoTema)
  }

  const alterarContraste = (novoContraste: ModoContraste) => {
    setContraste(novoContraste)
    localStorage.setItem("contraste", novoContraste)

    if (novoContraste === "alto") {
      document.documentElement.classList.add("alto-contraste")
    } else {
      document.documentElement.classList.remove("alto-contraste")
    }
  }

  if (!mounted) return null // ESSENCIAL: evita mismatch

  return (
      <ContextoTema.Provider
          value={{
            tema:
                theme === "light"
                    ? "claro"
                    : theme === "dark"
                        ? "escuro"
                        : "sistema",
            alterarTema,
            contraste,
            alterarContraste,
          }}
      >
        {children}
      </ContextoTema.Provider>
  )
}

export const useTema = () => {
  const contexto = useContext(ContextoTema)
  if (!contexto) {
    throw new Error("useTema deve ser usado dentro de um ProvedorTema")
  }
  return contexto
}
