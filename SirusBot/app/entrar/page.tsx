// Esta rota agora redireciona imediatamente para a área de login principal
// eliminando duplicação entre /entrar e /login.

import { redirect } from "next/navigation"

export default function EntrarRedirectPage() {
  redirect("/login")
} 