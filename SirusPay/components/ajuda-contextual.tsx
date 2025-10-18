"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useIdioma } from "@/contexts/idioma-context"

interface AjudaContextualProps {
  titulo: string
  descricao: string | React.ReactNode
  children?: React.ReactNode
}

export function AjudaContextual({ titulo, descricao, children }: AjudaContextualProps) {
  const [aberto, setAberto] = useState(false)
  const { t } = useIdioma()

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-8 w-8 p-0 hover:bg-primary/10"
          aria-label={t("geral.ajuda")}
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>{typeof descricao === "string" ? <p>{descricao}</p> : descricao}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

