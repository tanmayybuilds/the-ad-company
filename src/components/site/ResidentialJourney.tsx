import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { gsap } from '@/lib/motion';
import { residentialJourney as content } from '@/content/site';
import { companyLogo } from '@/lib/logo';
import { residentialPose } from '@/lib/residential-journey.mjs';
import { exitReversePin, observeScrollDirection, scrollPinTo } from '@/lib/reverse-pin.mjs';
import './residential-journey.css';

const ResidentialScene = lazy(() => import('./ResidentialScene'));
class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  override componentDidCatch() { this.props.onFailure(); }
  override render() { return this.state.failed ? null : this.props.children; }
}

function StillPreview({ stop }: { stop: number }) {
  const indoors = stop === 1 || stop === 2;
  const ad = stop === 1 ? [580, 280, 160, 300] : stop === 2 || stop === 3 ? [725, 595, 65, 90] : stop === 4 ? [530, 325, 540, 220] : [600, 380, 400, 240];
  return <svg className="rj-still" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><linearGradient id="rj-sky" x2="0" y2="1"><stop stopColor="#d6e7e4" /><stop offset="1" stopColor="#f0eee3" /></linearGradient></defs>
    <path fill="url(#rj-sky)" d="M0 0h1600v900H0z" />
    {indoors ? <><path fill="#e5e1d5" d="M0 0h1600v650H0z" /><path fill="#c6c3b8" d="M0 650h1600v250H0z" /><path fill={stop === 2 ? '#92745c' : '#b0bcb9'} stroke="#12546b" strokeWidth="12" d="M910 230h250v420H910z" />{stop === 1 && <path stroke="#889996" strokeWidth="5" d="M1035 230v420" />}</> : <>
      <path fill="#d6d8c6" d="M0 600h1600v300H0z" /><path fill="#646f71" d="M0 760h1600v140H0z" />
      {[70, 290, 1160, 1380].map((x, i) => <g key={x}><path fill={i % 2 ? '#e1e2d8' : '#eee9dc'} d={`M${x} ${180 + i % 2 * 70}h180v430H${x}z`} />{[0, 1, 2, 3].map(y => <path key={y} stroke="#7c9c9e" strokeWidth="30" strokeDasharray="30 26" d={`M${x + 25} ${240 + y * 82}h130`} />)}</g>)}
      {stop === 0 && <><path fill="#ece9dd" d="M420 330h70v380h-70zm690 0h70v380h-70zM400 310h800v65H400z" /><path stroke="#12546b" strokeWidth="12" strokeDasharray="8 34" d="M490 570h620" /></>}
      {stop === 4 && <><path fill="#12546b" d="M450 285h700v410H450z" /><path fill="#d9a328" d="M410 250h780v45H410z" /><path fill="#e5eff0" d="M475 600h650v110H475z" /></>}
      <g transform="translate(1050 700)"><path fill="#547785" d="M0 35h280v65H0zM55-20h145l45 65H20z" /><path fill="#adc4c5" d="M70-10h115l30 43H40z" /><circle cx="55" cy="100" r="27" fill="#263b40" /><circle cx="230" cy="100" r="27" fill="#263b40" /></g>
    </>}
    <g transform={`translate(${ad[0]} ${ad[1]})`}>
      <rect x="-6" y="-6" width={ad[2] + 12} height={ad[3] + 12} fill="#12546b" /><rect width={ad[2]} height={ad[3]} fill="#f7f9f8" />
      <image href={companyLogo.src} x={ad[2] * .07} y={ad[3] * .12} width={ad[2] * .86} height={ad[3] * .7} />
      <rect y={ad[3] * .92} width={ad[2]} height={ad[3] * .08} fill="#d9a328" />
    </g>
    {(stop === 2 || stop === 3 ? [640, 860] : [385, 935]).map((x, i) => <g key={x} transform={`translate(${x} ${stop === 2 || stop === 3 ? 590 : indoors ? 540 : 595})`}>
      <path stroke="#3b5057" strokeWidth="25" strokeLinecap="round" d="M-11 42l-13 105m37-105l18 105" />
      <path fill={i ? '#c79b69' : '#12546b'} d="M-30-30q30-22 60 0l8 84h-76z" /><circle cy="-61" r="25" fill={i ? '#ab7756' : '#c59472'} />
      <path stroke="#b9805e" strokeWidth="15" strokeLinecap="round" d={i ? 'M-28-12l-48 40' : 'M30-12l48 40'} />
    </g>)}
  </svg>;
}

