# Supabase Storage Setup for Product Images

## 1. Create Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Set the following:
   - **Name**: `product-images`
   - **Public bucket**: ✅ Check this (so images can be accessed publicly)
   - **File size limit**: `10MB` (or your preferred limit)
   - **Allowed MIME types**: `image/*`

## 2. Set Storage Policies

After creating the bucket, go to **Policies** and add the following policies:

### Policy 1: Allow authenticated users to upload images
```sql
CREATE POLICY "Allow authenticated users to upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' AND 
  auth.role() = 'authenticated'
);
```

### Policy 2: Allow users to view their own images
```sql
CREATE POLICY "Allow users to view their own images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'product-images' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Policy 3: Allow users to update their own images
```sql
CREATE POLICY "Allow users to update their own images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product-images' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Policy 4: Allow users to delete their own images
```sql
CREATE POLICY "Allow users to delete their own images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Policy 5: Allow public access to approved product images
```sql
CREATE POLICY "Allow public access to product images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'product-images'
);
```

## 3. Test the Setup

1. Try uploading an image through the supplier dashboard
2. Check if the image appears in the Storage section
3. Verify the image URL is accessible publicly

## 4. Troubleshooting

### Common Issues:

1. **"Bucket not found" error**
   - Make sure the bucket name is exactly `product-images`
   - Check that the bucket was created successfully

2. **"Permission denied" error**
   - Verify all storage policies are in place
   - Check that the user is authenticated
   - Ensure the bucket is public

3. **Images not displaying**
   - Check the public URL format
   - Verify the image file exists in the bucket
   - Check browser console for CORS errors

### Manual Test:

You can test the storage manually by running this in your browser console:

```javascript
// Test upload (requires authentication)
const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
const { data, error } = await supabase.storage
  .from('product-images')
  .upload('test/test.jpg', file);

console.log('Upload result:', { data, error });
```

## 5. Environment Variables

Make sure your `.env.local` file includes:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 6. Security Notes

- Images are stored in user-specific folders (`{user_id}/{filename}`)
- Only authenticated users can upload images
- Public access is allowed for viewing product images
- File size and type restrictions are enforced
- Users can only manage their own uploaded images 