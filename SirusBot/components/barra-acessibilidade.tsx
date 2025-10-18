"use client"

import { Button } from "@/components/ui/button"
import { useTema } from "./provedor-tema"
import { Moon, Sun, Eye, Accessibility, Contrast } from "lucide-react"
import { useEffect, useState } from "react"
import { useIdioma } from "@/contexts/idioma-context"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function BarraAcessibilidade() {
  const { tema, alterarTema, contraste, alterarContraste } = useTema()
  const { t } = useIdioma()
  const [vLibrasCarregado, setVLibrasCarregado] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const isSystemDark = darkModeMediaQuery.matches

      const darkMode = tema === "escuro" || (tema === "sistema" && isSystemDark)
      setIsDarkMode(darkMode)

      const handleChange = (e: MediaQueryListEvent) => {
        if (tema === "sistema") {
          setIsDarkMode(e.matches)
        }
      }

      darkModeMediaQuery.addEventListener('change', handleChange)
      return () => darkModeMediaQuery.removeEventListener('change', handleChange)
    }
  }, [tema])

  // Detecta se o VLibras já foi inserido por outro componente (ex.: carregamento automático)
  useEffect(() => {
    if (typeof window !== "undefined") {
      // @ts-ignore
      if (window.VLibras) {
        setVLibrasCarregado(true)
      }
    }
  }, [])

  const carregarVLibras = () => {
    if (vLibrasCarregado || typeof window === "undefined") return

    // Se o script já estiver presente, apenas marca como carregado
    const scriptJaExiste = document.querySelector(
      'script[src="https://vlibras.gov.br/app/vlibras-plugin.js"]'
    )
    if (scriptJaExiste) {
      setVLibrasCarregado(true)
      return
    }

    const jaExiste = document.querySelector('[vw]')
    if (!jaExiste) {
      const container = document.createElement("div")
      container.setAttribute("vw", "")
      container.className = "enabled"
      container.innerHTML = `
        <div vw-access-button class="active"></div>
        <div vw-plugin-wrapper>
          <div class="vw-plugin-top-wrapper"></div>
        </div>
      `
      document.body.appendChild(container)
    }

    const script = document.createElement("script")
    script.src = "https://vlibras.gov.br/app/vlibras-plugin.js"
    script.async = true
    script.onload = () => {
      // @ts-ignore
      if (window.VLibras) {
        // @ts-ignore
        new window.VLibras.Widget("https://vlibras.gov.br/app")
        setVLibrasCarregado(true)
      }
    }
    document.body.appendChild(script)
  }

  return (
    <div className={cn(
      "bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-sm",
      contraste === "alto" && "bg-contrast-high text-contrast-high border-contrast-high"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="default"
              size="sm"
              className="flex items-center gap-1 bg-[#1351B4] hover:bg-[#0B2F67] text-white border-0"
            >
              <Accessibility className="h-4 w-4" />
              <span className="font-medium hidden sm:inline">Acessibilidade</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            sideOffset={6}
            align="start"
            className={cn(
              "bg-white dark:bg-gray-800",
              contraste === "alto" && "bg-contrast-high text-contrast-high border-contrast-high"
            )}
          >
            <DropdownMenuLabel className={cn(
              "text-xs font-semibold text-gray-600 dark:text-gray-400",
              contraste === "alto" && "text-contrast-high"
            )}>
              {t("acessibilidade.ajustes")}
            </DropdownMenuLabel>

            <DropdownMenuItem
              onSelect={() => alterarContraste(contraste === "normal" ? "alto" : "normal")}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Contrast className="h-4 w-4" />
                <div>
                  <span>{t("acessibilidade.altoContraste")}</span>
                  {contraste === "alto" && (
                    <span className="ml-2 text-xs bg-blue-500 px-1 rounded">
                      Ativo
                    </span>
                  )}
                </div>
              </div>
            </DropdownMenuItem>


            <DropdownMenuSeparator className={contraste === "alto" ? "bg-contrast-high" : ""} />

            <DropdownMenuItem
              onSelect={carregarVLibras}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{t("acessibilidade.vlibras")}</span>
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator className={contraste === "alto" ? "bg-contrast-high" : ""} />

            <DropdownMenuItem asChild>
              <a
                href="#conteudo-principal"
                className={cn(
                  "flex items-center gap-2",
                  contraste === "alto" ? "text-yellow-300 underline" : ""
                )}
              >
                <Accessibility className="h-4 w-4" />
                <span>{t("acessibilidade.irConteudo")}</span>
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <p className={cn(
          "hidden md:block text-[12px] text-gray-500 dark:text-gray-400",
          contraste === "alto" && "text-contrast-high"
        )}>
          Alt + 1 (conteúdo), Alt + 4 (contraste)
        </p>
      </div>
    </div>
  )
}
