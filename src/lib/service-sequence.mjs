export const TOTAL_FRAMES = 266;
export const ZONE_STARTS = [0, 42, 99, 156, 206];

export const sequenceFrame = value => Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(value)));
export const sequenceProgressFrame = progress => sequenceFrame(progress * (TOTAL_FRAMES - 1));
export const sequenceZone = frame => {
  const f = sequenceFrame(frame);
  if (f >= 206) return 4;
  if (f >= 156) return 3;
  if (f >= 99) return 2;
  if (f >= 42) return 1;
  return 0;
};
export const sequenceSource = (frame, base = '/') => `${base}frames/frame_${String(sequenceFrame(frame) + 1).padStart(4, '0')}.webp`;

export function sequenceWindow(value, reduced = false) {
  const frame = sequenceFrame(value);
  return Array.from({ length: reduced ? 1 : 9 }, (_, i) => frame + (i % 2 ? -Math.ceil(i / 2) : i / 2))
    .filter(index => index >= 0 && index < TOTAL_FRAMES);
}

