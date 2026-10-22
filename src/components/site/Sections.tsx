import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { about, company, coverage, footer, nav, team, work } from '@/content/site';
import { useReveal } from '@/hooks/use-reveal';
import { ActionLink, Eyebrow, Wordmark } from './primitives';
import residential from '@/assets/service-residential.jpg';
import outdoor from '@/assets/service-outdoor.jpg';
import corporate from '@/assets/service-corporate.jpg';

const examples = [
  { title: 'In the neighbourhood.', type: 'Residential & community', image: residential, alt: 'Illustrated residential advertising environment', copy: 'From a lobby screen to a community activation, bring a brand into the places people call home.', formats: ['Society advertising', 'Digital screens', 'Community activations'] },
  { title: 'Along the everyday route.', type: 'Outdoor & transit', image: outdoor, alt: 'Illustrated street with branded transport and roadside advertising', copy: 'Build a presence along everyday journeys with outdoor placements and branded vehicles.', formats: ['Outdoor digital', 'Auto & cab branding', 'Transit advertising'] },
  { title: 'Part of the working day.', type: 'Corporate & coworking', image: corporate, alt: 'Illustrated office lobby with advertising screens', copy: 'Meet audiences at work through office placements and workplace activations.', formats: ['Office advertising', 'Coworking campaigns', 'Workplace activations'] },
];

