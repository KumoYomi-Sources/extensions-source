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
      fail(`Invalid JSON in ${file}: ${err.message}`);
      return { file, data: null };
    }
  });
}

const templateEntries = readJsonFiles(TEMPLATES_DIR);
const templateMap = new Map();

for (const { file, data } of templateEntries) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    fail(`Template ${file}: expected JSON object.`);
    continue;
  }
  const expectedId = basename(file, '.json');
  if (typeof data.id !== 'string' || data.id.trim() !== expectedId) {
    fail(`Template ${file}: "id" ("${data.id}") must match filename "${expectedId}".`);
    continue;
  }
  if (templateMap.has(data.id)) {
    fail(`Duplicate template id: "${data.id}".`);
    continue;
  }
  templateMap.set(data.id, data);
}

const sourceEntries = readJsonFiles(SOURCES_DIR);
const sourceMap = new Map();
const validSources = [];

for (const { file, data } of sourceEntries) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    fail(`Source ${file}: expected JSON object.`);
    continue;
  }
  const expectedId = basename(file, '.json');
  if (typeof data.id !== 'string' || data.id.trim() !== expectedId) {
    fail(`Source ${file}: "id" ("${data.id}") must match filename "${expectedId}".`);
    continue;
  }
  if (typeof data.name !== 'string' || !data.name.trim()) {
    fail(`Source ${file}: required field "name" missing.`);
    continue;
  }
  if (typeof data.lang !== 'string' || !data.lang.trim()) {
    fail(`Source ${file}: required field "lang" missing (e.g., "en", "fr", "es", "zh").`);
    continue;
  }
  if (typeof data.baseUrl !== 'string') {
    fail(`Source ${file}: required field "baseUrl" missing.`);
    continue;
  }
  try {
    const u = new URL(data.baseUrl);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      fail(`Source ${file}: "baseUrl" must use http:// or https://.`);
      continue;
    }
    if (data.baseUrl.endsWith('/')) {
      fail(`Source ${file}: "baseUrl" must not end with "/".`);
      continue;
    }
  } catch {
    fail(`Source ${file}: invalid "baseUrl" ("${data.baseUrl}").`);
    continue;
  }

  if (data.extends) {
    if (!templateMap.has(data.extends)) {
      fail(`Source ${file}: template "${data.extends}" does not exist in _templates/.`);
      continue;
    }
  } else if (!data.mangaDetails || !data.chapters || !data.pages) {
    fail(
      `Source ${file}: without "extends", blocks "mangaDetails", "chapters", and "pages" are required.`,
    );
    continue;
  }

  if (sourceMap.has(data.id)) {
    fail(`Duplicate source id: "${data.id}".`);
    continue;
  }
  sourceMap.set(data.id, data);
  validSources.push({ file, data });
}

if (process.exitCode && process.exitCode !== 0) {
  process.exit(process.exitCode);
}

console.log(
  `✅ Validation passed: ${templateMap.size} template(s) and ${validSources.length} valid source(s).`,
);

if (CHECK_ONLY) {
  process.exit(0);
}

const templateFiles = templateEntries.map((t) => `./_templates/${t.file}`);
const sourceFiles = validSources.map((s) => `./sources/${s.file}`);

const indexManifest = {
  name: 'KumoYomi Extensions Source',
  description: 'Official community repository of JSON source configs and scraping templates for KumoYomi.',
  version: '1.0.0',
  templates: templateFiles,
  sources: sourceFiles,
};

const bundleManifest = {
  name: 'KumoYomi Extensions Source (Standalone Bundle)',
  description: 'Self-contained JSON bundle containing all templates and sources.',
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
      const tpl = data.extends ? `\`${data.extends}\`` : '_custom_';
      return `| \`${data.id}\` | **${data.name}** | \`${data.lang.toUpperCase()}\` | ${tpl} | [${data.baseUrl}](${data.baseUrl}) | [\`sources/${file}\`](./sources/${file}) |`;
    });
    const table = [
      startMarker,
      '| ID | Name | Lang | Template | Website | Config |',
      '| :--- | :--- | :---: | :--- | :--- | :--- |',
      ...rows,
      endMarker,
    ].join('\n');

    const updated =
      readme.slice(0, startIdx) + table + readme.slice(endIdx + endMarker.length);
    writeFileSync(readmePath, updated, 'utf8');
  }
} catch {
  // README optional on bootstrap run
}

console.log('✅ index.json, bundle.json, and README.md updated.');
