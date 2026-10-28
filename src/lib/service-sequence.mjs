export const SEQUENCE_CLIPS = [
  { id: 'residential', source: 'residential and community.mp4', frames: 240 },
  { id: 'corporate', source: 'Corporate and coworking.mp4', frames: 239 },
  { id: 'outdoor', source: 'Outdoor and Transit.mp4', frames: 239 },
  { id: 'cinema', source: 'Cinema airports and inflight.mp4', frames: 240 },
  { id: 'delivery', source: 'Delivery and in app.mp4', frames: 239 },
];
export const TRANSITION_FRAMES = 18;
export const ZONE_STARTS = SEQUENCE_CLIPS.map((_, index) =>
  SEQUENCE_CLIPS.slice(0, index).reduce((sum, clip) => sum + clip.frames + TRANSITION_FRAMES, 0));
export const TOTAL_FRAMES = ZONE_STARTS.at(-1) + SEQUENCE_CLIPS.at(-1).frames;

export const sequenceFrame = value => Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(value)));
export const sequenceProgressFrame = progress => sequenceFrame(progress * (TOTAL_FRAMES - 1));
export const sequenceZone = frame => {
  const f = sequenceFrame(frame);
  // The incoming service takes over halfway through its dissolve.
  return ZONE_STARTS.findLastIndex((start, index) => f >= start - (index ? TRANSITION_FRAMES / 2 : 0));
};
export const sequenceSource = (frame, base = '/') => `${base}frames/services-v2/frame_${String(sequenceFrame(frame) + 1).padStart(4, '0')}.webp`;

export function sequenceWindow(value, reduced = false) {
  const frame = sequenceFrame(value);
  return Array.from({ length: reduced ? 1 : 17 }, (_, i) => frame + (i % 2 ? -Math.ceil(i / 2) : i / 2))
    .filter(index => index >= 0 && index < TOTAL_FRAMES);
}

