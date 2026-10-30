type GalleryProject = { client: string | null; galleryId?: string; photos: unknown[] };

export function clientGalleryHref(name: string, projects: GalleryProject[], base: string) {
  const project = projects.find(project => project.client === name && project.galleryId && project.photos.length);
  return `${base}gallery.html${project ? `?brand=${encodeURIComponent(project.galleryId!)}` : ''}#campaign-wall`;
}
