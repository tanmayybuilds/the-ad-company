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

/** Dwell on readable faces; pass quickly through the edge-on angles. */
export function brandRotation(seconds, cycleSeconds) {
  const turn = seconds / cycleSeconds;
  const phase = turn - Math.floor(turn);
  const ease = value => value * value * (3 - 2 * value);
  const angle = phase < .58 ? 0 : phase < .66 ? 180 * ease((phase - .58) / .08)
    : phase < .90 ? 180 : phase < .98 ? 180 + 180 * ease((phase - .90) / .08) : 360;
  return Math.floor(turn) * 360 + angle;
}
