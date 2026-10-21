import { useCallback, useEffect, useRef, useState, type PointerEvent, type TouchEvent } from "react";
import { coverage } from "@/content/site";
import { gsap, ScrollTrigger, MQ, useGSAP } from "@/lib/motion";

/* ── helpers ─────────────────────────────────────────── */
const TOTAL = coverage.locations.length; // 7
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const subLabel = (loc: (typeof coverage.locations)[0]) =>
  "state" in loc && loc.state ? (loc.state as string) : "Regional enquiries";
const classificationBadge = (loc: (typeof coverage.locations)[0]) =>
  loc.kind.toUpperCase() === "STATE / REGION" ? "STATE / REGION" : "CITY";

/* ── Continuous 3D Transform Computation based on fractional offset d = i - pos ── */
function computeContinuousTransform(d: number, isHoveredCenter: boolean) {
  const abs = Math.abs(d);
  const sign = d < 0 ? -1 : 1;

  if (abs >= 2.85) {
    return {
      transform: `translateX(${sign * 160}%) translateZ(-450px) rotateY(${-sign * 48}deg) scale(0.6)`,
      opacity: "0",
      filter: "blur(4px)",
      zIndex: "1",
      visibility: "hidden" as const,
      pointerEvents: "none" as const,
    };
  }

  // Piecewise smooth interpolation for translateX:
  // At 0: 0%, at 1: ±68%, at 2: ±115%
  let tx = 0;
  if (abs <= 1) {
    tx = d * 68;
  } else if (abs <= 2) {
    tx = sign * (68 + (abs - 1) * 47);
  } else {
    tx = sign * (115 + (abs - 2) * 38);
  }

  // Piecewise smooth interpolation for translateZ:
  // At 0: +40px, at 1: -140px, at 2: -280px
  let tz = 0;
  if (abs <= 1) {
    tz = 40 - abs * 180;
  } else if (abs <= 2) {
    tz = -140 - (abs - 1) * 140;
  } else {
    tz = -280 - (abs - 2) * 140;
  }

  // Piecewise smooth interpolation for rotateY:
  // At 0: 0deg, at 1: -sign * 34deg, at 2: -sign * 42deg
  let ry = 0;
  if (abs <= 1) {
    ry = -d * 34;
  } else if (abs <= 2) {
    ry = -sign * (34 + (abs - 1) * 8);
  } else {
    ry = -sign * (42 + (abs - 2) * 5);
  }

  // Piecewise smooth interpolation for scale:
  // At 0: 1.0, at 1: 0.85, at 2: 0.72
  let scale = 1.0;
  if (abs <= 1) {
    scale = 1.0 - abs * 0.15;
  } else if (abs <= 2) {
    scale = 0.85 - (abs - 1) * 0.13;
  } else {
    scale = Math.max(0.55, 0.72 - (abs - 2) * 0.14);
  }

  // Piecewise smooth interpolation for opacity:
  // At 0: 1.0, at 1: 0.82, at 2: 0.35, fades to 0 by 2.8
  let opacity = 1.0;
  if (abs <= 1) {
    opacity = 1.0 - abs * 0.18;
  } else if (abs <= 2) {
    opacity = 0.82 - (abs - 1) * 0.47;
  } else {
    opacity = Math.max(0, 0.35 - (abs - 2) * 0.42);
  }

  // Soft depth blur:
  // At 0: 0px, at 1: 0.5px, at 2: 2px
  let blur = 0;
  if (abs <= 1) {
    blur = abs * 0.5;
  } else if (abs <= 2) {
    blur = 0.5 + (abs - 1) * 1.5;
  } else {
    blur = 2.0 + (abs - 2) * 1.5;
  }

  // Hover expansion override for center card
  if (isHoveredCenter) {
    if (abs < 0.45) {
      scale = 1.14;
      tz = 110;
      opacity = 1.0;
      blur = 0;
    } else {
      tx = sign * Math.max(Math.abs(tx), 95);
      tz = -240;
      opacity = 0.15;
      blur = 4;
    }
  }

  const zIndex = String(Math.round(30 - Math.min(25, abs * 10)));

  return {
    transform: `translateX(${tx.toFixed(2)}%) translateZ(${tz.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg) scale(${scale.toFixed(3)})`,
    opacity: opacity.toFixed(3),
    filter: blur > 0.15 ? `blur(${blur.toFixed(1)}px)` : "none",
    zIndex,
    visibility: opacity > 0.01 ? ("visible" as const) : ("hidden" as const),
    pointerEvents: abs <= 2 && opacity > 0.1 ? ("auto" as const) : ("none" as const),
  };
}

