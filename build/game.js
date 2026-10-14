/* Game shell runtime: pointer capture lifecycle and display formatters.
   Engine-independent and optional. Loading it registers window.SC.game and
   does nothing else: no listener, no attribute, no request. The engine owns
   input; this file never listens for keys and never calls preventDefault.

   SC.game.capture(stage, options) -> controller (one per stage)
     options.target         element to lock (default: stage's .sc-game__canvas)
     options.onCapture()    the pointer is locked to target
     options.onRelease(r)   r is 'escape' (browser exit), 'blur' or 'api'
     options.onDenied(e)    the request failed; e is an Error/DOMException
     options.resumeControl  focused after a release or a denial
   controller.request()  call from a Play/Resume click, never on load/focus/key
   controller.release()  exits the lock programmatically (reason 'api')
   controller.state      'idle' | 'requesting' | 'captured' | 'released' | 'denied'
   controller.dispose()  removes every listener, exits a held lock, restores
                         the stage's previous data-sc-capture value. Disposed
                         mid-request, it leaves one self-removing guard that
                         exits a lock the browser grants afterwards (unless a
                         new controller has mounted on the stage and adopts it).

   SC.game.formatElapsed(ms, { places: 2 }) -> "m:ss.cc", minutes unbounded
   SC.game.formatMeasure(value, { places: 1 }) -> "37.9"
   Both TRUNCATE toward zero and never round up: 179999 ms is "2:59.99", not
   "3:00.00". Truncation is presentation only — compare the raw numbers for
   rules (an inclusive 180 s limit, a strict "> 100" threshold). */
