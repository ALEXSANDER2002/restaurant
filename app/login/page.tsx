"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FormularioLogin } from "@/components/formulario-login"
import { LeitorQRCode } from "@/components/leitor-qrcode"
import { useIdioma } from "@/contexts/idioma-context"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export default function PaginaLogin() {
  const { t } = useIdioma()
  const { usuario } = useAuth()
  const router = useRouter()
  const [mostrarDemo, setMostrarDemo] = useState(false)

  useEffect(() => {
    if (usuario) {
      let prox = "/usuario"

      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search)
        const nextParam = params.get("next")
        if (nextParam) prox = nextParam
      }

      router.replace(prox)
    }
  }, [usuario, router])

  return (
    <section className="flex flex-col flex-1 items-center justify-center min-h-[calc(100vh-200px)] bg-white dark:bg-gradient-to-br dark:from-[#0a1a33] dark:to-[#051224]">
      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md mb-8 shadow-xl bg-gradient-to-br from-[#0B2F67]/90 to-[#001B44]/90 dark:from-[#0a2a5a] dark:to-[#00193d] border border-blue-300/30 dark:border-blue-400/20 text-white">
          <CardHeader>
            <CardTitle className="text-white dark:text-blue-100">{t("login.titulo")}</CardTitle>
            <CardDescription className="text-blue-100 dark:text-blue-200">
              {t("login.descricao")}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="credenciais" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-blue-800/30 dark:bg-blue-900/30 border border-blue-300/20 dark:border-blue-400/20">
                <TabsTrigger 
                  value="credenciais"
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-blue-100 dark:text-blue-200"
                >
                  {t("login.credenciais")}
                </TabsTrigger>
                <TabsTrigger 
                  value="qrcode"
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-blue-100 dark:text-blue-200"
                >
                  {t("login.qrcode")}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="credenciais">
                <FormularioLogin />
              </TabsContent>
              
              <TabsContent value="qrcode">
                <LeitorQRCode />
                
                {mostrarDemo && (
                  <div className="mt-4 p-4 bg-blue-800/20 dark:bg-blue-900/30 rounded-md border border-blue-300/20 dark:border-blue-400/20">
                    <h3 className="text-sm font-medium text-blue-100 dark:text-blue-200 mb-2">
                      QR Code de Demonstração:
                    </h3>
                    <div className="flex justify-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                          JSON.stringify({ email: "estudante@exemplo.com", senha: "senha123" }),
                        )}`}
                        alt="QR Code de demonstração"
                        className="border border-blue-300/30 dark:border-blue-400/30 rounded-md"
                      />
                    </div>
                  </div>
                )}
                
                <div className="mt-4 flex justify-center">
                  <Button 
                    variant="outline"
                    className="bg-transparent text-blue-100 dark:text-blue-200 border-blue-300/40 dark:border-blue-400/40 hover:bg-blue-700/30 dark:hover:bg-blue-800/40 hover:text-white"
                    onClick={() => setMostrarDemo(!mostrarDemo)}
                  >
                    {mostrarDemo ? "Ocultar QR Code de Teste" : "Mostrar QR Code de Teste"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4">
            <p className="text-sm text-blue-200/80 dark:text-blue-300/70">
              {t("login.suporte")}
            </p>
          </CardFooter>
        </Card>
      </div>
    </section>
  )
}