import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const esc=(value='')=>String(value).replace(/[&<>\"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));
const inline=(value='')=>esc(value).replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,'<a href="$2" rel="noopener">$1</a>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\*([^*]+)\*/g,'<em>$1</em>').replace(/`([^`]+)`/g,'<code>$1</code>');

export function parseMarkdown(source,fileName='article.md',allowedCategories=[]){
  const match=source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/); if(!match)throw new Error(`${fileName}: missing front matter`);
  const meta={}; for(const line of match[1].split(/\r?\n/)){const field=line.match(/^([a-zA-Z][\w-]*):\s*(.*)$/);if(!field)continue;let value=field[2].trim();if(value.startsWith('[')&&value.endsWith(']'))value=value.slice(1,-1).split(',').map(item=>item.trim()).filter(Boolean);meta[field[1]]=value;}
  for(const key of ['title','slug','date','summary','status','category'])if(!meta[key])throw new Error(`${fileName}: missing ${key}`);
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(meta.slug))throw new Error(`${fileName}: invalid slug`);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(meta.date))throw new Error(`${fileName}: invalid date`);
  if(!['draft','review','published','archived'].includes(meta.status))throw new Error(`${fileName}: invalid status`);
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(meta.category)||allowedCategories.length&&!allowedCategories.includes(meta.category))throw new Error(`${fileName}: invalid category`);
  const lines=match[2].trim().split(/\r?\n/);const html=[];let list=[];let listType='ul';const flush=()=>{if(list.length){html.push(`<${listType}>${list.map(item=>`<li>${inline(item)}</li>`).join('')}</${listType}>`);list=[]}};
  for(const line of lines){if(/^\s*$/.test(line)){flush();continue}const image=line.match(/^!\[([^\]]*)\]\((https:\/\/[^\s)]+)\)$/);if(image){flush();html.push(`<figure><img src="${esc(image[2])}" alt="${esc(image[1])}" loading="lazy" style="max-width:100%;height:auto"><figcaption>${esc(image[1])}</figcaption></figure>`);continue}const heading=line.match(/^(#{2,4})\s+(.+)$/);if(heading){flush();const level=heading[1].length;const id=heading[2].toLocaleLowerCase('es').normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');html.push(`<h${level} id="${id}">${inline(heading[2])}</h${level}>`);continue}const item=line.match(/^[-*]\s+(.+)$/);const numbered=line.match(/^\d+\.\s+(.+)$/);if(item||numbered){const nextType=item?'ul':'ol';if(list.length&&listType!==nextType)flush();listType=nextType;list.push((item||numbered)[1]);continue}flush();if(/^---+$/.test(line))html.push('<hr>');else if(line.startsWith('> [!IMPORTANTE]'))html.push(`<aside class="callout"><strong>Importante</strong><p>${inline(line.slice(15).trim())}</p></aside>`);else if(line.startsWith('> '))html.push(`<blockquote><p>${inline(line.slice(2))}</p></blockquote>`);else html.push(`<p>${inline(line)}</p>`)}flush();
  return {...meta,tags:Array.isArray(meta.tags)?meta.tags:[],bodyText:match[2].replace(/[#>*_`\[\]()]/g,' '),bodyHtml:html.join(''),fileName};
}

export async function loadArticles(root){const dir=join(root,'content/articles');const files=(await readdir(dir)).filter(name=>name.endsWith('.md')&&name!=='TEMPLATE.md');const taxonomy=JSON.parse(await readFile(join(root,'config/taxonomy.json'),'utf8'));const allowed=taxonomy.categories.map(item=>item.code);const articles=[];for(const name of files)articles.push(parseMarkdown(await readFile(join(dir,name),'utf8'),name,allowed));return articles;}
