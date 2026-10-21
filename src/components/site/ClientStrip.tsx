import { useEffect, useRef, useState } from "react";
import { clients, work, type Project } from "@/content/site";
import { gsap, MOTION, MQ, useGSAP } from "@/lib/motion";
import { cardAngle, loopOffset } from "@/lib/brand-motion.mjs";

const asset = (src: string) => src.startsWith("/") ? `${import.meta.env.BASE_URL}${src.slice(1)}` : src;

function CampaignPreview({ projects, active, motion }: { projects: Project[]; active: boolean; motion: boolean }) {
  const [slide, setSlide] = useState(0);
  const photos = projects.flatMap(project => project.photos);
  const video = projects.find(project => project.video)?.video;
  useEffect(() => {
    if (!active || !motion || photos.length < 2) return;
    const timer = setInterval(() => setSlide(value => (value + 1) % photos.length), 3000);
    return () => clearInterval(timer);
  }, [active, motion, photos.length]);
  const photo = photos[slide % photos.length];
  return <>
    {active && motion && video ? <video src={asset(video.src)} poster={video.poster ? asset(video.poster) : undefined} aria-label={video.alt} autoPlay muted loop playsInline preload="none" />
      : video?.poster ? <img src={asset(video.poster)} alt={video.alt} loading="lazy" />
      : photo ? <img src={asset(photo.src)} alt={photo.alt} loading="lazy" /> : null}
    <span className="brand-project-copy">
      {projects.length ? projects.map(project => <span key={project.id} className="brand-project">
        {(project.title || project.service) && <strong>{project.title || project.service}</strong>}
        {project.description && <span>{project.description}</span>}
        {project.deliverables?.length ? <span className="brand-tags">{project.deliverables.map(tag => <span key={tag}>{tag}</span>)}</span> : null}
      </span>) : <span>{clients.pending}</span>}
    </span>
  </>;
}

