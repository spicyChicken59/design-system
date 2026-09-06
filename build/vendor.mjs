// Copy an immutable design snapshot into a consumer. No package/runtime dependency.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const target = process.argv[2];
if (!target) throw new Error('Usage: node build/vendor.mjs <consumer/design-system-directory>');
const destination = resolve(target);
if (destination === root || root.startsWith(destination + '/')) throw new Error('Choose a consumer directory outside the source repository.');
const commit = execFileSync('git', ['rev-parse','HEAD'], {cwd:root,encoding:'utf8'}).trim();
const version = JSON.parse(readFileSync(join(root,'package.json'),'utf8')).version;
const assets = readdirSync(join(root,'assets')).filter(f => /\.(svg|png|ico)$/.test(f)).map(f => `assets/${f}`);
const files = ['sc.css','sc-theme.js','sc-charts.js','sc-map.js','sc-motion.js','sc-reading.js',...assets];
// Every published byte must be exactly the version named by the provenance.
for (const file of files) {
  if (!existsSync(join(root,file))) throw new Error(`Missing ${file}; build the source first.`);
  const committed = execFileSync('git',['show',`${commit}:${file}`],{cwd:root,maxBuffer:8*1024*1024});
  if (!committed.equals(readFileSync(join(root,file)))) throw new Error(`${file} has uncommitted changes; commit the verified design before vendoring.`);
}
const hashes = {};
for (const file of files) {
  const bytes = readFileSync(join(root,file));
  mkdirSync(dirname(join(destination,file)),{recursive:true});
  writeFileSync(join(destination,file),bytes);
  hashes[file] = createHash('sha256').update(bytes).digest('hex');
}
writeFileSync(join(destination,'provenance.json'), JSON.stringify({repository:'spicyChicken59/design-system',commit,version,files:hashes},null,2)+'\n');
console.log(`Copied ${files.length} design assets at ${commit.slice(0,12)} to ${destination}`);
