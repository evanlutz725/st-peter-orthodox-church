import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import * as cheerio from 'cheerio';
import sharp from 'sharp';
import { normalizeArticleHeadings, labelArticleImageLinks } from './lib/article-headings.mjs';

const origin = 'https://stpeterorthodoxchurch.com';
await mkdir('src/data', { recursive: true });
await mkdir('public/assets/imported', { recursive: true });
const get = async (url) => {
  const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`${r.status}: ${url}`);
  return r;
};
const pages = await (await get(`${origin}/wp-json/wp/v2/pages?per_page=100&_fields=id,slug,link,title,content`)).json();
const posts = await (await get(`${origin}/wp-json/wp/v2/posts?per_page=6&_fields=id,date,slug,link,title,excerpt,content`)).json();
const slugs = ['what-we-are','our-story','our-clergy','sacraments','governing','the-creed','the-lords-prayer','akathists'];
const paths = new Map(slugs.map(s => [`/${s}/`, `/${s}/`]));
for (const [a,b] of Object.entries({about:'about',homepage:'',home:'',calendar:'calendar',homilies:'homilies',contact:'contact','new-to-the-area':'visit',newsletter:'news','category/news':'news',worship:'orthodoxy',glossary:'resources',podcasts:'resources','orthodox-arts':'resources','video-and-radio':'resources'})) paths.set(`/${a}/`, `/${b}${b?'/':''}`);
for (const p of posts) paths.set(new URL(p.link).pathname, `/news/${p.slug}/`);
const assets = new Map();
async function localImage(url) {
  if (assets.has(url)) return assets.get(url);
  const task = (async () => {
    try {
      const file = `/assets/imported/${createHash('sha256').update(url).digest('hex').slice(0,16)}.webp`;
      const bytes = Buffer.from(await (await get(url)).arrayBuffer());
      const { width, height } = await sharp(bytes).rotate().resize({ width:1200, withoutEnlargement:true }).webp({quality:78}).toFile(`public${file}`);
      return { src: file, width, height };
    } catch { return { src: url }; }
  })();
  assets.set(url, task);
  return task;
}
async function clean(html) {
  const $ = cheerio.load(html, null, false);
  $('script,style,nav,form,input,button,textarea,iframe,object,embed').remove();
  $('*').each((_,el) => { for (const name of Object.keys(el.attribs || {})) if (!['href','src','alt','width','height','colspan','rowspan','datetime'].includes(name)) $(el).removeAttr(name); });
  for (const el of $('a').toArray()) {
    const href = $(el).attr('href');
    if (!href) { $(el).replaceWith($(el).contents()); continue; }
    let u; try { u = new URL(href,origin); } catch { $(el).removeAttr('href'); continue; }
    if (!['http:','https:','tel:','mailto:'].includes(u.protocol)) { $(el).removeAttr('href'); continue; }
    if (u.hostname === new URL(origin).hostname) $(el).attr('href',paths.get(u.pathname) || u.href);
    if ($(el).attr('href')?.startsWith('http')) $(el).attr('rel','noopener');
  }
  for (const el of $('img').toArray()) {
    const src = $(el).attr('src');
    if (!src || /bible\.png|church\.png|roman\.png|Christian\.png/.test(src)) { $(el).remove(); continue; }
    const image = await localImage(new URL(src,origin).href);
    $(el).attr('src',image.src);
    if (image.width && image.height) $(el).attr({ width: image.width, height: image.height });
    $(el).attr('loading','lazy'); $(el).attr('decoding','async');
  }
  $('p,ul,li').each((_,el)=>{ if (!$(el).text().trim() && !$(el).find('img,a,br').length) $(el).remove(); });
  normalizeArticleHeadings($);
  $('h2').each((_,el) => {
    const heading = $(el).text();
    if (/Catechumen and Enquirers Class starts/.test(heading)) $(el).attr('id','parish-learning');
    if (/When You Give to the Good Samaritan Mercy Fund/.test(heading)) $(el).attr('id','parish-mercy');
  });
  labelArticleImageLinks($);
  return $.html().replace(/<!--[^]*?-->/g,'');
}
const plain = html => cheerio.load(html).text().replace(/\s+/g,' ').trim();
const content = [];
for (const slug of slugs) {
  const p = pages.find(p => p.slug === slug);
  if (!p) throw new Error(`Missing parish page: ${slug}`);
  content.push({slug,title:plain(p.title.rendered),source:p.link,html:await clean(p.content.rendered)});
}
const news = [];
for (const p of posts) {
  news.push({slug:p.slug,title:plain(p.title.rendered),date:p.date.slice(0,10),source:p.link,excerpt:plain(p.excerpt.rendered).replace(/\[.*?\]$/,'').slice(0,190),html:await clean(p.content.rendered)});
}
for (const name of ['church.jpg','interior.jpeg','who.png']) await sharp(await readFile(`public/assets/${name}`)).rotate().resize({width:1600,withoutEnlargement:true}).webp({quality:82}).toFile(`public/assets/${name.split('.')[0]}.webp`);
await writeFile('src/data/content.json', JSON.stringify(content,null,2)+'\n');
await writeFile('src/data/news.json', JSON.stringify(news,null,2)+'\n');
await writeFile('src/data/migration.json', JSON.stringify({importedAt:new Date().toISOString(),source:origin,pages:content.length,newsletters:news.length,assets:assets.size,notes:'Public parish content. Older newsletters and sermon media remain linked to the original archive. No WordPress runtime is required.'},null,2)+'\n');
console.log(`Imported ${content.length} pages, ${news.length} newsletters, ${assets.size} content images.`);
