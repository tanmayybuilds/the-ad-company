const smooth = value => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

/** Wrap only the visual neighbours; the scroll journey still follows the city list. */
export function coverageDistance(index, position, count) {
  return ((index - position + count / 2) % count + count) % count - count / 2;
}

/** One reversible scroll sequence: old title out, card travel, new title in. */
export function coverageFrame(progress) {
  const step = Math.floor(progress);
  const phase = progress - step;
  return {
    position: step + smooth((phase - .18) / .60),
    title: phase < .78 ? step : step + 1,
    opacity: phase < .18 ? 1 - smooth(phase / .18) : phase < .78 ? 0 : smooth((phase - .78) / .22),
  };
}

/** The selected card is flat; only its immediate neighbours remain visible at rest. */
export function coveragePose(distance) {
  const depth = Math.min(Math.abs(distance), 3);
  return {
    x: distance * 100,
    z: -220 * depth,
    rotation: -Math.sign(distance) * Math.min(depth * 38, 62),
    scale: Math.max(.6, 1 - depth * .12),
    opacity: depth <= 1 ? 1 - .82 * smooth(depth) : .18 * (1 - smooth(depth - 1)),
  };
}
