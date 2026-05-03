-- Run once in Supabase → SQL Editor if you see:
--   "Could not find the table 'public.albums' in the schema cache"

CREATE TABLE IF NOT EXISTS albums (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  description  TEXT,
  cover_url    TEXT NOT NULL,
  photo_ids    JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at   BIGINT,
  sort_order   INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE albums ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read albums" ON albums;
CREATE POLICY "Public read albums"
  ON albums FOR SELECT USING (true);
