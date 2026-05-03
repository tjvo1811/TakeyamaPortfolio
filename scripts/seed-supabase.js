/**
 * seed-supabase.js
 *
 * Upserts rows in Supabase `photos` from files under public/photos (same layout as `npm run sync`).
 * Use this after moving images into gallery subfolders so production URLs match disk.
 *
 * Usage:
 *   1. Copy .env.example to .env and fill in SUPABASE_URL + SUPABASE_SERVICE_KEY
 *   2. Run: node scripts/seed-supabase.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { scanPublicPhotos, finalizeWithOrder, toSupabaseRows } from './scan-public-photos.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

try {
  const envPath = join(__dirname, '..', '.env');
  const envContent = readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    process.env[key] = val;
  }
} catch {
  // .env not found — rely on existing environment variables
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌  SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

async function seed() {
  const raw = await scanPublicPhotos();
  if (raw.length === 0) {
    console.error('❌  No photos found under public/photos. Add files first.');
    process.exit(1);
  }

  const rows = toSupabaseRows(finalizeWithOrder(raw));
  console.log(`Seeding ${rows.length} photos into Supabase (upsert on id)…`);

  const { error } = await supabase.from('photos').upsert(rows, { onConflict: 'id' });

  if (error) {
    console.error('❌  Seed failed:', error.message);
    process.exit(1);
  }

  console.log(`✅  Upserted ${rows.length} photos. URLs now match public/photos on disk.`);
}

seed();
