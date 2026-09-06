// Static visual-review server, using the repository's existing esbuild dependency.
import { context } from '../react/node_modules/esbuild/lib/main.js';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const args = process.argv.slice(2);
const arg = (key, fallback) => args.includes(key) ? args[args.indexOf(key) + 1] : fallback;
const ctx = await context({});
const server = await ctx.serve({ servedir: join(dirname(fileURLToPath(import.meta.url)), '..'), host: arg('--host', '127.0.0.1'), port: Number(arg('--port', '4173')) });
console.log(`Design preview listening on ${server.port}`);
