import type { PostgrestError } from "@supabase/supabase-js"

interface RetryOptions {
  maxRetries?: number
  initialDelay?: number
  maxDelay?: number
  backoffFactor?: number
  retryableStatusCodes?: number[]
  retryableErrorCodes?: string[]
  onRetry?: (error: any, attempt: number) => void
}

const defaultOptions: RetryOptions = {
  maxRetries: 3,
  initialDelay: 300,
  maxDelay: 5000,
  backoffFactor: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  retryableErrorCodes: ["23505", "40001", "40P01"],
  onRetry: undefined,
}

/**
 * Executes a function with retry logic for Supabase operations
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const opts = { ...defaultOptions, ...options }
  let attempt = 0
  let lastError: any

  while (attempt <= opts.maxRetries!) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error
      attempt++

      if (attempt > opts.maxRetries!) {
        throw error
      }

      // Check if error is retryable
      const isRetryable = isRetryableError(error, opts)
      if (!isRetryable) {
        throw error
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(opts.initialDelay! * Math.pow(opts.backoffFactor!, attempt - 1), opts.maxDelay!)

      // Add some jitter to prevent all clients retrying simultaneously
      const jitteredDelay = delay * (0.8 + Math.random() * 0.4)

      // Call onRetry callback if provided
      if (opts.onRetry) {
        opts.onRetry(error, attempt)
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, jitteredDelay))
    }
  }

  throw lastError
}

/**
 * Determines if an error is retryable based on options
 */
function isRetryableError(error: any, options: RetryOptions): boolean {
  // Check for network errors (they don't have status codes)
  if (
    error.message &&
    (error.message.includes("network") || error.message.includes("timeout") || error.message.includes("connection"))
  ) {
    return true
  }

  // Check for PostgrestError
  if (error && "code" in error) {
    const postgrestError = error as PostgrestError
    return options.retryableErrorCodes?.includes(postgrestError.code) || false
  }

  // Check for status code in error
  if (error && "status" in error) {
    return options.retryableStatusCodes?.includes(error.status) || false
  }

  return false
}

