"use client"

import type React from "react"

import Link from "next/link"
import { useIdioma } from "@/contexts/idioma-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Facebook, Instagram, Twitter, Mail, ArrowUp, Send } from "lucide-react"
import { useState } from "react"

export function Rodape() {
  const { t } = useIdioma()
  const anoAtual = new Date().getFullYear()
  const [email, setEmail] = useState("")
  const [inscrito, setInscrito] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulação de inscrição na newsletter
    setInscrito(true)
    setEmail("")
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <footer className="bg-[#0B2F67] text-white pt-12 pb-6 relative" role="contentinfo">
      {/* Botão voltar ao topo */}
      <button
        onClick={scrollToTop}
        className="absolute -top-5 right-8 bg-[#0B2F67] text-white border-b border-white/50 rounded-full p-2 shadow-lg hover:bg-[#0B2F67]/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
        aria-label={t("rodape.voltarTopo") || "Voltar ao topo"}
      >
        <ArrowUp className="h-5 w-5" />
      </button>

      <div className="container mx-auto px-4">
        {/* Seção principal do rodapé */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-white/20">
          {/* Coluna 1: Sobre */}
          <div className="md:col-span-1">
            <h2 className="text-xl font-bold mb-4">{t("app.nome")}</h2>
            <p className="text-white/80 mb-4">{t("rodape.descricao")}</p>
            <div className="flex space-x-4 mt-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Coluna 2: Links Úteis */}
          <div className="md:col-span-1">
            <h2 className="text-lg font-bold mb-4">{t("rodape.linksUteis")}</h2>
            <nav aria-label="Links úteis no rodapé">
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/"
                    className="text-white/80 hover:text-white hover:underline transition-colors"
                  >
                    {t("nav.inicio")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#cardapio"
                    className="text-white/80 hover:text-white hover:underline transition-colors"
                  >
                    {t("nav.cardapio")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#sobre"
                    className="text-white/80 hover:text-white hover:underline transition-colors"
                  >
                    {t("nav.sobre")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-white/80 hover:text-white hover:underline transition-colors"
                  >
                    {t("nav.entrar")}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Coluna 3: Contato */}
          <div className="md:col-span-1">
            <h2 className="text-lg font-bold mb-4">{t("rodape.contato")}</h2>
            <address className="not-italic text-white/80">
              <p className="mb-2">UNIFESSPA</p>
              <p className="mb-2">Av. Principal, 1000</p>
              <p className="mb-2 flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <a
                  href="mailto:ru@universidade.edu.br"
                  className="hover:text-white hover:underline transition-colors"
                >
                  ru@universidade.edu.br
                </a>
              </p>
              <p>Telefone: (00) 1234-5678</p>
            </address>
          </div>

          {/* Coluna 4: Newsletter */}
          <div className="md:col-span-1">
            <h2 className="text-lg font-bold mb-4">{t("rodape.newsletter") || "Newsletter"}</h2>
            {inscrito ? (
              <p className="text-white/80">
                {t("rodape.inscritoNewsletter") || "Obrigado por se inscrever!"}
              </p>
            ) : (
              <>
                <p className="text-white/80 mb-4">
                  {t("rodape.receberNoticias") || "Receba novidades sobre o cardápio e eventos"}
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
                  <div className="flex">
                    <Input
                      type="email"
                      placeholder={t("rodape.seuEmail") || "Seu e-mail"}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-white/10 border-white/20 text-[#0B2F67] placeholder:text-[#0B2F67]/90 focus-visible:ring-white"
                      aria-label={t("rodape.seuEmail") || "Seu e-mail"}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      className="ml-2 bg-[#0B2F67] text-white hover:bg-[#0B2F67]/90"
                      aria-label={t("rodape.inscrever") || "Inscrever"}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Rodapé inferior com copyright */}
        <div className="mt-8 text-center text-white/70 text-sm">
          <p>
            &copy; {anoAtual} {t("app.descricao")}. {t("rodape.direitos")}
          </p>
          <div className="mt-2 flex justify-center space-x-4">
            <Link href="/termos" className="hover:text-white hover:underline transition-colors">
              {t("rodape.termosUso") || "Termos de Uso"}
            </Link>
            <Link href="/privacidade" className="hover:text-white hover:underline transition-colors">
              {t("rodape.politicaPrivacidade") || "Política de Privacidade"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

