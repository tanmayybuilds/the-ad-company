import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { SEQUENCE_CLIPS, TOTAL_FRAMES, TRANSITION_FRAMES, ZONE_STARTS } from '../src/lib/service-sequence.mjs';

const sources = process.argv[2];
assert.ok(sources, 'Usage: node scripts/prepare-service-sequence.mjs <source-video-directory>');
const output = fileURLToPath(new URL('../public/frames/services-v2/', import.meta.url));
assert.ok(!existsSync(output), 'Output already exists; keep it or explicitly remove it before regenerating.');
const fps = 24, width = 1080, height = 608;
const run = (command, args) => {
  const result = spawnSync(command, args, { encoding: 'utf8', windowsHide: true, maxBuffer: 4 * 1024 * 1024 });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `${command} failed: ${result.stderr}`);
  return result.stdout;
};
const clips = SEQUENCE_CLIPS.map(clip => {
  const path = resolve(sources, clip.source);
  assert.ok(existsSync(path), `Missing source: ${clip.source}`);
  const info = JSON.parse(run('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=nb_frames,r_frame_rate', '-of', 'json', path])).streams[0];
  assert.equal(Number(info?.nb_frames), clip.frames, `${clip.source}: unexpected frame count`);
  assert.equal(info.r_frame_rate, `${fps}/1`, `${clip.source}: unexpected frame rate`);
  return { ...clip, sha256: createHash('sha256').update(readFileSync(path)).digest('hex') };
});

const staging = mkdtempSync(join(tmpdir(), 'ad-company-service-frames-'));
const frame = index => join(staging, `frame_${String(index + 1).padStart(4, '0')}.webp`);
const encode = ['-an', '-c:v', 'libwebp', '-quality', '80', '-compression_level', '4', '-threads', '2'];
try {
  for (const [index, clip] of clips.entries()) {
    console.log(`Extracting ${clip.source} (${clip.frames} frames)`);
    run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', resolve(sources, clip.source), '-vf', `scale=${width}:${height}:flags=lanczos,setsar=1`, '-fps_mode', 'passthrough', ...encode, '-frames:v', String(clip.frames), '-start_number', String(ZONE_STARTS[index] + 1), join(staging, 'frame_%04d.webp')]);
  }
  for (let index = 1; index < clips.length; index++) {
    const start = ZONE_STARTS[index], previous = start - TRANSITION_FRAMES - 1;
    // Hold the two endpoints while dissolving so none of either clip's animation is trimmed.
    const t = `(N/${TRANSITION_FRAMES + 1})`, alpha = `(${t}*${t}*(3-2*${t}))`;
    const blend = `[0:v]format=gbrp[a];[1:v]format=gbrp[b];[a][b]blend=all_expr='A*(1-${alpha})+B*${alpha}',format=yuv420p`;
    run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-loop', '1', '-framerate', String(fps), '-i', frame(previous), '-loop', '1', '-framerate', String(fps), '-i', frame(start), '-filter_complex', blend, ...encode, '-frames:v', String(TRANSITION_FRAMES), '-start_number', String(start - TRANSITION_FRAMES + 1), join(staging, 'frame_%04d.webp')]);
    console.log(`Dissolve ${index}: ${TRANSITION_FRAMES} frames`);
  }
  const files = readdirSync(staging);
  assert.equal(files.length, TOTAL_FRAMES);
  for (let index = 0; index < TOTAL_FRAMES; index++) assert.ok(existsSync(frame(index)), `Missing frame ${index + 1}`);
  writeFileSync(join(staging, 'manifest.json'), JSON.stringify({ fps, width, height, transitionFrames: TRANSITION_FRAMES, totalFrames: TOTAL_FRAMES, clips }, null, 2) + '\n');
  mkdirSync(dirname(output), { recursive: true });
  renameSync(staging, output);
  console.log(`Prepared ${TOTAL_FRAMES} frames in ${output}`);
} finally {
  // Only remove this script's uniquely created temporary directory.
  rmSync(staging, { recursive: true, force: true });
}
