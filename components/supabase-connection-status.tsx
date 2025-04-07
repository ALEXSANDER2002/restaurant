"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { checkSupabaseConnection } from "@/lib/supabase/client"

export default function SupabaseConnectionStatus() {
  const [status, setStatus] = useState<"idle" | "checking" | "connected" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const [latency, setLatency] = useState<number | null>(null)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const checkConnection = async () => {
    setStatus("checking")
    setError(null)

    try {
      const result = await checkSupabaseConnection()

      if (result.connected) {
        setStatus("connected")
        setLatency(result.latency || null)
      } else {
        setStatus("error")
        setError(result.error || "Unknown connection error")
        setLatency(result.latency || null)
      }

      setLastChecked(new Date())
    } catch (err: any) {
      setStatus("error")
      setError(err.message || "Failed to check connection")
      setLastChecked(new Date())
    }
  }

  useEffect(() => {
    // Check connection on component mount
    checkConnection()

    // Set up interval to check connection periodically (every 5 minutes)
    const interval = setInterval(checkConnection, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Supabase Connection Status
          {status === "connected" && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Connected
            </Badge>
          )}
          {status === "error" && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              Error
            </Badge>
          )}
          {status === "checking" && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              Checking...
            </Badge>
          )}
          {status === "idle" && (
            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
              Not Checked
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {status === "connected" && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Connected to Supabase</AlertTitle>
            <AlertDescription className="text-green-700">
              <p>Connection is working properly.</p>
              {latency && <p>Latency: {latency.toFixed(2)}ms</p>}
              {lastChecked && <p>Last checked: {lastChecked.toLocaleString()}</p>}
            </AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>
              <p>{error}</p>
              {latency && <p>Latency: {latency.toFixed(2)}ms</p>}
              {lastChecked && <p>Last checked: {lastChecked.toLocaleString()}</p>}
            </AlertDescription>
          </Alert>
        )}

        {status === "checking" && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Checking Connection</AlertTitle>
            <AlertDescription>
              <p>Testing connection to Supabase...</p>
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Connection Details</h3>
          <div className="text-sm">
            <p>
              <strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Configured" : "✗ Missing"}
            </p>
            <p>
              <strong>API Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Configured" : "✗ Missing"}
            </p>
            <p>
              <strong>Environment:</strong> {process.env.NODE_ENV}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button onClick={checkConnection} disabled={status === "checking"} className="w-full">
          <RefreshCw className={`mr-2 h-4 w-4 ${status === "checking" ? "animate-spin" : ""}`} />
          {status === "checking" ? "Checking..." : "Check Connection"}
        </Button>
      </CardFooter>
    </Card>
  )
}

