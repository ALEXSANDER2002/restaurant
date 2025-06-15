"use client"

import "keen-slider/keen-slider.min.css"
import { useKeenSlider } from "keen-slider/react"
import { Quote } from "lucide-react"
import { motion } from "framer-motion"
import { useRef, useEffect } from "react"

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
  const [sliderInstance] = useKeenSlider<HTMLDivElement>({
    loop: true,
    dragSpeed: 0.8,
    slides: { perView: 1 } as any,
    breakpoints: {
      "(min-width: 768px)": { 
        slides: { 
          perView: 2,
          // Adicionamos espaçamento apenas ENTRE os slides, não nas bordas
          origin: "center",
          spacing: 24
        } 
      } as any,
      "(min-width: 1024px)": { 
        slides: { 
          perView: 3,
          // Espaçamento maior no desktop
          origin: "center",
          spacing: 32
        } 
      } as any,
    },
    created(s: any) {
      setInterval(() => s.next(), 5000)
    },
  } as any)

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
    <div ref={sliderRef} className="keen-slider">
      {depoimentos.map((d, i) => (
        <motion.blockquote
          key={i}
          className="keen-slider__slide depoimento-card bg-white rounded-lg shadow-md p-6 relative"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Quote className="absolute -top-3 -left-3 h-8 w-8 text-[#FFD200]" />
          <div className="flex flex-col h-full">
            <p className="text-gray-700 italic mb-4">“{d.texto}”</p>
            <cite className="not-italic font-semibold text-[#0B2F67] mt-auto">{d.nome}</cite>
          </div>
        </motion.blockquote>
      ))}
    </div>
  )
}