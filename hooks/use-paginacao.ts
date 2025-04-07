import { useState, useMemo } from "react"

interface UsePaginacaoProps<T> {
  dados: T[]
  itensPorPagina: number
}

interface UsePaginacaoRetorno<T> {
  dadosPaginados: T[]
  paginaAtual: number
  setPaginaAtual: (pagina: number) => void
  totalPaginas: number
  primeiraPagina: () => void
  ultimaPagina: () => void
  proximaPagina: () => void
  paginaAnterior: () => void
  indiceInicial: number
  indiceFinal: number
  totalItens: number
}

export function usePaginacao<T>({ dados, itensPorPagina }: UsePaginacaoProps<T>): UsePaginacaoRetorno<T> {
  const [paginaAtual, setPaginaAtual] = useState(1)

  const totalPaginas = Math.ceil(dados.length / itensPorPagina)
  const indiceInicial = (paginaAtual - 1) * itensPorPagina
  const indiceFinal = Math.min(indiceInicial + itensPorPagina, dados.length)

  const dadosPaginados = useMemo(() => {
    return dados.slice(indiceInicial, indiceFinal)
  }, [dados, indiceInicial, indiceFinal])

  const primeiraPagina = () => setPaginaAtual(1)
  const ultimaPagina = () => setPaginaAtual(totalPaginas)
  const proximaPagina = () => setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))
  const paginaAnterior = () => setPaginaAtual((prev) => Math.max(prev - 1, 1))

  return {
    dadosPaginados,
    paginaAtual,
    setPaginaAtual,
    totalPaginas,
    primeiraPagina,
    ultimaPagina,
    proximaPagina,
    paginaAnterior,
    indiceInicial,
    indiceFinal,
    totalItens: dados.length,
  }
} 