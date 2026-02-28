import fs from 'fs';
import path from 'path';
import exifr from 'exifr';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.resolve(__dirname, '../public');
const HIGHLIGHT_DIR = path.join(PUBLIC_DIR, 'photos/highlight');
const GALLERY_DIR = path.join(PUBLIC_DIR, 'photos/gallery');
const CONFIG_PATH = path.resolve(__dirname, '../src/data/portfolio.config.ts');

async function processPhoto(filePath, isPinned, collectionName) {
    const ext = path.extname(filePath).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.heic'].includes(ext)) return null;

    const relativePath = filePath.replace(PUBLIC_DIR, '').replace(/\\/g, '/');
    const id = path.basename(filePath, ext);
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
            // Check common EXIF date fields
            const date = metadata.DateTimeOriginal || metadata.CreateDate || metadata.ModifyDate;
            if (date) {
                createDate = new Date(date).getTime();
            }

            // Fallback for missing fields
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

    // Fallback to file creation time if no EXIF date
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
        exif: exifData
    };
}

async function generateConfig() {
    console.log('Scanning photos directory for imagery and EXIF data...');
    const allPhotos = [];

    // Process Highlight Photos
    if (fs.existsSync(HIGHLIGHT_DIR)) {
        const highlightFiles = fs.readdirSync(HIGHLIGHT_DIR);
        for (const file of highlightFiles) {
            const result = await processPhoto(path.join(HIGHLIGHT_DIR, file), true, 'Highlight');
            if (result) allPhotos.push(result);
        }
    }

    // Process Gallery Photos
    if (fs.existsSync(GALLERY_DIR)) {
        const galleryFiles = fs.readdirSync(GALLERY_DIR);
        for (const file of galleryFiles) {
            const result = await processPhoto(path.join(GALLERY_DIR, file), false, 'Gallery');
            if (result) allPhotos.push(result);
        }
    }

    if (allPhotos.length === 0) {
        console.log('No local photos found. Skipping config generation to preserve placeholder data.');
        return;
    }

    // Sort pinned by timestamp descending (newest first for highlights)
    let pinned = allPhotos.filter(p => p.isPinned).sort((a, b) => b.timestamp - a.timestamp);
    // Sort gallery by timestamp ascending (oldest first for least to most recent)
    let gallery = allPhotos.filter(p => !p.isPinned).sort((a, b) => a.timestamp - b.timestamp);

    // Apply strict order tracking
    pinned = pinned.map((p, i) => ({ ...p, order: i + 1 }));
    gallery = gallery.map((p, i) => ({ ...p, order: pinned.length + i + 1 }));

    const finalConfig = [...pinned, ...gallery];

    // Remove the temporary timestamp field before writing out
    const configClean = finalConfig.map(({ timestamp, ...rest }) => rest);

    const fileContent = `// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Run \`npm run sync\` to update this file with new photos from public/photos.

export interface Photo {
    id: string;
    url: string;           
    title?: string;
    collection: string;    
    isPinned: boolean;     
    order: number;         
    exif?: {
        camera: string;
        lens: string;
        aperture: string;
        shutter: string;
        iso: string;
    };
}

export const portfolioConfig: Photo[] = ${JSON.stringify(configClean, null, 4)};\n`;

    fs.writeFileSync(CONFIG_PATH, fileContent, 'utf-8');
    console.log(`Successfully generated portfolio.config.ts with ${configClean.length} photos!`);
}

generateConfig().catch(console.error);
