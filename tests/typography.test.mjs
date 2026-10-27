import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const approved = ['Outfit', 'General Sans', 'Satoshi', 'RX100', 'Rajdhani', 'Sora', 'Zodiak', 'Kalam'];

test('the typography system serves only the eight selected families with real local webfonts and licenses', async () => {
  const css = await readFile(new URL('src/fonts.css', root), 'utf8');
  const faces = [...css.matchAll(/@font-face\s*\{([^}]+)\}/g)].map(match => match[1]);
  assert.deepEqual(new Set(faces.map(face => face.match(/font-family:\s*['"]([^'"]+)/)[1])), new Set(approved));
  for (const face of faces) {
    assert.match(face, /font-display:\s*swap/);
    const relativePath = face.match(/url\(['"]?\/([^)'"\s]+)/)[1];
    const bytes = await readFile(new URL(`public/${relativePath}`, root));
    assert.equal(bytes.subarray(0, 4).toString(), 'wOF2', `${relativePath} must contain a real WOFF2 font`);
  }
  assert.equal((await readdir(new URL('public/fonts/licenses/', root))).length, 8);
  const html = await readFile(new URL('index.html', root), 'utf8');
  assert.doesNotMatch(html, /fonts\.googleapis|fonts\.gstatic|Syne|JetBrains|Jakarta/);
  assert.equal([...html.matchAll(/rel="preload"[^>]+as="font"/g)].length, 2, 'Preload only the main heading and body faces');
});

test('legacy CSS and canvas typography cannot bypass the selected font system', async () => {
  async function sources(directory) {
    const files = [];
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory);
      if (entry.isDirectory()) files.push(...await sources(path));
      else if (/\.(tsx?|css)$/.test(entry.name)) files.push(path);
    }
    return files;
  }
  for (const path of await sources(new URL('src/', root))) {
    const source = await readFile(path, 'utf8');
    assert.doesNotMatch(source, /["'](?:Syne|Plus Jakarta Sans|JetBrains Mono|Arial Black|Inter|Space Mono)["']/, path.pathname);
  }
  const theme = await readFile(new URL('src/styles.css', root), 'utf8');
  for (const family of approved) assert.ok(theme.includes(`"${family}"`), `${family} needs a named typography role`);
});
