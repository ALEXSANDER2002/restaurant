"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FormularioLogin } from "@/components/formulario-login"
import { LeitorQRCode } from "@/components/leitor-qrcode"
import { useIdioma } from "@/contexts/idioma-context"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export default function PaginaLogin() {
  const { t } = useIdioma()
  const { usuario } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mostrarDemo, setMostrarDemo] = useState(false)

  // Redireciona em efeito para evitar loop de render
  useEffect(() => {
    if (usuario) {
      const next = searchParams?.get("next") || "/usuario"
      router.replace(next)
    }
  }, [usuario, router, searchParams])

  return (
    <section className="flex flex-col flex-1 items-center justify-center bg-white dark:bg-white min-h-[calc(100vh-200px)]">
      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md mb-8 bg-white shadow-xl dark:bg-gray-900">
        <CardHeader>
          <CardTitle>{t("login.titulo")}</CardTitle>
          <CardDescription>{t("login.descricao")}</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="credenciais" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="credenciais">{t("login.credenciais")}</TabsTrigger>
              <TabsTrigger value="qrcode">{t("login.qrcode")}</TabsTrigger>
            </TabsList>
            <TabsContent value="credenciais">
              <FormularioLogin />
            </TabsContent>
            <TabsContent value="qrcode">
              <LeitorQRCode />
              {mostrarDemo && (
                <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-200">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">QR Code de Demonstração:</h3>
                  <div className="flex justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                        JSON.stringify({ email: "estudante@exemplo.com", senha: "senha123" }),
                      )}`}
                      alt="QR Code de demonstração"
                      className="border rounded-md"
                    />
                  </div>
                </div>
              )}
              <div className="mt-4 flex justify-center">
                <Button variant="outline" onClick={() => setMostrarDemo(!mostrarDemo)}>
                  {mostrarDemo ? "Ocultar QR Code de Teste" : "Mostrar QR Code de Teste"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">{t("login.suporte")}</p>
            {/* Botões administrativos removidos para simplificar a tela de login */}
        </CardFooter>
      </Card>
    </div>
    </section>
  )
}

