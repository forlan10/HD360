-- Create the master_library table
CREATE TABLE IF NOT EXISTS master_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_name text NOT NULL,
  game_name_normalized text GENERATED ALWAYS AS (lower(trim(game_name))) STORED,
  game_id uuid REFERENCES games(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Unique constraint on normalized name to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS master_library_game_name_normalized_unique
  ON master_library (game_name_normalized);

-- Index for FK lookups
CREATE INDEX IF NOT EXISTS master_library_game_id_idx
  ON master_library (game_id);

-- Enable RLS
ALTER TABLE master_library ENABLE ROW LEVEL SECURITY;

-- Policies: anon+authenticated can SELECT, authenticated-only for mutations
DROP POLICY IF EXISTS "anon_select_master_library" ON master_library;
CREATE POLICY "anon_select_master_library" ON master_library FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_master_library" ON master_library;
CREATE POLICY "auth_insert_master_library" ON master_library FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_master_library" ON master_library;
CREATE POLICY "auth_update_master_library" ON master_library FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_master_library" ON master_library;
CREATE POLICY "auth_delete_master_library" ON master_library FOR DELETE
  TO authenticated USING (true);

-- Also allow anon to insert (orders are created by anon users, trigger runs as definer anyway)
-- But the master_library itself is managed by admin (authenticated)
-- The trigger function is SECURITY DEFINER so it bypasses RLS

-- Create the auto-match trigger function
CREATE OR REPLACE FUNCTION auto_match_order_games()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_games jsonb;
  v_game jsonb;
  v_game_name text;
  v_normalized text;
  v_matched boolean;
  v_updated boolean := false;
BEGIN
  v_games := NEW.selected_games;

  IF v_games IS NULL OR jsonb_array_length(v_games) = 0 THEN
    RETURN NEW;
  END IF;

  FOR i IN 0..jsonb_array_length(v_games) - 1 LOOP
    v_game := v_games->i;
    v_game_name := v_game->>'name';
    
    IF v_game_name IS NULL THEN
      CONTINUE;
    END IF;
    
    v_normalized := lower(trim(v_game_name));
    
    -- Check if this game exists in master_library
    SELECT EXISTS(
      SELECT 1 FROM master_library WHERE game_name_normalized = v_normalized
    ) INTO v_matched;
    
    IF v_matched THEN
      -- Set status to no_hd (final stage - already in stock)
      v_games := jsonb_set(
        v_games,
        ARRAY[i::text, 'status'],
        '"no_hd"'::jsonb
      );
      v_updated := true;
    END IF;
  END LOOP;
  
  IF v_updated THEN
    NEW.selected_games := v_games;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS auto_match_order_games_trigger ON orders;
CREATE TRIGGER auto_match_order_games_trigger
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION auto_match_order_games();