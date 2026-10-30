import test from 'node:test';
import assert from 'node:assert/strict';
import { createMobileServicePlayer } from '../src/lib/mobile-service-player.mjs';
import { ZONE_STARTS, SEQUENCE_FPS } from '../src/lib/service-sequence.mjs';

function fixture() {
  const states = [], zones = [], seeks = [];
  const video = Object.assign(new EventTarget(), {
    src: '', readyState: 0, seeking: false, paused: true, ended: false, time: 0, loads: 0, plays: 0,
    load() { this.loads++; this.readyState = 0; this.seeking = false; },
    getAttribute() { return this.src || null; },
    removeAttribute() { this.src = ''; },
    play() { this.plays++; this.paused = false; this.dispatchEvent(new Event('playing')); return Promise.resolve(); },
    pause() { if (!this.paused) { this.paused = true; this.dispatchEvent(new Event('pause')); } },
  });
  Object.defineProperty(video, 'currentTime', { get() { return this.time; }, set(value) { this.time = value; this.seeking = true; seeks.push(value); } });
  const player = createMobileServicePlayer(video, { base: '/the-ad-company/', onState: state => states.push(state), onZone: zone => zones.push(zone) });
  const ready = () => { video.readyState = 2; video.dispatchEvent(new Event('loadedmetadata')); video.dispatchEvent(new Event('loadeddata')); };
  const seeked = () => { video.seeking = false; video.dispatchEvent(new Event('seeked')); };
  return { video, player, ready, seeked, states, zones, seeks, state: () => states.at(-1) };
}

test('mobile video loads only when visible and plays only after an explicit request', async () => {
  const f = fixture();
  assert.equal(f.video.src, '');
  f.player.setVisible(true);
  assert.ok(f.video.src.endsWith('/videos/services-v3-mobile.mp4'));
  assert.equal(f.video.plays, 0);
  f.ready(); f.seeked();
  f.player.toggle(); await Promise.resolve();
  assert.equal(f.video.plays, 1); assert.equal(f.state().playing, true);
  f.player.toggle(); assert.equal(f.state().playing, false);
  f.player.destroy();
});

test('leaving the viewport pauses playback without automatically resuming on return', async () => {
  const f = fixture(); f.player.setVisible(true); f.ready(); f.seeked();
  f.player.toggle(); await Promise.resolve();
  const loads = f.video.loads;
  f.player.setVisible(false); assert.equal(f.video.paused, true);
  f.player.setVisible(true); assert.equal(f.video.plays, 1); assert.equal(f.video.loads, loads);
  f.player.destroy();
});

test('category selection pauses and coalesces rapid seeks while playback progress does not seek backwards', () => {
  const f = fixture(); f.player.setVisible(true); f.ready(); f.seeked();
  f.player.select(1); assert.equal(f.seeks.at(-1), ZONE_STARTS[1] / SEQUENCE_FPS);
  const count = f.seeks.length;
  f.player.select(4); assert.equal(f.seeks.length, count, 'Finish a seek before requesting the newest chapter');
  f.seeked(); assert.equal(f.seeks.at(-1), ZONE_STARTS[4] / SEQUENCE_FPS);
  f.seeked(); assert.equal(f.state().ready, true);
  f.video.time = ZONE_STARTS[2] / SEQUENCE_FPS + 1; f.video.dispatchEvent(new Event('timeupdate'));
  assert.equal(f.zones.at(-1), 2);
  const before = f.seeks.length;
  f.player.select(2); assert.equal(f.seeks.length, before, 'React active-category updates must not rewind natural playback');
  f.player.select(-10); f.seeked(); assert.equal(f.seeks.at(-1), 0);
  f.player.destroy();
});

test('reduced motion uses posters without downloading video and restores without autoplay', () => {
  const f = fixture(); f.player.setReduced(true); f.player.setVisible(true); f.player.select(3); f.player.toggle();
  assert.equal(f.video.src, ''); assert.equal(f.video.plays, 0); assert.equal(f.state().reduced, true);
  f.player.setReduced(false); assert.ok(f.video.src.endsWith('mobile.mp4')); assert.equal(f.video.plays, 0);
  f.ready(); f.seeked(); assert.equal(f.video.currentTime, ZONE_STARTS[3] / SEQUENCE_FPS);
  f.player.setReduced(true); assert.equal(f.video.src, ''); assert.equal(f.state().ready, false);
  f.player.destroy();
});

test('a rejected play request returns to a retryable poster state and cleanup ignores late promises', async () => {
  const f = fixture(); f.player.setVisible(true); f.ready(); f.seeked();
  f.video.play = () => Promise.reject(new Error('Playback blocked'));
  f.player.toggle(); await Promise.resolve(); await Promise.resolve();
  assert.equal(f.state().failed, true); assert.equal(f.state().pending, false); assert.equal(f.state().playing, false);
  let reject;
  f.video.play = () => new Promise((_, fail) => { reject = fail; });
  f.player.toggle(); const count = f.states.length; f.player.destroy();
  reject(new Error('Late cancellation')); await Promise.resolve(); await Promise.resolve();
  assert.equal(f.states.length, count); assert.equal(f.video.src, '');
  f.player.toggle(); f.player.select(1); f.player.setVisible(true); assert.equal(f.video.src, '');
});

test('an in-flight play is cancelled by category selection and media failures retain fallback readiness', async () => {
  const f = fixture(); f.player.setVisible(true);
  let resolve;
  f.video.play = () => { f.video.plays++; return new Promise(done => { resolve = done; }); };
  f.player.toggle(); assert.equal(f.video.plays, 1, 'Start play synchronously in the user gesture, before metadata');
  assert.equal(f.state().pending, true);
  f.player.select(4); resolve(); await Promise.resolve();
  assert.equal(f.state().pending, false); assert.equal(f.state().playing, false);
  f.video.dispatchEvent(new Event('error')); assert.equal(f.state().failed, true); assert.equal(f.state().ready, false);
  f.player.destroy();
});
