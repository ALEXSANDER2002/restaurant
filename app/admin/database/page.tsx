import { AdminDatabase } from "@/components/admin-database"
import { ProtecaoRota } from "@/components/protecao-rota"

export default function PaginaAdminDatabase() {
  return (
    <ProtecaoRota tipoPermitido="admin">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Administração do Banco de Dados</h1>
        <AdminDatabase />
      </div>
    </ProtecaoRota>
  )
}

