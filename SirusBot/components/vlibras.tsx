"use client"

import { useEffect, useRef } from "react"

export function VLibras() {
  const carregadoRef = useRef(false)

  useEffect(() => {
    if (carregadoRef.current || typeof window === "undefined") return

    // Verifica se o script já foi adicionado
    const scriptJaExiste = document.querySelector(
      'script[src="https://vlibras.gov.br/app/vlibras-plugin.js"]'
    )

    if (scriptJaExiste) {
      // Caso o script já exista mas o widget ainda não tenha sido instanciado
      // @ts-ignore
      if (window.VLibras && !window.__vlibrasWidget) {
        // @ts-ignore
        window.__vlibrasWidget = new window.VLibras.Widget(
          "https://vlibras.gov.br/app"
        )
      }
      carregadoRef.current = true
      return
    }

    // Cria o container se ainda não existir
    if (!document.querySelector('[vw]')) {
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

    // Cria o script
    const script = document.createElement("script")
    script.src = "https://vlibras.gov.br/app/vlibras-plugin.js"
    script.async = true
    script.onload = () => {
      // @ts-ignore
      if (window.VLibras) {
        // @ts-ignore
        window.__vlibrasWidget = new window.VLibras.Widget(
          "https://vlibras.gov.br/app"
        )
        carregadoRef.current = true
      }
    }

    document.body.appendChild(script)
  }, [])

  return null
} 