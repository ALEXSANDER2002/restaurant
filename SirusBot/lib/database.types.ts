export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      perfis: {
        Row: {
          id: string
          nome: string
          email: string
          tipo_usuario: "admin" | "usuario" | "caixa"
          status?: "ativo" | "inativo"
          created_at: string
          updated_at?: string
        }
        Insert: {
          id: string
          nome: string
          email: string
          tipo_usuario?: "admin" | "usuario" | "caixa"
          status?: "ativo" | "inativo"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          email?: string
          tipo_usuario?: "admin" | "usuario" | "caixa"
          status?: "ativo" | "inativo"
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "perfis_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      tickets: {
        Row: {
          id: string
          usuario_id: string
          data: string
          quantidade: number
          valor_total: number
          status: "pendente" | "pago" | "cancelado"
          created_at: string
          updated_at?: string
          subsidiado?: boolean
          utilizado?: boolean
          data_utilizacao?: string
          perfis?: {
            nome: string
            email: string
          }
        }
        Insert: {
          id?: string
          usuario_id: string
          data: string
          quantidade: number
          valor_total: number
          status?: "pendente" | "pago" | "cancelado"
          created_at?: string
          updated_at?: string
          subsidiado?: boolean
          utilizado?: boolean
          data_utilizacao?: string
        }
        Update: {
          id?: string
          usuario_id?: string
          data?: string
          quantidade?: number
          valor_total?: number
          status?: "pendente" | "pago" | "cancelado"
          created_at?: string
          updated_at?: string
          subsidiado?: boolean
          utilizado?: boolean
          data_utilizacao?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_usuario_id_fkey"
            columns: ["usuario_id"]
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      sincronizar_tickets_offline: {
        Args: {
          tickets_json: Json
        }
        Returns: Json
      }
      backup_tickets_usuario: {
        Args: {
          usuario_id?: string
        }
        Returns: Json
      }
      fix_rls_recursion: {
        Args: Record<string, never>
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

