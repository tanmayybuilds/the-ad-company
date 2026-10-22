export function exitReversePin(trigger, reset) {
  const y = window.scrollY;
  if (y < trigger.start || y > trigger.end) return false;
  reset();
  // Cross the pin boundary immediately; CSS smooth scrolling would retain the dead scroll distance.
  window.scrollTo({ top: Math.max(0, trigger.start - 1), behavior: 'instant' });
  return true;
}
