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

/* ── 3D Card transform matrix based on relative offset d ── */
function getCardStyle(d: number, isFocused: boolean): React.CSSProperties {
  const abs = Math.abs(d);
  if (abs > 2) {
    return {
      transform: `translateX(${d < 0 ? -150 : 150}%) translateZ(-420px) rotateY(${d < 0 ? 48 : -48}deg) scale(0.6)`,
      opacity: 0,
      filter: "blur(4px)",
      zIndex: 1,
      pointerEvents: "none",
      visibility: "hidden",
    };
  }

  // Exact coordinates from user specification with fast interpolation:
  // -2: translateX(-115%), translateZ(-280px), rotateY(+42deg), scale(0.72), opacity: 0.35, blur(2px), z: 10
  // -1: translateX(-68%),  translateZ(-140px), rotateY(+34deg), scale(0.85), opacity: 0.82, blur(0.5px), z: 20
  //  0: translateX(0%),    translateZ(+40px),  rotateY(0deg),   scale(1.00), opacity: 1.00, blur(0px), z: 30
  // +1: translateX(+68%),  translateZ(-140px), rotateY(-34deg), scale(0.85), opacity: 0.82, blur(0.5px), z: 20
  // +2: translateX(+115%), translateZ(-280px), rotateY(-42deg), scale(0.72), opacity: 0.35, blur(2px), z: 10
  let tx = 0;
  let tz = 40;
  let ry = 0;
  let rx = 0;
  let s = 1.0;
  let o = 1.0;
  let bl = 0;
  let z = 30;

  if (d === -2) {
    tx = -115;
    tz = -280;
    ry = 42;
    s = 0.72;
    o = 0.35;
    bl = 2;
    z = 10;
  } else if (d === -1) {
    tx = -68;
    tz = -140;
    ry = 34;
    s = 0.85;
    o = 0.82;
    bl = 0.5;
    z = 20;
  } else if (d === 1) {
    tx = 68;
    tz = -140;
    ry = -34;
    s = 0.85;
    o = 0.82;
    bl = 0.5;
    z = 20;
  } else if (d === 2) {
    tx = 115;
    tz = -280;
    ry = -42;
    s = 0.72;
    o = 0.35;
    bl = 2;
    z = 10;
  }

  // Active center card in hover/focus state
  if (d === 0) {
    if (isFocused) {
      s = 1.14;
      tz = 110;
      // ry and rx are driven at 120fps by CSS variables --tilt-ry and --tilt-rx with 0ms React latency
    }
  } else if (isFocused) {
    // Flanking cards push back smoothly
    tx = d < 0 ? -95 : 95;
    tz = -240;
    o = 0.15;
    bl = 4;
  }

  return {
    transform: `translateX(${tx}%) translateZ(${tz}px) rotateY(${ry}deg) rotateX(${rx}deg) scale(${s})`,
    opacity: o,
    filter: bl > 0 ? `blur(${bl}px)` : "none",
    zIndex: z,
    pointerEvents: "auto",
    visibility: "visible",
  };
}

export function CoverflowCoverage() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);

  const prevName = useRef(coverage.locations[0].name);
  const [displayName, setDisplayName] = useState(coverage.locations[0].name);
  const [nameKey, setNameKey] = useState(0);

  // Touch tracking for mobile swipe
  const touchStartX = useRef<number | null>(null);

  // Sync giant background watermark text with transition animation
  useEffect(() => {
    const next = coverage.locations[active].name;
    if (next !== prevName.current) {
      prevName.current = next;
      setDisplayName(next);
      setNameKey((k) => k + 1);
    }
  }, [active]);

  // Navigate to an index and sync scroll position with snappy response
  const scrollToCard = useCallback(
    (index: number) => {
      const target = clamp(index, 0, TOTAL - 1);
      setActive(target);

      if (scrollTriggerRef.current) {
        const st = scrollTriggerRef.current;
        const progress = target / (TOTAL - 1);
        const scrollY = st.start + progress * (st.end - st.start);
        window.scrollTo({ top: scrollY, behavior: "smooth" });
      }
    },
    [],
  );

  const prev = useCallback(() => scrollToCard(active - 1), [active, scrollToCard]);
  const next = useCallback(() => scrollToCard(active + 1), [active, scrollToCard]);

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

  // Zero-latency dynamic cursor parallax via direct CSS variables
  const handlePointerEnter = (e: PointerEvent<HTMLButtonElement>) => {
    setHovered(true);
    e.currentTarget.style.setProperty("--tilt-active", "1");
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
    const el = e.currentTarget;
    el.style.removeProperty("--tilt-active");
    el.style.removeProperty("--tilt-rx");
    el.style.removeProperty("--tilt-ry");
  };

  // Mobile Touch handlers
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 30) {
      if (diff > 0) prev();
      else next();
    }
    touchStartX.current = null;
  };

  // GSAP scroll-driven scrubbing — calibrated for instant responsiveness and low latency
  useGSAP(
    () => {
      const section = root.current;
      const stageEl = stage.current;
      if (!section || !stageEl) return;

      const mm = gsap.matchMedia();
      mm.add({ motion: MQ.motion }, (ctx) => {
        if (!ctx.conditions?.motion) return;

        const st = ScrollTrigger.create({
          id: "coverage-trigger",
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          pin: stageEl,
          pinSpacing: false,
          scrub: 0.1, // Ultra-fast responsive scrubbing
          snap: {
            snapTo: 1 / (TOTAL - 1),
            duration: { min: 0.15, max: 0.28 },
            delay: 0.02,
            ease: "power2.out",
          },
          onUpdate: (self) => {
            const idx = Math.round(self.progress * (TOTAL - 1));
            setActive((prevIdx) => (prevIdx !== idx ? clamp(idx, 0, TOTAL - 1) : prevIdx));
          },
        });

        scrollTriggerRef.current = st;
      });

      return () => {
        scrollTriggerRef.current = null;
        mm.revert();
      };
    },
    { scope: root },
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
              const d = i - active;
              const isActive = d === 0;
              const badge = classificationBadge(location);
              const style = getCardStyle(d, hovered);

              return (
                <button
                  key={location.name}
                  type="button"
                  className={`cov-card cov-card-slot-${d < 0 ? "left" : d > 0 ? "right" : "center"}${
                    isActive ? " cov-card-active" : ""
                  }${hovered && isActive ? " cov-card-focused" : ""}`}
                  style={style}
                  onClick={() => {
                    if (!isActive) scrollToCard(i);
                  }}
                  onPointerEnter={isActive ? handlePointerEnter : undefined}
                  onPointerMove={isActive ? handlePointerMove : undefined}
                  onPointerLeave={isActive ? handlePointerLeave : undefined}
                  onFocus={() => {
                    if (isActive) setHovered(true);
                  }}
                  onBlur={() => setHovered(false)}
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
              className="cov-scroll-pill-thumb"
              style={{ top: `${(active / (TOTAL - 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
