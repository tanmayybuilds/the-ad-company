/** Viewport coordinates keep the opening spread out independently of its final layout. */
export function heroScatter(index, width, height, type = 'letter') {
  const slot = (index * 7) % 25;
  const panelPositions = [[.18, .24], [.8, .21], [.18, .5], [.82, .54], [.26, .8], [.75, .81]];
  const [x, y] = type === 'panel' ? panelPositions[index % 6] : [.08 + (slot % 5) * .21 + Math.sin(index * 2.4) * .02, .17 + Math.floor(slot / 5) * .16 + Math.cos(index * 1.7) * .015];
  return {
    x: x * width,
    y: y * height,
    rotation: Math.sin(index * 1.91 + .4) * (type === 'panel' ? 25 : 62),
  };
}
