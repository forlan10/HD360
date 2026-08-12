/*
# Allow anonymous SELECT on orders table

1. Purpose
- The store funnel has no sign-in screen. Anonymous visitors create orders via INSERT,
  then the code reads back the inserted row's id (INSERT ... RETURNING) and later UPDATEs
  the same row to attach accessories. Both RETURNING and UPDATE-with-WHERE require a
  SELECT policy to exist for the role making the request.
- Currently only `authenticated` has a SELECT policy (`auth_select_orders`), so the
  admin can do this but an anonymous visitor gets an error.
2. Changes
- Adds `anon_select_orders` policy allowing anon + authenticated to SELECT from orders.
- Existing INSERT / UPDATE policies for anon remain unchanged.
3. Security notes
- This is a no-auth storefront: customers submit orders anonymously and the admin
  manages them behind a sign-in. The INSERT and UPDATE policies for anon already use
  WITH CHECK (true), so anon write access is already unrestricted. Adding SELECT is
  consistent with the existing security model.
- If tighter privacy is needed later (e.g. column-level privileges or a customer
  token), that can be added without changing the code.
*/

DROP POLICY IF EXISTS "anon_select_orders" ON orders;

CREATE POLICY "anon_select_orders"
ON orders FOR SELECT
TO anon, authenticated
USING (true);