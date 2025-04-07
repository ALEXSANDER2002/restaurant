"use client"

import { useState, useEffect } from "react"
import { useRealtimeSync } from "@/hooks/use-realtime-sync"
import { useAuth } from "@/contexts/auth-context"
import { useFeedback } from "@/components/feedback-usuario"
import { Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Notificacao {
  id: string
  tipo: "novo_pedido" | "atualizacao_status" | "sistema"
  mensagem: string
  data: Date
  lida: boolean
  dados?: any
}

export function NotificacaoTempoReal() {
  const { perfil } = useAuth()
  const { mostrarFeedback } = useFeedback()
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [naoLidas, setNaoLidas] = useState(0)

  // Apenas administradores devem receber notificações de novos pedidos
  const isAdmin = perfil?.tipo === "admin"

  // Configurar sincronização em tempo real para tickets
  useRealtimeSync({
    table: "tickets",
    event: "*",
    onInsert: (payload) => {
      if (isAdmin) {
        // Criar notificação para novo pedido
        const novoPedido = payload.new
        adicionarNotificacao({
          tipo: "novo_pedido",
          mensagem: `Novo pedido recebido: ${novoPedido.id}`,
          dados: novoPedido,
        })
      }
    },
    onUpdate: (payload) => {
      // Notificação para estudante quando seu pedido for atualizado
      if (!isAdmin && payload.new.usuario_id === perfil?.id && payload.old.status !== payload.new.status) {
        adicionarNotificacao({
          tipo: "atualizacao_status",
          mensagem: `Seu pedido ${payload.new.id} foi ${payload.new.status === "pago" ? "confirmado" : "cancelado"}`,
          dados: payload.new,
        })
      }
    },
  })

  // Função para adicionar uma nova notificação
  const adicionarNotificacao = ({
    tipo,
    mensagem,
    dados,
  }: { tipo: Notificacao["tipo"]; mensagem: string; dados?: any }) => {
    const novaNotificacao: Notificacao = {
      id: `notif_${Date.now()}`,
      tipo,
      mensagem,
      data: new Date(),
      lida: false,
      dados,
    }

    setNotificacoes((prev) => [novaNotificacao, ...prev])
    setNaoLidas((prev) => prev + 1)

    // Mostrar feedback
    mostrarFeedback(mensagem, tipo === "novo_pedido" ? "info" : tipo === "atualizacao_status" ? "sucesso" : "info")

    // Reproduzir som de notificação (opcional)
    try {
      const audio = new Audio("/notification.mp3")
      audio.play()
    } catch (e) {
      console.log("Erro ao reproduzir som:", e)
    }
  }

  // Marcar todas as notificações como lidas
  const marcarTodasComoLidas = () => {
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })))
    setNaoLidas(0)
  }

  // Marcar uma notificação como lida
  const marcarComoLida = (id: string) => {
    setNotificacoes((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)))
    setNaoLidas((prev) => Math.max(0, prev - 1))
  }

  // Limpar notificações antigas (mais de 24 horas)
  useEffect(() => {
    const limparNotificacoesAntigas = () => {
      const agora = new Date()
      const limite = new Date(agora.getTime() - 24 * 60 * 60 * 1000) // 24 horas atrás

      setNotificacoes((prev) => {
        const novasNotificacoes = prev.filter((n) => n.data > limite)
        // Recalcular não lidas
        const novasNaoLidas = novasNotificacoes.filter((n) => !n.lida).length
        setNaoLidas(novasNaoLidas)
        return novasNotificacoes
      })
    }

    // Limpar notificações antigas a cada hora
    const interval = setInterval(limparNotificacoesAntigas, 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  // Persistir notificações no localStorage
  useEffect(() => {
    // Carregar notificações do localStorage
    const notificacoesArmazenadas = localStorage.getItem("notificacoes")
    if (notificacoesArmazenadas) {
      try {
        const parsed = JSON.parse(notificacoesArmazenadas)
        // Converter strings de data para objetos Date
        const notificacoesConvertidas = parsed.map((n: any) => ({
          ...n,
          data: new Date(n.data),
        }))
        setNotificacoes(notificacoesConvertidas)
        setNaoLidas(notificacoesConvertidas.filter((n: Notificacao) => !n.lida).length)
      } catch (e) {
        console.error("Erro ao carregar notificações:", e)
      }
    }
  }, [])

  // Salvar notificações no localStorage quando mudar
  useEffect(() => {
    if (notificacoes.length > 0) {
      localStorage.setItem("notificacoes", JSON.stringify(notificacoes))
    }
  }, [notificacoes])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {naoLidas > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white">
              {naoLidas}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Notificações</h3>
          {naoLidas > 0 && (
            <Button variant="ghost" size="sm" onClick={marcarTodasComoLidas}>
              Marcar todas como lidas
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notificacoes.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">Nenhuma notificação</div>
          ) : (
            <ul className="divide-y">
              {notificacoes.map((notificacao) => (
                <li
                  key={notificacao.id}
                  className={`p-3 hover:bg-muted/50 ${!notificacao.lida ? "bg-blue-50" : ""}`}
                  onClick={() => marcarComoLida(notificacao.id)}
                >
                  <div className="flex justify-between items-start">
                    <p className={`text-sm ${!notificacao.lida ? "font-medium" : ""}`}>{notificacao.mensagem}</p>
                    {!notificacao.lida && <Badge className="bg-blue-500 text-white">Nova</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(notificacao.data, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

