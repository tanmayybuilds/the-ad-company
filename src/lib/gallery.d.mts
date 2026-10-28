type Photo = { id: string; src: string; thumbnail: string; width: number; height: number; alt: string };
type Brand = { id: string; name: string; photos: Photo[] };
export function galleryItems(brands: Brand[], selected?: string): (Photo & { brandId: string; brandName: string })[];
