import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export function checkBuild(directory = 'dist') {
  const root = resolve(directory);
  const pages = ['index.html', 'gallery.html'];
  const assets = new Set();
  if (!existsSync(resolve(root, '.nojekyll'))) throw new Error('Missing GitHub Pages .nojekyll marker');
  for (const page of pages) {
    const source = resolve(root, page);
    if (!existsSync(source)) throw new Error(`Missing built page: ${page}`);
    const html = readFileSync(source, 'utf8');
    if (!/<script\b[^>]*type="module"/.test(html)) throw new Error(`Missing module entry: ${page}`);
    if (!/<meta\b[^>]*name="viewport"/.test(html)) throw new Error(`Missing mobile viewport: ${page}`);
    for (const [, value] of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
      if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(value)) continue;
      const path = resolve(root, decodeURIComponent(value.split(/[?#]/)[0]).replace(/^\//, ''));
      if (!path.startsWith(root + sep) || !existsSync(path) || !statSync(path).isFile()) throw new Error(`Missing or invalid asset in ${page}: ${value}`);
      assets.add(path);
    }
  }
  return { pages, assets: assets.size };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = checkBuild(process.argv[2]);
  console.log(`Verified ${result.pages.length} built pages and ${result.assets} referenced assets.`);
}
