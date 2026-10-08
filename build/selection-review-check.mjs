// Maintainer-only composition contracts. No selection/restore runtime is shipped.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {selectionReviewState,fieldRestoreState,selectionReviewExample,fieldRestoreExample} from './studio-examples.mjs';
const copy = value => structuredClone(value);
const unique = (values,label) => assert.equal(new Set(values).size,values.length,`${label}: stable unique IDs`);
const same = (actual,expected,label) => assert.deepEqual([...actual].sort(),[...expected].sort(),label);

function selectionContract(state) {
  const eligible=state.items.map(item=>item.id);
  unique(eligible,'candidates');
  for(const [label,ids] of [['selected',state.selectedIds],['basket',state.basketIds],['review',state.reviewRows.map(row=>row.id)]]) {
    unique(ids,label); assert(ids.every(id=>eligible.includes(id)),`${label}: no stale or unavailable ID`);
  }
  assert(state.selectedIds.length>0,'no Apply to zero selected records');
  assert(state.selectedIds.length<=state.capacity,'capacity must be explained, never silently truncated');
  assert.equal(state.count,state.selectedIds.length,'written count matches selected set');
  same(state.basketIds,state.selectedIds,'filters retain the whole basket');
  same(state.reviewRows.map(row=>row.id),state.selectedIds,'review matches the whole selection');
  for(const row of state.reviewRows) {
    assert(row.name.trim(),'review names every record');
    assert(Object.hasOwn(row,'before')&&Object.hasOwn(row,'after'),'review carries previous and proposed values');
  }
}
function fieldContract(state) {
  const included=state.fields.map(field=>field.id);
  unique(included,'included fields'); unique(state.omittedIds,'omitted fields');
  assert(!included.some(id=>state.omittedIds.includes(id)),'omitted fields are not filled with defaults');
  assert(state.selectedIds.length>0,'no Apply to zero selected fields');
  for(const [label,ids] of [['selection',state.selectedIds],['preview',state.previewIds],['apply',state.applyIds],['undo',state.undoIds]]) {
    unique(ids,label); assert(ids.every(id=>included.includes(id)),`${label}: explicitly included fields only`);
    same(ids,state.selectedIds,`${label}: same reviewed field scope`);
  }
  assert.equal(state.count,state.selectedIds.length,'restore count matches selected fields');
  assert.equal(state.revision,state.expectedRevision,'intervening edits need reload/review');
  for(const id of state.selectedIds) {
    const field=state.fields.find(field=>field.id===id);
    assert(Object.hasOwn(field,'current')&&Object.hasOwn(field,'incoming'),'selected fields retain prior and incoming values');
    assert.notEqual(field.incoming,undefined,'omitted incoming value cannot become a default');
  }
}
let checks=0;
const check=(name,fn)=>{fn();checks++;};
check('authored basket/review scope',()=>selectionContract(copy(selectionReviewState)));
check('reject silently truncated review',()=>{const s=copy(selectionReviewState);s.reviewRows.pop();assert.throws(()=>selectionContract(s));});
check('reject filtered-away basket item',()=>{const s=copy(selectionReviewState);s.basketIds.pop();assert.throws(()=>selectionContract(s));});
check('reject duplicate selected ID',()=>{const s=copy(selectionReviewState);s.selectedIds.push(s.selectedIds[0]);assert.throws(()=>selectionContract(s));});
check('reject stale selected ID',()=>{const s=copy(selectionReviewState);s.items.shift();assert.throws(()=>selectionContract(s));});
check('reject capacity after Undo',()=>{const s=copy(selectionReviewState);s.capacity=1;assert.throws(()=>selectionContract(s));});
check('reject mismatched written count',()=>{const s=copy(selectionReviewState);s.count=1;assert.throws(()=>selectionContract(s));});
check('reject Apply to no rows',()=>{const s=copy(selectionReviewState);s.selectedIds=[];s.basketIds=[];s.reviewRows=[];s.count=0;assert.throws(()=>selectionContract(s));});
check('authored restore/Undo scope',()=>fieldContract(copy(fieldRestoreState)));
check('reject applied field absent from preview',()=>{const s=copy(fieldRestoreState);s.applyIds.push('cadence');assert.throws(()=>fieldContract(s));});
check('reject stale full-object Undo',()=>{const s=copy(fieldRestoreState);s.undoIds.push('cadence');assert.throws(()=>fieldContract(s));});
check('reject omitted field replacement',()=>{const s=copy(fieldRestoreState);s.fields.push({id:'history',current:'preserved',incoming:'default'});assert.throws(()=>fieldContract(s));});
check('reject conflicting revision',()=>{const s=copy(fieldRestoreState);s.revision++;assert.throws(()=>fieldContract(s));});
check('retain explicit empty and zero',()=>{for(const value of ['',0]){const s=copy(fieldRestoreState);s.fields[0].incoming=value;fieldContract(s);assert.equal(s.fields[0].incoming,value);}});
check('reject omitted incoming selected value',()=>{const s=copy(fieldRestoreState);delete s.fields[0].incoming;assert.throws(()=>fieldContract(s));});
check('specimen native selection and review are in parity',()=>{
  const html=selectionReviewExample('verify',2);
  const checked=[...html.matchAll(/<input\b[^>]*data-sc-selection-item="([^"]+)"[^>]*checked[^>]*>/g)].map(m=>m[1]);
  const basket=[...html.matchAll(/data-sc-basket-item="([^"]+)"/g)].map(m=>m[1]);
  const rows=[...html.matchAll(/data-sc-review-item="([^"]+)"/g)].map(m=>m[1]);
  same(checked,selectionReviewState.selectedIds,'native checked state');same(basket,checked,'basket markup');same(rows,checked,'review markup');
  assert(html.includes(`data-sc-selection-count="${checked.length}"`),'written count');
  assert([...html.matchAll(/<input\b[^>]*>/g)].every(m=>m[0].includes('disabled')),'fixture choices cannot imply live selection');
  assert(!/<script\b|\bon[a-z]+\s*=/i.test(html),'no specimen selection runtime');
});
check('restore specimen choices match preview',()=>{
  const html=fieldRestoreExample('verify',2);
  const checked=[...html.matchAll(/<input\b[^>]*data-sc-restore-choice="([^"]+)"[^>]*checked[^>]*>/g)].map(m=>m[1]);
  const preview=[...html.matchAll(/data-sc-restore-preview="([^"]+)"/g)].map(m=>m[1]);
  same(checked,fieldRestoreState.selectedIds,'native restore choice');same(preview,checked,'restore preview markup');
  assert(html.includes('omitted and remain untouched'),'omissions are stated');
  assert(html.includes('No restore occurs here'),'fixture does not claim an apply');
});
check('generated guide/template carry current authored states',()=>{
  const template=readFileSync(new URL('../templates/studio.html',import.meta.url),'utf8');
  const guide=readFileSync(new URL('../styleguide.html',import.meta.url),'utf8');
  const compact=html=>html.replace(/>\s+</g,'><');
  assert(compact(template).includes(compact(selectionReviewExample('studio',2))));
  assert(compact(template).includes(compact(fieldRestoreExample('studio',2))));
  assert(compact(guide).includes(compact(selectionReviewExample('guide-studio',3))));
  assert(compact(guide).includes(compact(fieldRestoreExample('guide-studio',3))));
});
console.log(`selection-review-check: ${checks} selection/field-scope, negative-control and authored-state checks pass; no live save or rendered QA claimed`);
