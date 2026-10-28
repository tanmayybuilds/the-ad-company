import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { TOTAL_FRAMES, ZONE_STARTS } from '../src/lib/service-sequence.mjs';

test('refresh restores the expanding client strip before Services and reserves Services space before Coverage', async () => {
  const names = ['window', 'document', 'ResizeObserver', 'IntersectionObserver', 'requestAnimationFrame', 'cancelAnimationFrame', 'getComputedStyle', '__pins'];
  const originals = Object.fromEntries(names.map(name => [name, globalThis[name]]));
  const triggers = [];
  let current, sortRequired = false, serviceSpace = 0, brandSpace = 0;
  const naturalTop = { brands: 300, services: 1000, coverage: 4000 };
  const section = kind => Object.assign(new EventTarget(), { kind, dataset: {}, querySelectorAll: () => [], previousElementSibling: null,
    getBoundingClientRect: () => ({ top: naturalTop[kind] + (kind === 'brands' ? 0 : brandSpace) + (kind === 'coverage' ? serviceSpace : 0) }),
  });
  globalThis.window = Object.assign(new EventTarget(), { innerHeight: 1000, innerWidth: 1440, scrollY: 0 });
  globalThis.document = window.document = { body: { style: { overflow: '' } } };
  globalThis.ResizeObserver = globalThis.IntersectionObserver = class { observe() {} disconnect() {} };
  globalThis.requestAnimationFrame = () => 1;
  globalThis.cancelAnimationFrame = () => {};
  globalThis.getComputedStyle = () => ({ getPropertyValue: () => '88' });
  const refresh = () => {
    // GSAP sorts by priority then document position, reverts layout, and restores animations in that order.
    if (sortRequired) triggers.sort((a, b) => (b.vars.refreshPriority || 0) * 1e6 - (a.vars.refreshPriority || 0) * 1e6 + a.vars.trigger.getBoundingClientRect().top - b.vars.trigger.getBoundingClientRect().top);
    serviceSpace = 0;
    brandSpace = 0;
    for (const trigger of triggers) {
      trigger.vars.onRefreshInit?.();
      if (trigger.vars.trigger.kind === 'brands') { brandSpace = 500; continue; }
      const services = trigger.vars.trigger.kind === 'services';
      trigger.start = services ? 1000 + brandSpace - 88 : 4000 + brandSpace + serviceSpace - 80;
      trigger.end = trigger.start + Number(trigger.vars.end().slice(2));
      if (services) serviceSpace = trigger.end - trigger.start;
      trigger.vars.onRefresh?.(trigger);
    }
  };
  globalThis.__pins = {
    useRef: value => { const ref = { current: value }; current.refs.push(ref); return ref; },
    useState: value => [current.states++ === 2 ? current.fits : value, () => {}],
    useGSAP: callback => { current.setup = callback; },
    gsap: {
      matchMedia: () => {
        let cleanup;
        return { add: (_, callback) => { cleanup = callback({ conditions: { motion: true, desktop: true, tall: true, reduce: false, fine: false } }); }, revert: () => cleanup?.() };
      },
      quickTo: () => () => {}, killTweensOf() {},
    },
    ScrollTrigger: {
      create: vars => {
        if ('refreshPriority' in vars) sortRequired = true;
        const trigger = { vars, progress: 0, isActive: false, direction: 1,
          kill() { triggers.splice(triggers.indexOf(trigger), 1); },
        };
        triggers.push(trigger);
        return trigger;
      }, refresh, update() {},
    },
  };
  const server = await createServer({
    server: { middlewareMode: true, watch: null, hmr: false, ws: false }, appType: 'custom',
    plugins: [{ name: 'pin-lifecycle-test', enforce: 'pre',
      resolveId(id) { if (id.startsWith('virtual:pin-')) return `\0${id}`; },
      load(id) {
        if (id === '\0virtual:pin-hooks') return `export const { useRef, useState } = globalThis.__pins; export const useEffect = () => {}; export const useCallback = fn => fn;`;
        if (id === '\0virtual:pin-motion') return `export const { gsap, ScrollTrigger, useGSAP } = globalThis.__pins; export const MQ = {}; export const MOTION = { services: { scrollDistanceDesktop: 22 / 1.3, scrollDistanceMobile: 16 / 1.3 } };`;
      },
      transform(code, id) {
        if (/\/site\/(Services|CoverflowCoverage)\.tsx$/.test(id.replaceAll('\\', '/'))) return code.replace('from "react"', 'from "virtual:pin-hooks"').replace('from "@/lib/motion"', 'from "virtual:pin-motion"');
      },
    }],
  });
  try {
    const { Services } = await server.ssrLoadModule('/src/components/site/Services.tsx');
    const { CoverflowCoverage } = await server.ssrLoadModule('/src/components/site/CoverflowCoverage.tsx');
    const mount = (Component, kind, fits) => {
      current = { refs: [], states: 0, fits };
      renderToStaticMarkup(createElement(Component));
      current.refs[0].current = section(kind);
      current.refs[1].current = section(kind);
      if (kind === 'services') {
        current.refs[2].current = { offsetHeight: 600 };
        current.refs[9].current = () => {};
      }
      return current.setup();
    };
    // The client strip changes page height; its scrubbed expansion is restored during its refresh.
    const brands = { vars: { trigger: section('brands') } };
    triggers.push(brands);
    // Services initially has no pin while fit measurement is pending; Coverage registers first.
    mount(Services, 'services', false)();
    const coverageCleanup = mount(CoverflowCoverage, 'coverage', true);
    refresh();
    assert.equal(triggers[1].start, 4420);
    for (let visit = 0; visit < 3; visit++) {
      const serviceCleanup = mount(Services, 'services', true);
      refresh();
      const services = triggers.find(t => t.vars.trigger.kind === 'services');
      const coverage = triggers.find(t => t.vars.trigger.kind === 'coverage');
      assert.equal(services.start, 1412, 'Services must measure after the client strip restores its expanded height');
      assert.ok(coverage.start > services.end, `Coverage starts at ${coverage.start} inside Services (${services.start}–${services.end})`);
      const corporate = services.start + ZONE_STARTS[1] / (TOTAL_FRAMES - 1) * (services.end - services.start);
      assert.ok(corporate < coverage.start);
      assert.equal(coverage.start, 21343);
      // A subsequent resize/accordion refresh must preserve both ranges and their complete order.
      refresh();
      assert.equal(coverage.start, 21343);
      assert.equal(services.start, 1412, 'Repeated refresh must not move the Services pin to its compact-header position');
      serviceCleanup();
      refresh();
      assert.equal(triggers.length, 2);
      assert.equal(coverage.start, 4420, 'Removing an upstream pin must not leave a blank spacer');
    }
    coverageCleanup();
    assert.deepEqual(triggers, [brands]);
  } finally { await server.close(); Object.assign(globalThis, originals); }
});
