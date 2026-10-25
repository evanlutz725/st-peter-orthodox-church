import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';

const root = path.resolve('dist');
const errors = [];
const pages = new Map();
const canonicalPages = new Map();
let links = 0;
let images = 0;
let maxInlineBytes = 0;

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    files.push(...(entry.isDirectory() ? await walk(file) : [file]));
  }
  return files;
}

const files = await walk(root);
for (const file of files.filter(file => file.endsWith('.html'))) {
  const html = await readFile(file, 'utf8');
  const $ = cheerio.load(html);
  const relative = path.relative(root, file).split(path.sep).join('/');
  const pathname = `/${relative.replace(/(^|\/)index\.html$/, '$1')}`;
  const canonical = $('link[rel="canonical"]').attr('href');
  let base;
  try { base = new URL(canonical); } catch { base = new URL(pathname, 'https://local.invalid'); }
  pages.set(file, { $, html, relative, pathname, base });
}

function fail(page, message) {
  errors.push(`${page.relative}: ${message}`);
}

function accessibleName($, element) {
  const node = $(element);
  if (node.attr('aria-label')?.trim()) return node.attr('aria-label').trim();
  const references = (node.attr('aria-labelledby') || '').split(/\s+/).filter(Boolean);
  if (references.length) {
    return references.map(id => $('[id]').filter((_, item) => $(item).attr('id') === id).text()).join(' ').trim();
  }
  const copy = node.clone();
  copy.find('[aria-hidden="true"]').remove();
  return `${copy.text()} ${copy.find('img').toArray().map(image => $(image).attr('alt') || '').join(' ')}`.trim();
}

async function checkLocalReference(page, reference) {
  if (!reference || reference.startsWith('data:')) return;
  let url;
  try { url = new URL(reference, new URL(page.pathname, page.base.origin)); }
  catch { fail(page, `invalid URL ${reference}`); return; }
  if (!['http:', 'https:'].includes(url.protocol) || url.origin !== page.base.origin) return;
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); }
  catch { fail(page, `invalid URL encoding ${reference}`); return; }
  let target = path.resolve(root, `.${pathname}`);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
    fail(page, `path leaves the build directory: ${reference}`);
    return;
  }
  try {
    if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html');
    await stat(target);
    links++;
  } catch {
    fail(page, `missing local link or asset ${reference}`);
    return;
  }
  if (url.hash && pages.has(target)) {
    let fragment;
    try { fragment = decodeURIComponent(url.hash.slice(1)); }
    catch { fail(page, `invalid fragment encoding ${reference}`); return; }
    const targetPage = pages.get(target);
    const matches = targetPage.$('[id],a[name]').filter((_, item) =>
      targetPage.$(item).attr('id') === fragment || targetPage.$(item).attr('name') === fragment
    );
    if (!matches.length) fail(page, `missing fragment target ${reference}`);
  }
}

