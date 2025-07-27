"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Package, Plus, List, CheckSquare, User, Bell, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"

interface SupplierLayoutProps {
  children: React.ReactNode
}

export default function SupplierLayout({ children }: SupplierLayoutProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const { toast } = useToast()

  useEffect(() => {
    // Don't check user if we're on the login page
    if (pathname === '/supplier/login') {
      setLoading(false)
      return
    }
    checkUser()
  }, [pathname])

  const checkUser = async () => {
    try {
      // Simple supplier name from localStorage
      const supplierName = localStorage.getItem('supplierName')
      if (!supplierName) {
        // Add a small delay to prevent rapid redirects
        setTimeout(() => {
          window.location.href = '/supplier/login'
        }, 100)
        return
      }
      setUser({ user_metadata: { full_name: supplierName }, email: 'demo@supplier.com' })
      setLoading(false)
    } catch (error) {
      console.error('Error checking user:', error)
      // Only redirect if there's a real error, not just missing supplier name
      if (!localStorage.getItem('supplierName')) {
        setTimeout(() => {
          window.location.href = '/supplier/login'
        }, 100)
      }
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('supplierName')
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const navigation = [
    {
      name: "List Product",
      href: "/supplier",
      icon: Plus,
      current: pathname === "/supplier"
    },
    {
      name: "My Products",
      href: "/supplier/products",
      icon: List,
      current: pathname === "/supplier/products"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
                                    <div className="flex items-center">
                          <Package className="h-8 w-8 text-blue-600 mr-3" />
                          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                            Supplier Dashboard
                          </h1>
                          <div className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            LIVE
                          </div>
                        </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 min-h-screen">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Supplier Dashboard
            </h2>
            
            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      item.current
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-l-4 border-blue-600"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* User Info */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.user_metadata?.full_name || user?.email || 'Supplier'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Supplier Account
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 