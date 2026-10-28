import { useCallback, useRef, useState } from "react";
import { serviceShowcase as showcase } from "@/content/site";
import { gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/motion";
import { coverageDistance, coverageFrame, coveragePose } from "@/lib/coverage-motion.mjs";
import { exitReversePin, observeScrollDirection, scrollPinTo, createWheelStep } from "@/lib/reverse-pin.mjs";

const TOTAL = showcase.items.length;
const categories = [...new Set(showcase.items.map(service => service.category))];
const asset = (path: string) => path.startsWith('/') ? `${import.meta.env.BASE_URL}${path.slice(1)}` : path;

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
      const isTallDesktop = motion && desktop && !!context.conditions?.tall;
      const position = { value: activeRef.current };
      let stepTween: gsap.core.Tween | undefined;
      let triggerInstance: ScrollTrigger | undefined;
      let refreshing = false;
      const scrollDirection = observeScrollDirection();
      const wheelStep = createWheelStep(TOTAL);

      const cancelTravel = () => {
        stepTween?.kill();
        stepTween = undefined;
        isStepAnimating.current = false;
        keyboardTarget.current = null;
      };
      const resetToStart = () => {
        cancelTravel();
        position.value = 0;
        renderPosition(0);
        lastEnterTime.current = 0;
      };
      const leaveBackwards = (self: ScrollTrigger) => {
        if (!refreshing && !isStepAnimating.current && exitReversePin(self, resetToStart, scrollDirection.direction())) scrollDirection.reset();
      };

      renderPosition(position.value);

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
          onEnterBack: leaveBackwards,
          onLeave: () => {
            activeRef.current = TOTAL - 1;
            setActive(TOTAL - 1);
            position.value = TOTAL - 1;
            renderPosition(TOTAL - 1);
          },
          onLeaveBack: () => { if (!isStepAnimating.current && scrollDirection.direction() === -1) resetToStart(); },
          onRefreshInit: () => { refreshing = true; },
          onRefresh: self => {
            refreshing = false;
            if (self.isActive && !isStepAnimating.current) {
              renderPosition(activeRef.current);
            }
          },
          onUpdate: self => {
            if (self.direction < 0) { leaveBackwards(self); return; }
            // Only update on drag when scrolling downward
            if (!stepTween && !isStepAnimating.current && self.isActive && self.direction > 0) {
              const nearest = Math.max(0, Math.min(TOTAL - 1, Math.round(self.progress * (TOTAL - 1))));
              if (nearest !== activeRef.current) {
                position.value = nearest;
                renderPosition(nearest);
              }
            }
          },
        });
      }

      navigate.current = (index, focusCard = false) => {
        scrollDirection.reset();
        const target = Math.max(0, Math.min(TOTAL - 1, index));
        keyboardTarget.current = focusCard ? target : null;
        stepTween?.kill();

        const trigger = triggerInstance;
        const targetProgress = target / (TOTAL - 1);
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
                scrollPinTo(scrollObj.y);
                ScrollTrigger.update();
              }
            },
            onComplete: () => {
              position.value = target;
              renderPosition(target);
              if (trigger && isTallDesktop) {
                scrollPinTo(targetScroll);
                ScrollTrigger.update();
              }
              isStepAnimating.current = false;
              stepTween = undefined;
            },
          });
        } else {
          position.value = target;
          renderPosition(target);
          if (trigger && isTallDesktop) {
            isStepAnimating.current = true;
            scrollPinTo(targetScroll);
            ScrollTrigger.update();
          }
          isStepAnimating.current = false;
        }
      };

      const onWheel = (event: WheelEvent) => {
        if (event.ctrlKey || event.defaultPrevented || document.body.style.overflow === "hidden") return;
        if (!isTallDesktop || !triggerInstance) return;

        const delta = event.deltaY;
        if (Math.abs(delta) <= Math.abs(event.deltaX)) return;
        const step = wheelStep(activeRef.current, isStepAnimating.current, delta, event.timeStamp);

        const scrollY = window.scrollY;
        const trigger = triggerInstance;

        // The user must completely reach the section and cover the screen first before wheel interception starts
        if (scrollY < trigger.start - 1) return;
        if (scrollY > trigger.end + 8) return;

        if (step === 'back') {
          cancelTravel();
          leaveBackwards(trigger);
          return;
        }

        if (step === 'leave') return;
        event.preventDefault();
        if (activeRef.current === 0 && Date.now() - lastEnterTime.current < 450) return;
        if (typeof step === 'number') navigate.current(step);
      };

      window.addEventListener("wheel", onWheel, { passive: false });

      skipToTeam.current = () => {
        scrollDirection.reset();
        cancelTravel();
        const trigger = triggerInstance;
        if (trigger && isTallDesktop) {
          window.scrollTo({ top: trigger.end + 24, behavior: "smooth" });
        } else {
          document.getElementById("team")?.scrollIntoView({ behavior: "smooth" });
        }
      };

      const keyTravel = (event: KeyboardEvent) => {
        if (["ArrowUp", "ArrowDown", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) cancelTravel();
      };
      window.addEventListener("keydown", keyTravel);
      window.addEventListener("pointerdown", cancelTravel);

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
        scrollDirection.destroy();
        cancelAnimationFrame(refreshFrame);
        resize.disconnect();
        cancelTravel();
        triggerInstance?.kill();
        gsap.killTweensOf(position);
        scene.removeEventListener("pointermove", move);
        scene.removeEventListener("pointerleave", reset);
        window.removeEventListener("wheel", onWheel);
        window.removeEventListener("keydown", keyTravel);
        window.removeEventListener("pointerdown", cancelTravel);
        observer.disconnect();
        navigate.current = () => {};
      };
    });
    return () => mm.revert();
  }, { scope: root, dependencies: [renderPosition] });

  return <section id="coverage" ref={root} className="cov-scroll-wrapper" aria-labelledby="coverage-title">
    <div ref={stage} className="cov-stage" onKeyDown={event => {
      if (!(event.target as HTMLElement).closest('select') && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
        event.preventDefault();
        const fromCard = !!(event.target as HTMLElement).closest(".cov-card");
        navigate.current((keyboardTarget.current ?? activeRef.current) + (event.key === "ArrowRight" ? 1 : -1), fromCard);
      }
    }}>
      <a href="#team" className="cov-skip-btn" onClick={event => { event.preventDefault(); skipToTeam.current(); }} aria-label={showcase.skip}>
        SKIP <span>↓</span>
      </a>
      <header className="cov-header container-page">
        <div><p className="cov-eyebrow">{showcase.label}</p><h2 id="coverage-title">{showcase.heading}</h2></div>
        <p className="cov-intro">{showcase.intro}</p>
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
          {showcase.items.map((service, index) => <span key={service.id} ref={element => { titles.current[index] = element; }} style={{ opacity: index === 0 ? 1 : 0 }}>{service.title}</span>)}
        </div>
        <div className="cov-cards-perspective">
          {showcase.items.map((service, index) => {
            const execution = service.execution;
            const showPhoto = execution && Math.abs(coverageDistance(index, active, TOTAL)) <= 1;
            return <button key={service.id} type="button"
            ref={element => { cards.current[index] = element; }}
            className={`cov-card${index === active ? " cov-card-active" : ""}`}
            style={{ visibility: index === 0 ? "visible" : "hidden" }}
            tabIndex={index === active ? 0 : -1} aria-label={`${service.title}, ${service.category}`}
            aria-describedby={`execution-info-${service.id}`}
            aria-pressed={index === active} onClick={() => navigate.current(index)}>
            <span className="cov-card-shell">
              <span className="cov-card-copy">
                <span className="cov-kind">{service.category}</span>
                <strong className="cov-service-name">{service.title}</strong>
                <span className="cov-card-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}<span> / {String(TOTAL).padStart(2, "0")}</span></span>
              </span>
              <span className="cov-art-panel">
                {showPhoto && <img src={asset(execution.src)} alt={execution.alt} width={execution.width} height={execution.height}
                  srcSet={execution.thumbnail && execution.thumbnailWidth ? `${asset(execution.thumbnail)} ${execution.thumbnailWidth}w, ${asset(execution.src)} ${execution.width}w` : undefined}
                  sizes="(max-width: 767px) 82vw, (max-width: 1023px) 70vw, 680px"
                  loading={index === active ? 'eager' : 'lazy'} decoding="async"
                  onError={event => { event.currentTarget.hidden = true; event.currentTarget.nextElementSibling?.removeAttribute('hidden'); }} />}
                <span className="cov-photo-placeholder" hidden={!!showPhoto} role="status">
                  <span aria-hidden="true">↗</span>
                  <span>{execution ? (showPhoto ? showcase.unavailableImage : showcase.executionLabel) : showcase.pendingImage}</span>
                </span>
              </span>
              <span id={`execution-info-${service.id}`} className={execution ? 'cov-execution-caption' : 'sr-only'}>
                {execution ? <><span className="sr-only">{execution.alt}</span><strong>{execution.client || showcase.executionLabel}</strong>{execution.location && <span>{execution.location}</span>}{execution.description && <span>{execution.description}</span>}</> : showcase.pendingImage}
              </span>
            </span>
          </button>; })}
        </div>
        <p className="cov-scroll-hint">{showcase.interactionHint}</p>
      </div>
      <footer className="cov-hud container-page">
        <label className="cov-service-picker" htmlFor="execution-service"><span>{showcase.choose}</span>
          <select id="execution-service" value={active} onChange={event => navigate.current(Number(event.currentTarget.value))} onKeyDown={event => event.stopPropagation()}>
            {categories.map(category => <optgroup key={category} label={category}>{showcase.items.map((service, index) => service.category === category && <option key={service.id} value={index}>{service.title}</option>)}</optgroup>)}
          </select>
        </label>
        <p className="sr-only" aria-live="polite">{showcase.items[active].title}, {active + 1} / {TOTAL}</p>
        <div className="cov-bottom-row">
          <div className="cov-arrows"><button type="button" aria-label={showcase.previous} disabled={active === 0} onClick={() => navigate.current(activeRef.current - 1)}>←</button><button type="button" aria-label={showcase.next} disabled={active === TOTAL - 1} onClick={() => navigate.current(activeRef.current + 1)}>→</button></div>
          <p className="cov-footnote">{showcase.pendingNote}</p>
          <a className="cov-cta" href="#contact">{showcase.cta}<span aria-hidden="true">↗</span></a>
        </div>
      </footer>
    </div>
  </section>;
}
