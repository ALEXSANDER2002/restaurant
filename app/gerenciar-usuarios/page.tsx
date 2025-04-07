import GerenciadorUsuariosLocal from "@/components/gerenciador-usuarios-local"

export default function PaginaGerenciarUsuarios() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Gerenciar Usuários Locais</h1>
      <GerenciadorUsuariosLocal />
    </div>
  )
}

