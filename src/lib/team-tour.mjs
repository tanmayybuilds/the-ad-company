const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function teamProgress(scrollY, top, distance, count) {
  return distance > 0 ? clamp((scrollY - top) / distance, 0, 1) * (count - 1) : 0;
}

export function teamScrollTop(index, top, distance, count) {
  return top + clamp(index, 0, count - 1) / (count - 1) * distance;
}

export function teamCamera(progress, nodes) {
  const p = clamp(progress, 0, nodes.length - 1);
  const index = Math.min(Math.floor(p), nodes.length - 2);
  const t = p - index;
  const eased = t * t * (3 - 2 * t);
  const a = nodes[index], b = nodes[index + 1];
  return {
    x: a.x + (b.x - a.x) * eased,
    z: a.z + (b.z - a.z) * eased,
    yaw: a.yaw + (b.yaw - a.yaw) * eased,
  };
}

export function teamPath(a, b) {
  return { length: Math.hypot(b.x - a.x, b.z - a.z), angle: Math.atan2(a.z - b.z, b.x - a.x) * 180 / Math.PI };
}

export function teamWindow(progress, count) {
  const position = clamp(progress, 0, count - 1);
  return { first: Math.floor(position), last: Math.min(count - 1, Math.ceil(position) + 2) };
}

export function teamFraming(width, height) {
  const compact = width < 1024;
  const scale = Math.min(1, Math.max(.45, (height - 300) / 600)) * Math.min(1, width / (compact ? 800 : 1050));
  const portraitSize = Math.min(compact ? .95 : 1.05, Math.max(.55, (height - 440) / 320));
  const cardSize = Math.min(1.2, Math.max(.82, (height - 400) / 320), compact ? 1.2 : (width / 2 - 24 - 155 * scale) / 320);
  return { scale, portraitScale: portraitSize / scale, cardScale: cardSize / scale };
}
