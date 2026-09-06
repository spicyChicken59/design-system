// Dependency-free checks of chapter selection and native-link preservation.
// Optional first argument points to the runtime when this file moves to build/.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(process.argv[2] || new URL('./reading.js', import.meta.url), 'utf8');
let checks = 0;
function check(name, run) {
  try { run(); checks++; }
  catch (error) { error.message = `${name}: ${error.message}`; throw error; }
}
class Events {
  constructor() { this.listeners = new Map(); }
  addEventListener(type, callback, options) {
    const listeners = this.listeners.get(type) || new Map();
    listeners.set(callback, options);
    this.listeners.set(type, listeners);
  }
  removeEventListener(type, callback) { this.listeners.get(type)?.delete(callback); }
  fire(type) { [...(this.listeners.get(type)?.keys() || [])].forEach(callback => callback({ type, target: this })); }
  count(type) {
    return type ? this.listeners.get(type)?.size || 0
      : [...this.listeners.values()].reduce((sum, listeners) => sum + listeners.size, 0);
  }
}
class Element extends Events {
  constructor(tag, attributes = {}) {
    super();
    this.nodeType = 1;
    this.tagName = tag.toUpperCase();
    this.attributes = new Map(Object.entries(attributes));
    this.children = [];
    this.top = 0;
    this.display = 'block';
    this.visibility = 'visible';
    this.rectReads = 0;
  }
  append(...children) {
    children.forEach(child => { child.parentElement = this; this.children.push(child); });
    return children[0];
  }
  remove() {
    this.parentElement.children = this.parentElement.children.filter(child => child !== this);
    this.parentElement = null;
  }
  contains(node) { return this === node || this.children.some(child => child.contains(node)); }
  getAttribute(name) { return this.attributes.has(name) ? this.attributes.get(name) : null; }
  hasAttribute(name) { return this.attributes.has(name); }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  removeAttribute(name) { this.attributes.delete(name); }
  matches(selector) {
    if (selector === 'nav[data-sc-reading]') return this.tagName === 'NAV' && this.hasAttribute('data-sc-reading');
    if (selector === 'a[href]') return this.tagName === 'A' && this.hasAttribute('href');
    throw new Error(`Unexpected selector: ${selector}`);
  }
  closest(selector) {
    for (let node = this; node && node.nodeType === 1; node = node.parentElement) {
      if (node.matches(selector)) return node;
    }
    return null;
  }
  querySelectorAll(selector) {
    return this.children.flatMap(child => [...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)]);
  }
  getBoundingClientRect() { this.rectReads++; return { top: this.top, bottom: this.top + 300, height: 300 }; }
  getClientRects() {
    for (let node = this; node && node.nodeType === 1; node = node.parentElement) {
      if (node.display === 'none' || node.hasAttribute('hidden')) return [];
    }
    return [{}];
  }
}
function environment(options = {}) {
  const document = new Element('document');
  document.nodeType = 9;
  document.URL = 'https://example.test/report?edition=1';
  document.baseURI = document.URL;
  document.readyState = options.loading ? 'loading' : 'complete';
  document.documentElement = document.append(new Element('html'));
  document.body = document.documentElement.append(new Element('body'));
  document.getElementById = id => {
    function walk(node) {
      if (node.getAttribute('id') === id) return node;
      for (const child of node.children) { const found = walk(child); if (found) return found; }
      return null;
    }
    return walk(document);
  };
  const window = new Events();
  window.location = { href: document.URL };
  window.innerHeight = 800;
  const frames = new Map();
  let frameId = 0;
  window.requestAnimationFrame = callback => { frames.set(++frameId, callback); return frameId; };
  window.cancelAnimationFrame = id => frames.delete(id);
  window.getComputedStyle = node => ({ display: node.display, visibility: node.visibility });
  // The indicator must not depend on motion preferences or start animation.
  window.matchMedia = () => { throw new Error('Reading navigation must not start a motion runtime'); };
  window.scrollTo = () => { throw new Error('Reading navigation must not scroll'); };
  options.setup?.(document.body, document, window);
  const context = { window, document, URL, Map, Set, Number };
  vm.runInNewContext(source, context);
  return {
    document, window, frames, context, api: window.SC.reading,
    flush() {
      const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback());
    }
  };
}
function fixture(body) {
  const nav = body.append(new Element('nav', { 'data-sc-reading': '', class: 'sc-chapter-nav', 'aria-label': 'On this page' }));
  const first = body.append(new Element('section', { id: 'first' }));
  const second = body.append(new Element('section', { id: 'second' }));
  first.top = 200; second.top = 900;
  const firstLink = nav.append(new Element('a', { href: '#first' }));
  const secondLink = nav.append(new Element('a', { href: '#second' }));
  return { nav, first, second, firstLink, secondLink };
}

