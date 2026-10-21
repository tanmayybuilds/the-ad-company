import test from 'node:test';
import assert from 'node:assert/strict';
import { coverageDistance, coverageFrame, coveragePose } from '../src/lib/coverage-motion.mjs';

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

test('only the immediate neighbours remain faintly visible at rest', () => {
  assert.ok(coveragePose(1).opacity <= .2);
  assert.ok(coveragePose(-1).opacity > 0);
  assert.equal(coveragePose(2).opacity, 0);
  assert.equal(coveragePose(-2).opacity, 0);
});

test('every resting city has two visual neighbours, including the first and last', () => {
  for (let selected = 0; selected < 7; selected++) {
    const visible = Array.from({ length: 7 }, (_, index) => coveragePose(coverageDistance(index, selected, 7))).filter(pose => pose.opacity > .02);
    assert.equal(visible.length, 3);
    assert.equal(visible.filter(pose => pose.opacity === 1).length, 1);
  }
});

test('the city title reveals only after its card finishes sliding', () => {
  const leaving = coverageFrame(.1);
  assert.equal(leaving.position, 0);
  assert.ok(leaving.opacity < 1);
  const sliding = coverageFrame(.5);
  assert.ok(sliding.position > 0 && sliding.position < 1);
  assert.equal(sliding.opacity, 0);
  const arriving = coverageFrame(.9);
  assert.equal(arriving.position, 1);
  assert.equal(arriving.title, 1);
  assert.ok(arriving.opacity > 0 && arriving.opacity < 1);
  assert.deepEqual(coverageFrame(1), { position: 1, title: 1, opacity: 1 });
});

test('the same scroll sequence reverses without showing a name during card motion', () => {
  for (const progress of [4.7, 4.5, 4.3]) assert.equal(coverageFrame(progress).opacity, 0);
  const returning = coverageFrame(4.1);
  assert.equal(returning.position, 4);
  assert.equal(returning.title, 4);
  assert.ok(returning.opacity > 0);
  assert.deepEqual(coverageFrame(6), { position: 6, title: 6, opacity: 1 });
});
