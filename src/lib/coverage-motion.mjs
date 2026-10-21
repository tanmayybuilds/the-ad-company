/** Continuous carousel pose: the selected card is flat; neighbours recede. */
export function coveragePose(distance) {
  const depth = Math.min(Math.abs(distance), 3);
  return {
    x: distance * 78,
    z: -260 * depth,
    rotation: -Math.sign(distance) * Math.min(depth * 38, 62),
    scale: Math.max(.6, 1 - depth * .12),
    opacity: Math.max(0, 1 - Math.max(0, depth - .35) * .5),
  };
}
