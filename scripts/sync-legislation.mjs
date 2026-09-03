import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('../', import.meta.url).pathname.replace(/^\/(.:)/, '$1');
const config = JSON.parse(await readFile(join(root, 'config/legislation.json'), 'utf8'));
const outDir = join(root, config.cacheDir || 'content/.generated/legislation');
await mkdir(outDir, { recursive: true });

const fetchJson = async (url) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(url, {
      headers: { 'user-agent': 'sindical-federado-legislation-sync/1.0' },
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
};

let registry;
try {
  registry = await fetchJson(config.registry);
  await writeFile(join(outDir, 'registry.json'), JSON.stringify(registry, null, 2) + '\n');
} catch (error) {
  try {
    registry = JSON.parse(await readFile(join(outDir, 'registry.json'), 'utf8'));
    console.warn(`Legislación: no se pudo actualizar el registro; se usa caché local (${error.message}).`);
  } catch {
    console.warn(`Legislación: repertorio no disponible (${error.message}). El build continuará sin sincronizarlo.`);
    process.exit(0);
  }
}

const selected = new Set(config.corpora || []);
const available = (registry.corpora || []).filter(item => selected.has(item.id) && item.path && item.entry);
const status = { syncedAt: new Date().toISOString(), registryVersion: registry.version || null, corpora: [] };

for (const item of available) {
  const file = `${item.id}.json`;
  const url = `${config.base}${item.path}/${item.entry}`;
  try {
    const corpus = await fetchJson(url);
    await writeFile(join(outDir, file), JSON.stringify(corpus, null, 2) + '\n');
    status.corpora.push({ id: item.id, status: 'synced', source: url });
  } catch (error) {
    try {
      await readFile(join(outDir, file), 'utf8');
      status.corpora.push({ id: item.id, status: 'cached', source: url, error: error.message });
      console.warn(`Legislación: ${item.id} no se pudo actualizar; se conserva la caché.`);
    } catch {
      status.corpora.push({ id: item.id, status: 'unavailable', source: url, error: error.message });
      console.warn(`Legislación: ${item.id} no está disponible.`);
    }
  }
}

await writeFile(join(outDir, 'status.json'), JSON.stringify(status, null, 2) + '\n');
console.log(`Legislación: ${status.corpora.filter(x => x.status === 'synced').length}/${available.length} corpus sincronizados.`);
