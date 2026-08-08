/*
# Create games, accessories, and orders tables for Xbox 360 HD sales funnel

1. New Tables
- `games`: Catalog of Xbox 360 games available for selection.
  - `id` (uuid, PK)
  - `name` (text, not null) — game title
  - `genre` (text, not null) — genre label
  - `year` (int) — release year
  - `created_at` (timestamptz)
- `accessories`: Upsell items offered on the upsell screen.
  - `id` (uuid, PK)
  - `name` (text, not null) — accessory name
  - `price` (numeric, not null) — price in BRL
  - `image_url` (text) — optional image URL
  - `created_at` (timestamptz)
- `orders`: Customer orders capturing console info, games, accessories, and contact data.
  - `id` (uuid, PK)
  - `customer_name` (text, not null)
  - `customer_phone` (text, not null)
  - `neighborhood` (text, not null)
  - `console_model` (text, not null) — Fat, Slim, Super Slim, or "Nao sei"
  - `console_status` (text, not null) — desbloqueado, bloqueado, or "Nao sei"
  - `selected_games` (jsonb, not null) — array of {id, name, genre} objects
  - `selected_accessories` (jsonb, not null default '[]') — array of {id, name, price} objects
  - `status` (text, not null default 'novo') — order status: novo, em_andamento, concluido, cancelado
  - `created_at` (timestamptz)

2. Security (RLS)
- All three tables are single-tenant (no sign-in screen for customers).
- `games` and `accessories`: public read (anon + authenticated), full CRUD for anyone (admin manages via anon key).
- `orders`: public insert (customers submit orders), public read/update/delete (admin manages via anon key).
- All policies use `TO anon, authenticated` since there is no auth flow.

3. Seed Data
- 15 classic Xbox 360 games inserted into `games`.
- 4 sample accessories inserted into `accessories`.

4. Important Notes
- This is a no-auth single-tenant app. The admin panel uses the same anon key.
- `selected_games` and `selected_accessories` are stored as JSONB snapshots at order time, so historical orders remain accurate even if catalog items are later edited or deleted.
- Order status defaults to 'novo' for new orders.
*/

-- ===================== GAMES =====================
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  genre text NOT NULL,
  year int,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_games" ON games;
CREATE POLICY "anon_select_games" ON games FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_games" ON games;
CREATE POLICY "anon_insert_games" ON games FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_games" ON games;
CREATE POLICY "anon_update_games" ON games FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_games" ON games;
CREATE POLICY "anon_delete_games" ON games FOR DELETE
  TO anon, authenticated USING (true);

-- ===================== ACCESSORIES =====================
CREATE TABLE IF NOT EXISTS accessories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE accessories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_accessories" ON accessories;
CREATE POLICY "anon_select_accessories" ON accessories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_accessories" ON accessories;
CREATE POLICY "anon_insert_accessories" ON accessories FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_accessories" ON accessories;
CREATE POLICY "anon_update_accessories" ON accessories FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_accessories" ON accessories;
CREATE POLICY "anon_delete_accessories" ON accessories FOR DELETE
  TO anon, authenticated USING (true);

-- ===================== ORDERS =====================
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  neighborhood text NOT NULL,
  console_model text NOT NULL,
  console_status text NOT NULL,
  selected_games jsonb NOT NULL DEFAULT '[]'::jsonb,
  selected_accessories jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'novo',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_orders" ON orders;
CREATE POLICY "anon_select_orders" ON orders FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_orders" ON orders;
CREATE POLICY "anon_update_orders" ON orders FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_orders" ON orders;
CREATE POLICY "anon_delete_orders" ON orders FOR DELETE
  TO anon, authenticated USING (true);

-- ===================== SEED DATA =====================
INSERT INTO games (name, genre, year) VALUES
  ('Grand Theft Auto V', 'Mundo Aberto', 2013),
  ('Halo 3', 'Tiro / FPS', 2007),
  ('Gears of War', 'Ação / Tiro', 2006),
  ('Gears of War 2', 'Ação / Tiro', 2008),
  ('Gears of War 3', 'Ação / Tiro', 2011),
  ('Forza Horizon', 'Corrida', 2012),
  ('Red Dead Redemption', 'Mundo Aberto', 2010),
  ('Call of Duty: Black Ops II', 'Tiro / FPS', 2012),
  ('Call of Duty: Modern Warfare 2', 'Tiro / FPS', 2009),
  ('The Elder Scrolls V: Skyrim', 'RPG', 2011),
  ('Mass Effect 2', 'RPG / Ação', 2010),
  ('Fallout 3', 'RPG / Mundo Aberto', 2008),
  ('Assassin''s Creed II', 'Ação / Aventura', 2009),
  ('Minecraft: Xbox 360 Edition', 'Sandbox', 2012),
  ('FIFA 13', 'Esporte', 2012)
ON CONFLICT DO NOTHING;

INSERT INTO accessories (name, price, image_url) VALUES
  ('Controle Sem Fio Xbox 360', 89.90, null),
  ('Fonte de Alimentação Xbox 360', 69.90, null),
  ('Cabo HDMI 1.5m', 19.90, null),
  ('Cabo AV Componente', 24.90, null)
ON CONFLICT DO NOTHING;
