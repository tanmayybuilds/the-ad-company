/** Stable scatter keeps resize/re-entry from reshuffling the composition. */
export function heroScatter(index, width, height) {
  return {
    x: Math.sin(index * 2.39996 + .6) * width * .28,
    y: Math.cos(index * 1.73 + .4) * height * .22,
    rotation: Math.sin(index * 1.91) * 62,
  };
}
