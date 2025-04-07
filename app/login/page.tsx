"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FormularioLogin } from "@/components/formulario-login"
import { LeitorQRCode } from "@/components/leitor-qrcode"
import { LoginAlternativo } from "@/components/login-alternativo"
import { useIdioma } from "@/contexts/idioma-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UserPlus, Database } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"
import { useState } from "react"

export default function PaginaLogin() {
  const { t } = useIdioma()
  const [mostrarDemo, setMostrarDemo] = useState(false)

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4 py-8">
      <Card className="w-full max-w-md mb-8">
        <CardHeader>
          <CardTitle>{t("login.titulo")}</CardTitle>
          <CardDescription>{t("login.descricao")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="alternativo" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="credenciais">{t("login.credenciais")}</TabsTrigger>
              <TabsTrigger value="qrcode">{t("login.qrcode")}</TabsTrigger>
              <TabsTrigger value="alternativo" className="bg-blue-100 dark:bg-blue-900">
                Login Alternativo
              </TabsTrigger>
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
            <TabsContent value="alternativo">
              <Alert className="mb-4 bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Método Recomendado</AlertTitle>
                <AlertDescription className="text-blue-700">
                  Use este método de login para evitar problemas com o banco de dados.
                </AlertDescription>
              </Alert>
              <LoginAlternativo />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">{t("login.suporte")}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
            <Link href="/gerenciar-usuarios" passHref>
              <Button variant="outline" className="w-full">
                <UserPlus className="mr-2 h-4 w-4" />
                Gerenciar Usuários
              </Button>
            </Link>
            <Link href="/corrigir-rls" passHref>
              <Button variant="outline" className="w-full">
                <Database className="mr-2 h-4 w-4" />
                Corrigir RLS
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

