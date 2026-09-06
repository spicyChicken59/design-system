// Chart compatibility and native-table lifecycle coverage for sc-charts.js.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

export function checkMatrixBundleSource(root) {
  const source = readFileSync(join(root, 'build/charts.js'), 'utf8');
  const bundle = readFileSync(join(root, 'sc-charts.js'), 'utf8');
  const boundary = '/* Optional signal-matrix criterion navigation */';
  assert.equal(bundle.slice(bundle.indexOf('\n') + 1, bundle.indexOf(boundary)), source + '\n', 'bundle: chart implementation is composed verbatim before optional navigation');
  for (const document of [undefined, {}]) {
    const original = { window: {} }, composed = { window: {} };
    if (document) { original.document = document; composed.document = document; }
    vm.runInNewContext(source, original);
    vm.runInNewContext(bundle, composed);
    assert.deepEqual(Object.keys(composed.window.SC).sort(), Object.keys(original.window.SC).sort(), 'bundle: minimal-DOM chart exports are unchanged');
    for (const [name, value] of Object.entries(original.window.SC)) {
      assert.equal(typeof composed.window.SC[name], typeof value, `bundle: ${name} keeps its export type`);
      if (typeof value === 'function') assert.equal(String(composed.window.SC[name]), String(value), `bundle: ${name} implementation is untouched`);
      else assert.equal(JSON.stringify(composed.window.SC[name]), JSON.stringify(value), `bundle: ${name} constants are untouched`);
    }
  }
}

