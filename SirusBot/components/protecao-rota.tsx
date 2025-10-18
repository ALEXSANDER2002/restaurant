"use client"

import type React from "react"

interface ProtecaoRotaProps {
  children: React.ReactNode
}

export function ProtecaoRota({ children }: ProtecaoRotaProps) {
  // Autenticação desativada temporariamente
  return <>{children}</>
}