export function ClientStrip() {
  const root = useRef<HTMLElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [motion, setMotion] = useState(false);
  const active = pinned ?? focused ?? hovered;
  const control = useRef({ active, paused });
  const focusCard = useRef<(index: number) => void>(() => {});
  const touchStart = useRef<{ id: number; x: number; y: number } | null>(null);
  useEffect(() => { control.current = { active, paused }; }, [active, paused]);

  useGSAP(() => {
    const section = root.current!;
    const track = section.querySelector<HTMLElement>("[data-brand-track]")!;
    const group = track.firstElementChild as HTMLElement;
    const cards = [...section.querySelectorAll<HTMLElement>("[data-brand-card]")];
    const spins = cards.map(card => card.querySelector<HTMLElement>(".brand-spin")!);
    const mm = gsap.matchMedia();
    mm.add({ motion: MQ.motion, reduce: MQ.reduce }, context => {
      const motion = !!context.conditions?.motion;
      setMotion(motion);
      let global = 0;
      let offset = 0;
      let width = group.getBoundingClientRect().width;
      let visible = false;
      let listening = false;
      const angles = cards.map(() => 0);
      let previousSelected: number | null = null;
      section.dataset.motion = String(motion);
      if (motion) gsap.fromTo(section, { "--brand-expansion": 0 }, {
        "--brand-expansion": 1, ease: "none",
        scrollTrigger: { trigger: section, start: "top bottom", end: "top 40%", scrub: 0.6 },
      });
      else section.style.setProperty("--brand-expansion", "1");

      const resize = new ResizeObserver(() => {
        const next = group.getBoundingClientRect().width;
        offset = width ? offset / width * next : 0;
        width = next;
      });
      resize.observe(group);
      focusCard.current = index => {
        if (!motion) return;
        const pitch = width / clients.items.length;
        offset = index * pitch - window.innerWidth / 2 + pitch / 2;
        track.style.transform = `translate3d(${-offset}px,0,0)`;
      };
      const tick = (_time: number, delta: number) => {
        const { active: selected, paused: stopped } = control.current;
        const dt = Math.min(delta / 1000, 0.05);
        const advance = motion && !stopped ? MOTION.clients.degreesPerSecond * dt : 0;
        global += advance;
        if (motion && !stopped && selected === null) {
          offset = loopOffset(offset + MOTION.clients.pixelsPerSecond * dt, width);
          track.style.transform = `translate3d(${-offset}px,0,0)`;
        }
        cards.forEach((card, index) => {
          const selectedCard = selected === index;
          const angle = motion ? cardAngle(angles[index] - (selectedCard ? advance : 0), global, selectedCard, dt) : selectedCard ? 180 : 0;
          angles[index] = angle - global;
          const transform = `rotateY(${angle}deg)`;
          if (spins[index].style.transform !== transform) spins[index].style.transform = transform;
          if (previousSelected !== selected) card.classList.toggle("is-active", selectedCard);
        });
        if (selected !== null && selected !== previousSelected) {
          const card = cards[selected];
          const rect = card.getBoundingClientRect();
          const half = (card.firstElementChild as HTMLElement).offsetWidth * .9;
          const center = rect.left + rect.width / 2;
          const shift = Math.max(half + 12, Math.min(window.innerWidth - half - 12, center)) - center;
          card.style.setProperty("--brand-shift", `${shift}px`);
        }
        previousSelected = selected;
      };
      const visibility = () => {
        const run = visible && !document.hidden;
        setPlaying(run);
        if (run && !listening) { gsap.ticker.add(tick); listening = true; }
        if (!run && listening) { gsap.ticker.remove(tick); listening = false; }
      };
      const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; visibility(); });
      observer.observe(section);
      document.addEventListener("visibilitychange", visibility);
      return () => {
        gsap.ticker.remove(tick);
        observer.disconnect(); resize.disconnect();
        document.removeEventListener("visibilitychange", visibility);
        track.style.transform = "";
        spins.forEach(spin => { spin.style.transform = ""; });
        cards.forEach(card => card.classList.remove("is-active"));
        focusCard.current = () => {};
      };
    });
    return () => mm.revert();
  }, { scope: root });

  const dismiss = () => { setPinned(null); setHovered(null); setFocused(null); };
  const selectedClient = active === null ? null : clients.items[active % clients.items.length];
  const selectedProjects = selectedClient ? work.projects.filter(project => project.client === selectedClient.name) : [];
  return <section ref={root} className="brand-marquee section-y" aria-labelledby="clients-title" data-preview={active !== null} data-paused={paused} data-playing={playing}
    onKeyDown={event => { if (event.key === "Escape") { dismiss(); (document.activeElement as HTMLElement)?.blur(); } }}>
    <div className="brand-dust" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
    <div className="container-page brand-heading">
      <h2 id="clients-title" className="text-display-md max-w-3xl">{clients.heading}</h2>
      <button type="button" className="brand-pause" aria-label={paused ? clients.resume : clients.pause} aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? "▶" : "Ⅱ"}</button>
    </div>
    <p className="container-page brand-hint">{clients.interactionHint}</p>
    <div className="brand-stage">
      <div className="brand-track" data-brand-track>
        {[0, 1].map(copy => <div className="brand-group" key={copy} aria-hidden={copy === 1 ? true : undefined}>
          {clients.items.map((client, index) => {
            const id = copy * clients.items.length + index;
            const projects = work.projects.filter(project => project.client === client.name);
            const Tag = copy ? "div" : "button";
            return <div className="brand-slot" key={client.name} data-brand-card
              onPointerEnter={event => { if (event.pointerType === "mouse") setHovered(id); }}
              onPointerLeave={() => setHovered(null)}>
              <Tag className="brand-lift" type={copy ? undefined : "button"} aria-label={copy ? undefined : `${clients.preview} ${client.name}`}
                aria-expanded={copy ? undefined : active === id}
                aria-describedby={!copy && active === id ? "brand-preview-description" : undefined}
                onFocus={copy ? undefined : event => {
                  if (event.currentTarget.matches(":focus-visible")) { setFocused(id); focusCard.current(index); }
                }}
                onBlur={copy ? undefined : () => { setFocused(null); setPinned(null); }}
                onPointerDown={event => {
                  // Pointer previews must not acquire keyboard focus and remain stuck after mouseleave.
                  if (event.pointerType === "mouse") event.preventDefault();
                  else touchStart.current = { id, x: event.clientX, y: event.clientY };
                }}
                onPointerCancel={() => { touchStart.current = null; }}
                onPointerUp={event => {
                  const start = touchStart.current;
                  touchStart.current = null;
                  if (start?.id === id && Math.hypot(event.clientX - start.x, event.clientY - start.y) < 8) {
                    event.preventDefault();
                    setPinned(value => value === id ? null : id);
                  }
                }}>
                <span className="brand-spin">
                  <span className="brand-face brand-front">
                    <span className="brand-logo" style={{ backgroundColor: client.background || "#f5f1e8" }}>
                      <img src={asset(client.logo)} alt={client.name} width={client.width} height={client.height} loading="lazy" decoding="async" />
                    </span>
                  </span>
                  <span className="brand-face brand-back">
                    <strong className="brand-name">{client.name}</strong>
                    <CampaignPreview projects={projects} active={active === id && !paused && playing} motion={motion} />
                  </span>
                </span>
              </Tag>
            </div>;
          })}
        </div>)}
      </div>
    </div>
    <div id="brand-preview-description" className="sr-only" role="status">
      {selectedClient && <>{selectedClient.name}. {selectedProjects.length ? selectedProjects.map(project => [project.title, project.description, project.deliverables?.join(", ")].filter(Boolean).join(". ")).join(". ") : clients.pending}</>}
    </div>
  </section>;
}
