import test from 'node:test';
import assert from 'node:assert/strict';
import { exitReversePin } from '../src/lib/reverse-pin.mjs';

test('upward exit bypasses all pin distance even when the first slide is already showing', t => {
  const original = globalThis.window;
  t.after(() => { globalThis.window = original; });
  let resets = 0;
  const moves = [];
  globalThis.window = {
    scrollY: 3400,
    scrollTo(options) { moves.push(options); this.scrollY = options.top; },
  };
  const trigger = { start: 1000, end: 3400 };
  const reset = () => { resets++; };
  assert.equal(exitReversePin(trigger, reset), true);
  assert.deepEqual(moves, [{ top: 999, behavior: 'instant' }]);
  assert.equal(resets, 1);
  // Remaining upward input belongs to the static page, not another intercepted gesture.
  assert.equal(exitReversePin(trigger, reset), false);
  assert.equal(resets, 1);
  // A later downward visit can run again; its next upward exit also works midway through.
  window.scrollY = 1800;
  assert.equal(exitReversePin(trigger, reset), true);
  assert.equal(resets, 2);
});

test('reverse exit leaves other sections alone and exits at the exact start boundary', t => {
  const original = globalThis.window;
  t.after(() => { globalThis.window = original; });
  const moves = [];
  globalThis.window = { scrollY: 500, scrollTo(options) { moves.push(options); } };
  const trigger = { start: 1000, end: 3400 };
  const reset = () => {};
  assert.equal(exitReversePin(trigger, reset), false);
  window.scrollY = 3500;
  assert.equal(exitReversePin(trigger, reset), false);
  assert.equal(moves.length, 0);
  window.scrollY = 1000;
  assert.equal(exitReversePin(trigger, reset), true);
  assert.equal(moves[0].top, 999);
});
