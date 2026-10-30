import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import postcss from 'postcss';

test('reduced-motion team layout releases the fixed mobile scene height for the full roster', () => {
  const css = postcss.parse(readFileSync(new URL('../src/components/site/team-tour.css', import.meta.url), 'utf8'));
  let reset;
  css.walkAtRules('media', media => {
    if (!media.params.includes('prefers-reduced-motion: reduce') || !media.params.includes('print')) return;
    media.walkRules('.team-scene', rule => rule.walkDecls('height', declaration => { reset = declaration.value; }));
  });
  assert.equal(reset, 'auto', 'Five readable profile cards must reserve their full height instead of overlapping Contact');
});
