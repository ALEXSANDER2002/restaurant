import { InicializadorBancoDados } from "@/components/inicializador-banco-dados"

export default function PaginaInicializarBanco() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Inicialização do Banco de Dados</h1>
      <div className="max-w-2xl mx-auto">
        <InicializadorBancoDados />
      </div>
    </div>
  )
}

