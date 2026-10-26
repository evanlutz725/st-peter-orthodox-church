import { mkdir, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = path.join(root, 'public', 'assets');
const fonts = path.join(assets, 'fonts');

// Latin subsets served by the official Google Fonts CSS API, pinned to their
// versioned CDN URLs. All fonts retain their upstream SIL Open Font License.
const downloads = [
  ['lora-latin-normal.woff2', 'https://fonts.gstatic.com/s/lora/v37/0QIvMX1D_JOuMwr7Iw.woff2'],
  ['lora-latin-italic.woff2', 'https://fonts.gstatic.com/s/lora/v37/0QIhMX1D_JOuMw_LIftL.woff2'],
  ['dm-sans-latin-normal.woff2', 'https://fonts.gstatic.com/s/dmsans/v17/rP2Yp2ywxg089UriI5-g4vlH9VoD8Cmcqbu0-K4.woff2'],
  ['Lora-OFL.txt', 'https://raw.githubusercontent.com/google/fonts/main/ofl/lora/OFL.txt'],
  ['DM-Sans-OFL.txt', 'https://raw.githubusercontent.com/google/fonts/main/ofl/dmsans/OFL.txt'],
];

await mkdir(fonts, { recursive: true });
for (const [name, url] of downloads) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Unable to fetch ${name}: HTTP ${response.status}`);
  const data = Buffer.from(await response.arrayBuffer());
  if (name.endsWith('.woff2') && data.toString('ascii', 0, 4) !== 'wOF2') {
    throw new Error(`Invalid WOFF2 response for ${name}`);
  }
  if (name.endsWith('.txt') && !data.toString('utf8').includes('SIL OPEN FONT LICENSE')) {
    throw new Error(`Invalid license response for ${name}`);
  }
  await writeFile(path.join(fonts, name), data);
  console.log(`${name}: ${data.length.toLocaleString('en-US')} bytes`);
}

await writeFile(path.join(fonts, 'SOURCES.txt'), [
  'Self-hosted Latin font subsets. Downloaded from the official Google Fonts CDN.',
  'Lora: normal and italic variable 500-700.',
  'DM Sans: normal variable 400-700.',
  'Font licenses are included in the adjacent OFL files.',
  '',
  ...downloads.map(([name, url]) => `${name}\n${url}\n`),
].join('\n'));

// Generate derivatives from the original files to avoid recompressing WebP.
for (const [name, source, widths] of [
  ['church', 'church.jpg', [640, 960, 1280]],
  ['interior', 'interior.jpeg', [480, 768]],
]) {
  for (const width of widths) {
    const destination = path.join(assets, `${name}-${width}.webp`);
    const info = await sharp(path.join(assets, source))
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 80, effort: 6 })
      .toFile(destination);
    const { size } = await stat(destination);
    console.log(`${path.basename(destination)}: ${info.width} x ${info.height}, ${size.toLocaleString('en-US')} bytes`);
  }
}
