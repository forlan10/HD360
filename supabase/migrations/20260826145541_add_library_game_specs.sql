/*
# Add detailed game specification fields to master_library

## Summary
Extends the master_library table with per-game metadata so the admin can track
whether each game works, audio/subtitle availability in Portuguese, and any
special installation notes.

## New Columns (on master_library)
1. `is_working` (boolean, default true) — indicates whether the game is known to work.
2. `not_working_reason` (text, nullable) — free-text explanation when the game does NOT work.
3. `dubbed_pt` (boolean, default false) — whether the game is dubbed in Portuguese.
4. `subtitles_pt` (boolean, default false) — whether the game has Portuguese subtitles.
5. `special_install` (text, nullable) — free-text notes about special installation procedures.

## Security
- No RLS policy changes. Existing policies remain intact (anon can SELECT,
  authenticated can INSERT/UPDATE/DELETE).
*/

ALTER TABLE master_library
  ADD COLUMN IF NOT EXISTS is_working boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS not_working_reason text,
  ADD COLUMN IF NOT EXISTS dubbed_pt boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS subtitles_pt boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS special_install text;
