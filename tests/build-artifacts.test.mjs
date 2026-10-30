import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkBuild } from '../scripts/check-build.mjs';

function fixture(run) {
  const root = mkdtempSync(join(tmpdir(), 'ad-company-build-'));
  try {
    mkdirSync(join(root, 'assets'));
    writeFileSync(join(root, 'assets/app.js'), 'export {};');
    writeFileSync(join(root, 'assets/app.css'), 'body{}');
    writeFileSync(join(root, '.nojekyll'), '');
    for (const page of ['index.html', 'gallery.html']) writeFileSync(join(root, page), '<meta name="viewport" content="width=device-width, initial-scale=1"><link href="./assets/app.css" rel="stylesheet"><script type="module" src="./assets/app.js"></script>');
    run(root);
  } finally { rmSync(root, { recursive: true, force: true }); }
}

test('both static entries resolve real assets independently of the hosting subdirectory', () => fixture(root => {
  const result = checkBuild(root);
  assert.deepEqual(result.pages, ['index.html', 'gallery.html']);
  assert.equal(result.assets, 2);
}));

test('a missing bundle, missing gallery or missing Pages marker fails release validation', () => {
  for (const path of ['assets/app.js', 'gallery.html', '.nojekyll']) fixture(root => {
    rmSync(join(root, path));
    assert.throws(() => checkBuild(root), /Missing/);
  });
});
