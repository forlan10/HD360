/*
# Secure order tracking: lock down anon access, add SECURITY DEFINER functions

## Overview
Locks down the `orders` table so anonymous users can no longer read all orders
or update them freely. Three SECURITY DEFINER functions provide controlled access
for the customer tracking screen and the checkout flow.

## Security changes
1. Dropped open anon SELECT/UPDATE/INSERT policies on orders:
   - anon_select_orders (was USING true — anyone could read ALL orders)
   - anon_update_orders (was USING true WITH CHECK true — anyone could edit)
   - anon_insert_orders and "Permitir inserção pública de pedidos"
2. Added authenticated-only INSERT and UPDATE policies (admin panel access)
3. Existing auth_select_orders and auth_delete_orders remain (admin can read/delete)

## New functions (all SECURITY DEFINER, search_path = public)
1. track_order(p_phone text, p_order_id text) — returns a single order if the
   phone (normalized digit comparison) OR the order ID matches. Used by the
   customer tracking screen. This is the ONLY way anon can read order data.
2. create_order(...) — inserts a new order and returns the full new row. Used
   by the checkout flow (replaces direct anon INSERT + SELECT).
3. update_order_accessories(p_order_id uuid, p_accessories jsonb) — updates
   the accessories JSON on an existing order. Used by the upsell step
   (replaces direct anon UPDATE).

All three functions are callable by anon and authenticated roles.
*/

-- ================================================================
-- 1. Drop open anon policies on orders
-- ================================================================

DROP POLICY IF EXISTS "anon_select_orders" ON orders;
DROP POLICY IF EXISTS "anon_update_orders" ON orders;
DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
DROP POLICY IF EXISTS "Permitir inserção pública de pedidos" ON orders;

-- ================================================================
-- 2. Add authenticated-only INSERT and UPDATE policies (admin)
-- ================================================================

DROP POLICY IF EXISTS "auth_insert_orders" ON orders;
CREATE POLICY "auth_insert_orders" ON orders FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_orders" ON orders;
CREATE POLICY "auth_update_orders" ON orders FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ================================================================
-- 3. track_order function — controlled read for customer tracking
-- ================================================================

CREATE OR REPLACE FUNCTION track_order(p_phone text DEFAULT NULL, p_order_id text DEFAULT NULL)
RETURNS SETOF orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM orders
  WHERE (p_phone IS NOT NULL AND regexp_replace(customer_phone, '\D', '', 'g') = regexp_replace(p_phone, '\D', '', 'g'))
     OR (p_order_id IS NOT NULL AND id::text = p_order_id)
  ORDER BY created_at DESC
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION track_order(text, text) TO anon, authenticated;

-- ================================================================
-- 4. create_order function — insert + return new row (checkout flow)
-- ================================================================

CREATE OR REPLACE FUNCTION create_order(
  p_customer_name text,
  p_customer_phone text,
  p_neighborhood text,
  p_console_model text,
  p_console_status text,
  p_selected_games jsonb,
  p_selected_accessories jsonb,
  p_total_price numeric
)
RETURNS SETOF orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_row orders%ROWTYPE;
BEGIN
  INSERT INTO orders (
    customer_name, customer_phone, neighborhood,
    console_model, console_status, selected_games,
    selected_accessories, total_price
  ) VALUES (
    p_customer_name, p_customer_phone, p_neighborhood,
    p_console_model, p_console_status, p_selected_games,
    p_selected_accessories, p_total_price
  ) RETURNING * INTO new_row;

  RETURN NEXT new_row;
END;
$$;

GRANT EXECUTE ON FUNCTION create_order(text, text, text, text, text, jsonb, jsonb, numeric) TO anon, authenticated;

-- ================================================================
-- 5. update_order_accessories function — upsell step
-- ================================================================

CREATE OR REPLACE FUNCTION update_order_accessories(
  p_order_id uuid,
  p_accessories jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE orders SET selected_accessories = p_accessories WHERE id = p_order_id;
END;
$$;

GRANT EXECUTE ON FUNCTION update_order_accessories(uuid, jsonb) TO anon, authenticated;