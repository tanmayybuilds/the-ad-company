export function exitReversePin(trigger: { start: number; end: number }, reset: () => void, direction: number): boolean;
export function scrollPinTo(y: number): number;
export function createWheelStep(count: number, bidirectional?: boolean): (index: number, busy: boolean, delta: number, time: number) => number | 'back' | 'wait' | 'leave';
export function observeScrollDirection(): { direction(): number; reset(): void; destroy(): void };
