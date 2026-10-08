// No browser runner: synthetic negative controls validate the geometry contract;
// fixture/source checks validate authored metadata and specimen state. Rendered
// observations remain a separate acceptance pass supplied by the reviewer.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {assertIntrinsicStage,assertDockLayout} from './media-dock-contract.mjs';
import {mediaExample,dockExample} from './media-dock-examples.mjs';
let checks=0;
function check(name,run){try{run();checks++;}catch(e){e.message=`${name}: ${e.message}`;throw e;}}
const box=(left,top,width,height)=>({left,top,right:left+width,bottom:top+height,width,height});
const copy=value=>structuredClone(value);
function media(portrait=false){const h=portrait?640:250;return{stage:{...box(0,0,402,h+2),contentWidth:400,contentHeight:h},frames:[{...box(1,1,400,h),sourceWidth:portrait?500:800,sourceHeight:portrait?800:500,active:true,ariaHidden:false,visibilityHidden:false},{...box(1,1,400,h),sourceWidth:portrait?500:800,sourceHeight:portrait?800:500,active:false,ariaHidden:true,visibilityHidden:true}],activeCount:1,hasForcedRatio:false,previousStageHeight:h+2};}
function dock(){return{viewport:{width:390,height:844},header:box(0,0,390,74),body:box(0,74,390,616),dock:box(0,690,390,154),targets:[box(16,702,120,44),box(16,770,62,48)],focused:box(20,644,100,44),focusedInDock:box(16,770,62,48),safeAreaBottom:20,dockPaddingBottom:24};}
check('valid landscape preserves genuine aspect',()=>assertIntrinsicStage(media()));
check('valid portrait preserves genuine aspect',()=>assertIntrinsicStage(media(true)));
check('wrong image aspect is rejected',()=>{const x=media();x.frames[0].height=220;assert.throws(()=>assertIntrinsicStage(x));});
check('forced unrelated ratio is rejected',()=>{const x=media();x.hasForcedRatio=true;assert.throws(()=>assertIntrinsicStage(x));});
check('multiple presented frames are rejected',()=>{const x=media();x.activeCount=2;assert.throws(()=>assertIntrinsicStage(x));});
check('an inaccessible active frame is rejected',()=>{const x=media();x.frames[0].ariaHidden=true;assert.throws(()=>assertIntrinsicStage(x));});
check('unavailable source dimensions are rejected',()=>{const x=media();x.frames[0].sourceWidth=0;assert.throws(()=>assertIntrinsicStage(x));});
check('matching frame geometry must stay stable',()=>{const x=media();x.previousStageHeight=200;assert.throws(()=>assertIntrinsicStage(x));});
check('valid reserved dock keeps both focused areas visible',()=>assertDockLayout(dock()));
check('body/dock overlay is rejected',()=>{const x=dock();x.body.bottom=730;assert.throws(()=>assertDockLayout(x));});
check('focused body control behind footer is rejected',()=>{const x=dock();x.focused=box(20,700,100,44);assert.throws(()=>assertDockLayout(x));});
check('horizontal target clipping is rejected',()=>{const x=dock();x.targets[0]=box(350,702,100,44);assert.throws(()=>assertDockLayout(x));});
check('undersized navigation target is rejected',()=>{const x=dock();x.targets[0]=box(16,702,32,44);assert.throws(()=>assertDockLayout(x));});
check('unreserved safe area is rejected',()=>{const x=dock();x.dockPaddingBottom=4;assert.throws(()=>assertDockLayout(x));});
check('dock focus below safe area is rejected',()=>{const x=dock();x.focusedInDock=box(16,820,62,48);assert.throws(()=>assertDockLayout(x));});
check('short viewport still reserves some body',()=>{const x=dock();x.viewport.height=360;x.body=box(0,74,390,124);x.dock=box(0,198,390,162);x.targets=[box(16,210,120,44)];x.focused=box(20,150,100,44);delete x.focusedInDock;assertDockLayout(x);});
check('every specimen image has exact real SVG metadata and useful alt',()=>{const html=mediaExample('proof','assets/',3);for(const image of html.matchAll(/<img\s+([^>]+)>/g)){const attrs=image[1],src=/src="([^"]+)"/.exec(attrs)?.[1],width=/width="(\d+)"/.exec(attrs)?.[1],height=/height="(\d+)"/.exec(attrs)?.[1];assert(src&&width&&height);const svg=readFileSync(new URL('../'+src,import.meta.url),'utf8');assert(svg.includes(`width="${width}" height="${height}"`));assert(/alt="[^"]+"/.test(attrs));}const dockHTML=dockExample();assert.equal((dockHTML.match(/<h1\b/g)||[]).length,1);assert(dockHTML.includes('aria-label="Specimen destinations"'));assert(!dockHTML.includes('position:fixed'));});
check('specimen controls change only active/pressed state without autoplay',()=>{class Item{constructor(attrs){this.attrs={...attrs};this.handlers={};}getAttribute(n){return this.attrs[n]??null;}setAttribute(n,v){this.attrs[n]=String(v);}removeAttribute(n){delete this.attrs[n];}addEventListener(n,fn){this.handlers[n]=fn;}}const frames=[new Item({'data-sc-specimen-frame':'0'}),new Item({'data-sc-specimen-frame':'1','aria-hidden':'true'})],buttons=[new Item({'data-sc-specimen-select':'0','aria-pressed':'true'}),new Item({'data-sc-specimen-select':'1','aria-pressed':'false'})];const host={querySelectorAll:s=>s==='[data-sc-specimen-frame]'?frames:buttons};const document={querySelectorAll:()=>[host]};vm.runInNewContext(readFileSync(new URL('./media-dock-specimen.js',import.meta.url),'utf8'),{document});buttons[1].handlers.click();assert.equal(frames[0].getAttribute('aria-hidden'),'true');assert.equal(frames[1].getAttribute('aria-hidden'),null);assert.equal(buttons[0].getAttribute('aria-pressed'),'false');assert.equal(buttons[1].getAttribute('aria-pressed'),'true');assert.deepEqual(copy(frames.map(f=>f.getAttribute('data-sc-specimen-frame'))),['0','1']);});
console.log(`media-dock-check: ${checks} contract/negative-control and authored-specimen scenarios pass; rendered QA not claimed`);
