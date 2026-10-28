import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, renameSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { SEQUENCE_FPS, TOTAL_FRAMES } from '../src/lib/service-sequence.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const staging = mkdtempSync(join(tmpdir(), 'ad-company-web-media-'));
const run = (name, args) => {
  const result = spawnSync(name, args, { encoding: 'utf8', windowsHide: true, maxBuffer: 2 * 1024 * 1024 });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `${name}: ${result.stderr}`);
  return result.stdout;
};
const info = path => JSON.parse(run('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=nb_frames', '-of', 'json', path])).streams[0];
const prepared = [];
const encode = (relative, args, frames, budget) => {
  const output = join(staging, relative.split('/').at(-1));
  run('ffmpeg', ['-hide_banner', '-loglevel', 'error', ...args, output]);
  assert.ok(statSync(output).size < budget, `Transfer budget exceeded: ${relative}`);
  if (frames) {
    assert.equal(Number(info(output).nb_frames), frames, `Frame count changed: ${relative}`);
    const bytes = readFileSync(output);
    assert.ok(bytes.indexOf(Buffer.from('moov')) < bytes.indexOf(Buffer.from('mdat')), `Missing fast-start metadata: ${relative}`);
  }
  prepared.push([output, join(root, 'public', relative)]);
  console.log(`${relative}: ${statSync(output).size} bytes`);
};
try {
  const sequence = join(root, 'public/frames/services-v2/frame_%04d.webp');
  for (const [variant, size, quality, budget] of [['desktop', '960:540', 27, 12_000_000], ['mobile', '640:360', 28, 6_000_000]]) {
    encode(`videos/services-v3-${variant}.mp4`, ['-framerate', String(SEQUENCE_FPS), '-i', sequence, '-vf', `scale=${size}:flags=lanczos`, '-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', String(quality), '-g', '12', '-keyint_min', '12', '-sc_threshold', '0', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'], TOTAL_FRAMES, budget);
  }
  for (const index of [1, 2, 3]) {
    const name = `Card_0${index}`, source = join(root, `public/videos/${name}_New.mp4`);
    encode(`videos/${name}-web.mp4`, ['-i', source, '-vf', 'scale=1280:720:flags=lanczos', '-c:v', 'libx264', '-preset', 'fast', '-crf', '26', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart'], Number(info(source).nb_frames), 6_000_000);
    encode(`videos/${name}-poster.webp`, ['-i', source, '-vf', 'scale=640:360:flags=lanczos', '-frames:v', '1', '-quality', '75', '-update', '1'], 0, 50_000);
  }
  for (const [name, options] of [['jg-pednekar', ['-quality', '90']], ['apollo-diagnostics', ['-lossless', '1']]]) {
    encode(`clients/${name}.webp`, ['-i', join(root, `public/clients/${name}.png`), '-c:v', 'libwebp', ...options, '-compression_level', '6', '-frames:v', '1', '-update', '1'], 0, 64_000);
  }
  for (const [, destination] of prepared) assert.ok(!existsSync(destination), `Output already exists: ${destination}; preserve or explicitly remove it before regenerating.`);
  for (const [output, destination] of prepared) renameSync(output, destination);
} finally {
  // Only remove the unique temporary directory created by this invocation.
  rmSync(staging, { recursive: true, force: true });
}
