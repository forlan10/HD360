/*
# Public insert policy for orders table

1. Purpose
- Ensures any anonymous visitor can submit a new order (the store funnel has no sign-in screen).
- Replaces any stale insert policies with a single, explicit public-insert policy.
2. Changes
- Enables RLS on `orders` (idempotent — already enabled).
- Drops legacy insert policies by name to avoid conflicts.
- Creates `Permitir inserção pública de pedidos` allowing INSERT for the `public` role with no restriction.
- Grants INSERT on `orders` to `anon` and `public`.
- Grants USAGE + SELECT on all sequences in `public` schema so anon can use serial/id defaults.
3. Security notes
- This is a no-auth store: the frontend uses the anon key for all requests, so INSERT must be allowed for anon.
- SELECT/UPDATE/DELETE on orders remain restricted to authenticated (admin) only — unchanged here.
*/

-- 1. Garante que a tabela de pedidos tem RLS ativado
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 2. Limpa políticas antigas de inserção para evitar conflitos
DROP POLICY IF EXISTS "Permitir inserção pública de pedidos" ON orders;
DROP POLICY IF EXISTS "Permitir que clientes façam pedidos" ON orders;
DROP POLICY IF EXISTS "Enable insert for all users" ON orders;
DROP POLICY IF EXISTS "Enable insert for anon" ON orders;

-- 3. Cria a regra que permite qualquer visitante (anônimo) enviar um novo pedido
CREATE POLICY "Permitir inserção pública de pedidos"
ON orders
FOR INSERT
TO public
WITH CHECK (true);

-- 4. Concede permissões explícitas de inserção na tabela orders para o perfil público
GRANT INSERT ON orders TO anon;
GRANT INSERT ON orders TO public;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO public;