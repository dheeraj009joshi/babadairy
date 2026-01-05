# Supabase Setup Guide

## Step 1: Create Supabase Account & Project

1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Fill in project details:
   - Name: `jasmey-icecream` (or your choice)
   - Database Password: (save this securely)
   - Region: Choose closest to you
4. Wait for project to be created (~2 minutes)

## Step 2: Get API Credentials

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 3: Set Environment Variables

1. Create a `.env` file in the root directory (copy from `.env.example`)
2. Add your credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 4: Create Database Tables

1. Go to **SQL Editor** in Supabase dashboard
2. Click **New Query**
3. Copy and paste the SQL below:

```sql
-- Products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(5, 2) DEFAULT 0,
  images JSONB DEFAULT '[]'::jsonb,
  sizes JSONB DEFAULT '[]'::jsonb,
  stock INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  flavors JSONB DEFAULT '[]'::jsonb,
  dietary JSONB DEFAULT '[]'::jsonb,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  ingredients TEXT,
  nutrition JSONB,
  status TEXT DEFAULT 'active',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id TEXT,
  customer JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) NOT NULL,
  delivery_charges DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  invoice_number TEXT,
  status TEXT DEFAULT 'pending',
  status_history JSONB DEFAULT '[]'::jsonb,
  estimated_delivery DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password TEXT,
  role TEXT DEFAULT 'customer',
  addresses JSONB DEFAULT '[]'::jsonb,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies (allow public read, authenticated write)
CREATE POLICY "Allow public read access" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON reviews FOR SELECT USING (true);

-- For authenticated users (you can customize these)
CREATE POLICY "Allow authenticated insert" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON products FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete" ON products FOR DELETE USING (true);

CREATE POLICY "Allow authenticated insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON orders FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated insert" ON reviews FOR INSERT WITH CHECK (true);
```

4. Click **Run** to execute the SQL

## Step 5: Test the Connection

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. The app will automatically use Supabase if environment variables are set
3. If Supabase is not configured, it will fall back to localStorage/JSON files

## Step 6: Migrate Existing Data (Optional)

If you have existing data in JSON files:

1. Go to **Table Editor** in Supabase
2. Select the table (e.g., `products`)
3. Click **Insert** → **Import data from CSV** or manually add rows
4. Or use the Supabase API to bulk insert

## Troubleshooting

- **"Missing Supabase environment variables"**: Make sure `.env` file exists and has correct values
- **"Error fetching from Supabase"**: Check your API keys and network connection
- **"Permission denied"**: Check RLS policies in Supabase dashboard
- **Data not syncing**: Check browser console for errors

## Benefits

✅ Real-time data sync across all users  
✅ Persistent storage (no localStorage limits)  
✅ Automatic backups  
✅ Scalable database  
✅ Free tier: 500MB database, 2GB bandwidth/month  

## Notes

- The app automatically falls back to localStorage/JSON if Supabase is not configured
- All data operations try Supabase first, then fall back to localStorage
- No code changes needed - just set environment variables!