check('native hrefs and click behavior remain unchanged', () => {
  let f;
  const env = environment({ setup: body => { f = fixture(body); } });
  assert.equal(f.firstLink.getAttribute('href'), '#first');
  assert.equal(f.secondLink.getAttribute('href'), '#second');
  assert.equal(f.firstLink.getAttribute('aria-current'), 'location');
  assert.equal(f.secondLink.getAttribute('aria-current'), null);
  assert.equal(f.nav.getAttribute('class'), 'sc-chapter-nav');
  assert.equal(env.document.count('click'), 0);
  assert.equal(env.window.count('click'), 0);
  assert.equal(f.firstLink.count(), 0);
});
check('scrolling selects the second chapter and batches layout reads', () => {
  let f;
  const env = environment({ setup: body => { f = fixture(body); } });
  f.first.top = -800; f.second.top = 80;
  const reads = f.second.rectReads;
  for (let i = 0; i < 12; i++) env.document.fire('scroll');
  assert.equal(env.frames.size, 1);
  assert.equal(f.second.rectReads, reads, 'events do not read layout before the frame');
  env.flush();
  assert.equal(f.second.rectReads, reads + 1);
  assert.equal(f.secondLink.getAttribute('aria-current'), 'location');
  assert.equal(f.firstLink.getAttribute('aria-current'), null);
  f.first.top = 0; f.second.top = 500;
  env.window.fire('resize'); env.flush();
  assert.equal(f.firstLink.getAttribute('aria-current'), 'location');
});
check('hidden, missing and foreign targets cannot become the active chapter', () => {
  let f, missing, foreign, otherQuery;
  const env = environment({ setup: body => {
    f = fixture(body);
    f.first.setAttribute('hidden', '');
    missing = f.nav.append(new Element('a', { href: '#missing', 'aria-current': 'page' }));
    foreign = f.nav.append(new Element('a', { href: 'https://elsewhere.test/report?edition=1#second' }));
    otherQuery = f.nav.append(new Element('a', { href: '?edition=2#second' }));
  } });
  assert.equal(f.secondLink.getAttribute('aria-current'), 'location');
  assert.equal(f.firstLink.getAttribute('aria-current'), null);
  assert.equal(missing.getAttribute('aria-current'), 'page', 'unmanaged missing link is untouched');
  assert.equal(foreign.getAttribute('aria-current'), null);
  assert.equal(otherQuery.getAttribute('aria-current'), null);
  f.first.removeAttribute('hidden');
  f.secondLink.setAttribute('hidden', '');
  env.api.refresh();
  assert.equal(f.firstLink.getAttribute('aria-current'), 'location');
  assert.equal(f.secondLink.getAttribute('aria-current'), null);
  f.nav.visibility = 'hidden';
  env.document.fire('scroll'); env.flush();
  assert.equal(f.firstLink.getAttribute('aria-current'), null);
});
check('ancestor hidden states and detached sections are ignored', () => {
  let f, wrapper;
  const env = environment({ setup: body => {
    wrapper = body.append(new Element('main'));
    f = fixture(wrapper);
  } });
  wrapper.setAttribute('aria-hidden', 'true');
  env.api.refresh();
  assert.equal(f.firstLink.getAttribute('aria-current'), null);
  wrapper.removeAttribute('aria-hidden');
  f.first.remove();
  env.api.refresh();
  assert.equal(f.secondLink.getAttribute('aria-current'), 'location');
  f.second.display = 'none';
  env.document.fire('scroll'); env.flush();
  assert.equal(f.secondLink.getAttribute('aria-current'), null);
});
check('encoded and unusual IDs use getElementById rather than CSS selectors', () => {
  let link;
  environment({ setup: (body, document) => {
    const nav = body.append(new Element('nav', { 'data-sc-reading': '' }));
    const target = body.append(new Element('section', { id: 'chapter [two]:é' }));
    target.top = 80;
    link = nav.append(new Element('a', { href: `${document.URL}#chapter%20%5Btwo%5D%3A%C3%A9` }));
    nav.append(new Element('a', { href: '#bad%encoding' }));
  } });
  assert.equal(link.getAttribute('aria-current'), 'location');
});
check('repeat initialization and a second script load do not duplicate listeners', () => {
  let f;
  const env = environment({ setup: body => { f = fixture(body); } });
  env.api.init(); env.api.init(f.nav); env.api.refresh();
  vm.runInNewContext(source, env.context);
  assert.equal(env.document.count('scroll'), 1);
  assert.equal(env.window.count('resize'), 1);
  assert.equal(env.window.SC.reading, env.api);
  const options = [...env.document.listeners.get('scroll').values()][0];
  assert.equal(options.passive, true);
});
check('destroy restores authored aria-current and cancels pending work', () => {
  let f;
  const env = environment({ setup: body => {
    f = fixture(body);
    f.firstLink.setAttribute('aria-current', 'page');
    f.secondLink.setAttribute('aria-current', 'false');
  } });
  env.document.fire('scroll');
  assert.equal(env.frames.size, 1);
  env.api.destroy();
  assert.equal(f.firstLink.getAttribute('aria-current'), 'page');
  assert.equal(f.secondLink.getAttribute('aria-current'), 'false');
  assert.equal(env.frames.size, 0);
  assert.equal(env.document.count(), 0);
  assert.equal(env.window.count(), 0);
  env.api.destroy(); env.api.init();
  assert.equal(f.firstLink.getAttribute('aria-current'), 'location');
  env.api.destroy();
  assert.equal(f.firstLink.getAttribute('aria-current'), 'page');
});
check('scoped teardown keeps another navigator working', () => {
  let f, otherNav, otherLink;
  const env = environment({ setup: body => {
    f = fixture(body);
    otherNav = body.append(new Element('nav', { 'data-sc-reading': '' }));
    otherLink = otherNav.append(new Element('a', { href: '#second' }));
  } });
  env.api.destroy(f.nav);
  assert.equal(f.firstLink.getAttribute('aria-current'), null);
  assert.equal(otherLink.getAttribute('aria-current'), 'location');
  assert.equal(env.document.count('scroll'), 1);
  otherNav.remove();
  env.document.fire('scroll'); env.flush();
  assert.equal(otherLink.getAttribute('aria-current'), null);
  assert.equal(env.document.count('scroll'), 0);
});
check('refresh discovers new links and restores removed links', () => {
  let f;
  const env = environment({ setup: body => { f = fixture(body); } });
  const target = env.document.body.append(new Element('section', { id: 'third' }));
  target.top = 20; f.first.top = -800; f.second.top = -200;
  const link = f.nav.append(new Element('a', { href: '#third' }));
  env.api.refresh(f.nav);
  assert.equal(link.getAttribute('aria-current'), 'location');
  link.remove(); env.api.refresh();
  assert.equal(link.getAttribute('aria-current'), null);
  assert.equal(f.secondLink.getAttribute('aria-current'), 'location');
});
check('changed hrefs cannot keep pointing at a stale section', () => {
  let f;
  const env = environment({ setup: body => { f = fixture(body); } });
  f.firstLink.setAttribute('href', '#missing');
  env.document.fire('scroll'); env.flush();
  assert.equal(f.firstLink.getAttribute('aria-current'), null);
  assert.equal(f.secondLink.getAttribute('aria-current'), 'location');
  assert.equal(f.firstLink.getAttribute('href'), '#missing');
});
check('reduced-motion pages need no animation runtime, styles or classes', () => {
  let f;
  const env = environment({ setup: (body, document) => {
    document.documentElement.setAttribute('data-sc-motion-paused', 'true');
    f = fixture(body);
  } });
  f.second.top = 10; f.first.top = -500;
  env.document.fire('scroll'); env.flush();
  assert.equal(f.secondLink.getAttribute('aria-current'), 'location');
  assert.equal(env.window.SC.motion, undefined);
  assert.equal(f.firstLink.getAttribute('style'), null);
  assert.equal(f.secondLink.getAttribute('style'), null);
  assert.equal(f.nav.getAttribute('class'), 'sc-chapter-nav');
});
check('destroy before DOM readiness cancels automatic initialization', () => {
  let f;
  const env = environment({ loading: true, setup: body => { f = fixture(body); } });
  assert.equal(env.document.count('DOMContentLoaded'), 1);
  env.api.destroy(); env.document.fire('DOMContentLoaded');
  assert.equal(env.document.count(), 0);
  assert.equal(f.firstLink.getAttribute('aria-current'), null);
});
check('no browser or unavailable layout APIs leave native markup usable', () => {
  assert.doesNotThrow(() => vm.runInNewContext(source, {}));
  assert.doesNotThrow(() => vm.runInNewContext(source, { window: {}, document: {} }));
  let f;
  const env = environment({ setup: (body, document, window) => {
    f = fixture(body);
    window.requestAnimationFrame = undefined;
    f.first.getBoundingClientRect = undefined;
    f.second.getBoundingClientRect = undefined;
  } });
  assert.doesNotThrow(() => env.document.fire('scroll'));
  assert.equal(f.firstLink.getAttribute('href'), '#first');
  assert.equal(f.firstLink.getAttribute('aria-current'), null);
});
console.log(`reading-check: ${checks} behavioral scenarios passed (native anchors, chapter selection, hidden targets, refresh, cleanup and motion independence)`);
