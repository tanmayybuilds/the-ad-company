import { scrollPinTo } from './reverse-pin.mjs';

let navigating = false;
export const isSectionNavigating = () => navigating;

export function settleScrollTweens(triggers) {
  for (const trigger of triggers) {
    const tween = trigger.getTween();
    if (tween && typeof tween.progress === 'function') tween.progress(1);
  }
}

export function installSectionNavigation(settle) {
  let hash = '', frame = 0, passes = 0, disposed = false;
  const targetFor = value => {
    try { return value.startsWith('#') && document.getElementById(decodeURIComponent(value.slice(1))); }
    catch { return null; }
  };
  const cancel = () => { hash = ''; navigating = false; window.cancelAnimationFrame(frame); frame = 0; };
  const align = () => {
    frame = 0;
    const target = targetFor(hash);
    if (disposed || !target || document.body.style.overflow === 'hidden') { cancel(); return; }
    settle();
    const header = document.querySelector('header')?.getBoundingClientRect().height || 0;
    scrollPinTo(Math.max(0, window.scrollY + target.getBoundingClientRect().top - header - 16));
    // Scrubbed layout and React's pin-fit measurement can settle after the first jump.
    if (++passes < 4) frame = window.requestAnimationFrame(align);
    else { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); navigating = false; }
  };
  const navigate = value => {
    if (!targetFor(value)) return false;
    cancel(); hash = value; navigating = true; passes = 0; frame = window.requestAnimationFrame(align); return true;
  };
  const click = event => {
    if (event.defaultPrevented || event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = event.target?.closest?.('a[href]');
    if (!anchor || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return;
    const url = new URL(anchor.getAttribute('href'), window.location.href);
    if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !navigate(url.hash)) return;
    event.preventDefault();
    window.history.pushState(null, '', url);
  };
  const initial = () => { if (hash && !disposed) navigate(hash); };
  const changed = () => navigate(window.location.hash);
  const key = event => { if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) cancel(); };
  document.addEventListener('click', click);
  window.addEventListener('hashchange', changed);
  window.addEventListener('popstate', changed);
  window.addEventListener('load', initial);
  window.addEventListener('wheel', cancel, { passive: true });
  window.addEventListener('touchstart', cancel, { passive: true });
  window.addEventListener('pointerdown', cancel);
  window.addEventListener('keydown', key);
  navigate(window.location.hash);
  document.fonts?.ready.then(initial);
  return () => {
    disposed = true; cancel();
    document.removeEventListener('click', click);
    window.removeEventListener('hashchange', changed);
    window.removeEventListener('popstate', changed);
    window.removeEventListener('load', initial);
    window.removeEventListener('wheel', cancel);
    window.removeEventListener('touchstart', cancel);
    window.removeEventListener('pointerdown', cancel);
    window.removeEventListener('keydown', key);
  };
}