export function Work() {
  const root = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<number | null>(null);
  useReveal(root);
  useEffect(() => {
    if (selected === null) return;
    const previous = document.activeElement as HTMLElement;
    dialog.current?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }, [selected]);
  const project = selected === null ? null : examples[selected];
  return <section id="work" ref={root} className="section-y bg-ink text-ivory" aria-labelledby="work-title">
    <div className="container-page">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6" data-reveal>
        <div><Eyebrow tone="lime" className="mb-4">[03 // Out in the world]</Eyebrow><h2 id="work-title" className="text-display-lg max-w-3xl">{work.heading[0]}<br /><span className="text-lime">{work.heading[1]}</span></h2></div>
        <p className="max-w-60 text-sm leading-relaxed text-ivory/65">A look at the possibilities.<br />Illustrative formats; campaign stories to follow.</p>
      </div>
      <div className="work-grid">
        {examples.map((item, index) => <button type="button" key={item.type} onClick={() => setSelected(index)} className={`work-card group text-left ${index === 0 ? 'work-featured' : ''}`} data-reveal aria-haspopup="dialog">
          <div className="work-image"><img src={item.image} alt={item.alt} loading="lazy" width="1024" height="768" /><span className="work-stamp">Illustrative concept / 0{index + 1}</span><span className="work-arrow" aria-hidden="true"><ArrowUpRight /></span></div>
          <div className="p-5"><p className="text-label-index mb-2 text-[10px] text-lime">{item.type}</p><h3 className="font-display text-2xl font-bold uppercase leading-tight">{item.title}</h3>{index === 0 && <p className="mt-3 max-w-lg text-sm leading-relaxed text-ivory/70">{item.copy}</p>}<span className="mt-5 flex items-center justify-between border-t border-ivory/20 pt-3 text-label-index text-[10px]">Explore the format <span aria-hidden="true">↗</span></span></div>
        </button>)}
      </div>
    </div>
    <dialog ref={dialog} onClose={() => setSelected(null)} onClick={e => {if (e.target === e.currentTarget) dialog.current?.close();}} className="project-dialog" aria-labelledby="project-title">
      {project && <><button onClick={() => dialog.current?.close()} className="dialog-close" aria-label="Close format details"><X /></button><img src={project.image} alt={project.alt} className="aspect-video w-full object-cover" /><div className="p-6 sm:p-9"><Eyebrow className="mb-3">Illustrative format — not a completed campaign</Eyebrow><h2 id="project-title" className="font-display text-3xl font-extrabold uppercase">{project.title}</h2><p className="my-5 leading-relaxed">{project.copy}</p><ul className="mb-6 flex flex-wrap gap-2">{project.formats.map(f => <li key={f} className="border border-ink/20 px-3 py-2 text-sm">{f}</li>)}</ul><ActionLink href="#contact" size="md" onClick={() => dialog.current?.close()}>Plan a campaign</ActionLink></div></>}
    </dialog>
  </section>;
}

export function About() {
  const root = useRef<HTMLElement>(null); useReveal(root);
  return <section id="about" ref={root} className="section-y border-b hairline bg-paper relative z-10" aria-labelledby="about-title"><div className="container-page">
    <div className="grid items-center gap-12 lg:grid-cols-2">
      <div data-reveal><Eyebrow className="mb-4">[04 // Why The Ad Company]</Eyebrow><h2 id="about-title" className="text-display-md">Committed to<br /><span className="text-signal">commitments.</span></h2><p className="mt-7 max-w-xl text-lg leading-relaxed">{about.copy}</p><p className="mt-4 max-w-lg leading-relaxed text-ink/65">The city is more than a backdrop. It is a collection of neighbourhoods, routines and journeys. We help you find your place in it.</p><ActionLink href="#contact" variant="outline" size="md" className="mt-7">Put your brief on the table</ActionLink></div>
      <figure className="about-poster" data-reveal><div className="flex justify-between border-b border-ink/20 pb-3 text-label-index text-[10px]"><span>The Ad Company</span><span>Everyday places / extraordinary potential</span></div><div className="poster-city" aria-hidden="true"><span /><span /><span /><span /><span /><span /></div><blockquote className="relative z-10 font-display text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold uppercase leading-[.95]">The city<br />is our<br /><span className="text-signal">canvas.</span></blockquote><figcaption className="relative z-10 mt-8 text-label-index text-[11px]">An idea built for the real world. ↗</figcaption></figure>
    </div>
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

export function Team() {
  const root = useRef<HTMLElement>(null); useReveal(root);
  const labels = ['The brief.', 'The plan.', 'The places.', 'The details.', 'The ground.', 'The follow-through.'];
  return <section id="team" ref={root} className="section-y border-b hairline" aria-labelledby="team-title"><div className="container-page"><div className="mb-10 flex flex-wrap items-end justify-between gap-5" data-reveal><div><Eyebrow className="mb-4">[06 // People make it happen]</Eyebrow><h2 id="team-title" className="text-display-lg">{team.heading[0]}<br />{team.heading[1]}</h2></div><p className="max-w-56 text-sm leading-relaxed text-ink/60">Meet the team, coming soon.<br />Profiles will be added after confirmation.</p></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{labels.map((label, i) => <article key={label} className="team-card" data-reveal><div className={`team-art team-art-${i % 3}`} aria-hidden="true"><span>0{i + 1}</span><b>↗</b></div><div className="border-t border-ink/20 p-5"><p className="text-label-index text-[10px] text-signal">Profile to be introduced</p><h3 className="mt-2 font-display text-xl font-bold uppercase">{label}</h3></div></article>)}</div></div></section>;
}

export function Footer() {
  return <footer className="bg-ink py-12 text-ivory"><div className="container-page"><div className="grid gap-10 border-b border-ivory/20 pb-10 md:grid-cols-[1.4fr_1fr_1fr]"><div><Wordmark tone="ivory" tag={false} /><p className="mt-5 font-display text-3xl font-bold leading-tight">Committed to<br />commitments.</p><p className="mt-4 text-sm text-ivory/60">{company.concept}</p></div><nav aria-label="Footer"><p className="text-label-index mb-4 text-[10px] text-lime">Explore</p><ul className="grid grid-cols-2 gap-3">{nav.map(n => <li key={n.href}><a href={n.href} className="text-sm text-ivory/80 hover:text-lime">{n.label}</a></li>)}</ul></nav><div><p className="text-label-index mb-4 text-[10px] text-lime">Make a start</p><a href="#contact" className="font-display text-xl font-bold uppercase hover:text-lime">Tell us about your brand ↗</a><div className="mt-4 flex flex-col items-start gap-2 text-sm text-ivory/80"><a className="break-all hover:text-lime" href={`mailto:${company.contact.email}`}>{company.contact.email}</a><a className="hover:text-lime" href={`tel:+${company.contact.whatsapp}`}>{company.contact.phone}</a><a className="hover:text-lime" href={`https://wa.me/${company.contact.whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp ↗</a></div><p className="mt-4 text-xs leading-relaxed text-ivory/55">{footer.buildNote}</p></div></div><div className="flex flex-wrap justify-between gap-4 pt-6 text-label-index text-[10px] text-ivory/50"><span>{footer.copyright}</span><a href="#privacy" className="hover:text-lime">Privacy & enquiry information</a><a href="#top" className="hover:text-lime">Back to top ↑</a></div></div></footer>;
}
