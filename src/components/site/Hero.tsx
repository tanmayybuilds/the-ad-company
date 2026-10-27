import { useRef } from 'react';
import { ArrowDown, ArrowUpRight, Plus } from 'lucide-react';
import { company, hero, type HeroPanel } from '@/content/site';
import { gsap, MQ, ScrollTrigger, useGSAP } from '@/lib/motion';
import { heroScatter } from '@/lib/hero-motion.mjs';
import { ActionLink } from './primitives';
import './hero-home.css';

function PanelArtwork({ panel }: { panel: HeroPanel }) {
  if (panel.image) return <img className="home-panel-photo" src={`${import.meta.env.BASE_URL}${panel.image.slice(1)}`} alt="Illustrative The Ad Company billboard placement" width="1080" height="1350" decoding="async" />;
  return <div className={`home-panel-art home-panel-art--${panel.id}`} aria-hidden="true">
    {panel.id === 'community' && <><div className="home-building">{Array.from({ length: 9 }, (_, i) => <i key={i} />)}</div><div className="home-street-poster">{hero.artwork.community.map(line => <span key={line}>{line}</span>)}</div><span className="home-ground-line" /></>}
    {panel.id === 'digital' && <><div className="home-screen"><span>{hero.artwork.digital.map(line => <span key={line}>{line}</span>)}</span><ArrowUpRight /></div><span className="home-screen-stand" /><span className="home-orbit" /></>}
    {panel.id === 'atl' && <div className="home-ticket"><span>{hero.artwork.ticketLabel}</span><strong>{hero.artwork.ticket.map((line, index) => <span key={index}>{line}</span>)}</strong><div className="home-ticket-bars" /></div>}
    {panel.id === 'content' && <><div className="home-record"><i /></div><span className="home-record-label">{hero.artwork.record.map(line => <span key={line}>{line}</span>)}</span><div className="home-soundwave">{Array.from({ length: 15 }, (_, i) => <i key={i} />)}</div></>}
    {panel.id === 'planning' && <><svg className="home-route" viewBox="0 0 180 180"><path d="M25 145V85Q25 60 55 60H110Q145 60 145 25" /><circle cx="25" cy="145" r="9" /><circle cx="145" cy="25" r="9" /><path d="m135 35 10-10 10 10" /></svg><span className="home-route-start">{hero.artwork.routeStart}</span><span className="home-route-end">{hero.artwork.routeEnd.map(line => <span key={line}>{line}</span>)}</span></>}
  </div>;
}

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add({ motion: MQ.motion, desktop: '(min-width: 1024px)', tall: '(min-height: 800px)' }, context => {
      const { motion, desktop, tall } = context.conditions as { motion: boolean; desktop: boolean; tall: boolean };
      if (!motion) return;
      const q = gsap.utils.selector(root);
      const width = stage.current!.clientWidth;
      const height = stage.current!.clientHeight;
      const element = root.current!;
      const footer = q('.home-hero-bottom')[0] as HTMLElement;
      let refresh = 0;
      let disposed = false;
      const measure = () => {
        if (disposed) return;
        // Layout offsets ignore the transforms used by the entrance and scroll.
        const contentHeight = footer.offsetTop + footer.offsetHeight + parseFloat(getComputedStyle(stage.current!).paddingBottom);
        const sticky = String(desktop && tall && contentHeight <= window.innerHeight + 1);
        if (element.dataset.sticky === sticky) return;
        element.dataset.sticky = sticky;
        cancelAnimationFrame(refresh);
        refresh = requestAnimationFrame(() => ScrollTrigger.refresh());
      };
      measure();
      const resize = new ResizeObserver(measure);
      resize.observe(stage.current!);
      resize.observe(q('.home-story')[0]);
      window.addEventListener('resize', measure);
      document.fonts?.ready.then(measure);
      const entrance = gsap.timeline({ defaults: { ease: 'power3.out' } });
      entrance.fromTo(q('[data-home-letter]'), {
        x: (i: number) => heroScatter(i, width, height).x,
        y: (i: number) => heroScatter(i, width, height).y,
        rotation: (i: number) => heroScatter(i, width, height).rotation,
        opacity: .12,
      }, { x: 0, y: 0, rotation: 0, opacity: 1, duration: 1.25, stagger: { each: .012, from: 'center' }, clearProps: 'transform,opacity' }, .05)
        .fromTo(q('[data-home-panel-enter]'), { y: desktop ? 155 : 55, rotation: (i: number) => (i - 2.5) * 11, opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: 1.15, stagger: .065, clearProps: 'transform,opacity' }, .2)
        .fromTo(q('[data-home-enter]'), { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: .65, stagger: .08, clearProps: 'transform,opacity' }, .65);
      // Scroll owns outer wrappers; the entrance never competes for their transforms.
      const scroll = gsap.timeline({ scrollTrigger: {
        trigger: root.current, start: 'top top', end: () => element.dataset.sticky === 'true' ? 'bottom bottom' : 'bottom top',
        scrub: .65, invalidateOnRefresh: true,
      } });
      scroll.to(q('[data-home-panel-scroll]'), {
        x: (i: number) => (i - 2.5) * (desktop ? 25 : 5),
        y: (i: number) => (i % 2 ? -1 : 1) * (desktop ? 42 : 14),
        rotation: (i: number) => (i - 2.5) * (desktop ? 4 : 1.5), ease: 'none', duration: 1,
      }, 0).to(q('[data-home-heading-scroll]'), { y: desktop ? -35 : -12, scale: .96, ease: 'none', duration: 1 }, 0)
        .to(q('[data-home-letter-scroll]'), { y: (i: number) => Math.sin(i * 1.4) * (desktop ? 14 : 4), rotation: (i: number) => Math.sin(i * 2) * 4, stagger: { each: .004, from: 'edges' }, ease: 'none', duration: .35 }, .65)
        .to(q('[data-home-route]'), { strokeDashoffset: 0, ease: 'none', duration: 1 }, 0);
      return () => {
        disposed = true;
        resize.disconnect();
        window.removeEventListener('resize', measure);
        cancelAnimationFrame(refresh);
        delete element.dataset.sticky;
        entrance.kill(); scroll.kill();
      };
    });
    return () => mm.revert();
  }, { scope: root });

  return <section id="top" ref={root} className="home-hero" aria-labelledby="hero-title">
    <div ref={stage} className="home-hero-stage">
      <div className="home-hero-topbar home-contained" data-home-enter><span><i />{hero.locationLabel}</span><span>{company.concept}</span></div>
      <div className="home-story home-contained">
        <p className="home-hero-eyebrow" data-home-enter>{hero.eyebrow}</p>
        <div data-home-heading-scroll><h1 id="hero-title" className="home-title" aria-label={hero.headline.join(' ')}>
          {hero.headline.map((line, lineIndex) => <span className={`home-title-line home-title-line--${lineIndex}`} key={line} aria-hidden="true">
            {line.split(' ').map((word, wordIndex) => <span className="home-title-word" key={wordIndex}>{[...word].map((letter, index) => <span className="home-letter-scroll" data-home-letter-scroll key={index}><span className="home-letter" data-home-letter>{letter}</span></span>)}{' '}</span>)}
          </span>)}
        </h1></div>
        <p className="home-hero-copy" data-home-enter>{hero.copy}</p>
        <div className="home-hero-actions" data-home-enter><ActionLink href={hero.primaryCta.href} size="md">{hero.primaryCta.label}</ActionLink><ActionLink href={hero.secondaryCta.href} size="md" variant="outline">{hero.secondaryCta.label}</ActionLink></div>
      </div>
      <div className="home-deck home-contained">
        <svg className="home-deck-route" viewBox="0 0 1200 260" fill="none" aria-hidden="true"><path data-home-route d="M0 170C210 20 300 260 560 120S940 10 1200 140" /></svg>
        {hero.panels.map((panel, index) => <a key={panel.id} href="#work" className={`home-panel-slot home-panel-slot--${index}`} aria-label={`${hero.panelAction} ${panel.channel}`}>
          <div data-home-panel-scroll><div data-home-panel-enter><article className={`home-panel home-panel--${panel.id}`}>
            <div className="home-panel-label"><span>{panel.channel}</span><ArrowUpRight size={13} aria-hidden="true" /></div>
            <PanelArtwork panel={panel} />
            <div className="home-panel-caption"><h2>{panel.title.map(line => <span key={line}>{line}</span>)}</h2><p>{panel.image ? panel.caption : hero.placeholderLabel}</p></div>
          </article></div></div>
        </a>)}
        <span className="home-commitment" data-home-enter>{company.tagline}<Plus size={16} aria-hidden="true" /></span>
      </div>
      <div className="home-hero-bottom home-contained" data-home-enter><p>{hero.placementNote}</p><a href="#services">{hero.scrollLabel}<ArrowDown size={15} aria-hidden="true" /></a></div>
    </div>
  </section>;
}
