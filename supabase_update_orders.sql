
-- UPGRADE SCRIPT FOR JAM ORDERS TABLE
-- This script ensures existing database instances have the latest logistical columns.

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS user_phone TEXT,
ADD COLUMN IF NOT EXISTS latitude FLOAT8,
ADD COLUMN IF NOT EXISTS longitude FLOAT8;

-- Add index to speed up lookups for individual user dashboards
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);

-- Ensure RLS allows the logistics team to see these fields
-- No policy change required as existing "Public Read" or "Admin Management" 
-- policies naturally include newly added columns.

COMMENT ON COLUMN public.orders.latitude IS 'Logistical GPS Latitude for Aizawl delivery terminal.';
COMMENT ON COLUMN public.orders.longitude IS 'Logistical GPS Longitude for Aizawl delivery terminal.';
