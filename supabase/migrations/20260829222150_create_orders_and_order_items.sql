/*
# Create orders and order_items tables (public checkout, no auth)

1. Purpose
- This app lets site visitors place orders publicly without signing in.
- The 401 (Unauthorized) error on "Finalizar Pedido" was caused by missing
  INSERT policies for the `anon` role, so the anon-key frontend could not
  write new orders. This migration creates the tables with public INSERT
  access for anon + authenticated.

2. New Tables
- `orders`
  - `id` (uuid, primary key, auto-generated)
  - `customer_name` (text, not null) — name of the customer placing the order
  - `customer_email` (text, not null) — contact email for the order
  - `customer_phone` (text) — optional phone number
  - `shipping_address` (text, not null) — delivery address
  - `status` (text, not null, default 'pending') — order fulfillment status
  - `total` (numeric(10,2), not null, default 0) — order grand total
  - `created_at` (timestamptz, default now())
- `order_items`
  - `id` (uuid, primary key, auto-generated)
  - `order_id` (uuid, foreign key -> orders.id ON DELETE CASCADE, not null)
  - `product_name` (text, not null) — name of the product purchased
  - `unit_price` (numeric(10,2), not null) — price per unit
  - `quantity` (integer, not null, default 1) — number of units
  - `subtotal` (numeric(10,2), not null) — unit_price * quantity
  - `created_at` (timestamptz, default now())

3. Security (Row Level Security)
- RLS ENABLED on both `orders` and `order_items`.
- Public INSERT policy for `orders` (TO anon, authenticated WITH CHECK (true))
  so unauthenticated site visitors can create orders. This is the fix for the
  401 error: the anon role now has explicit INSERT permission.
- Public INSERT policy for `order_items` (TO anon, authenticated WITH CHECK (true))
  so order line items can be inserted alongside the parent order.
- Public SELECT policy on both tables (TO anon, authenticated USING (true))
  so the frontend can display order history/confirmation.
- UPDATE and DELETE policies are intentionally NOT created: public visitors
  should not be able to modify or remove submitted orders. Only the service
  role (server-side) can manage order status changes.

4. Important Notes
- This is a single-tenant, no-auth app: `USING (true)` / `WITH CHECK (true)`
  is correct and intentional because all order data is public/shared.
- No `user_id` column or `auth.uid()` checks are used because there is no
  sign-in screen.
- Idempotent: uses IF NOT EXISTS for tables and DROP POLICY IF EXISTS before
  (re)creating policies, so re-running this migration is safe.
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  shipping_address text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  total numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  subtotal numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- orders: SELECT (public)
DROP POLICY IF EXISTS "anon_select_orders" ON orders;
CREATE POLICY "anon_select_orders" ON orders FOR SELECT
  TO anon, authenticated USING (true);

-- orders: INSERT (public) — fixes the 401 Unauthorized error
DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- order_items: SELECT (public)
DROP POLICY IF EXISTS "anon_select_order_items" ON order_items;
CREATE POLICY "anon_select_order_items" ON order_items FOR SELECT
  TO anon, authenticated USING (true);

-- order_items: INSERT (public)
DROP POLICY IF EXISTS "anon_insert_order_items" ON order_items;
CREATE POLICY "anon_insert_order_items" ON order_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Index for joining order_items to orders
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
