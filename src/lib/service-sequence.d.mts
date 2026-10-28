export const TOTAL_FRAMES: number;
export const ZONE_STARTS: number[];
export function sequenceFrame(value: number): number;
export function sequenceProgressFrame(progress: number): number;
export function sequenceZone(frame: number): number;
export function sequenceSource(frame: number, base?: string): string;
export function sequenceWindow(frame: number, reduced?: boolean): number[];
export const SEQUENCE_CLIPS: { id: string; source: string; frames: number }[];
export const TRANSITION_FRAMES: number;
