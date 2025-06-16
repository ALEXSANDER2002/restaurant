'use client'
import React from "react";
import Link from "next/link";
import { useTema } from "./provedor-tema";
import { Eye, Accessibility, Contrast, Menu, X, User } from "lucide-react";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { BotaoEntrar } from "./botao-entrar";
import { BotaoSair } from "./botao-sair";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function HeaderUNIFESSPACompleto() {
  const { contraste, alterarContraste } = useTema();
  const { usuario } = useAuth();
  const [vLibrasCarregado, setVLibrasCarregado] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      // @ts-ignore
      if (window.VLibras) {
        setVLibrasCarregado(true);
      }
    }
  }, []);

  const carregarVLibras = () => {
    if (vLibrasCarregado || typeof window === "undefined") return;
    const scriptJaExiste = document.querySelector(
      'script[src="https://vlibras.gov.br/app/vlibras-plugin.js"]'
    );
    if (scriptJaExiste) {
      setVLibrasCarregado(true);
      return;
    }
    const jaExiste = document.querySelector('[vw]');
    if (!jaExiste) {
      const container = document.createElement("div");
      container.setAttribute("vw", "");
      container.className = "enabled";
      container.innerHTML = `
        <div vw-access-button class="active"></div>
        <div vw-plugin-wrapper>
          <div class="vw-plugin-top-wrapper"></div>
        </div>
      `;
      document.body.appendChild(container);
    }
    const script = document.createElement("script");
    script.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      if (window.VLibras) {
        // @ts-ignore
        new window.VLibras.Widget("https://vlibras.gov.br/app");
        setVLibrasCarregado(true);
      }
    };
    document.body.appendChild(script);
  };

  // Adiciona atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey) {
        switch (event.key) {
          case '1': // Alt + 1: Ir para conteúdo
            event.preventDefault();
            scrollToSection("#main-content");
            break;
          case '2': // Alt + 2: Abrir/Fechar menu
            event.preventDefault();
            setMenuAberto((prev) => !prev);
            break;
          case '3': // Alt + 3: Ir para busca
            event.preventDefault();
            scrollToSection("#search-systems");
            break;
          case '4': // Alt + 4: Alternar contraste
            event.preventDefault();
            alterarContraste(contraste === "normal" ? "alto" : "normal");
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [contraste, alterarContraste, setMenuAberto]);

  const toggleMenu = () => setMenuAberto(!menuAberto);

  // Função para rolar com offset
  const scrollToSection = (id: string) => {
    const element = document.querySelector(id);
    if (element) {
      const headerHeight = document.querySelector("header")?.offsetHeight || 0; // Altura do header
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      {/* Barra de acessibilidade/topo - Responsiva com todos os ícones */}
      <div className={cn(
        "py-2 border-b border-[#1351B4]/30",
        contraste === "alto" ? "bg-black text-white" : "bg-[#071D41] text-white"
      )}>
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              {/* Botão Acessibilidade */}
              <div className="relative group" id="accessibility-menu">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className={cn(
                        "flex items-center gap-1 sm:gap-2 transition-colors px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium",
                        contraste === "alto" ? "bg-white text-black border-2 border-white hover:bg-white/90" : "bg-[#1351B4] hover:bg-[#2670E8]"
                      )}
                      aria-expanded="false"
                      aria-haspopup="true"
                    >
                      <i className="fas fa-universal-access text-sm" aria-hidden="true"></i>
                      <span>Acessibilidade</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent sideOffset={6} align="start" className={cn(
                    "bg-white",
                    contraste === "alto" ? "bg-black text-white border-2 border-white" : "dark:bg-gray-800"
                  )}>
                    <DropdownMenuLabel className={cn(
                      "text-xs font-semibold",
                      contraste === "alto" ? "text-white" : "text-gray-600 dark:text-gray-400"
                    )}>
                      Ajustes de visualização
                    </DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => alterarContraste(contraste === "normal" ? "alto" : "normal")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Contrast className="h-4 w-4" />
                        <div>
                          <span>Alto Contraste</span>
                          {contraste === "alto" && (
                            <span className="ml-2 text-xs bg-blue-500 px-1 rounded">Ativo</span>
                          )}
                        </div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={carregarVLibras} className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <span>VLibras</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a href="#" onClick={(e) => { e.preventDefault(); scrollToSection("#main-content"); }} className="flex items-center gap-2">
                        <Accessibility className="h-4 w-4" />
                        <span>Ir para conteúdo</span>
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {/* Links de acesso rápido */}
              <a href="#" onClick={(e) => { e.preventDefault(); scrollToSection("#main-content"); }} className={cn(
                "text-white/80 hover:text-white transition-colors text-xs flex items-center gap-1 px-2 py-1 rounded",
                contraste === "alto" ? "bg-white/20 hover:bg-white/30" : "bg-white/10 hover:bg-white/15"
              )} title="Ir para conteúdo">
                <i className="fas fa-arrow-down text-xs" aria-hidden="true"></i>
                <span>Conteúdo</span>
              </a>
              
              <a href="#" onClick={(e) => { e.preventDefault(); scrollToSection("#search-systems"); }} className={cn(
                "text-white/80 hover:text-white transition-colors text-xs flex items-center gap-1 px-2 py-1 rounded",
                contraste === "alto" ? "bg-white/20 hover:bg-white/30" : "bg-white/10 hover:bg-white/15"
              )} title="Ir para busca">
                <i className="fas fa-search text-xs" aria-hidden="true"></i>
                <span>Busca</span>
              </a>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <a href="#" className="hover:text-white transition-colors flex items-center gap-1 text-xs sm:text-sm" title="Ajuda">
                <i className="fas fa-question-circle" aria-hidden="true"></i>
                <span>Ajuda</span>
              </a>
              
              <a href="#" className="hover:text-white transition-colors flex items-center gap-1 text-xs sm:text-sm" title="Suporte">
                <i className="fas fa-headset" aria-hidden="true"></i>
                <span>Suporte</span>
              </a>
              
              <div className="hidden md:flex items-center bg-white/10 px-2 py-1 rounded text-white/90 text-xs">
                <span className="hidden lg:inline">Teclas de atalho: Alt + 1 (conteúdo), Alt + 2 (menu), Alt + 3 (busca), Alt + 4 (contraste)</span>
                <span className="lg:hidden">Teclas de atalho disponíveis</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra institucional - Responsiva */}
      <motion.header
        role="banner"
        initial={{ y: 0, opacity: 1 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "sticky top-0 z-30 shadow-md",
          contraste === "alto" ? "bg-black text-white" : "bg-gradient-to-r from-[#071D41] to-[#0B2B5B] text-white"
        )}
      >
        <div className="container mx-auto py-2 sm:py-3 px-3 sm:px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/" className="flex items-center gap-2 sm:gap-3">
                <div className="relative group">
                  <img
                    src="SIRUS.png"
                    alt="Logo UNIFESSPA"
                    className="h-12 sm:h-16 w-auto rounded-sm shadow-md group-hover:shadow-lg transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 rounded-sm transition-opacity duration-300"></div>
                </div>
                <div className="border-l-2 border-[#2670E8]/40 pl-2 sm:pl-3">
                  <div className="text-xs font-medium text-white/80 tracking-wider">Unifesspa</div>
                  <div className="font-bold text-sm sm:text-base tracking-wide">SIRUS</div>
                  <div className="hidden sm:block text-xs text-white/60 mt-0.5">Sistema Integrado de Restaurante Universitário Simplificado</div>
                </div>
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
                      pathname === "/" && "bg-white/10 font-medium"
                    )}
                  >
                    <Link href="/">Início</Link>
                  </Button>
                </li>
                <li>
                  <Button
                    asChild
                    variant="ghost"
                    className="hover:bg-white/10 transition-colors"
                  >
                    <Link href="/cardapio">Cardápio</Link>
                  </Button>
                </li>
                <li>
                  <Button
                    asChild
                    variant="ghost"
                    className="hover:bg-white/10 transition-colors"
                  >
                    <Link href="/sobre">Sobre</Link>
                  </Button>
                </li>
                {usuario ? (
                  <>
                    <li>
                      <Link href={usuario.tipo_usuario === "admin" ? "/admin" : "/usuario"}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "hover:bg-white/10 transition-colors",
                            pathname === "/usuario" && "bg-white/10 font-medium"
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
            <nav className={cn(
              "md:hidden pt-4 pb-2 border-t mt-3 rounded-b-md shadow-md",
              contraste === "alto" ? "bg-black/90 text-white" : "bg-[#071D41]/90 text-white"
            )} aria-label="Menu mobile">
              <ul className="flex flex-col gap-2">
                <li>
                  <Button
                    asChild
                    variant="ghost"
                    className={cn(
                      "w-full justify-start hover:bg-white/10",
                      pathname === "/" && "bg-white/10 font-medium"
                    )}
                  >
                    <Link href="/" onClick={() => setMenuAberto(false)}>Início</Link>
                  </Button>
                </li>
                <li>
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start hover:bg-white/10"
                  >
                    <Link href="/cardapio" onClick={() => setMenuAberto(false)}>Cardápio</Link>
                  </Button>
                </li>
                <li>
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start hover:bg-white/10"
                  >
                    <Link href="/sobre" onClick={() => setMenuAberto(false)}>Sobre</Link>
                  </Button>
                </li>
                {usuario ? (
                  <>
                    <li>
                      <Link href={usuario.tipo_usuario === "admin" ? "/admin" : "/usuario"} onClick={() => setMenuAberto(false)}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start hover:bg-white/10",
                            pathname === "/usuario" && "bg-white/10 font-medium"
                          )}
                        >
                          <User className="mr-2 h-4 w-4" />
                          {usuario.tipo_usuario === "admin" ? "Admin" : usuario.email.split("@")[0]}
                        </Button>
                      </Link>
                    </li>
                    <li className="py-2">
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

      {/* Breadcrumbs - Responsiva */}
      <div className={cn(
        "bg-white border-b border-gray-200 shadow-sm",
        contraste === "alto" && "bg-black text-white border-white"
      )}>
        <div className="container mx-auto px-3 sm:px-4 py-2">
          <nav aria-label="Trilha de navegação" className="flex items-center">
            <ol className="flex items-center text-xs sm:text-sm">
              <li>
                <Link href="/" className={cn(
                  "flex items-center transition-colors",
                  contraste === "alto" ? "text-white hover:text-gray-200" : "text-[#1351B4] hover:text-[#2670E8]"
                )}>
                  <i className="fas fa-home mr-1" aria-hidden="true"></i>
                  <span>Página Inicial</span>
                </Link>
              </li>
              <li className="flex items-center">
                <i
                  aria-hidden={true}
                  className={cn(
                    "fas fa-chevron-right mx-2 text-xs",
                    contraste === "alto" ? "text-white" : "text-gray-400"
                  )}
                ></i>
                <span className={cn(
                  "font-medium",
                  contraste === "alto" ? "text-white" : "text-gray-700"
                )} aria-current="page">
                  SIRUS
                </span>
              </li>
            </ol>
          </nav>
        </div>
      </div>
    </>
  );
}