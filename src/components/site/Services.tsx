import { useEffect, useRef, useState } from "react";
import { services } from "@/content/site";
import { gsap, ScrollTrigger, MQ, MOTION, useGSAP } from "@/lib/motion";
import { TOTAL_FRAMES, ZONE_STARTS, SEQUENCE_FPS, sequenceFrame, sequenceProgressFrame, sequenceZone, sequenceSource, sequenceVideoSource } from "@/lib/service-sequence.mjs";
import { Eyebrow } from "./primitives";
import { exitReversePin, observeScrollDirection, scrollPinTo } from "@/lib/reverse-pin.mjs";

export function Services() {
  const root = useRef<HTMLElement>(null);
  const journey = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const requestedFrame = useRef(0);
  const drawnFrame = useRef(-1);
  const activeZone = useRef(0);
  const navigate = useRef<(zone: number) => void>(() => {});
  const render = useRef<(frame: number) => void>(() => {});
  const [active, setActive] = useState(0);
  const [unavailable, setUnavailable] = useState(false);
  const [fitsViewport, setFitsViewport] = useState(false);

  useEffect(() => {
    const measure = () => {
      const top = parseFloat(getComputedStyle(journey.current!).getPropertyValue('--service-top')) || 88;
      setFitsViewport(stage.current!.offsetHeight <= window.innerHeight - top - 16);
    };
    let disposed = false;
    measure();
    window.addEventListener('resize', measure);
    document.fonts?.ready.then(() => { if (!disposed) measure(); });
    return () => { disposed = true; window.removeEventListener('resize', measure); };
  }, []);

  useEffect(() => {
    const element = video.current!;
    let disposed = false;
    let nearViewport = false;
    const reduced = window.matchMedia(MQ.reduce);
    drawnFrame.current = -1;

    render.current = value => {
      const target = sequenceFrame(value);
      requestedFrame.current = target;
      // Finish the in-flight seek; seeked then picks up the latest scroll target.
      if (disposed || !nearViewport || document.hidden || reduced.matches || element.readyState < 1 || element.seeking) return;
      const time = target / SEQUENCE_FPS;
      if (Math.abs(element.currentTime - time) > .5 / SEQUENCE_FPS) element.currentTime = time;
    };

    const showFrame = () => {
      if (disposed || !nearViewport || document.hidden || reduced.matches || element.seeking || element.readyState < 2) return;
      drawnFrame.current = sequenceFrame(element.currentTime * SEQUENCE_FPS);
      element.dataset.frame = String(drawnFrame.current + 1);
      element.dataset.ready = 'true';
      setUnavailable(false);
      if (progress.current) progress.current.hidden = true;
      render.current(requestedFrame.current);
    };
    const metadata = () => render.current(requestedFrame.current);
    const failure = () => {
      setUnavailable(true);
      element.dataset.ready = 'false';
      if (progress.current) progress.current.hidden = true;
    };
    function syncVisibility() {
      if (reduced.matches) {
        element.pause();
        if (element.getAttribute('src')) { element.removeAttribute('src'); element.load(); }
        element.dataset.ready = 'false';
        drawnFrame.current = -1;
        if (progress.current) progress.current.hidden = true;
        return;
      }
      if (!nearViewport || document.hidden) { element.pause(); return; }
      if (!element.getAttribute('src')) {
        element.preload = 'auto';
        element.src = sequenceVideoSource(import.meta.env.BASE_URL, window.innerWidth < 768);
        element.load();
      }
      render.current(requestedFrame.current);
    }
    element.addEventListener('loadedmetadata', metadata);
    element.addEventListener('loadeddata', showFrame);
    element.addEventListener('seeked', showFrame);
    element.addEventListener('error', failure);
    const observer = new IntersectionObserver(([entry]) => {
      nearViewport = entry.isIntersecting;
      syncVisibility();
    }, { rootMargin: '1200px' });
    observer.observe(stage.current!);
    document.addEventListener('visibilitychange', syncVisibility);
    reduced.addEventListener('change', syncVisibility);

    return () => {
      disposed = true;
      render.current = () => {};
      observer.disconnect();
      document.removeEventListener('visibilitychange', syncVisibility);
      reduced.removeEventListener('change', syncVisibility);
      element.removeEventListener('loadedmetadata', metadata);
      element.removeEventListener('loadeddata', showFrame);
      element.removeEventListener('seeked', showFrame);
      element.removeEventListener('error', failure);
      element.pause();
      element.removeAttribute('src');
      element.load();
    };
  }, []);

  useGSAP(() => {
    const scene = journey.current!;
    const stageEl = stage.current!;
    const mm = gsap.matchMedia();

    mm.add({ motion: MQ.motion, reduce: MQ.reduce }, context => {
      const reduced = !!context.conditions?.reduce;
      // A stage taller than the screen must scroll naturally so every category stays reachable.
      if (reduced || !fitsViewport) {
        render.current(ZONE_STARTS[activeZone.current]);
        navigate.current = zone => {
          const index = Math.max(0, Math.min(services.items.length - 1, zone));
          activeZone.current = index;
          setActive(index);
          render.current(ZONE_STARTS[index]);
        };
        return () => { navigate.current = () => {}; };
      }

      let currentFrame = 0;
      let targetFrame = 0;
      let animFrameId: number | null = null;
      let isNavigating = false;
      let refreshing = false;
      let passedStage = false;
      let travelTween: gsap.core.Tween | undefined;
      const scrollDirection = observeScrollDirection();
      const cancelTravel = () => {
        travelTween?.kill();
        travelTween = undefined;
        isNavigating = false;
      };

      const stepDamping = () => {
        const diff = targetFrame - currentFrame;
        if (Math.abs(diff) > 0.05) {
          const absDiff = Math.abs(diff);
          // Controlled cinematic easing: cap max frame advance per tick so it can never whip by too fast
          const maxStep = absDiff > 50 ? absDiff * 0.08 : 1.25;
          const step = Math.sign(diff) * Math.min(absDiff * 0.105, maxStep);
          currentFrame += step;
          const displayFrame = Math.round(currentFrame);
          render.current(displayFrame);

          if (!isNavigating) {
            const zone = sequenceZone(displayFrame);
            if (zone !== activeZone.current) {
              activeZone.current = zone;
              setActive(zone);
            }
          }
          animFrameId = requestAnimationFrame(stepDamping);
        } else {
          currentFrame = targetFrame;
          const displayFrame = Math.round(currentFrame);
          render.current(displayFrame);

          if (!isNavigating) {
            const zone = sequenceZone(displayFrame);
            if (zone !== activeZone.current) {
              activeZone.current = zone;
              setActive(zone);
            }
          }
          animFrameId = null;
        }
      };

      const resetToStart = () => {
        cancelTravel();
        passedStage = false;
        if (animFrameId !== null) cancelAnimationFrame(animFrameId);
        animFrameId = null;
        currentFrame = 0;
        targetFrame = 0;
        requestedFrame.current = 0;
        render.current(0);
        if (activeZone.current !== 0) {
          activeZone.current = 0;
          setActive(0);
        }
      };

      const leaveBackwards = (self: ScrollTrigger) => {
        if (passedStage && !refreshing && !isNavigating && exitReversePin(self, resetToStart, scrollDirection.direction())) scrollDirection.reset();
      };

      const update = (self: ScrollTrigger) => {
        if (refreshing || isNavigating) return;
        if (passedStage && self.direction < 0) {
          leaveBackwards(self);
          return;
        }

        if (self.progress <= 0) {
          resetToStart();
          return;
        }
        if (self.progress >= 1) {
          if (animFrameId !== null) cancelAnimationFrame(animFrameId);
          animFrameId = null;
          currentFrame = TOTAL_FRAMES - 1;
          targetFrame = TOTAL_FRAMES - 1;
          requestedFrame.current = TOTAL_FRAMES - 1;
          render.current(TOTAL_FRAMES - 1);
          const lastZone = services.items.length - 1;
          if (activeZone.current !== lastZone) {
            activeZone.current = lastZone;
            setActive(lastZone);
          }
          return;
        }

        targetFrame = sequenceProgressFrame(self.progress);
        if (animFrameId === null) {
          animFrameId = requestAnimationFrame(stepDamping);
        }
      };

      const syncImmediate = (self: ScrollTrigger) => {
        if (animFrameId !== null) {
          cancelAnimationFrame(animFrameId);
          animFrameId = null;
        }
        const frame = sequenceProgressFrame(self.progress);
        const zone = sequenceZone(frame);
        if (zone !== activeZone.current) {
          activeZone.current = zone;
          setActive(zone);
        }
        currentFrame = frame;
        targetFrame = frame;
        requestedFrame.current = frame;
        render.current(frame);
      };

      const stickyTop = () => parseFloat(getComputedStyle(scene).getPropertyValue("--service-top")) || 88;
      const scrollMultiplier = () =>
        window.innerWidth < 1024 ? MOTION.services.scrollDistanceMobile : MOTION.services.scrollDistanceDesktop;

      const trigger = ScrollTrigger.create({
        trigger: scene,
        // Enable document-order sorting: restore the client strip first, then this pin, then Coverage.
        refreshPriority: 0,
        start: () => `top top+=${stickyTop()}`,
        end: () => `+=${Math.round(window.innerHeight * scrollMultiplier())}`,
        pin: stageEl,
        pinSpacing: true,
        anticipatePin: 0,
        invalidateOnRefresh: true,
        onUpdate: update,
        onRefreshInit: () => { refreshing = true; },
        onRefresh: self => { refreshing = false; if (!isNavigating) syncImmediate(self); },
        onEnter: () => { if (!refreshing) passedStage = false; },
        onEnterBack: leaveBackwards,
        onLeaveBack: () => { if (!refreshing && !isNavigating && scrollDirection.direction() === -1) resetToStart(); },
      });

      const onScroll = () => {
        if (refreshing || isNavigating || document.body.style.overflow === 'hidden') return;
        // At pin end the stage is still visible; latch only after its whole height has scrolled above the header.
        const y = window.scrollY;
        if (!passedStage && y >= trigger.end && y >= trigger.end + stageEl.offsetHeight) passedStage = true;
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });

      const interruptTravel = () => {
        if (!isNavigating) return;
        cancelTravel();
        syncImmediate(trigger);
      };
      const onWheel = (event: WheelEvent) => {
        if (event.ctrlKey || event.defaultPrevented || document.body.style.overflow === "hidden") return;
        const delta = event.deltaY;
        if (Math.abs(delta) <= Math.abs(event.deltaX)) return;
        interruptTravel();
        if (delta < 0) leaveBackwards(trigger);
      };
      const keyTravel = (event: KeyboardEvent) => {
        if (["ArrowUp", "ArrowDown", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) interruptTravel();
      };
      window.addEventListener("wheel", onWheel, { passive: true });
      window.addEventListener("keydown", keyTravel);
      window.addEventListener("pointerdown", interruptTravel);

      let refreshFrame = 0;
      const resize = new ResizeObserver(() => {
        cancelAnimationFrame(refreshFrame);
        refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
      });
      resize.observe(scene);
      resize.observe(root.current!);
      for (let sibling = root.current?.previousElementSibling; sibling; sibling = sibling.previousElementSibling) {
        resize.observe(sibling);
      }

      navigate.current = (zone: number) => {
        const targetZone = Math.max(0, Math.min(services.items.length - 1, zone));
        scrollDirection.reset();
        cancelTravel();
        if (animFrameId !== null) cancelAnimationFrame(animFrameId);
        animFrameId = null;
        passedStage = false;
        isNavigating = true;
        activeZone.current = targetZone;
        setActive(targetZone);
        ScrollTrigger.refresh();
        const destination = ZONE_STARTS[targetZone];
        const alignScroll = () => {
          scrollPinTo(trigger.start + destination / (TOTAL_FRAMES - 1) * (trigger.end - trigger.start));
          ScrollTrigger.update();
        };
        // Pin position and manual frame travel must not run separate easing loops.
        alignScroll();
        const travel = { frame: currentFrame };
        travelTween = gsap.to(travel, {
          frame: destination,
          duration: .45,
          ease: "power2.inOut",
          onUpdate: () => {
            currentFrame = targetFrame = travel.frame;
            render.current(Math.round(currentFrame));
          },
          onComplete: () => {
            currentFrame = targetFrame = destination;
            render.current(destination);
            alignScroll();
            travelTween = undefined;
            isNavigating = false;
          },
        });
      };

      return () => {
        scrollDirection.destroy();
        cancelTravel();
        if (animFrameId !== null) cancelAnimationFrame(animFrameId);
        window.removeEventListener("wheel", onWheel);
        window.removeEventListener("keydown", keyTravel);
        window.removeEventListener("pointerdown", interruptTravel);
        window.removeEventListener('scroll', onScroll);
        resize.disconnect();
        cancelAnimationFrame(refreshFrame);
        trigger.kill();
        navigate.current = () => {};
      };
    });

    return () => mm.revert();
  }, { scope: root, dependencies: [fitsViewport], revertOnUpdate: true });

  const current = services.items[active];

  return (
    <section id="services" ref={root} aria-labelledby="services-title" className="service-sequence pt-14 lg:pt-20 pb-0">
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
                <img className="service-poster" src={sequenceSource(ZONE_STARTS[active], import.meta.env.BASE_URL)} alt={`${services.previewAlt} ${current.title}.`} width="1080" height="608" decoding="async" />
                <video ref={video} width="1080" height="608" muted playsInline preload="none" aria-label={`Illustrative 3D environment: ${current.title}`} />
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

