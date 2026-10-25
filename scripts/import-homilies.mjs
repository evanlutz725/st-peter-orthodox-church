import { writeFile } from 'node:fs/promises';
import * as cheerio from 'cheerio';
// The parish's Apple Podcasts listing identifies this as its public RSS feed.
const feed='https://rss.libsyn.com/shows/548077/destinations/5263490.xml';
const response=await fetch(feed,{signal:AbortSignal.timeout(30000)});
if(!response.ok)throw new Error(`Podcast feed returned ${response.status}`);
const $=cheerio.load(await response.text(),{xmlMode:true});
const episodes=$('item').toArray().slice(0,6).map(el=>{
  const item=$(el);const audio=item.find('enclosure').attr('url');
  if(!audio||!audio.startsWith('https://'))throw new Error('Episode has no secure audio enclosure');
  return {title:item.find('title').first().text(),date:new Date(item.find('pubDate').text()).toISOString().slice(0,10),description:cheerio.load(item.find('description').text()).text().replace(/\s+/g,' ').trim().split('Date:')[0].slice(0,250),audio,url:item.find('link').first().text(),duration:item.find('itunes\\:duration').text()};
});
if(episodes.length===0)throw new Error('Podcast feed is empty');
await writeFile('src/data/homilies.json',JSON.stringify({feed,importedAt:new Date().toISOString(),episodes},null,2)+'\n');
console.log(`Imported ${episodes.length} homilies from the parish podcast.`);
