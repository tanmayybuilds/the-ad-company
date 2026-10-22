import test from 'node:test';
import assert from 'node:assert/strict';
import { exitReversePin, observeScrollDirection, scrollPinTo } from '../src/lib/reverse-pin.mjs';

test('programmatic navigation records rounded and clamped browser coordinates', t => {
  const original = globalThis.window;
  t.after(() => { globalThis.window = original; });
  globalThis.window = {
    scrollY: 0,
    scrollTo({ top, behavior }) {
      assert.equal(behavior, 'instant');
      this.scrollY = Math.min(5400, Math.max(0, Math.round(top)));
    },
  };
  for (const y of [1000.4, 1800.8, 2601.2, 3401.6, 4202, 6000.7]) {
    const recorded = scrollPinTo(y);
    assert.equal(recorded, window.scrollY, 'A browser correction must not look like reverse scrolling');
    assert.ok(Number.isInteger(recorded));
  }
  assert.equal(window.scrollY, 5400, 'The recorded value must include clamping, not just requested rounding');
});

function directionFixture(t) {
  const original = globalThis.window;
  globalThis.window = new EventTarget();
  let now = 0;
  t.mock.method(performance, 'now', () => now);
  const direction = observeScrollDirection();
  t.after(() => { direction.destroy(); globalThis.window = original; });
  return {
    direction,
    tick(value) { now = value; },
    input(type, properties = {}) {
      const event = new Event(type, { cancelable: true });
      Object.assign(event, properties);
      window.dispatchEvent(event);
    },
  };
}

test('forward wheel input and layout-only corrections never authorize a reverse exit', t => {
  const { direction, input } = directionFixture(t);
  assert.equal(direction.direction(), 0);
  input('wheel', { deltaY: 100, deltaX: 0 });
  assert.equal(direction.direction(), 1);
  input('scroll');
  assert.equal(direction.direction(), 1);
  input('resize');
  assert.equal(direction.direction(), 0);
  direction.reset();
  assert.equal(direction.direction(), 0);
});

test('real upward intent works, expires, and is cleared by manual navigation', t => {
  const { direction, input, tick } = directionFixture(t);
  input('wheel', { deltaY: -20, deltaX: 0 });
  assert.equal(direction.direction(), -1);
  tick(800);
  assert.equal(direction.direction(), 0);
  input('keydown', { key: 'PageUp' });
  assert.equal(direction.direction(), -1);
  input('pointerdown');
  assert.equal(direction.direction(), 0);
  input('keydown', { key: 'ArrowDown' });
  assert.equal(direction.direction(), 1);
  direction.reset();
  assert.equal(direction.direction(), 0);
});

test('zoom, horizontal gestures and editing do not authorize a reverse reset', t => {
  const { direction, input } = directionFixture(t);
  input('wheel', { deltaY: -20, deltaX: 0, ctrlKey: true });
  assert.equal(direction.direction(), 0);
  input('wheel', { deltaY: -2, deltaX: 20 });
  assert.equal(direction.direction(), 0);
  input('keydown', { key: 'ArrowUp', ctrlKey: true });
  assert.equal(direction.direction(), 0);
  window.closest = () => ({});
  input('keydown', { key: 'ArrowUp' });
  assert.equal(direction.direction(), 0);
});

test('touch direction survives a navigation reset and all input listeners are removed on cleanup', t => {
  const { direction, input } = directionFixture(t);
  input('touchstart', { touches: [{ clientY: 200 }] });
  input('touchmove', { touches: [{ clientY: 150 }] });
  assert.equal(direction.direction(), 1);
  direction.reset();
  input('touchmove', { touches: [{ clientY: 180 }] });
  assert.equal(direction.direction(), -1);
  direction.reset();
  direction.destroy();
  input('wheel', { deltaY: -100, deltaX: 0 });
  assert.equal(direction.direction(), 0);
});

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
  assert.equal(exitReversePin(trigger, reset, -1), true);
  assert.deepEqual(moves, [{ top: 999, behavior: 'instant' }]);
  assert.equal(resets, 1);
  // Remaining upward input belongs to the static page, not another intercepted gesture.
  assert.equal(exitReversePin(trigger, reset, -1), false);
  assert.equal(resets, 1);
  // A later downward visit can run again; its next upward exit also works midway through.
  window.scrollY = 1800;
  assert.equal(exitReversePin(trigger, reset, -1), true);
  assert.equal(resets, 2);
});

test('reverse exit leaves other sections alone and exits at the exact start boundary', t => {
  const original = globalThis.window;
  t.after(() => { globalThis.window = original; });
  const moves = [];
  globalThis.window = { scrollY: 500, scrollTo(options) { moves.push(options); } };
  const trigger = { start: 1000, end: 3400 };
  const reset = () => {};
  assert.equal(exitReversePin(trigger, reset, -1), false);
  window.scrollY = 3500;
  assert.equal(exitReversePin(trigger, reset, -1), false);
  assert.equal(moves.length, 0);
  window.scrollY = 1000;
  assert.equal(exitReversePin(trigger, reset, -1), true);
  assert.equal(moves[0].top, 999);
});

test('scrolling inside a modal never moves the underlying pinned page', t => {
  const original = globalThis.window;
  t.after(() => { globalThis.window = original; });
  globalThis.window = {
    scrollY: 1800,
    document: { body: { style: { overflow: 'hidden' } } },
    scrollTo() { assert.fail('A modal scroll must not move the page'); },
  };
  assert.equal(exitReversePin({ start: 1000, end: 3400 }, () => assert.fail('A modal scroll must not reset the scene'), -1), false);
});

test('forward navigation and completion cannot reset any pin without real upward intent', t => {
  const { direction, input } = directionFixture(t);
  window.scrollTo = function ({ top }) { this.scrollY = Math.round(top); };
  let resets = 0;
  for (const trigger of [{ start: 1000.2, end: 3400.8 }, { start: 5000.4, end: 7000.6 }, { start: 9000.8, end: 13000.2 }]) {
    for (let index = 0; index < 6; index++) {
      input('pointerdown');
      const destination = trigger.start + index / 5 * (trigger.end - trigger.start);
      const recorded = scrollPinTo(destination);
      input('scroll');
      assert.equal(window.scrollY, recorded);
      assert.equal(exitReversePin(trigger, () => resets++, direction.direction()), false);
      input('wheel', { deltaY: 100, deltaX: 0 });
      window.scrollY -= 1;
      input('scroll');
      assert.equal(exitReversePin(trigger, () => resets++, direction.direction()), false, 'Pin release or fractional correction must not replay the sequence');
    }
    assert.equal(resets, 0);
  }
  input('wheel', { deltaY: -100, deltaX: 0 });
  assert.equal(exitReversePin({ start: 9000.8, end: 13000.2 }, () => resets++, direction.direction()), true);
  assert.equal(resets, 1);
});

test('scrollbar dragging authorizes direction while ordinary clicks and layout movement do not', t => {
  const { direction, input } = directionFixture(t);
  window.document = { documentElement: { clientWidth: 1280 } };
  window.scrollY = 2000;
  input('pointerdown', { button: 0, clientX: 1285 });
  window.scrollY = 1800;
  input('scroll');
  assert.equal(direction.direction(), -1);
  input('pointerup');
  direction.reset();
  window.scrollY = 1700;
  input('scroll');
  assert.equal(direction.direction(), 0);
  input('pointerdown', { button: 0, clientX: 500 });
  window.scrollY = 1600;
  input('scroll');
  assert.equal(direction.direction(), 0);
});
