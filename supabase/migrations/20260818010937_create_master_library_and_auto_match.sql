/*
# Create MasterLibrary table with auto-match trigger

Creates a "Biblioteca Mestra" table for games already in local stock.
A trigger on order insert auto-matches requested games against this library:
matched games jump to "no_hd" status; unmatched stay "pendente".

## New Tables
- master_library (id, game_name, game_name_normalized, game_id, created_at)

## Security
- RLS enabled, anon+authenticated SELECT, authenticated-only mutations

## Trigger
- auto_match_order_games_trigger: AFTER INSERT on orders, matches selected_games against master_library
*/
