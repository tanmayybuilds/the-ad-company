/** Offset is relative to the shared clock, so released cards inherit its velocity. */
export function cardAngle(offset, global, active, dt) {
  const blend = 1 - Math.exp(-12 * dt);
  const target = active ? 180 + 360 * Math.round((global + offset - 180) / 360) - global : 0;
  if (!active) offset = ((offset + 180) % 360 + 360) % 360 - 180;
  const next = offset + (target - offset) * blend;
  return global + (Math.abs(next - target) < 0.02 ? target : next);
}

export function loopOffset(offset, width) {
  return width > 0 ? ((offset % width) + width) % width : 0;
}
