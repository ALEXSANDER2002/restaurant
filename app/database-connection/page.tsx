import SupabaseConnectionStatus from "@/components/supabase-connection-status"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Info, Shield, Zap } from "lucide-react"

export default function DatabaseConnectionPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Database Connection Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <SupabaseConnectionStatus />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5 text-blue-600" />
                Security Information
              </CardTitle>
              <CardDescription>How your connection is secured</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="font-medium mr-2">✓</span>
                  <span>Environment variables for secure credential storage</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">✓</span>
                  <span>HTTPS encryption for all data in transit</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">✓</span>
                  <span>Row-Level Security (RLS) for data access control</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">✓</span>
                  <span>JWT-based authentication</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="mr-2 h-5 w-5 text-yellow-600" />
                Performance Optimizations
              </CardTitle>
              <CardDescription>How your connection is optimized</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="font-medium mr-2">✓</span>
                  <span>Connection pooling for efficient resource usage</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">✓</span>
                  <span>Automatic token refresh for persistent sessions</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">✓</span>
                  <span>Optimized query patterns to reduce database load</span>
                </li>
                <li className="flex items-start">
                  <span className="font-medium mr-2">✓</span>
                  <span>Timeout configuration to prevent hanging connections</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8">
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Connection Information</AlertTitle>
          <AlertDescription className="text-blue-700">
            <p className="mb-2">
              This page allows you to monitor and manage your Supabase database connection. The connection is
              automatically checked every 5 minutes to ensure reliability.
            </p>
            <p>
              If you encounter persistent connection issues, please check your environment variables and network
              configuration, or contact your database administrator.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}

