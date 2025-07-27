"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Package } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SupplierLoginPage() {
  const [supplierName, setSupplierName] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!supplierName.trim()) {
      alert("Please enter your supplier name")
      return
    }

    setLoading(true)
    
    try {
      // Store supplier name in localStorage
      localStorage.setItem('supplierName', supplierName.trim())
      
      // Redirect to supplier dashboard
      router.push('/supplier')
    } catch (error) {
      console.error('Error logging in:', error)
      alert('Error logging in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Supplier Login
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enter your supplier name to access the dashboard
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Enter your supplier name to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="supplierName">Supplier Name</Label>
                <Input
                  id="supplierName"
                  type="text"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="Enter your supplier name"
                  required
                  className="mt-1"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 