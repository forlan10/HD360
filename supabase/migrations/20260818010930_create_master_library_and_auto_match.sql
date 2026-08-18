/*
# Create MasterLibrary table with auto-match trigger

## Purpose
Creates a "Biblioteca Mestra" (Master Library) table to track games already in local stock.
When a new order is created, a trigger automatically matches requested games against
the master library — games that are in stock get their status set to "no_hd" (final stage)
immediately, while games not in stock remain "pendente" and appear in the admin's
"Baixar Prioritários" queue.

## 1. New Tables
- `master_library`
  - `id` (uuid, primary key)
  - `game_name` (text, not null) — the game name as stored in stock
  - `game_name_normalized` (text, generated, not null) — lowercased trimmed name for matching
  - `game_id` (uuid, nullable) — optional FK to `games` table for catalog linkage
  - `created_at` (timestamptz, default now())

## 2. Indexes
- Unique index on `game_name_normalized` to prevent duplicate stock entries
- Index on `game_id` for FK lookups

## 3. Security (RLS)
- Enable RLS on `master_library`
- Anon + authenticated can SELECT (admin panel reads via anon key in no-auth context)
- Only authenticated can INSERT, UPDATE, DELETE (admin operations)

## 4. Trigger
- `auto_match_order_games_trigger` fires AFTER INSERT on `orders`
- For each game in `selected_games` JSONB array, checks if a normalized match exists in `master_library`
- If match found: sets that game's `status` to `'no_hd'`
- If no match: leaves status as `'pendente'`
- Updates the order's `selected_games` column in place

## 5. Important Notes
- The trigger uses a normalized comparison (lowercase + trim) for fuzzy matching
- Custom games (id starting with 'custom-') are also matched against the library
- The trigger is idempotent-safe: it only fires on INSERT, never on UPDATE
*/
