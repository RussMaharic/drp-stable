# Simple Storage Policy Setup Guide

## 🎯 **Step-by-Step Storage Setup**

### **Step 1: Create the Bucket**

1. **Go to Supabase Dashboard**
   - Open your Supabase project
   - Click **"Storage"** in the left sidebar

2. **Create New Bucket**
   - Click **"Create a new bucket"**
   - **Name**: `product-images`
   - **Public bucket**: ✅ **CHECK THIS** (important!)
   - **File size limit**: `10MB`
   - **Allowed MIME types**: `image/*`
   - Click **"Create bucket"**

### **Step 2: Add Storage Policies**

**After creating the bucket, you'll see a "Policies" tab. Click on it and add these policies:**

#### **Policy 1: Upload Images**
- Click **"New Policy"**
- **Policy Name**: `Allow uploads`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
(bucket_id = 'product-images')
```
- Click **"Review"** then **"Save policy"**

#### **Policy 2: View Images**
- Click **"New Policy"**
- **Policy Name**: `Allow public view`
- **Target roles**: `public`
- **Policy definition**:
```sql
(bucket_id = 'product-images')
```
- Click **"Review"** then **"Save policy"**

#### **Policy 3: Delete Images**
- Click **"New Policy"**
- **Policy Name**: `Allow deletes`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
(bucket_id = 'product-images')
```
- Click **"Review"** then **"Save policy"**

### **Step 3: Alternative - Use SQL Editor**

If the UI method doesn't work, use the **SQL Editor**:

1. Go to **SQL Editor** in Supabase
2. Run this SQL:

```sql
-- Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow uploads
CREATE POLICY "Allow uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-images');

-- Allow public viewing
CREATE POLICY "Allow public view" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Allow deletes
CREATE POLICY "Allow deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'product-images');
```

### **Step 4: Test the Setup**

1. **Check Bucket Creation**
   - Go to Storage → You should see `product-images` bucket
   - Status should show as "Public"

2. **Check Policies**
   - Click on the bucket → Go to "Policies" tab
   - You should see 3 policies listed

3. **Test Upload**
   - Try uploading an image through your app
   - Check if it appears in the bucket

### **🔧 Troubleshooting**

**If you get "Policy creation failed":**
- Make sure the bucket exists first
- Try the SQL method instead of UI
- Check that you're using the correct bucket name

**If uploads fail:**
- Verify the bucket is marked as "Public"
- Check that all 3 policies are created
- Ensure your environment variables are set correctly

**If images don't display:**
- Check the bucket is public
- Verify the image URL format
- Test the URL directly in browser

### **✅ Quick Check**

Your storage should have:
- ✅ Bucket named `product-images`
- ✅ Bucket marked as "Public"
- ✅ 3 policies (upload, view, delete)
- ✅ No error messages in policies

**That's it! Your storage should now work with the supplier dashboard.** 