export function CoverflowCoverage() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pillThumbRef = useRef<HTMLDivElement | null>(null);

  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const [hovered, setHovered] = useState(false);
  const hoveredRef = useRef(false);

  const currentPosRef = useRef(0);

  const prevName = useRef(coverage.locations[0].name);
  const [displayName, setDisplayName] = useState(coverage.locations[0].name);
  const [nameKey, setNameKey] = useState(0);

  // Touch tracking for mobile swipe
  const touchStartX = useRef<number | null>(null);

  // Sync giant background watermark text with smooth animation key
  useEffect(() => {
    const next = coverage.locations[active].name;
    if (next !== prevName.current) {
      prevName.current = next;
      setDisplayName(next);
      setNameKey((k) => k + 1);
    }
  }, [active]);

  // Synchronously render cards at any fractional position pos
  const renderCardsAtPos = useCallback((pos: number, isHovered: boolean) => {
    currentPosRef.current = pos;
    for (let i = 0; i < TOTAL; i++) {
      const card = cardRefs.current[i];
      if (!card) continue;
      const d = i - pos;
      const styles = computeContinuousTransform(d, isHovered);
      card.style.transform = styles.transform;
      card.style.opacity = styles.opacity;
      card.style.filter = styles.filter;
      card.style.zIndex = styles.zIndex;
      card.style.visibility = styles.visibility;
      card.style.pointerEvents = styles.pointerEvents;
    }

    if (pillThumbRef.current) {
      const pct = (pos / (TOTAL - 1)) * 100;
      pillThumbRef.current.style.top = `${clamp(pct, 0, 100)}%`;
    }
  }, []);

  // Smooth controlled animated navigation to an index
  const scrollToCard = useCallback(
    (index: number) => {
      const target = clamp(index, 0, TOTAL - 1);
      const st = scrollTriggerRef.current;
      if (!st) {
        setActive(target);
        activeRef.current = target;
        renderCardsAtPos(target, hoveredRef.current);
        return;
      }

      const targetProgress = target / (TOTAL - 1);
      const targetScroll = st.start + targetProgress * (st.end - st.start);

      // Smooth, deliberate, controlled glide (0.65s with power2.out)
      const proxy = { y: window.scrollY };
      gsap.to(proxy, {
        y: targetScroll,
        duration: 0.65,
        ease: "power2.out",
        onUpdate: () => window.scrollTo(0, proxy.y),
      });
    },
    [renderCardsAtPos],
  );

  const prev = useCallback(() => scrollToCard(activeRef.current - 1), [scrollToCard]);
  const next = useCallback(() => scrollToCard(activeRef.current + 1), [scrollToCard]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!root.current) return;
      const rect = root.current.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;

      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        prev();
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  // Hover and Dynamic pointer tracking parallax for center card
  const handlePointerEnter = (e: PointerEvent<HTMLButtonElement>) => {
    setHovered(true);
    hoveredRef.current = true;
    e.currentTarget.style.setProperty("--tilt-active", "1");
    renderCardsAtPos(currentPosRef.current, true);
  };

  const handlePointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const xRatio = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const yRatio = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    const rx = clamp(-yRatio * 8, -8, 8);
    const ry = clamp(xRatio * 8, -8, 8);
    el.style.setProperty("--tilt-rx", `${rx.toFixed(2)}deg`);
    el.style.setProperty("--tilt-ry", `${ry.toFixed(2)}deg`);
  };

  const handlePointerLeave = (e: PointerEvent<HTMLButtonElement>) => {
    setHovered(false);
    hoveredRef.current = false;
    const el = e.currentTarget;
    el.style.removeProperty("--tilt-active");
    el.style.removeProperty("--tilt-rx");
    el.style.removeProperty("--tilt-ry");
    renderCardsAtPos(currentPosRef.current, false);
  };

  // Mobile Touch handlers
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 35) {
      if (diff > 0) prev();
      else next();
    }
    touchStartX.current = null;
  };

  // GSAP ScrollTrigger: Continuous 1:1 scroll-scrubbed physics with controlled pacing
  useGSAP(
    () => {
      const section = root.current;
      const stageEl = stage.current;
      if (!section || !stageEl) return;

      const mm = gsap.matchMedia();
      mm.add({ motion: MQ.motion }, (ctx) => {
        if (!ctx.conditions?.motion) return;

        // Render initial resting state at position 0
        renderCardsAtPos(0, false);

        const st = ScrollTrigger.create({
          id: "coverage-trigger",
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          pin: stageEl,
          pinSpacing: false,
          scrub: 0.6, // Silky smooth damping that glides in sync with scroll
          snap: {
            snapTo: 1 / (TOTAL - 1),
            duration: { min: 0.35, max: 0.6 }, // Slower, calmer, graceful settling
            delay: 0.1,
            ease: "power2.out",
          },
          onUpdate: (self) => {
            const continuousPos = self.progress * (TOTAL - 1);
            renderCardsAtPos(continuousPos, hoveredRef.current);

            const nearest = clamp(Math.round(continuousPos), 0, TOTAL - 1);
            if (nearest !== activeRef.current) {
              activeRef.current = nearest;
              setActive(nearest);
            }
          },
        });

        scrollTriggerRef.current = st;
      });

      return () => {
        scrollTriggerRef.current = null;
        mm.revert();
      };
    },
    { scope: root, dependencies: [renderCardsAtPos] },
  );

  return (
    <section
      id="coverage"
      ref={root}
      className="cov-scroll-wrapper"
      aria-labelledby="coverage-title"
      data-coverage-pinned
    >
      <div
        ref={stage}
        className="cov-stage"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Layer 0 — Ambient Glow & Concentric Radar Target Rings */}
        <div className="cov-ambient" aria-hidden="true">
          <div className="cov-glow" />
          <div className="cov-rings" key={`rings-${active}`}>
            <div className="cov-ring cov-ring-outer" />
            <div className="cov-ring cov-ring-mid" />
            <div className="cov-ring cov-ring-inner" />
          </div>
        </div>

        {/* Layer 1 — Giant Background Kinetic Watermark */}
        <div className="cov-watermark" aria-hidden="true">
          <span className="cov-watermark-text" key={nameKey}>
            {displayName.toUpperCase()}
          </span>
        </div>

        {/* Layer 2 — Pinned Section Header */}
        <header className={`cov-header${hovered ? " cov-header-recede" : ""}`}>
          <div className="cov-header-inner container-page">
            <span className="cov-eyebrow">[05 // On-ground presence]</span>
            <h2 id="coverage-title" className="cov-display">
              WHERE WE WORK.
            </h2>
            <p className="cov-subtitle">
              Cities and regions · Locations and formats are confirmed for each brief.
            </p>
          </div>
        </header>

        {/* Layer 3 — 3D Perspective Coverflow Card Stage */}
        <div className="cov-cards-stage">
          <div className="cov-stage-meta container-page">
            <span>YOUR NEXT PLACEMENT</span>
            <span>INDIA ↗</span>
          </div>

          <div className="cov-cards-perspective">
            {coverage.locations.map((location, i) => {
              const isActive = i === active;
              const badge = classificationBadge(location);

              return (
                <button
                  key={location.name}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  type="button"
                  className={`cov-card cov-card-slot-${i < active ? "left" : i > active ? "right" : "center"}${
                    isActive ? " cov-card-active" : ""
                  }${hovered && isActive ? " cov-card-focused" : ""}`}
                  onClick={() => {
                    if (!isActive) scrollToCard(i);
                  }}
                  onPointerEnter={isActive ? handlePointerEnter : undefined}
                  onPointerMove={isActive ? handlePointerMove : undefined}
                  onPointerLeave={isActive ? handlePointerLeave : undefined}
                  onFocus={() => {
                    if (isActive) {
                      setHovered(true);
                      hoveredRef.current = true;
                      renderCardsAtPos(currentPosRef.current, true);
                    }
                  }}
                  onBlur={() => {
                    setHovered(false);
                    hoveredRef.current = false;
                    renderCardsAtPos(currentPosRef.current, false);
                  }}
                  aria-label={`${location.name} — ${isActive ? "Active location" : "Switch to location"}`}
                  aria-current={isActive ? "true" : undefined}
                  tabIndex={isActive ? 0 : -1}
                >
                  <div className="cov-card-bezel">
                    {/* Top Row */}
                    <div className="cov-card-meta-top">
                      <div className="cov-card-meta-left">
                        <span className="cov-card-code">[0{i + 1} / IN]</span>
                        {isActive && <span className="cov-card-bezel-tag">YOUR NEXT PLACEMENT</span>}
                      </div>
                      <div className="cov-card-meta-right">
                        <span className="cov-card-badge">
                          {isActive ? `${badge} · INDIA ↗` : badge}
                        </span>
                      </div>
                    </div>

                    {/* Viewport: Active Center face vs Flanking Summary face */}
                    {isActive ? (
                      /* ACTIVE CENTER CARD: Full Interactive Placement Face */
                      <div className="cov-card-viewport cov-card-viewport-active">
                        {/* Recessed inner window */}
                        <div className="cov-inner-showcase">
                          {/* Animated concentric radar rings & target crosshair */}
                          <div className="cov-radar-box" aria-hidden="true">
                            <div className="cov-radar-ring-out" />
                            <div className="cov-radar-ring-mid" />
                            <div className="cov-radar-ring-in" />
                            <span className="cov-radar-plus">+</span>
                          </div>

                          <div className="cov-active-status">
                            <span className="cov-status-pill">ON-GROUND PRESENCE · ACTIVE</span>
                          </div>

                          <div className="cov-location-info">
                            <span className="cov-explore-eyebrow">EXPLORE A CAMPAIGN IN</span>
                            <h3 className="cov-city-heading">{location.name.toUpperCase()}</h3>
                            <span className="cov-state-label">{subLabel(location)}</span>
                          </div>
                        </div>

                        {/* Card Footer with DISCUSS AVAILABILITY CTA & Counter */}
                        <div className="cov-card-footer">
                          <a
                            href="#contact"
                            className="cov-card-cta"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span>DISCUSS AVAILABILITY</span>
                            <span aria-hidden="true">↗</span>
                          </a>
                          <div className="cov-active-counter">
                            <span className="cov-counter-curr">
                              {String(active + 1).padStart(2, "0")}
                            </span>
                            <span className="cov-counter-slash">/</span>
                            <span className="cov-counter-total">
                              {String(TOTAL).padStart(2, "0")}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* FLANKING CARD: Summary Face */
                      <div className="cov-card-viewport cov-card-viewport-flank">
                        {/* Center focal area with watermark target */}
                        <div className="cov-flank-radar-watermark" aria-hidden="true" />
                        <div className="cov-flank-identity">
                          <h3 className="cov-flank-city">{location.name.toUpperCase()}</h3>
                          <span className="cov-flank-state">{subLabel(location)}</span>
                        </div>
                        <div className="cov-flank-footer">
                          <span className="cov-flank-arrow" aria-hidden="true">
                            ↗
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Layer 4 — HUD, Segmented Progress Bar & Navigation Controls */}
        <div className="cov-hud container-page">
          {/* Segmented progress bar */}
          <div className="cov-progress" role="tablist" aria-label="Coverage locations">
            {coverage.locations.map((location, i) => (
              <button
                key={location.name}
                role="tab"
                type="button"
                className={`cov-progress-seg${i === active ? " cov-progress-active" : ""}`}
                aria-selected={i === active}
                aria-label={`Jump to ${location.name}`}
                onClick={() => scrollToCard(i)}
              />
            ))}
          </div>

          <div className="cov-nav-row">
            {/* Prev / Next Circular Controls */}
            <div className="cov-nav-buttons">
              <button
                type="button"
                className="cov-nav-btn"
                aria-label="Previous location"
                onClick={prev}
                disabled={active === 0}
              >
                ‹
              </button>
              <button
                type="button"
                className="cov-nav-btn"
                aria-label="Next location"
                onClick={next}
                disabled={active === TOTAL - 1}
              >
                ›
              </button>
            </div>
            <p className="cov-footnote">{coverage.pendingNote}</p>
          </div>
        </div>

        {/* Right-Edge Vertical Scroll Progress Pill */}
        <div className="cov-scroll-pill" aria-hidden="true">
          <div className="cov-scroll-pill-track">
            <div
              ref={pillThumbRef}
              className="cov-scroll-pill-thumb"
              style={{ top: `${(active / (TOTAL - 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
