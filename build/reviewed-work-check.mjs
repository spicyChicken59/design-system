// Maintainer-only state/markup checks, with deliberately invalid controls.
// These do not claim browser geometry, scheduler persistence or live save tests.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {reviewedBatchState,preparedTaskState,reviewedBatchExample,preparedTaskExample} from './reviewed-work-examples.mjs';
const copy=value=>structuredClone(value);
const unique=(values,label)=>assert.equal(new Set(values).size,values.length,label);
const same=(a,b,label)=>assert.deepEqual([...a].sort(),[...b].sort(),label);
function batchContract(s) {
  unique(s.rows.map(row=>row.id),'batch row identities');
  assert.equal(s.sourceVersion,s.reviewedVersion,'changed source requires review');
  assert.equal(s.localDate,s.reviewedDate,'local-date rollover requires review');
  const ready=s.rows.filter(row=>row.state==='ready').map(row=>row.id);
  assert(ready.length>0&&ready.length<=s.capacity,'nonempty, untruncated capacity');
  same(s.applyIds,ready,'only the reviewed ready rows are additions');
  unique(s.applyIds,'no duplicate apply IDs');
  same(s.omissions,s.rows.filter(row=>row.state==='omitted').map(row=>row.id),'refresh retains named omissions');
  for(const row of s.rows) {
    assert(['ready','existing','blocked','omitted'].includes(row.state),'named row state');
    assert(row.name&&row.reason,'row identity and reason stay readable');
    if(row.state==='existing')assert.equal(row.name,row.retainedName,'kept row names its actual retained record');
    assert(row.date>=s.localDate,'past dates are not created by the fixture');
  }
  for(const ids of [s.previousBatchIds,s.untouchedIds,s.protectedIds,s.undoIds])unique(ids,'batch/Undo scope IDs');
  assert(!s.untouchedIds.some(id=>s.protectedIds.includes(id)),'untouched and protected scopes are separate');
  same([...s.untouchedIds,...s.protectedIds],s.previousBatchIds,'all original IDs retain an explicit disposition');
  same(s.undoIds,s.untouchedIds,'Undo scope is exactly the current untouched set');
}
function preparedContract(s) {
  assert(s.pinned,'fixture is an explicit continuation');
  assert.equal(s.previewName,s.sourceName,'saved name is the primary identity');
  assert.equal(s.previewVersion,s.version,'source version stays pinned');
  assert.equal(s.previewMode,s.mode,'mode stays pinned');
  assert.equal(s.startWitness,s.sourceWitness,'Start resolves the reviewed source');
  unique(s.tasks.map(task=>task.id),'task identities');
  assert.deepEqual(s.startTasks,s.tasks,'Start preserves exact order, targets and earlier counts');
  for(const task of s.tasks) {
    assert(Number.isInteger(task.target)&&task.target>0,'positive target');
    assert(Number.isInteger(task.confirmed)&&task.confirmed>=0&&task.confirmed<=task.target,'confirmed count stays bounded');
    assert.equal(task.completed,task.confirmed===task.target,'written completion agrees with confirmed work');
  }
  assert.equal(s.remaining,s.tasks.reduce((n,task)=>n+(task.completed?0:task.target-task.confirmed),0),'remaining excludes earlier confirmation');
}
let checks=0;const check=(name,fn)=>{fn();checks++;};
check('authored dated batch',()=>batchContract(copy(reviewedBatchState)));
check('reject generated name on kept record',()=>{const s=copy(reviewedBatchState);s.rows[1].name='Proposed different review';assert.throws(()=>batchContract(s));});
check('reject lost omission after refresh',()=>{const s=copy(reviewedBatchState);s.omissions=[];assert.throws(()=>batchContract(s));});
check('reject source revision mismatch',()=>{const s=copy(reviewedBatchState);s.sourceVersion++;assert.throws(()=>batchContract(s));});
check('reject local-date rollover',()=>{const s=copy(reviewedBatchState);s.localDate='2026-10-09';assert.throws(()=>batchContract(s));});
check('reject protected Undo ID',()=>{const s=copy(reviewedBatchState);s.undoIds.push(s.protectedIds[0]);assert.throws(()=>batchContract(s));});
check('reject capacity truncation',()=>{const s=copy(reviewedBatchState);s.capacity=0;assert.throws(()=>batchContract(s));});
check('reject omitted row added',()=>{const s=copy(reviewedBatchState);s.applyIds.push('captions');assert.throws(()=>batchContract(s));});
check('authored pinned task',()=>preparedContract(copy(preparedTaskState)));
check('reject newer template name',()=>{const s=copy(preparedTaskState);s.previewName='Current template v4';assert.throws(()=>preparedContract(s));});
check('reject version replacement',()=>{const s=copy(preparedTaskState);s.previewVersion=4;assert.throws(()=>preparedContract(s));});
check('reject mode replacement',()=>{const s=copy(preparedTaskState);s.previewMode='Changed';assert.throws(()=>preparedContract(s));});
check('reject unseen Start target',()=>{const s=copy(preparedTaskState);s.startTasks[1].target++;assert.throws(()=>preparedContract(s));});
check('reject duplicated earlier work',()=>{const s=copy(preparedTaskState);s.remaining++;assert.throws(()=>preparedContract(s));});
check('reject changed Start witness',()=>{const s=copy(preparedTaskState);s.startWitness='different-source';assert.throws(()=>preparedContract(s));});
check('visit-time choice does not alter pinned targets',()=>{for(const time of [null,20,35]){const s=copy(preparedTaskState);s.visitMinutes=time;preparedContract(s);assert.deepEqual(s.tasks,preparedTaskState.tasks);}});
check('authored markup is truthful, inactive and count-consistent',()=>{
  const batch=reviewedBatchExample('verify',2),prepared=preparedTaskExample('verify',2);
  const checked=[...batch.matchAll(/<input\b[^>]*data-sc-batch-choice="([^"]+)"[^>]*checked[^>]*>/g)].map(m=>m[1]);
  same(checked,reviewedBatchState.applyIds,'native batch state matches apply scope');
  assert(batch.includes(`data-sc-batch-add-count="${checked.length}"`));
  assert(batch.includes(`data-sc-batch-undo-count="${reviewedBatchState.undoIds.length}"`));
  assert(prepared.includes(`data-sc-prepared-remaining="${preparedTaskState.remaining}"`));
  assert(prepared.includes('Saved earlier; not repeated'));
  for(const html of [batch,prepared]) {
    assert([...html.matchAll(/<(?:input|select|button)\b[^>]*>/g)].every(m=>m[0].includes('disabled')),'fixture controls cannot mutate state');
    assert(!/<script\b|\bon[a-z]+\s*=/i.test(html),'no consumer runtime');
    assert(!/\bstyle\s*=|<style\b/i.test(html),'existing stylesheet only');
  }
});
check('generated guide and template match authored workflow states',()=>{
  const compact=html=>html.replace(/>\s+</g,'><');
  for(const [file,prefix,heading] of [['../templates/studio.html','studio',2],['../styleguide.html','guide-studio',3]]) {
    const html=compact(readFileSync(new URL(file,import.meta.url),'utf8'));
    assert(html.includes(compact(reviewedBatchExample(prefix,heading))));
    assert(html.includes(compact(preparedTaskExample(prefix,heading))));
  }
});
console.log(`reviewed-work-check: ${checks} authored-state/negative-control scenarios pass; rendered and live persistence QA not claimed`);
