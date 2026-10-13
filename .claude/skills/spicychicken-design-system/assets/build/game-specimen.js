// Specimen-only: paints ILLUSTRATIVE flat art on each [data-sc-game-specimen]
// canvas and wires the specimen's own buttons. No engine, no WebGL, no game
// rules, no persistence, no key listeners. The colours below are WORLD
// materials (snow, timber, coins, a purple key): game art, deliberately not
// --sc-* tokens and never used for HUD text. See GAME-PATTERNS.md.
(function () {
  'use strict';
  var SCENES = {
    bright: 'a bright snow field with a timber arch and two gold coins',
    dark: 'a dark ice cave with a purple key on the floor'
  };
  function rect(c, colour, x, y, w, h) { c.fillStyle = colour; c.fillRect(x, y, w, h); }
  function disc(c, colour, x, y, r) { c.fillStyle = colour; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); }
  function shape(c, colour, points) {
    c.fillStyle = colour; c.beginPath(); c.moveTo(points[0], points[1]);
    for (var i = 2; i < points.length; i += 2) c.lineTo(points[i], points[i + 1]);
    c.closePath(); c.fill();
  }
  function snow(c, w, h) {
    var horizon = h * 0.46, u = Math.min(w, h) / 100;
    rect(c, '#F7FAFD', 0, 0, w, horizon);                       // pale sky
    shape(c, '#E4ECF4', [0, horizon, w * 0.22, horizon - 9 * u, w * 0.48, horizon - 3 * u, w * 0.74, horizon - 11 * u, w, horizon - 4 * u, w, horizon]);
    rect(c, '#FFFFFF', 0, horizon, w, h - horizon);              // fresh snow
    shape(c, '#EEF3F8', [0, h * 0.78, w * 0.35, h * 0.7, w * 0.62, h * 0.8, w, h * 0.72, w, h * 0.74, w * 0.62, h * 0.83, w * 0.35, h * 0.73, 0, h * 0.81]);
    var ax = w * 0.62, ay = horizon + 4 * u, aw = 26 * u, ah = 22 * u;   // timber arch
    rect(c, '#7B4B2A', ax, ay, 4 * u, ah);
    rect(c, '#7B4B2A', ax + aw - 4 * u, ay, 4 * u, ah);
    rect(c, '#6A3F22', ax - 2 * u, ay - 4 * u, aw + 4 * u, 5 * u);
    disc(c, '#E2B13C', w * 0.36, horizon + 18 * u, 2.6 * u);    // gold coins
    disc(c, '#E2B13C', w * 0.43, horizon + 24 * u, 2.6 * u);
    disc(c, '#C9D7E5', w * 0.5, h * 0.66, 10 * u);               // snowball: outline, shadow side, lit side
    disc(c, '#DCE6F0', w * 0.5, h * 0.66, 9.2 * u);
    disc(c, '#FFFFFF', w * 0.5 - 1.2 * u, h * 0.66 - 1.2 * u, 7.8 * u);
  }
  function cave(c, w, h) {
    var floor = h * 0.62, u = Math.min(w, h) / 100;
    rect(c, '#07090C', 0, 0, w, h);                               // near-black rock
    shape(c, '#10151C', [0, 0, w * 0.18, h * 0.3, w * 0.1, floor, 0, floor]);
    shape(c, '#10151C', [w, 0, w * 0.84, h * 0.34, w * 0.9, floor, w, floor]);
    rect(c, '#0C1016', 0, floor, w, h - floor);                    // cave floor
    shape(c, '#16202B', [w * 0.38, floor, w * 0.46, floor - 16 * u, w * 0.54, floor - 10 * u, w * 0.6, floor]);  // ice
    rect(c, '#6B3FA8', w * 0.66, floor + 8 * u, 7 * u, 2 * u);   // purple key: a silhouette, named in words in the HUD
    disc(c, '#6B3FA8', w * 0.66, floor + 9 * u, 2.6 * u);
    disc(c, '#0C1016', w * 0.66, floor + 9 * u, 1.1 * u);
    rect(c, '#6B3FA8', w * 0.66 + 5 * u, floor + 10 * u, 1.2 * u, 2 * u);
  }
  function paint(stage) {
    var canvas = stage.querySelector('.sc-game__canvas');
    if (!canvas || !canvas.getContext) return;
    var ratio = Math.min(window.devicePixelRatio || 1, 2);
    var width = Math.max(1, Math.round(canvas.clientWidth * ratio)), height = Math.max(1, Math.round(canvas.clientHeight * ratio));
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    var scene = stage.getAttribute('data-sc-game-scene') === 'dark' ? 'dark' : 'bright';
    var c = canvas.getContext('2d');
    if (!c) return;
    (scene === 'dark' ? cave : snow)(c, width, height);
    canvas.setAttribute('aria-label', 'Illustrative art, not a game: ' + SCENES[scene]);
  }
  function wireScene(stage) {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-sc-game-scene-choice][aria-controls="' + stage.id + '"]'));
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        stage.setAttribute('data-sc-game-scene', button.getAttribute('data-sc-game-scene-choice'));
        buttons.forEach(function (item) { item.setAttribute('aria-pressed', String(item === button)); });
        paint(stage);
      });
    });
  }
  function wireCapture(stage) {
    var layer = stage.querySelector('[data-sc-game-capture-layer]');
    if (!layer) return;
    var canvas = stage.querySelector('.sc-game__canvas'), hud = stage.querySelector('.sc-game__hud');
    var play = layer.querySelector('[data-sc-game-play]'), keyboard = layer.querySelector('[data-sc-game-keyboard]');
    var notice = layer.querySelector('[data-sc-game-denied]'), status = layer.querySelector('[data-sc-game-status]');
    var heading = layer.querySelector('[data-sc-game-heading]'), message = layer.querySelector('[data-sc-game-message]');
    var pause = stage.querySelector('[data-sc-game-pause]'), controller = null;
    var REASONS = {
      escape: 'Escape released the mouse. The level is paused until you resume.',
      blur: 'The window lost focus, so the mouse was released and the level paused.',
      api: 'Paused from the HUD. The mouse is released.'
    };
    // While the layer covers the stage, the canvas and the HUD's CONTROLS are
    // inert so focus cannot reach what the layer hides. The HUD itself stays
    // in the accessibility tree: the level heading and objective are the
    // page's h1 and must not vanish while the game waits or is paused.
    var controls = Array.prototype.slice.call(hud.querySelectorAll('a[href], button, input, select, summary, textarea, [tabindex]'));
    function background(inert) { canvas.inert = inert; controls.forEach(function (control) { control.inert = inert; }); }
    function show(view) {
      heading.textContent = view.heading; status.textContent = view.status;
      message.textContent = view.message; play.textContent = view.play;
      notice.hidden = keyboard.hidden = !view.denied;
      play.setAttribute('aria-describedby', (view.denied ? notice.id + ' ' : '') + message.id);
      layer.hidden = false; background(true);
    }
    function denied() { show({ heading: 'Play with the keyboard, or try again', status: 'not captured', message: 'The mouse was not captured. Nothing is lost.', play: 'Try again', denied: true }); }
    function hide() { layer.hidden = true; background(false); }
    background(true);
    play.addEventListener('click', function () {
      var game = window.SC && window.SC.game;
      if (!game) { denied(); message.textContent = 'The optional sc-game.js runtime did not load, so the mouse cannot be captured.'; play.focus(); return; }
      background(false);
      controller = game.capture(stage, {
        target: canvas,
        resumeControl: play,
        onCapture: function () { hide(); canvas.focus({ preventScroll: true }); },
        onRelease: function (reason) { show({ heading: 'Paused', status: 'paused', message: REASONS[reason] || REASONS.api, play: 'Resume' }); },
        onDenied: denied
      });
      controller.request();
    });
    keyboard.querySelector('button').addEventListener('click', function () { hide(); canvas.focus({ preventScroll: true }); });
    if (pause) pause.addEventListener('click', function () {
      if (controller && controller.state === 'captured') { controller.release(); return; }
      if (controller && controller.state === 'denied') denied();
      else show({ heading: 'Paused', status: 'paused', message: REASONS.api, play: 'Resume' });
      play.focus();
    });
  }
  function wireResults() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-sc-game-results-open]'), function (opener) {
      var dialog = document.getElementById(opener.getAttribute('aria-controls'));
      if (!dialog || typeof dialog.showModal !== 'function') { opener.hidden = true; return; }
      var primary = dialog.querySelector('[data-sc-game-results-next]');
      opener.addEventListener('click', function () { dialog.showModal(); if (primary) primary.focus(); });
      dialog.addEventListener('close', function () { opener.focus(); });
      Array.prototype.forEach.call(dialog.querySelectorAll('[data-sc-game-results-next], [data-sc-game-results-close]'), function (button) {
        button.addEventListener('click', function () { dialog.close(); });
      });
    });
  }
  var stages = Array.prototype.slice.call(document.querySelectorAll('[data-sc-game-specimen]'));
  stages.forEach(function (stage) { paint(stage); wireScene(stage); wireCapture(stage); });
  wireResults();
  if (window.ResizeObserver) {
    var observer = new ResizeObserver(function (entries) {
      entries.forEach(function (entry) { var stage = entry.target.closest('[data-sc-game-specimen]'); if (stage) paint(stage); });
    });
    stages.forEach(function (stage) { var canvas = stage.querySelector('.sc-game__canvas'); if (canvas) observer.observe(canvas); });
  } else window.addEventListener('resize', function () { stages.forEach(paint); });
})();
