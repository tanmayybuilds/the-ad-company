import { useRef, useState } from 'react';
import { about, company, coverage, footer, nav } from '@/content/site';
import { useReveal } from '@/hooks/use-reveal';
import { ActionLink, Eyebrow, Wordmark } from './primitives';
export { Work } from './Work';
export { TeamTour as Team } from './TeamTour';

export function About() {
  const root = useRef<HTMLElement>(null); useReveal(root);
  return <section id="about" ref={root} className="section-y border-b hairline bg-paper relative z-10" aria-labelledby="about-title"><div className="container-page">
    <div className="grid items-center gap-12 lg:grid-cols-2">
      <div data-reveal>
        <Eyebrow className="mb-4">[04 // Why The Ad Company]</Eyebrow>
        <h2 id="about-title" className="text-display-md">Committed to<br /><span className="text-signal">commitments.</span></h2>
        <p className="mt-5 max-w-xl font-editorial text-xl font-medium leading-relaxed text-signal">{about.positioning}</p>
        <p className="mt-7 max-w-xl text-lg font-medium leading-relaxed">{about.copy}</p>
        <p className="mt-4 max-w-xl leading-relaxed text-ink/65">{about.story}</p>
        <p className="mt-4 max-w-xl leading-relaxed text-ink/65">{about.services}</p>
        <p className="mt-6 max-w-xl font-medium leading-relaxed">{about.strategy}</p>
        <ActionLink href="#contact" variant="outline" size="md" className="mt-7">{about.cta}</ActionLink>
      </div>
      <figure className="about-brand-visual border-2 border-ink bg-sand shadow-hard" data-reveal>
        <img src={`${import.meta.env.BASE_URL}${about.brandVisual.src.slice(1)}`} width={about.brandVisual.width} height={about.brandVisual.height} alt={about.brandVisual.alt} loading="lazy" decoding="async" className="block h-auto w-full" />
        <figcaption className="border-t border-ink/20 p-5"><p className="font-editorial text-xl font-medium leading-snug">{about.brandVisual.caption}</p><p className="mt-2 text-xs leading-relaxed text-ink/65">{about.brandVisual.note}</p></figcaption>
      </figure>
    </div>
    <ul aria-label={about.reasonsLabel} className="mt-12 grid gap-6 border-y border-ink/20 py-7 sm:grid-cols-2 lg:grid-cols-5">
      {about.reasons.map(reason => <li key={reason.title}><h3 className="flex items-start gap-2 font-semibold"><span aria-hidden="true" className="text-signal">✓</span>{reason.title}</h3><p className="mt-3 text-sm leading-relaxed text-ink/70">{reason.copy}</p></li>)}
    </ul>
    <ol className="mt-16 grid gap-5 md:grid-cols-3">{about.process.map((step, i) => <li key={step.title} className="process-card" data-reveal data-reveal-delay={i * .1}><span className="process-number" aria-hidden="true">0{i + 1}</span><Eyebrow className="mb-6 text-[10px]">Step / 0{i + 1}</Eyebrow><h3 className="relative font-display text-xl font-bold uppercase">{step.title}</h3><p className="relative mt-3 text-sm leading-relaxed text-ink/70">{step.copy}</p></li>)}</ol>
  </div></section>;
}

export function Coverage() {
  const root = useRef<HTMLElement>(null); const [active, setActive] = useState(0); useReveal(root);
  return <section id="coverage" ref={root} className="section-y border-b hairline bg-paper" aria-labelledby="coverage-title"><div className="container-page">
    <div data-reveal><Eyebrow className="mb-4">[05 // On-ground presence]</Eyebrow><h2 id="coverage-title" className="text-display-lg">{coverage.heading}</h2><p className="mt-4 text-sm text-ink/65">{coverage.label} · Locations and formats are confirmed for each brief.</p></div>
    <div className="mt-10 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" data-reveal>{coverage.locations.map((location, i) => <button type="button" key={location.name} onClick={() => setActive(i)} aria-pressed={active === i} className={`location-card ${active === i ? 'selected' : ''} ${i === 6 ? 'sm:col-span-2' : ''}`}><span className="mb-4 flex justify-between text-label-index text-[10px]"><span>[0{i + 1} / IN]</span><span>{location.kind}</span></span><span className="block font-display text-2xl font-bold uppercase">{location.name}</span><span className="mt-2 flex items-center justify-between text-xs"><span>{'state' in location ? location.state : 'Regional enquiries'}</span><span aria-hidden="true">↗</span></span></button>)}</div>
      <div className="coverage-panel" data-reveal><div className="flex justify-between border-b border-ink/20 pb-4 text-label-index text-[10px]"><span>Your next placement</span><span>India ↗</span></div><div className="coverage-target" aria-hidden="true"><div /><div /><div /><span>+</span></div><div aria-live="polite"><p className="text-label-index text-signal text-[10px]">Explore a campaign in</p><h3 className="mt-2 font-display text-3xl font-extrabold uppercase">{coverage.locations[active].name}</h3></div><ActionLink href="#contact" variant="outline" size="md" className="mt-6">Discuss availability</ActionLink><p className="mt-5 text-xs leading-relaxed text-ink/60">{coverage.pendingNote}</p></div>
    </div>
  </div></section>;
}

export function Footer({ homePath = '' }: { homePath?: string } = {}) {
  const link = (href: string) => href.startsWith('#') ? `${homePath}${href}` : `${import.meta.env.BASE_URL}${href}`;
  return <footer className="bg-inverse py-12 text-on-inverse"><div className="container-page"><div className="grid gap-10 border-b border-on-inverse/20 pb-10 md:grid-cols-[1.4fr_1fr_1fr]"><div><Wordmark tone="ivory" /><p className="mt-5 font-display text-3xl font-bold leading-tight">Committed to<br />commitments.</p><p className="mt-4 text-sm text-on-inverse/75">{company.description}</p></div><nav aria-label="Footer"><p className="text-label-index mb-4 text-[10px] text-lime">Explore</p><ul className="grid grid-cols-2 gap-3">{nav.map(n => <li key={n.href}><a href={link(n.href)} className="text-sm text-on-inverse/80 hover:text-lime">{n.label}</a></li>)}</ul></nav><div><p className="text-label-index mb-4 text-[10px] text-lime">Make a start</p><a href={link('#contact')} className="font-display text-xl font-bold uppercase hover:text-lime">Tell us about your brand ↗</a><div className="mt-4 flex flex-col items-start gap-2 text-sm text-on-inverse/80"><a className="break-all hover:text-lime" href={`mailto:${company.contact.email}`}>{company.contact.email}</a><a className="hover:text-lime" href={`tel:+${company.contact.whatsapp}`}>{company.contact.phone}</a><a className="hover:text-lime" href={`https://wa.me/${company.contact.whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp ↗</a></div><p className="mt-4 text-xs leading-relaxed text-on-inverse/75">{footer.buildNote}</p></div></div><div className="flex flex-wrap justify-between gap-4 pt-6 text-label-index text-[10px] text-on-inverse/75"><span>{footer.copyright}</span><a href={link('#privacy')} className="hover:text-lime">Privacy & enquiry information</a><a href="#top" className="hover:text-lime">Back to top ↑</a></div></div></footer>;
}
