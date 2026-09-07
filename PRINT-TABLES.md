# Tables that keep their last row on paper

Scroll on screen; flow on paper. A report table must not keep a `70vh` screen
window or sticky identity cells after printing. The shared stylesheet now
releases `.sc-table-scroll` in print, including its `--tall` variant. SpicyCar
and SpicyStock already use this wrapper for their native evidence tables.

Copy this bounded-screen recipe without adding a second print table:

```html
<div class="sc-table-scroll sc-table-scroll--tall"
     tabindex="0" role="region" aria-label="Observed results">
  <table class="sc-table">
    <caption>Observed results · include the source date here</caption>
    <thead><tr><th scope="col">Record</th><th scope="col">Observation</th></tr></thead>
    <tbody><tr><th scope="row">Record name</th><td>Exact observed value</td></tr></tbody>
  </table>
</div>
```

This is a pagination fix, not automatic report layout. Very wide column sets
still need landscape paper or a dedicated composition. Closed disclosures and
application filters keep their existing behavior; printing does not reveal or
fetch hidden records. No new data, score, decision or motion is introduced.

The existing Chromium gate tests 60 real table rows at 390, 820 and 1280 pixels
in light and dark modes. It checks bounded screen scrolling, keyboard focus,
unbounded print flow, and an unchanged screen return with reduced motion.
