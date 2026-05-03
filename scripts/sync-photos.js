import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { scanPublicPhotos, finalizeWithOrder } from './scan-public-photos.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATH = path.resolve(__dirname, '../src/data/portfolio.config.ts');

async function generateConfig() {
  console.log('Scanning photos directory for imagery and EXIF data...');
  const raw = await scanPublicPhotos();

  if (raw.length === 0) {
    console.log('No local photos found. Skipping config generation to preserve placeholder data.');
    return;
  }

  const finalConfig = finalizeWithOrder(raw);

  const fileContent = `// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Run \`npm run sync\` to update this file with new photos from public/photos.

export interface Photo {
    id: string;
    url: string;           
    title?: string;
    collection: string;    
    isPinned: boolean;     
    order: number;         
    timestamp?: number;
    exif?: {
        camera: string;
        lens: string;
        aperture: string;
        shutter: string;
        iso: string;
    };
}

/** Curated albums (static fallback — edit here; synced DB uses Supabase \`albums\` table). */
export interface Album {
    id: string;
    title: string;
    description?: string;
    coverUrl: string;
    photoIds: string[];
    createdAt: number;
    order: number;
}

/** Empty by default — add albums in Admin or append entries here for API-offline fallback. */
export const albumsConfig: Album[] = [];

export const portfolioConfig: Photo[] = ${JSON.stringify(finalConfig, null, 4)};\n`;

  fs.writeFileSync(CONFIG_PATH, fileContent, 'utf-8');
  console.log(`Successfully generated portfolio.config.ts with ${finalConfig.length} photos!`);
}

generateConfig().catch(console.error);
