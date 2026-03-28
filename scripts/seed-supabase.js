/**
 * seed-supabase.js
 * 
 * Seeds your Supabase `photos` table with the existing photos from
 * portfolio.config.ts so your site works immediately after setup.
 *
 * Usage:
 *   1. Copy .env.example to .env and fill in SUPABASE_URL + SUPABASE_SERVICE_KEY
 *   2. Run: node scripts/seed-supabase.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env manually (dotenv may not be available globally)
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

// Inline the existing photos data (copied from portfolio.config.ts)
// so this script has no TypeScript dependency
const photos = [
  { id: 'IMG_1972', url: '/photos/highlight/IMG_1972.jpg', collection: 'Highlight', is_pinned: true, sort_order: 1, timestamp: 1765840653000, exif: { camera: 'Apple iPhone 17', lens: 'iPhone 17 back dual wide camera 5.96mm f/1.6', aperture: 'f/1.6', shutter: '1/50s', iso: 'ISO 125' } },
  { id: 'IMG_0803', url: '/photos/highlight/IMG_0803.jpg', collection: 'Highlight', is_pinned: true, sort_order: 2, timestamp: 1761858145000, exif: { camera: 'Apple iPhone 17', lens: 'iPhone 17 back dual wide camera 5.96mm f/1.6', aperture: 'f/1.6', shutter: '1/1894s', iso: 'ISO 32' } },
  { id: 'IMG_7944.JPG', url: '/photos/highlight/IMG_7944.JPG', collection: 'Highlight', is_pinned: true, sort_order: 3, timestamp: 1747537334000, exif: { camera: 'Apple iPhone 14', lens: 'iPhone 14 back dual wide camera 5.7mm f/1.5', aperture: 'f/1.5', shutter: '1/50s', iso: 'ISO 125' } },
  { id: 'DSC00843.JPG', url: '/photos/gallery/DSC00843.JPG', collection: 'Gallery', is_pinned: false, sort_order: 4, timestamp: 1678373708000, exif: { camera: 'SONY ILCE-6700', lens: 'E PZ 16-50mm F3.5-5.6 OSS', aperture: 'f/5.6', shutter: '1/125s', iso: 'ISO 6400' } },
  { id: 'DSC00954.JPG', url: '/photos/gallery/DSC00954.JPG', collection: 'Gallery', is_pinned: false, sort_order: 5, timestamp: 1678707588000, exif: { camera: 'SONY ILCE-6700', lens: 'E PZ 16-50mm F3.5-5.6 OSS', aperture: 'f/4.5', shutter: '1/500s', iso: 'ISO 4000' } },
  { id: 'DSC01022.JPG', url: '/photos/gallery/DSC01022.JPG', collection: 'Gallery', is_pinned: false, sort_order: 6, timestamp: 1679132073000, exif: { camera: 'SONY ILCE-6700', lens: 'E PZ 16-50mm F3.5-5.6 OSS', aperture: 'f/5.6', shutter: '1/200s', iso: 'ISO 800' } },
  { id: 'DSC01068.JPG', url: '/photos/gallery/DSC01068.JPG', collection: 'Gallery', is_pinned: false, sort_order: 7, timestamp: 1679393887000, exif: { camera: 'SONY ILCE-6700', lens: 'E PZ 16-50mm F3.5-5.6 OSS', aperture: 'f/9', shutter: '1/125s', iso: 'ISO 500' } },
  { id: 'DSC01244.JPG', url: '/photos/gallery/DSC01244.JPG', collection: 'Gallery', is_pinned: false, sort_order: 8, timestamp: 1679641553000, exif: { camera: 'SONY ILCE-6700', lens: 'E PZ 16-50mm F3.5-5.6 OSS', aperture: 'f/3.5', shutter: '1/125s', iso: 'ISO 4000' } },
  { id: 'DSC01937.JPG', url: '/photos/gallery/DSC01937.JPG', collection: 'Gallery', is_pinned: false, sort_order: 9, timestamp: 1679712713000, exif: { camera: 'SONY ILCE-6700', lens: 'E PZ 16-50mm F3.5-5.6 OSS', aperture: 'f/6.3', shutter: '1/2500s', iso: 'ISO 640' } },
  { id: 'DSC02118.JPG', url: '/photos/gallery/DSC02118.JPG', collection: 'Gallery', is_pinned: false, sort_order: 10, timestamp: 1679716331000, exif: { camera: 'SONY ILCE-6700', lens: 'E PZ 16-50mm F3.5-5.6 OSS', aperture: 'f/5.6', shutter: '1/1600s', iso: 'ISO 320' } },
  { id: 'DSC02235.JPG', url: '/photos/gallery/DSC02235.JPG', collection: 'Gallery', is_pinned: false, sort_order: 11, timestamp: 1679724416000, exif: { camera: 'SONY ILCE-6700', lens: 'E PZ 16-50mm F3.5-5.6 OSS', aperture: 'f/5.6', shutter: '1/2500s', iso: 'ISO 320' } },
  { id: 'DSC02432.JPG', url: '/photos/gallery/DSC02432.JPG', collection: 'Gallery', is_pinned: false, sort_order: 12, timestamp: 1679999508000, exif: { camera: 'SONY ILCE-6700', lens: 'E PZ 16-50mm F3.5-5.6 OSS', aperture: 'f/5.6', shutter: '1/125s', iso: 'ISO 2500' } },
  { id: 'DSC02447.JPG', url: '/photos/gallery/DSC02447.JPG', collection: 'Gallery', is_pinned: false, sort_order: 13, timestamp: 1679999573000, exif: { camera: 'SONY ILCE-6700', lens: 'E PZ 16-50mm F3.5-5.6 OSS', aperture: 'f/5.6', shutter: '1/60s', iso: 'ISO 6400' } },
  { id: 'DSC02660.JPG', url: '/photos/gallery/DSC02660.JPG', collection: 'Gallery', is_pinned: false, sort_order: 14, timestamp: 1680000998000, exif: { camera: 'SONY ILCE-6700', lens: 'E PZ 16-50mm F3.5-5.6 OSS', aperture: 'f/5.6', shutter: '1/80s', iso: 'ISO 6400' } },
  { id: 'DSC03190.JPG', url: '/photos/gallery/DSC03190.JPG', collection: 'Gallery', is_pinned: false, sort_order: 15, timestamp: 1684799844000, exif: { camera: 'SONY ILCE-6700', lens: 'E PZ 16-50mm F3.5-5.6 OSS', aperture: 'f/5.6', shutter: '1/1000s', iso: 'ISO 100' } },
  { id: 'DSC03357', url: '/photos/gallery/DSC03357.jpg', collection: 'Gallery', is_pinned: false, sort_order: 16, timestamp: 1690248543000, exif: { camera: 'SONY ILCE-6700', lens: '----', aperture: '', shutter: '1/125s', iso: 'ISO 100' } },
  { id: 'IMG_2996.JPG', url: '/photos/gallery/IMG_2996.JPG', collection: 'Gallery', is_pinned: false, sort_order: 17, timestamp: 1715822284000, exif: { camera: 'Apple iPhone 14', lens: 'iPhone 14 back dual wide camera 5.7mm f/1.5', aperture: 'f/1.5', shutter: '1/40s', iso: 'ISO 640' } },
  { id: 'IMG_3096.JPG', url: '/photos/gallery/IMG_3096.JPG', collection: 'Gallery', is_pinned: false, sort_order: 18, timestamp: 1716159897000, exif: { camera: 'Apple iPhone 14', lens: 'iPhone 14 back dual wide camera 5.7mm f/1.5', aperture: 'f/1.5', shutter: '1/590s', iso: 'ISO 50' } },
  { id: 'DSC03496', url: '/photos/gallery/DSC03496.jpg', collection: 'Gallery', is_pinned: false, sort_order: 19, timestamp: 1731709401000, exif: { camera: 'SONY ILCE-6700', lens: '----', aperture: '', shutter: '1/125s', iso: 'ISO 100' } },
  { id: 'DSC03539.JPG', url: '/photos/gallery/DSC03539.JPG', collection: 'Gallery', is_pinned: false, sort_order: 20, timestamp: 1737475962000, exif: { camera: 'SONY ILCE-6700', lens: 'E PZ 16-50mm F3.5-5.6 OSS', aperture: 'f/5', shutter: '1/200s', iso: 'ISO 5000' } },
  { id: 'IMG_0919', url: '/photos/gallery/IMG_0919.jpg', collection: 'Gallery', is_pinned: false, sort_order: 21, timestamp: 1762203832000, exif: { camera: 'Apple iPhone 17', lens: 'iPhone 17 back dual wide camera 5.96mm f/1.6', aperture: 'f/1.6', shutter: '1/60s', iso: 'ISO 100' } },
];

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

async function seed() {
  console.log(`Seeding ${photos.length} photos into Supabase…`);

  const { error } = await supabase
    .from('photos')
    .upsert(photos, { onConflict: 'id' });

  if (error) {
    console.error('❌  Seed failed:', error.message);
    process.exit(1);
  }

  console.log(`✅  Successfully seeded ${photos.length} photos.`);
  console.log('   Your portfolio is ready. Run `npm run dev` to start.');
}

seed();
