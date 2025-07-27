"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Package, ExternalLink, CheckCircle, AlertCircle, X, Calculator, Store, Eye } from "lucide-react"
import Image from "next/image"
import DashboardLayout from "@/components/dashboard-layout"
import { ProductService } from "@/lib/product-service"
import { Product as SupplierProduct } from "@/lib/types/product"

interface Product {
  id: string
  name: string
  price: number
  image: string
  status: "pushed" | "not_pushed"
  description: string
}

export default function DashboardHome() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [pushing, setPushing] = useState<string[]>([])
  const { toast } = useToast()
  const [isConnected, setIsConnected] = useState(false)
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [sellingPrice, setSellingPrice] = useState("")
  const [margin, setMargin] = useState(0)

  const shopDomain = "tests32123.myshopify.com"

  useEffect(() => {
    checkConnectionStatus()
  }, [])

  // Calculate margin when selling price changes
  useEffect(() => {
    if (selectedProduct && sellingPrice) {
      const costPrice = selectedProduct.price
      const selling = parseFloat(sellingPrice)
      const calculatedMargin = Math.round(selling - costPrice)
      setMargin(calculatedMargin)
    }
  }, [sellingPrice, selectedProduct])

  const checkConnectionStatus = async () => {
    try {
      const res = await fetch(`/api/shopify-products?shop=${shopDomain}`)
      if (res.ok) {
        setIsConnected(true)
        fetchProducts()
      } else {
        setIsConnected(false)
        setLoading(false)
      }
    } catch (error) {
      setIsConnected(false)
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      // Fetch approved products from the database
      const approvedProducts = await ProductService.getApprovedProducts()
      
      // Transform supplier products to match the Product interface
      const transformedProducts: Product[] = approvedProducts.map((supplierProduct: SupplierProduct) => ({
        id: supplierProduct.id,
        name: supplierProduct.title,
        price: supplierProduct.price,
        image: supplierProduct.images && supplierProduct.images.length > 0 
          ? supplierProduct.images[0] 
          : "/placeholder.svg?height=200&width=200",
        status: "not_pushed" as const, // Will be updated based on Shopify sync
        description: supplierProduct.description || "No description available"
      }))

      // Check Shopify sync status
      try {
        const shopifyRes = await fetch(`/api/shopify-products?shop=${shopDomain}`);
        if (shopifyRes.ok) {
          const shopifyData = await shopifyRes.json();
          const shopifyProductTitles = shopifyData.products.map((p: any) => p.title);
          
          const syncedProducts = transformedProducts.map(product => ({
            ...product,
            status: shopifyProductTitles.includes(product.name) ? "pushed" as const : "not_pushed" as const
          }));
          
          setProducts(syncedProducts);
        } else {
          setProducts(transformedProducts);
        }
      } catch (error) {
        console.error("Failed to sync with Shopify:", error);
        setProducts(transformedProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const openPushModal = (product: Product) => {
    setSelectedProduct(product)
    setSellingPrice(Math.round(product.price * 1.5).toString()) // Default 50% markup
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
    setSellingPrice("")
    setMargin(0)
  }

  const handlePushToShopify = async () => {
    if (!selectedProduct || !sellingPrice) return
    
    setPushing((prev) => [...prev, selectedProduct.id])
    closeModal()
    
    const product = selectedProduct
    const shopifyProduct = {
      title: product.name,
      body_html: `<strong>${product.description}</strong>`,
      vendor: "Your App",
      product_type: "Widget",
      variants: [
        {
          price: sellingPrice,
        },
      ],
    }
    
    try {
      const res = await fetch("/api/push-to-shopify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: shopifyProduct, shop: shopDomain }),
      })
      const data = await res.json()
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, status: "pushed" } : p)),
        )
        toast({
          title: "Success!",
          description: "Product pushed to Shopify successfully",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to push product to Shopify",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to push product to Shopify",
        variant: "destructive",
      })
    } finally {
      setPushing((prev) => prev.filter((id) => id !== product.id))
    }
  }

  const handleBulkPush = async () => {
    if (selectedProducts.length === 0) return

    setPushing(selectedProducts)

    try {
      await new Promise((resolve) => setTimeout(resolve, 3000))

      setProducts((prev) =>
        prev.map((product) => (selectedProducts.includes(product.id) ? { ...product, status: "pushed" } : product)),
      )

      setSelectedProducts([])

      toast({
        title: "Success!",
        description: `${selectedProducts.length} products pushed to Shopify successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to push products to Shopify",
        variant: "destructive",
      })
    } finally {
      setPushing([])
    }
  }

  const handleConnectToShopify = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setIsConnected(true)

      toast({
        title: "Successfully connected!",
        description: "Your Shopify store has been connected successfully.",
      })
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Failed to connect to Shopify. Please try again.",
        variant: "destructive",
      })
    }
  }

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    )
  }

  const selectAll = () => {
    const unpushedProducts = products.filter((p) => p.status === "not_pushed").map((p) => p.id)
    setSelectedProducts(unpushedProducts)
  }

  const clearSelection = () => {
    setSelectedProducts([])
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
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Your Dashboard</h1>
            <p className="text-lg text-gray-600 mb-8">
              Connect to Shopify to start adding products
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add products to Shopify</h1>
            <p className="text-gray-600">Manage and sync your products with Shopify</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a href="/connect-shopify">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <ExternalLink className="h-4 w-4 mr-2" />
                Connect to Shopify
              </Button>
            </a>
            {selectedProducts.length > 0 && (
              <>
                <span className="text-sm text-gray-600">{selectedProducts.length} selected</span>
                <Button
                  onClick={handleBulkPush}
                  disabled={pushing.length > 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {pushing.length > 0 ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Pushing...
                    </>
                  ) : (
                    "Push Selected to Shopify"
                  )}
                </Button>
                <Button variant="outline" onClick={clearSelection}>
                  Clear Selection
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="relative">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge
                    variant={product.status === "pushed" ? "default" : "secondary"}
                    className={product.status === "pushed" ? "bg-green-600" : "bg-gray-500"}
                  >
                    {product.status === "pushed" ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Pushed
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Not Pushed
                      </>
                    )}
                  </Badge>
                </div>

                {product.status === "not_pushed" && (
                  <div className="absolute top-2 left-2">
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => toggleProductSelection(product.id)}
                      className="bg-white"
                    />
                  </div>
                )}
              </div>

              <CardHeader>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-green-600">
                    ₹{Math.round(product.price)}
                  </span>
                </div>

                <Button
                  onClick={() => product.status === "pushed" ? null : openPushModal(product)}
                  disabled={product.status === "pushed" || pushing.includes(product.id)}
                  className="w-full"
                  variant={product.status === "pushed" ? "outline" : "default"}
                >
                  {pushing.includes(product.id) ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Pushing...
                    </>
                  ) : product.status === "pushed" ? (
                    <>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on Shopify
                    </>
                  ) : (
                    "Push to Shopify"
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">Start by adding products to your inventory.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Push to Shopify Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Store
              </DialogTitle>
              <div className="text-sm text-gray-600">{shopDomain}</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeModal}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-6">
              {/* Product Details */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Image
                  src={selectedProduct.image || "/placeholder.svg"}
                  alt={selectedProduct.name}
                  width={60}
                  height={60}
                  className="rounded-md object-cover"
                />
                <div>
                  <h3 className="font-medium">{selectedProduct.name}</h3>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-gray-600" />
                  <span className="font-medium">Pricing</span>
                </div>
                
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">
                    Set Your Selling Price (₹)
                  </label>
                  <Input
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    placeholder="Enter selling price"
                    className="w-full"
                  />
                </div>

                {/* Cost Price Display */}
                <div className="text-sm text-gray-600">
                  Cost Price: ₹{Math.round(selectedProduct.price)}
                </div>

                {/* Margin Display */}
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Your Margin:</span>
                    <span className="font-bold text-green-600">₹{margin}</span>
                  </div>
                </div>
              </div>

              {/* Push Button */}
              <Button
                onClick={handlePushToShopify}
                disabled={!sellingPrice || parseFloat(sellingPrice) <= selectedProduct.price}
                className="w-full bg-black hover:bg-gray-800"
              >
                Push To Shopify
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
