// Visual deliverables: local references, document outlines and unchanged mark geometry.
// Add --browser for the rendered decision-brief gate; --shots <directory> saves
// actual browser captures. Playwright + Chromium must be installed separately.
// A requested browser run without a working browser reports SKIP and exits 1.
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { readFile, mkdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, join, resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkMatrixCriteria, checkMatrixLifecycle, checkMatrixWithoutJS } from './matrix-nav-check.mjs';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const files = ['brand-studio.html', 'visual-library.html', 'composition-studio.html', ...['landing','dashboard','screener','report','deliverable','decision-brief'].map(p => `templates/${p}.html`)];
for (const name of files) {
  const path = join(root, name), html = readFileSync(path, 'utf8');
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1, `${name}: one page h1`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length, `${name}: unique IDs`);
  if (name.startsWith('templates/')) {
    assert(!/class="[^"]*\bexample-/.test(html), `${name}: exported composition uses shared classes`);
    assert(!/<style\b/.test(html), `${name}: composition has no private stylesheet`);
  }
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
// The intrinsic mark is 342×405. A theme-adaptive pair needs an explicit size
// class inside a fixed-height photo slot, or overflow:hidden would crop the chick.
const decision = readFileSync(join(root, 'templates/decision-brief.html'), 'utf8');
const adaptiveMarks = [...decision.matchAll(/<img\b[^>]*class="([^"]*sc-adaptive-mark__(?:dark|light)[^"]*)"/g)];
assert.equal(adaptiveMarks.length, 6, 'decision brief: two complete photo placeholders and one signature');
for (const [, classes] of adaptiveMarks) {
  const names = classes.split(/\s+/);
  assert(names.includes('sc-mark') && names.includes('sc-mark--lg'), 'decision brief: adaptive mark has bounded, proportional sizing');
}
assert(!decision.includes('sc-photo-card__price'), 'decision brief: no price scrim overlays the placeholder mark');
assert(decision.indexOf('id="brief-signals"') < decision.indexOf('id="brief-candidate-a"'), 'decision brief: visible signals precede dossier detail');
assert(decision.includes('aria-describedby="brief-scroll-help"'), 'decision brief: table scroller has a written keyboard/phone hint');
console.log(`visual-check: ${files.length} documents have valid assets/anchors, unique IDs and one h1; all 3 patterns preserve original logo paths; templates use shared styles only`);

if (process.argv.includes('--browser')) await checkRenderedDecisionBrief();

