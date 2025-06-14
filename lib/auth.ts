// utilidades de autenticação usando JSON Web Tokens
import jwt from "jsonwebtoken"

export interface AuthPayload {
  id: string
  email: string
  tipo_usuario: string
}

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me"
const JWT_EXPIRES_IN = "7d"

export function gerarToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verificarToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload
  } catch {
    return null
  }
} 