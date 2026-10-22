import { useCallback, useRef, useState, type CSSProperties } from "react";
import { coverage } from "@/content/site";
import { gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/motion";
import { coverageDistance, coverageFrame, coveragePose } from "@/lib/coverage-motion.mjs";

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
  const titles = useRef<(HTMLSpanElement | null)[]>([]);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const navigate = useRef<(index: number, focusCard?: boolean) => void>(() => {});
  const keyboardTarget = useRef<number | null>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const isStepAnimating = useRef(false);
  const lastStepTime = useRef(0);
  const lastWheelTime = useRef(0);
  const lastWheelDelta = useRef(0);
  const lastEnterTime = useRef(0);
  const skipToTeam = useRef<() => void>(() => {});

  const renderPosition = useCallback((progress: number) => {
    const frame = coverageFrame(progress);
    const position = frame.position;
    titles.current.forEach((title, index) => {
      if (!title) return;
      const opacity = index === frame.title ? frame.opacity : 0;
      title.style.opacity = String(opacity);
      title.style.transform = `translateY(${(1 - opacity) * 18}px)`;
    });
    cards.current.forEach((card, index) => {
      if (!card) return;
      const distance = coverageDistance(index, position, TOTAL);
      const pose = coveragePose(distance);
      card.style.transform = `translateX(${pose.x}%) translateZ(${pose.z}px) rotateY(${pose.rotation}deg) scale(${pose.scale})`;
      card.style.opacity = String(pose.opacity);
      card.style.visibility = pose.opacity > .02 ? "visible" : "hidden";
      card.style.zIndex = String(20 - Math.round(Math.abs(distance) * 4));
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
      const isTallDesktop = desktop && !!context.conditions?.tall;
      const position = { value: activeRef.current };
      let stepTween: gsap.core.Tween | undefined;
      let triggerInstance: ScrollTrigger | undefined;

      renderPosition(position.value);

      const START_BUFFER = 0.12;

      if (isTallDesktop) {
        position.value = 0;
        triggerInstance = ScrollTrigger.create({
          trigger: section,
          start: () => "top top+=80",
          end: () => `+=${Math.round(window.innerHeight * 2.4)}`,
          pin: scene,
          pinSpacing: true,
          anticipatePin: 0,
          invalidateOnRefresh: true,
          onEnter: () => {
            lastEnterTime.current = Date.now();
            if (!isStepAnimating.current) {
              activeRef.current = 0;
              setActive(0);
              position.value = 0;
              renderPosition(0);
            }
          },
          onEnterBack: () => {
            // When coming up, keep resting at city 0 without playing reverse animation
            activeRef.current = 0;
            setActive(0);
            position.value = 0;
            renderPosition(0);
          },
          onLeave: () => {
            activeRef.current = TOTAL - 1;
            setActive(TOTAL - 1);
            position.value = TOTAL - 1;
            renderPosition(TOTAL - 1);
          },
          onLeaveBack: () => {
            activeRef.current = 0;
            setActive(0);
            position.value = 0;
            renderPosition(0);
          },
          onRefresh: self => {
            if (self.isActive && !isStepAnimating.current) {
              renderPosition(activeRef.current);
            }
          },
          onUpdate: self => {
            // Only update on drag when scrolling downward
            if (!stepTween && !isStepAnimating.current && self.isActive && self.direction > 0) {
              if (self.progress <= START_BUFFER) {
                if (activeRef.current !== 0) {
                  position.value = 0;
                  renderPosition(0);
                }
                return;
              }
              const normalized = (self.progress - START_BUFFER) / (1 - START_BUFFER);
              const nearest = Math.max(0, Math.min(TOTAL - 1, Math.round(normalized * (TOTAL - 1))));
              if (nearest !== activeRef.current) {
                position.value = nearest;
                renderPosition(nearest);
              }
            }
          },
        });
      }

      navigate.current = (index, focusCard = false) => {
        const target = Math.max(0, Math.min(TOTAL - 1, index));
        keyboardTarget.current = focusCard ? target : null;
        stepTween?.kill();

        const trigger = triggerInstance;
        const targetProgress = target === 0
          ? 0
          : START_BUFFER + (target / (TOTAL - 1)) * (1 - START_BUFFER);
        const targetScroll = trigger
          ? trigger.start + targetProgress * (trigger.end - trigger.start)
          : window.scrollY;

        if (motion) {
          isStepAnimating.current = true;
          const scrollObj = { y: window.scrollY, pos: position.value };
          stepTween = gsap.to(scrollObj, {
            y: targetScroll,
            pos: target,
            duration: 0.55,
            ease: "power2.out",
            onUpdate: () => {
              position.value = scrollObj.pos;
              renderPosition(scrollObj.pos);
              if (trigger && isTallDesktop) {
                window.scrollTo({ top: scrollObj.y, behavior: "instant" });
              }
            },
            onComplete: () => {
              position.value = target;
              renderPosition(target);
              if (trigger && isTallDesktop) {
                window.scrollTo({ top: targetScroll, behavior: "instant" });
              }
              isStepAnimating.current = false;
              stepTween = undefined;
            },
          });
        } else {
          position.value = target;
          renderPosition(target);
          if (trigger && isTallDesktop) {
            window.scrollTo({ top: targetScroll, behavior: "instant" });
          }
          isStepAnimating.current = false;
        }
      };

      const onWheel = (event: WheelEvent) => {
        if (!isTallDesktop || !triggerInstance) return;

        const delta = event.deltaY;
        if (Math.abs(delta) < 4 || Math.abs(delta) <= Math.abs(event.deltaX)) return;

        const scrollY = window.scrollY;
        const trigger = triggerInstance;

        // The user must completely reach the section and cover the screen first before wheel interception starts
        if (scrollY < trigger.start - 1) return;
        if (scrollY > trigger.end + 8) return;

        const direction = delta > 0 ? 1 : -1;

        // 1. SCROLLING UP:
        // When coming up, animation does not play in reverse and scrolling proceeds directly upwards like a static website
        if (direction < 0) {
          cancelTravel();
          if (activeRef.current !== 0) {
            activeRef.current = 0;
            setActive(0);
            position.value = 0;
            renderPosition(0);
            if (scrollY > trigger.start + 4) {
              window.scrollTo({ top: trigger.start, behavior: "auto" });
            }
          }
          return;
        }

        // 2. SCROLLING DOWN:
        const current = activeRef.current;

        // Allow natural exit scrolling down when at the last city (Gujarat)
        if (current >= TOTAL - 1) {
          return;
        }

        // Intercept scroll within section: prevent default so fast flick CANNOT skip anything
        event.preventDefault();

        const now = Date.now();
        const timeSinceLastWheel = now - lastWheelTime.current;
        const timeSinceLastStep = now - lastStepTime.current;
        const timeSinceEnter = now - lastEnterTime.current;
        lastWheelTime.current = now;

        const reversedDirection = Math.sign(delta) !== Math.sign(lastWheelDelta.current);
        lastWheelDelta.current = delta;

        // When resting at city 0 (Mumbai), ensure user has dwelled after entering before stepping to Pune
        if (current === 0 && timeSinceEnter < 450) {
          return;
        }

        // One scroll gesture advances to the next city only:
        // Trailing inertia within the same flick is debounced and ignored.
        const canStep = !isStepAnimating.current &&
          timeSinceLastStep > 460 &&
          (reversedDirection || timeSinceLastWheel > 140 || timeSinceLastStep > 850);

        if (canStep) {
          const nextIndex = current + 1;
          if (nextIndex < TOTAL) {
            lastStepTime.current = now;
            navigate.current(nextIndex);
          }
        }
      };

      window.addEventListener("wheel", onWheel, { passive: false });

      const cancelTravel = () => {
        stepTween?.kill();
        stepTween = undefined;
        isStepAnimating.current = false;
        keyboardTarget.current = null;
      };

      skipToTeam.current = () => {
        cancelTravel();
        const trigger = triggerInstance;
        if (trigger && isTallDesktop) {
          window.scrollTo({ top: trigger.end + 24, behavior: "smooth" });
        } else {
          document.getElementById("team")?.scrollIntoView({ behavior: "smooth" });
        }
      };

      const keyTravel = (event: KeyboardEvent) => {
        if (["PageDown", "PageUp", "Home", "End", " "].includes(event.key)) cancelTravel();
      };
      window.addEventListener("keydown", keyTravel);

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

      let refreshFrame = 0;
      const resize = new ResizeObserver(() => {
        cancelAnimationFrame(refreshFrame);
        refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
      });
      resize.observe(section);
      resize.observe(scene);
      for (let sibling = section.previousElementSibling; sibling; sibling = sibling.previousElementSibling) {
        resize.observe(sibling);
      }

      return () => {
        cancelAnimationFrame(refreshFrame);
        resize.disconnect();
        cancelTravel();
        triggerInstance?.kill();
        gsap.killTweensOf(position);
        scene.removeEventListener("pointermove", move);
        scene.removeEventListener("pointerleave", reset);
        window.removeEventListener("wheel", onWheel);
        window.removeEventListener("keydown", keyTravel);
        observer.disconnect();
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
      <a href="#team" className="cov-skip-btn" onClick={event => { event.preventDefault(); skipToTeam.current(); }} aria-label="Skip where we work section">
        SKIP <span>↓</span>
      </a>
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
        <div className="cov-watermark" aria-hidden="true">
          {coverage.locations.map((location, index) => <span key={location.name} ref={element => { titles.current[index] = element; }} style={{ opacity: index === 0 ? 1 : 0 }}>{location.name}</span>)}
        </div>
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
