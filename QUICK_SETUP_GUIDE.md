# Quick Setup Guide - Get Supplier Dashboard Working

## 🚨 **The Issue**
The "Creation Failed" error occurs because Supabase isn't properly configured. Here's how to fix it:

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
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (demo mode)
CREATE POLICY "Allow all operations" ON products
  FOR ALL USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
```

## ✅ **Step 3: Test the Setup**

1. **Restart your development server:**
```bash
npm run dev
```

2. **Go to `/supplier`** - should work without login
3. **Try creating a product** - should now work!

## 🔧 **Alternative: Quick Demo Mode**

If you want to test without setting up Supabase:

1. **Go to `/supplier`** - already works in demo mode
2. **The forms will show success messages** but won't save to database
3. **Perfect for testing the UI and user experience**

## 🎯 **What's Working Now**

✅ **Supplier Dashboard Access** - No login required  
✅ **Product Form UI** - All fields and validation  
✅ **Image Upload UI** - File selection and preview  
✅ **My Products Page** - Shows mock data  
✅ **Navigation** - Between List Product and My Products  

## 🚀 **Next Steps**

Once you set up Supabase:
1. Products will save to the database
2. Real authentication will work
3. Image uploads will work
4. Seller dashboard will show real products

**Try the supplier dashboard now - it should work in demo mode!** 