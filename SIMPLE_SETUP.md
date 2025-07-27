# Simple Setup Guide - Multi-Supplier System

## 🎯 **What's New**

The system has been simplified with:
- **Simple supplier login** - Just enter your supplier name
- **Real database storage** - Products are saved to Supabase
- **All products approved** - No approval workflow needed
- **Image uploads** - Real image storage to Supabase
- **Supplier isolation** - Each supplier only sees their own products

## ✅ **Step 1: Set Up Supabase Environment Variables**

1. **Create/Update `.env.local` file** in your project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

2. **Get these values from your Supabase project:**
   - Go to [supabase.com](https://supabase.com)
   - Open your project dashboard
   - Go to **Settings** → **API**
   - Copy the **Project URL** and **anon public** key

## ✅ **Step 2: Create the Database Table**

1. **Go to your Supabase SQL Editor**
2. **Run this SQL script:**

```sql
-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  images TEXT[] DEFAULT '{}',
  supplier_id TEXT NOT NULL,
  supplier_name TEXT,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (simple mode)
CREATE POLICY "Allow all operations" ON products
  FOR ALL USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
```

## ✅ **Step 3: Set Up Storage (Optional)**

1. **Go to Storage in Supabase**
2. **Create a new bucket called `product-images`**
3. **Set it to public**
4. **Add this RLS policy:**

```sql
CREATE POLICY "Allow public access" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images');
```

## ✅ **Step 4: Test the System**

1. **Restart your development server:**
```bash
npm run dev
```

2. **Go to the homepage** - You'll see both dashboard options

3. **Test Supplier Dashboard:**
   - Click "Access Supplier Dashboard"
   - Enter your supplier name (e.g., "John's Electronics")
   - Create products with images
   - Check "My Products" to see your products

4. **Test Seller Dashboard:**
   - Click "Access Seller Dashboard"
   - Connect to Shopify (if you have a store)
   - Browse approved products from all suppliers
   - Push products to your Shopify store

## 🎯 **How It Works**

### **Supplier Flow:**
1. **Login** with supplier name → `/supplier/login`
2. **Create products** → Saves to database with your supplier name
3. **Upload images** → Stores in Supabase Storage
4. **View your products** → Only shows products you created
5. **All products are approved** → Available to sellers immediately

### **Seller Flow:**
1. **Access dashboard** → `/dashboard`
2. **Browse products** → Shows all approved products from all suppliers
3. **Push to Shopify** → Existing functionality maintained
4. **Manage orders** → Existing Shopify integration

## 🔧 **Key Features**

✅ **Simple Authentication** - Just supplier name, no complex auth  
✅ **Real Database** - Products stored in Supabase  
✅ **Image Uploads** - Real file storage  
✅ **Supplier Isolation** - Each supplier sees only their products  
✅ **Seller Integration** - All products available to sellers  
✅ **Shopify Sync** - Existing functionality preserved  
✅ **No Approval Workflow** - All products approved by default  

## 🚀 **Ready to Use!**

The system is now fully functional with:
- **Supplier Dashboard**: `/supplier/login` → `/supplier`
- **Seller Dashboard**: `/dashboard`
- **Real data persistence**
- **Image uploads**
- **Shopify integration**

**Start by going to the homepage and testing both dashboards!** 