import assert from 'node:assert/strict';

// The record comparison is a reading rule, so it is checked by measuring what a
// reader can see: which rows are marked as differing (and that the mark is on
// the label, not on a cell, because a difference is not a winner), and whether
// both identities are still on screen when the measures have scrolled past them.
export async function checkComparePair(browser, base) {
  for (const width of [390, 1280]) for (const theme of ['light', 'dark']) {
    const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 900 },
      colorScheme: theme, isMobile: width === 390, hasTouch: width === 390 });
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    try {
      await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.fulfill({ status: 200, body: '' }));
      await page.goto(`${base}/styleguide.html`);
      await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
      await page.locator('#sg-differs-matrix').scrollIntoViewIfNeeded();

      // The matrix: the mark is a rule down the row's own label, and no cell in
      // a marked row is emphasised by it.
      const matrix = await page.evaluate(() => {
        const rows = [...document.querySelectorAll('#sg-differs-matrix tbody tr')];
        const shadow = (n) => getComputedStyle(n).boxShadow;
        return rows.map((tr) => ({
          differs: tr.getAttribute('data-differs') === 'true',
          label: shadow(tr.querySelector('th[scope="row"]')),
          cells: [...tr.querySelectorAll('td')].map(shadow),
        }));
      });
      assert.equal(matrix.length, 3, 'the specimen draws three measures');
      assert.equal(matrix.filter((r) => r.differs).length, 2, 'two of them are marked as differing');
      for (const r of matrix) {
        if (r.differs) assert(r.label !== 'none', 'a differing row marks its own label');
        else assert.equal(r.label, 'none', 'a row the records agree on carries no mark');
        for (const c of r.cells) assert.equal(c, 'none', 'the mark never lands on a value cell');
      }

      // The pair view: both records named, side by side, and still on screen
      // when the reader has scrolled to the last measure.
      const pair = await page.evaluate(() => {
        const host = document.getElementById('sg-compare-pair');
        const heads = [...host.querySelectorAll('.sc-compare-pair__head')];
        const values = [...host.querySelectorAll('.sc-compare-pair__values')];
        const box = (n) => { const r = n.getBoundingClientRect(); return { top: r.top, width: Math.round(r.width), height: Math.round(r.height) }; };
        return { heads: heads.map(box), sticky: getComputedStyle(host.querySelector('.sc-compare-pair__heads')).position,
          pairs: values.map((v) => [...v.children].map(box)),
          hostWidth: Math.round(host.getBoundingClientRect().width),
          scrollWidth: host.scrollWidth, clientWidth: host.clientWidth };
      });
      assert.equal(pair.heads.length, 2, 'both records are named');
      assert.equal(pair.sticky, 'sticky', 'the identities are sticky, not scrolled away');
      assert(Math.abs(pair.heads[0].width - pair.heads[1].width) <= 1, 'the two records get equal room');
      for (const [a, b] of pair.pairs) {
        assert(Math.abs(a.width - b.width) <= 1, 'the two values of a measure get equal room');
        assert(a.height > 0 && b.height > 0, 'neither value is collapsed');
      }
      assert(pair.scrollWidth <= pair.clientWidth + 1, 'the pair view never scrolls sideways');

      // Sticky is a claim about what happens after a scroll, so scroll.
      const stuck = await page.evaluate(() => {
        const host = document.getElementById('sg-compare-pair');
        const last = host.querySelector('.sc-compare-pair__rows > dd:last-of-type');
        last.scrollIntoView({ block: 'end' });
        const heads = host.querySelector('.sc-compare-pair__heads').getBoundingClientRect();
        return { top: Math.round(heads.top), bottom: Math.round(heads.bottom), viewport: innerHeight };
      });
      assert(stuck.bottom > 0 && stuck.top < stuck.viewport,
        `the identities stay on screen while the measures scroll (${JSON.stringify(stuck)})`);
      assert.deepEqual(errors, [], `compare pair ${width}px ${theme}: page errors`);
      console.log(`  ok compare pair ${width}px ${theme}: two records named and sticky, ${matrix.filter((r) => r.differs).length} differing rows marked on the label only`);
    } finally { await page.close(); }
  }
}
