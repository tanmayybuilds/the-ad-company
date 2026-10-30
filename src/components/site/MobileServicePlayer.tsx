import { useEffect, useRef, useState } from 'react';
import { services } from '@/content/site';
import { createMobileServicePlayer, type MobileServicePlayer as PlayerControl, type MobileServicePlayerState } from '@/lib/mobile-service-player.mjs';
import { sequenceSource, ZONE_STARTS } from '@/lib/service-sequence.mjs';

export function MobileServicePlayer({ active, onZoneChange }: { active: number; onZoneChange: (zone: number) => void }) {
  const screen = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const player = useRef<PlayerControl | null>(null);
  const onZone = useRef(onZoneChange);
  const [state, setState] = useState<MobileServicePlayerState>({ playing: false, pending: false, failed: false, ready: false, reduced: false });
  onZone.current = onZoneChange;

  useEffect(() => {
    const control = createMobileServicePlayer(video.current!, {
      base: import.meta.env.BASE_URL,
      onState: setState,
      onZone: zone => onZone.current(zone),
    });
    player.current = control;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let inView = false;
    const visibility = () => control.setVisible(inView && !document.hidden);
    const preference = () => control.setReduced(reduced.matches);
    preference();
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; visibility(); });
    observer.observe(screen.current!);
    document.addEventListener('visibilitychange', visibility);
    reduced.addEventListener('change', preference);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      reduced.removeEventListener('change', preference);
      control.destroy();
      player.current = null;
    };
  }, []);

  useEffect(() => { player.current?.select(active); }, [active]);

  const current = services.items[active];
  const requested = state.playing || state.pending;
  return <>
    <div ref={screen} className="service-screen service-screen--mobile">
      <img className="service-poster" src={sequenceSource(ZONE_STARTS[active], import.meta.env.BASE_URL)} alt={`${services.previewAlt} ${current.title}.`} width="1080" height="608" decoding="async" />
      <video id="mobile-service-video" ref={video} width="1080" height="608" muted playsInline preload="none" data-ready={state.ready} aria-label={`${services.previewAlt} ${current.title}`} />
    </div>
    <div className="service-player-controls">
      <span className="service-player-caption"><span>{services.mobilePreviewLabel} · {current.index}/{String(services.items.length).padStart(2, '0')}</span>{current.visualLabel}</span>
      {!state.reduced && <button type="button" className="service-player-toggle" aria-controls="mobile-service-video" aria-pressed={requested} onClick={() => player.current?.toggle()}>
        <span aria-hidden="true">{requested ? 'Ⅱ' : '▶'}</span>{requested ? services.pauseVideo : services.playVideo}
      </button>}
      <p className="service-player-status" role="status" aria-live="polite">
        {state.reduced ? services.reducedVideoHint : state.failed ? services.videoPlaybackFailed : state.pending ? services.videoLoadingHint : ''}
      </p>
    </div>
  </>;
}
