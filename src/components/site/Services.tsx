import { useEffect, useRef, useState } from "react";
import { services } from "@/content/site";
import { gsap, ScrollTrigger, MQ, useGSAP } from "@/lib/motion";
import { TOTAL_FRAMES, ZONE_STARTS, sequenceFrame, sequenceProgressFrame, sequenceZone, sequenceSource } from "@/lib/service-sequence.mjs";
import { Eyebrow } from "./primitives";

export function Services() {
  const root = useRef<HTMLElement>(null);
  const journey = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const requestedFrame = useRef(0);
  const drawnFrame = useRef(-1);
  const activeZone = useRef(0);
  const navigate = useRef<(zone: number) => void>(() => {});
  const render = useRef<(frame: number) => void>(() => {});
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const element = canvas.current!;
    element.dataset.loaderState = "starting";
    const ctx = element.getContext("2d", { alpha: false });
    if (!ctx) { setUnavailable(true); return; }
    let disposed = false;
    let settled = 0;
    let failed = 0;
    drawnFrame.current = -1;
    const frames = Array.from({ length: TOTAL_FRAMES }, () => new Image());

    const isReady = (i: number) => {
      const img = frames[i];
      return !!img && img.complete && img.naturalWidth > 0;
    };

    render.current = value => {
      const target = sequenceFrame(value);
      requestedFrame.current = target;
      let index = target;

      // Nearest loaded frame fallback
      if (!isReady(index)) {
        index = -1;
        for (let d = 1; d < TOTAL_FRAMES; d++) {
          if (target - d >= 0 && isReady(target - d)) { index = target - d; break; }
          if (target + d < TOTAL_FRAMES && isReady(target + d)) { index = target + d; break; }
        }
      }

      if (index < 0 || drawnFrame.current === index) return;
      const image = frames[index];
      if (element.width !== image.naturalWidth || element.height !== image.naturalHeight) {
        element.width = image.naturalWidth;
        element.height = image.naturalHeight;
      }
      ctx.drawImage(image, 0, 0);
      element.dataset.frame = String(index + 1);
      element.dataset.ready = "true";
      drawnFrame.current = index;
    };

    const onLoadOrError = (event: Event | string) => {
      if (disposed) return;
      settled++;
      if (typeof event === "string" || event.type === "error") failed++;
      render.current(requestedFrame.current);
      if (progress.current) {
        progress.current.style.setProperty("--loaded", String(settled / TOTAL_FRAMES));
        progress.current.setAttribute("aria-valuenow", String(settled));
        progress.current.hidden = settled === TOTAL_FRAMES;
      }
      if (settled === TOTAL_FRAMES) setUnavailable(failed > 0);
    };

    // High priority: preload keyframe starts for all categories first
    const priorityStarts = [0, 42, 99, 156, 206];
    priorityStarts.forEach(index => {
      const image = frames[index];
      image.decoding = "async";
      image.onload = image.onerror = onLoadOrError;
      image.src = sequenceSource(index, import.meta.env.BASE_URL);
    });

    // Load remaining frames
    for (let index = 0; index < TOTAL_FRAMES; index++) {
      if (priorityStarts.includes(index)) continue;
      const image = frames[index];
      image.decoding = "async";
      image.onload = image.onerror = onLoadOrError;
      image.src = sequenceSource(index, import.meta.env.BASE_URL);
    }

    element.dataset.loaderState = "loading";
    render.current(ZONE_STARTS[activeZone.current]);

    return () => {
      element.dataset.loaderState = "disposed";
      disposed = true;
      render.current = () => {};
      frames.forEach(image => { image.onload = image.onerror = null; image.src = ""; });
    };
  }, []);

  useGSAP(() => {
    const scene = journey.current!;
    const stageEl = stage.current!;
    const mm = gsap.matchMedia();

    mm.add({ motion: MQ.motion, reduce: MQ.reduce }, context => {
      const reduced = !!context.conditions?.reduce;

      const update = (self: ScrollTrigger) => {
        const frame = sequenceProgressFrame(self.progress);
        const zone = sequenceZone(frame);
        if (zone !== activeZone.current) {
          activeZone.current = zone;
          setActive(zone);
        }
        const targetFrame = reduced ? ZONE_STARTS[zone] : frame;
        requestedFrame.current = targetFrame;
        render.current(targetFrame);
      };

      const stickyTop = () => parseFloat(getComputedStyle(scene).getPropertyValue("--service-top")) || 88;

      const trigger = ScrollTrigger.create({
        trigger: scene,
        start: () => `top top+=${stickyTop()}`,
        end: () => `+=${Math.round(window.innerHeight * 2.4)}`,
        pin: stageEl,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: update,
        onRefresh: update,
      });

      triggerRef.current = trigger;

      let refreshFrame = 0;
      const resize = new ResizeObserver(() => {
        cancelAnimationFrame(refreshFrame);
        refreshFrame = requestAnimationFrame(() => trigger.refresh());
      });
      resize.observe(scene);
      resize.observe(root.current!);
      for (let sibling = root.current?.previousElementSibling; sibling; sibling = sibling.previousElementSibling) {
        resize.observe(sibling);
      }

      let scrollTween: gsap.core.Tween | undefined;
      navigate.current = (zone: number) => {
        const targetZone = Math.max(0, Math.min(services.items.length - 1, zone));
        activeZone.current = targetZone;
        setActive(targetZone);

        const targetFrame = ZONE_STARTS[targetZone];
        requestedFrame.current = targetFrame;
        render.current(targetFrame);

        if (trigger) {
          trigger.refresh();
          const targetProgress = targetFrame / (TOTAL_FRAMES - 1);
          const y = trigger.start + targetProgress * (trigger.end - trigger.start);
          scrollTween?.kill();
          const previousBehavior = document.documentElement.style.scrollBehavior;
          document.documentElement.style.scrollBehavior = "auto";
          const restoreBehavior = () => { document.documentElement.style.scrollBehavior = previousBehavior; };
          scrollTween = gsap.to(window, {
            scrollTo: { y, autoKill: false },
            duration: reduced ? 0 : 0.65,
            ease: "power2.inOut",
            overwrite: "auto",
            onComplete: restoreBehavior,
            onInterrupt: restoreBehavior,
          });
        }
      };

      return () => {
        resize.disconnect();
        cancelAnimationFrame(refreshFrame);
        scrollTween?.kill();
        trigger.kill();
        triggerRef.current = null;
        navigate.current = () => {};
      };
    });

    return () => mm.revert();
  }, { scope: root });

  const current = services.items[active];

  return (
    <section id="services" ref={root} aria-labelledby="services-title" className="service-sequence section-y">
      <span id="work" className="sr-only" aria-hidden="true" />
      <div className="container-page">
        <div className="service-intro">
          <div>
            <Eyebrow className="mb-3">{services.eyebrow}</Eyebrow>
            <h2 id="services-title" className="text-display-lg">{services.heading[0]}<br />{services.heading[1]}</h2>
          </div>
          <p>{services.intro}</p>
        </div>
        <div ref={journey} className="service-journey">
          <div ref={stage} className="service-stage">
            <figure id="service-visual" className="service-viewport">
              <div className="service-viewport-heading">
                <span>Format example // {current.visualLabel}</span>
                <span>Illustration // [{current.index}]</span>
              </div>
              <div className="service-screen">
                <img className="service-poster" src={sequenceSource(0, import.meta.env.BASE_URL)} alt="Illustrative miniature city with advertising placements." width="1080" height="608" />
                <canvas ref={canvas} width="1080" height="608" role="img" aria-label={`Illustrative 3D environment: ${current.title}`} />
                <span className="service-screen-label">[{current.index}] {current.title}</span>
                <div ref={progress} className="service-loading" role="progressbar" aria-label={services.loadingLabel} aria-valuemin={0} aria-valuemax={TOTAL_FRAMES} aria-valuenow={0} />
              </div>
              <figcaption>
                <div className="service-metadata"><div><span>Formats</span><strong>{current.formats.length} listed</strong></div><div><span>Focus</span><strong>{current.focusLabel}</strong></div></div>
                <p className="service-journey-hint">{services.journeyHint}</p>
                {unavailable && <p className="service-load-warning" role="status">{services.unavailable}</p>}
              </figcaption>
            </figure>
            <ol className="service-zones" aria-label="Advertising environments">
              {services.items.map((service, index) => (
                <li key={service.id} className="service-zone" data-active={active === index}>
                  <button type="button" className="service-zone-card" aria-expanded={active === index} aria-controls={`service-details-${service.id}`} onClick={() => navigate.current(index)}>
                    <span className="service-zone-top"><span className="service-zone-number">{service.index}</span><span className="service-zone-title">{service.title}</span><span className="service-zone-toggle" aria-hidden="true">{active === index ? "−" : "+"}</span></span>
                    <span id={`service-details-${service.id}`} className="service-zone-details" aria-hidden={active !== index}>
                      <span className="service-zone-details-inner">
                        <span className="service-zone-badge">{service.badge}</span>
                        <span className="service-zone-lead">{service.lead}</span>
                        <span className="service-formats">{service.formats.map(format => <span key={format}>{format}</span>)}</span>
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

