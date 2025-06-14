"use client"

import { Button } from "@/components/ui/button"
import { useTema } from "./provedor-tema"
import { Moon, Sun, Eye, Accessibility } from "lucide-react"
import { useEffect, useState } from "react"
import { useIdioma } from "@/contexts/idioma-context"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function BarraAcessibilidade() {
  const { tema, alterarTema, contraste, alterarContraste } = useTema()
  const { t } = useIdioma()
  const [vLibrasCarregado, setVLibrasCarregado] = useState(false)

  useEffect(() => {
    // Carrega o script do VLibras
    if (!vLibrasCarregado) {
      const script = document.createElement("script")
      script.src = "https://vlibras.gov.br/app/vlibras-plugin.js"
      script.async = true
      script.onload = () => {
        // @ts-ignore - VLibras não tem tipagem
        new window.VLibras.Widget("https://vlibras.gov.br/app")
        setVLibrasCarregado(true)
      }
      document.body.appendChild(script)
    }
  }, [vLibrasCarregado])

  // Novo botão flutuante com menu dropdown
  return (
    <div className="bg-white border-b border-gray-200 text-gray-800 text-sm">
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
          <DropdownMenuContent sideOffset={6} align="start">
            <DropdownMenuItem
              onSelect={() => alterarContraste(contraste === "normal" ? "alto" : "normal")}
            >
              <Eye className="h-4 w-4" />
              <span>{t("acessibilidade.altoContraste")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => alterarTema(tema === "claro" ? "escuro" : "claro")}>
              {tema === "claro" ? (
                <>
                  <Moon className="h-4 w-4" />
                  <span>{t("acessibilidade.modoEscuro")}</span>
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4" />
                  <span>{t("acessibilidade.modoClaro")}</span>
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                const el = document.getElementById("vlibras-btn")
                el?.click()
              }}
            >
              <Eye className="h-4 w-4" />
              <span>{t("acessibilidade.vlibras")}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="#conteudo-principal">{t("acessibilidade.irConteudo")}</a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <p className="hidden md:block text-[12px] text-gray-500">Alt + 1 (conteúdo), Alt + 4 (contraste)</p>
      </div>
      {/* Botão invisível usado pela biblioteca VLibras */}
      <div id="vlibras-btn" className="hidden" />
    </div>
  )
}

