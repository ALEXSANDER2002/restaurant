import { Metadata } from "next"
import { GerenciarCardapio } from "@/components/gerenciar-cardapio"

export const metadata: Metadata = {
  title: "Cardápio | Admin - UNIFESSPA",
  description: "Gerencie o cardápio da semana do restaurante universitário",
}

export default function CardapioAdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <GerenciarCardapio />
    </div>
  )
} 