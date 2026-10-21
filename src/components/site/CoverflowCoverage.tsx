import { useCallback, useRef, useState, type CSSProperties } from "react";
import { coverage } from "@/content/site";
import { gsap, MQ, useGSAP } from "@/lib/motion";
import { coveragePose } from "@/lib/coverage-motion.mjs";

const TOTAL = coverage.locations.length;

function CityDiorama({ city }: { city: number }) {
  return <span className="cov-city-art" aria-hidden="true">
    <span className="cov-city-orbit" />
    <span className="cov-city-board">
      <span className="cov-city-road"><i /><i /></span>
      {Array.from({ length: 7 }, (_, i) => <span key={i} className={`cov-tower cov-tower-${i}`} style={{ "--tower-h": `${48 + ((i * 31 + city * 17) % 95)}px`, "--tower-delay": `${i * 40}ms` } as CSSProperties}>
        <span className="cov-tower-top" /><span className="cov-tower-front" /><span className="cov-tower-side" />
      </span>)}
      <span className="cov-city-billboard"><span>↗</span></span>
      <span className="cov-city-tree cov-city-tree-one" /><span className="cov-city-tree cov-city-tree-two" />
    </span>
  </span>;
}

export function CoverflowCoverage() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const navigate = useRef<(index: number, focusCard?: boolean) => void>(() => {});
  const keyboardTarget = useRef<number | null>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  const renderPosition = useCallback((position: number) => {
    cards.current.forEach((card, index) => {
      if (!card) return;
      const pose = coveragePose(index - position);
      card.style.transform = `translateX(${pose.x}%) translateZ(${pose.z}px) rotateY(${pose.rotation}deg) scale(${pose.scale})`;
      card.style.opacity = String(pose.opacity);
      card.style.visibility = pose.opacity > .02 ? "visible" : "hidden";
      card.style.zIndex = String(20 - Math.round(Math.abs(index - position) * 4));
    });
    const nearest = Math.max(0, Math.min(TOTAL - 1, Math.round(position)));
    if (nearest !== activeRef.current) { activeRef.current = nearest; setActive(nearest); }
    if (keyboardTarget.current === nearest) {
      cards.current[nearest]?.focus({ preventScroll: true });
      keyboardTarget.current = null;
    }
  }, []);

  useGSAP(() => {
    const section = root.current!;
    const scene = stage.current!;
    const mm = gsap.matchMedia();
    mm.add({ motion: MQ.motion, desktop: MQ.desktop, tall: "(min-height: 720px)", fine: MQ.finePointer, reduce: MQ.reduce }, context => {
      const motion = !!context.conditions?.motion;
      const desktop = !!context.conditions?.desktop;
      const position = { value: activeRef.current };
      let travel: gsap.core.Tween | undefined;
      let scrollTween: gsap.core.Tween | undefined;
      renderPosition(position.value);
      if (motion && desktop && context.conditions?.tall) {
        position.value = 0;
        travel = gsap.to(position, {
          value: TOTAL - 1, ease: "none",
          onUpdate: () => renderPosition(position.value),
          scrollTrigger: {
            trigger: section, start: "top top+=80", end: () => `+=${window.innerHeight * 2.1}`,
            pin: scene, scrub: .55, invalidateOnRefresh: true,
          },
        });
      }
      const cancelTravel = () => { scrollTween?.kill(); scrollTween = undefined; keyboardTarget.current = null; };
      const keyTravel = (event: KeyboardEvent) => {
        if (["PageDown", "PageUp", "Home", "End", " "].includes(event.key)) cancelTravel();
      };
      window.addEventListener("wheel", cancelTravel, { passive: true });
      window.addEventListener("touchstart", cancelTravel, { passive: true });
      window.addEventListener("keydown", keyTravel);
      navigate.current = (index, focusCard = false) => {
        const target = Math.max(0, Math.min(TOTAL - 1, index));
        cancelTravel();
        keyboardTarget.current = focusCard ? target : null;
        const trigger = travel?.scrollTrigger;
        if (trigger) {
          const scroll = { value: window.scrollY };
          scrollTween = gsap.to(scroll, {
            value: trigger.start + target / (TOTAL - 1) * (trigger.end - trigger.start),
            duration: .65, ease: "power3.inOut", onUpdate: () => window.scrollTo({ top: scroll.value, behavior: "instant" }),
          });
        } else if (motion) {
          gsap.killTweensOf(position);
          gsap.to(position, { value: target, duration: .65, ease: "power3.inOut", onUpdate: () => renderPosition(position.value) });
        } else { position.value = target; renderPosition(target); }
      };

      const shells = [...section.querySelectorAll<HTMLElement>(".cov-card-shell")];
      const tiltX = shells.map(shell => gsap.quickTo(shell, "rotationX", { duration: .45, ease: "power3.out" }));
      const tiltY = shells.map(shell => gsap.quickTo(shell, "rotationY", { duration: .45, ease: "power3.out" }));
      const reset = () => { tiltX.forEach(set => set(0)); tiltY.forEach(set => set(0)); };
      const move = (event: PointerEvent) => {
        if (!motion || !context.conditions?.fine || event.pointerType !== "mouse") return;
        const index = activeRef.current;
        const rect = cards.current[index]!.getBoundingClientRect();
        tiltX[index](gsap.utils.clamp(-3, 3, -(event.clientY - rect.top - rect.height / 2) / rect.height * 6));
        tiltY[index](gsap.utils.clamp(-4, 4, (event.clientX - rect.left - rect.width / 2) / rect.width * 8));
      };
      scene.addEventListener("pointermove", move);
      scene.addEventListener("pointerleave", reset);
      const observer = new IntersectionObserver(([entry]) => {
        scene.dataset.visible = String(entry.isIntersecting);
      });
      observer.observe(scene);
      return () => {
        cancelTravel(); gsap.killTweensOf(position);
        scene.removeEventListener("pointermove", move); scene.removeEventListener("pointerleave", reset);
        window.removeEventListener("wheel", cancelTravel); window.removeEventListener("touchstart", cancelTravel);
        window.removeEventListener("keydown", keyTravel); observer.disconnect();
        navigate.current = () => {};
      };
    });
    return () => mm.revert();
  }, { scope: root, dependencies: [renderPosition] });

  return <section id="coverage" ref={root} className="cov-scroll-wrapper" aria-labelledby="coverage-title">
    <div ref={stage} className="cov-stage" onKeyDown={event => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        const fromCard = !!(event.target as HTMLElement).closest(".cov-card");
        navigate.current((keyboardTarget.current ?? activeRef.current) + (event.key === "ArrowRight" ? 1 : -1), fromCard);
      }
    }}>
      <header className="cov-header container-page">
        <div><p className="cov-eyebrow">{coverage.label}</p><h2 id="coverage-title">{coverage.heading}</h2></div>
        <p className="cov-intro">{coverage.intro}</p>
      </header>
      <div className="cov-scene" onPointerDown={event => {
        if (event.pointerType === "touch") pointerStart.current = { x: event.clientX, y: event.clientY };
      }} onPointerCancel={() => { pointerStart.current = null; }} onPointerUp={event => {
        const start = pointerStart.current; pointerStart.current = null;
        if (!start) return;
        const x = event.clientX - start.x, y = event.clientY - start.y;
        if (Math.abs(x) > 45 && Math.abs(x) > Math.abs(y) * 1.4) navigate.current(activeRef.current + (x < 0 ? 1 : -1));
      }}>
        <div className="cov-horizon" aria-hidden="true" />
        <div className="cov-watermark" aria-hidden="true">{coverage.locations[active].name}</div>
        <div className="cov-cards-perspective">
          {coverage.locations.map((location, index) => <button key={location.name} type="button"
            ref={element => { cards.current[index] = element; }}
            className={`cov-card${index === active ? " cov-card-active" : ""}`}
            style={{ visibility: index === 0 ? "visible" : "hidden" }}
            tabIndex={index === active ? 0 : -1} aria-label={`${location.name}, ${location.kind}`}
            aria-pressed={index === active} onClick={() => navigate.current(index)}>
            <span className="cov-card-shell">
              <span className="cov-card-copy">
                <span className="cov-kind">{location.kind}</span>
                <span className="cov-explore">{coverage.explore}</span>
                <strong className="cov-city-name">{location.name}</strong>
                <span className="cov-state">{"state" in location ? location.state : coverage.label}</span>
                <span className="cov-card-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}<span> / {String(TOTAL).padStart(2, "0")}</span></span>
              </span>
              <span className="cov-art-panel"><CityDiorama city={index} /><span className="cov-visual-note">{coverage.visualNote}</span></span>
            </span>
          </button>)}
        </div>
        <p className="cov-scroll-hint">{coverage.interactionHint}</p>
      </div>
      <footer className="cov-hud container-page">
        <nav className="cov-locations" aria-label={coverage.label}>
          {coverage.locations.map((location, index) => <button key={location.name} type="button" aria-current={active === index ? "true" : undefined} onClick={() => navigate.current(index)}>{location.name}</button>)}
        </nav>
        <div className="cov-bottom-row">
          <div className="cov-arrows"><button type="button" aria-label={coverage.previous} disabled={active === 0} onClick={() => navigate.current(activeRef.current - 1)}>←</button><button type="button" aria-label={coverage.next} disabled={active === TOTAL - 1} onClick={() => navigate.current(activeRef.current + 1)}>→</button></div>
          <p className="cov-footnote">{coverage.pendingNote}</p>
          <a className="cov-cta" href="#contact">{coverage.cta}<span aria-hidden="true">↗</span></a>
        </div>
      </footer>
    </div>
  </section>;
}
