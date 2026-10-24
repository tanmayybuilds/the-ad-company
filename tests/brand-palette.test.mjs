import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('V4 shows the supplied logo in both landmarks without a theme chooser', async () => {
  const base = '/the-ad-company/';
  const server = await createServer({ base, server: { middlewareMode: true, watch: null, hmr: false, ws: false }, appType: 'custom' });
  try {
    const { App } = await server.ssrLoadModule('/src/main.tsx');
    const markup = renderToStaticMarkup(createElement(App));
    for (const tag of ['header', 'footer']) {
      const start = tag === 'header' ? markup.indexOf('<header ') : markup.lastIndexOf('<footer ');
      const section = markup.slice(start, markup.indexOf(`</${tag}>`, start));
      assert.ok(section.includes(`src="${base}brand/logo.svg"`), `${tag} needs the supplied brand artwork`);
      assert.ok(section.includes('alt="The Ad Company"'));
    }
    assert.ok(!markup.includes('name="website-theme"'), 'The chosen theme must be fixed');
  } finally { await server.close(); }
});

test('the fixed palette preserves text and button contrast on page, card, teal and gold surfaces', () => {
  const css = postcss.parse(readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8'));
  const tokens = new Map();
  css.walkRules(':root', rule => rule.walkDecls(declaration => tokens.set(declaration.prop, declaration.value)));
  function color(token) {
    const value = tokens.get(token);
    assert.ok(value, `Missing palette role: ${token}`);
    const alias = value.match(/^var\((--[\w-]+)\)$/);
    if (alias) return color(alias[1]);
    assert.match(value, /^#[0-9a-f]{6}$/i, `Expected an sRGB brand color for ${token}`);
    return value;
  }
  function luminance(hex) {
    const rgb = hex.slice(1).match(/../g).map(channel => parseInt(channel, 16) / 255).map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
    return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
  }
  for (const [foreground, background] of [
    ['--on-inverse', '--brand'], ['--on-accent', '--gold'],
    ['--ink', '--paper'], ['--ink', '--sand'],
    ['--muted-foreground', '--paper'], ['--muted-foreground', '--sand'],
    ['--signal', '--paper'], ['--signal', '--sand'],
    ['--on-inverse', '--inverse'], ['--inverse-muted', '--inverse-card'],
    ['--gold', '--inverse-card'],
  ]) {
    const [light, dark] = [luminance(color(foreground)), luminance(color(background))].sort((a, b) => b - a);
    assert.ok((light + .05) / (dark + .05) >= 4.5, `${foreground} must remain readable on ${background}`);
  }
});
