# 🇲🇿 Jersey Apparel Mizoram (JAM) - Technical Documentation

## 1. Project Overview
**Jersey Apparel Mizoram (JAM)** is a premium, high-end e-commerce platform specifically engineered for the football community in Mizoram. The application bridges the gap between international sports retail standards and the unique local logistics of Aizawl, featuring AI-driven content generation and precise geolocation tracking.

---

## 2. Tech Stack
- **Frontend**: React 19 (TypeScript)
- **Styling**: Tailwind CSS (Custom "JAM Green" Design System)
- **Backend-as-a-Service**: Supabase
  - **Authentication**: Email/Password + Metadata-based Roles
  - **Database**: PostgreSQL (Real-time enabled)
  - **Storage**: S3-compliant bucket for high-res jersey imagery
- **AI Integration**: Google Gemini 3 (Flash Preview)
- **Logistics**: Browser Geolocation API
- **Communication**: WhatsApp Business Integration

---

## 3. Core Features

### 🛍️ E-Commerce Engine
- **Smart Catalog**: Filter by League (Premier League, La Liga, etc.) or specific Team.
- **Dynamic Product Details**: Multi-image galleries, size selection, and stock status indicators.
- **Persistent Cart**: LocalStorage-backed shopping bag that survives session refreshes.
- **Tactical Checkout**: 
  - GPS Coordinate capture to handle Aizawl's complex house numbering.
  - Scan-to-Pay terminal with Admin-managed QR codes.

### 👤 User Experience
- **Locker Room (Dashboard)**: Track order status (Pending → Processing → Shipped → Delivered).
- **Field Reports (Reviews)**: Verified purchasers can leave star ratings and tactical feedback on kits.
- **Profile Management**: Update delivery address and contact details.

### ⚡ Admin Suite (Command Center)
- **Inventory Control**: Add/Edit kits with AI-powered copywriting for descriptions.
- **Logistics Management**: Live order tracking, WhatsApp quick-contact, and Google Maps pin integration.
- **Hero Management**: Full control over the home page's "high-impact" carousel slides.
- **Global Settings**: Configure UPI IDs, WhatsApp numbers, and "About Us" branding.

---

## 4. Database Architecture
The system relies on five core tables:

| Table | Purpose |
| :--- | :--- |
| `products` | Stores jersey specs, price, stock, and array of image URLs. |
| `orders` | Tracks transactions, items (JSONB), and GPS coordinates. |
| `reviews` | Links users to products with ratings and comments. |
| `hero_slides` | Stores home page banner configurations. |
| `site_settings` | Global singleton for brand contact and payment info. |

---

## 5. AI Integration (Gemini)
The application uses the `gemini-3-flash-preview` model to act as a "High-end Sports Copywriter." 
- **Trigger**: Located in the Admin Product Modal.
- **Function**: Takes `Team Name` and `Model Name` to generate 80-word premium descriptions emphasizing fabric quality and local pride.

---

## 6. Installation & Setup

### Environment Variables
Ensure the following are configured in your environment:
- `API_KEY`: Google Gemini API Key.
- Supabase URL and Anon Key (pre-configured in `services/supabaseClient.ts`).

### Supabase Storage
1. Create a public bucket named `product-images`.
2. Apply the RLS policies found in the `README.md` to allow public viewing and authenticated uploads.

### Database Setup
Execute the contents of `supabase_schema.sql` in your Supabase SQL Editor to initialize all tables and security policies.

---

## 7. Branding Guidelines
- **Primary Color**: `#064e3b` (JAM Green)
- **Secondary Color**: `#E8E1D3` (Light Parchment)
- **Typography**: Inter (Sans-serif) with Black Italic headers for a "Sports Magazine" feel.
- **Tone of Voice**: Professional, Passionate, Authentic.

---

## 8. Development & Deployment
- **Bundler**: Vite 6
- **Deployment**: Optimized for Netlify or Vercel (configuration files included).
- **Offline Support**: Single Page Application (SPA) architecture with client-side routing.

---
*Document Version: 1.0.0*
*Last Updated: 2024*
*Author: JAM Engineering Team*
