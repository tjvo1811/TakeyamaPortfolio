export interface Photo {
    id: string;
    url: string;           // Local path or external URL
    title?: string;
    collection: string;    // e.g., 'Tokyo', 'Horology', 'Street'
    isPinned: boolean;     // If true, shows up in the massive Hero Section
    order: number;         // Allows clever reorganizing. Lower numbers appear first.
    exif?: {
        camera: string;
        lens: string;
        aperture: string;
        shutter: string;
        iso: string;
    };
}

export const portfolioConfig: Photo[] = [
    {
        id: "pin-1",
        url: "https://images.unsplash.com/photo-1620025740441-2a14eaf03780?q=80&w=1600&auto=format&fit=crop",
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
    },
    {
        id: "pin-2",
        url: "https://images.unsplash.com/photo-1542051812871-75f56cc9a3af?q=80&w=1600&auto=format&fit=crop",
        title: "Shibuya Crossing",
        collection: "Street",
        isPinned: true,
        order: 2,
        exif: {
            camera: "Leica SL2",
            lens: "35mm APO",
            aperture: "f/2.0",
            shutter: "1/125s",
            iso: "200"
        }
    },
    {
        id: "pin-3",
        url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop",
        title: "Minimalist Structure",
        collection: "Architecture",
        isPinned: true,
        order: 3,
        exif: {
            camera: "Hasselblad X1D",
            lens: "45mm",
            aperture: "f/5.6",
            shutter: "1/250s",
            iso: "100"
        }
    },
    {
        id: "grid-1",
        url: "https://images.unsplash.com/photo-1598414441295-d853eeda52fb?q=80&w=1200&auto=format&fit=crop",
        title: "Submariner Macro",
        collection: "Horology",
        isPinned: false,
        order: 4,
        exif: {
            camera: "Leica SL2",
            lens: "90mm Macro",
            aperture: "f/8.0",
            shutter: "1/100s",
            iso: "800"
        }
    },
    {
        id: "grid-2",
        url: "https://images.unsplash.com/photo-1524387813524-7df84fb9f33b?q=80&w=1200&auto=format&fit=crop",
        title: "Concrete Geometric",
        collection: "Architecture",
        isPinned: false,
        order: 5,
        exif: {
            camera: "Sony A7RV",
            lens: "24mm GM",
            aperture: "f/8.0",
            shutter: "1/200s",
            iso: "100"
        }
    },
    {
        id: "grid-3",
        url: "https://images.unsplash.com/photo-1601004456903-85f7e4f16a63?q=80&w=1200&auto=format&fit=crop",
        title: "Kyoto Lanterns",
        collection: "Tokyo",
        isPinned: false,
        order: 6,
        exif: {
            camera: "Leica Q2",
            lens: "28mm",
            aperture: "f/1.7",
            shutter: "1/30s",
            iso: "3200"
        }
    },
    {
        id: "grid-4",
        url: "https://images.unsplash.com/photo-1502485590209-409139f4a9b4?q=80&w=1200&auto=format&fit=crop",
        title: "Night Fall",
        collection: "Street",
        isPinned: false,
        order: 7,
        exif: {
            camera: "Leica SL2",
            lens: "50mm Summilux",
            aperture: "f/1.4",
            shutter: "1/60s",
            iso: "1600"
        }
    },
    {
        id: "grid-5",
        url: "https://images.unsplash.com/photo-1620891549420-56d7350cb4a7?q=80&w=1200&auto=format&fit=crop",
        title: "Watch Detailing",
        collection: "Horology",
        isPinned: false,
        order: 8,
        exif: {
            camera: "Fujifilm GFX100S",
            lens: "120mm Macro",
            aperture: "f/11",
            shutter: "1/2s",
            iso: "100"
        }
    }
];
