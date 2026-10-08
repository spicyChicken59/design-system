/* SpicyChicken Design System — sc-activity.js v2.15.0 · source: build/activity.js */
/* Dated activity inspection. Native buttons and a table remain usable without
   this optional enhancement. Values, labels and tone bins belong to the caller.
   SC.activity.init(root) returns controllers with refresh() and dispose(). */
(function (w) {
  'use strict';
  var SC = w.SC = w.SC || {}, mounted = new WeakMap();
  function attach(host) {
    if (mounted.has(host)) return mounted.get(host);
    var grid = host.querySelector('.sc-activity__grid');
    var output = host.querySelector('[data-sc-activity-selection]');
    if (!grid || !output) return null;
    var days = [], cells = [], originals = [], listeners = [], selected = 0;
    var originalText = output.textContent, disposed = false;
    function restore() {
      listeners.forEach(function (entry) { entry[0].removeEventListener(entry[1], entry[2]); });
      originals.forEach(function (entry) {
        ['tabindex', 'aria-pressed'].forEach(function (name, i) {
          if (entry[i + 1] === null) entry[0].removeAttribute(name);
          else entry[0].setAttribute(name, entry[i + 1]);
        });
      });
      listeners = []; originals = [];
    }
    function choose(index, focus) {
      if (!days.length) return;
      selected = Math.max(0, Math.min(days.length - 1, index));
      days.forEach(function (day, i) {
        day.setAttribute('tabindex', i === selected ? '0' : '-1');
        day.setAttribute('aria-pressed', String(i === selected));
      });
      output.textContent = days[selected].getAttribute('aria-label');
      if (focus) days[selected].focus();
    }
    function columns() {
      var tracks = w.getComputedStyle(grid).gridTemplateColumns.trim();
      return tracks && tracks !== 'none' ? Math.max(1, tracks.split(/\s+/).length) : 1;
    }
    function refresh() {
      if (disposed) return;
      var date = days[selected] && days[selected].getAttribute('data-date');
      restore();
      cells = Array.prototype.slice.call(grid.querySelectorAll('button[data-date]')).filter(function (day) {
        return !day.hidden && /^\d{4}-\d{2}-\d{2}$/.test(day.getAttribute('data-date') || '') && (day.getAttribute('aria-label') || '').trim();
      });
      days = cells.filter(function (day) { return !day.disabled; });
      if (!days.length) { output.textContent = originalText; return; }
      days.forEach(function (day, index) {
        originals.push([day, day.getAttribute('tabindex'), day.getAttribute('aria-pressed')]);
        function click() { choose(index, false); }
        function key(event) {
          if (event.target !== day || event.altKey || event.ctrlKey || event.metaKey) return;
          var delta = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
          var next = event.key === 'Home' ? 0 : event.key === 'End' ? days.length - 1 : delta === undefined ? null : index + delta;
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            var step = columns() * (event.key === 'ArrowDown' ? 1 : -1);
            var position = cells.indexOf(day) + step;
            while (position >= 0 && position < cells.length && cells[position].disabled) position += step;
            next = position >= 0 && position < cells.length ? days.indexOf(cells[position]) : index;
          }
          if (next === null) return;
          event.preventDefault(); choose(next, true);
        }
        day.addEventListener('click', click); day.addEventListener('keydown', key);
        listeners.push([day, 'click', click], [day, 'keydown', key]);
      });
      var previous = days.findIndex(function (day) { return day.getAttribute('data-date') === date; });
      var authored = days.findIndex(function (day) { return day.getAttribute('aria-pressed') === 'true'; });
      choose(previous >= 0 ? previous : authored >= 0 ? authored : 0, false);
    }
    var controller = { refresh: refresh, dispose: function () {
      if (disposed) return;
      restore(); output.textContent = originalText; disposed = true; mounted.delete(host);
    } };
    mounted.set(host, controller); refresh(); return controller;
  }
  SC.activity = { init: function (root) {
    root = root || w.document;
    var hosts = Array.prototype.slice.call(root.querySelectorAll('[data-sc-activity]'));
    if (root.matches && root.matches('[data-sc-activity]')) hosts.unshift(root);
    return hosts.map(attach).filter(Boolean);
  } };
  if (w.document.readyState === 'loading') w.document.addEventListener('DOMContentLoaded', function () { SC.activity.init(); }, { once: true });
  else SC.activity.init();
})(window);
