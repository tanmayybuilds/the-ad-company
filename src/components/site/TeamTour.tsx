import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { team, type TeamPointerNode } from '@/content/site';
import { ScrollTrigger } from '@/lib/motion';
import { teamCamera, teamPath, teamProgress, teamScrollTop, teamWindow, teamFraming } from '@/lib/team-tour.mjs';
import { exitReversePin, observeScrollDirection, scrollPinTo, createWheelStep } from '@/lib/reverse-pin.mjs';
import './team-tour.css';

const positions = team.members.map(node => node.worldPos);

function StagePills({ label, active, onJump }: { label: string; active: number; onJump: (index: number) => void }) {
  return <nav className="team-pills" aria-label={label}>{team.members.map((node, index) =>
    <button type="button" key={node.id} aria-label={`${node.number}: ${node.stageTitle}`} aria-current={active === index ? 'step' : undefined} onClick={() => onJump(index)}>{node.number}</button>,
  )}</nav>;
}

function RoleCard({ node }: { node: TeamPointerNode }) {
  return <div className="team-role">
    <div className="team-role-bar"><span>{node.number}</span><strong>{node.stageTitle}</strong><span aria-hidden="true">↗</span></div>
    <div className="team-role-body">
      <h3>{node.memberName}</h3>
      <p className="team-role-badge">{node.roleTitle}</p>
      <p className="team-responsibility">{node.responsibility}</p>
      <p className="team-intro">{node.introCopy}</p>
    </div>
  </div>;
}

