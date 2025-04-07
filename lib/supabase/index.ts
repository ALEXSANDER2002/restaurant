// Export all Supabase-related utilities from a single file
export { supabase, getSupabaseClient, checkSupabaseConnection } from "./client"
export { authService } from "./auth-service"
export { dataService } from "./data-service"
export {
  handleSupabaseError,
  handlePostgrestError,
  handleAuthError,
  getUserFriendlyErrorMessage,
  ErrorCategory,
} from "./error-handler"
export { withRetry } from "./retry-handler"

// Re-export types
export type { StructuredError } from "./error-handler"