export function ResidentialJourney() {
  const root = useRef<HTMLElement>(null), stage = useRef<HTMLDivElement>(null);
  const progress = useRef(0), invalidate = useRef<(() => void) | null>(null);
  const go = useRef<(index: number) => void>(() => {});
  const [stop, setStop] = useState(0), [near, setNear] = useState(false), [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false), [failed, setFailed] = useState(false), [ready, setReady] = useState(false);
  const staticMode = reduced || failed;
  const connect = useCallback((callback: (() => void) | null) => { invalidate.current = callback; }, []);
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => { setFailed(true); setReady(false); }, []);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const preference = () => setReduced(query.matches);
    preference(); query.addEventListener('change', preference);
    return () => query.removeEventListener('change', preference);
  }, []);

  useEffect(() => {
    let inView = false;
    const show = () => setVisible(inView && !document.hidden);
    const preload = new IntersectionObserver(([entry]) => { setNear(entry.isIntersecting); if (!entry.isIntersecting) setReady(false); }, { rootMargin: '300px' });
    const viewport = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; show(); });
    preload.observe(stage.current!); viewport.observe(stage.current!);
    document.addEventListener('visibilitychange', show);
    return () => { preload.disconnect(); viewport.disconnect(); document.removeEventListener('visibilitychange', show); };
  }, []);

  useEffect(() => {
    const section = root.current!, screen = stage.current!;
    let selected = -1, raf = 0, passed = false;
    const direction = observeScrollDirection();
    const state = { value: 0 };
    // One paused timeline owns the entire composition; scrolling is its only clock.
    const timeline = gsap.timeline({ paused: true }).to(state, { value: 1, duration: 40, ease: 'none', onUpdate: () => {
      progress.current = state.value;
      section.style.setProperty('--rj-progress', String(state.value));
      const next = residentialPose(state.value).stop;
      if (next !== selected) { selected = next; setStop(next); }
      invalidate.current?.();
    } });
    const bounds = () => {
      const header = parseFloat(getComputedStyle(screen).top) || 0;
      const start = window.scrollY + section.getBoundingClientRect().top - header;
      return { start, end: start + Math.max(1, section.offsetHeight - screen.offsetHeight) };
    };
    const update = () => {
      raf = 0;
      if (staticMode || document.body.style.overflow === 'hidden') return;
      const range = bounds(), y = window.scrollY;
      if (y >= range.end + screen.offsetHeight) passed = true;
      if (passed && exitReversePin(range, () => { timeline.progress(0); passed = false; }, direction.direction())) { direction.reset(); return; }
      if (y < range.start) passed = false;
      timeline.progress(Math.max(0, Math.min(1, (y - range.start) / (range.end - range.start))));
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
    go.current = index => {
      const destination = (Math.max(0, Math.min(4, index)) + .82) / 5;
      passed = false; direction.reset();
      timeline.progress(destination);
      if (!staticMode) { const range = bounds(); scrollPinTo(range.start + destination * (range.end - range.start)); }
    };
    const resize = new ResizeObserver(schedule); resize.observe(screen);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();
    return () => {
      cancelAnimationFrame(raf); timeline.kill(); direction.destroy(); resize.disconnect();
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule);
      go.current = () => {};
    };
  }, [staticMode]);

  const current = content.stops[stop];
  return <section id="services" ref={root} className="rj-section" data-static={staticMode} aria-labelledby="rj-title">
    <div ref={stage} className="rj-stage">
      <StillPreview stop={stop} />
      {near && !staticMode && <div className="rj-renderer" data-ready={ready} aria-hidden="true">
        <SceneBoundary onFailure={onFailure}><Suspense fallback={null}><ResidentialScene progress={progress} active={visible} connect={connect} onReady={onReady} onFailure={onFailure} /></Suspense></SceneBoundary>
      </div>}
      <div className="rj-shade" aria-hidden="true" />
      <header className="rj-top">
        <div><span className="rj-chapter">{content.chapter}</span><h2 id="rj-title">{content.title}</h2></div>
        <a className="rj-return" href={`${import.meta.env.BASE_URL}#services`}>{content.returnLabel} <span aria-hidden="true">↗</span></a>
      </header>
      {!staticMode && !ready && near && <p className="rj-loading" role="status">{content.loading}</p>}
      <div className="rj-caption" aria-live="polite" aria-atomic="true">
        <span className="rj-caption-index">0{stop + 1}<span> / 05</span></span>
        <div><p className="rj-format">{current.format}</p><h3>{current.title}</h3><p className="rj-detail">{current.detail}</p></div>
      </div>
      <footer className="rj-bottom">
        <nav className="rj-stops" aria-label={content.progressLabel}>{content.stops.map((item, index) =>
          <button key={item.scene} type="button" onClick={() => go.current(index)} aria-current={index === stop ? 'step' : undefined} aria-label={`${index + 1}: ${item.format}`}><span className="rj-stop-line" /><span>0{index + 1}</span><span className="rj-stop-name">{item.format}</span></button>,
        )}</nav>
        <div className="rj-footnote"><span>{staticMode ? content.stillLabel : content.hint}</span><span>{content.note}</span><a href="#work">{content.skipLabel} ↓</a></div>
      </footer>
    </div>
  </section>;
}
