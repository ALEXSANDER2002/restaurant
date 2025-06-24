"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Clock, Utensils, Leaf } from "lucide-react"
import { motion } from "framer-motion"
import { useTema } from "@/components/provedor-tema"
import { cn } from "@/lib/utils"

interface CardapioItem {
  id: string
  dia_semana: string
  prato_principal: string
  acompanhamentos: string
  saladas: string
  sobremesa: string
  opcao_vegetariana: string
  observacoes?: string
}

const diasSemana = {
  segunda: "Segunda-feira",
  terca: "Terça-feira", 
  quarta: "Quarta-feira",
  quinta: "Quinta-feira",
  sexta: "Sexta-feira"
}

export default function CardapioPage() {
  const [cardapio, setCardapio] = useState<CardapioItem[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const { contraste } = useTema()

  useEffect(() => {
    const buscarCardapio = async () => {
      try {
        const response = await fetch("/api/cardapio")
        const data = await response.json()
        
        if (data.sucesso) {
          setCardapio(data.data)
        } else {
          setErro("Erro ao carregar cardápio")
        }
      } catch (error) {
        setErro("Erro ao conectar com o servidor")
      } finally {
        setCarregando(false)
      }
    }

    buscarCardapio()
  }, [])

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando cardápio...</p>
        </div>
      </div>
    )
  }

  if (erro) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-lg mb-4">⚠️ {erro}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-blue-600 underline"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "min-h-screen py-12",
      contraste === "alto" ? "bg-black text-white" : "bg-gradient-to-br from-blue-50 to-white"
    )}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "text-4xl font-bold mb-4",
              contraste === "alto" ? "text-white" : "text-[#0B2F67]"
            )}
          >
            <Utensils className="inline-block mr-3 h-10 w-10" />
            Cardápio da Semana
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={cn(
              "text-lg max-w-2xl mx-auto",
              contraste === "alto" ? "text-white/80" : "text-gray-600"
            )}
          >
            Confira as refeições planejadas para esta semana no Restaurante Universitário
          </motion.p>
        </div>

        {/* Grid do Cardápio */}
        {cardapio.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-semibold mb-2">Cardápio não disponível</h2>
            <p className="text-gray-600">O cardápio desta semana ainda não foi publicado.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cardapio.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={cn(
                  "h-full shadow-lg hover:shadow-xl transition-shadow duration-300",
                  contraste === "alto" ? "bg-black border-2 border-white" : "bg-white"
                )}>
                  <CardHeader className={cn(
                    "pb-4",
                    contraste === "alto" ? "bg-black" : "bg-gradient-to-r from-[#0B2F67] to-[#001B44] text-white"
                  )}>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      {diasSemana[item.dia_semana as keyof typeof diasSemana]}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm uppercase tracking-wide text-gray-500 mb-2">
                        Prato Principal
                      </h4>
                      <p className="font-medium">{item.prato_principal}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm uppercase tracking-wide text-gray-500 mb-2">
                        Acompanhamentos
                      </h4>
                      <p className="text-sm">{item.acompanhamentos}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm uppercase tracking-wide text-gray-500 mb-2">
                        Saladas
                      </h4>
                      <p className="text-sm">{item.saladas}</p>
                    </div>

                    {item.opcao_vegetariana && (
                      <div className="border-t pt-3">
                        <Badge variant="secondary" className="mb-2">
                          <Leaf className="h-3 w-3 mr-1" />
                          Opção Vegetariana
                        </Badge>
                        <p className="text-sm">{item.opcao_vegetariana}</p>
                      </div>
                    )}

                    <div className="pt-3 border-t">
                      <h4 className="font-semibold text-xs uppercase tracking-wide text-gray-500 mb-2">
                        Sobremesa
                      </h4>
                      <p className="text-sm">{item.sobremesa}</p>
                    </div>

                    {item.observacoes && (
                      <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                        <p className="text-sm text-yellow-800">
                          <strong>Observação:</strong> {item.observacoes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Informações adicionais */}
        <div className="mt-16 text-center">
          <Card className={cn(
            "max-w-4xl mx-auto",
            contraste === "alto" ? "bg-black border-2 border-white" : "bg-white shadow-lg"
          )}>
            <CardHeader>
              <CardTitle className={cn(
                "text-2xl",
                contraste === "alto" ? "text-white" : "text-[#0B2F67]"
              )}>
                Informações Importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="text-left space-y-4">
              <div>
                <strong>Horário de funcionamento:</strong>
                <p className="text-sm text-gray-600 mt-1">
                  Segunda a sexta-feira: 11h00 às 14h00
                </p>
              </div>
              <div>
                <strong>Valores:</strong>
                <p className="text-sm text-gray-600 mt-1">
                  Estudantes Subsidiados: R$ 2,00 | Não Subsidiados/Visitantes: R$ 13,00
                </p>
              </div>
              <div>
                <strong>Como comprar:</strong>
                <p className="text-sm text-gray-600 mt-1">
                  Faça login no sistema e adquira seus tickets digitais com antecedência
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 