import type { PostgrestError, AuthError } from "@supabase/supabase-js"

// Error categories
export enum ErrorCategory {
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  VALIDATION = "validation",
  NOT_FOUND = "not_found",
  CONFLICT = "conflict",
  SERVER = "server",
  NETWORK = "network",
  UNKNOWN = "unknown",
}

// Structured error response
export interface StructuredError {
  message: string
  category: ErrorCategory
  code?: string
  details?: any
  originalError?: any
}

/**
 * Handles Supabase PostgrestError and returns a structured error
 */
export function handlePostgrestError(error: PostgrestError): StructuredError {
  // Extract error code from message if available
  const codeMatch = error.message.match(/^[A-Z0-9_]+:/)
  const code = codeMatch ? codeMatch[0].replace(":", "") : undefined

  // Determine error category based on code or status
  let category = ErrorCategory.UNKNOWN

  if (error.code === "23505") {
    category = ErrorCategory.CONFLICT
  } else if (error.code === "23503") {
    category = ErrorCategory.VALIDATION
  } else if (error.code === "42P01") {
    category = ErrorCategory.NOT_FOUND
  } else if (error.code === "42501" || error.code === "42503") {
    category = ErrorCategory.AUTHORIZATION
  } else if (error.code?.startsWith("28")) {
    category = ErrorCategory.AUTHENTICATION
  } else if (error.code?.startsWith("22") || error.code?.startsWith("23")) {
    category = ErrorCategory.VALIDATION
  } else if (error.code?.startsWith("53") || error.code?.startsWith("54") || error.code?.startsWith("58")) {
    category = ErrorCategory.SERVER
  } else if (error.message.includes("network") || error.message.includes("timeout")) {
    category = ErrorCategory.NETWORK
  }

  return {
    message: error.message,
    category,
    code: error.code,
    details: error.details,
    originalError: error,
  }
}

/**
 * Handles Supabase AuthError and returns a structured error
 */
export function handleAuthError(error: AuthError): StructuredError {
  let category = ErrorCategory.AUTHENTICATION

  if (error.message.includes("permission") || error.message.includes("not authorized")) {
    category = ErrorCategory.AUTHORIZATION
  } else if (error.message.includes("network") || error.message.includes("timeout")) {
    category = ErrorCategory.NETWORK
  }

  return {
    message: error.message,
    category,
    code: error.status?.toString(),
    details: null,
    originalError: error,
  }
}

/**
 * Generic error handler for any Supabase-related error
 */
export function handleSupabaseError(error: any): StructuredError {
  if ("code" in error && "message" in error && "details" in error) {
    return handlePostgrestError(error as PostgrestError)
  } else if ("message" in error && "status" in error) {
    return handleAuthError(error as AuthError)
  } else {
    return {
      message: error.message || "Unknown error occurred",
      category: ErrorCategory.UNKNOWN,
      originalError: error,
    }
  }
}

/**
 * Converts a structured error to a user-friendly message
 */
export function getUserFriendlyErrorMessage(error: StructuredError): string {
  switch (error.category) {
    case ErrorCategory.AUTHENTICATION:
      return "Falha na autenticação. Verifique suas credenciais e tente novamente."
    case ErrorCategory.AUTHORIZATION:
      return "Você não tem permissão para realizar esta ação."
    case ErrorCategory.VALIDATION:
      return "Os dados fornecidos são inválidos. Verifique e tente novamente."
    case ErrorCategory.NOT_FOUND:
      return "O recurso solicitado não foi encontrado."
    case ErrorCategory.CONFLICT:
      return "Esta operação não pode ser concluída devido a um conflito de dados."
    case ErrorCategory.SERVER:
      return "Ocorreu um erro no servidor. Tente novamente mais tarde."
    case ErrorCategory.NETWORK:
      return "Erro de conexão. Verifique sua internet e tente novamente."
    default:
      return "Ocorreu um erro inesperado. Por favor, tente novamente."
  }
}

