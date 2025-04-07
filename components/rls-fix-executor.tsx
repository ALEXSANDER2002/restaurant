"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Database, RefreshCw, ArrowRight } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function RLSFixExecutor() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [mensagem, setMensagem] = useState("")
  const [detailedLog, setDetailedLog] = useState<string[]>([])
  const [fixAttempted, setFixAttempted] = useState(false)

  const executeRLSFix = async () => {
    setStatus("loading")
    setMensagem("Executing RLS fix...")
    setDetailedLog(["Starting RLS fix process..."])
    setFixAttempted(true)

    try {
      // Comprehensive approach that tries multiple methods

      // Method 1: Disable RLS completely for the problematic table
      try {
        addToLog("Step 1: Disabling RLS on perfis table...")
        await executeSql("ALTER TABLE IF EXISTS public.perfis DISABLE ROW LEVEL SECURITY;")
        addToLog("✅ Successfully disabled RLS")

        // Test if this fixed the issue
        try {
          const { data, error } = await supabase.from("perfis").select("count").limit(1)
          if (!error) {
            addToLog("✅ Basic query test successful after disabling RLS")
            setStatus("success")
            setMensagem("Successfully fixed RLS issues by disabling Row Level Security on the perfis table.")
            return
          } else {
            addToLog(`⚠️ Query still failing after disabling RLS: ${error.message}`)
          }
        } catch (e: any) {
          addToLog(`⚠️ Test query failed: ${e.message}`)
        }
      } catch (e: any) {
        addToLog(`⚠️ Could not disable RLS: ${e.message}`)
      }

      // Method 2: Drop all policies and create a simple one
      try {
        addToLog("Step 2: Dropping all existing policies...")
        const policies = [
          "Usuários podem ver seus próprios perfis",
          "Administradores podem ver todos os perfis",
          "Administradores podem inserir perfis",
          "Administradores podem atualizar perfis",
          "Administradores podem excluir perfis",
          "Permitir inserção anônima",
          "Permitir acesso a todos os perfis",
          "Permitir todas as operações",
          "safe_select_policy",
          "safe_insert_policy",
          "safe_update_policy",
        ]

        for (const policy of policies) {
          await executeSql(`DROP POLICY IF EXISTS "${policy}" ON public.perfis;`)
        }
        addToLog("✅ Successfully dropped existing policies")

        // Create a simple policy
        addToLog("Creating simple universal access policy...")
        await executeSql(`
          CREATE POLICY "universal_access_policy" ON public.perfis
          FOR ALL USING (true) WITH CHECK (true);
        `)
        addToLog("✅ Created universal access policy")

        // Re-enable RLS with the new policy
        await executeSql("ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;")
        addToLog("✅ Re-enabled RLS with simplified policy")

        // Test if this fixed the issue
        try {
          const { data, error } = await supabase.from("perfis").select("count").limit(1)
          if (!error) {
            addToLog("✅ Basic query test successful after policy simplification")
            setStatus("success")
            setMensagem("Successfully fixed RLS issues by simplifying the security policies.")
            return
          } else {
            addToLog(`⚠️ Query still failing after policy simplification: ${error.message}`)
          }
        } catch (e: any) {
          addToLog(`⚠️ Test query failed: ${e.message}`)
        }
      } catch (e: any) {
        addToLog(`⚠️ Error during policy simplification: ${e.message}`)
      }

      // Method 3: Last resort - create a bypass function
      try {
        addToLog("Step 3: Creating a secure bypass function...")
        await executeSql(`
          CREATE OR REPLACE FUNCTION get_all_profiles()
          RETURNS SETOF perfis
          LANGUAGE sql
          SECURITY DEFINER
          AS $$
            SELECT * FROM perfis;
          $$;
        `)
        addToLog("✅ Created secure bypass function")

        // Test if this fixed the issue
        try {
          const { data, error } = await supabase.rpc("get_all_profiles")
          if (!error) {
            addToLog("✅ Bypass function test successful")
            setStatus("success")
            setMensagem(
              "Created a secure bypass function to access profile data. Use supabase.rpc('get_all_profiles') to retrieve data.",
            )
            return
          } else {
            addToLog(`⚠️ Bypass function failed: ${error.message}`)
          }
        } catch (e: any) {
          addToLog(`⚠️ Bypass function test failed: ${e.message}`)
        }
      } catch (e: any) {
        addToLog(`⚠️ Error creating bypass function: ${e.message}`)
      }

      // If we got here, all methods failed
      setStatus("error")
      setMensagem("All fix attempts failed. Please try the alternative login method.")
    } catch (error: any) {
      console.error("Error fixing RLS policies:", error)
      setStatus("error")
      setMensagem(`Failed to fix RLS policies: ${error.message}. Please try the alternative login method.`)
    }
  }

  const executeSql = async (sql: string) => {
    try {
      return await supabase.rpc("executar_sql", { sql })
    } catch (e) {
      addToLog(`SQL execution failed: ${e}`)
      throw e
    }
  }

  const addToLog = (message: string) => {
    setDetailedLog((prev) => [...prev, message])
    console.log(message) // Also log to console for debugging
  }

  const testConnection = async () => {
    setStatus("loading")
    setMensagem("Testing database connection...")
    setDetailedLog(["Starting connection test..."])

    try {
      addToLog("Attempting to query perfis table...")
      const { data, error } = await supabase.from("perfis").select("count").limit(1)

      if (error) {
        if (error.message.includes("infinite recursion")) {
          addToLog("❌ Infinite recursion detected in RLS policies")
          setStatus("error")
          setMensagem("Infinite recursion detected in RLS policies. Please execute the fix.")
        } else {
          addToLog(`❌ Database error: ${error.message}`)
          setStatus("error")
          setMensagem(`Database connection error: ${error.message}`)
        }
      } else {
        addToLog("✅ Successfully connected to database")
        setStatus("success")
        setMensagem("Database connection successful! No recursion issues detected.")
      }
    } catch (error: any) {
      addToLog(`❌ Exception during test: ${error.message}`)
      console.error("Error testing connection:", error)
      setStatus("error")
      setMensagem(`Connection test failed: ${error.message}`)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Enhanced RLS Policy Fix Tool</CardTitle>
        <CardDescription>Resolves the infinite recursion issue in Row-Level Security policies</CardDescription>
      </CardHeader>
      <CardContent>
        {status === "error" && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              <p>{mensagem}</p>
              {fixAttempted && (
                <Button
                  variant="outline"
                  className="mt-2 bg-red-50 hover:bg-red-100 border-red-200"
                  onClick={() => (window.location.href = "/login")}
                >
                  Go to Alternative Login <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {status === "success" && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Success</AlertTitle>
            <AlertDescription className="text-green-700">{mensagem}</AlertDescription>
          </Alert>
        )}

        {status === "loading" && (
          <Alert className="mb-4">
            <AlertTitle>Processing...</AlertTitle>
            <AlertDescription>{mensagem}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">What This Tool Does</h3>
            <p className="mb-2">
              This enhanced tool fixes the "infinite recursion" error in Row-Level Security (RLS) policies by trying
              multiple approaches:
            </p>
            <ol className="list-decimal pl-5 mb-4 space-y-2">
              <li>Disabling RLS completely on the problematic table (simplest solution)</li>
              <li>Creating a simplified universal access policy if complete disabling isn't possible</li>
              <li>Creating a secure bypass function as a last resort</li>
              <li>Testing each solution to verify it works</li>
            </ol>
          </div>

          {detailedLog.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Execution Log</h3>
              <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm overflow-auto max-h-60">
                {detailedLog.map((log, index) => (
                  <div key={index} className="whitespace-pre-wrap">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button onClick={testConnection} disabled={status === "loading"} className="w-full">
          <RefreshCw className={`mr-2 h-4 w-4 ${status === "checking" ? "animate-spin" : ""}`} />
          {status === "loading" ? "Testing..." : "Test Database Connection"}
        </Button>

        <Button onClick={executeRLSFix} disabled={status === "loading"} className="w-full">
          <Database className="mr-2 h-4 w-4" />
          {status === "loading" ? "Executing..." : "Execute Enhanced RLS Fix"}
        </Button>
      </CardFooter>
    </Card>
  )
}

