import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { X } from 'lucide-react';
import { services, work } from '@/content/site';
import { ActionLink, Eyebrow } from './primitives';

const videoSource = (src: string) => `${import.meta.env.BASE_URL}${src.slice(1)}#t=0.001`;

function BentoCard({ index, active, reduced, onActivate, onExplore }: {
  index: number; active: boolean; reduced: boolean;
  onActivate: (index: number | null) => void; onExplore: () => void;
}) {
  const item = work.examples[index];
  const media = useRef<HTMLButtonElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const dwell = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [failed, setFailed] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const stopHover = () => {
    clearTimeout(dwell.current);
    if (media.current) {
      media.current.style.setProperty('--tilt-x', '0deg');
      media.current.style.setProperty('--tilt-y', '0deg');
    }
  };

  useEffect(() => () => stopHover(), []);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) { stopHover(); if (active) onActivate(null); }
    });
    observer.observe(media.current!);
    return () => observer.disconnect();
  }, [active, onActivate]);
  useEffect(() => {
    const player = video.current!;
    let cancelled = false;
    const reset = () => {
      player.pause();
      if (player.readyState >= 1) player.currentTime = 0.001;
    };
    if (active && !failed) {
      setBlocked(false);
      void player.play().catch(error => {
        if (!cancelled && error.name !== 'AbortError') { setBlocked(true); onActivate(null); }
      });
    } else reset();
    return () => { cancelled = true; reset(); };
  }, [active, failed, onActivate]);

  const tiltMedia = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== 'mouse' || reduced) return;
    const element = media.current!;
    const rect = element.getBoundingClientRect();
    const nx = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const ny = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    element.style.setProperty('--tilt-x', `${-(ny - .5) * 10}deg`);
    element.style.setProperty('--tilt-y', `${(nx - .5) * 10}deg`);
  };

  return <article className={`bento-card bento-card-${index + 1}`} data-active={active}>
    <button ref={media} type="button" className="diorama-popout-container"
      aria-label={`${work.exploreLabel}: ${item.type}`} aria-haspopup="dialog"
      onPointerEnter={event => {
        if (event.pointerType !== 'mouse' || reduced) return;
        tiltMedia(event);
        clearTimeout(dwell.current);
        dwell.current = setTimeout(() => { if (!document.hidden) onActivate(index); }, 180);
      }}
      onPointerMove={tiltMedia}
      onPointerLeave={event => { stopHover(); if (event.pointerType === 'mouse') onActivate(null); }}
      onBlur={() => { stopHover(); if (active) onActivate(null); }}
      onClick={() => { stopHover(); onActivate(null); onExplore(); }}>
      <span className="diorama-screen">
        <video ref={video} src={videoSource(item.video)} poster={`${import.meta.env.BASE_URL}${item.poster.slice(1)}`} muted playsInline loop preload="none" aria-label={item.alt}
          onLoadedMetadata={event => { if (!active) event.currentTarget.currentTime = .001; }}
          onError={() => { setFailed(true); }} />
        {(failed || blocked) && <span className="bento-media-status" role="status">{failed ? work.mediaUnavailable : work.playbackBlocked}</span>}
      </span>
      <span className="bento-concept-badge">{work.conceptLabel} / 0{index + 1}</span>
      <span className="bento-view-more" aria-hidden="true">{work.exploreLabel}<span>↗</span></span>
    </button>
    <div className="card-footer">
      <p className="bento-category">{item.type}</p>
      <h3>{item.title}</h3>
      {index === 0 && <p className="bento-copy">{item.copy}</p>}
      <button type="button" className="bento-explore" onClick={onExplore} aria-haspopup="dialog" aria-label={`${work.exploreLabel}: ${item.type}`}>
        <span>{work.exploreLabel}</span><span aria-hidden="true">↗</span>
      </button>
    </div>
  </article>;
}

