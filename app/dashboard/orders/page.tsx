"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Search, Filter, Download, Package, User, Calendar, DollarSign, RefreshCw } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"

interface ShopifyOrder {
  id: string
  orderNumber: number
  name: string
  customerName: string
  customerEmail: string
  status: "pending" | "fulfilled" | "cancelled" | "partial"
  financialStatus: string
  amount: number
  currency: string
  date: string
  lineItems: Array<{
    id: number
    name: string
    quantity: number
    price: number
    variantId: number
    productId: number
  }>
  shippingAddress?: any
  billingAddress?: any
  tags: string
  note: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<ShopifyOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<ShopifyOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isConnected, setIsConnected] = useState(false)
  const { toast } = useToast()

  // Use the same shop domain as in the dashboard
  const shopDomain = "tests32123.myshopify.com"
  
  console.log("Orders page loaded with shop domain:", shopDomain)

  useEffect(() => {
    checkConnectionAndFetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, searchTerm, statusFilter])

  const checkConnectionAndFetchOrders = async () => {
    try {
      // First check if we're connected to Shopify
      const res = await fetch(`/api/shopify-products?shop=${shopDomain}`)
      if (res.ok) {
        setIsConnected(true)
        fetchOrders()
      } else {
        setIsConnected(false)
        setLoading(false)
      }
    } catch (error) {
      setIsConnected(false)
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    try {
      setLoading(true)
      // Try GraphQL first, fallback to REST if needed
      let response = await fetch(`/api/shopify-orders-graphql?shop=${shopDomain}`)
      
      if (!response.ok) {
        console.log("GraphQL failed, trying REST API...")
        response = await fetch(`/api/shopify-orders?shop=${shopDomain}`)
      }
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch orders')
      }

      const data = await response.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch orders from Shopify",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async () => {
    try {
      setLoading(true)
      // Test GraphQL first
      let response = await fetch(`/api/shopify-test-graphql?shop=${shopDomain}`)
      let method = "GraphQL"
      
      if (!response.ok) {
        console.log("GraphQL test failed, trying REST...")
        response = await fetch(`/api/shopify-test?shop=${shopDomain}`)
        method = "REST"
      }
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Connection test failed')
      }

      const data = await response.json()
      console.log("Connection test result:", data)
      
      const orderCount = data.orders?.length || data.ordersTest?.orderCount || 0
      toast({
        title: "Connection Test",
        description: `Shop: ${data.shop?.name || 'Unknown'}, Orders: ${orderCount} found (via ${method})`,
      })
    } catch (error) {
      console.error("Connection test error:", error)
      toast({
        title: "Connection Test Failed",
        description: error instanceof Error ? error.message : "Failed to test connection",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const reAuthenticate = async () => {
    try {
      setLoading(true)
      
      // Clear existing tokens
      await fetch('/api/auth/clear', { method: 'POST' })
      
      toast({
        title: "Tokens Cleared",
        description: "Please re-authenticate with Shopify to get updated permissions",
      })
      
      // Redirect to connect page
      window.location.href = '/connect-shopify'
    } catch (error) {
      console.error("Re-authentication error:", error)
      toast({
        title: "Re-authentication Failed",
        description: "Failed to clear tokens. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = orders

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.orderNumber.toString().includes(searchTerm),
      )
    }

    setFilteredOrders(filtered)
  }

  const updateOrderStatus = async (orderId: string, newStatus: "pending" | "fulfilled" | "cancelled") => {
    try {
      setUpdatingOrders(prev => new Set(prev).add(orderId))
      
      const response = await fetch(`/api/shopify-orders?shop=${shopDomain}&orderId=${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fulfillmentStatus: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update order')
      }

      // Update local state
      setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))

      toast({
        title: "Success",
        description: `Order #${orderId} status updated to ${newStatus}`,
      })
    } catch (error) {
      console.error("Error updating order:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update order status",
        variant: "destructive",
      })
    } finally {
      setUpdatingOrders(prev => {
        const newSet = new Set(prev)
        newSet.delete(orderId)
        return newSet
      })
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "fulfilled":
        return "default"
      case "pending":
        return "secondary"
      case "partial":
        return "outline"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusCounts = () => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      fulfilled: orders.filter((o) => o.status === "fulfilled").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
      partial: orders.filter((o) => o.status === "partial").length,
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!isConnected) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Connect to Shopify</h1>
            <p className="text-lg text-gray-600 mb-8">
              Connect your Shopify store to view and manage orders
            </p>
            <a href="/connect-shopify">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
                Connect to Shopify
              </Button>
            </a>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const statusCounts = getStatusCounts()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Orders</h1>
            <p className="text-gray-600">Track and manage your Shopify orders from {shopDomain}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={fetchOrders}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              onClick={testConnection}
              disabled={loading}
              className="flex items-center gap-2"
            >
              Test Connection
            </Button>
            <Button 
              variant="outline" 
              onClick={reAuthenticate}
              disabled={loading}
              className="flex items-center gap-2"
            >
              Re-authenticate
            </Button>
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Export Orders
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({statusCounts.pending})</TabsTrigger>
                <TabsTrigger value="fulfilled">Fulfilled ({statusCounts.fulfilled})</TabsTrigger>
                <TabsTrigger value="partial">Partial ({statusCounts.partial})</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled ({statusCounts.cancelled})</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search orders by ID, product, or customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <Filter className="h-4 w-4" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Orders ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-500" />
                          #{order.orderNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="font-medium">{order.customerName}</div>
                            <div className="text-sm text-gray-500">{order.customerEmail}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {order.lineItems.length} item{order.lineItems.length !== 1 ? 's' : ''}
                          {order.lineItems.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              {order.lineItems[0].name}
                              {order.lineItems.length > 1 && ` +${order.lineItems.length - 1} more`}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-gray-500" />
                          <span className="font-medium">{order.amount.toFixed(2)}</span>
                          <span className="text-xs text-gray-500">{order.currency}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{new Date(order.date).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value: "pending" | "fulfilled" | "cancelled") =>
                            updateOrderStatus(order.id, value)
                          }
                          disabled={updatingOrders.has(order.id)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="fulfilled">Fulfilled</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        {updatingOrders.has(order.id) && (
                          <div className="mt-1">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {orders.length === 0 ? "No orders found" : "No orders match your criteria"}
                </h3>
                <p className="text-gray-600">
                  {orders.length === 0 
                    ? "Your Shopify store doesn't have any orders yet." 
                    : "Try adjusting your search or filter criteria."
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
