import { ZONE_STARTS, SEQUENCE_FPS, sequenceZone, sequenceVideoSource } from './service-sequence.mjs';

/** Owns time-based playback only. Desktop's scroll renderer never uses this controller. */
export function createMobileServicePlayer(video, { base = '/', onState, onZone }) {
  let disposed = false, visible = false, wantsPlay = false, revision = 0, zone = 0;
  let targetTime = 0;
  const state = { playing: false, pending: false, failed: false, ready: false, reduced: false };
  const publish = () => { if (!disposed) onState({ ...state }); };
  const ensureSource = () => {
    if (!disposed && visible && !state.reduced && !video.getAttribute('src')) {
      video.preload = 'metadata';
      video.src = sequenceVideoSource(base, true);
      video.load();
    }
  };
  const pause = () => {
    revision++; wantsPlay = false;
    state.playing = state.pending = false;
    video.pause(); publish();
  };
  const flushSeek = () => {
    if (disposed || state.reduced || targetTime === null || video.readyState < 1 || video.seeking) return;
    if (Math.abs(video.currentTime - targetTime) > .5 / SEQUENCE_FPS) video.currentTime = targetTime;
    else targetTime = null;
  };
  const frameReady = () => {
    if (disposed || state.reduced) return;
    flushSeek();
    state.ready = targetTime === null && !video.seeking && video.readyState >= 2;
    if (state.ready) state.failed = false;
    publish();
  };
  const timeUpdate = () => {
    if (disposed || state.reduced || targetTime !== null || video.seeking) return;
    const next = sequenceZone(video.currentTime * SEQUENCE_FPS);
    if (next !== zone) { zone = next; onZone(zone); }
  };
  const playing = () => {
    if (disposed) return;
    if (!wantsPlay || !visible || state.reduced) { pause(); return; }
    state.playing = true; state.pending = false; state.failed = false;
    state.ready = targetTime === null && !video.seeking && video.readyState >= 2;
    publish();
  };
  const paused = () => {
    if (disposed) return;
    wantsPlay = false; state.playing = state.pending = false; publish();
  };
  const failure = () => {
    if (disposed) return;
    pause(); state.failed = true; state.ready = false; publish();
  };
  const listeners = { loadedmetadata: frameReady, loadeddata: frameReady, seeked: frameReady, timeupdate: timeUpdate, playing, pause: paused, ended: paused, error: failure };
  for (const [name, handler] of Object.entries(listeners)) video.addEventListener(name, handler);
  publish();

  return {
    select(value) {
      if (disposed) return;
      const next = Math.max(0, Math.min(ZONE_STARTS.length - 1, Math.round(value)));
      // Natural video progress updates React's selected category without restarting the chapter.
      if (next === zone) return;
      pause(); zone = next; targetTime = ZONE_STARTS[zone] / SEQUENCE_FPS;
      state.ready = false; flushSeek(); publish();
    },
    toggle() {
      if (disposed || !visible || state.reduced) return;
      if (wantsPlay || state.playing) { pause(); return; }
      ensureSource();
      if (video.ended) { zone = 0; targetTime = 0; onZone(zone); }
      if (state.failed) {
        state.failed = false; state.ready = false;
        targetTime = ZONE_STARTS[zone] / SEQUENCE_FPS; video.load();
      }
      flushSeek();
      wantsPlay = true; state.pending = true; publish();
      const request = ++revision;
      // Keep play() within the click gesture, even when metadata is still loading.
      try {
        Promise.resolve(video.play()).then(() => {
          if (disposed) return;
          if (request !== revision) { if (!wantsPlay) video.pause(); return; }
          playing();
        }).catch(() => { if (!disposed && request === revision) failure(); });
      } catch { if (!disposed && request === revision) failure(); }
    },
    setVisible(value) {
      if (disposed) return;
      visible = value;
      if (!visible) pause();
      else { ensureSource(); flushSeek(); }
    },
    setReduced(value) {
      if (disposed || value === state.reduced) return;
      pause(); state.reduced = value; state.ready = false;
      targetTime = ZONE_STARTS[zone] / SEQUENCE_FPS;
      if (value) {
        if (video.getAttribute('src')) { video.removeAttribute('src'); video.load(); }
      } else ensureSource();
      publish();
    },
    destroy() {
      if (disposed) return;
      disposed = true; revision++; wantsPlay = false;
      for (const [name, handler] of Object.entries(listeners)) video.removeEventListener(name, handler);
      video.pause();
      if (video.getAttribute('src')) { video.removeAttribute('src'); video.load(); }
    },
  };
}
