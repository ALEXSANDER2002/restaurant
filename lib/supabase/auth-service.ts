import { supabase } from "./client"
import type { User, Session, AuthError } from "@supabase/supabase-js"

// Authentication service
export const authService = {
  /**
   * Get the current user session
   */
  async getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
    const { data, error } = await supabase.auth.getSession()
    return { session: data.session, error }
  },

  /**
   * Get the current user
   */
  async getUser(): Promise<{ user: User | null; error: AuthError | null }> {
    const { data, error } = await supabase.auth.getUser()
    return { user: data.user, error }
  },

  /**
   * Sign in with email and password
   */
  async signInWithEmail(
    email: string,
    password: string,
  ): Promise<{
    user: User | null
    session: Session | null
    error: AuthError | null
  }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    return {
      user: data?.user || null,
      session: data?.session || null,
      error,
    }
  },

  /**
   * Sign up with email and password
   */
  async signUpWithEmail(
    email: string,
    password: string,
    metadata?: { [key: string]: any },
  ): Promise<{
    user: User | null
    session: Session | null
    error: AuthError | null
  }> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    })

    return {
      user: data?.user || null,
      session: data?.session || null,
      error,
    }
  },

  /**
   * Sign out the current user
   */
  async signOut(): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  /**
   * Set up auth state change listener
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session)
    })
  },
}

