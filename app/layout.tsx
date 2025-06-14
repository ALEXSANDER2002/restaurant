import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ProvedorTema } from "@/components/provedor-tema"
import { ProvedorIdioma } from "@/contexts/idioma-context"
import { Cabecalho } from "@/components/cabecalho"
import { Rodape } from "@/components/rodape"
import { BarraAcessibilidade } from "@/components/barra-acessibilidade"
import { PularParaConteudo } from "@/components/pular-para-conteudo"
import { ProvedorFeedback } from "@/components/feedback-usuario"
import { AuthProvider } from "@/contexts/auth-context"
import { ErrorBoundary } from "@/components/error-boundary"
import { ScrollToTop } from "@/components/scroll-to-top"
import { ChatBot } from "@/components/chat-bot"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Restaurante Universitário",
  description: "Sistema de venda de almoço do Restaurante Universitário",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ProvedorTema>
          <ProvedorIdioma>
            <ProvedorFeedback>
              <AuthProvider>
                <div className="flex min-h-screen flex-col">
                  <PularParaConteudo />
                  <BarraAcessibilidade />
                  <Cabecalho />
                  <main id="conteudo-principal" className="flex-1" tabIndex={-1}>
                    <ErrorBoundary>{children}</ErrorBoundary>
                  </main>
                  <Rodape />
                  <ScrollToTop />
                  <ChatBot />
                </div>
              </AuthProvider>
            </ProvedorFeedback>
          </ProvedorIdioma>
        </ProvedorTema>
      </body>
    </html>
  )
}

import './globals.css'