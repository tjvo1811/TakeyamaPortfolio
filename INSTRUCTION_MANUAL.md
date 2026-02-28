# Photography Portfolio Instruction Manual

Welcome to your new Editorial Architecture Portfolio. This platform has been precisely designed to put your photography first, with fluid Masonry grids, pure black Cinematic Lightboxes, and rich editorial typography.

Here is exactly how to manage your gallery:

## 1. Adding Your Photos (The Magic Way)
We've built an automated engine to extract your EXIF data (Camera, Lens, Aperture, Shutter Speed, ISO) directly from your image files.

1. Create a `photos` folder inside your `public/` directory (it is already created for you).
2. Inside `public/photos/`, you have two folders:
   - `highlight/`: Put up to 3 of your favorite photos here. They will be pinned to the enormous cinema-style Hero section at the top of the site.
   - `gallery/`: Put the rest of your photos here.
3. Keep file names simple without spaces, e.g., `tokyo-tower.jpg`. We will automatically use the file name as the photo's Title!

## 2. Syncing Your Portfolio
Once your `.jpg` or `.png` images are in those folders, open your terminal and run:

```bash
npm run sync
```

**That's it.** The script will mathematically scan your photos, rip the exact EXIF metadata, calculate chronological dates to display them from least to most recent, and build out your `portfolio.config.ts` effortlessly. You no longer have to manually type out camera metadata.

## 3. Manual Overrides (Optional)
If you ever want to manually change a title, reorganize the chronological layout, or change a Collection tag (e.g., from "Gallery" to "Architecture"), you can still open `src/data/portfolio.config.ts` and edit the generated Javascript array.

## 5. Running Your Site
- To preview locally: Type `npm run dev` in your terminal and open the provided `localhost` link.
- To build for production: Type `npm run build`.

*Eradicate visual clutter. Make the photo management feel like magic.*
