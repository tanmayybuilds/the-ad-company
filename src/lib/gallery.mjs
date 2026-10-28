export function galleryItems(brands, selected = 'all') {
  const groups = brands.filter(brand => selected === 'all' || brand.id === selected);
  return [0, 1, 2].flatMap(index => groups.flatMap(brand => brand.photos[index]
    ? [{ ...brand.photos[index], brandId: brand.id, brandName: brand.name }]
    : []));
}
