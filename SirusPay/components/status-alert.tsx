"use client"

import { AlertCircle, Info, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useState } from "react"

type StatusAlertProps = {
  type: "error" | "warning" | "info" | "success"
  title?: string
  message: string
  dismissible?: boolean
  onRetry?: () => void
}

export function StatusAlert({ type, title, message, dismissible = true, onRetry }: StatusAlertProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const icons = {
    error: <AlertCircle className="h-4 w-4" />,
    warning: <AlertCircle className="h-4 w-4" />,
    info: <Info className="h-4 w-4" />,
    success: <CheckCircle className="h-4 w-4" />,
  }

  const variants = {
    error: "destructive",
    warning: "warning",
    info: "default",
    success: "success",
  } as const

  return (
    <Alert variant={variants[type]} className="mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2">
          {icons[type]}
          <div>
            {title && <AlertTitle>{title}</AlertTitle>}
            <AlertDescription>{message}</AlertDescription>
          </div>
        </div>
        <div className="flex gap-2">
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} className="h-7 px-2 text-xs">
              Tentar novamente
            </Button>
          )}
          {dismissible && (
            <Button variant="ghost" size="sm" onClick={() => setDismissed(true)} className="h-7 px-2 text-xs">
              Fechar
            </Button>
          )}
        </div>
      </div>
    </Alert>
  )
}

