import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { team, type TeamPointerNode } from '@/content/site';
import { ScrollTrigger } from '@/lib/motion';
import { teamCamera, teamPath, teamProgress, teamScrollTop, teamWindow, teamFraming } from '@/lib/team-tour.mjs';
import { exitReversePin, observeScrollDirection, scrollPinTo, createWheelStep } from '@/lib/reverse-pin.mjs';
import { isSectionNavigating } from '@/lib/section-navigation.mjs';
import './team-tour.css';
import { TeamBiography } from './TeamBiography';

const positions = team.members.map(node => node.worldPos);

function StagePills({ label, active, onJump }: { label: string; active: number; onJump: (index: number) => void }) {
  return <nav className="team-pills" aria-label={label}>{team.members.map((node, index) =>
    <button type="button" key={node.id} aria-label={`${node.number}: ${node.stageTitle}`} aria-current={active === index ? 'step' : undefined} onClick={() => onJump(index)}>{node.number}</button>,
  )}</nav>;
}

function RoleCard({ node, onRead }: { node: TeamPointerNode; onRead: () => void }) {
  return <div className="team-role">
    <div className="team-role-bar"><span>{node.number}</span><strong>{node.stageTitle}</strong><span aria-hidden="true">↗</span></div>
    <div className="team-role-body">
      <h3>{node.memberName}</h3>
      <p className="team-role-badge">{node.roleTitle}</p>
      <p className="team-responsibility">{node.responsibility}</p>
      <p className="team-intro">{node.introCopy}</p>
      <button type="button" className="team-read-bio" onClick={onRead} aria-haspopup="dialog" aria-label={`${team.readBio}: ${node.memberName}`}>{team.readBio} ↗</button>
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
  const [selectedIndex, setActive] = useState(0);
  const [profile, setProfile] = useState<number | null>(null);
  const last = team.members.length - 1;
  const active = Math.max(0, Math.min(last, selectedIndex));
  const total = String(team.members.length).padStart(2, '0');

  useEffect(() => {
    const section = root.current!, stage = world.current!;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = window.matchMedia('(max-width: 767px), (max-width: 1023px) and (max-height: 500px)');
    let top = 0, distance = 0, raf = 0, lastTime = 0, visible = false, selected = -1;
    let firstVisible = -1, lastVisible = -1;
    let lastScrollY = window.scrollY, travelling = false, travelStarted = 0;
    let passedStage = false;
    let touch: { x: number; y: number; handled: boolean } | null = null;
    const wheelStep = createWheelStep(positions.length, true);
    const scrollDirection = observeScrollDirection();
    const inside = () => distance > 0 && window.scrollY >= Math.floor(top) && window.scrollY <= Math.ceil(top + distance);
    const locked = () => document.body.style.overflow === 'hidden' || isSectionNavigating();

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
      if (window.scrollY >= top + section.offsetHeight) passedStage = true;
      const framing = teamFraming(window.innerWidth, mobile.matches ? Math.max(760, window.innerHeight) : window.innerHeight);
      section.style.setProperty('--tour-scale', String(framing.scale));
      section.style.setProperty('--active-card-scale', String(framing.cardScale));
      section.style.setProperty('--active-portrait-scale', String(framing.portraitScale));
      lastScrollY = window.scrollY;
      if (!mobile.matches && !visible && !travelling && !reduced.matches) {
        current.current = target.current = Math.round(teamProgress(window.scrollY, top, distance, positions.length));
      }
    }

    function onScroll() {
      const previous = lastScrollY, y = window.scrollY;
      lastScrollY = y;
      if (mobile.matches || reduced.matches || locked() || Math.abs(y - previous) <= 1) return;
      if (y >= top + section.offsetHeight) passedStage = true;
      if (y < previous) {
        if (scrollDirection.direction() !== -1) return;
        if (passedStage) { leaveBackwards(); return; }
        if (y < top && previous >= top) resetToStart();
        else if (inside() && !travelling && target.current > 0) jump.current(target.current - 1);
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
      if (viewRange.first !== firstVisible || viewRange.last !== lastVisible) {
        firstVisible = viewRange.first;
        lastVisible = viewRange.last;
        nodes.current.forEach((element, index) => {
          if (!element) return;
          element.hidden = index < viewRange.first || index > viewRange.last;
          element.inert = element.hidden;
          if (!element.hidden) void element.querySelector<HTMLImageElement>('img')?.decode().catch(() => {});
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
      passedStage = false;
      current.current = target.current = 0;
      firstVisible = lastVisible = -1;
      render(0);
    }

    function leaveBackwards() {
      if (!passedStage) return false;
      const exited = exitReversePin({ start: top, end: top + distance }, resetToStart, scrollDirection.direction());
      if (exited) { scrollDirection.reset(); lastScrollY = window.scrollY; }
      return exited;
    }

    jump.current = index => {
      index = Math.max(0, Math.min(positions.length - 1, index));
      if (reduced.matches) {
        setActive(index);
        nodes.current[index]?.scrollIntoView({ behavior: 'instant', block: 'center' });
      } else {
        passedStage = false;
        target.current = index;
        travelling = current.current !== index;
        travelStarted = performance.now();
        if (!mobile.matches) scrollTo(teamScrollTop(index, top, distance, positions.length));
        wake();
      }
    };

    function onWheel(event: WheelEvent) {
      if (event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const step = wheelStep(target.current, travelling, event.deltaY, event.timeStamp);
      if (mobile.matches || event.defaultPrevented || reduced.matches || locked() || !inside()) return;
      if (passedStage) { if (event.deltaY < 0) leaveBackwards(); return; }
      if (step === 'back') return;
      if (step === 'leave') return;
      event.preventDefault();
      if (typeof step === 'number') jump.current(step);
    }

    function onKey(event: KeyboardEvent) {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || mobile.matches || reduced.matches || locked() || !inside()) return;
      const element = event.target instanceof Element ? event.target : null;
      if (element?.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;
      if (event.key === ' ' && element?.closest('button, a')) return;
      if (event.key === 'ArrowUp' || event.key === 'PageUp' || (event.key === ' ' && event.shiftKey)) {
        if (passedStage) { leaveBackwards(); return; }
        if (target.current === 0 && !travelling && !event.repeat) return;
        event.preventDefault();
        if (!travelling && !event.repeat) jump.current(target.current - 1);
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
      if (!touch || event.touches.length !== 1 || mobile.matches || reduced.matches || locked() || !inside()) return;
      const delta = touch.y - event.touches[0].clientY;
      if (Math.abs(event.touches[0].clientX - touch.x) >= Math.abs(delta)) return;
      if (passedStage) { if (delta < -12) leaveBackwards(); return; }
      if (!delta) return;
      const direction = Math.sign(delta);
      if (!travelling && !touch.handled && (direction < 0 ? target.current === 0 : target.current === positions.length - 1)) return;
      if (event.cancelable) event.preventDefault();
      if (travelling || touch.handled) { touch.handled = true; return; }
      if (Math.abs(delta) > 30) { touch.handled = true; jump.current(target.current + direction); }
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
      firstVisible = lastVisible = -1;
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
    mobile.addEventListener('change', motionChange);
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
      mobile.removeEventListener('change', motionChange);
      ScrollTrigger.removeEventListener('refresh', measure);
      jump.current = () => {};
    };
  }, []);

  return <section id="team" ref={root} className="team-tour" aria-labelledby="team-title" style={{ '--tour-height': `${100 + team.members.length * 75}vh` } as CSSProperties}>
    <div className="team-viewport">
      <header className="team-heading container-page">
        <p className="team-eyebrow">{team.eyebrow}</p>
        <div className="team-heading-row"><h2 id="team-title">{team.heading[0]}<br />{team.heading[1]}</h2><span className="team-tour-mark" aria-hidden="true">↳<small>01—{total}<br />Campaign pathway</small></span></div>
        <div className="team-heading-controls"><p className="team-hint-scroll">{team.hint}</p><p className="team-hint-select">{team.mobileHint}</p><StagePills label="Jump to a campaign stage" active={active} onJump={index => jump.current(index)} /></div>
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
          {team.members.map((node, index) => <article key={node.id} id={node.id} ref={element => { nodes.current[index] = element; }} className={`team-node team-node-${node.theme} team-card-${node.cardSide}`} data-active={active === index} style={{ '--node-yaw': `${node.worldPos.yaw}deg`, transform: `translate3d(${node.worldPos.x}px,0,${node.worldPos.z}px) rotateY(${node.worldPos.yaw}deg)` } as CSSProperties} aria-label={`${node.number}: ${node.stageTitle} ${node.memberName}`}>
            <button className="team-pedestal" type="button" onClick={() => jump.current(index)} aria-label={`Go to ${node.number}: ${node.stageTitle}`}><span className="team-target-ring" /><span className="team-beak" style={{ rotate: `${index < positions.length - 1 ? -teamPath(node.worldPos, positions[index + 1]).angle - node.worldPos.yaw : 90}deg` }} /><span className="team-pedestal-number">{node.number}</span></button>
            <div className="team-standee" aria-hidden="true"><div className="team-portrait"><span>{node.memberName.split(' ').map(name => name[0]).join('')}</span><img src={node.cutoutUrl.startsWith('/') ? `${import.meta.env.BASE_URL}${node.cutoutUrl.slice(1)}` : node.cutoutUrl} alt="" width="190" height="260" loading="eager" decoding="async" onError={event => { event.currentTarget.hidden = true; }} /></div><span className="team-mount" /></div>
            <RoleCard node={node} onRead={() => setProfile(index)} />
          </article>)}
        </div>
        </div>
      </div>

      <div className={`team-mobile-role team-node-${team.members[active].theme}`}><RoleCard node={team.members[active]} onRead={() => setProfile(active)} /></div>

      <div className="team-bottom container-page">
        <div className="team-bottom-row"><button type="button" className="team-step" disabled={active === 0} onClick={() => jump.current(Math.max(0, active - 1))}><span aria-hidden="true">←</span> {team.previous}</button><div className="team-stage-status"><StagePills label="Campaign pathway progress" active={active} onJump={index => jump.current(index)} /><p className="team-current" aria-live="polite" aria-atomic="true"><span>{team.members[active].number} / {total}</span> {team.members[active].stageTitle}</p></div><button type="button" className="team-step" disabled={active === last} onClick={() => jump.current(Math.min(last, active + 1))}>{team.next} <span aria-hidden="true">→</span></button></div>
        <div className="team-progress" aria-hidden="true"><span /></div>
        <div className="team-footnotes"><p>{team.note}</p><a href="#contact">{team.skip} <span aria-hidden="true">↘</span></a></div>
      </div>
    </div>
    <TeamBiography node={profile === null ? null : team.members[profile]} onClose={() => setProfile(null)} />
  </section>;
}
