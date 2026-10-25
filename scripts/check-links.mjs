import { readdir, readFile, access, stat } from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';
const root=path.resolve('dist');
async function walk(dir){const out=[];for(const f of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,f.name);if(f.isDirectory())out.push(...await walk(p));else out.push(p);}return out;}
const files=await walk(root), errors=[];let links=0;let maxInlineBytes=0;
for(const file of files.filter(f=>f.endsWith('.html'))){
  const html=await readFile(file,'utf8');const $=cheerio.load(html);
  const inlineBytes=$('script:not([src]):not([type="application/ld+json"])').toArray().reduce((sum,e)=>sum+Buffer.byteLength($(e).html()||''),0);
  maxInlineBytes=Math.max(maxInlineBytes,inlineBytes);
  if($('h1').length!==1)errors.push(`${path.relative(root,file)}: expected one h1, got ${$('h1').length}`);
  for(const el of $('a[href],img[src],script[src],link[rel=stylesheet]').toArray()){
    const href=$(el).attr('href')||$(el).attr('src');
    if(!href||!href.startsWith('/')||href.startsWith('//'))continue;
    const [pathname]=href.split(/[?#]/);const target=path.resolve(root,'.'+decodeURIComponent(pathname));
    if(!target.startsWith(root+path.sep)&&target!==root){errors.push(`${file}: invalid path ${href}`);continue;}
    try{const info=await stat(target);if(info.isDirectory())await access(path.join(target,'index.html'));links++;}catch{errors.push(`${path.relative(root,file)}: missing ${href}`);}
  }
  if(/Lorem ipsum|admin-ajax\.php|wpcf7/.test(html))errors.push(`${path.relative(root,file)}: legacy placeholder or form runtime`);
}
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
const js=files.filter(f=>f.endsWith('.js'));let jsBytes=0;for(const f of js)jsBytes+=(await stat(f)).size;
console.log(`Checked ${files.filter(f=>f.endsWith('.html')).length} pages and ${links} internal links/assets. No broken internal paths. External client JavaScript: ${jsBytes} bytes; maximum inline application JavaScript per page: ${maxInlineBytes} bytes.`);
