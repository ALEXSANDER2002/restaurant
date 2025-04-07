"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

// Tipo para usuários locais
interface UsuarioLocal {
  id: string
  nome: string
  email: string
  senha: string
  tipo: "admin" | "usuario" | "caixa"
}

type LoginFormValues = {
  email: string
  senha: string
  lembrar: boolean
}

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  lembrar: z.boolean().default(false),
})

export function LoginAlternativo() {
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [usuarios, setUsuarios] = useState<UsuarioLocal[]>([])
  const router = useRouter()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      senha: "",
      lembrar: false,
    },
  })

  // Carregar usuários do localStorage
  useEffect(() => {
    const usuariosArmazenados = localStorage.getItem("usuariosLocais")
    if (usuariosArmazenados) {
      try {
        setUsuarios(JSON.parse(usuariosArmazenados))
      } catch (e) {
        console.error("Erro ao carregar usuários locais:", e)
        // Inicializar com usuários padrão se houver erro
        inicializarUsuariosPadrao()
      }
    } else {
      // Inicializar com usuários padrão
      inicializarUsuariosPadrao()
    }
  }, [])

  const inicializarUsuariosPadrao = () => {
    const usuariosPadrao: UsuarioLocal[] = [
      {
        id: "admin-id-123456",
        nome: "Administrador",
        email: "admin@exemplo.com",
        senha: "admin123",
        tipo: "admin",
      },
      {
        id: "estudante-id-123456",
        nome: "Estudante Exemplo",
        email: "estudante@exemplo.com",
        senha: "senha123",
        tipo: "usuario",
      },
    ]
    setUsuarios(usuariosPadrao)
    localStorage.setItem("usuariosLocais", JSON.stringify(usuariosPadrao))
  }

  const onSubmit = async (values: LoginFormValues) => {
    setErro(null)
    setCarregando(true)

    try {
      // Verificar credenciais contra os usuários locais
      const usuario = usuarios.find((u) => u.email === values.email && u.senha === values.senha)

      if (!usuario) {
        setErro("Credenciais inválidas")
        setCarregando(false)
        return
      }

      // Login bem-sucedido - armazenar informações do usuário (sem a senha)
      const sessionData = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
        // Adicionar timestamp de expiração (24 horas)
        expira: Date.now() + 24 * 60 * 60 * 1000,
      }

      // Armazenar dados da sessão
      localStorage.setItem("usuarioAtual", JSON.stringify(sessionData))

      // Redirecionar com base no tipo de usuário
      if (usuario.tipo === "admin") {
        router.push("/admin")
      } else if (usuario.tipo === "usuario") {
        router.push("/usuario")
      } else if (usuario.tipo === "caixa") {
        router.push("/caixa")
      } else {
        router.push("/")
      }
    } catch (error: any) {
      console.error("Erro no login alternativo:", error)
      setErro("Erro ao processar login. Verifique suas credenciais e tente novamente.")
    } finally {
      setCarregando(false)
    }
  }

  return (
    <>
      <Alert className="mb-4 bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-700">
          Este método de login funciona mesmo quando há problemas com o banco de dados.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {erro && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{erro}</AlertDescription>
            </Alert>
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="admin@exemplo.com ou estudante@exemplo.com"
                    autoComplete="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="senha"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="admin123 ou senha123"
                    autoComplete="current-password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={carregando}>
            {carregando ? "Entrando..." : "Entrar (Método Alternativo)"}
          </Button>

          <div className="text-sm text-muted-foreground mt-2">
            <p>Credenciais de exemplo:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>Admin: admin@exemplo.com / admin123</li>
              <li>Estudante: estudante@exemplo.com / senha123</li>
            </ul>
          </div>
        </form>
      </Form>
    </>
  )
}