for (const page of pages.values()) {
  const { $, html } = page;
  if (!$('html').attr('lang')?.trim()) fail(page, 'missing document language');
  if ($('main').length !== 1) fail(page, `expected one main landmark, got ${$('main').length}`);
  if ($('h1').length !== 1) fail(page, `expected one h1, got ${$('h1').length}`);
  if (!$('title').text().trim()) fail(page, 'missing page title');
  if (!$('meta[name="description"]').attr('content')?.trim()) fail(page, 'missing meta description');
  if (!$('meta[name="viewport"]').attr('content')?.includes('width=device-width')) fail(page, 'missing responsive viewport');

  const canonical = $('link[rel="canonical"]');
  if (canonical.length !== 1 || !/^https:\/\//.test(canonical.attr('href') || '')) {
    fail(page, 'expected one absolute HTTPS canonical URL');
  } else {
    const url = canonical.attr('href');
    if (canonicalPages.has(url)) fail(page, `canonical URL also used by ${canonicalPages.get(url)}`);
    canonicalPages.set(url, page.relative);
  }
  for (const property of ['og:title', 'og:description', 'og:image', 'og:url']) {
    if (!$(`meta[property="${property}"]`).attr('content')?.trim()) fail(page, `missing ${property}`);
  }

  const ids = new Set();
  $('[id]').each((_, element) => {
    const id = $(element).attr('id');
    if (ids.has(id)) fail(page, `duplicate id ${id}`);
    ids.add(id);
  });
  $('[aria-controls],[aria-labelledby],[aria-describedby]').each((_, element) => {
    for (const name of ['aria-controls', 'aria-labelledby', 'aria-describedby']) {
      for (const id of ($(element).attr(name) || '').split(/\s+/).filter(Boolean)) {
        if (!ids.has(id)) fail(page, `${name} references missing id ${id}`);
      }
    }
  });

  let previousHeading = 0;
  $('main h1,main h2,main h3,main h4,main h5,main h6').each((_, element) => {
    const level = Number(element.tagName.slice(1));
    if (previousHeading && level > previousHeading + 1) fail(page, `heading skips h${previousHeading} to h${level}: ${$(element).text().slice(0,70)}`);
    previousHeading = level;
  });

  $('a[href],button').each((_, element) => {
    const node = $(element);
    if (!accessibleName($, element)) fail(page, `unnamed ${element.tagName}: ${node.attr('href') || ''}`);
    if (node.attr('href') === '#' || node.attr('href') === '') fail(page, 'placeholder link');
    if (node.attr('target') === '_blank' && !/\bnoopener\b/.test(node.attr('rel') || '')) fail(page, `new-window link lacks noopener: ${node.attr('href')}`);
  });
  $('input:not([type="hidden"]),select,textarea').each((_, element) => {
    const node = $(element);
    const id = node.attr('id');
    const labels = $('label[for]').filter((_, label) => id && $(label).attr('for') === id);
    if (!node.attr('aria-label') && !node.attr('aria-labelledby') && !node.closest('label').length && !labels.length) {
      fail(page, `unlabelled form field ${id || element.tagName}`);
    }
  });
  $('iframe').each((_, element) => {
    if (!$(element).attr('title')?.trim()) fail(page, 'iframe lacks a title');
  });
  $('img').each((_, element) => {
    images++;
    const node = $(element);
    if (node.attr('alt') === undefined) fail(page, `image lacks alt attribute: ${node.attr('src')}`);
    if (!(Number(node.attr('width')) > 0 && Number(node.attr('height')) > 0)) fail(page, `image lacks intrinsic dimensions: ${node.attr('src')}`);
  });
  $('script[type="application/ld+json"]').each((_, element) => {
    try { JSON.parse($(element).html()); }
    catch { fail(page, 'invalid JSON-LD'); }
  });
  $('[href],[src]').each((_, element) => {
    for (const attribute of ['href', 'src']) {
      const value = $(element).attr(attribute);
      if (value && /^\s*(javascript|vbscript):/i.test(value)) fail(page, `unsafe ${attribute} protocol`);
      if (attribute === 'src' && value?.startsWith('http:')) fail(page, `insecure embedded asset ${value}`);
    }
  });
  for (const element of $('a[href],img[src],script[src],link[href]:not([rel="canonical"]),source[src],audio[src],video[src],iframe[src]').toArray()) {
    await checkLocalReference(page, $(element).attr('href') || $(element).attr('src'));
  }
  for (const element of $('[srcset]').toArray()) {
    for (const candidate of $(element).attr('srcset').split(',')) {
      const reference = candidate.trim().split(/\s+/)[0];
      await checkLocalReference(page, reference);
    }
  }
  for (const element of $('video[poster]').toArray()) {
    await checkLocalReference(page, $(element).attr('poster'));
  }
  for (const element of $('style').toArray()) {
    for (const match of ($(element).html() || '').matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
      await checkLocalReference(page, match[1].trim());
    }
  }
  if (/Lorem ipsum|admin-ajax\.php|wpcf7/.test(html)) fail(page, 'legacy placeholder or form runtime');
  const inlineBytes = $('script:not([src]):not([type="application/ld+json"])').toArray()
    .reduce((sum, element) => sum + Buffer.byteLength($(element).html() || ''), 0);
  maxInlineBytes = Math.max(maxInlineBytes, inlineBytes);
}

// Font-face sources and CSS background images are not HTML elements. Resolve
// their URLs relative to each built stylesheet to catch missing deploy assets.
for (const file of files.filter(file => file.endsWith('.css'))) {
  const relative = path.relative(root, file).split(path.sep).join('/');
  const page = { relative, pathname: `/${relative}`, base: pages.values().next().value.base };
  for (const match of (await readFile(file, 'utf8')).matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
    await checkLocalReference(page, match[1].trim());
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
let jsBytes = 0;
for (const file of files.filter(file => file.endsWith('.js'))) jsBytes += (await stat(file)).size;
console.log(`Checked ${pages.size} pages, ${links} local links/assets/fragments, and ${images} images.`);
console.log('Passed: local paths and fragments, metadata, landmarks, heading order, accessible names, image dimensions, iframe titles, JSON-LD, and link safety.');
console.log(`Built client JavaScript files: ${jsBytes} bytes; maximum inline application JavaScript per page: ${maxInlineBytes} bytes.`);
console.log('Scope: static HTML checks. External service availability, visual layout, contrast, keyboard behavior, and assistive technology require separate browser QA.');
