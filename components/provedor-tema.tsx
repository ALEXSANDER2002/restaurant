"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"
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
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    // Carregar preferências do localStorage
    const temaArmazenado = localStorage.getItem("tema") as ModoTema | null
    const contrasteArmazenado = localStorage.getItem("contraste") as ModoContraste | null

    if (temaArmazenado) {
      setTema(temaArmazenado)
    }

    if (contrasteArmazenado) {
      setContraste(contrasteArmazenado)
    }
  }, [])

  const alterarTema = (novoTema: ModoTema) => {
    setTema(novoTema)
    localStorage.setItem("tema", novoTema)
  }

  const alterarContraste = (novoContraste: ModoContraste) => {
    setContraste(novoContraste)
    localStorage.setItem("contraste", novoContraste)
  }

  // Sincronizar tema com next-themes
  const resolvedTheme = tema === "sistema" ? "system" : tema === "claro" ? "light" : "dark"

  return (
    <ContextoTema.Provider value={{ tema, alterarTema, contraste, alterarContraste }}>
      <NextThemesProvider
        attribute="class"
        defaultTheme={resolvedTheme}
        enableSystem
        forcedTheme={isMounted ? undefined : resolvedTheme} // Evitar flash de tema incorreto
        {...props}
      >
        <TemaAplicador contraste={contraste}>
          {children}
        </TemaAplicador>
      </NextThemesProvider>
    </ContextoTema.Provider>
  )
}

// Componente auxiliar para aplicar o contraste
function TemaAplicador({ children, contraste }: { children: React.ReactNode, contraste: ModoContraste }) {
  const { setTheme } = useNextTheme()
  
  useEffect(() => {
    // Aplicar contraste
    if (contraste === "alto") {
      document.documentElement.classList.add("contrast-high")
    } else {
      document.documentElement.classList.remove("contrast-high")
    }
  }, [contraste])

  return <>{children}</>
}

export const useTema = () => {
  const contexto = useContext(ContextoTema)
  const { theme, setTheme } = useNextTheme()
  
  if (!contexto) {
    throw new Error("useTema deve ser usado dentro de um ProvedorTema")
  }
  
  // Sincronizar com next-themes
  const alterarTemaSincronizado = (novoTema: ModoTema) => {
    contexto.alterarTema(novoTema)
    const resolvedTheme = novoTema === "sistema" ? "system" : novoTema === "claro" ? "light" : "dark"
    setTheme(resolvedTheme)
  }

  return {
    ...contexto,
    alterarTema: alterarTemaSincronizado
  }
}