"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"
import { useIdioma } from "@/contexts/idioma-context"

export function BotaoEntrar() {
  const { t } = useIdioma()

  return (
    <Link href="/login" passHref legacyBehavior>
      <Button className="gap-2" asChild>
        <a>
          <LogIn className="h-4 w-4" />
          <span>{t("nav.entrar")}</span>
        </a>
      </Button>
    </Link>
  )
}

