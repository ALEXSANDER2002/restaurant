'use client'
import React from "react";
import Link from "next/link";
import { useTema } from "./provedor-tema";
import { Eye, Accessibility, Contrast, Menu, X, User, Plus, Minus, RotateCcw, ChevronDown } from "lucide-react";
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
  const [fontSize, setFontSize] = useState(16);
  const pathname = usePathname();
  const [openAcessibilidade, setOpenAcessibilidade] = useState(false);

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

  // Atualiza o tamanho da fonte globalmente
  useEffect(() => {
    document.documentElement.style.fontSize = fontSize + "px";
  }, [fontSize]);

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

  // Função para fechar o menu de acessibilidade
  const fecharMenuAcessibilidade = () => {
    setOpenAcessibilidade(false);
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
                <DropdownMenu open={openAcessibilidade} onOpenChange={setOpenAcessibilidade}>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className={cn(
                        "flex items-center gap-1 sm:gap-2 bg-[#1351B4] hover:bg-[#2670E8] px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-white font-semibold transition-colors text-xs sm:text-sm",
                        contraste === "alto" ? "bg-white text-black border-2 border-white hover:bg-white/90" : ""
                      )}
                      style={{ minHeight: 32 }}
                      aria-expanded={openAcessibilidade}
                      aria-haspopup="true"
                    >
                      <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white">
                        <Accessibility className="text-[#1351B4] w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </span>
                      <span className="font-semibold">Acessibilidade</span>
                      <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1 text-white" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent sideOffset={6} align="start" className={cn(
                    "bg-white w-80 max-w-[95vw] p-4 rounded-xl shadow-lg border text-gray-900",
                    contraste === "alto" ? "bg-black text-white border-2 border-white" : "dark:bg-gray-800"
                  )}>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-base">Ajustes de visualização</span>
                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-white" onClick={fecharMenuAcessibilidade}>
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-300 mb-2">Personalize a aparência do site para melhor visualização</p>
                      <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <Contrast className="h-5 w-5" />
                          <div>
                            <div className="font-medium">Alto Contraste</div>
                            <div className="text-xs text-gray-500">Melhora a visualização</div>
                          </div>
                        </div>
                        <label className="inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={contraste === "alto"} onChange={() => alterarContraste(contraste === "normal" ? "alto" : "normal")}
                            className="sr-only peer" />
                          <div className={cn(
                            "w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 transition-all",
                            contraste === "alto" && "bg-blue-600"
                          )}></div>
                          <span className="ml-2 text-sm">{contraste === "alto" ? "On" : "Off"}</span>
                        </label>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-gray-100 text-blue-700 font-bold text-base">T</span>
                          <div>
                            <div className="font-medium">Tamanho da Fonte</div>
                            <div className="text-xs text-gray-500">Atual: {fontSize}px</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            className="w-7 h-7 flex items-center justify-center rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
                            onClick={() => setFontSize((f) => Math.max(12, f - 1))}
                            disabled={fontSize <= 12}
                            aria-label="Diminuir fonte"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <button
                            className="w-7 h-7 flex items-center justify-center rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
                            onClick={() => setFontSize(16)}
                            disabled={fontSize === 16}
                            aria-label="Restaurar fonte padrão"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button
                            className="w-7 h-7 flex items-center justify-center rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
                            onClick={() => setFontSize((f) => Math.min(24, f + 1))}
                            disabled={fontSize >= 24}
                            aria-label="Aumentar fonte"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <Eye className="h-5 w-5" />
                          <div>
                            <div className="font-medium">VLibras</div>
                            <div className="text-xs text-gray-500">Tradutor de Libras</div>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:underline text-sm font-medium" onClick={carregarVLibras}>Acessar</button>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                          <Accessibility className="h-5 w-5" />
                          <div>
                            <div className="font-medium">Ir para conteúdo</div>
                            <div className="text-xs text-gray-500">Atalho: Alt+1</div>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:underline text-sm font-medium" onClick={() => scrollToSection("#main-content")}>Ir</button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                        <span>Atalhos de teclado:</span>
                        <kbd className="bg-gray-100 px-2 py-1 rounded border">Alt+1</kbd>
                        <kbd className="bg-gray-100 px-2 py-1 rounded border">Alt+2</kbd>
                        <kbd className="bg-gray-100 px-2 py-1 rounded border">Alt+3</kbd>
                        <kbd className="bg-gray-100 px-2 py-1 rounded border">Alt+4</kbd>
                      </div>
                    </div>
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