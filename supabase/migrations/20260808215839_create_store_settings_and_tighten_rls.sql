/*
# Create store_settings table and tighten RLS for admin auth

## Summary
Adds a `store_settings` singleton table for CMS customization (upsell toggle, interface texts, background image).
Tightens RLS on `games`, `accessories`, and `orders` so that public (anon) users can only READ catalog data and CREATE/UPDATE orders, while admin (authenticated) users retain full CRUD. This protects the admin panel behind Supabase email/password auth.

## 1. New Table: store_settings
- `id` (int, PK, always 1) — singleton enforcement
- `upsell_enabled` (boolean, default true) — toggles the upsell screen
- `hero_title` (text) — main heading on the customer site
- `hero_subtitle` (text) — subheading on the customer site
- `badge_text` (text) — green pill label text
- `background_image_url` (text) — optional background image URL
- `updated_at` (timestamptz)

A single default row (id=1) is inserted with sensible defaults.

## 2. RLS Changes

### games (tightened)
- SELECT: anon + authenticated (public catalog read)
- INSERT/UPDATE/DELETE: authenticated only (admin management)

### accessories (tightened)
- SELECT: anon + authenticated (public catalog read)
- INSERT/UPDATE/DELETE: authenticated only (admin management)

### store_settings (new)
- SELECT: anon + authenticated (public reads settings to render site)
- INSERT/UPDATE/DELETE: authenticated only (admin manages settings)

### orders (tightened)
- INSERT: anon + authenticated (public submits orders)
- UPDATE: anon + authenticated (public adds accessories post-purchase)
- SELECT/DELETE: authenticated only (admin views and deletes orders)

## 3. Important Notes
- The admin panel now requires Supabase email/password authentication.
- The public funnel can still read games, accessories, and store_settings, and create/update orders.
- The public funnel CANNOT read or delete orders — only the authenticated admin can.
- store_settings is a singleton: only one row with id=1 should ever exist.
*/
-- ===================== STORE SETTINGS =====================
CREATE TABLE IF NOT EXISTS store_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  upsell_enabled boolean NOT NULL DEFAULT true,
  hero_title text NOT NULL DEFAULT 'Monte seu HD de Xbox 360',
  hero_subtitle text NOT NULL DEFAULT 'Escolha seu console, selecione os jogos e finalize seu pedido.',
  badge_text text NOT NULL DEFAULT 'Xbox 360',
  background_image_url text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

INSERT INTO store_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "anon_select_store_settings" ON store_settings;
CREATE POLICY "anon_select_store_settings" ON store_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_store_settings" ON store_settings;
CREATE POLICY "auth_insert_store_settings" ON store_settings FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_store_settings" ON store_settings;
CREATE POLICY "auth_update_store_settings" ON store_settings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_store_settings" ON store_settings;
CREATE POLICY "auth_delete_store_settings" ON store_settings FOR DELETE
  TO authenticated USING (true);

-- ===================== GAMES: tighten to auth-only writes =====================
DROP POLICY IF EXISTS "anon_insert_games" ON games;
DROP POLICY IF EXISTS "anon_update_games" ON games;
DROP POLICY IF EXISTS "anon_delete_games" ON games;

CREATE POLICY "auth_insert_games" ON games FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_games" ON games FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_games" ON games FOR DELETE
  TO authenticated USING (true);

-- ===================== ACCESSORIES: tighten to auth-only writes =====================
DROP POLICY IF EXISTS "anon_insert_accessories" ON accessories;
DROP POLICY IF EXISTS "anon_update_accessories" ON accessories;
DROP POLICY IF EXISTS "anon_delete_accessories" ON accessories;

CREATE POLICY "auth_insert_accessories" ON accessories FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_accessories" ON accessories FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_accessories" ON accessories FOR DELETE
  TO authenticated USING (true);

-- ===================== ORDERS: tighten SELECT/DELETE to auth-only =====================
DROP POLICY IF EXISTS "anon_select_orders" ON orders;
DROP POLICY IF EXISTS "anon_delete_orders" ON orders;

CREATE POLICY "auth_select_orders" ON orders FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "auth_delete_orders" ON orders FOR DELETE
  TO authenticated USING (true);
