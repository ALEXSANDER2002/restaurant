"use client"

import { ValidadorQRIntegrado } from "@/components/validador-qr-integrado"

export default function AdminValidarTicketsPage() {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#0B2F67] mb-2">Validação de Tickets</h1>
        <p className="text-muted-foreground">
          Escaneie o QR code do ticket para validar e debitar o almoço do estudante
        </p>
      </div>

      <ValidadorQRIntegrado />
    </div>
  )
} 