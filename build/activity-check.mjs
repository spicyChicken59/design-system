// Meaningful dependency-free behavior checks of the optional activity runtime.
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {activityExample, sessionExample, compactWorkspaceExample} from './studio-examples.mjs';
const source = readFileSync(process.argv[2] || new URL('../sc-activity.js', import.meta.url), 'utf8');
let checks = 0;
class Element {
  constructor(attrs = {}) { this.attrs = new Map(Object.entries(attrs)); this.events = new Map(); this.textContent = ''; this.disabled = false; this.hidden = false; }
  getAttribute(n) { return this.attrs.has(n) ? this.attrs.get(n) : null; }
  setAttribute(n,v) { this.attrs.set(n,String(v)); }
  removeAttribute(n) { this.attrs.delete(n); }
  addEventListener(t,f) { const list=this.events.get(t)||new Set(); list.add(f); this.events.set(t,list); }
  removeEventListener(t,f) { this.events.get(t)?.delete(f); }
  fire(type, options = {}) { const e={target:this,preventDefault(){this.prevented=true;},...options}; [...(this.events.get(type)||[])].forEach(f=>f(e)); return e; }
  focus() { this.focused=true; }
}
function environment() {
  const days=Array.from({length:7},(_,i)=>new Element({'data-date':`2026-10-0${i+1}`,'aria-label':`${i+1}: ${i===2?'not supplied':`${i} passes`}`}));
  const grid=new Element(), output=new Element(); output.textContent='Native fallback'; grid.querySelectorAll=()=>days;
  const host=new Element(); host.querySelector=s=>s==='.sc-activity__grid'?grid:output; host.matches=()=>true; host.querySelectorAll=()=>[];
  const document={readyState:'complete',querySelectorAll:()=>[host]}, window={document,getComputedStyle:()=>({gridTemplateColumns:'44px 44px 44px'})}; window.window=window;
  vm.runInNewContext(source,{window,WeakMap});
  return {days,output,host,window,controller:window.SC.activity.init(host)[0]};
}
function check(name,run) { try { run(); checks++; } catch(e) { e.message=`${name}: ${e.message}`; throw e; } }
check('initialization does not steal focus',()=>{const e=environment(); assert(!e.days.some(d=>d.focused)); assert.equal(e.days.filter(d=>d.getAttribute('tabindex')==='0').length,1);});
check('arrows inspect and announce actual authored values',()=>{const e=environment(); e.days[0].fire('keydown',{key:'ArrowRight'}); assert.equal(e.output.textContent,'2: 1 passes'); assert(e.days[1].focused);});
check('missing remains selectable and is written as missing',()=>{const e=environment(); e.days[2].fire('click'); assert.equal(e.output.textContent,'3: not supplied'); assert.equal(e.days[2].getAttribute('aria-pressed'),'true');});
check('vertical arrows use current responsive columns',()=>{const e=environment(); e.days[0].fire('keydown',{key:'ArrowDown'}); assert(e.days[3].focused);});
check('vertical boundaries preserve the current column',()=>{const e=environment(); e.days[2].fire('keydown',{key:'ArrowUp'}); assert(e.days[2].focused); e.days[5].fire('keydown',{key:'ArrowDown'}); assert(e.days[5].focused);});
check('disabled cells do not shift vertical column geometry',()=>{const e=environment(); e.days[1].disabled=true; e.controller.refresh(); e.days[0].fire('keydown',{key:'ArrowDown'}); assert(e.days[3].focused);});
check('Home End and boundaries stay inside the grid',()=>{const e=environment(); e.days[0].fire('keydown',{key:'End'}); assert(e.days[6].focused); e.days[6].fire('keydown',{key:'ArrowRight'}); assert.equal(e.days[6].getAttribute('tabindex'),'0'); e.days[6].fire('keydown',{key:'Home'}); assert(e.days[0].focused);});
check('Tab and modified arrows retain native behavior',()=>{const e=environment(); assert(!e.days[0].fire('keydown',{key:'Tab'}).prevented); assert(!e.days[0].fire('keydown',{key:'ArrowRight',ctrlKey:true}).prevented);});
check('descendant keys are not stolen',()=>{const e=environment(); assert(!e.days[0].fire('keydown',{key:'ArrowRight',target:new Element()}).prevented);});
check('reinitializing does not duplicate listeners',()=>{const e=environment(); assert.equal(e.window.SC.activity.init(e.host)[0],e.controller); assert.equal(e.days[0].events.get('click').size,1);});
check('refresh preserves selection by date',()=>{const e=environment(); e.days[4].fire('click'); e.controller.refresh(); assert.equal(e.days[4].getAttribute('aria-pressed'),'true'); assert.equal(e.days[4].events.get('click').size,1);});
check('disabled days are skipped on refresh',()=>{const e=environment(); e.days[1].disabled=true; e.controller.refresh(); e.days[0].fire('keydown',{key:'ArrowRight'}); assert(e.days[2].focused);});
check('dispose restores native tab stops and leaves no handlers',()=>{const e=environment(); e.controller.dispose(); e.controller.dispose(); assert.equal(e.output.textContent,'Native fallback'); assert(e.days.every(d=>d.getAttribute('tabindex')===null&&d.events.get('click').size===0));});
check('a disposed host can remount cleanly',()=>{const e=environment(); e.controller.dispose(); assert.notEqual(e.window.SC.activity.init(e.host)[0],e.controller); assert.equal(e.days[0].events.get('click').size,1);});
check('no-JS specimen preserves every count and missing date in a table',()=>{const html=activityExample(); assert.equal((html.match(/<button class="sc-activity__day"/g)||[]).length,14); assert.equal((html.match(/<th scope="row">/g)||[]).length,14); assert(html.includes('Not supplied')); assert(html.includes('>0</td>')); assert(html.includes('tabindex="0" role="region"'));});
check('session specimen names saving/error states and bounds its sticky action',()=>{const html=sessionExample(); assert(html.includes('aria-busy="true"')); assert(html.includes('aria-describedby="studio-failed"')); assert(html.includes('sc-actionbar--sticky')); assert(html.includes('does not save records')); assert.equal((html.match(/sc-btn--primary/g)||[]).length,1);});
check('checkbox-primitive specimen has a visible name, checked state and honest disabled fallback',()=>{const html=sessionExample(); const primitive=/<button([^>]*role="checkbox"[^>]*)>/.exec(html)?.[1]; assert(primitive); assert(primitive.includes('aria-checked="true"')); assert(primitive.includes('disabled')); const label=/aria-labelledby="([^"]+)"/.exec(primitive)?.[1]; assert(label&&html.includes(`id="${label}"`)); assert(html.includes('Disabled accessible-checkbox specimen')); assert(html.includes('type="checkbox"'));});
check('compact navigation keeps six native named destinations and decorative icons',()=>{const html=compactWorkspaceExample('.'); const links=[...html.matchAll(/<a href="([^"]+)">([\s\S]*?)<\/a>/g)]; assert.equal(links.length,6); assert.equal(new Set(links.map(x=>x[1])).size,6); for(const [,url,body] of links){assert(readFileSync(new URL('../'+url.replace(/^\.\//,''),import.meta.url),'utf8').length); assert(/aria-hidden="true"/.test(body)); assert(/<span>[A-Za-z]+<\/span>/.test(body));} assert(!html.includes('role="tab'));});
console.log(`activity-check: ${checks} behavior and fallback scenarios pass`);