async function checkRenderedDecisionBrief() {
  const shotsIndex = process.argv.indexOf('--shots');
  const shots = shotsIndex === -1 ? null : process.argv[shotsIndex + 1];
  if (shotsIndex !== -1 && (!shots || shots.startsWith('--'))) throw new Error('--shots requires a directory');
  if (shots) await mkdir(shots, { recursive: true });
  let browser;
  try {
    const { chromium } = await import('playwright');
    browser = await chromium.launch();
  } catch (error) {
    console.error(`  SKIP rendered decision brief: Chromium unavailable; no rendered verification performed. ${error.message}`);
    process.exitCode = 1;
    return;
  }
  const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };
  const server = createServer(async (request, response) => {
    try {
      const path = resolve(root, `.${decodeURIComponent(new URL(request.url, 'http://localhost').pathname)}`);
      if (!path.startsWith(root + sep)) { response.writeHead(403).end(); return; }
      response.writeHead(200, { 'content-type': types[extname(path)] || 'application/octet-stream' }).end(await readFile(path));
    } catch { response.writeHead(404).end('Not found'); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  let scenarios = 0;
  try {
    for (const width of [390, 820, 1280]) for (const theme of ['light', 'dark']) {
      const label = `${width}px ${theme}`;
      const context = await browser.newContext({ viewport: { width, height: width === 820 ? 1180 : 900 }, colorScheme: theme });
      // Reproducible offline rendering exercises the documented font fallbacks.
      // Original local brand assets still load byte-for-byte from the repository.
      await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.fulfill({ status: 200, contentType: 'text/plain', body: '' }));
      await context.addInitScript(value => localStorage.setItem('sc-theme', value), theme);
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      try {
        await page.goto(`${base}/templates/decision-brief.html`, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        const geometry = await page.evaluate(() => {
          const box = element => { const r = element.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom }; };
          const table = document.querySelector('.sc-signal-matrix');
          const cards = [...document.querySelectorAll('.sc-dossier')];
          const images = [...document.querySelectorAll('.sc-photo-card__media img')].filter(img => getComputedStyle(img).display !== 'none');
          return { theme: document.documentElement.dataset.theme, pageWidth: document.documentElement.scrollWidth, viewport: innerWidth, viewportHeight: innerHeight,
            table: box(table), cards: cards.map(box), rows: table.tBodies[0].rows.length,
            native: table.tagName === 'TABLE' && !!table.caption && !!table.querySelector('th[scope="row"]') && !!table.querySelector('th[scope="col"]'),
            hiddenAncestor: !!table.closest('[hidden], details:not([open])'),
            images: images.map(img => ({ loaded: img.complete && img.naturalWidth > 0, image: box(img), media: box(img.closest('.sc-photo-card__media')), ratio: img.naturalWidth / img.naturalHeight })) };
        });
        assert.equal(geometry.theme, theme, `${label}: explicit theme applied`);
        assert(geometry.pageWidth <= geometry.viewport + 1, `${label}: no page-level horizontal overflow`);
        assert(geometry.native && geometry.rows === 2 && !geometry.hiddenAncestor, `${label}: native matrix has two immediately available candidates`);
        assert(geometry.table.height > 0 && geometry.table.y < geometry.cards[0].y, `${label}: matrix is visible before dossier details`);
        assert(geometry.table.y < geometry.viewportHeight, `${label}: matrix begins in the initial viewport`);
        assert.equal(geometry.images.length, 2, `${label}: exactly one original placeholder mark per dossier`);
        for (const { loaded, image, media, ratio } of geometry.images) {
          assert(loaded && image.width > 0 && image.height > 0, `${label}: placeholder mark loaded`);
          assert(image.x >= media.x && image.y >= media.y && image.right <= media.right && image.bottom <= media.bottom, `${label}: entire original mark fits within the photo slot`);
          assert(Math.abs(image.width / image.height - ratio) < .01, `${label}: mark geometry is not distorted`);
        }
        if (width === 390) assert(geometry.cards[1].y >= geometry.cards[0].bottom - 1, `${label}: phone dossiers stack`);
        else assert(Math.abs(geometry.cards[0].y - geometry.cards[1].y) < 1, `${label}: wide dossiers share a row`);
        if (shots) await page.screenshot({ path: join(shots, `decision-brief-${width}-${theme}.png`), fullPage: true });

        await checkMatrixCriteria(page, label);

        const scroller = page.locator('.sc-table-scroll');
        await scroller.focus();
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(160);
        const scroll = await scroller.evaluate(element => ({ focused: document.activeElement === element, hasOverflow: element.scrollWidth > element.clientWidth, left: element.scrollLeft, outline: getComputedStyle(element).outlineStyle, label: element.getAttribute('aria-label'), description: element.getAttribute('aria-describedby') }));
        assert(scroll.focused && scroll.outline !== 'none' && scroll.label && scroll.description, `${label}: named scroller has keyboard focus and guidance`);
        assert(!scroll.hasOverflow || scroll.left > 0, `${label}: arrow key pans an overflowing matrix`);
        await page.locator('.sc-signal-matrix a[href="#brief-candidate-a"]').click();
        assert.equal(new URL(page.url()).hash, '#brief-candidate-a', `${label}: matrix anchor navigates to the matching dossier`);
        await page.locator('#brief-candidate-a a[href="#brief-sources"]').click();
        assert.equal(new URL(page.url()).hash, '#brief-sources', `${label}: source action is a real anchor`);
        await page.locator('#brief-candidate-a a[href="#brief-map"]').click();
        assert.equal(new URL(page.url()).hash, '#brief-map', `${label}: map-context action is a real anchor`);
        await page.emulateMedia({ reducedMotion: 'reduce' });
        assert.equal(await page.locator('.sc-signal-matrix').isVisible(), true, `${label}: reduced motion keeps the matrix visible`);
        assert.equal(await page.locator('.sc-dossier').count(), 2, `${label}: reduced motion retains both dossiers`);
        await page.locator('#brief-map a').click();
        assert.equal(new URL(page.url()).pathname, '/styleguide.html', `${label}: shared-map reference opens the real guide`);
        assert.equal(new URL(page.url()).hash, '#points', `${label}: shared-map reference selects the points/map chapter`);
        assert.deepEqual(errors, [], `${label}: no browser page errors`);
        scenarios += 1;
        console.log(`  ok rendered ${label}: matrix, layout, original marks, focus, anchors and reduced motion`);
      } finally { await context.close(); }
    }
    await checkMatrixLifecycle(browser, root);
    await checkMatrixWithoutJS(browser, base);
    console.log(`visual-check: ${scenarios}/6 rendered decision-brief scenarios passed in Chromium (offline fallback fonts)${shots ? `; screenshots: ${shots}` : ''}`);
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}
