export interface MobileServicePlayerState {
  playing: boolean;
  pending: boolean;
  failed: boolean;
  ready: boolean;
  reduced: boolean;
}
export interface MobileServicePlayer {
  select(zone: number): void;
  toggle(): void;
  setVisible(visible: boolean): void;
  setReduced(reduced: boolean): void;
  destroy(): void;
}
export function createMobileServicePlayer(video: HTMLVideoElement, options: {
  base?: string;
  onState: (state: MobileServicePlayerState) => void;
  onZone: (zone: number) => void;
}): MobileServicePlayer;
