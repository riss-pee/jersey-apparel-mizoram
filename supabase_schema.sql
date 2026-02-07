
-- 1. Enable RLS and clean setup
-- Note: Run these in the Supabase SQL Editor

-- PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  team TEXT NOT NULL,
  price NUMERIC NOT NULL,
  image TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  description TEXT,
  stock INTEGER DEFAULT 0,
  status TEXT DEFAULT 'AVAILABLE',
  category TEXT DEFAULT 'OTHER',
  sizes TEXT[] DEFAULT '{"S", "M", "L", "XL"}'
);

-- REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  "productId" TEXT REFERENCES public.products(id) ON DELETE CASCADE,
  "userId" UUID NOT NULL,
  "userName" TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- SITE SETTINGS
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  "aboutUs" TEXT,
  "instagramHandle" TEXT,
  "whatsappNumber" TEXT,
  "footerTagline" TEXT,
  "upiId" TEXT,
  "gPayNumber" TEXT,
  "paytmNumber" TEXT,
  "paymentQrCode" TEXT
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

-- HERO SLIDES
CREATE TABLE IF NOT EXISTS public.hero_slides (
  id TEXT PRIMARY KEY,
  badge TEXT,
  title TEXT,
  description TEXT,
  "buttonText" TEXT DEFAULT 'Shop Now',
  "accentColor" TEXT DEFAULT '#064e3b',
  "displayOrder" INTEGER DEFAULT 1
);

-- 2. SECURITY POLICIES (Row Level Security)

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public Read Reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public Read Settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public Read Hero" ON public.hero_slides FOR SELECT USING (true);

-- Authenticated Review creation
CREATE POLICY "Users can add reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = "userId");

-- Order Security (Users see their own, Admins see all)
CREATE POLICY "Users can see own orders" ON public.orders FOR SELECT 
  USING (auth.uid() = user_id OR (auth.jwt() ->> 'role' = 'ADMIN'));

CREATE POLICY "Users can place orders" ON public.orders FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Admin Only Policies (Simplified - assumes metadata 'role' is used)
-- Note: In Supabase, you usually check the 'raw_user_meta_data'
CREATE POLICY "Admins can manage products" ON public.products FOR ALL 
  USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'ADMIN');

CREATE POLICY "Admins can manage settings" ON public.site_settings FOR ALL 
  USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'ADMIN');

CREATE POLICY "Admins can manage hero" ON public.hero_slides FOR ALL 
  USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'ADMIN');

CREATE POLICY "Admins can manage orders" ON public.orders FOR ALL 
  USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'ADMIN');

-- 3. INITIAL DATA (Optional seed)
INSERT INTO public.site_settings (id, "aboutUs", "instagramHandle", "whatsappNumber", "footerTagline")
VALUES ('global', 'Mizoram''s leading destination for authentic football kits.', 'jerseyapparel_mizoram', '919876543210', 'Authenticity and passion in every thread.')
ON CONFLICT (id) DO NOTHING;
