# 🇲🇿 Jersey Apparel Mizoram

A premium e-commerce platform built for the Mizoram football community. Features include authentic kit browsing, WhatsApp integration, AI-generated product descriptions, and a full administrative suite.

## 🚀 Quick GitHub Update
To push your latest changes to GitHub:
1. `git add .`
2. `git commit -m "Describe your changes here"`
3. `git push origin main`

## 🛠️ Supabase Setup

### 1. Database Tables
Ensure you have the following tables in your Supabase project:
- **products**: `id (text), name (text), team (text), price (int4), image (text), description (text), stock (int4), status (text), category (text), sizes (text[])`
- **orders**: `id (text), user_id (uuid), user_name (text), user_email (text), items (jsonb), total_amount (numeric), status (text), shipping_address (text), created_at (timestamptz), latitude (float8), longitude (float8)`

### 2. Storage Configuration
1. Create a **Public** bucket named `product-images`.
2. Run this SQL in the **SQL Editor** to fix the "Row-Level Security" error:
```sql
-- Allow anyone to view product images
create policy "Public Access" on storage.objects for select using ( bucket_id = 'product-images' );

-- Allow admins (authenticated users) to upload images
create policy "Authenticated Upload" on storage.objects for insert to authenticated with check ( bucket_id = 'product-images' );

-- Allow admins to delete/update
create policy "Admin Management" on storage.objects for all to authenticated using ( bucket_id = 'product-images' );
```

## 🔑 Environment Variables
The app requires the following (handled automatically in this environment):
- `process.env.API_KEY`: Your Google Gemini API Key.
- Supabase URL and Anon Key (configured in `services/supabaseClient.ts`).

## 📱 Features
- **WhatsApp Checkout**: Connect directly with customers in Mizoram.
- **AI Copywriter**: Uses Gemini 3 to write professional jersey descriptions.
- **Admin Panel**: Manage inventory and track orders with GPS locations.
- **Geolocation**: Capture precise delivery coordinates for Aizawl's unique topography.
