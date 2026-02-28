# Photography Portfolio Instruction Manual

Welcome to your new Editorial Architecture Portfolio. This platform has been precisely designed to put your photography first, with fluid Masonry grids, pure black Cinematic Lightboxes, and rich editorial typography.

Here is exactly how to manage your gallery:

## 1. Adding Your Photos
1. Place all your high-resolution `.jpg` or `.png` images directly into the `public/` folder in this project directory. Keep file names simple without spaces, e.g., `tokyo-tower.jpg`.
2. Do not crop your images. The portfolio natively handles all aspect ratios dynamically.

## 2. The Photo Engine Config (`portfolio.config.ts`)
Open `src/data/portfolio.config.ts`. This file controls the entire gallery structure. You will see an array of objects.

To add a photo, add a new object to the `portfolioConfig` array following this exact structure:

```typescript
{
  id: "unique-name-1", // Must be unique for every image
  url: "/tokyo-tower.jpg", // If it's in the public folder, just start with a slash
  title: "Tokyo Tower Twilight",
  collection: "Tokyo",
  isPinned: true, 
  order: 1,
  exif: {
    camera: "Leica Q2",
    lens: "28mm Summilux",
    aperture: "f/1.7",
    shutter: "1/60s",
    iso: "400"
  }
}
```

## 3. Pinning images to the Hero Cluster
The massive hero text section ("Precision-engineered for Vision") holds a cluster of **exactly two or three** "Pinned" images. 

To feature a photo in this overlapping hero cluster:
- Change its `isPinned` value to `true`.
- The first 3 pinned images sorted by their `order` will automatically slot into the cinematic hero cluster.

## 4. Reorganizing the Masonry Grid
The grid automatically sorts your non-pinned photos. To precisely place an image higher or lower on the page:
- Change its `order` number. Lower numbers (e.g., `1, 2, 3`) will appear near the top. Higher numbers will flow downwards.

## 5. Running Your Site
- To preview locally: Type `npm run dev` in your terminal and open the provided `localhost` link.
- To build for production: Type `npm run build`.

*Eradicate visual clutter. Make the photo management feel like magic.*