export function Work() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const preference = () => { setReduced(query.matches); setActive(null); };
    preference();
    query.addEventListener('change', preference);
    const hide = () => { if (document.hidden) setActive(null); };
    document.addEventListener('visibilitychange', hide);
    return () => { query.removeEventListener('change', preference); document.removeEventListener('visibilitychange', hide); };
  }, []);

  useEffect(() => {
    if (selected === null) return;
    const previous = document.activeElement as HTMLElement;
    const modal = dialog.current!;
    modal.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { modal.close(); document.body.style.overflow = overflow; previous?.focus({ preventScroll: true }); };
  }, [selected]);

  const project = selected === null ? null : work.examples[selected];
  return <section id="work" className="section-y bento-section" aria-labelledby="work-title"
    onKeyDown={event => { if (event.key === 'Escape') setActive(null); }}>
    <div className="container-page">
      <header className="bento-heading">
        <div><Eyebrow className="bento-eyebrow">{work.eyebrow}</Eyebrow><h2 id="work-title">{work.heading.map((line, index) => <span key={line} className={index ? 'bento-heading-accent' : undefined}>{line}</span>)}</h2><span className="bento-heading-mark" aria-hidden="true" /></div>
        <p>{work.intro}</p>
      </header>
      <div className="bento-grid-3d" data-engaged={active !== null}>
        {work.examples.map((item, index) => <BentoCard key={item.video} index={index} active={active === index} reduced={reduced} onActivate={setActive} onExplore={() => { setActive(null); setSelected(index); }} />)}
      </div>
    </div>
    <dialog ref={dialog} onClose={() => setSelected(null)} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }} className="project-dialog service-dialog" aria-labelledby={project ? 'project-title' : undefined}>
      {project && <>
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-ink/20 bg-paper px-5 py-3">
          <p className="text-sm font-semibold">{work.detailsLabel}</p>
          <button type="button" onClick={() => dialog.current?.close()} className="flex items-center gap-2 border border-ink px-3 py-2 text-xs" autoFocus>{work.closeLabel}<X size={16} aria-hidden="true" /></button>
        </div>
        <div className="project-dialog-layout">
        <aside className="project-dialog-media">
          <video key={project.video} src={videoSource(project.video)} poster={`${import.meta.env.BASE_URL}${project.poster.slice(1)}`} autoPlay muted playsInline controls preload="metadata" aria-label={project.alt} />
          <p>{work.detailLabel}</p>
        </aside>
        <div className="project-dialog-services">
          <Eyebrow className="mb-3">{work.detailLabel}</Eyebrow>
          <h2 id="project-title" className="font-display text-[clamp(1.5rem,5vw,1.875rem)] font-bold uppercase">{project.title}</h2>
          <p className="my-5 leading-relaxed">{project.copy}</p>
          <ul className="mb-8 flex flex-wrap gap-2">{project.formats.map(format => <li key={format} className="border border-ink/20 px-3 py-2 text-sm">{format}</li>)}</ul>
          <h3 className="font-display text-2xl font-bold uppercase">{services.catalogueHeading}</h3>
          <p className="mt-3 text-sm leading-relaxed text-ink/70">{services.catalogueIntro} {work.catalogueHint}</p>
          <div className="my-6 border-t border-ink/20">
            {services.catalogue.map(service => <details key={`${project.video}-${service.id}`} open={project.serviceIds.includes(service.id)} className="border-b border-ink/20">
              <summary className="cursor-pointer py-5 font-display text-base font-bold uppercase">{service.title}</summary>
              <div className="pb-6">
                <h4 className="font-semibold text-signal">{service.lead}</h4>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{service.copy}</p>
                <ul className="mt-4 grid list-disc gap-x-8 gap-y-2 pl-4 text-sm leading-relaxed marker:text-signal sm:grid-cols-2">{service.formats.map(format => <li key={format}>{format}</li>)}</ul>
              </div>
            </details>)}
          </div>
          <ActionLink href="#contact" size="md" onClick={() => dialog.current?.close()}>{work.contactLabel}</ActionLink>
        </div>
        </div>
      </>}
    </dialog>
  </section>;
}
