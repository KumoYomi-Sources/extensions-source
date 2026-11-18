#!/usr/bin/env node
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TEMPLATES_DIR = join(ROOT, '_templates');
const SOURCES_DIR = join(ROOT, 'sources');

const CHECK_ONLY = process.argv.includes('--check');

function fail(message) {
  console.error(`❌ ${message}`);
  process.exitCode = 1;
}

function readJsonFiles(dir) {
  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort((a, b) => a.localeCompare(b));
  return files.map((file) => {
    const fullPath = join(dir, file);
    try {
      return { file, data: JSON.parse(readFileSync(fullPath, 'utf8')) };
    } catch (err) {
      fail(`JSON invalide dans ${file}: ${err.message}`);
      return { file, data: null };
    }
  });
}

const templateEntries = readJsonFiles(TEMPLATES_DIR);
const templateMap = new Map();

for (const { file, data } of templateEntries) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    fail(`Modèle ${file}: objet JSON attendu.`);
    continue;
  }
  const expectedId = basename(file, '.json');
  if (typeof data.id !== 'string' || data.id.trim() !== expectedId) {
    fail(`Modèle ${file}: "id" ("${data.id}") doit correspondre au nom de fichier "${expectedId}".`);
    continue;
  }
  if (templateMap.has(data.id)) {
    fail(`Modèle en doublon: "${data.id}".`);
    continue;
  }
  templateMap.set(data.id, data);
}

const sourceEntries = readJsonFiles(SOURCES_DIR);
const sourceMap = new Map();
const validSources = [];

for (const { file, data } of sourceEntries) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    fail(`Source ${file}: objet JSON attendu.`);
    continue;
  }
  const expectedId = basename(file, '.json');
  if (typeof data.id !== 'string' || data.id.trim() !== expectedId) {
    fail(`Source ${file}: "id" ("${data.id}") doit correspondre au nom de fichier "${expectedId}".`);
    continue;
  }
  if (typeof data.name !== 'string' || !data.name.trim()) {
    fail(`Source ${file}: champ "name" requis.`);
    continue;
  }
  if (typeof data.lang !== 'string' || !data.lang.trim()) {
    fail(`Source ${file}: champ "lang" requis (ex: "fr", "en").`);
    continue;
  }
  if (typeof data.baseUrl !== 'string') {
    fail(`Source ${file}: champ "baseUrl" requis.`);
    continue;
  }
  try {
    const u = new URL(data.baseUrl);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      fail(`Source ${file}: "baseUrl" doit utiliser http:// ou https://.`);
      continue;
    }
    if (data.baseUrl.endsWith('/')) {
      fail(`Source ${file}: "baseUrl" ne doit pas se terminer par "/".`);
      continue;
    }
  } catch {
    fail(`Source ${file}: "baseUrl" invalide ("${data.baseUrl}").`);
    continue;
  }

  if (data.extends) {
    if (!templateMap.has(data.extends)) {
      fail(`Source ${file}: le modèle "${data.extends}" n'existe pas dans _templates/.`);
      continue;
    }
  } else if (!data.mangaDetails || !data.chapters || !data.pages) {
    fail(
      `Source ${file}: sans "extends", les blocs "mangaDetails", "chapters" et "pages" sont obligatoires.`,
    );
    continue;
  }

  if (sourceMap.has(data.id)) {
    fail(`ID de source en doublon: "${data.id}".`);
    continue;
  }
  sourceMap.set(data.id, data);
  validSources.push({ file, data });
}

if (process.exitCode && process.exitCode !== 0) {
  process.exit(process.exitCode);
}

console.log(
  `✅ Validation OK : ${templateMap.size} modèle(s) et ${validSources.length} source(s) valides.`,
);

if (CHECK_ONLY) {
  process.exit(0);
}

const templateFiles = templateEntries.map((t) => `./_templates/${t.file}`);
const sourceFiles = validSources.map((s) => `./sources/${s.file}`);

const indexManifest = {
  name: 'KumoYomi Extensions Source',
  description: 'Dépôt communautaire officiel des sources JSON et modèles de scraping pour KumoYomi.',
  version: '1.0.0',
  templates: templateFiles,
  sources: sourceFiles,
};

const bundleManifest = {
  name: 'KumoYomi Extensions Source (Bundle Autonome)',
  description: 'Archive JSON autonome contenant tous les modèles et toutes les sources.',
  version: '1.0.0',
  templates: Array.from(templateMap.values()),
  sources: validSources.map((s) => s.data),
};

writeFileSync(join(ROOT, 'index.json'), `${JSON.stringify(indexManifest, null, 2)}\n`, 'utf8');
writeFileSync(join(ROOT, 'bundle.json'), `${JSON.stringify(bundleManifest, null, 2)}\n`, 'utf8');

const readmePath = join(ROOT, 'README.md');
try {
  const readme = readFileSync(readmePath, 'utf8');
  const startMarker = '<!-- SOURCES_TABLE_START -->';
  const endMarker = '<!-- SOURCES_TABLE_END -->';
  const startIdx = readme.indexOf(startMarker);
  const endIdx = readme.indexOf(endMarker);

  if (startIdx >= 0 && endIdx > startIdx) {
    const rows = validSources.map(({ file, data }) => {
      const tpl = data.extends ? `\`${data.extends}\`` : '_sur-mesure_';
      return `| \`${data.id}\` | **${data.name}** | \`${data.lang.toUpperCase()}\` | ${tpl} | [${data.baseUrl}](${data.baseUrl}) | [\`sources/${file}\`](./sources/${file}) |`;
    });
    const table = [
      startMarker,
      '| ID | Nom | Langue | Modèle | Site | Config |',
      '| :--- | :--- | :---: | :--- | :--- | :--- |',
      ...rows,
      endMarker,
    ].join('\n');

    const updated =
      readme.slice(0, startIdx) + table + readme.slice(endIdx + endMarker.length);
    writeFileSync(readmePath, updated, 'utf8');
  }
} catch {
  // README optionnel lors d'un premier run
}

console.log('✅ index.json, bundle.json et README.md mis à jour.');
