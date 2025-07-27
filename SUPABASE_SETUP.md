# Supabase Setup for Shopify Token Storage

## 🔧 **Setup Instructions**

### 1. **Create Supabase Project**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and anon key

### 2. **Create Database Table**
Run this SQL in your Supabase SQL editor:

```sql
-- Create shopify_tokens table
CREATE TABLE shopify_tokens (
  id SERIAL PRIMARY KEY,
  shop VARCHAR(255) UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_shopify_tokens_shop ON shopify_tokens(shop);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE shopify_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for development)
CREATE POLICY "Allow all operations" ON shopify_tokens FOR ALL USING (true);
```

### 3. **Environment Variables**
Add these to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. **Test the Setup**
1. Start your development server
2. Connect to Shopify
3. Navigate to different pages - tokens should persist now!

## 🎯 **Benefits**
- ✅ Tokens persist across page refreshes
- ✅ Tokens persist across navigation
- ✅ Tokens persist across browser sessions
- ✅ Fallback to in-memory storage if Supabase fails
- ✅ Secure token storage in database

## 🔍 **Troubleshooting**
If you see "Missing token" errors:
1. Check your Supabase credentials
2. Verify the table was created correctly
3. Check browser console for errors
4. Try re-authenticating with Shopify 