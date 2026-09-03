import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('../', import.meta.url).pathname.replace(/^\/(.:)/, '$1');
const config = JSON.parse(await readFile(join(root, 'config/legislation.json'), 'utf8'));
const sourceDir = join(root, config.cacheDir || 'content/.generated/legislation');
const outDir = join(root, 'dist/legislacion');
await mkdir(outDir, { recursive: true });

const esc = (value='') => String(value).replace(/[&<>\"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
const normalize = value => String(value || '').toLocaleLowerCase('es').normalize('NFD').replace(/\p{Diacritic}/gu, '');

let registry = { version: null, corpora: [] };
try { registry = JSON.parse(await readFile(join(sourceDir, 'registry.json'), 'utf8')); } catch {}

const files = await readdir(sourceDir).catch(() => []);
const corpora = [];
for (const item of registry.corpora || []) {
  if (!files.includes(`${item.id}.json`)) continue;
  try { corpora.push(JSON.parse(await readFile(join(sourceDir, `${item.id}.json`), 'utf8'))); } catch {}
}

const relationLabel = relation => {
  if (typeof relation === 'string') return relation.replace(':', ' · ');
  return relation?.label || relation?.href || 'Referencia relacionada';
};

const units = corpora.flatMap(corpus => (corpus.articles || []).flatMap(article => (article.units || []).map(unit => ({ corpus, article, unit }))));
const cards = units.map(({ corpus, article, unit }) => {
  const search = normalize([corpus.title, article.title, unit.legal, unit.plain, ...(unit.topics || [])].join(' '));
  const relations = (unit.related || []).map(r => `<li>${esc(relationLabel(r))}</li>`).join('');
  return `<article class="legal-unit" id="${esc(unit.id)}" data-search="${esc(search)}">
    <p class="corpus">${esc(corpus.title)}</p>
    <h2>${esc(article.title)}</h2>
    <div class="literal"><strong>Texto legal</strong><p>${esc(unit.legal)}</p></div>
    ${unit.plain ? `<div class="plain"><strong>En palabras sencillas</strong><p>${esc(unit.plain)}</p></div>` : ''}
    ${unit.editorialNote ? `<div class="editorial"><strong>Nota de edición</strong><p>${esc(unit.editorialNote)}</p></div>` : ''}
    ${relations ? `<div class="related"><strong>Relacionado con</strong><ul>${relations}</ul></div>` : ''}
    <p class="unit-id"><a href="#${esc(unit.id)}">${esc(unit.id)}</a></p>
  </article>`;
}).join('\n');

const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Legislación interpretada</title>
<style>
:root{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#171717;background:#f5f5f2}body{margin:0}header,main{max-width:1050px;margin:auto;padding:1.25rem}header{padding-top:2rem}.eyebrow,.corpus,.unit-id{font-size:.85rem;color:#555}.search{width:100%;font:inherit;padding:.85rem 1rem;border:1px solid #aaa;border-radius:.5rem;background:#fff}.summary{display:flex;gap:1rem;flex-wrap:wrap;margin:1rem 0}.summary span{background:#fff;padding:.5rem .75rem;border-radius:999px;border:1px solid #ddd}.legal-unit{background:#fff;border:1px solid #ddd;border-radius:.75rem;padding:1.25rem;margin:1rem 0;scroll-margin-top:1rem}.legal-unit h2{margin:.25rem 0 1rem;font-size:1.25rem}.literal,.plain,.editorial,.related{padding:1rem;border-radius:.5rem;margin:.75rem 0}.literal{background:#f6f6f6}.plain{background:#eef5ff}.editorial{background:#fff4d6}.related{border:1px solid #ddd}.related ul{margin:.5rem 0 0}a{color:inherit}nav a{margin-right:1rem}.notice{border-left:4px solid #555;padding-left:1rem}.empty{padding:2rem 0;color:#555}
</style></head><body>
<header><nav><a href="../">Inicio</a><a href="../convenio/">Convenio</a></nav><p class="eyebrow">Repertorio federado · versión ${esc(registry.version || 'sin sincronizar')}</p><h1>Legislación interpretada</h1><p>Texto legal, lenguaje claro y relaciones entre normas. La explicación es orientativa y se mantiene separada del literal.</p><div class="summary"><span>${corpora.length} corpus</span><span>${units.length} unidades jurídicas</span></div><label for="legal-search">Buscar por tema, artículo o texto</label><input class="search" id="legal-search" type="search" placeholder="Ej.: vacaciones, hospitalización, artículo 38"><p id="legal-count" aria-live="polite"></p></header>
<main><p class="notice"><strong>Fuente:</strong> los corpus se sincronizan desde GofioDesign/legislacion-interpretada. Los estados <em>draft</em> indican que la incorporación aún es parcial.</p><div id="legal-results">${cards || '<p class="empty">No hay corpus sincronizados disponibles.</p>'}</div></main>
<script>
const input=document.querySelector('#legal-search');const items=[...document.querySelectorAll('[data-search]')];const count=document.querySelector('#legal-count');const norm=v=>v.toLocaleLowerCase('es').normalize('NFD').replace(/\\p{Diacritic}/gu,'');function filter(){const q=norm(input.value.trim());let visible=0;for(const item of items){const show=!q||item.dataset.search.includes(q);item.hidden=!show;if(show)visible++}count.textContent=q?visible+' resultados':''}input.addEventListener('input',filter);if(location.hash){document.querySelector(location.hash)?.scrollIntoView()}
</script></body></html>`;

await writeFile(join(outDir, 'index.html'), html);
console.log(`Legislación: página generada con ${corpora.length} corpus y ${units.length} unidades.`);
