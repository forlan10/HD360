/*
# HD Production Status, Game Suggestions, and Leads CRM

## Overview
This migration adds three new capabilities to the Xbox 360 HD store:
1. Per-game production status tracking inside each order (HD assembly workflow).
2. A "game suggestions" queue where customer-typed custom games are captured for admin review.
3. A full Leads CRM table for managing customer contacts.

---

## 1. Orders — per-game production status

The existing `orders.selected_games` column is a `jsonb` array of objects:
  `{ "id": string, "name": string, "genre": string }`

We extend each game object with an optional `status` field:
  `{ "id", "name", "genre", "status": "pendente" | "baixado" | "convertido" | "no_hd" }`

No schema change is needed — `jsonb` is flexible. The frontend will:
  - Set `status: "pendente"` on every game when an order is created.
  - Update individual game statuses via an `UPDATE` on the `orders` row (rewriting the `selected_games` array).

The existing `anon_update_orders` policy already allows updates, so no policy change is needed.

---

## 2. New table: `game_suggestions`

Captures custom (manually-typed) game names from customer orders so the admin can review and optionally promote them to the official catalog.

Columns:
- `id` (uuid, primary key)
- `game_name` (text, not null) — the suggested game name
- `game_name_normalized` (text, not null) — lowercased trimmed name for deduplication/grouping
- `suggested_by` (text) — customer name from the order (optional, for context)
- `order_id` (uuid, nullable) — references orders(id), set NULL on delete so suggestions survive order deletion
- `status` (text, default 'pendente') — 'pendente' (in queue) | 'adicionado' (promoted to catalog) | 'descartado' (discarded)
- `created_at` (timestamptz, default now())

Index on `game_name_normalized` + `status` for efficient grouping queries.

---

## 3. New table: `leads`

CRM table for managing customer leads. Leads are created:
  - Automatically when an order is placed (from order customer data).
  - Manually by the admin.

Columns:
- `id` (uuid, primary key)
- `name` (text, not null)
- `phone` (text)
- `neighborhood` (text)
- `interests` (text) — free-text field for console/games of interest
- `status` (text, default 'nao_respondeu') — 'comprou' | 'problema_entrega' | 'nao_pediu' | 'nao_respondeu'
- `contact_date` (date, default current_date) — date of first contact
- `order_id` (uuid, nullable) — references orders(id), set NULL on delete
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

Indexes on `status`, `neighborhood`, and `contact_date` for filtering/sorting.

---

## 4. Security (RLS)

### game_suggestions
- SELECT/INSERT/UPDATE/DELETE for `anon, authenticated` (single-tenant app, no per-user isolation; the admin panel is behind Supabase auth but the public funnel also writes suggestions).

### leads
- SELECT/INSERT/UPDATE/DELETE for `anon, authenticated` (same rationale — the public funnel inserts leads automatically, the admin manages them).

All policies use `USING (true)` / `WITH CHECK (true)` because this is a single-tenant store app with no per-user data isolation. The admin panel itself is protected by Supabase auth (the Admin route requires a session), but the database tables are intentionally shared.
*/

-- ================================================================
-- 2. game_suggestions
-- ================================================================

CREATE TABLE IF NOT EXISTS game_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_name text NOT NULL,
  game_name_normalized text NOT NULL GENERATED ALWAYS AS (lower(trim(game_name))) STORED,
  suggested_by text,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pendente',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_game_suggestions_normalized_status
  ON game_suggestions(game_name_normalized, status);

ALTER TABLE game_suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_game_suggestions" ON game_suggestions;
CREATE POLICY "anon_select_game_suggestions" ON game_suggestions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_game_suggestions" ON game_suggestions;
CREATE POLICY "anon_insert_game_suggestions" ON game_suggestions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_game_suggestions" ON game_suggestions;
CREATE POLICY "anon_update_game_suggestions" ON game_suggestions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_game_suggestions" ON game_suggestions;
CREATE POLICY "anon_delete_game_suggestions" ON game_suggestions FOR DELETE
  TO anon, authenticated USING (true);

-- ================================================================
-- 3. leads
-- ================================================================

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  neighborhood text,
  interests text,
  status text NOT NULL DEFAULT 'nao_respondeu',
  contact_date date DEFAULT current_date,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_neighborhood ON leads(neighborhood);
CREATE INDEX IF NOT EXISTS idx_leads_contact_date ON leads(contact_date);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_leads" ON leads;
CREATE POLICY "anon_select_leads" ON leads FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_leads" ON leads;
CREATE POLICY "anon_insert_leads" ON leads FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_leads" ON leads;
CREATE POLICY "anon_update_leads" ON leads FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_leads" ON leads;
CREATE POLICY "anon_delete_leads" ON leads FOR DELETE
  TO anon, authenticated USING (true);
