import test from 'node:test';
import assert from 'node:assert/strict';
import { cardAngle, loopOffset } from '../src/lib/brand-motion.mjs';

test('all resting cards use the exact shared angle, including wraparound', () => {
  for (const global of [0, 75, 359.9, 360, 720.5]) {
    assert.equal(cardAngle(0, global, false, 1 / 60), global);
  }
});

test('a released card rejoins the moving clock exactly at different frame rates', () => {
  for (const fps of [30, 60, 120]) {
    let offset = -179;
    let global = 359;
    for (let frame = 0; frame < fps * 3; frame++) {
      global += 22.5 / fps;
      offset = cardAngle(offset, global, false, 1 / fps) - global;
    }
    assert.equal(offset, 0);
  }
});

test('active cards settle on the portfolio face without changing the master clock', () => {
  const global = 75;
  let angle = global;
  for (let frame = 0; frame < 180; frame++) angle = cardAngle(angle - global, global, true, 1 / 60);
  assert.ok(Math.abs((angle % 360) - 180) < 0.001);
  assert.equal(global, 75);
});

test('track wraps at the identical duplicate boundary and supports focus positioning', () => {
  assert.equal(loopOffset(1600, 1600), 0);
  assert.equal(loopOffset(1625, 1600), 25);
  assert.equal(loopOffset(-25, 1600), 1575);
  assert.equal(loopOffset(25, 0), 0);
});

test('hover stays on the same face when the master clock passes a full revolution', () => {
  let previous = 180;
  let offset = previous - 359;
  for (let global = 359; global < 1080; global += 0.375) {
    const angle = cardAngle(offset, global, true, 1 / 60);
    assert.ok(Math.abs(angle - previous) < 1, 'An active card must not flip at clock wraparound');
    offset = angle - global;
    previous = angle;
  }
  for (let frame = 0; frame < 180; frame++) offset = cardAngle(offset, 1080, false, 1 / 60) - 1080;
  assert.equal(offset, 0);
});
