// import { RLSFixExecutor } from "@/components/rls-fix-executor"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function FixRLSPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Fix Database RLS Policies</h1>

      <Alert className="mb-6 bg-yellow-50 border-yellow-200">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800">Technical Operation</AlertTitle>
        <AlertDescription className="text-yellow-700">
          <p className="mb-2">
            This page provides a technical solution to fix the "infinite recursion" error in your database's Row-Level
            Security (RLS) policies. This is an advanced operation that modifies database security settings.
          </p>
          <p>
            If you're not comfortable with this operation, you can still use the system through the alternative login
            method.
          </p>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {/* <RLSFixExecutor /> */}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Understanding RLS Recursion</h2>
            <p className="mb-4">
              Row-Level Security (RLS) policies control which rows users can access in database tables. Infinite
              recursion occurs when these policies create circular references.
            </p>
            <h3 className="font-medium mb-2">Common Causes:</h3>
            <ul className="list-disc pl-5 mb-4 space-y-1">
              <li>Policies that query the same table they're applied to</li>
              <li>Policies that check user permissions by querying user data</li>
              <li>Complex permission hierarchies with circular dependencies</li>
            </ul>
            <p>Our fix replaces complex policies with simpler ones that avoid these recursive patterns.</p>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Alternative Option</AlertTitle>
            <AlertDescription className="text-blue-700">
              <p className="mb-4">
                If you prefer not to modify database settings, you can use the alternative login method which works
                independently of the database.
              </p>
              <Link href="/login" passHref>
                <Button variant="outline" className="bg-blue-600 text-white hover:bg-blue-700 w-full">
                  Go to Alternative Login
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  )
}

