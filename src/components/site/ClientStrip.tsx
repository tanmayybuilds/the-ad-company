import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { clients, work } from "@/content/site";
import { gsap, MOTION, MQ, useGSAP } from "@/lib/motion";
import { loopOffset, brandTrackX } from "@/lib/brand-motion.mjs";
import { Wordmark } from "./primitives";
import { clientGalleryHref } from '@/lib/client-gallery';

const asset = (src: string) => src.startsWith("/") ? `${import.meta.env.BASE_URL}${src.slice(1)}` : src;

export function CampaignPreview({ clientName, active, motion }: { clientName: string; active: boolean; motion: boolean }) {
  const projects = work.projects.filter(project => project.client === clientName);
  const [slide, setSlide] = useState(0);
  const photos = projects.flatMap(project => project.photos);
  const video = projects.find(project => project.video)?.video;
  const photo = photos[slide % photos.length];
  const galleryId = projects.find(project => project.galleryId)?.galleryId;
  return <>
    {photo ? <figure className="brand-campaign-photo">
      <img src={asset(photo.thumbnail || photo.src)} alt={photo.alt} width={photo.width} height={photo.height} decoding="async" />
      <figcaption className="brand-photo-controls">
        <button type="button" aria-label={clients.previousPhoto} disabled={photos.length < 2} onClick={() => setSlide(value => (value - 1 + photos.length) % photos.length)}>←</button>
        <span aria-live="polite">{slide % photos.length + 1} / {photos.length}</span>
        <button type="button" aria-label={clients.nextPhoto} disabled={photos.length < 2} onClick={() => setSlide(value => (value + 1) % photos.length)}>→</button>
      </figcaption>
    </figure> : active && motion && video ? <video src={asset(video.src)} poster={video.poster ? asset(video.poster) : undefined} aria-label={video.alt} autoPlay muted loop playsInline preload="none" />
      : video?.poster ? <img src={asset(video.poster)} alt={video.alt} loading="lazy" />
      : null}
    {galleryId && <a className="brand-gallery-link" href={`${import.meta.env.BASE_URL}gallery.html?brand=${galleryId}`}>{clients.viewGallery}<span aria-hidden="true">↗</span></a>}
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
  const dialog = useRef<HTMLDialogElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const [preview, setPreview] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [motion, setMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const active = preview ?? focused ?? hovered;
  const control = useRef({ active, paused });
  const focusCard = useRef<(index: number, row: number) => void>(() => {});

  useEffect(() => {
    control.current = { active, paused };
  }, [active, paused]);

  const closePreview = () => {
    setPreview(null);
    setHovered(null);
  };

  const openPreview = (id: number) => {
    if (window.matchMedia('(max-width: 767px)').matches) {
      window.location.assign(clientGalleryHref(clients.items[id % clients.items.length].name, work.projects, import.meta.env.BASE_URL));
      return;
    }
    setPreview(id);
  };

  // Lock body scroll while modal is active
  useEffect(() => {
    if (preview === null || !dialog.current) return;
    const modal = dialog.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    modal.showModal();
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      modal.close();
      document.body.style.overflow = originalOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, [preview]);

  useGSAP(() => {
    const section = root.current!;
    const tracks = [...section.querySelectorAll<HTMLElement>("[data-brand-track]")].map(track => ({
      track,
      group: track.firstElementChild as HTMLElement,
      reverse: track.dataset.brandTrack === 'reverse',
      offset: 0,
      width: 0,
    }));
    const cards = [...section.querySelectorAll<HTMLElement>("[data-brand-card]")];
    const mm = gsap.matchMedia();

    mm.add({ motion: MQ.motion, reduce: MQ.reduce, mobile: "(max-width: 767px)" }, context => {
      const isMotion = !!context.conditions?.motion;
      setMotion(isMotion);
      for (const row of tracks) {
        row.offset = 0;
        row.width = row.group.getBoundingClientRect().width;
        if (isMotion && row.width > 0) row.track.style.transform = `translate3d(${brandTrackX(0, row.width, row.reverse)}px,0,0)`;
      }
      const speed = MOTION.clients.pixelsPerSecond;
      let visible = false;
      let listening = false;
      let previousSelected: number | null = null;
      section.dataset.motion = String(isMotion);

      if (isMotion) {
        // Starts compact when docked at bottom of initial hero screen, then enlarges as user scrolls down
        gsap.fromTo(section, { "--brand-expansion": 0 }, {
          "--brand-expansion": 1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom-=30", // begins enlarging as soon as scroll starts
            end: "top 60%",          // animation completed and reaches final size at this stage
            scrub: 0.1,
          },
        });
      } else {
        section.style.setProperty("--brand-expansion", "1");
      }

      const resize = new ResizeObserver(() => {
        for (const row of tracks) {
          const next = row.group.getBoundingClientRect().width;
          if (next > 0) {
            row.offset = row.width > 0 ? (row.offset / row.width) * next : 0;
            row.width = next;
            if (isMotion) row.track.style.transform = `translate3d(${brandTrackX(row.offset, row.width, row.reverse)}px,0,0)`;
          }
        }
      });
      tracks.forEach(row => resize.observe(row.group));

      focusCard.current = (index, rowIndex) => {
        if (!isMotion) return;
        const row = tracks[rowIndex];
        const visibleCards = [...row.group.querySelectorAll<HTMLElement>('[data-brand-card]')].filter(card => card.offsetWidth > 0);
        const slot = visibleCards.findIndex(card => Number(card.dataset.brandIndex) === index);
        if (slot < 0 || !row.width) return;
        const pitch = row.width / visibleCards.length;
        const offset = Math.max(0, slot * pitch - row.track.parentElement!.clientWidth / 2 + pitch / 2);
        row.offset = row.reverse ? row.width - offset : offset;
        // Align the real focusable copy; the moving loop may currently show its visual duplicate.
        row.track.style.transform = `translate3d(${-offset}px,0,0)`;
      };

      const tick = (_time: number, delta: number) => {
        const { active: selected, paused: stopped } = control.current;
        const dt = Math.min(delta / 1000, 0.05);

        for (const row of tracks) {
          if (!row.width || !row.track.parentElement!.offsetWidth) continue;
          if (isMotion && !stopped && selected === null) {
            row.offset = loopOffset(row.offset + speed * dt, row.width);
            row.track.style.transform = `translate3d(${brandTrackX(row.offset, row.width, row.reverse)}px,0,0)`;
          }
        }

        // Toggle active states for cards
        if (previousSelected !== selected) {
          cards.forEach(card => {
            const isCardActive = selected === Number(card.dataset.brandIndex);
            card.classList.toggle("is-active", isCardActive);
          });
          previousSelected = selected;
        }
      };

      const visibility = () => {
        const run = visible && !document.hidden;
        setPlaying(run);
        if (run && !listening) { gsap.ticker.add(tick); listening = true; }
        if (!run && listening) { gsap.ticker.remove(tick); listening = false; }
      };

      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        visibility();
      });
      observer.observe(section);
      document.addEventListener("visibilitychange", visibility);

      return () => {
        gsap.ticker.remove(tick);
        observer.disconnect();
        resize.disconnect();
        document.removeEventListener("visibilitychange", visibility);
        tracks.forEach(row => { row.track.style.transform = ""; });
        cards.forEach(card => card.classList.remove("is-active"));
        focusCard.current = () => {};
      };
    });

    return () => mm.revert();
  }, { scope: root });

  const selectedClient = preview === null ? null : clients.items[preview % clients.items.length];

  return (
    <section
      ref={root}
      className="brand-marquee"
      aria-labelledby="clients-title"
      data-preview={preview !== null}
      data-paused={paused}
      data-playing={playing}
      onPointerLeave={() => {
        if (focused === null && preview === null) setHovered(null);
      }}
    >
      <div className="brand-dust" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
      <div className="container-page brand-heading">
        <div className="brand-heading-left">
          <span className="text-label-index brand-index">[02 // BRANDS]</span>
          <h2 id="clients-title" className="brand-heading-title"><span className="brand-desktop-copy">{clients.heading}</span><a className="brand-mobile-copy" href={`${import.meta.env.BASE_URL}gallery.html#campaign-wall`}>{clients.heading}<span aria-hidden="true">↗</span></a></h2>
        </div>
        <div className="brand-heading-right">
          <p className="brand-hint"><span className="brand-desktop-copy">{clients.interactionHint}</span><span className="brand-mobile-copy">{clients.mobileHint}</span></p>
          <button
            type="button"
            className="brand-pause"
            aria-label={paused ? clients.resume : clients.pause}
            aria-pressed={paused}
            onClick={() => setPaused(value => !value)}
          >
            {paused ? "▶" : "Ⅱ"}
          </button>
        </div>
      </div>

      {[false, true].map((reverse, rowIndex) => <div className={`brand-stage${reverse ? ' brand-stage--reverse' : ''}`} data-brand-row={reverse ? 'reverse' : 'forward'} key={rowIndex}>
        <div className="brand-track" data-brand-track={reverse ? 'reverse' : 'forward'}>
          {[0, 1].map(copy => (
            <div className="brand-group" key={copy} aria-hidden={copy === 1 ? true : undefined}>
              {clients.items.map((client, index) => ({ client, index })).filter(({ index }) => !reverse || index >= Math.ceil(clients.items.length / 2)).map(({ client, index }) => {
                const id = copy * clients.items.length + index;
                const Tag = copy ? "div" : "button";
                const isSelected = active === id;
                return (
                  <div
                    className={`brand-slot${isSelected ? " is-active" : ""}`}
                    key={client.name}
                    data-brand-card=""
                    data-brand-index={id}
                    data-mobile-group={index < Math.ceil(clients.items.length / 2) ? 'first' : 'second'}
                    onPointerEnter={event => {
                      if (event.pointerType === "mouse") setHovered(id);
                    }}
                    onPointerLeave={event => {
                      if (event.pointerType === "mouse" && preview === null) setHovered(null);
                    }}
                  >
                    <Tag
                      className="brand-lift"
                      type={copy ? undefined : "button"}
                      aria-label={copy ? undefined : `${clients.preview} ${client.name}`}
                      aria-expanded={copy ? undefined : preview === id}
                      aria-controls={!copy && preview === id ? "brand-preview" : undefined}
                      onFocus={copy ? undefined : event => {
                        if (event.currentTarget.matches(":focus-visible")) {
                          setFocused(id);
                          focusCard.current(index, rowIndex);
                        }
                      }}
                      onBlur={copy ? undefined : () => setFocused(null)}
                      onPointerDown={event => {
                        if (event.pointerType === "mouse") event.preventDefault();
                      }}
                      onClick={() => openPreview(id)}
                    >
                      <span className="brand-spin">
                        {/* FRONT FACE: Official Logo */}
                        <span className="brand-face brand-front">
                          <span className="brand-logo" style={{ backgroundColor: client.background || "#f5f1e8" }}>
                            <img
                              src={asset(client.logo)}
                              alt={client.name}
                              width={client.width}
                              height={client.height}
                              loading="lazy"
                              decoding="async"
                            />
                          </span>
                        </span>
                        {/* BACK FACE: Brand Name & Clickable View More Button */}
                        <span className="brand-face brand-back">
                          <span className="brand-back-tag">PARTNER</span>
                          <strong className="brand-back-name">{client.name}</strong>
                          <span
                            className="brand-view-more"
                            onClick={event => {
                              event.stopPropagation();
                              openPreview(id);
                            }}
                          >
                            <span>{clients.viewMore}</span>
                            <span aria-hidden="true" className="brand-view-more-arrow">↗</span>
                          </span>
                        </span>
                      </span>
                    </Tag>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>)}

      {/* FULL-SCREEN SHOWCASE MODAL — Portaled directly to body so it is NOT limited to the brand section */}
      {mounted && selectedClient && createPortal(
        <dialog
          ref={dialog}
          className="brand-modal-root"
          aria-labelledby="brand-modal-title"
          onCancel={event => { event.preventDefault(); closePreview(); }}
        >
          <div
            className="brand-modal-backdrop"
            aria-hidden="true"
            onClick={closePreview}
          />
          <aside id="brand-preview" className="brand-modal-dialog">
            <div className="brand-modal-header">
              <div className="brand-modal-brand">
                <div className="brand-preview-logo" style={{ backgroundColor: selectedClient.background || "#f5f1e8" }}>
                  <img
                    src={asset(selectedClient.logo)}
                    alt=""
                    width={selectedClient.width}
                    height={selectedClient.height}
                  />
                </div>
                <div className="brand-modal-meta">
                  <span className="brand-modal-kicker">OFFLINE CAMPAIGN SHOWCASE</span>
                  <h3 id="brand-modal-title">{selectedClient.name}</h3>
                </div>
              </div>
              <button
                className="brand-close"
                type="button"
                aria-label={clients.closePreview}
                onClick={closePreview}
              >
                ×
              </button>
            </div>

            <div className="brand-modal-body">
              <CampaignPreview
                key={selectedClient.name}
                clientName={selectedClient.name}
                active={!paused && playing}
                motion={motion}
              />
            </div>

            <div className="brand-modal-footer">
              <div className="brand-modal-note">
                <Wordmark />
              </div>
              <a href="#contact" className="brand-modal-cta" onClick={closePreview}>
                <span>Discuss a campaign like this</span>
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </aside>
        </dialog>,
        document.body
      )}
    </section>
  );
}
