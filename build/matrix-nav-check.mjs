// Browser regression checks for the optional navigator, run by visual-check.
import assert from 'node:assert/strict';
import { join } from 'node:path';

export async function checkMatrixCriteria(page, label) {
  const group = page.locator('[data-sc-matrix-controls]');
  const buttons = group.locator('button');
  assert.deepEqual(await buttons.allTextContents(), ['asking', 'mileage', 'location', 'history'], `${label}: every offscreen criterion is discoverable by name`);
  const overflow = await page.locator('[data-sc-matrix-nav]').evaluate(el => el.scrollWidth > el.clientWidth + 1);
  assert.equal(await group.isVisible(), overflow, `${label}: controls appear only when useful`);
  if (!overflow) return;
  assert(await buttons.evaluateAll(all => all.every(button => button.type === 'button' && !button.hasAttribute('aria-pressed') && !button.hasAttribute('role') && button.getBoundingClientRect().height >= 44 && button.getBoundingClientRect().width >= 44)), `${label}: native commands have 44px targets without false selected states`);
  for (let index = 0; index < await buttons.count(); index++) {
    await buttons.nth(index).click();
    await page.locator('[data-sc-matrix-nav]').evaluate(region => new Promise((resolve, reject) => {
      const deadline = performance.now() + 2500;
      let previous = region.scrollLeft, still = 0;
      const frame = () => {
        still = Math.abs(region.scrollLeft - previous) < .1 ? still + 1 : 0;
        previous = region.scrollLeft;
        if (performance.now() > deadline) reject(new Error('Criterion scrolling did not settle within 2.5 seconds'));
        else if (still >= 6) resolve();
        else requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    }));
    await page.waitForFunction(column => {
      const region = document.querySelector('[data-sc-matrix-nav]');
      const headings = region.querySelectorAll('thead th');
      const target = headings[column + 1].getBoundingClientRect();
      const identity = headings[0].getBoundingClientRect();
      const right = region.getBoundingClientRect().right - (region.offsetWidth - region.clientWidth);
      return target.left >= identity.right - 2 && target.right <= right + 2;
    }, index, { timeout: 2000 });
  }
  // A manual pan must not leave a fictional selected criterion behind.
  await page.locator('[data-sc-matrix-nav]').evaluate(el => el.scrollLeft = 20);
  assert.equal(await group.locator('[aria-pressed], [aria-selected], [role="tab"]').count(), 0, `${label}: manual panning has no stale selected state`);
  await buttons.first().focus();
  await page.keyboard.press('Tab');
  assert.equal(await buttons.nth(1).evaluate(button => document.activeElement === button && getComputedStyle(button).outlineStyle !== 'none'), true, `${label}: native Tab sequence has visible focus`);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.keyboard.press('Enter');
  const instant = await page.locator('[data-sc-matrix-nav]').evaluate(region => {
    const header = region.querySelectorAll('thead th')[2].getBoundingClientRect();
    const first = region.querySelector('thead th').getBoundingClientRect();
    return { left: header.left, right: header.right, identity: first.right, port: region.getBoundingClientRect().right, scroll: region.scrollLeft };
  });
  assert(instant.left >= instant.identity - 2 && instant.right <= instant.port + 2, `${label}: reduced-motion keyboard command reaches its criterion immediately ${JSON.stringify(instant)}`);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.locator('[data-sc-matrix-nav]').evaluate(region => region.scrollTo({ left: 0, behavior: 'instant' }));
}

export async function checkMatrixLifecycle(browser, root) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await context.route(/^https?:\/\//, route => route.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  const page = await context.newPage();
  try {
    await page.setContent(`<div id="mount"><details><summary>Supplied checks</summary><div id="matrix" class="sc-table-scroll" tabindex="0" role="region" aria-label="Checklist" style="border:3px solid;padding:0 14px;width:350px"><table class="sc-table sc-signal-matrix"><thead><tr><th scope="col">Record</th><th scope="col">Value</th><th scope="col">Source</th><th scope="col">Updated</th><th scope="col" data-sc-label="History">Accident record</th></tr></thead><tbody><tr><th scope="row">Candidate A</th><td>Supplied</td><td>Listing</td><td>Today</td><td>Unknown</td></tr></tbody></table></div></details></div>`);
    await page.addStyleTag({ path: join(root, 'sc.css') });
    await page.addScriptTag({ path: join(root, 'sc-matrix-nav.js') });
    const initial = await page.evaluate(() => {
      const region = document.querySelector('#matrix');
      window.navigatorFixture = SCMatrixNav.attach(region);
      return { idempotent: window.navigatorFixture === SCMatrixNav.attach(region), hidden: document.querySelector('[data-sc-matrix-controls]').hidden };
    });
    assert(initial.idempotent && initial.hidden, 'matrix lifecycle: idempotent attach inside closed disclosure remains hidden');
    await page.getByText('Supplied checks', { exact: true }).click();
    await page.locator('[data-sc-matrix-controls]').waitFor({ state: 'visible' });
    const history = page.getByRole('button', { name: 'History', exact: true });
    assert.equal(await history.getAttribute('title'), 'Accident record', 'matrix lifecycle: short label retains the full native header');
    await history.click();
    const bounds = await page.locator('#matrix').evaluate(region => {
      const head = region.querySelectorAll('thead th');
      return { identity: head[0].getBoundingClientRect().right, criterion: head[4].getBoundingClientRect().left, end: head[4].getBoundingClientRect().right, port: region.getBoundingClientRect().right - region.clientLeft };
    });
    assert(bounds.criterion >= bounds.identity - 2 && bounds.end <= bounds.port + 2, 'matrix lifecycle: bordered, padded scrollport reveals the last criterion without sticky overlap');
    await page.evaluate(() => {
      const header = document.querySelectorAll('#matrix thead th')[4];
      header.textContent = 'Inspection record';
      header.setAttribute('data-sc-label', 'Inspection');
      navigatorFixture.refresh();
    });
    assert.equal(await page.getByRole('button', { name: 'Inspection', exact: true }).count(), 1, 'matrix lifecycle: refresh derives new labels from replaced evidence headers');
    const inspection = page.getByRole('button', { name: 'Inspection', exact: true });
    await inspection.focus();
    await page.evaluate(() => {
      document.querySelector('#matrix thead tr').lastElementChild.remove();
      document.querySelector('#matrix tbody tr').lastElementChild.remove();
      navigatorFixture.refresh();
    });
    assert.equal(await page.locator('#matrix').evaluate(region => document.activeElement === region), true, 'matrix lifecycle: removing a focused criterion returns focus to its region');
    await page.getByRole('button', { name: 'Value', exact: true }).focus();
    await page.locator('#matrix').evaluate(region => region.style.width = '900px');
    await page.locator('[data-sc-matrix-controls]').waitFor({ state: 'hidden' });
    assert.equal(await page.locator('#matrix').evaluate(region => document.activeElement === region), true, 'matrix lifecycle: growing to desktop hands focus to the visible table region');
    await page.evaluate(() => navigatorFixture.destroy());
    assert.equal(await page.locator('[data-sc-matrix-controls]').count(), 0, 'matrix lifecycle: destroy removes controls');
    const after = await page.evaluate(() => {
      const region = document.querySelector('#matrix');
      region.removeAttribute('id');
      const nav = SCMatrixNav.attach(region);
      const generated = !!region.id;
      nav.destroy();
      return { generated, clean: !region.id, rows: region.querySelectorAll('tbody tr').length };
    });
    assert(after.generated && after.clean && after.rows === 1, 'matrix lifecycle: generated ID and observer lifecycle clean up while records stay intact');
    console.log('  ok matrix lifecycle: disclosure, padded scrollport, short labels, refresh, resize focus and destroy');
  } finally { await context.close(); }
}

export async function checkMatrixWithoutJS(browser, base) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.fulfill({ status: 200, body: '' }));
  const page = await context.newPage();
  try {
    await page.goto(`${base}/templates/decision-brief.html`, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('.sc-signal-matrix tbody tr').count(), 2, 'no-JS matrix: both complete records remain in the native table');
    assert.equal(await page.locator('[data-sc-matrix-controls]').count(), 0, 'no-JS matrix: no inert controls are exposed');
    const region = page.locator('[data-sc-matrix-nav]');
    await region.focus();
    await page.keyboard.press('ArrowRight');
    // Poll from the runner: page-side rAF/interval polling is disabled together
    // with author JavaScript in this context.
    let moved = false;
    for (let attempt = 0; attempt < 20 && !moved; attempt++) {
      await page.waitForTimeout(50);
      moved = await region.evaluate(el => el.scrollLeft > 0);
    }
    assert(moved, 'no-JS matrix: native ArrowRight still pans the focused table');
    await page.getByRole('link', { name: 'Candidate A', exact: true }).click();
    assert.equal(new URL(page.url()).hash, '#brief-candidate-a', 'no-JS matrix: real candidate anchors still navigate');
    console.log('  ok no-JS matrix: complete records, native keyboard panning and candidate navigation');
  } finally { await context.close(); }
}
