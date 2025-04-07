"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, ClipboardList, Users, QrCode, Database, Settings } from "lucide-react"

export function MenuAdmin() {
  const pathname = usePathname()

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/pedidos", label: "Pedidos", icon: ClipboardList },
    { href: "/admin/usuarios", label: "Usuários", icon: Users },
    { href: "/admin/validar-tickets", label: "Validar Tickets", icon: QrCode },
    { href: "/admin/database", label: "Banco de Dados", icon: Database },
    { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
  ]

  return (
    <nav className="space-y-1">
      {links.map((link) => {
        const Icon = link.icon
        const isActive = pathname === link.href

        return (
          <Link key={link.href} href={link.href} passHref>
            <Button
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start",
                isActive ? "bg-primary text-primary-foreground" : "hover:bg-primary/10",
              )}
            >
              <Icon className="mr-2 h-4 w-4" />
              {link.label}
            </Button>
          </Link>
        )
      })}
    </nav>
  )
}

