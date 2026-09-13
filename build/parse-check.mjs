import assert from 'node:assert/strict';

// A rule the BROWSER drops is invisible to every text-based gate: rule 5 and
// rule 12 read selectors out of the source, so a single stray comment
// delimiter can swallow a whole component and still report "all good".
// This asks the parser instead — every class the sheet defines must survive
// into the CSSOM.
export async function checkParsed(browser, base) {
  const page = await browser.newPage();
  try {
    await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.fulfill({ status: 200, body: '' }));
    await page.goto(`${base}/starter.html`);
    await page.setContent(`<html><head><link rel="stylesheet" href="${base}/sc.css"></head><body></body></html>`);
    await page.locator('link').evaluate(el => new Promise(r => el.sheet ? r() : el.addEventListener('load', r, { once: true })));
    const parsed = await page.evaluate(() => {
      const out = new Set();
      const walk = (rules) => { for (const r of rules) {
        if (r.selectorText) for (const m of r.selectorText.matchAll(/\.(sc-[A-Za-z0-9_-]+)/g)) out.add(m[1]);
        if (r.cssRules) walk(r.cssRules);
      } };
      walk(document.styleSheets[0].cssRules);
      return [...out];
    });
    const source = await page.evaluate(async (u) => await (await fetch(u)).text(), `${base}/sc.css`);
    // Scanned, not regex-stripped. A regex that pairs /* with the next */ will
    // happily re-pair around a STRAY */ and drop the same rule from `declared`
    // that the browser dropped from the CSSOM — leaving the two sides to move
    // together and the comparison unable to fail. That is the exact defect this
    // gate exists for, so the scanner reports the delimiter itself.
    let code = '', depth = 0, line = 1, stray = 0;
    for (let i = 0; i < source.length; i++) {
      if (source[i] === '\n') line++;
      if (source.startsWith('/*', i)) { depth++; i++; continue; }
      if (source.startsWith('*/', i)) {
        if (!depth) { stray++; assert.fail(`sc.css line ${line}: a */ closes a comment that was never opened — every rule after it is at the mercy of the parser's error recovery`); }
        depth--; i++; continue;
      }
      if (!depth) code += source[i];
    }
    assert.equal(depth, 0, 'sc.css: a /* is never closed');
    assert.equal(stray, 0, 'sc.css: stray comment delimiter');
    const declared = new Set([...code.matchAll(/\.(sc-[A-Za-z0-9_-]+)/g)].map((m) => m[1]));
    const dropped = [...declared].filter((c) => !parsed.includes(c)).sort();
    assert.deepEqual(dropped, [], `the browser dropped ${dropped.length} class(es) the sheet defines: ${dropped.join(', ')}`);
    console.log(`  ok parsed sheet: all ${declared.size} classes sc.css defines survive into the CSSOM`);
  } finally { await page.close(); }
}
