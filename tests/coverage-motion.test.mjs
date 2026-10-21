import test from 'node:test';
import assert from 'node:assert/strict';
import { coveragePose } from '../src/lib/coverage-motion.mjs';

test('the central city stays flat and fully readable', () => {
  const pose = coveragePose(0);
  assert.ok(pose.x === 0 && pose.z === 0 && pose.rotation === 0);
  assert.equal(pose.scale, 1);
  assert.equal(pose.opacity, 1);
});

test('city poses are symmetrical and continuous through selection boundaries', () => {
  for (const distance of [.1, .5, 1, 1.5, 2]) {
    const left = coveragePose(-distance);
    const right = coveragePose(distance);
    assert.equal(left.x, -right.x);
    assert.equal(left.rotation, -right.rotation);
    assert.equal(left.z, right.z);
    assert.ok(right.opacity >= 0 && right.opacity <= 1);
    const nearby = coveragePose(distance + .0001);
    assert.ok(Math.abs(right.x - nearby.x) < .02);
    assert.ok(Math.abs(right.scale - nearby.scale) < .001);
  }
});

test('distant cards recede without invalid transforms', () => {
  for (const distance of [-6, -2, 2, 6]) {
    const pose = coveragePose(distance);
    assert.ok(Object.values(pose).every(Number.isFinite));
    assert.ok(pose.scale >= .6);
    assert.ok(pose.z < 0);
  }
});
