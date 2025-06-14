"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BotaoEntrar } from "./botao-entrar"
import { useIdioma } from "@/contexts/idioma-context"
import { LogOut, User, Menu, X, Utensils } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { useScrollDirection } from "@/hooks/use-scroll-direction"
import { useAuth } from "@/contexts/auth-context"
import { BotaoSair } from "./botao-sair"

export function Cabecalho() {
  const { t } = useIdioma()
  const { usuario } = useAuth()
  const [menuAberto, setMenuAberto] = useState(false)
  const pathname = usePathname()
  const scrollDir = useScrollDirection(8)

  const toggleMenu = () => setMenuAberto(!menuAberto)

  return (
    <motion.header
      role="banner"
      initial={{ y: 0, opacity: 1 }}
      animate={{
        y: scrollDir === "down" ? -80 : 0,
        opacity: scrollDir === "down" ? 0.7 : 1,
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="sticky top-0 z-50 backdrop-blur bg-[#0B2F67]/95 text-white border-b border-[#0B2F67] shadow-lg"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold hover:opacity-80 transition-opacity">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                <Utensils className="h-5 w-5" />
              </div>
              {t("app.nome")}
            </Link>
          </div>

          {/* Menu para desktop */}
          <nav className="hidden md:block" aria-label="Menu principal">
            <ul className="flex items-center gap-4">
              <li>
                  <Button
                  asChild
                    variant="ghost"
                    className={cn(
                    "hover:bg-white/10 transition-colors",
                    pathname === "/" && "bg-white/10 font-medium",
                    )}
                  >
                  <Link href="/">{t("nav.inicio")}</Link>
                  </Button>
              </li>
              <li>
                <Button
                  asChild
                  variant="ghost"
                  className="hover:bg-white/10 transition-colors"
                >
                  <Link href="#cardapio">{t("nav.cardapio")}</Link>
                  </Button>
              </li>
              <li>
                <Button
                  asChild
                  variant="ghost"
                  className="hover:bg-white/10 transition-colors"
                >
                  <Link href="#sobre">{t("nav.sobre")}</Link>
                  </Button>
              </li>
              {usuario ? (
                <>
                  <li>
                    <Link href={usuario.tipo_usuario === "admin" ? "/admin" : "/usuario"}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "hover:bg-primary/10 transition-colors",
                          pathname === "/usuario" && "bg-primary/10 font-medium",
                        )}
                      >
                        <User className="mr-2 h-4 w-4" />
                        {usuario.tipo_usuario === "admin" ? "Admin" : usuario.email.split("@")[0]}
                      </Button>
                    </Link>
                  </li>
                  <li>
                    <BotaoSair />
                  </li>
                </>
              ) : (
                <li>
                  <BotaoEntrar />
                </li>
              )}
            </ul>
          </nav>

          {/* Botão de menu para mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMenu}
            aria-expanded={menuAberto}
            aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
          >
            {menuAberto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Menu mobile */}
        {menuAberto && (
          <nav className="md:hidden pt-4 pb-2 border-t mt-3 bg-background/90 backdrop-blur-md rounded-b-md shadow-md" aria-label="Menu mobile">
            <ul className="flex flex-col gap-2">
              <li>
                  <Button
                  asChild
                    variant="ghost"
                    className={cn(
                    "w-full justify-start hover:bg-white/10",
                    pathname === "/" && "bg-white/10 font-medium",
                    )}
                  >
                  <Link href="/" onClick={() => setMenuAberto(false)}>{t("nav.inicio")}</Link>
                  </Button>
              </li>
              <li>
                <Button
                  asChild
                  variant="ghost"
                  className="w-full justify-start hover:bg-white/10"
                >
                  <Link href="#cardapio" onClick={() => setMenuAberto(false)}>{t("nav.cardapio")}</Link>
                  </Button>
              </li>
              <li>
                <Button
                  asChild
                  variant="ghost"
                  className="w-full justify-start hover:bg-white/10"
                >
                  <Link href="#sobre" onClick={() => setMenuAberto(false)}>{t("nav.sobre")}</Link>
                  </Button>
              </li>
              {usuario ? (
                <>
                  <li>
                    <Link href={usuario.tipo_usuario === "admin" ? "/admin" : "/usuario"}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start hover:bg-primary/10",
                          pathname === "/usuario" && "bg-primary/10 font-medium",
                        )}
                      >
                        <User className="mr-2 h-4 w-4" />
                        {usuario.tipo_usuario === "admin" ? "Admin" : usuario.email.split("@")[0]}
                      </Button>
                    </Link>
                  </li>
                  <li>
                    <BotaoSair />
                  </li>
                </>
              ) : (
                <li className="py-2">
                  <BotaoEntrar />
                </li>
              )}
            </ul>
          </nav>
        )}
      </div>
    </motion.header>
  )
}

