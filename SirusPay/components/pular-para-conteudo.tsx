"use client"

import { useIdioma } from "@/contexts/idioma-context"

export function PularParaConteudo() {
  const { t } = useIdioma()

  return (
    <a
      href="#conteudo-principal"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none"
    >
      {t("acessibilidade.irConteudo")}
    </a>
  )
}

