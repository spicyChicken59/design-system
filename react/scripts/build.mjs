// Bundles the React wrappers to dist/index.mjs and ships sc.css + tokens.json
// alongside, so the package is self-describing for design-sync.
import { build } from 'esbuild';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const repo = join(root, '..');
const dist = join(root, 'dist');

mkdirSync(dist, { recursive: true });

await build({
  entryPoints: [join(root, 'src', 'index.ts')],
  outfile: join(dist, 'index.mjs'),
  bundle: true,
  format: 'esm',
  target: 'es2020',
  jsx: 'automatic',
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  logLevel: 'info',
});

// sc.css is the design system. Ship it verbatim — never a rewritten copy.
// Always LF, whatever the checkout's line endings: these bytes must equal what Pages/jsDelivr serve.
const lf = (p) => readFileSync(p, 'utf8').split(String.fromCharCode(13)).join('');
writeFileSync(join(dist, 'sc.css'), lf(join(repo, 'sc.css')));
writeFileSync(join(dist, 'tokens.json'), lf(join(repo, 'tokens.json')));
console.log('build: dist/index.mjs + dist/sc.css + dist/tokens.json');
