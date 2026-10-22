export const TOTAL_FRAMES = 266;
export const ZONE_STARTS = [0, 53, 106, 159, 212];

export const sequenceFrame = value => Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(value)));
export const sequenceProgressFrame = progress => sequenceFrame(progress * (TOTAL_FRAMES - 1));
export const sequenceZone = frame => Math.min(4, Math.floor(sequenceFrame(frame) / 53));
export const sequenceSource = (frame, base = '/') => `${base}frames/frame_${String(sequenceFrame(frame) + 1).padStart(4, '0')}.webp`;
