import { supabase } from "./supabaseClient" // Assuming supabaseClient.ts exports the supabase instance

// Mock addToLog for demonstration purposes.  Replace with your actual logging implementation.
const addToLog = (message: string) => {
  console.log(message)
}

// Mock policies for demonstration purposes. Replace with your actual policies array.
const policies = ["policy1", "policy2"]

// Update the executeSql function to use parameterized queries
const executeSql = async (sql: string) => {
  try {
    // Use the executar_sql RPC function which should be properly parameterized
    return await supabase.rpc("executar_sql", { sql })
  } catch (e) {
    addToLog(`SQL execution failed: ${e}`)
    throw e
  }
}

// And ensure all SQL statements are properly constructed
// For example, when dropping policies:
for (const policy of policies) {
  // Sanitize policy name to prevent SQL injection
  const sanitizedPolicy = policy.replace(/[^\w\s]/gi, "")
  await executeSql(`DROP POLICY IF EXISTS "${sanitizedPolicy}" ON public.perfis;`)
}

