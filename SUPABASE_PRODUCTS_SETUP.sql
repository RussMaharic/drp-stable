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

-- Create indexes for better performance
CREATE INDEX idx_products_supplier_id ON products(supplier_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_created_at ON products(created_at);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all approved products (for sellers)
CREATE POLICY "Users can view approved products" ON products
  FOR SELECT USING (status = 'approved');

-- Policy: Users can view their own products (for suppliers)
CREATE POLICY "Users can view own products" ON products
  FOR SELECT USING (supplier_id = auth.uid());

-- Policy: Users can insert their own products
CREATE POLICY "Users can insert own products" ON products
  FOR INSERT WITH CHECK (supplier_id = auth.uid());

-- Policy: Users can update their own products
CREATE POLICY "Users can update own products" ON products
  FOR UPDATE USING (supplier_id = auth.uid());

-- Policy: Users can delete their own products
CREATE POLICY "Users can delete own products" ON products
  FOR DELETE USING (supplier_id = auth.uid());

-- Create function to automatically set supplier_name
CREATE OR REPLACE FUNCTION set_supplier_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Get supplier name from user metadata or email
  SELECT COALESCE(
    (raw_user_meta_data->>'full_name'),
    (raw_user_meta_data->>'name'),
    email
  ) INTO NEW.supplier_name
  FROM auth.users
  WHERE id = NEW.supplier_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set supplier_name
CREATE TRIGGER set_supplier_name_trigger
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_supplier_name();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 