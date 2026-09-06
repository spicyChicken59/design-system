// Visual deliverables: local references, document outlines and unchanged mark geometry.
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const files = ['brand-studio.html', 'visual-library.html', ...['landing','dashboard','screener','report'].map(p => `templates/${p}.html`)];
for (const name of files) {
  const path = join(root, name), html = readFileSync(path, 'utf8');
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1, `${name}: one page h1`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length, `${name}: unique IDs`);
  for (const [, tag, attrs] of html.matchAll(/<(a|img|iframe|script|link)\b([^>]+)>/g)) {
    const url = /(?:src|href)="([^"]+)"/.exec(attrs)?.[1];
    if (!url || /^(?:https?:|data:|mailto:)/.test(url)) continue;
    const [file, hash] = url.split('#');
    const target = file ? resolve(dirname(path), file) : path;
    assert(existsSync(target), `${name}: missing ${url}`);
    if (hash) assert(readFileSync(target, 'utf8').includes(`id="${hash}"`), `${name}: missing anchor ${url}`);
    if (tag === 'img') assert(/\balt="/.test(attrs), `${name}: image alt missing`);
  }
}
for (const [tone, form] of [['ink','cream'],['wine','cream'],['paper','ink']]) {
  const mark = readFileSync(join(root, `assets/sc-mark-mono-${form}.svg`), 'utf8');
  const pattern = readFileSync(join(root, `assets/sc-pattern-${tone}.svg`), 'utf8');
  for (const [path] of mark.matchAll(/<path\b[^>]+>/g)) assert(pattern.includes(path), `${tone}: original mark path changed`);
}
console.log('visual-check: 6 documents have valid assets/anchors, unique IDs and one h1; all 3 patterns preserve original logo paths');
