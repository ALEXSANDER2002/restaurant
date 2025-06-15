'use client'
import React from "react";
import Link from "next/link";
import { useTema } from "./provedor-tema";
import { Eye, Accessibility, Contrast } from "lucide-react";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function HeaderUNIFESSPACompleto() {
  const { contraste, alterarContraste } = useTema();
  const [vLibrasCarregado, setVLibrasCarregado] = useState(false);

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

  return (
    <>
      {/* Barra de acessibilidade/topo */}
      <div className="bg-[#071D41] text-white py-2 border-b border-[#1351B4]/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="relative group" id="accessibility-menu">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className="flex items-center gap-2 bg-[#1351B4] hover:bg-[#2670E8] transition-colors px-3 py-1.5 rounded-md text-sm font-medium"
                      aria-expanded="false"
                      aria-haspopup="true"
                    >
                      <i className="fas fa-universal-access text-base" aria-hidden="true"></i>
                      <span>Acessibilidade</span>
                      <i className="fas fa-chevron-down text-xs ml-1" aria-hidden="true"></i>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent sideOffset={6} align="start" className="bg-white dark:bg-gray-800">
                    <DropdownMenuLabel className="text-xs font-semibold text-gray-600 dark:text-gray-400">
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
                      <a href="#conteudo-principal" className="flex items-center gap-2">
                        <Accessibility className="h-4 w-4" />
                        <span>Ir para conteúdo</span>
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <a href="#main-content" className="text-white/80 hover:text-white transition-colors text-xs flex items-center gap-1 bg-white/10 hover:bg-white/15 px-2 py-1 rounded">
                <i className="fas fa-arrow-down text-[0.6rem]" aria-hidden="true"></i>
                <span>Ir para conteúdo</span>
              </a>
              <a href="#search-systems" className="text-white/80 hover:text-white transition-colors text-xs flex items-center gap-1 bg-white/10 hover:bg-white/15 px-2 py-1 rounded">
                <i className="fas fa-search text-[0.6rem]" aria-hidden="true"></i>
                <span>Ir para busca</span>
              </a>
            </div>
            <div className="flex items-center gap-2">
              <a href="#" className="hover:text-white transition-colors flex items-center gap-1">
                <i className="fas fa-question-circle" aria-hidden="true"></i>
                <span>Ajuda</span>
              </a>
              <a href="#" className="hover:text-white transition-colors flex items-center gap-1">
                <i className="fas fa-headset" aria-hidden="true"></i>
                <span>Suporte</span>
              </a>
              <div className="bg-white/10 px-3 py-1 rounded text-white/90">
                <span>Teclas de atalho: Alt + 1 (conteúdo), Alt + 2 (menu), Alt + 3 (busca), Alt + 4 (contraste)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra institucional */}
      <header className="sticky top-0 z-30 shadow-md">
        <div className="bg-gradient-to-r from-[#071D41] to-[#0B2B5B] text-white">
          <div className="container mx-auto py-4 px-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <img
                    src="Sirus-logo.svg"
                    alt="Logo UNIFESSPA"
                    className="h-12 w-auto rounded-sm shadow-md group-hover:shadow-lg transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 rounded-sm transition-opacity duration-300"></div>
                </div>
                <div className="border-l-2 border-[#2670E8]/40 pl-4">
                  <div className="text-xs font-medium text-white/80 tracking-wider">UNIFESSPA</div>
                  <div className="font-bold text-sm md:text-base tracking-wide">Universidade Federal do Sul e Sudeste do Pará</div>
                  <div className="hidden md:block text-xs text-white/60 mt-0.5">Sistemas Institucionais</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-3">
                  <a href="#" className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-1">
                    {/* Espaço reservado para links futuros */}
                  </a>
                  <div className="h-5 border-r border-white/20"></div>
                </div>
                <div className="flex items-center bg-white/10 hover:bg-white/15 transition-colors rounded-md px-3 py-1.5 gov-br-logo">
                  <span className="text-sm font-bold mr-1">gov</span>
                  <span className="text-sm font-bold text-yellow-400">.br</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <nav aria-label="Trilha de navegação" className="flex items-center justify-between">
            <ol className="flex items-center text-sm">
              <li>
                <Link href="/" className="flex items-center text-[#1351B4] hover:text-[#2670E8] transition-colors">
                  <i className="fas fa-home mr-1" aria-hidden="true"></i>
                  <span>Página Inicial</span>
                </Link>
              </li>
              <li className="flex items-center">
                <i className="fas fa-chevron-right text-gray-400 mx-2 text-xs" aria-hidden="true"></i>
                <span className="font-medium text-gray-700" aria-current="page">
                  Sistemas Institucionais
                </span>
              </li>
            </ol>
          </nav>
        </div>
      </div>
    </>
  );
} 