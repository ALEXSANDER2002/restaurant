"use client"

import type { ReactNode } from "react"
import { Loading } from "@/components/ui/loading"

interface ChartContainerProps {
  children: ReactNode
  height?: number
  isLoading?: boolean
  isEmpty?: boolean
  emptyMessage?: string
}

export function ChartContainer({
  children,
  height = 300,
  isLoading = false,
  isEmpty = false,
  emptyMessage = "Nenhum dado disponível",
}: ChartContainerProps) {
  return (
    <div
      className="w-full relative transition-all duration-300 ease-in-out"
      style={{
        height: `${height}px`,
        minHeight: `${height}px`,
      }}
    >
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loading size="md" text="Carregando dados..." />
        </div>
      ) : isEmpty ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <div className="w-full h-full overflow-hidden rounded-md">{children}</div>
      )}
    </div>
  )
}

