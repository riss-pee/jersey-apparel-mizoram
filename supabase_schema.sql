
-- 1. Products Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  team TEXT,
  price NUMERIC,
  image TEXT,
  images TEXT[],
  description TEXT,
  stock INTEGER,
  status TEXT,
  category TEXT,
  sizes TEXT[]
);

-- 2. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  "productId" TEXT REFERENCES products(id) ON DELETE CASCADE,
  "userId" UUID,
  "userName" TEXT,
  rating INTEGER,
  comment TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Site Settings
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY,
  "aboutUs" TEXT,
  "instagramHandle" TEXT,
  "whatsappNumber" TEXT,
  "footerTagline" TEXT,
  "upiId" TEXT,
  "gPayNumber" TEXT,
  "paytmNumber" TEXT,
  "paymentQrCode" TEXT
);

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  user_phone TEXT,
  items JSONB,
  total_amount NUMERIC,
  status TEXT,
  shipping_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  latitude FLOAT8,
  longitude FLOAT8
);

-- 5. Hero Slides
CREATE TABLE IF NOT EXISTS hero_slides (
  id TEXT PRIMARY KEY,
  badge TEXT,
  title TEXT,
  description TEXT,
  "buttonText" TEXT,
  "accentColor" TEXT,
  "displayOrder" INTEGER
);
