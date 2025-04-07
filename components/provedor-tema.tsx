"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
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
  const [tema, setTema] = useState<ModoTema>("sistema")
  const [contraste, setContraste] = useState<ModoContraste>("normal")

  const alterarTema = (novoTema: ModoTema) => {
    setTema(novoTema)
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

  useEffect(() => {
    const temaArmazenado = localStorage.getItem("tema") as ModoTema | null
    const contrasteArmazenado = localStorage.getItem("contraste") as ModoContraste | null

    if (temaArmazenado) {
      setTema(temaArmazenado)
    }

    if (contrasteArmazenado) {
      setContraste(contrasteArmazenado)
      if (contrasteArmazenado === "alto") {
        document.documentElement.classList.add("alto-contraste")
      }
    }
  }, [])

  return (
    <ContextoTema.Provider value={{ tema, alterarTema, contraste, alterarContraste }}>
      <NextThemesProvider
        attribute="class"
        defaultTheme={tema === "sistema" ? "system" : tema === "claro" ? "light" : "dark"}
        enableSystem
        {...props}
      >
        {children}
      </NextThemesProvider>
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