(function (w) {
  'use strict';
  var SC = w.SC = w.SC || {};
  var controllers = new WeakMap();
  var guards = new WeakMap();   // stage -> cancels a disposed controller's late-lock guard

  function places(options, fallback, max) {
    var p = options && options.places;
    return typeof p === 'number' && p >= 0 && p <= max && Math.floor(p) === p ? p : fallback;
  }
  function pad(n, width) { var s = String(n); while (s.length < width) s = '0' + s; return s; }

  function formatElapsed(ms, options) {
    var p = places(options, 2, 3);
    if (typeof ms !== 'number' || !(ms > 0) || ms === Infinity) ms = 0;
    // Whole milliseconds first (exact), then whole display units of 10^(3-p) ms.
    var units = Math.floor(Math.floor(ms) / Math.pow(10, 3 - p));
    var perSecond = Math.pow(10, p);
    var seconds = Math.floor(units / perSecond);
    var text = Math.floor(seconds / 60) + ':' + pad(seconds % 60, 2);
    return p ? text + '.' + pad(units % perSecond, p) : text;
  }

  // The shortest decimal that round-trips the double, so 4.35 truncates to
  // 4.35 and not to 4.34 (4.35 * 100 is 434.99999999999994 in binary).
  function decimal(x) {
    if (x >= 1e21) return BigInt(x).toString();
    var s = String(x);
    return /e/i.test(s) ? x.toFixed(20) : s;
  }
  function formatMeasure(value, options) {
    var p = places(options, 1, 6);
    if (typeof value !== 'number' || !isFinite(value)) value = 0;
    var parts = decimal(Math.abs(value)).split('.');
    var fraction = ((parts[1] || '') + '000000').slice(0, p);
    var text = parts[0] + (p ? '.' + fraction : '');
    return value < 0 && /[1-9]/.test(text) ? '-' + text : text;
  }

  function capture(stage, options) {
    if (!stage || typeof stage.setAttribute !== 'function') throw new TypeError('SC.game.capture: a stage element is required');
    var live = controllers.get(stage);
    if (live) return live;
    if (guards.has(stage)) guards.get(stage)();   // a new controller adopts any late lock
    options = options || {};
    var target = options.target || (stage.querySelector && stage.querySelector('.sc-game__canvas'));
    if (!target) throw new TypeError('SC.game.capture: no target and no .sc-game__canvas in the stage');
    var doc = target.ownerDocument || stage.ownerDocument || w.document;
    var view = doc.defaultView || w;
    var hadState = stage.hasAttribute('data-sc-capture'), previous = stage.getAttribute('data-sc-capture');
    var state = 'idle', disposed = false, listeners = [], pending = null;

    function set(next) { state = next; stage.setAttribute('data-sc-capture', next); }
    function call(fn, value) { if (typeof fn === 'function') fn(value); }
    function resume() {
      var control = options.resumeControl;
      if (!disposed && control && typeof control.focus === 'function') control.focus();
    }
    function locked() { return doc.pointerLockElement === target; }
    function listen(node, type, fn) { node.addEventListener(type, fn); listeners.push([node, type, fn]); }
    function asError(reason) {
      if (reason instanceof Error || (reason && typeof reason.name === 'string' && typeof reason.message === 'string')) return reason;
      var error = new Error('The browser did not capture the pointer');
      error.cause = reason;
      return error;
    }
    function deny(reason) {
      if (disposed || state !== 'requesting') return;
      set('denied');
      call(options.onDenied, asError(reason));
      resume();
    }
    function released(reason) {
      if (disposed || state !== 'captured') return;
      set('released');
      call(options.onRelease, reason);
      resume();
    }
    function onChange() {
      if (disposed) return;
      if (locked()) {
        if (state !== 'captured') { set('captured'); call(options.onCapture); }
      } else released('escape');
    }
    function onError(event) { deny(event); }
    function onBlur() {
      if (state !== 'captured') return;
      released('blur');
      if (locked() && typeof doc.exitPointerLock === 'function') doc.exitPointerLock();
    }

    // Disposed while a request is in flight: the browser may still grant the
    // lock, and nothing would be left to release it. Watch for exactly one
    // answer, exit a lock on the target, then remove the guard.
    function guard(promise) {
      var done = false;
      function stop() {
        if (done) return;
        done = true;
        doc.removeEventListener('pointerlockchange', onLate);
        doc.removeEventListener('pointerlockerror', stop);
        if (guards.get(stage) === stop) guards.delete(stage);
      }
      function onLate() {
        var held = locked();
        stop();
        if (held && typeof doc.exitPointerLock === 'function') doc.exitPointerLock();
      }
      doc.addEventListener('pointerlockchange', onLate);
      doc.addEventListener('pointerlockerror', stop);
      guards.set(stage, stop);
      if (promise) promise.then(function () { if (!done && locked()) onLate(); }, stop);
    }

    var controller = {
      request: function () {
        if (disposed || state === 'requesting' || state === 'captured') return;
        set('requesting');
        pending = null;
        if (typeof target.requestPointerLock !== 'function') { deny(new Error('Pointer lock is not available in this browser')); return; }
        var result;
        try { result = target.requestPointerLock(); }
        catch (error) { deny(error); return; }
        // Current browsers return a promise; older ones return nothing and
        // report only through pointerlockchange / pointerlockerror.
        if (result && typeof result.then === 'function') { pending = result; result.then(null, deny); }
      },
      release: function () {
        if (state !== 'captured') return;
        var held = locked();
        released('api');
        if (held && typeof doc.exitPointerLock === 'function') doc.exitPointerLock();
      },
      dispose: function () {
        if (disposed) return;
        disposed = true;
        listeners.forEach(function (entry) { entry[0].removeEventListener(entry[1], entry[2]); });
        listeners = [];
        if (locked() && typeof doc.exitPointerLock === 'function') doc.exitPointerLock();
        else if (state === 'requesting') guard(pending);
        if (hadState) stage.setAttribute('data-sc-capture', previous);
        else stage.removeAttribute('data-sc-capture');
        controllers.delete(stage);
      }
    };
    Object.defineProperty(controller, 'state', { enumerable: true, get: function () { return state; } });
    listen(doc, 'pointerlockchange', onChange);
    listen(doc, 'pointerlockerror', onError);
    listen(view, 'blur', onBlur);
    set('idle');
    controllers.set(stage, controller);
    return controller;
  }

  SC.game = { capture: capture, formatElapsed: formatElapsed, formatMeasure: formatMeasure };
})(window);
