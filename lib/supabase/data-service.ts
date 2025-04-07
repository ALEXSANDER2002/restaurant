import { supabase } from "./client"
import type { PostgrestError } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

// Type for query parameters
type QueryParams = {
  page?: number
  pageSize?: number
  orderBy?: string
  orderDirection?: "asc" | "desc"
  filters?: Record<string, any>
}

// Generic data service
export const dataService = {
  /**
   * Generic function to fetch data from any table
   */
  async fetchData<T extends keyof Database["public"]["Tables"]>(
    table: T,
    params: QueryParams = {},
  ): Promise<{
    data: Database["public"]["Tables"][T]["Row"][] | null
    count: number | null
    error: PostgrestError | null
  }> {
    const { page = 1, pageSize = 10, orderBy, orderDirection = "asc", filters = {} } = params

    // Start building the query
    let query = supabase.from(table).select("*", { count: "exact" })

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === "object" && "operator" in value && "value" in value) {
          // Handle custom operators like gt, lt, etc.
          const { operator, value: filterValue } = value as { operator: string; value: any }

          switch (operator) {
            case "eq":
              query = query.eq(key, filterValue)
              break
            case "neq":
              query = query.neq(key, filterValue)
              break
            case "gt":
              query = query.gt(key, filterValue)
              break
            case "gte":
              query = query.gte(key, filterValue)
              break
            case "lt":
              query = query.lt(key, filterValue)
              break
            case "lte":
              query = query.lte(key, filterValue)
              break
            case "like":
              query = query.like(key, `%${filterValue}%`)
              break
            case "ilike":
              query = query.ilike(key, `%${filterValue}%`)
              break
            case "in":
              query = query.in(key, Array.isArray(filterValue) ? filterValue : [filterValue])
              break
          }
        } else {
          // Simple equality filter
          query = query.eq(key, value)
        }
      }
    })

    // Apply ordering
    if (orderBy) {
      query = query.order(orderBy, { ascending: orderDirection === "asc" })
    }

    // Apply pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)

    // Execute the query
    const { data, error, count } = await query

    return {
      data: data as Database["public"]["Tables"][T]["Row"][] | null,
      count,
      error,
    }
  },

  /**
   * Generic function to insert data into any table
   */
  async insertData<T extends keyof Database["public"]["Tables"]>(
    table: T,
    data: Database["public"]["Tables"][T]["Insert"] | Database["public"]["Tables"][T]["Insert"][],
  ): Promise<{
    data: Database["public"]["Tables"][T]["Row"][] | null
    error: PostgrestError | null
  }> {
    const { data: result, error } = await supabase.from(table).insert(data).select()

    return {
      data: result as Database["public"]["Tables"][T]["Row"][] | null,
      error,
    }
  },

  /**
   * Generic function to update data in any table
   */
  async updateData<T extends keyof Database["public"]["Tables"]>(
    table: T,
    id: string,
    data: Database["public"]["Tables"][T]["Update"],
  ): Promise<{
    data: Database["public"]["Tables"][T]["Row"] | null
    error: PostgrestError | null
  }> {
    const { data: result, error } = await supabase.from(table).update(data).eq("id", id).select().single()

    return {
      data: result as Database["public"]["Tables"][T]["Row"] | null,
      error,
    }
  },

  /**
   * Generic function to delete data from any table
   */
  async deleteData<T extends keyof Database["public"]["Tables"]>(
    table: T,
    id: string,
  ): Promise<{
    error: PostgrestError | null
  }> {
    const { error } = await supabase.from(table).delete().eq("id", id)

    return { error }
  },

  /**
   * Generic function to fetch a single record by ID
   */
  async getById<T extends keyof Database["public"]["Tables"]>(
    table: T,
    id: string,
  ): Promise<{
    data: Database["public"]["Tables"][T]["Row"] | null
    error: PostgrestError | null
  }> {
    const { data, error } = await supabase.from(table).select("*").eq("id", id).single()

    return {
      data: data as Database["public"]["Tables"][T]["Row"] | null,
      error,
    }
  },
}

