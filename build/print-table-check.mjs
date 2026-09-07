import assert from 'node:assert/strict';

// Shared by the existing Chromium gate. Use actual overflow and CSS media,
// rather than asserting that a source file contains the desired declaration.
export async function checkPrintTable(browser, base) {
  for (const width of [390, 820, 1280]) for (const theme of ['light', 'dark']) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: theme });
    try {
      await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.fulfill({ status: 200, body: '' }));
      await page.goto(`${base}/starter.html`);
      await page.setContent(`<html data-theme="${theme}"><head><link rel="stylesheet" href="${base}/sc.css"></head><body>
        <div class="sc-table-scroll sc-table-scroll--tall" tabindex="0" role="region" aria-label="Complete report">
        <table class="sc-table"><thead><tr><th scope="col">Record</th><th scope="col">Observation</th></tr></thead>
        <tbody>${Array.from({length: 60}, (_, i) => `<tr><th scope="row">Record ${i + 1}</th><td>Written evidence ${i + 1}</td></tr>`).join('')}</tbody></table></div></body></html>`);
      await page.locator('link').evaluate(el => new Promise(resolve => el.sheet ? resolve() : el.addEventListener('load', resolve, {once:true})));
      const port = page.locator('.sc-table-scroll');
      const measure = () => port.evaluate(el => ({ height: el.clientHeight, content: el.scrollHeight, max: getComputedStyle(el).maxHeight,
        overflow: getComputedStyle(el).overflowY, sticky: getComputedStyle(el.querySelector('tbody th')).position,
        rows: el.querySelectorAll('tbody tr').length, last: el.querySelector('tbody tr:last-child').textContent }));
      const screen = await measure();
      assert(screen.content > screen.height && screen.sticky === 'sticky', 'screen keeps its bounded scroll and sticky identity');
      await port.focus();
      assert(await port.evaluate(el => el === document.activeElement && getComputedStyle(el).outlineStyle !== 'none'), 'keyboard focus remains visible');
      await page.emulateMedia({ media: 'print', reducedMotion: 'reduce' });
      const print = await measure();
      assert.equal(print.max, 'none'); assert.equal(print.overflow, 'visible'); assert.equal(print.sticky, 'static');
      assert(print.height >= print.content - 1 && print.rows === 60 && print.last.includes('60'), 'all rows participate in print flow');
      await page.emulateMedia({ media: 'screen', reducedMotion: 'reduce' });
      assert.deepEqual(await measure(), screen, 'returning to screen restores the same table geometry and data');
      console.log(`  ok print table ${width}px ${theme}: 60 rows, screen/focus preserved, print unbounded, reduced-motion round trip`);
    } finally { await page.close(); }
  }
}
