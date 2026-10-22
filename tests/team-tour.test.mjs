import test from 'node:test';
import assert from 'node:assert/strict';
import { teamCamera, teamProgress, teamScrollTop, teamPath, teamWindow, teamFraming } from '../src/lib/team-tour.mjs';
import { createWheelStep } from '../src/lib/reverse-pin.mjs';

const nodes = [
  { x: 0, z: 0, yaw: 0 }, { x: 420, z: -650, yaw: -14 },
  { x: -380, z: -1300, yaw: 14 }, { x: 420, z: -1950, yaw: -14 },
  { x: -380, z: -2600, yaw: 14 }, { x: 0, z: -3250, yaw: 0 },
];

test('a long trackpad flick advances once even after the camera finishes travelling', () => {
  const wheel = createWheelStep(6);
  assert.equal(wheel(0, false, 1200, 0), 1);
  for (let time = 16; time < 3000; time += 16) {
    assert.equal(wheel(1, time < 900, 100, time), 'wait');
  }
  assert.equal(wheel(1, false, 80, 3200), 2);
});

test('each fresh gesture advances exactly one stop and the last stop can exit', () => {
  const wheel = createWheelStep(6);
  for (let index = 0; index < 5; index++) {
    assert.equal(wheel(index, false, 9000, index * 1200), index + 1);
    assert.equal(wheel(index + 1, true, 9000, index * 1200 + 16), 'wait');
  }
  assert.equal(wheel(5, false, 20, 5000), 'leave');
});

test('upward input cancels travel immediately and a fresh downward visit starts at pointer one', () => {
  const wheel = createWheelStep(6);
  assert.equal(wheel(0, false, 100, 0), 1);
  assert.equal(wheel(1, true, -1, 16), 'back');
  assert.equal(wheel(0, false, 100, 32), 1);
  assert.equal(wheel(1, true, 100, 48), 'wait');
});

test('input during travel is consumed rather than queued or skipping a stop', () => {
  const wheel = createWheelStep(6);
  assert.equal(wheel(0, false, 100, 0), 1);
  assert.equal(wheel(1, true, 100, 300), 'wait');
  assert.equal(wheel(1, false, 20, 316), 'wait');
  assert.equal(wheel(1, false, 100, 1200), 2);
  assert.equal(wheel(2, false, 0, 1216), 'wait');
});

test('close-up desktop framing keeps the pedestal, portrait and introduction readable', () => {
  for (const [width, height] of [[1280, 800], [1440, 900], [1920, 1080]]) {
    const view = teamFraming(width, height);
    const projection = 1150 / (1150 + 80 * Math.cos(14 * Math.PI / 180) * view.scale);
    assert.ok(240 * view.scale * projection >= 175, 'Pedestal should fill at least 175 screen pixels');
    assert.ok(260 * view.scale * view.portraitScale * projection >= 250, 'Portrait should be at least 250 screen pixels tall');
    assert.ok(14.4 * view.scale * view.cardScale * projection >= 15, 'Introduction should render at a readable size');
    const cardEdge = (155 + 320 * view.cardScale) * view.scale * projection;
    assert.ok(cardEdge <= width / 2 - 24, 'Beside-card must stay inside either edge of the viewport');
  }
});

test('compact framing limits portrait enlargement on short screens', () => {
  for (const [width, height] of [[360, 667], [390, 844], [820, 900]]) {
    const view = teamFraming(width, height);
    const photoHeight = 260 * view.scale * view.portraitScale;
    assert.ok(photoHeight >= 180 && photoHeight <= 250);
    assert.ok(view.scale > .25 && view.scale <= 1);
  }
});

test('each jump lands exactly at its camera stop, including both ends', () => {
  nodes.forEach((node, index) => {
    const top = teamScrollTop(index, 2000, 4400, nodes.length);
    assert.equal(teamProgress(top, 2000, 4400, nodes.length), index);
    assert.deepEqual(teamCamera(index, nodes), node);
  });
  assert.equal(teamProgress(0, 2000, 4400, 6), 0);
  assert.equal(teamProgress(9000, 2000, 4400, 6), 5);
  assert.equal(teamProgress(2000, 2000, 0, 6), 0);
});

test('camera glides continuously through every zigzag without overshooting', () => {
  for (let i = 0; i < 5; i++) {
    const a = nodes[i], b = nodes[i + 1];
    const halfway = teamCamera(i + .5, nodes);
    assert.equal(halfway.x, (a.x + b.x) / 2);
    assert.equal(halfway.z, (a.z + b.z) / 2);
    for (let step = 0; step <= 100; step++) {
      const pose = teamCamera(i + step / 100, nodes);
      assert.ok(Object.values(pose).every(Number.isFinite));
      assert.ok(pose.x >= Math.min(a.x, b.x) && pose.x <= Math.max(a.x, b.x));
      assert.ok(pose.z >= b.z && pose.z <= a.z);
    }
    const before = teamCamera(i + 1 - .00001, nodes);
    const after = teamCamera(i + 1 + .00001, nodes);
    assert.ok(Math.abs(before.x - after.x) < .001);
    assert.ok(Math.abs(before.yaw - after.yaw) < .01);
  }
});

test('a floor path ends at the following pedestal in CSS floor coordinates', () => {
  for (let i = 0; i < nodes.length - 1; i++) {
    const path = teamPath(nodes[i], nodes[i + 1]);
    const radians = path.angle * Math.PI / 180;
    assert.ok(Math.abs(nodes[i].x + Math.cos(radians) * path.length - nodes[i + 1].x) < .00001);
    assert.ok(Math.abs(nodes[i].z - Math.sin(radians) * path.length - nodes[i + 1].z) < .00001);
  }
});

test('render window keeps at most three consecutive stops mounted in the scene', () => {
  assert.deepEqual(teamWindow(0, 6), { first: 0, last: 2 });
  assert.deepEqual(teamWindow(1.7, 6), { first: 1, last: 3 });
  assert.deepEqual(teamWindow(4.8, 6), { first: 4, last: 5 });
  assert.deepEqual(teamWindow(5, 6), { first: 5, last: 5 });
  for (let progress = -1; progress < 7; progress += .01) {
    const { first, last } = teamWindow(progress, 6);
    assert.ok(first >= 0 && last < 6 && last - first < 3);
  }
});
