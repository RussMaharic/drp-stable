# 🚀 Multi-Supplier Product System Setup Guide

## 📋 **Overview**

This guide will help you set up the complete multi-supplier product system in your Roposo Clone application. The system includes:

- **Supplier Dashboard**: For suppliers to list and manage products
- **Seller Dashboard**: For sellers to browse and push approved products to Shopify
- **Database**: Supabase tables for product management
- **Storage**: Supabase storage for product images
- **API Routes**: Backend endpoints for all operations

## 🗄️ **Step 1: Database Setup**

### 1.1 Create Products Table

Run the SQL from `SUPABASE_PRODUCTS_SETUP.sql` in your Supabase SQL editor:

```sql
-- Create products table for multi-supplier system
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  images TEXT[] DEFAULT '{}',
  supplier_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  supplier_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes and policies (see the full SQL file)
```

### 1.2 Verify Table Creation

1. Go to your Supabase dashboard
2. Navigate to **Table Editor**
3. Verify the `products` table exists with all columns
4. Check that RLS (Row Level Security) is enabled

## 📁 **Step 2: Storage Setup**

### 2.1 Create Storage Bucket

1. Go to **Storage** in your Supabase dashboard
2. Click **Create a new bucket**
3. Set:
   - **Name**: `product-images`
   - **Public bucket**: ✅ Checked
   - **File size limit**: `10MB`
   - **Allowed MIME types**: `image/*`

### 2.2 Set Storage Policies

Run these policies in your Supabase SQL editor:

```sql
-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' AND 
  auth.role() = 'authenticated'
);

-- Allow users to view their own images
CREATE POLICY "Allow users to view their own images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'product-images' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public access to product images
CREATE POLICY "Allow public access to product images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'product-images'
);
```

## 🔧 **Step 3: Environment Variables**

Update your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Shopify Configuration (existing)
SHOPIFY_CLIENT_ID=your_shopify_client_id
SHOPIFY_CLIENT_SECRET=your_shopify_client_secret
```

## 🚀 **Step 4: Install Dependencies**

Make sure you have the required dependencies:

```bash
npm install @supabase/supabase-js
# or
pnpm add @supabase/supabase-js
```

## 🧪 **Step 5: Test the System**

### 5.1 Test Supplier Dashboard

1. Start your development server: `npm run dev`
2. Navigate to `/supplier`
3. Try to submit a product (you'll need to be authenticated)
4. Check if the product appears in the database

### 5.2 Test Seller Dashboard

1. Navigate to `/dashboard`
2. Connect to Shopify (if not already connected)
3. Check if approved products appear in the product grid
4. Test the "Push to Shopify" functionality

### 5.3 Test Image Upload

1. In the supplier dashboard, try uploading an image
2. Check if the image appears in Supabase Storage
3. Verify the image displays correctly in the product cards

## 🔐 **Step 6: Authentication Setup**

### 6.1 Enable Supabase Auth

1. Go to **Authentication** in your Supabase dashboard
2. Enable **Email** provider
3. Configure any additional providers as needed

### 6.2 Test Authentication

1. Try accessing `/supplier` without authentication
2. You should be redirected to a login page
3. Create an account and test the supplier dashboard

## 📊 **Step 7: Admin Functions (Optional)**

### 7.1 Manual Product Approval

To approve products manually, run this SQL in Supabase:

```sql
-- Approve a specific product
UPDATE products 
SET status = 'approved' 
WHERE id = 'your_product_id';

-- Approve all pending products (use with caution)
UPDATE products 
SET status = 'approved' 
WHERE status = 'pending';
```

### 7.2 View All Products

```sql
-- View all products with supplier info
SELECT 
  p.*,
  u.email as supplier_email
FROM products p
LEFT JOIN auth.users u ON p.supplier_id = u.id
ORDER BY p.created_at DESC;
```

## 🐛 **Troubleshooting**

### Common Issues:

1. **"Table doesn't exist" error**
   - Make sure you ran the SQL setup script
   - Check that the table name is exactly `products`

2. **"Permission denied" error**
   - Verify RLS policies are in place
   - Check that the user is authenticated
   - Ensure the user owns the resource they're trying to access

3. **Images not uploading**
   - Check storage bucket exists and is public
   - Verify storage policies are set correctly
   - Check file size and type restrictions

4. **Products not showing in seller dashboard**
   - Make sure products have `status = 'approved'`
   - Check that the ProductService is working correctly
   - Verify the API routes are responding

### Debug Commands:

```javascript
// Test database connection
const { data, error } = await supabase
  .from('products')
  .select('*')
  .limit(1);
console.log('DB Test:', { data, error });

// Test storage
const { data: storageData, error: storageError } = await supabase.storage
  .from('product-images')
  .list();
console.log('Storage Test:', { storageData, storageError });
```

## 📈 **Step 8: Production Deployment**

### 8.1 Environment Variables

Make sure all environment variables are set in your production environment:

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
SHOPIFY_CLIENT_ID=your_shopify_client_id
SHOPIFY_CLIENT_SECRET=your_shopify_client_secret
```

### 8.2 Database Migration

If you need to migrate existing data, create a migration script:

```sql
-- Example: Migrate from old product structure
INSERT INTO products (title, description, price, supplier_id, status)
SELECT 
  name as title,
  description,
  price,
  'default-supplier-id' as supplier_id,
  'approved' as status
FROM old_products_table;
```

## 🎯 **Next Steps**

1. **Add Admin Dashboard**: Create an admin interface for product approval
2. **Email Notifications**: Send emails when products are approved/rejected
3. **Analytics**: Add product performance tracking
4. **Bulk Operations**: Allow bulk product approval/rejection
5. **Product Categories**: Add category management
6. **Supplier Verification**: Add supplier verification process

## 📞 **Support**

If you encounter any issues:

1. Check the browser console for errors
2. Verify all setup steps are completed
3. Test each component individually
4. Check Supabase logs for database errors
5. Verify environment variables are correct

---

**🎉 Congratulations!** Your multi-supplier product system is now ready to use. 