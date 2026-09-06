// Behavioral checks for the opt-in runtime. A small DOM fake keeps this test
// dependency-free while exercising browser events, observer failures and cleanup.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
const source = readFileSync(fileURLToPath(new URL('../sc-motion.js', import.meta.url)), 'utf8');
let checks = 0;
function check(name, run) {
  return Promise.resolve().then(run).then(() => { checks++; }, error => {
    error.message = `${name}: ${error.message}`;
    throw error;
  });
}
class Events {
  constructor() { this.listeners = new Map(); }
  addEventListener(type, fn) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(fn);
  }
  removeEventListener(type, fn) { this.listeners.get(type)?.delete(fn); }
  fire(type, event = {}) {
    [...(this.listeners.get(type) || [])].forEach(fn => fn({ type, target: this, ...event }));
  }
  listenerCount() { return [...this.listeners.values()].reduce((n, set) => n + set.size, 0); }
}
class Element extends Events {
  constructor(tag = 'div', classes = '', attrs = {}) {
    super();
    this.tagName = tag.toUpperCase();
    this.nodeType = 1;
    this.children = [];
    this.attributes = new Map(Object.entries(attrs));
    this.tokens = new Set(classes.split(' ').filter(Boolean));
    this.classList = { add: name => this.tokens.add(name), remove: name => this.tokens.delete(name), contains: name => this.tokens.has(name) };
    this.props = new Map();
    this.style = {
      getPropertyValue: key => this.props.get(key)?.[0] || '',
      getPropertyPriority: key => this.props.get(key)?.[1] || '',
      setProperty: (key, value, priority = '') => this.props.set(key, [value, priority]),
      removeProperty: key => this.props.delete(key)
    };
    this.offsetWidth = 100;
  }
  get isConnected() { return this.nodeType === 9 || !!this.parentElement?.isConnected; }
  append(...elements) { elements.forEach(element => { element.parentElement = this; this.children.push(element); }); return elements[0]; }
  remove() { this.parentElement.children = this.parentElement.children.filter(child => child !== this); this.parentElement = null; }
  contains(element) { return this === element || this.children.some(child => child.contains(element)); }
  matches(selector) {
    return selector.split(',').some(part => {
      part = part.trim();
      if (part.startsWith('.')) return this.tokens.has(part.slice(1));
      const attribute = /^\[([^=\]]+)(?:="([^"]+)")?\]$/.exec(part);
      return attribute && this.attributes.has(attribute[1]) && (attribute[2] === undefined || this.attributes.get(attribute[1]) === attribute[2]);
    });
  }
  querySelectorAll(selector) {
    return this.children.flatMap(child => [...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)]);
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  closest(selector) { return this.matches(selector) ? this : this.parentElement?.closest(selector) || null; }
  setAttribute(key, value) { this.attributes.set(key, String(value)); }
  removeAttribute(key) { this.attributes.delete(key); }
  getAttribute(key) { return this.attributes.get(key) ?? null; }
}
function environment(options = {}) {
  const document = new Element('document');
  document.nodeType = 9;
  document.readyState = options.loading ? 'loading' : 'complete';
  document.documentElement = document.append(new Element('html'));
  const body = document.documentElement.append(new Element('body'));
  document.activeElement = body;
  document.getElementById = id => {
    const walk = node => node.getAttribute('id') === id ? node : node.children.map(walk).find(Boolean);
    return walk(document) || null;
  };
  const window = new Events();
  const preference = new Events();
  preference.matches = !!options.reduced;
  window.matchMedia = () => {
    if (options.mediaFailure) throw new Error('matchMedia failed');
    return preference;
  };
  if (options.legacyMedia) {
    preference.addListener = fn => Events.prototype.addEventListener.call(preference, 'change', fn);
    preference.removeListener = fn => Events.prototype.removeEventListener.call(preference, 'change', fn);
    preference.addEventListener = undefined;
    preference.removeEventListener = undefined;
  }
  const observers = [];
  if (!options.noObserver) {
    window.IntersectionObserver = class {
      constructor(callback) {
        if (options.constructorFailure) throw new Error('observer unavailable');
        this.callback = callback;
        this.observed = new Set();
        observers.push(this);
      }
      observe(element) {
        if (options.observeFailure) throw new Error('cannot observe');
        this.observed.add(element);
      }
      unobserve(element) { this.observed.delete(element); }
      disconnect() { this.disconnected = true; this.observed.clear(); }
    };
  }
  const mutationObservers = [];
  window.MutationObserver = class {
    constructor(callback) { this.callback = callback; mutationObservers.push(this); }
    observe() { this.connected = true; }
    disconnect() { this.connected = false; }
  };
  options.setup?.(body, document);
  vm.runInNewContext(source, { window, document, Map, Set, Promise, Array });
  return {
    api: window.SC.motion, window, document, body, observers, preference, mutationObservers,
    enter(element) { observers.at(-1)?.callback([{ target: element, isIntersecting: true }]); },
    async mutate() { mutationObservers.filter(observer => observer.connected).forEach(observer => observer.callback([])); await Promise.resolve(); }
  };
}
const reveal = () => new Element('section', 'sc-reveal');
await check('visible without JavaScript and a failed setup', () => {
  assert(!source.includes("setAttribute('hidden'"));
  assert(!source.includes("setAttribute('inert'"));
  assert(!source.includes("setAttribute('aria-hidden'"));
  for (const options of [{ noObserver: true }, { constructorFailure: true }, { observeFailure: true }]) {
    let item;
    const env = environment({ ...options, setup: body => { item = body.append(reveal()); } });
    assert(!item.classList.contains('sc-motion-in'));
    assert.equal(item.getAttribute('hidden'), null);
    assert.doesNotThrow(() => env.api.replay());
  }
});
await check('one reveal per element and ending removes animation state', () => {
  let item;
  const env = environment({ setup: body => { item = body.append(reveal()); } });
  assert(!item.classList.contains('sc-motion-in'), 'observing does not hide content');
  assert(env.observers[0].observed.has(item));
  env.enter(item);
  assert(item.classList.contains('sc-motion-in'));
  assert(!env.observers[0].observed.has(item));
  env.document.fire('animationend', { target: item, animationName: 'sc-motion-rise' });
  assert(!item.classList.contains('sc-motion-in'));
  env.enter(item);
  assert(!item.classList.contains('sc-motion-in'), 're-entry does not replay');
  env.api.replay(item);
  env.enter(item);
  assert(item.classList.contains('sc-motion-in'), 'explicit replay does');
});
await check('reduced motion at startup and preference changes', () => {
  let item;
  const env = environment({ reduced: true, setup: body => { item = body.append(reveal()); } });
  env.enter(item);
  assert(!item.classList.contains('sc-motion-in'));
  assert.equal(env.api.reducedMotion, true);
  env.preference.fire('change', { matches: false });
  assert.equal(env.api.reducedMotion, false);
  env.enter(item);
  assert(!item.classList.contains('sc-motion-in'), 'preference change never replays existing content');
  env.api.replay(item);
  env.enter(item);
  assert(item.classList.contains('sc-motion-in'));
  env.preference.fire('change', { matches: true });
  assert(!item.classList.contains('sc-motion-in'));
});
await check('focus cancels an arrival and pending stagger ancestors', () => {
  let outer, inner, button;
  const env = environment({ setup: body => {
    outer = body.append(reveal()); inner = outer.append(reveal()); button = inner.append(new Element('button'));
  } });
  env.enter(outer); env.enter(inner);
  env.document.activeElement = button;
  env.document.fire('focusin', { target: button });
  assert(!outer.classList.contains('sc-motion-in'));
  assert(!inner.classList.contains('sc-motion-in'));
  env.api.replay(outer); env.enter(outer); env.enter(inner);
  assert(!outer.classList.contains('sc-motion-in'));
  assert(!inner.classList.contains('sc-motion-in'));
});
await check('stagger caps waiting and restores author style on destroy', () => {
  let group, items;
  const env = environment({ setup: body => {
    group = body.append(new Element('div', 'sc-stagger'));
    items = Array.from({ length: 12 }, () => group.append(reveal()));
    items[0].style.setProperty('--sc-motion-order', '3', 'important');
  } });
  assert.equal(items[0].style.getPropertyValue('--sc-motion-order'), '0');
  assert.equal(items[11].style.getPropertyValue('--sc-motion-order'), '5');
  assert(!env.observers[0].observed.has(group));
  env.api.destroy(group);
  assert.equal(items[0].style.getPropertyValue('--sc-motion-order'), '3');
  assert.equal(items[0].style.getPropertyPriority('--sc-motion-order'), 'important');
  assert.equal(items[11].style.getPropertyValue('--sc-motion-order'), '');
});
await check('dynamic insertion, removal and explicit subtree teardown', async () => {
  const env = environment();
  const scope = env.body.append(new Element('section'));
  const item = scope.append(reveal());
  await env.mutate();
  assert(env.observers[0].observed.has(item));
  env.api.destroy(scope);
  await env.mutate();
  assert(!env.observers[0].observed.has(item), 'destroyed mounted subtree stays inactive');
  env.api.init(scope);
  assert(env.observers[0].observed.has(item));
  scope.remove();
  await env.mutate();
  assert(!env.observers[0].observed.has(item), 'detached elements and roots are released');
});
await check('pause control clears all running motion and respects explicit replay', () => {
  let item, toggle, label;
  const env = environment({ setup: body => {
    item = body.append(reveal());
    toggle = body.append(new Element('button', '', { 'data-sc-motion-toggle': '' }));
    label = toggle.append(new Element('span', '', { 'data-sc-motion-status': '' }));
  } });
  env.enter(item);
  env.document.fire('click', { target: label });
  assert.equal(env.api.paused, true);
  assert.equal(toggle.getAttribute('aria-pressed'), 'true');
  assert.equal(label.textContent, 'Motion paused');
  assert.equal(env.document.documentElement.getAttribute('data-sc-motion-paused'), 'true');
  assert(!item.classList.contains('sc-motion-in'));
  env.api.replay(); env.enter(item);
  assert(!item.classList.contains('sc-motion-in'));
  env.api.setPaused(false);
  assert.equal(label.textContent, 'Motion enabled');
  assert.equal(toggle.getAttribute('aria-pressed'), 'false');
});
await check('replay controls are scoped and tolerate invalid targets', () => {
  let first, second, replayButton;
  const env = environment({ setup: body => {
    first = body.append(reveal()); first.setAttribute('id', 'first');
    second = body.append(reveal());
    replayButton = body.append(new Element('button', '', { 'data-sc-motion-replay': '#first' }));
  } });
  env.enter(first); env.enter(second);
  env.document.fire('animationend', { target: first, animationName: 'sc-motion-rise' });
  env.document.fire('animationend', { target: second, animationName: 'sc-motion-rise' });
  env.document.fire('click', { target: replayButton }); env.enter(first); env.enter(second);
  assert(first.classList.contains('sc-motion-in'));
  assert(!second.classList.contains('sc-motion-in'));
  replayButton.setAttribute('data-sc-motion-replay', '[broken');
  assert.doesNotThrow(() => env.document.fire('click', { target: replayButton }));
});
await check('print finishes arrivals without changing document semantics', () => {
  let item;
  const env = environment({ setup: body => { item = body.append(reveal()); } });
  env.enter(item);
  env.window.fire('beforeprint');
  assert(!item.classList.contains('sc-motion-in'));
  assert.equal(item.attributes.size, 0);
});
await check('complete teardown removes listeners/observers; reinitialization works', () => {
  let item;
  const env = environment({ setup: body => { item = body.append(reveal()); } });
  env.enter(item);
  env.api.destroy();
  assert.equal(env.document.listenerCount(), 0);
  assert.equal(env.window.listenerCount(), 0);
  assert.equal(env.preference.listenerCount(), 0);
  assert(env.mutationObservers.every(observer => !observer.connected));
  assert(env.observers.every(observer => observer.disconnected));
  assert(!item.classList.contains('sc-motion-in'));
  env.api.init(); env.enter(item);
  assert(item.classList.contains('sc-motion-in'));
});
await check('destroy before DOM readiness cancels automatic initialization', () => {
  let item;
  const env = environment({ loading: true, setup: body => { item = body.append(reveal()); } });
  env.api.destroy();
  assert.equal(env.document.listenerCount(), 0, 'pending DOM-ready listener is removed immediately');
  env.document.fire('DOMContentLoaded');
  assert.equal(env.observers.length, 0);
  assert(!item.classList.contains('sc-motion-in'));
  assert.equal(env.document.listenerCount(), 0);
});
await check('legacy media listener and failing media query are supported', () => {
  const legacy = environment({ legacyMedia: true });
  legacy.preference.fire('change', { matches: true });
  assert.equal(legacy.api.reducedMotion, true);
  legacy.api.destroy();
  assert.equal(legacy.preference.listenerCount(), 0);
  assert.doesNotThrow(() => environment({ mediaFailure: true }));
});
await check('nested groups animate only their leaves and preserve unrelated inline values', () => {
  let group, nested, item;
  const env = environment({ setup: body => {
    group = body.append(new Element('div', 'sc-stagger'));
    nested = group.append(new Element('div', 'sc-stagger'));
    item = nested.append(reveal());
  } });
  assert(!env.observers[0].observed.has(group));
  assert(!env.observers[0].observed.has(nested));
  assert(env.observers[0].observed.has(item));
  const separate = env.body.append(reveal());
  env.api.refresh();
  separate.style.setProperty('--sc-motion-order', '2');
  env.api.destroy(separate);
  assert.equal(separate.style.getPropertyValue('--sc-motion-order'), '2');
});
await check('loading the runtime twice preserves the namespace and one observer', () => {
  const env = environment();
  env.window.SC.existingFeature = true;
  const original = env.api;
  vm.runInNewContext(source, { window: env.window, document: env.document, Map, Set, Promise, Array });
  assert.equal(env.window.SC.motion, original);
  assert.equal(env.window.SC.existingFeature, true);
  assert.equal(env.observers.length, 1);
});
await check('reinitialization resamples a newly reduced preference', () => {
  let item;
  const env = environment({ setup: body => { item = body.append(reveal()); } });
  env.api.destroy();
  env.preference.matches = true;
  env.api.init(); env.enter(item);
  assert.equal(env.api.reducedMotion, true);
  assert(!item.classList.contains('sc-motion-in'));
});
await check('reinitialization resamples a restored motion preference', () => {
  let item;
  const env = environment({ reduced: true, setup: body => { item = body.append(reveal()); } });
  env.api.destroy();
  env.preference.matches = false;
  env.api.init(); env.enter(item);
  assert.equal(env.api.reducedMotion, false);
  assert(item.classList.contains('sc-motion-in'));
});
console.log(`motion-check: ${checks} behavioral scenarios passed (fail open, reveal once, replay, reduced motion, focus, dynamic content, pause, print and teardown)`);
