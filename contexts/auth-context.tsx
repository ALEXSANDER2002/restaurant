"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { User, Session } from "@supabase/supabase-js"
import { useFeedback } from "@/components/feedback-usuario"

// Chaves para armazenamento local
const SESSION_STORAGE_KEY = "ru_auth_session"
const USER_STORAGE_KEY = "ru_auth_user"
const PROFILE_STORAGE_KEY = "ru_auth_profile"
const SESSION_EXPIRY_KEY = "ru_auth_expiry"

type UsuarioTipo = "admin" | "usuario" | "caixa" | null

interface PerfilUsuario {
  id: string
  nome: string
  email: string
  tipo_usuario: UsuarioTipo
  status?: "ativo" | "inativo"
}

interface ContextoAutenticacao {
  usuario: User | null
  perfil: PerfilUsuario | null
  carregando: boolean
  entrar: (email: string, senha: string) => Promise<{ erro: string | null }>
  entrarComQRCode: (token: string) => Promise<{ erro: string | null }>
  sair: () => Promise<void>
  verificarLoginAlternativo: () => Promise<boolean>
  verificarSessao: () => Promise<boolean>
  atualizarPerfil: (dados: Partial<PerfilUsuario>) => Promise<{ sucesso: boolean; erro?: string }>
}

// Tipo para usuários locais
interface UsuarioLocal {
  id: string
  nome: string
  email: string
  senha: string
  tipo: "admin" | "usuario" | "caixa" | "estudante"
}

const ContextoAuth = createContext<ContextoAutenticacao | undefined>(undefined)

