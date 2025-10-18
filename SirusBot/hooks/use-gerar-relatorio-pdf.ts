import { useCallback } from 'react'
import jsPDF from 'jspdf'

// Importar autoTable dinamicamente
let autoTable: any = null
if (typeof window !== 'undefined') {
  try {
    autoTable = require('jspdf-autotable')
  } catch (e) {
    console.warn('jspdf-autotable não carregado:', e)
  }
}

// Estender o tipo jsPDF para incluir autoTable
interface ExtendedJsPDF extends jsPDF {
  autoTable: (options: any) => ExtendedJsPDF
  lastAutoTable: {
    finalY: number
  }
}

interface EstatisticasData {
  periodo: string
  totalVendas: number
  valorTotal: number
  ticketsSubsidiados: number
  ticketsNaoSubsidiados: number
  statusStats: {
    pagos: number
    pendentes: number
    cancelados: number
  }
  topUsuarios: { nome: string; quantidade: number }[]
  tickets: any[]
}

export function useGerarRelatorioPDF() {
  const gerarPDF = useCallback((dados: EstatisticasData) => {
    try {
      // Criar novo documento PDF
      const doc = new jsPDF()
      
      // Configurar fonte
      doc.setFont('helvetica')
      
      // Cabeçalho
      doc.setFontSize(20)
      doc.setTextColor(11, 47, 103) // Cor azul do tema
      doc.text('SIRUS - Sistema Integrado de Restaurante Universitário', 20, 25)
      
      doc.setFontSize(16)
      doc.setTextColor(0, 0, 0)
      doc.text(`Relatório de Vendas - ${dados.periodo.charAt(0).toUpperCase() + dados.periodo.slice(1)}`, 20, 35)
      
      // Data de geração
      const dataAtual = new Date().toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(`Gerado em: ${dataAtual}`, 20, 45)
      
      // Linha separadora
      doc.setDrawColor(11, 47, 103)
      doc.setLineWidth(0.5)
      doc.line(20, 50, 190, 50)
      
      // Resumo Executivo
      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.text('Resumo Executivo', 20, 65)
      
      // Dados do resumo
      doc.setFontSize(11)
      let yPos = 80
      
      const resumoItems = [
        ['Total de Vendas', `${dados.totalVendas} tickets`],
        ['Receita Total', `R$ ${dados.valorTotal.toFixed(2)}`],
        ['Tickets Subsidiados', `${dados.ticketsSubsidiados} (R$ 2,00 cada)`],
        ['Tickets Não Subsidiados', `${dados.ticketsNaoSubsidiados} (R$ 13,00 cada)`],
        ['Tickets Pagos', `${dados.statusStats.pagos}`],
        ['Tickets Pendentes', `${dados.statusStats.pendentes}`],
        ['Tickets Cancelados', `${dados.statusStats.cancelados}`]
      ]
      
      resumoItems.forEach(([label, value]) => {
        doc.setTextColor(0, 0, 0)
        doc.text(`• ${label}:`, 25, yPos)
        doc.setTextColor(50, 50, 50)
        doc.text(value, 100, yPos)
        yPos += 12
      })
      
      yPos += 10
      
      // Top Usuários
      if (dados.topUsuarios.length > 0) {
        doc.setFontSize(14)
        doc.setTextColor(0, 0, 0)
        doc.text('Top Usuários', 20, yPos)
        yPos += 15
        
        doc.setFontSize(11)
        dados.topUsuarios.slice(0, 10).forEach((usuario, index) => {
          doc.setTextColor(0, 0, 0)
          doc.text(`${index + 1}. ${usuario.nome}:`, 25, yPos)
          doc.setTextColor(50, 50, 50)
          doc.text(`${usuario.quantidade} ticket${usuario.quantidade > 1 ? 's' : ''}`, 120, yPos)
          yPos += 10
        })
        
        yPos += 10
      }
      
      // Detalhamento de Tickets
      if (dados.tickets.length > 0) {
        // Verificar se precisa de nova página
        if (yPos > 200) {
          doc.addPage()
          yPos = 25
        }
        
        doc.setFontSize(14)
        doc.setTextColor(0, 0, 0)
        doc.text('Detalhamento de Tickets', 20, yPos)
        yPos += 15
        
        doc.setFontSize(9)
        dados.tickets.slice(0, 15).forEach((ticket, index) => {
          if (yPos > 270) {
            doc.addPage()
            yPos = 25
          }
          
          const ticketInfo = [
            `ID: ${ticket.id.substring(0, 8)}...`,
            `Usuário: ${ticket.nome || 'N/A'}`,
            `Data: ${new Date(ticket.created_at).toLocaleDateString('pt-BR')}`,
            `Valor: R$ ${parseFloat(ticket.valor_total).toFixed(2)}`,
            `Subsidiado: ${ticket.subsidiado ? 'Sim' : 'Não'}`,
            `Status: ${ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}`
          ]
          
          doc.setTextColor(0, 0, 0)
          doc.text(`Ticket ${index + 1}:`, 20, yPos)
          yPos += 8
          
          ticketInfo.forEach(info => {
            doc.setTextColor(50, 50, 50)
            doc.text(`  ${info}`, 25, yPos)
            yPos += 6
          })
          
          yPos += 5
        })
        
        if (dados.tickets.length > 15) {
          doc.setFontSize(8)
          doc.setTextColor(100, 100, 100)
          doc.text(`Mostrando os primeiros 15 de ${dados.tickets.length} tickets`, 20, yPos + 10)
        }
      }
      
      // Rodapé
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(100, 100, 100)
        doc.text(
          'SIRUS - Relatório gerado automaticamente',
          20,
          doc.internal.pageSize.height - 10
        )
        doc.text(
          `Página ${i} de ${pageCount}`,
          doc.internal.pageSize.width - 50,
          doc.internal.pageSize.height - 10
        )
      }
      
      // Salvar o PDF
      const nomeArquivo = `relatorio-sirus-${dados.periodo}-${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(nomeArquivo)
      
      return true
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      return false
    }
  }, [])

  return { gerarPDF }
} 