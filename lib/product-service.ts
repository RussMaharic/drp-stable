import { supabase } from './supabase'
import { Product, CreateProductData, UpdateProductData } from './types/product'

export class ProductService {
  // Get all approved products (for sellers)
  static async getApprovedProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching approved products:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getApprovedProducts:', error)
      return []
    }
  }

  // Get products for current supplier
  static async getSupplierProducts(): Promise<Product[]> {
    try {
      // Get supplier name from localStorage
      const supplierName = localStorage.getItem('supplierName') || 'Unknown Supplier'
      const supplierId = supplierName // Use name as ID for simplicity

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('supplier_id', supplierId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching supplier products:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getSupplierProducts:', error)
      return []
    }
  }

  // Create a new product
  static async createProduct(productData: CreateProductData): Promise<Product | null> {
    try {
      // Get supplier name from localStorage
      const supplierName = localStorage.getItem('supplierName') || 'Unknown Supplier'
      const supplierId = supplierName // Use name as ID for simplicity

      const { data, error } = await supabase
        .from('products')
        .insert({
          ...productData,
          supplier_id: supplierId,
          supplier_name: supplierName,
          status: 'approved', // All products are approved by default
          images: productData.images || []
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating product:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in createProduct:', error)
      return null
    }
  }

  // Update a product
  static async updateProduct(productId: string, updateData: UpdateProductData): Promise<Product | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId)
        .eq('supplier_id', user.id) // Ensure user owns the product
        .select()
        .single()

      if (error) {
        console.error('Error updating product:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in updateProduct:', error)
      return null
    }
  }

  // Delete a product
  static async deleteProduct(productId: string): Promise<boolean> {
    try {
      const supplierName = localStorage.getItem('supplierName') || 'Unknown Supplier'
      const supplierId = supplierName // Use name as ID for simplicity

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('supplier_id', supplierId) // Ensure supplier owns the product

      if (error) {
        console.error('Error deleting product:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in deleteProduct:', error)
      return false
    }
  }

  // Get a single product by ID
  static async getProductById(productId: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (error) {
        console.error('Error fetching product:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getProductById:', error)
      return null
    }
  }

  // Upload image to Supabase Storage
  static async uploadImage(file: File): Promise<string | null> {
    try {
      const supplierName = localStorage.getItem('supplierName') || 'unknown'
      const fileExt = file.name.split('.').pop()
      const fileName = `${supplierName}/${Date.now()}.${fileExt}`

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file)

      if (error) {
        console.error('Error uploading image:', error)
        return null
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

      return urlData.publicUrl
    } catch (error) {
      console.error('Error in uploadImage:', error)
      return null
    }
  }
} 