export function ProvedorAutenticacao({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<User | null>(null)
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [usuariosLocais, setUsuariosLocais] = useState<UsuarioLocal[]>([])
  const [sessao, setSessao] = useState<Session | null>(null)
  const router = useRouter()
  const { mostrarFeedback } = useFeedback()
  const [loading, setLoading] = useState(false)

  // Carregar usuários locais
  useEffect(() => {
    const usuariosArmazenados = localStorage.getItem("usuariosLocais")
    if (usuariosArmazenados) {
      setUsuariosLocais(JSON.parse(usuariosArmazenados))
    } else {
      // Inicializar com usuários padrão
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
          tipo: "estudante",
        },
      ]
      setUsuariosLocais(usuariosPadrao)
      localStorage.setItem("usuariosLocais", JSON.stringify(usuariosPadrao))
    }
  }, [])

  // Função para salvar dados de sessão no localStorage
  const salvarSessaoLocal = useCallback(
    (user: User | null, session: Session | null, userProfile: PerfilUsuario | null) => {
      if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
      } else {
        localStorage.removeItem(USER_STORAGE_KEY)
      }

      if (session) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
        // Calcular e armazenar a data de expiração
        const expiryTime = new Date()
        expiryTime.setSeconds(expiryTime.getSeconds() + session.expires_in)
        localStorage.setItem(SESSION_EXPIRY_KEY, expiryTime.toISOString())
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY)
        localStorage.removeItem(SESSION_EXPIRY_KEY)
      }

      if (userProfile) {
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(userProfile))
      } else {
        localStorage.removeItem(PROFILE_STORAGE_KEY)
      }
    },
    [],
  )

  // Função para carregar dados de sessão do localStorage
  const carregarSessaoLocal = useCallback(() => {
    const userStr = localStorage.getItem(USER_STORAGE_KEY)
    const sessionStr = localStorage.getItem(SESSION_STORAGE_KEY)
    const profileStr = localStorage.getItem(PROFILE_STORAGE_KEY)
    const expiryStr = localStorage.getItem(SESSION_EXPIRY_KEY)

    let user = null
    let session = null
    let profile = null
    let isExpired = true

    if (userStr) {
      try {
        user = JSON.parse(userStr)
      } catch (e) {
        console.error("Erro ao analisar dados do usuário:", e)
      }
    }

    if (sessionStr && expiryStr) {
      try {
        session = JSON.parse(sessionStr)
        const expiryTime = new Date(expiryStr)
        isExpired = expiryTime < new Date()
      } catch (e) {
        console.error("Erro ao analisar dados da sessão:", e)
      }
    }

    if (profileStr) {
      try {
        profile = JSON.parse(profileStr)
      } catch (e) {
        console.error("Erro ao analisar dados do perfil:", e)
      }
    }

    // Se a sessão expirou, limpar os dados
    if (isExpired) {
      localStorage.removeItem(USER_STORAGE_KEY)
      localStorage.removeItem(SESSION_STORAGE_KEY)
      localStorage.removeItem(SESSION_EXPIRY_KEY)
      return { user: null, session: null, profile: null }
    }

    return { user, session, profile }
  }, [])

  // Verificar sessão e configurar listener para mudanças de autenticação
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (evento, session) => {
      console.log("Auth state changed:", evento)

      if (evento === "SIGNED_OUT") {
        setUsuario(null)
        setPerfil(null)
        setSessao(null)
        salvarSessaoLocal(null, null, null)
      } else if (evento === "SIGNED_IN" || evento === "TOKEN_REFRESHED") {
        setUsuario(session?.user || null)
        setSessao(session)

        if (session?.user) {
          const userProfile = await carregarPerfil(session.user.id)
          salvarSessaoLocal(session.user, session, userProfile)
        }
      } else if (evento === "USER_UPDATED") {
        setUsuario(session?.user || null)
        setSessao(session)

        if (session?.user) {
          const userProfile = await carregarPerfil(session.user.id)
          salvarSessaoLocal(session.user, session, userProfile)
        }
      }

      setCarregando(false)
    })

    // Verificar sessão inicial
    verificarUsuario()

    return () => {
      subscription.unsubscribe()
    }
  }, [salvarSessaoLocal, carregarSessaoLocal])

  // Verificar periodicamente se a sessão ainda é válida (a cada 5 minutos)
  useEffect(() => {
    const interval = setInterval(
      async () => {
        if (usuario) {
          const isValid = await verificarSessao()
          if (!isValid) {
            mostrarFeedback("Sua sessão expirou. Por favor, faça login novamente.", "info")
            await sair()
          }
        }
      },
      5 * 60 * 1000,
    ) // 5 minutos

    return () => clearInterval(interval)
  }, [usuario, mostrarFeedback])

  // Verificar validade da sessão armazenada
  useEffect(() => {
    const intervalo = setInterval(() => {
      if (sessao) {
        const agora = new Date()
        // Usar valor seguro para expires_at
        const expiracaoTimestamp = sessao.expires_at || 0
        if (expiracaoTimestamp < agora.getTime() / 1000) {
          console.log("Sessão expirada, realizando logout...")
          sair()
        }
      }
    }, 60000) // verificar a cada minuto

    return () => clearInterval(intervalo)
  }, [sessao])

  // Função para verificar se a sessão ainda é válida
  const verificarSessao = async () => {
    try {
      console.log("Verificando validade da sessão...")
      
      // Verificar dados da sessão
      const usuarioAtualStr = localStorage.getItem("usuarioAtual")
      const perfilStr = localStorage.getItem(PROFILE_STORAGE_KEY)
      
      if (!usuarioAtualStr || !perfilStr) {
        console.log("Dados da sessão não encontrados")
        return false
      }

      const usuarioAtual = JSON.parse(usuarioAtualStr)
      const perfilArmazenado = JSON.parse(perfilStr)

      // Verificar se a sessão expirou
      if (usuarioAtual.expira && usuarioAtual.expira < Date.now()) {
        console.log("Sessão expirada")
        limparDadosSessao()
        return false
      }

      // Se a sessão é válida, restaurar o estado
      setPerfil(perfilArmazenado)
      return true
    } catch (error) {
      console.error("Erro ao verificar sessão:", error)
      limparDadosSessao()
      return false
    }
  }

  // Função para limpar todos os dados da sessão
  const limparDadosSessao = () => {
    localStorage.removeItem("usuarioAtual")
    localStorage.removeItem(PROFILE_STORAGE_KEY)
    localStorage.removeItem(SESSION_EXPIRY_KEY)
    localStorage.removeItem(SESSION_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
    setPerfil(null)
    setUsuario(null)
    setSessao(null)
  }

  async function verificarUsuario() {
    try {
      // Primeiro, verificar login alternativo (modo offline)
      const loginAlternativoValido = await verificarLoginAlternativo()
      
      if (loginAlternativoValido) {
        console.log("Login alternativo válido encontrado")
        return
      }

      // Se não há login alternativo, verificar sessão local
      const { user, session: localSession, profile } = carregarSessaoLocal()

      if (user && localSession && profile) {
        console.log("Sessão local válida encontrada")
        setUsuario(user)
        setSessao(localSession)
        setPerfil(profile)
        return
      }

      // Por último, tentar sessão do Supabase
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        console.log("Sessão Supabase válida encontrada")
        setUsuario(session.user)
        setSessao(session)
        await carregarPerfil(session.user.id)
      }
    } catch (error) {
      console.error("Erro ao verificar usuário:", error)
    } finally {
      setCarregando(false)
    }
  }

  const verificarLoginAlternativo = async () => {
    try {
      console.log("Verificando login alternativo...")
      
      // Verificar dados da sessão em todas as chaves
      const usuarioAlternativoJSON = localStorage.getItem("usuarioAtual")
      const perfilArmazenadoJSON = localStorage.getItem(PROFILE_STORAGE_KEY)
      
      if (!usuarioAlternativoJSON || !perfilArmazenadoJSON) {
        console.log("Dados da sessão incompletos")
        limparDadosSessao()
        return false
      }

      const usuarioAlternativo = JSON.parse(usuarioAlternativoJSON)
      const perfilArmazenado = JSON.parse(perfilArmazenadoJSON)

      console.log("Dados encontrados:", { usuarioAlternativo, perfilArmazenado })

      // Verificar se a sessão expirou
      if (usuarioAlternativo.expira && usuarioAlternativo.expira < Date.now()) {
        console.log("Sessão expirada")
        limparDadosSessao()
        return false
      }

      // Usar o perfil armazenado diretamente, já que ele já está no formato correto
      console.log("Definindo perfil:", perfilArmazenado)
      setPerfil(perfilArmazenado)
      
      // Atualizar estado do usuário
      const usuarioFormatado = {
        id: usuarioAlternativo.id,
        email: usuarioAlternativo.email,
        user_metadata: {
          nome: usuarioAlternativo.nome
        },
        app_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
        role: "authenticated",
        updated_at: new Date().toISOString()
      }
      setUsuario(usuarioFormatado as User)
      
      return true
    } catch (error) {
      console.error("Erro ao verificar login alternativo:", error)
      limparDadosSessao()
      return false
    }
  }

  async function carregarPerfil(userId: string) {
    try {
      // Tentar carregar do Supabase primeiro
      try {
        const { data, error } = await supabase.from("perfis").select("*").eq("id", userId).single()

        if (!error && data) {
          const perfilUsuario = {
            id: data.id,
            nome: data.nome,
            email: data.email,
            tipo_usuario: data.tipo_usuario,
            status: data.status,
          }

          setPerfil(perfilUsuario)
          return perfilUsuario
        }
      } catch (e) {
        console.warn("Erro ao carregar perfil do Supabase:", e)
      }

      // Se falhar, verificar login alternativo
      await verificarLoginAlternativo()
      return perfil
    } catch (error) {
      console.error("Erro ao carregar perfil:", error)
      return null
    }
  }

  // Função temporária de login (modo offline apenas)
  async function entrar(email: string, senha: string) {
    try {
      setCarregando(true)
      
      // Usar apenas login offline para simplificar
      const usuarioEncontrado = usuariosLocais.find(
        (u) => u.email === email && u.senha === senha
      )

      if (!usuarioEncontrado) {
        return { erro: "Credenciais inválidas" }
      }

      // Mapear tipo estudante para usuario se necessário
      const tipo = usuarioEncontrado.tipo === "estudante" ? "usuario" : usuarioEncontrado.tipo

      // Criar perfil do usuário
      const perfilUsuario: PerfilUsuario = {
        id: usuarioEncontrado.id,
        nome: usuarioEncontrado.nome,
        email: usuarioEncontrado.email,
        tipo_usuario: tipo as UsuarioTipo,
        status: "ativo"
      }

      // Criar dados da sessão com expiração de 24 horas
      const expira = Date.now() + 24 * 60 * 60 * 1000

      // Criar usuário formatado para o estado
      const usuarioFormatado = {
        id: usuarioEncontrado.id,
        email: usuarioEncontrado.email,
        user_metadata: {
          nome: usuarioEncontrado.nome
        },
        app_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
        role: "authenticated",
        updated_at: new Date().toISOString()
      }

      // Salvar dados no localStorage
      localStorage.setItem("usuarioAtual", JSON.stringify({ ...usuarioEncontrado, tipo, expira }))
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(perfilUsuario))
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(usuarioFormatado))

      // Atualizar estado
      setPerfil(perfilUsuario)
      setUsuario(usuarioFormatado as User)
      
      // Redirecionar com base no tipo
      if (tipo === "admin") {
        router.push("/admin")
      } else if (tipo === "usuario") {
        router.push("/usuario")
      } else if (tipo === "caixa") {
        router.push("/caixa")
      } else {
        router.push("/")
      }
      
      return { erro: null }
    } catch (error: any) {
      console.error("Erro ao realizar login:", error)
      return { erro: error.message }
    } finally {
      setCarregando(false)
    }
  }

  async function entrarComQRCode(token: string) {
    try {
      setCarregando(true)
      
      // Verificar o token no formato esperado
      if (!token || token.length < 10) {
        return { erro: "QR Code inválido" }
      }
      
      // No modo offline, simular que o token é válido para o usuário estudante
      const usuarioEstudante = usuariosLocais.find(u => u.tipo === "estudante")
      
      if (!usuarioEstudante) {
        return { erro: "Usuário estudante não encontrado no modo offline" }
      }

      // Mapear tipo estudante para usuario
      const tipo = "usuario"
      
      // Criar perfil do usuário
      const perfilUsuario: PerfilUsuario = {
        id: usuarioEstudante.id,
        nome: usuarioEstudante.nome,
        email: usuarioEstudante.email,
        tipo_usuario: tipo as UsuarioTipo,
        status: "ativo"
      }

      // Criar dados da sessão com expiração de 24 horas
      const expira = Date.now() + 24 * 60 * 60 * 1000

      // Criar usuário formatado para o estado
      const usuarioFormatado = {
        id: usuarioEstudante.id,
        email: usuarioEstudante.email,
        user_metadata: {
          nome: usuarioEstudante.nome
        },
        app_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
        role: "authenticated",
        updated_at: new Date().toISOString()
      }

      // Salvar dados no localStorage
      localStorage.setItem("usuarioAtual", JSON.stringify({ ...usuarioEstudante, tipo, expira }))
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(perfilUsuario))
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(usuarioFormatado))

      // Atualizar estado
      setPerfil(perfilUsuario)
      setUsuario(usuarioFormatado as User)
      
      // Redirecionar para a página do usuário
      router.push("/usuario")
      mostrarFeedback("Login realizado com QR Code no modo offline", "info")
      
      return { erro: null }
    } catch (error: any) {
      console.error("Erro ao realizar login com QR Code:", error)
      return { erro: error.message }
    } finally {
      setCarregando(false)
    }
  }

  async function sair() {
    try {
      // Limpar todos os dados de sessão
      localStorage.removeItem("usuarioAtual")
      localStorage.removeItem(PROFILE_STORAGE_KEY)
      localStorage.removeItem(SESSION_EXPIRY_KEY)
      localStorage.removeItem(SESSION_STORAGE_KEY)
      localStorage.removeItem(USER_STORAGE_KEY)

      setPerfil(null)
      setUsuario(null)
      setSessao(null)

      // Sair da autenticação do Supabase
      await supabase.auth.signOut()
      router.push("/")
    } catch (error) {
      console.error("Erro ao sair:", error)
    }
  }

  async function atualizarPerfil(dados: Partial<PerfilUsuario>): Promise<{ sucesso: boolean; erro?: string }> {
    if (!perfil?.id) return { sucesso: false, erro: "Usuário não autenticado" }
    setCarregando(true)

    try {
      // Garantir que tipo_usuario não seja null
      const tipoUsuario = dados.tipo_usuario === null 
        ? undefined 
        : dados.tipo_usuario || perfil.tipo_usuario;
        
      // Preparar dados formatados com tipo seguro
      const dadosFormatados = {
        ...dados,
        tipo_usuario: tipoUsuario === null ? undefined : tipoUsuario
      };

      // Remover tipo_usuario se for null para evitar erro
      if (dadosFormatados.tipo_usuario === null) {
        delete dadosFormatados.tipo_usuario;
      }

      const { data, error } = await supabase
        .from("perfis")
        .update(dadosFormatados)
        .eq("id", perfil.id)
        .select()
        .single()

      if (error) {
        console.warn("Erro ao atualizar perfil:", error)
        return { sucesso: false, erro: error.message }
      }

      // Atualizar o perfil local
      const perfilAtualizado = {
        ...perfil,
        ...dadosFormatados,
        tipo_usuario: tipoUsuario || perfil.tipo_usuario
      } as PerfilUsuario;
      
      setPerfil(perfilAtualizado)

      // Atualizar dados da sessão local
      const { user, session } = carregarSessaoLocal()
      salvarSessaoLocal(user, session, perfilAtualizado)

      return { sucesso: true }
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error)
      return { sucesso: false, erro: error.message }
    } finally {
      setCarregando(false)
    }
  }

  const valor = {
    usuario,
    perfil,
    carregando,
    entrar,
    entrarComQRCode,
    sair,
    verificarLoginAlternativo,
    verificarSessao,
    atualizarPerfil,
  }

  return <ContextoAuth.Provider value={valor}>{children}</ContextoAuth.Provider>
}

export function useAuth() {
  const contexto = useContext(ContextoAuth)

  if (contexto === undefined) {
    throw new Error("useAuth deve ser usado dentro de um ProvedorAutenticacao")
  }

  return contexto
}

