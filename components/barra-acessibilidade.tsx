"use client"

import { Button } from "@/components/ui/button"
import { useTema } from "./provedor-tema"
import { Moon, Sun, Eye } from "lucide-react"
import { useEffect, useState } from "react"
import { useIdioma } from "@/contexts/idioma-context"

// Adicione estas importações
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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

  // Substitua o return pela versão melhorada
  return (
    <div
      className="bg-primary/90 text-primary-foreground py-2 backdrop-blur-sm border-b border-primary/20"
      role="region"
      aria-label="Barra de acessibilidade"
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <TooltipProvider delayDuration={300}>
          <div className="flex gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => alterarContraste(contraste === "normal" ? "alto" : "normal")}
                  aria-pressed={contraste === "alto"}
                  aria-label={t("acessibilidade.altoContraste")}
                  className={cn(
                    "rounded-md hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white",
                    contraste === "alto" && "bg-white/20",
                  )}
                >
                  <Eye className={cn("h-4 w-4 mr-2", contraste === "alto" && "text-yellow-300")} />
                  <span className="sr-only md:not-sr-only text-sm">{t("acessibilidade.altoContraste")}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{contraste === "normal" ? "Ativar" : "Desativar"} alto contraste</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => alterarTema(tema === "claro" ? "escuro" : "claro")}
                  aria-pressed={tema === "escuro"}
                  aria-label={tema === "claro" ? t("acessibilidade.modoEscuro") : t("acessibilidade.modoClaro")}
                  className={cn(
                    "rounded-md hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white",
                    tema === "escuro" && "bg-white/20",
                  )}
                >
                  {tema === "claro" ? (
                    <>
                      <Moon className="h-4 w-4 mr-2" />
                      <span className="sr-only md:not-sr-only text-sm">{t("acessibilidade.modoEscuro")}</span>
                    </>
                  ) : (
                    <>
                      <Sun className="h-4 w-4 mr-2" />
                      <span className="sr-only md:not-sr-only text-sm">{t("acessibilidade.modoClaro")}</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Alternar para modo {tema === "claro" ? "escuro" : "claro"}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div id="vlibras-btn">
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={t("acessibilidade.vlibras")}
                    className="vw-access-button rounded-md hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <span className="sr-only md:not-sr-only text-sm">{t("acessibilidade.vlibras")}</span>
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Tradutor de Libras</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        <div className="text-sm">
          <a
            href="#conteudo-principal"
            className="underline hover:text-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded px-2 py-1 transition-colors"
          >
            {t("acessibilidade.irConteudo")}
          </a>
        </div>
      </div>
    </div>
  )
}

