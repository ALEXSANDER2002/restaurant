// Error types
export enum ErrorType {
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  VALIDATION = "validation",
  DATABASE = "database",
  NETWORK = "network",
  UNKNOWN = "unknown",
}

// Structured error interface
export interface AppError {
  message: string
  type: ErrorType
  originalError?: any
  code?: string
  context?: Record<string, any>
}

/**
 * Creates a standardized application error
 */
export function createAppError(
  message: string,
  type: ErrorType = ErrorType.UNKNOWN,
  originalError?: any,
  context?: Record<string, any>,
): AppError {
  return {
    message,
    type,
    originalError,
    code: originalError?.code,
    context,
  }
}

/**
 * Handles Supabase database errors
 */
export function handleDatabaseError(error: any): AppError {
  // Check for specific Supabase error codes
  if (error?.code) {
    // Foreign key violation
    if (error.code === "23503") {
      return createAppError(
        "Operação não permitida: este registro está relacionado a outros dados.",
        ErrorType.VALIDATION,
        error,
      )
    }

    // Unique violation
    if (error.code === "23505") {
      return createAppError("Este registro já existe no sistema.", ErrorType.VALIDATION, error)
    }

    // Check constraint violation
    if (error.code === "23514") {
      return createAppError("Os dados fornecidos não atendem às regras de validação.", ErrorType.VALIDATION, error)
    }

    // Permission denied
    if (error.code === "42501") {
      return createAppError("Permissão negada para esta operação.", ErrorType.AUTHORIZATION, error)
    }

    // Relation does not exist
    if (error.code === "42P01") {
      return createAppError("Erro de estrutura do banco de dados.", ErrorType.DATABASE, error)
    }
  }

  // Handle RLS recursion errors
  if (error?.message?.includes("infinite recursion")) {
    return createAppError(
      "Erro de recursão nas políticas de segurança. Por favor, utilize a ferramenta de correção RLS.",
      ErrorType.DATABASE,
      error,
    )
  }

  // Generic database error
  return createAppError("Erro ao acessar o banco de dados.", ErrorType.DATABASE, error)
}

/**
 * Handles authentication errors
 */
export function handleAuthError(error: any): AppError {
  // Invalid credentials
  if (error?.message?.includes("Invalid login credentials")) {
    return createAppError("Credenciais inválidas. Verifique seu email e senha.", ErrorType.AUTHENTICATION, error)
  }

  // Email not confirmed
  if (error?.message?.includes("Email not confirmed")) {
    return createAppError("Email não confirmado. Verifique sua caixa de entrada.", ErrorType.AUTHENTICATION, error)
  }

  // User not found
  if (error?.message?.includes("User not found")) {
    return createAppError("Usuário não encontrado.", ErrorType.AUTHENTICATION, error)
  }

  // Generic auth error
  return createAppError("Erro de autenticação.", ErrorType.AUTHENTICATION, error)
}

/**
 * Handles network errors
 */
export function handleNetworkError(error: any): AppError {
  return createAppError("Erro de conexão. Verifique sua internet e tente novamente.", ErrorType.NETWORK, error)
}

/**
 * Main error handler that categorizes and processes errors
 */
export function handleError(error: any): AppError {
  // Check if it's already an AppError
  if (error?.type && Object.values(ErrorType).includes(error.type)) {
    return error as AppError
  }

  // Network errors
  if (error instanceof TypeError && error.message.includes("network")) {
    return handleNetworkError(error)
  }

  // Supabase database errors
  if (error?.code || (error?.message && error.message.includes("database"))) {
    return handleDatabaseError(error)
  }

  // Authentication errors
  if (
    error?.message &&
    (error.message.includes("auth") || error.message.includes("login") || error.message.includes("password"))
  ) {
    return handleAuthError(error)
  }

  // Unknown errors
  return createAppError(error?.message || "Ocorreu um erro inesperado.", ErrorType.UNKNOWN, error)
}

/**
 * Gets a user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: any): string {
  const appError = error?.type ? (error as AppError) : handleError(error)
  return appError.message
}

