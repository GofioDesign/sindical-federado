import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('../', import.meta.url).pathname.replace(/^\/(.:)/, '$1');
const site = JSON.parse(await readFile(join(root, 'config/site.json'), 'utf8'));
const target = join(root, 'content/.generated');
const decode = (value='') => value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
const tag = (xml, name) => decode(xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'i'))?.[1] || '');

function parseRss(xml, source, limit) {
  return [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].slice(0, limit).map(([, item]) => ({ source, title: tag(item, 'title'), url: tag(item, 'link'), summary: tag(item, 'description'), date: new Date(tag(item, 'pubDate') || Date.now()).toISOString(), type: 'external' })).filter(item => item.title && /^https?:\/\//.test(item.url));
}

function parseSb(html, source, base, limit) {
  const seen = new Set(); const items = []; const months={ene:0,feb:1,mar:2,abr:3,may:4,jun:5,jul:6,ago:7,sep:8,oct:9,nov:10,dic:11};
  for (const match of html.matchAll(/<a[^>]+href=["'](noticia\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const url = new URL(match[1], base).href; if (seen.has(url)) continue; seen.add(url);
    const text = decode(match[2]).replace(/^(Portada|Destacada)\s+/i, '').replace(/^Noticia\s+[—-]?\s*/i, '');
    const dateMatch = text.match(/(\d{1,2})\s+(Ene|Feb|Mar|Abr|May|Jun|Jul|Ago|Sep|Oct|Nov|Dic)[a-z]*\s+(\d{4})/i);
    const date=dateMatch ? new Date(Date.UTC(Number(dateMatch[3]),months[dateMatch[2].slice(0,3).toLowerCase()],Number(dateMatch[1]))).toISOString() : new Date().toISOString();
    const title=text.replace(dateMatch?.[0] || '', '').replace(/\s*(Leer\s*→?|Sindicalistas de Base.*)$/i, '').trim();
    if (title.length > 12) items.push({source,title,url,summary:'Actualidad publicada por Sindicalistas de Base.',date,type:'external'});
    if (items.length >= limit) break;
  }
  return items;
}

const collected=[]; const errors=[];
for (const feed of site.feeds.filter(f => f.enabled)) {
  try {
    const response=await fetch(feed.url,{headers:{'user-agent':'SindicalFederado/0.2 (+https://github.com/GofioDesign/sindical-federado)'},signal:AbortSignal.timeout(15000)});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text=await response.text(); collected.push(...(feed.type==='rss' ? parseRss(text,feed.name,feed.limit||8) : parseSb(text,feed.name,feed.url,feed.limit||8)));
  } catch (error) { errors.push({source:feed.name,message:error.message}); }
}
await mkdir(target,{recursive:true});
await writeFile(join(target,'external-news.json'),JSON.stringify(collected.sort((a,b)=>b.date.localeCompare(a.date)),null,2));
await writeFile(join(target,'ingestion-status.json'),JSON.stringify({generatedAt:new Date().toISOString(),items:collected.length,errors},null,2));
console.log(`Ingested ${collected.length} external items${errors.length ? ` (${errors.length} source errors)` : ''}`);
