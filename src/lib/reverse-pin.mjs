export function scrollPinTo(y) {
  window.scrollTo({ top: Math.round(y), behavior: 'instant' });
  return window.scrollY;
}

export function createWheelStep(count) {
  let lastTime = -Infinity, lastDirection = 0;
  return (index, busy, delta, time) => {
    if (!delta) return 'wait';
    const direction = Math.sign(delta);
    const fresh = time - lastTime > 180 || direction !== lastDirection;
    lastTime = time;
    lastDirection = direction;
    if (direction < 0) return 'back';
    if (busy || !fresh) return 'wait';
    return index < count - 1 ? index + 1 : 'leave';
  };
}

export function observeScrollDirection() {
  let direction = 0, updated = -Infinity, touch = null, dragging = false, previousY = 0;
  const set = value => { direction = value; updated = performance.now(); };
  const reset = () => set(0);
  const wheel = event => {
    if (event.ctrlKey || event.defaultPrevented || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) { reset(); return; }
    set(Math.sign(event.deltaY));
  };
  const key = event => {
    reset();
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.target?.closest?.('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;
    if (event.key === ' ' && event.target?.closest?.('button, a')) return;
    if (['ArrowUp', 'PageUp', 'Home'].includes(event.key) || (event.key === ' ' && event.shiftKey)) set(-1);
    else if (['ArrowDown', 'PageDown', 'End', ' '].includes(event.key)) set(1);
  };
  const touchStart = event => {
    reset();
    touch = event.touches.length === 1 ? { x: event.touches[0].clientX ?? 0, y: event.touches[0].clientY } : null;
  };
  const touchMove = event => {
    if (!touch || event.touches.length !== 1) { reset(); return; }
    const point = event.touches[0];
    const dx = (point.clientX ?? 0) - touch.x, dy = touch.y - point.clientY;
    touch = { x: point.clientX ?? 0, y: point.clientY };
    if (Math.abs(dy) > Math.abs(dx)) set(Math.sign(dy));
  };
  const touchEnd = () => { touch = null; };
  const pointerDown = event => {
    reset();
    dragging = event.button === 0 && event.clientX >= (window.document?.documentElement?.clientWidth ?? Infinity);
    previousY = window.scrollY;
  };
  const pointerUp = () => { dragging = false; };
  const scroll = () => {
    if (!dragging) return;
    const y = window.scrollY;
    if (Math.abs(y - previousY) > 1) set(Math.sign(y - previousY));
    previousY = y;
  };
  const handlers = { wheel, keydown: key, touchstart: touchStart, touchmove: touchMove, touchend: touchEnd, touchcancel: touchEnd, pointerdown: pointerDown, pointerup: pointerUp, pointercancel: pointerUp, scroll, resize: reset };
  for (const [type, handler] of Object.entries(handlers)) window.addEventListener(type, handler, { capture: true, passive: true });
  return {
    direction: () => performance.now() - updated < 750 ? direction : 0,
    reset,
    destroy() {
      for (const [type, handler] of Object.entries(handlers)) window.removeEventListener(type, handler, { capture: true });
    },
  };
}

export function exitReversePin(trigger, reset, direction) {
  if (direction !== -1) return false;
  if (window.document?.body.style.overflow === 'hidden') return false;
  const y = window.scrollY;
  if (y < Math.floor(trigger.start) || y > Math.ceil(trigger.end)) return false;
  reset();
  // Cross the pin boundary immediately; CSS smooth scrolling would retain the dead scroll distance.
  scrollPinTo(Math.max(0, Math.floor(trigger.start) - 1));
  return true;
}
