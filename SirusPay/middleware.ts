import { NextResponse, type NextRequest } from "next/server"

// Rotas que exigem autenticação
const ROTAS_PROTEGIDAS = [
  "/usuario",
  "/admin",
  "/gerenciar-usuarios",
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Verifica se rota é protegida (começa com alguma das rotas)
  const precisaAuth = ROTAS_PROTEGIDAS.some((rota) => pathname.startsWith(rota))
  if (!precisaAuth) {
    // Rota pública, permitir
    return NextResponse.next()
  }

  // Tenta obter token do cookie
  const token = request.cookies.get("token")?.value
  if (!token) {
    // Sem token → redireciona para login
    return redirecionarParaLogin(request)
  }

  // Decodifica payload (sem validar assinatura; validação completa ocorre na API).
  let payload: any = null
  try {
    const base64Payload = token.split(".")[1]
    payload = JSON.parse(Buffer.from(base64Payload, "base64").toString())
  } catch (_) {
    return redirecionarParaLogin(request)
  }

  // Se rota admin e usuario não é admin, redirecionar
  if (pathname.startsWith("/admin") && payload.tipo_usuario !== "admin") {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

function redirecionarParaLogin(request: NextRequest) {
  const loginUrl = new URL("/login", request.url)
  loginUrl.searchParams.set("next", request.nextUrl.pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: [
    "/usuario/:path*",
    "/admin/:path*",
    "/gerenciar-usuarios/:path*",
  ],
} 