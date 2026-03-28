-- ============================================================
-- TakeyamaPortfolio — Supabase Schema
-- Run this entire file in your Supabase project's SQL Editor
-- ============================================================

-- Photos table
CREATE TABLE IF NOT EXISTS photos (
  id                   TEXT PRIMARY KEY,
  url                  TEXT NOT NULL,
  title                TEXT,
  collection           TEXT NOT NULL DEFAULT 'Gallery',
  is_pinned            BOOLEAN NOT NULL DEFAULT false,
  sort_order           INTEGER NOT NULL DEFAULT 0,
  timestamp            BIGINT,
  exif                 JSONB,
  cloudinary_public_id TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Site content (hero text, section titles, etc.)
CREATE TABLE IF NOT EXISTS content (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Default content values
INSERT INTO content (key, value) VALUES
  ('hero_name',     '武山松'),
  ('hero_subtitle', 'Portfolio'),
  ('grid_title',    'Selected Works')
ON CONFLICT (key) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE photos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read photos and content (public portfolio)
CREATE POLICY "Public read photos"
  ON photos FOR SELECT USING (true);

CREATE POLICY "Public read content"
  ON content FOR SELECT USING (true);

-- Note: all writes go through Netlify Functions using the service role key,
-- which bypasses RLS — no write policies needed here.
