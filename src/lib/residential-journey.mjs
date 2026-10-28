const views = [
  { eye: [5.4, 2.8, 9.5], aim: [0, 2.4, .1] },
  { eye: [3.4, 2.3, -5.2], aim: [-1.65, 2, -11.9] },
  { eye: [3.7, 2.2, -20.2], aim: [0, 1.45, -26] },
  { eye: [5.4, 2.65, -35.8], aim: [0, 1.5, -42] },
  { eye: [3.8, 2.65, -51.8], aim: [0, 2.05, -59.5] },
];
const overview = { eye: [12, 6.2, 22], aim: [0, 1.8, 0] };
const clamp = value => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

export function residentialPose(progress) {
  const p = clamp(progress) * views.length;
  const stop = Math.min(views.length - 1, Math.floor(p));
  const local = Math.min(1, p - stop);
  const t = Math.min(1, local / .65);
  const blend = t * t * (3 - 2 * t);
  const previous = stop ? views[stop - 1] : overview;
  const interpolate = key => views[stop][key].map((value, i) => previous[key][i] + (value - previous[key][i]) * blend);
  let eye = interpolate('eye');
  if (stop === 2 || stop === 3) {
    const a = previous.eye, b = views[stop].eye, t = blend, u = 1 - t;
    const controls = [[9, 3.4, a[2] + (b[2] - a[2]) / 3], [9, 3.4, a[2] + (b[2] - a[2]) * 2 / 3]];
    eye = b.map((value, i) => u ** 3 * a[i] + 3 * u ** 2 * t * controls[0][i] + 3 * u * t ** 2 * controls[1][i] + t ** 3 * value);
  }
  return { stop, local, eye, aim: interpolate('aim') };
}

export function walkingPose(progress, phase = 0) {
  const clock = clamp(progress) * 28 + phase * Math.PI * 2;
  return { stride: Math.sin(clock) * .48, lift: Math.abs(Math.sin(clock)) * .035, gesture: Math.sin(clock * .3) * .12 };
}
