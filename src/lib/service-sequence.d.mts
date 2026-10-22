export const TOTAL_FRAMES: number;
export const ZONE_STARTS: number[];
export function sequenceFrame(value: number): number;
export function sequenceProgressFrame(progress: number): number;
export function sequenceZone(frame: number): number;
export function sequenceSource(frame: number, base?: string): string;
