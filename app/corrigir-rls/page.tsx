import CorrigirRLS from "@/components/corrigir-rls"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PaginaCorrigirRLS() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Corrigir Políticas RLS</h1>

      <Alert className="mb-6 bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Instruções</AlertTitle>
        <AlertDescription className="text-blue-700">
          <p className="mb-2">
            Esta página ajuda a corrigir o erro de "recursão infinita" nas políticas RLS (Row Level Security) da tabela
            "perfis" no Supabase.
          </p>
          <p className="mb-2">
            Se o botão "Corrigir Políticas RLS" não resolver o problema, você ainda pode usar o sistema através do
            método de login alternativo.
          </p>
          <div className="mt-4">
            <Link href="/login" passHref>
              <Button variant="outline" className="bg-blue-600 text-white hover:bg-blue-700">
                Ir para Login Alternativo
              </Button>
            </Link>
          </div>
        </AlertDescription>
      </Alert>

      <div className="max-w-md mx-auto">
        <CorrigirRLS />
      </div>
    </div>
  )
}

