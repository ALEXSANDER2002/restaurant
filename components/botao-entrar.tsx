"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"
import { useIdioma } from "@/contexts/idioma-context"

export function BotaoEntrar() {
  const { t } = useIdioma()

  return (
    <Link href="/login" passHref legacyBehavior>
      <Button as="a" className="gap-2">
        <LogIn className="h-4 w-4" />
        <span>{t("nav.entrar")}</span>
      </Button>
    </Link>
  )
}