export function TeamTour() {
  const root = useRef<HTMLElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const nodes = useRef<(HTMLElement | null)[]>([]);
  const paths = useRef<(HTMLDivElement | null)[]>([]);
  const target = useRef(0);
  const current = useRef(0);
  const jump = useRef<(index: number) => void>(() => {});
  const [active, setActive] = useState(0);

  useEffect(() => {
    const section = root.current!, stage = world.current!;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let top = 0, distance = 0, raf = 0, lastTime = 0, visible = false, selected = -1;
    let firstVisible = -1;
    let lastScrollY = window.scrollY, travelling = false, travelStarted = 0;
    let touch: { x: number; y: number; handled: boolean } | null = null;
    const wheelStep = createWheelStep(positions.length);
    const scrollDirection = observeScrollDirection();
    const inside = () => distance > 0 && window.scrollY >= Math.floor(top) && window.scrollY <= Math.ceil(top + distance);
    const locked = () => document.body.style.overflow === 'hidden';

    function scrollTo(y: number) {
      scrollDirection.reset();
      lastScrollY = scrollPinTo(y);
    }

    function wake() {
      if (!raf && visible && !document.hidden && !reduced.matches) {
        section.dataset.moving = 'true';
        raf = requestAnimationFrame(render);
      }
    }

    function measure() {
      top = section.getBoundingClientRect().top + window.scrollY;
      distance = Math.max(0, section.offsetHeight - window.innerHeight);
      const framing = teamFraming(window.innerWidth, window.innerHeight);
      section.style.setProperty('--tour-scale', String(framing.scale));
      section.style.setProperty('--active-card-scale', String(framing.cardScale));
      section.style.setProperty('--active-portrait-scale', String(framing.portraitScale));
      lastScrollY = window.scrollY;
      if (!visible && !travelling && !reduced.matches) {
        current.current = target.current = Math.round(teamProgress(window.scrollY, top, distance, positions.length));
      }
    }

    function onScroll() {
      const previous = lastScrollY, y = window.scrollY;
      lastScrollY = y;
      if (reduced.matches || locked() || Math.abs(y - previous) <= 1) return;
      if (y < previous) {
        if (scrollDirection.direction() === -1 && !leaveBackwards() && y < top && previous >= top) resetToStart();
        return;
      }
      if (scrollDirection.direction() !== 1) return;
      if (!inside()) return;
      if (previous < top) {
        resetToStart();
        if (touch) touch.handled = true;
        scrollTo(top);
      } else if (!travelling) {
        jump.current(Math.min(positions.length - 1, target.current + 1));
      }
    }

    function render(time: number) {
      raf = 0;
      const dt = lastTime ? Math.min(48, time - lastTime) : 1000 / 60;
      lastTime = time;
      const damping = 1 - Math.pow(1 - .085, dt / (1000 / 60));
      current.current += (target.current - current.current) * damping;
      if (Math.abs(target.current - current.current) < .0001 || (travelling && time - travelStarted >= 900)) current.current = target.current;
      const camera = teamCamera(current.current, positions);
      // CSS Y points down: negative pitch looks down across a negative-Z floor.
      stage.style.transform = `translate3d(0,40px,0) rotateX(calc(-1 * var(--tour-pitch))) translate3d(${-camera.x}px,0,${-camera.z - 80}px)`;
      section.style.setProperty('--tour-progress', String(current.current / (positions.length - 1)));

      const viewRange = teamWindow(current.current, positions.length);
      if (viewRange.first !== firstVisible) {
        firstVisible = viewRange.first;
        nodes.current.forEach((element, index) => {
          if (!element) return;
          element.hidden = index < viewRange.first || index > viewRange.last;
          element.inert = element.hidden;
        });
        paths.current.forEach((element, index) => {
          if (element) element.hidden = index < viewRange.first || index >= viewRange.last;
        });
      }

      const next = Math.round(current.current);
      if (next !== selected) {
        selected = next;
        setActive(next);
      }
      for (let index = viewRange.first; index <= viewRange.last; index++) {
        const element = nodes.current[index];
        if (!element) continue;
        const delta = index - current.current;
        const opacity = delta < 0 ? Math.max(0, 1 + delta * 2) : Math.min(1, Math.max(0, (3 - delta) * .8));
        element.style.setProperty('--node-opacity', String(opacity));
        element.inert = opacity < .05;
      }
      for (let index = viewRange.first; index < viewRange.last; index++) {
        const element = paths.current[index];
        if (!element) continue;
        element.style.setProperty('--path-progress', String(Math.max(0, Math.min(1, current.current - index))));
      }
      if (current.current !== target.current) wake();
      else { lastTime = 0; travelling = false; section.dataset.moving = 'false'; }
    }

    function resetToStart() {
      cancelAnimationFrame(raf); raf = 0; lastTime = 0;
      travelling = false;
      current.current = target.current = 0;
      firstVisible = -1;
      render(0);
    }

    function leaveBackwards() {
      const exited = exitReversePin({ start: top, end: top + distance }, resetToStart, scrollDirection.direction());
      if (exited) { scrollDirection.reset(); lastScrollY = window.scrollY; }
      return exited;
    }

    jump.current = index => {
      if (reduced.matches) {
        setActive(index);
        nodes.current[index]?.scrollIntoView({ behavior: 'instant', block: 'center' });
      } else {
        target.current = index;
        travelling = current.current !== index;
        travelStarted = performance.now();
        scrollTo(teamScrollTop(index, top, distance, positions.length));
        wake();
      }
    };

    function onWheel(event: WheelEvent) {
      if (event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const step = wheelStep(target.current, travelling, event.deltaY, event.timeStamp);
      if (event.defaultPrevented || reduced.matches || locked() || !inside()) return;
      if (step === 'back') { leaveBackwards(); return; }
      if (step === 'leave') return;
      event.preventDefault();
      if (typeof step === 'number') jump.current(step);
    }

    function onKey(event: KeyboardEvent) {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || reduced.matches || locked() || !inside()) return;
      const element = event.target instanceof Element ? event.target : null;
      if (element?.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;
      if (event.key === ' ' && element?.closest('button, a')) return;
      if (event.key === 'ArrowUp' || event.key === 'PageUp' || (event.key === ' ' && event.shiftKey)) {
        event.preventDefault(); leaveBackwards();
      } else if (event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === ' ') {
        if (target.current === positions.length - 1 && !travelling && !event.repeat) return;
        event.preventDefault();
        if (!travelling && !event.repeat) jump.current(target.current + 1);
      }
    }

    function onTouchStart(event: TouchEvent) {
      touch = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY, handled: false } : null;
    }
    function onTouchMove(event: TouchEvent) {
      if (!touch || event.touches.length !== 1 || reduced.matches || locked() || !inside()) return;
      const delta = touch.y - event.touches[0].clientY;
      if (Math.abs(event.touches[0].clientX - touch.x) >= Math.abs(delta)) return;
      if (delta < -12) { touch.handled = true; leaveBackwards(); return; }
      if (delta <= 0) return;
      if (target.current === positions.length - 1 && !travelling && !touch.handled) return;
      if (event.cancelable) event.preventDefault();
      if (travelling || touch.handled) { touch.handled = true; return; }
      if (delta > 30) { touch.handled = true; jump.current(target.current + 1); }
    }
    function onTouchEnd() { touch = null; }

    function onTeamLink(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || reduced.matches || locked()) return;
      const link = event.target instanceof Element ? event.target.closest('a[href="#team"]') : null;
      if (!link) return;
      event.preventDefault();
      measure();
      resetToStart();
      scrollTo(top);
      if (window.location.hash !== '#team') window.history.pushState(null, '', '#team');
    }

    function visibility() {
      if (document.hidden || !visible || reduced.matches) {
        cancelAnimationFrame(raf); raf = 0; lastTime = 0;
        section.dataset.moving = 'false';
      } else wake();
    }
    function motionChange() {
      nodes.current.forEach(element => {
        if (!element) return;
        element.hidden = false;
        element.inert = false;
        element.style.removeProperty('--node-opacity');
      });
      firstVisible = -1;
      travelling = false;
      touch = null;
      current.current = target.current = Math.round(target.current);
      if (reduced.matches) stage.style.removeProperty('transform');
      measure(); visibility();
    }

    const observer = new IntersectionObserver(entries => {
      const nextVisible = entries[0].isIntersecting;
      if (nextVisible) measure();
      visible = nextVisible;
      visibility();
    });
    const resize = new ResizeObserver(measure);
    observer.observe(section);
    resize.observe(section);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);
    window.addEventListener('resize', measure);
    window.addEventListener('pageshow', measure);
    document.addEventListener('visibilitychange', visibility);
    document.addEventListener('click', onTeamLink);
    reduced.addEventListener('change', motionChange);
    ScrollTrigger.addEventListener('refresh', measure);
    measure();
    return () => {
      cancelAnimationFrame(raf);
      scrollDirection.destroy();
      observer.disconnect(); resize.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      window.removeEventListener('resize', measure);
      window.removeEventListener('pageshow', measure);
      document.removeEventListener('visibilitychange', visibility);
      document.removeEventListener('click', onTeamLink);
      reduced.removeEventListener('change', motionChange);
      ScrollTrigger.removeEventListener('refresh', measure);
      jump.current = () => {};
    };
  }, []);

  return <section id="team" ref={root} className="team-tour" aria-labelledby="team-title">
    <div className="team-viewport">
      <header className="team-heading container-page">
        <p className="team-eyebrow">{team.eyebrow}</p>
        <div className="team-heading-row"><h2 id="team-title">{team.heading[0]}<br />{team.heading[1]}</h2><span className="team-tour-mark" aria-hidden="true">↳<small>01—06<br />Campaign pathway</small></span></div>
        <div className="team-heading-controls"><p>{team.hint}</p><StagePills label="Jump to a campaign stage" active={active} onJump={index => jump.current(index)} /></div>
      </header>

      <div className="team-scene">
        <div className="team-floor" aria-hidden="true" />
        <div className="team-world-fit">
        <div className="team-world" ref={world}>
          {team.members.slice(0, -1).map((node, index) => {
            const path = teamPath(node.worldPos, positions[index + 1]);
            return <div className="team-path" key={`path-${node.id}`} aria-hidden="true" ref={element => { paths.current[index] = element; }} style={{ width: path.length, transform: `translate3d(${node.worldPos.x}px,0,${node.worldPos.z}px) rotateX(-90deg) rotateZ(${path.angle}deg)` }}>
              <span className="team-path-fill" /><span className="team-chevrons">{Array.from({ length: Math.ceil(path.length / 75) }, (_, arrow) => <b key={arrow}>❯</b>)}</span>
            </div>;
          })}
          {team.members.map((node, index) => <article key={node.id} id={node.id} ref={element => { nodes.current[index] = element; }} className={`team-node team-node-${node.theme} team-card-${node.cardSide}`} data-active={active === index} style={{ '--node-bg': node.bgHex, '--node-accent': node.accentHex, '--node-text': node.textHex, '--node-yaw': `${node.worldPos.yaw}deg`, transform: `translate3d(${node.worldPos.x}px,0,${node.worldPos.z}px) rotateY(${node.worldPos.yaw}deg)` } as CSSProperties} aria-label={`${node.number}: ${node.stageTitle} ${node.memberName}`}>
            <button className="team-pedestal" type="button" onClick={() => jump.current(index)} aria-label={`Go to ${node.number}: ${node.stageTitle}`}><span className="team-target-ring" /><span className="team-beak" style={{ rotate: `${index < positions.length - 1 ? -teamPath(node.worldPos, positions[index + 1]).angle - node.worldPos.yaw : 90}deg` }} /><span className="team-pedestal-number">{node.number}</span></button>
            <div className="team-standee" aria-hidden="true"><div className="team-portrait"><span>{node.memberName.split(' ').map(name => name[0]).join('')}</span><img src={node.cutoutUrl.startsWith('/') ? `${import.meta.env.BASE_URL}${node.cutoutUrl.slice(1)}` : node.cutoutUrl} alt="" width="190" height="260" decoding="async" onError={event => { event.currentTarget.hidden = true; }} /></div><span className="team-mount" /></div>
            <RoleCard node={node} />
          </article>)}
        </div>
        </div>
      </div>

      <div className="team-mobile-role" style={{ '--node-bg': team.members[active].bgHex, '--node-text': team.members[active].textHex } as CSSProperties}><RoleCard node={team.members[active]} /></div>

      <div className="team-bottom container-page">
        <div className="team-bottom-row"><button type="button" className="team-step" disabled={active === 0} onClick={() => jump.current(Math.max(0, active - 1))}><span aria-hidden="true">←</span> {team.previous}</button><div className="team-stage-status"><StagePills label="Campaign pathway progress" active={active} onJump={index => jump.current(index)} /><p className="team-current" aria-live="polite" aria-atomic="true"><span>{team.members[active].number} / 06</span> {team.members[active].stageTitle}</p></div><button type="button" className="team-step" disabled={active === 5} onClick={() => jump.current(Math.min(5, active + 1))}>{team.next} <span aria-hidden="true">→</span></button></div>
        <div className="team-progress" aria-hidden="true"><span /></div>
        <div className="team-footnotes"><p>{team.note}</p><a href="#contact">{team.skip} <span aria-hidden="true">↘</span></a></div>
      </div>
    </div>
  </section>;
}
