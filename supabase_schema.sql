
-- 1. CLEAN SETUP & EXTENSIONS
-- Note: Execute this in the Supabase SQL Editor

-- PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  team TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  image TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  description TEXT,
  stock INTEGER DEFAULT 0,
  status TEXT DEFAULT 'AVAILABLE',
  version TEXT DEFAULT 'FAN', -- 'PLAYER', 'MASTER', 'FAN'
  category TEXT DEFAULT 'OTHER',
  sizes TEXT[] DEFAULT '{"S", "M", "L", "XL"}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_team ON public.products(team);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);

-- REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  productId TEXT REFERENCES public.products(id) ON DELETE CASCADE,
  userId UUID NOT NULL,
  userName TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  createdAt TIMESTAMPTZ DEFAULT NOW()
);

-- SITE SETTINGS (Global configuration)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  aboutUs TEXT,
  instagramHandle TEXT,
  whatsappNumber TEXT,
  footerTagline TEXT,
  upiId TEXT,
  gPayNumber TEXT,
  paytmNumber TEXT,
  paymentQrCode TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'PENDING',
  shipping_address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  latitude FLOAT8,
  longitude FLOAT8
);

-- HERO SLIDES (Carousel Management)
CREATE TABLE IF NOT EXISTS public.hero_slides (
  id TEXT PRIMARY KEY,
  badge TEXT,
  title TEXT,
  description TEXT,
  buttonText TEXT DEFAULT 'Shop Now',
  accentColor TEXT DEFAULT '#064e3b',
  displayOrder INTEGER DEFAULT 1
);

-- 2. SECURITY POLICIES (Row Level Security)

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ ACCESS (Allow users to see content)
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public Read Reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public Read Settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public Read Hero" ON public.hero_slides FOR SELECT USING (true);

-- REVIEWS (Authenticated users can post)
CREATE POLICY "Users can add reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = userId);

-- ORDERS (Users see their own, Admins see all)
CREATE POLICY "Users can see own orders" ON public.orders FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'ADMIN'));

CREATE POLICY "Users can place orders" ON public.orders FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- ADMIN MANAGEMENT (Inventory, Settings, Logistics)
CREATE POLICY "Admins manage products" ON public.products FOR ALL 
  TO authenticated 
  USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'ADMIN');

CREATE POLICY "Admins manage settings" ON public.site_settings FOR ALL 
  TO authenticated 
  USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'ADMIN');

CREATE POLICY "Admins manage hero" ON public.hero_slides FOR ALL 
  TO authenticated 
  USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'ADMIN');

CREATE POLICY "Admins manage orders" ON public.orders FOR ALL 
  TO authenticated 
  USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'ADMIN');

-- 3. SEED INITIAL DATA
INSERT INTO public.site_settings (id, aboutUs, instagramHandle, whatsappNumber, footerTagline)
VALUES ('global', 'Mizoram''s leading destination for authentic football kits.', 'jerseyapparel_mizoram', '919876543210', 'Authenticity and passion in every thread.')
ON CONFLICT (id) DO NOTHING;
