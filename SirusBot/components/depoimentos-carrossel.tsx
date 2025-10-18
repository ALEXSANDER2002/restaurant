"use client"

import "keen-slider/keen-slider.min.css"
import { useKeenSlider, KeenSliderInstance } from "keen-slider/react"
import { Quote } from "lucide-react"
import { motion } from "framer-motion"
import { useRef, useEffect, useCallback, useState } from "react"

interface Depoimento {
  nome: string
  texto: string
}

const depoimentos: Depoimento[] = [
  { nome: "Ana, Estudante", texto: "O RU salvou meu orçamento. A comida é ótima e o aplicativo facilita muito!" },
  { nome: "Carlos, Professor", texto: "Praticidade na compra e rapidez no atendimento. Excelente iniciativa!" },
  { nome: "Mariana, Servidora", texto: "Adoro a variedade do cardápio e a opção de pratos vegetarianos." },
]

export function DepoimentosCarrossel() {
  const sliderRef = useRef<HTMLDivElement | null>(null)
  const sliderInstance = useRef<any>(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [setKeenSlider] = useKeenSlider<HTMLDivElement>({
    loop: true,
    dragSpeed: 0.8,
    slides: { perView: 1 } as any,
    breakpoints: {
      "(min-width: 768px)": {
        slides: {
          perView: 2,
          origin: "center",
          spacing: 24,
        },
      } as any,
      "(min-width: 1024px)": {
        slides: {
          perView: 3,
          origin: "center",
          spacing: 32,
        },
      } as any,
    },
    created(s) {
      sliderInstance.current = s;
    },
    slideChanged(s) {
      setCurrentIdx(s.track.details.rel);
    },
  })

  // Auto play
  useEffect(() => {
    if (!sliderInstance.current) return;
    const interval = setInterval(() => {
      const total = depoimentos.length;
      let nextIdx = (currentIdx + 1) % total;
      sliderInstance.current.moveToIdx(nextIdx);
    }, 3500);
    return () => clearInterval(interval);
  }, [currentIdx]);

  // Efeito para garantir que todos os cards tenham a mesma altura
  useEffect(() => {
    const updateCardHeights = () => {
      const cards = sliderRef.current?.querySelectorAll('.depoimento-card');
      if (!cards || cards.length === 0) return;
      
      let maxHeight = 0;
      cards.forEach(card => {
        const height = card.getBoundingClientRect().height;
        if (height > maxHeight) maxHeight = height;
      });
      
      cards.forEach(card => {
        (card as HTMLElement).style.minHeight = `${maxHeight}px`;
      });
    };

    updateCardHeights();
    window.addEventListener('resize', updateCardHeights);
    
    return () => window.removeEventListener('resize', updateCardHeights);
  }, []);

  return (
    <div className="relative w-full">
      <div ref={node => { setKeenSlider(node); sliderRef.current = node; }} className="keen-slider">
        {depoimentos.map((d, i) => (
          <motion.blockquote
            key={i}
            className="keen-slider__slide depoimento-card bg-white rounded-lg shadow-md p-4 sm:p-6 relative mx-2 min-w-[85vw] max-w-[95vw] sm:min-w-[320px] sm:max-w-[380px] flex flex-col justify-between"
            style={{ boxSizing: 'border-box' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <Quote className="absolute -top-3 -left-3 h-7 w-7 sm:h-8 sm:w-8 text-[#FFD200]" />
            <div className="flex flex-col h-full">
              <p className="text-gray-700 italic mb-3 sm:mb-4 text-sm sm:text-base leading-snug sm:leading-normal">“{d.texto}”</p>
              <cite className="not-italic font-semibold text-[#0B2F67] mt-auto text-xs sm:text-base">{d.nome}</cite>
            </div>
          </motion.blockquote>
        ))}
      </div>
      {/* Setas de navegação */}
      <button
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-[#0B2F67] rounded-full p-2 shadow transition disabled:opacity-40"
        onClick={() => sliderInstance.current?.prev()}
        aria-label="Anterior"
        disabled={!sliderInstance.current}
        style={{ display: 'block' }}
      >
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <button
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-[#0B2F67] rounded-full p-2 shadow transition disabled:opacity-40"
        onClick={() => sliderInstance.current?.next()}
        aria-label="Próximo"
        disabled={!sliderInstance.current}
        style={{ display: 'block' }}
      >
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      {/* Indicadores (bolinhas) */}
      <div className="flex justify-center gap-2 mt-3">
        {depoimentos.map((_, idx) => (
          <button
            key={idx}
            className={
              "w-2.5 h-2.5 rounded-full transition-all " +
              (currentIdx === idx ? "bg-[#0B2F67] scale-110" : "bg-gray-300 hover:bg-[#0B2F67]/60")
            }
            aria-label={`Ir para depoimento ${idx + 1}`}
            onClick={() => sliderInstance.current?.moveToIdx(idx)}
          />
        ))}
      </div>
    </div>
  )
}