export async function checkAutomaticMatrixBundle(browser, root, base) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.fulfill({ status: 200, body: '' }));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const table = `<thead><tr><th>Record</th><th>Asking price</th><th>Mileage</th><th>Certification</th><th>Accident record</th></tr></thead><tbody><tr><th scope="row">Candidate A</th><td>$32,400</td><td>18,400 miles</td><td>Not supplied</td><td>Unknown</td></tr></tbody>`;
  await page.route('**/__matrix_bundle_fixture.html', route => route.fulfill({ contentType: 'text/html', body: `<!doctype html><html><head><link rel="stylesheet" href="/sc.css"><script src="/sc-charts.js"></script></head><body><div id="wrapper"><div id="dynamic" class="sc-table-scroll" tabindex="0" role="region" aria-label="Candidate evidence"><table class="sc-table sc-signal-matrix"></table></div></div><div id="values" class="sc-table-scroll"><table class="sc-table sc-signal-matrix sc-signal-matrix--values">${table}</table></div><div id="grouped" class="sc-table-scroll"><table class="sc-table sc-signal-matrix"><thead><tr><th colspan="5">Combined criteria</th></tr><tr><th>Record</th><th>One</th><th>Two</th><th>Three</th><th>Four</th></tr></thead></table></div><details id="later"><summary>More evidence</summary></details><div id="chart"></div></body></html>` }));
  try {
    await page.goto(`${base}/__matrix_bundle_fixture.html`, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('[data-sc-matrix-controls]').count(), 0, 'bundle: synchronous head script leaves empty, values and grouped matrices alone');
    assert(await page.evaluate(() => !!SC.matrixTables && typeof SC.tableTwin === 'function'), 'bundle: native-table lifecycle and chart exports coexist');
    await page.locator('#dynamic table').evaluate((element, html) => element.innerHTML = html, table);
    const controls = page.locator('#dynamic').locator('xpath=preceding-sibling::*[1]');
    await controls.waitFor({ state: 'visible' });
    assert.deepEqual(await controls.locator('button').allTextContents(), ['Asking price', 'Mileage', 'Certification', 'Accident record'], 'bundle: async native headers become full authored criterion names');
    await page.evaluate(() => {
      window.bundleController = SCMatrixNav.attach(document.querySelector('#dynamic'));
      window.originalButton = document.querySelector('[data-sc-matrix-controls] button');
      window.originalButton.focus();
      document.querySelector('#dynamic tbody td').textContent = 'Updated fixture value';
      document.querySelector('#chart').innerHTML = '<svg><circle cx="4" cy="4" r="2"/></svg>';
    });
    await page.waitForTimeout(40);
    assert(await page.evaluate(() => originalButton === document.querySelector('[data-sc-matrix-controls] button') && document.activeElement === originalButton), 'bundle: body values and unrelated chart mutations do not rebuild controls or disturb focus');
    await page.addScriptTag({ path: join(root, 'sc-matrix-nav.js') });
    assert(await page.evaluate(() => SCMatrixNav.attach(document.querySelector('#dynamic')) === bundleController), 'bundle: loading standalone helper too does not duplicate the instance');
    assert.equal(await page.locator('[data-sc-matrix-controls]').count(), 1, 'bundle: one control group per region');
    await page.locator('#dynamic table').evaluate((element, html) => element.innerHTML = html.replace('Asking price', 'Supplied price'), table);
    await page.getByRole('button', { name: 'Supplied price', exact: true }).waitFor();
    assert(await page.evaluate(() => SCMatrixNav.attach(document.querySelector('#dynamic')) === bundleController), 'bundle: replaced header nodes retain the region controller');
    await page.locator('#dynamic table').evaluate(element => element.replaceWith(element.cloneNode(true)));
    await page.waitForTimeout(40);
    assert(await page.evaluate(() => SCMatrixNav.attach(document.querySelector('#dynamic')) === bundleController), 'bundle: replacing the entire table retains the region controller');
    await page.evaluate(() => document.querySelector('#later').append(document.querySelector('#wrapper')));
    await controls.waitFor({ state: 'hidden' });
    assert(await page.evaluate(() => SCMatrixNav.attach(document.querySelector('#dynamic')) === bundleController), 'bundle: a same-node wrapper move retains its controller');
    await page.getByText('More evidence', { exact: true }).click();
    await controls.waitFor({ state: 'visible' });
    assert.equal(await page.locator('[data-sc-matrix-controls]').count(), 1, 'bundle: moving a wrapper into a disclosure rebinds its open/close lifecycle');
    await page.locator('#dynamic').evaluate(region => region.setAttribute('data-sc-matrix-nav', 'off'));
    await page.waitForFunction(() => !document.querySelector('[data-sc-matrix-controls]'));
    assert.equal(await page.locator('#dynamic tbody tr').count(), 1, 'bundle: opt-out removes controls while retaining the table');
    await page.locator('#dynamic').evaluate(region => region.removeAttribute('data-sc-matrix-nav'));
    await controls.waitFor({ state: 'visible' });
    await page.locator('#values').evaluate(region => region.setAttribute('data-sc-matrix-nav', ''));
    await page.waitForFunction(() => document.querySelectorAll('[data-sc-matrix-controls]').length === 2);
    await page.locator('#wrapper').evaluate(wrapper => wrapper.remove());
    await page.waitForFunction(() => document.querySelectorAll('[data-sc-matrix-controls]').length === 1);
    assert(await page.evaluate(() => !document.querySelector('#dynamic')), 'bundle: removed cards release their controls');
    await page.evaluate(() => SC.matrixTables.destroy());
    assert.equal(await page.locator('[data-sc-matrix-controls]').count(), 0, 'bundle: destroy removes all managed controls');
    await page.locator('#values th').first().evaluate(header => header.textContent = 'Changed after destroy');
    await page.waitForTimeout(40);
    assert.equal(await page.locator('[data-sc-matrix-controls]').count(), 0, 'bundle: destroyed lifecycle does not react to later mutations');
    await page.evaluate(() => SC.matrixTables.init());
    await page.waitForFunction(() => document.querySelectorAll('[data-sc-matrix-controls]').length === 1);
    assert.deepEqual(errors, [], 'bundle: no browser page errors');
    console.log('  ok automatic matrix bundle: unchanged chart exports, head-script startup, async headers, values exclusion, lifecycle, opt-out and cleanup');
  } finally { await context.close(); }
}
