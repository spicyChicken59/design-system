/* Automatic native signal-table navigation in the chart presentation bundle.
 * Reads table headers and layout only. It never reads, changes or infers data.
 * Standalone sc-matrix-nav.js remains explicitly opt-in.
 */
(function (w, d) {
  'use strict';
  if (!w || !d || typeof d.querySelectorAll !== 'function' || !d.documentElement
    || typeof d.documentElement.contains !== 'function' || !w.SCMatrixNav) return;
  const SC = w.SC = w.SC || {};
  if (SC.matrixTables) return;
  const selector = '.sc-table-scroll > table.sc-signal-matrix, [data-sc-matrix-nav] > table';
  const records = new Map();
  let observer = null;
  let queued = false;
  let active = false;
  let ready = null;

  function eligible(table) {
    const region = table.parentElement;
    if (!region || region.querySelector('table') !== table || !table.matches(selector)
      || region.getAttribute('data-sc-matrix-nav') === 'off'
      || table.getAttribute('data-sc-matrix-nav') === 'off') return false;
    const explicit = region.hasAttribute('data-sc-matrix-nav') || table.hasAttribute('data-sc-matrix-nav');
    if (table.classList.contains('sc-signal-matrix--values') && !explicit) return false;
    const rows = table.tHead && table.tHead.rows;
    return !!rows && rows.length === 1 && rows[0].cells.length > 1
      && Array.from(rows[0].cells).every(cell => cell.tagName === 'TH' && cell.colSpan === 1 && cell.rowSpan === 1);
  }
  function headerState(table, region) {
    const cells = table.tHead ? Array.from(table.tHead.querySelectorAll('th, td')) : [];
    const disclosures = [];
    for (let parent = region.parentElement; parent; parent = parent.parentElement) {
      if (parent.tagName === 'DETAILS') disclosures.push(parent);
    }
    return {
      cells, disclosures,
      label: region.getAttribute('aria-label') + '|' + region.getAttribute('data-sc-matrix-nav-label'),
      words: cells.map(cell => [cell.textContent, cell.getAttribute('data-sc-label'), cell.colSpan, cell.rowSpan].join('\u001f')).join('\u001e')
    };
  }
  function same(a, b) {
    return a.label === b.label && a.words === b.words && a.cells.length === b.cells.length
      && a.cells.every((cell, index) => cell === b.cells[index])
      && a.disclosures.length === b.disclosures.length
      && a.disclosures.every((details, index) => details === b.disclosures[index]);
  }
  function refresh() {
    if (!active) return api;
    records.forEach((record, region) => {
      const current = region.querySelector('table');
      if (!d.documentElement.contains(region) || !current || !eligible(current) || current.parentElement !== region) {
        record.controller.destroy();
        records.delete(region);
      }
    });
    d.querySelectorAll(selector).forEach(table => {
      if (!eligible(table)) return;
      const region = table.parentElement;
      const state = headerState(table, region);
      const record = records.get(region);
      if (record) {
        const moved = record.parent !== region.parentElement || record.controls.nextElementSibling !== region;
        const focus = moved && record.controls.contains(d.activeElement) ? d.activeElement.dataset.scMatrixColumn : null;
        if (moved) region.before(record.controls);
        if (moved || record.table !== table || !same(record.state, state)) {
          record.controller.refresh();
          record.table = table;
          record.state = state;
          record.parent = region.parentElement;
        }
        if (focus !== null) {
          const replacement = Array.from(record.controls.querySelectorAll('button')).find(button => button.dataset.scMatrixColumn === focus);
          if (replacement && !record.controls.hidden) replacement.focus({ preventScroll: true });
          else region.focus({ preventScroll: true });
        }
      } else {
        const controller = w.SCMatrixNav.attach(region);
        if (controller) records.set(region, { table, state, controller, parent: region.parentElement, controls: region.previousElementSibling });
      }
    });
    return api;
  }
  function schedule() {
    if (queued || !active) return;
    queued = true;
    Promise.resolve().then(() => {
      queued = false;
      if (active) refresh();
    });
  }
  function relevant(change) {
    const element = change.target.nodeType === 1 ? change.target : change.target.parentElement;
    if (!element || element.closest('[data-sc-matrix-controls], [data-sc-matrix-nav-style]')) return false;
    const table = element.closest('table');
    if (table && (table.matches(selector) || records.has(table.parentElement))) return true;
    if (records.has(element) || element.matches('[data-sc-matrix-nav], .sc-table-scroll')) return true;
    if (change.type !== 'childList') return false;
    return Array.from(change.addedNodes).concat(Array.from(change.removedNodes)).some(node =>
      node.nodeType === 1 && !node.matches('[data-sc-matrix-controls], [data-sc-matrix-nav-style]')
      && (node.matches(selector) || node.matches('.sc-table-scroll, [data-sc-matrix-nav]') || !!node.querySelector(selector)));
  }
  function init() {
    active = true;
    refresh();
    if (!observer && w.MutationObserver) {
      observer = new w.MutationObserver(changes => { if (changes.some(relevant)) schedule(); });
      observer.observe(d.documentElement, {
        subtree: true, childList: true, characterData: true, attributes: true,
        attributeFilter: ['class', 'data-sc-matrix-nav', 'data-sc-label', 'aria-label', 'data-sc-matrix-nav-label', 'colspan', 'rowspan']
      });
    }
    return api;
  }
  function destroy() {
    active = false;
    if (ready) { d.removeEventListener('DOMContentLoaded', ready); ready = null; }
    if (observer) { observer.disconnect(); observer = null; }
    records.forEach(record => record.controller.destroy());
    records.clear();
    return api;
  }
  const api = SC.matrixTables = { init, refresh, destroy };
  if (d.readyState === 'loading' && typeof d.addEventListener === 'function') {
    ready = () => { ready = null; init(); };
    d.addEventListener('DOMContentLoaded', ready, { once: true });
  } else init();
})(typeof window === 'undefined' ? null : window, typeof document === 'undefined' ? null : document);
