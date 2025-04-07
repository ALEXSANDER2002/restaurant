"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BotaoEntrar } from "./botao-entrar"
import { useAuth } from "@/contexts/auth-context"
import { useIdioma } from "@/contexts/idioma-context"
import { LogOut, User, Menu, X, Utensils } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

export function Cabecalho() {
  const { usuario, perfil, sair } = useAuth()
  const { t } = useIdioma()
  const [menuAberto, setMenuAberto] = useState(false)
  const pathname = usePathname()

  const toggleMenu = () => setMenuAberto(!menuAberto)

  return (
    <header className="bg-background border-b sticky top-0 z-50 shadow-sm" role="banner">
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
                <Link href="/" passHref legacyBehavior>
                  <Button
                    variant="ghost"
                    as="a"
                    className={cn(
                      "hover:bg-primary/10 transition-colors",
                      pathname === "/" && "bg-primary/10 font-medium",
                    )}
                  >
                    {t("nav.inicio")}
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="#cardapio" passHref legacyBehavior>
                  <Button variant="ghost" as="a" className="hover:bg-primary/10 transition-colors">
                    {t("nav.cardapio")}
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="#sobre" passHref legacyBehavior>
                  <Button variant="ghost" as="a" className="hover:bg-primary/10 transition-colors">
                    {t("nav.sobre")}
                  </Button>
                </Link>
              </li>
              {usuario ? (
                <>
                  <li>
                    <Link href={perfil?.tipo === "admin" ? "/admin" : "/usuario"} passHref legacyBehavior>
                      <Button
                        variant="ghost"
                        as="a"
                        className={cn(
                          "hover:bg-primary/10 transition-colors",
                          (pathname === "/admin" || pathname === "/usuario") && "bg-primary/10 font-medium",
                        )}
                      >
                        <User className="mr-2 h-4 w-4" />
                        {perfil?.nome?.split(" ")[0] || t("nav.minhaConta")}
                      </Button>
                    </Link>
                  </li>
                  <li>
                    <Button
                      variant="outline"
                      onClick={sair}
                      className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {t("nav.sair")}
                    </Button>
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
          <nav className="md:hidden pt-4 pb-2 border-t mt-3" aria-label="Menu mobile">
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/" onClick={() => setMenuAberto(false)}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start hover:bg-primary/10",
                      pathname === "/" && "bg-primary/10 font-medium",
                    )}
                  >
                    {t("nav.inicio")}
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="#cardapio" onClick={() => setMenuAberto(false)}>
                  <Button variant="ghost" className="w-full justify-start hover:bg-primary/10">
                    {t("nav.cardapio")}
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="#sobre" onClick={() => setMenuAberto(false)}>
                  <Button variant="ghost" className="w-full justify-start hover:bg-primary/10">
                    {t("nav.sobre")}
                  </Button>
                </Link>
              </li>
              {usuario ? (
                <>
                  <li>
                    <Link href={perfil?.tipo === "admin" ? "/admin" : "/usuario"} onClick={() => setMenuAberto(false)}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start hover:bg-primary/10",
                          (pathname === "/admin" || pathname === "/usuario") && "bg-primary/10 font-medium",
                        )}
                      >
                        <User className="mr-2 h-4 w-4" />
                        {perfil?.nome?.split(" ")[0] || t("nav.minhaConta")}
                      </Button>
                    </Link>
                  </li>
                  <li>
                    <Button
                      variant="outline"
                      onClick={() => {
                        sair()
                        setMenuAberto(false)
                      }}
                      className="w-full justify-start hover:bg-destructive/10 hover:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {t("nav.sair")}
                    </Button>
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
    </header>
  )
}

