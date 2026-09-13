import assert from 'node:assert/strict';

// The pick is a selection rule, so it is checked by pressing, not by reading a
// stylesheet: a press at a mark's own centre must select that mark or ask —
// never a neighbour — and the panel must behave like a popover, not a modal.
export async function checkPick(browser, base) {
  for (const width of [390, 1280]) for (const theme of ['light', 'dark']) {
    const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 900 },
      colorScheme: theme, isMobile: width === 390, hasTouch: width === 390 });
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    try {
      await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.fulfill({ status: 200, body: '' }));
      await page.goto(`${base}/styleguide.html`);
      await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
      await page.locator('#sg-pick-plot').scrollIntoViewIfNeeded();

      // Every mark: a press at its own centre either takes it or asks about it.
      // Never a neighbour, which is what a z-order hit test hands back.
      const marks = await page.evaluate(() => document.querySelectorAll('#sg-pick-plot [data-site]').length);
      assert.equal(marks, 14, 'the specimen draws its fourteen marks');
      let asked = 0, taken = 0;
      for (let i = 0; i < marks; i++) {
        const c = await page.evaluate((n) => {
          const r = document.querySelectorAll('#sg-pick-plot [data-site]')[n].getBoundingClientRect();
          return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        }, i);
        await page.mouse.move(c.x, c.y);
        await page.mouse.down();
        await page.mouse.up();
        const got = await page.evaluate((n) => {
          const panel = document.querySelector('#sg-pick-panel');
          const want = document.querySelectorAll('[data-site-row]')[n].textContent.trim();
          const listed = [...panel.querySelectorAll('.sc-pick__item .sc-pick__name')].map((e) => e.textContent);
          return { want, open: !panel.hidden, listed,
            chosen: document.querySelector('#sg-pick-selection').textContent,
            title: document.querySelector('#sg-pick-title').textContent };
        }, i);
        if (got.open) {
          asked++;
          assert.equal(got.listed[0], got.want, `a press on ${got.want} lists it first`);
          assert.match(got.title, /^\d+ sites within a finger/, 'the panel states the count');
          await page.keyboard.press('Escape');
        } else {
          taken++;
          assert(got.chosen.startsWith(got.want), `a press on ${got.want} selected ${got.chosen}`);
        }
      }
      assert(asked > 0 && taken > 0, 'the specimen exercises both the crowded and the lone press');

      // A popover, not a modal: the marks behind it stay live, Tab may leave,
      // and Escape hands the focus back to what opened the panel.
      const crowd = await page.evaluate(() => {
        const r = document.querySelectorAll('#sg-pick-plot [data-site]')[6].getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });
      await page.mouse.move(crowd.x, crowd.y); await page.mouse.down(); await page.mouse.up();
      const popover = await page.evaluate(() => {
        const panel = document.querySelector('#sg-pick-panel');
        return { modal: panel.getAttribute('aria-modal'), role: panel.getAttribute('role'),
          labelled: !!document.getElementById(panel.getAttribute('aria-labelledby')),
          focus: document.activeElement.className,
          item: Math.round(document.querySelector('.sc-pick__item').getBoundingClientRect().height),
          more: document.querySelector('[data-pick="more"]').hidden
            ? null : document.querySelector('[data-pick="more"]').textContent,
          shown: panel.querySelectorAll('.sc-pick__item').length,
          claimed: Number(/^(\d+)/.exec(document.querySelector('#sg-pick-title').textContent)[1]) };
      });
      assert.equal(popover.modal, null, 'the panel never claims aria-modal over a live page');
      assert.equal(popover.role, 'dialog');
      assert(popover.labelled, 'aria-labelledby resolves to the heading');
      assert.match(popover.focus, /sc-pick__item/, 'the nearest option takes the focus');
      assert(popover.item >= 44, `options keep a 44px target (${popover.item}px)`);
      assert(popover.shown < popover.claimed, 'the specimen crowd is longer than the panel shows at once');
      assert(popover.more !== null, '__more is visible whenever the list is capped — a scroller that hides its own length reads as a short list');
      assert.equal(popover.shown + Number(/other (\d+)/.exec(popover.more)[1]), popover.claimed,
        'what is shown plus what __more names is exactly what the heading claims');

      // Escape returns to the opener, never to the mark the browser hit-tested.
      // Choosing from the panel is what puts the crowd back within reach of the
      // keyboard, so the button that reopens it is the opener under test.
      await page.evaluate(() => document.querySelector('#sg-pick-panel .sc-pick__item').click());
      assert(await page.evaluate(() => !document.querySelector('#sg-pick-open').hidden),
        'choosing from a crowd leaves a way back into it');
      await page.evaluate(() => document.querySelector('#sg-pick-open').click());
      await page.keyboard.press('Escape');
      const after = await page.evaluate(() => ({ hidden: document.querySelector('#sg-pick-panel').hidden,
        active: document.activeElement.id }));
      assert(after.hidden && after.active === 'sg-pick-open', `escape returned to ${after.active}`);

      assert.deepEqual(errors, [], 'no browser page errors');
      console.log(`  ok pick ${width}px ${theme}: ${marks} marks pressed at their own centres (${taken} taken, ${asked} asked), popover focus and Escape`);
    } finally { await page.close(); }
  }
}
