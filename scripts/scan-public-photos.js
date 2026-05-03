import fs from 'fs';
import path from 'path';
import exifr from 'exifr';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PUBLIC_DIR = path.resolve(__dirname, '../public');
const HIGHLIGHT_DIR = path.join(PUBLIC_DIR, 'photos/highlight');
export const GALLERY_DIR = path.join(PUBLIC_DIR, 'photos/gallery');

async function processPhoto(filePath, isPinned, collectionName) {
  const extRaw = path.extname(filePath);
  const ext = extRaw.toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.heic'].includes(ext)) return null;

  const relativePath = filePath.replace(PUBLIC_DIR, '').replace(/\\/g, '/');
  const id = path.basename(filePath, extRaw);
  let exifData = null;
  let createDate = 0;
  let metadata = null;

  try {
    const buffer = fs.readFileSync(filePath);
    metadata = await exifr.parse(buffer, {
      tiff: true,
      exif: true,
      gps: false,
    });

    if (metadata) {
      const date = metadata.DateTimeOriginal || metadata.CreateDate || metadata.ModifyDate;
      if (date) {
        createDate = new Date(date).getTime();
      }

      const make = metadata.Make || '';
      const model = metadata.Model || '';
      let camera = `${make} ${model}`.trim();
      if (!camera) camera = 'Unknown Camera';

      const lensName = metadata.LensModel || metadata.Lens || '';
      const focalLength = metadata.FocalLength ? `${metadata.FocalLength}mm` : '';
      const lens = lensName || focalLength || 'Unknown Lens';

      const aperture = metadata.FNumber ? `f/${metadata.FNumber}` : '';
      const shutter = metadata.ExposureTime ? `1/${Math.round(1 / metadata.ExposureTime)}s` : '';
      const iso = metadata.ISO ? `ISO ${metadata.ISO}` : '';

      exifData = {
        camera,
        lens,
        aperture,
        shutter,
        iso,
      };
    }
  } catch (e) {
    console.warn(`Could not read EXIF for ${filePath}:`, e.message);
  }

  if (!createDate) {
    const stat = fs.statSync(filePath);
    createDate = stat.birthtimeMs || stat.mtimeMs;
  }

  return {
    id,
    url: relativePath,
    collection: collectionName,
    isPinned,
    timestamp: createDate,
    exif: exifData,
  };
}

function galleryCollectionForPath(filePath) {
  const rel = path.relative(GALLERY_DIR, path.dirname(filePath)).replace(/\\/g, '/');
  if (!rel || rel === '.') return 'Gallery';
  return rel;
}

async function collectGalleryRecursive(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      out.push(...(await collectGalleryRecursive(full)));
    } else {
      const collection = galleryCollectionForPath(full);
      const r = await processPhoto(full, false, collection);
      if (r) out.push(r);
    }
  }
  return out;
}

/** Raw photo rows from disk (highlight + gallery, any subfolders under gallery). */
export async function scanPublicPhotos() {
  const allPhotos = [];

  if (fs.existsSync(HIGHLIGHT_DIR)) {
    const highlightFiles = fs.readdirSync(HIGHLIGHT_DIR);
    for (const file of highlightFiles) {
      const result = await processPhoto(path.join(HIGHLIGHT_DIR, file), true, 'Highlight');
      if (result) allPhotos.push(result);
    }
  }

  allPhotos.push(...(await collectGalleryRecursive(GALLERY_DIR)));
  return allPhotos;
}

export function finalizeWithOrder(allPhotos) {
  let pinned = allPhotos.filter((p) => p.isPinned).sort((a, b) => b.timestamp - a.timestamp);
  let gallery = allPhotos.filter((p) => !p.isPinned).sort((a, b) => a.timestamp - b.timestamp);
  pinned = pinned.map((p, i) => ({ ...p, order: i + 1 }));
  gallery = gallery.map((p, i) => ({ ...p, order: pinned.length + i + 1 }));
  return [...pinned, ...gallery];
}

/** Rows for Supabase `photos` upsert (snake_case columns). */
export function toSupabaseRows(finalPhotos) {
  return finalPhotos.map((p) => ({
    id: p.id,
    url: p.url,
    title: p.title ?? null,
    collection: p.collection,
    is_pinned: p.isPinned,
    sort_order: p.order,
    timestamp: p.timestamp ?? null,
    exif: p.exif ?? null,
    cloudinary_public_id: p.cloudinaryPublicId ?? null,
  }));
}
