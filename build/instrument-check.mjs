// Focused composition checks. Uses the actual exported templates and CSS; no
// application data or chart code is substituted. A local brand tile is used only
// as a clearly identified image-fitting fixture after fallback screenshots.
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { ratio } from './contrast.mjs';
const rgb = value => value.match(/[\d.]+/g).slice(0, 3).map(Number);

export async function checkInstrumentCompositions(browser, base, shots) {
  let scenarios = 0;
  for (const width of [320, 390, 820, 1280]) for (const theme of ['light', 'dark']) {
    const label = `instrument ${width}px ${theme}`;
    const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: theme, reducedMotion: 'reduce' });
    await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.fulfill({ status: 200, contentType: 'text/plain', body: '' }));
    await context.addInitScript(value => localStorage.setItem('sc-theme', value), theme);
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      await page.goto(`${base}/templates/screener.html`, { waitUntil: 'networkidle' });
      const strip = page.locator('.sc-stat-strip');
      const state = await strip.evaluate(element => {
        const s = getComputedStyle(element);
        const stats = [...element.children];
        return { native: element.tagName === 'DL' && stats.every(stat => stat.querySelector('dt') && stat.querySelector('dd')),
          background: s.backgroundColor, columns: s.gridTemplateColumns.split(' ').length,
          pageOverflow: document.documentElement.scrollWidth > innerWidth + 1,
          stats: stats.map(stat => {
            const label = stat.querySelector('dt'), value = stat.querySelector('.sc-stat__value'), note = stat.querySelector('.sc-stat__note');
            const b = stat.getBoundingClientRect(), n = note.getBoundingClientRect();
            return { value: value.textContent, label: label.textContent, color: getComputedStyle(value).color,
              muted: getComputedStyle(label).color, background: getComputedStyle(stat).backgroundColor,
              font: parseFloat(getComputedStyle(value).fontSize), station: getComputedStyle(stat, '::after').content,
              outgoing: getComputedStyle(stat, '::before').content, animation: getComputedStyle(stat).animationName,
              noteAboveRail: n.bottom <= b.bottom - parseFloat(getComputedStyle(stat, '::after').bottom) - 7,
              overflow: [label, value, note].some(text => text.scrollWidth > text.clientWidth + 1) };
          }) };
      });
      assert(state.native && !state.pageOverflow, `${label}: native labeled facts fit page`);
      assert.deepEqual(state.stats.map(stat => stat.value), ['230', '0', '0', '0'], `${label}: exact zero-state values remain visible`);
      assert.equal(state.columns, width <= 720 ? 2 : 4, `${label}: four stations become two phone columns`);
      for (const stat of state.stats) {
        const surface = stat.background === 'rgba(0, 0, 0, 0)' ? state.background : stat.background;
        assert(ratio(rgb(stat.color), rgb(surface)) >= 4.5, `${label}: exact value contrast`);
        assert(ratio(rgb(stat.muted), rgb(surface)) >= 4.5, `${label}: label contrast`);
        assert(stat.font >= 30 && !stat.overflow, `${label}: legible values without clipping`);
        assert(stat.station === '""' && stat.animation === 'none' && stat.noteAboveRail, `${label}: static station sits below all text`);
      }
      assert.equal(state.stats[3].outgoing, 'none', `${label}: route ends at final station`);
      if (width <= 720) assert.equal(state.stats[1].outgoing, 'none', `${label}: no line crosses a phone row wrap`);
      if (shots) await strip.screenshot({ path: join(shots, `instrument-${width}-${theme}.png`) });
      await page.emulateMedia({ media: 'print' });
      const printed = await strip.evaluate(element => ({ background: getComputedStyle(element).backgroundColor, dots: [...element.children].map(stat => getComputedStyle(stat, '::after').display) }));
      assert.equal(printed.background, 'rgba(0, 0, 0, 0)', `${label}: print removes ink fill`);
      assert(printed.dots.every(display => display === 'none'), `${label}: print keeps text without route ornaments`);
      await page.emulateMedia({ media: 'screen', forcedColors: 'active' });
      assert.equal(await strip.locator('.sc-stat').first().evaluate(stat => getComputedStyle(stat, '::after').display), 'none', `${label}: forced colors removes station ornaments`);
      await page.emulateMedia({ forcedColors: 'none' });

      await page.goto(`${base}/templates/dashboard.html`, { waitUntil: 'networkidle' });
      assert((await page.locator('.sc-stat').evaluateAll(stats => stats.every(stat => getComputedStyle(stat, '::before').content === 'none' && getComputedStyle(stat, '::after').content === 'none'))), `${label}: unrelated facts have no route`);
      await page.goto(`${base}/templates/decision-brief.html`, { waitUntil: 'networkidle' });
      const dossier = page.locator('.sc-dossier').first();
      const fallback = await dossier.evaluate(element => {
        const media = element.querySelector('.sc-photo-card__media');
        const image = [...media.querySelectorAll('img')].find(img => getComputedStyle(img).display !== 'none');
        const b = media.getBoundingClientRect(), i = image.getBoundingClientRect();
        return { mediaHeight: b.height, markWidth: i.width, ratio: i.width / i.height, original: image.naturalWidth / image.naturalHeight,
          caption: element.querySelector('figcaption').textContent, hasPriceOverlay: !!media.querySelector('.sc-photo-card__price') };
      });
      assert(fallback.mediaHeight <= 144 && fallback.markWidth <= 48 && Math.abs(fallback.ratio - fallback.original) < .01, `${label}: missing photo is compact and preserves complete mark proportions`);
      assert(fallback.caption.includes('photo not supplied') && !fallback.hasPriceOverlay, `${label}: missing photo is explicit, with evidence outside image`);
      if (shots) await dossier.screenshot({ path: join(shots, `dossier-${width}-${theme}.png`) });
      const action = dossier.locator('a').first();
      await action.focus();
      assert(await action.evaluate(a => document.activeElement === a && getComputedStyle(a).outlineStyle !== 'none' && a.getBoundingClientRect().height >= 44), `${label}: dossier action retains visible keyboard focus and touch target`);
      // Exercise the supplied-photo branch using a local SVG fixture, not a
      // fabricated vehicle photo. This fixture is never included in screenshots.
      await dossier.evaluate(element => {
        const media = element.querySelector('.sc-photo-card__media');
        media.innerHTML = '<div class="sc-frame sc-frame--photo"><img class="sc-frame__img is-loaded" src="../assets/sc-avatar-tile.svg" alt="Original brand tile: image fitting fixture"></div>';
      });
      await page.locator('.sc-dossier').first().locator('.sc-frame__img').evaluate(image => image.decode());
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await dossier.hover();
      const fitted = await dossier.locator('.sc-frame__img').evaluate(image => ({ fit: getComputedStyle(image).objectFit, transform: getComputedStyle(image).transform, width: image.getBoundingClientRect().width, mediaWidth: image.parentElement.getBoundingClientRect().width }));
      assert.equal(fitted.fit, 'contain', `${label}: supplied image remains uncropped`);
      assert.equal(fitted.transform, 'none', `${label}: loaded photo does not zoom on ordinary hover`);
      assert(Math.abs(fitted.width - fitted.mediaWidth) <= 1, `${label}: supplied image uses full media width`);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      assert.equal(await dossier.locator('.sc-frame__img').evaluate(image => getComputedStyle(image).transform), 'none', `${label}: reduced motion leaves loaded photo still`);
      assert.deepEqual(errors, [], `${label}: no browser errors`);
      scenarios++;
      console.log(`  ok ${label}: exact facts, contrast, wrapping, route, photo fallback, keyboard, reduced motion, print and forced colors`);
    } finally { await context.close(); }
  }
  console.log(`instrument-check: ${scenarios}/8 exported composition scenarios passed`);
}
