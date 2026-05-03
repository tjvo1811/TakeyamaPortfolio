// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Run `npm run sync` to update this file with new photos from public/photos.

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

/** Curated albums (static fallback — edit here; synced DB uses Supabase `albums` table). */
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

export const portfolioConfig: Photo[] = [
    {
        "id": "IMG_1972",
        "url": "/photos/highlight/IMG_1972.jpg",
        "collection": "Highlight",
        "isPinned": true,
        "timestamp": 1765840653000,
        "exif": {
            "camera": "Apple iPhone 17",
            "lens": "iPhone 17 back dual wide camera 5.96mm f/1.6",
            "aperture": "f/1.6",
            "shutter": "1/50s",
            "iso": "ISO 125"
        },
        "order": 1
    },
    {
        "id": "IMG_0803",
        "url": "/photos/highlight/IMG_0803.jpg",
        "collection": "Highlight",
        "isPinned": true,
        "timestamp": 1761858145000,
        "exif": {
            "camera": "Apple iPhone 17",
            "lens": "iPhone 17 back dual wide camera 5.96mm f/1.6",
            "aperture": "f/1.6",
            "shutter": "1/1894s",
            "iso": "ISO 32"
        },
        "order": 2
    },
    {
        "id": "IMG_7944.JPG",
        "url": "/photos/highlight/IMG_7944.JPG",
        "collection": "Highlight",
        "isPinned": true,
        "timestamp": 1747537334000,
        "exif": {
            "camera": "Apple iPhone 14",
            "lens": "iPhone 14 back dual wide camera 5.7mm f/1.5",
            "aperture": "f/1.5",
            "shutter": "1/50s",
            "iso": "ISO 125"
        },
        "order": 3
    },
    {
        "id": "DSC00843.JPG",
        "url": "/photos/gallery/Architecture/DSC00843.JPG",
        "collection": "Architecture",
        "isPinned": false,
        "timestamp": 1678373708000,
        "exif": {
            "camera": "SONY ILCE-6700",
            "lens": "E PZ 16-50mm F3.5-5.6 OSS",
            "aperture": "f/5.6",
            "shutter": "1/125s",
            "iso": "ISO 6400"
        },
        "order": 4
    },
    {
        "id": "DSC00954.JPG",
        "url": "/photos/gallery/Architecture/DSC00954.JPG",
        "collection": "Architecture",
        "isPinned": false,
        "timestamp": 1678707588000,
        "exif": {
            "camera": "SONY ILCE-6700",
            "lens": "E PZ 16-50mm F3.5-5.6 OSS",
            "aperture": "f/4.5",
            "shutter": "1/500s",
            "iso": "ISO 4000"
        },
        "order": 5
    },
    {
        "id": "DSC01022.JPG",
        "url": "/photos/gallery/Architecture/DSC01022.JPG",
        "collection": "Architecture",
        "isPinned": false,
        "timestamp": 1679132073000,
        "exif": {
            "camera": "SONY ILCE-6700",
            "lens": "E PZ 16-50mm F3.5-5.6 OSS",
            "aperture": "f/5.6",
            "shutter": "1/200s",
            "iso": "ISO 800"
        },
        "order": 6
    },
    {
        "id": "DSC01068.JPG",
        "url": "/photos/gallery/Architecture/DSC01068.JPG",
        "collection": "Architecture",
        "isPinned": false,
        "timestamp": 1679393887000,
        "exif": {
            "camera": "SONY ILCE-6700",
            "lens": "E PZ 16-50mm F3.5-5.6 OSS",
            "aperture": "f/9",
            "shutter": "1/125s",
            "iso": "ISO 500"
        },
        "order": 7
    },
    {
        "id": "DSC01244.JPG",
        "url": "/photos/gallery/Street/DSC01244.JPG",
        "collection": "Street",
        "isPinned": false,
        "timestamp": 1679641553000,
        "exif": {
            "camera": "SONY ILCE-6700",
            "lens": "E PZ 16-50mm F3.5-5.6 OSS",
            "aperture": "f/3.5",
            "shutter": "1/125s",
            "iso": "ISO 4000"
        },
        "order": 8
    },
    {
        "id": "DSC01937.JPG",
        "url": "/photos/gallery/Street/DSC01937.JPG",
        "collection": "Street",
        "isPinned": false,
        "timestamp": 1679712713000,
        "exif": {
            "camera": "SONY ILCE-6700",
            "lens": "E PZ 16-50mm F3.5-5.6 OSS",
            "aperture": "f/6.3",
            "shutter": "1/2500s",
            "iso": "ISO 640"
        },
        "order": 9
    },
    {
        "id": "DSC02118.JPG",
        "url": "/photos/gallery/Street/DSC02118.JPG",
        "collection": "Street",
        "isPinned": false,
        "timestamp": 1679716331000,
        "exif": {
            "camera": "SONY ILCE-6700",
            "lens": "E PZ 16-50mm F3.5-5.6 OSS",
            "aperture": "f/5.6",
            "shutter": "1/1600s",
            "iso": "ISO 320"
        },
        "order": 10
    },
    {
        "id": "DSC02235.JPG",
        "url": "/photos/gallery/Street/DSC02235.JPG",
        "collection": "Street",
        "isPinned": false,
        "timestamp": 1679724416000,
        "exif": {
            "camera": "SONY ILCE-6700",
            "lens": "E PZ 16-50mm F3.5-5.6 OSS",
            "aperture": "f/5.6",
            "shutter": "1/2500s",
            "iso": "ISO 320"
        },
        "order": 11
    },
    {
        "id": "DSC02432.JPG",
        "url": "/photos/gallery/Street/DSC02432.JPG",
        "collection": "Street",
        "isPinned": false,
        "timestamp": 1679999508000,
        "exif": {
            "camera": "SONY ILCE-6700",
            "lens": "E PZ 16-50mm F3.5-5.6 OSS",
            "aperture": "f/5.6",
            "shutter": "1/125s",
            "iso": "ISO 2500"
        },
        "order": 12
    },
    {
        "id": "DSC02447.JPG",
        "url": "/photos/gallery/Interior/DSC02447.JPG",
        "collection": "Interior",
        "isPinned": false,
        "timestamp": 1679999573000,
        "exif": {
            "camera": "SONY ILCE-6700",
            "lens": "E PZ 16-50mm F3.5-5.6 OSS",
            "aperture": "f/5.6",
            "shutter": "1/60s",
            "iso": "ISO 6400"
        },
        "order": 13
    },
    {
        "id": "DSC02660.JPG",
        "url": "/photos/gallery/Interior/DSC02660.JPG",
        "collection": "Interior",
        "isPinned": false,
        "timestamp": 1680000998000,
        "exif": {
            "camera": "SONY ILCE-6700",
            "lens": "E PZ 16-50mm F3.5-5.6 OSS",
            "aperture": "f/5.6",
            "shutter": "1/80s",
            "iso": "ISO 6400"
        },
        "order": 14
    },
    {
        "id": "DSC03190.JPG",
        "url": "/photos/gallery/Interior/DSC03190.JPG",
        "collection": "Interior",
        "isPinned": false,
        "timestamp": 1684799844000,
        "exif": {
            "camera": "SONY ILCE-6700",
            "lens": "E PZ 16-50mm F3.5-5.6 OSS",
            "aperture": "f/5.6",
            "shutter": "1/1000s",
            "iso": "ISO 100"
        },
        "order": 15
    },
    {
        "id": "DSC03357",
        "url": "/photos/gallery/Interior/DSC03357.jpg",
        "collection": "Interior",
        "isPinned": false,
        "timestamp": 1690248543000,
        "exif": {
            "camera": "SONY ILCE-6700",
            "lens": "----",
            "aperture": "",
            "shutter": "1/125s",
            "iso": "ISO 100"
        },
        "order": 16
    },
    {
        "id": "IMG_2996.JPG",
        "url": "/photos/gallery/Travel/IMG_2996.JPG",
        "collection": "Travel",
        "isPinned": false,
        "timestamp": 1715822284000,
        "exif": {
            "camera": "Apple iPhone 14",
            "lens": "iPhone 14 back dual wide camera 5.7mm f/1.5",
            "aperture": "f/1.5",
            "shutter": "1/40s",
            "iso": "ISO 640"
        },
        "order": 17
    },
    {
        "id": "IMG_3096.JPG",
        "url": "/photos/gallery/Travel/IMG_3096.JPG",
        "collection": "Travel",
        "isPinned": false,
        "timestamp": 1716159897000,
        "exif": {
            "camera": "Apple iPhone 14",
            "lens": "iPhone 14 back dual wide camera 5.7mm f/1.5",
            "aperture": "f/1.5",
            "shutter": "1/590s",
            "iso": "ISO 50"
        },
        "order": 18
    },
    {
        "id": "DSC03496",
        "url": "/photos/gallery/Travel/DSC03496.jpg",
        "collection": "Travel",
        "isPinned": false,
        "timestamp": 1731709401000,
        "exif": {
            "camera": "SONY ILCE-6700",
            "lens": "----",
            "aperture": "",
            "shutter": "1/125s",
            "iso": "ISO 100"
        },
        "order": 19
    },
    {
        "id": "DSC03539.JPG",
        "url": "/photos/gallery/Travel/DSC03539.JPG",
        "collection": "Travel",
        "isPinned": false,
        "timestamp": 1737475962000,
        "exif": {
            "camera": "SONY ILCE-6700",
            "lens": "E PZ 16-50mm F3.5-5.6 OSS",
            "aperture": "f/5",
            "shutter": "1/200s",
            "iso": "ISO 5000"
        },
        "order": 20
    },
    {
        "id": "IMG_0919",
        "url": "/photos/gallery/Travel/IMG_0919.jpg",
        "collection": "Travel",
        "isPinned": false,
        "timestamp": 1762203832000,
        "exif": {
            "camera": "Apple iPhone 17",
            "lens": "iPhone 17 back dual wide camera 5.96mm f/1.6",
            "aperture": "f/1.6",
            "shutter": "1/60s",
            "iso": "ISO 100"
        },
        "order": 21
    }
];
