// Build-time, non-operational editorial workflow examples. No consumer runtime.
export const reviewedBatchState = {
  sourceVersion: 12, reviewedVersion: 12, localDate: '2026-10-08', reviewedDate: '2026-10-08', capacity: 5,
  rows: [
    {id:'notes',date:'2026-10-12',name:'Review release notes',time:'09:00',state:'ready',reason:'Will add'},
    {id:'sources',date:'2026-10-13',name:'Verify the source index',time:'10:00',state:'existing',reason:'Keep this actual reservation',retainedName:'Verify the source index'},
    {id:'screens',date:'2026-10-14',name:'Inspect the screenshots',time:'10:00',state:'blocked',reason:'Time already reserved for an editorial meeting'},
    {id:'captions',date:'2026-10-15',name:'Check the image captions',time:'',state:'omitted',reason:'Left out by the reviewer'}
  ],
  applyIds: ['notes'], omissions: ['captions'],
  previousBatchIds: ['earlier-notes','earlier-links','earlier-layout'],
  untouchedIds: ['earlier-notes','earlier-links'], protectedIds: ['earlier-layout'], undoIds: ['earlier-notes','earlier-links']
};
export const preparedTaskState = {
  sourceName:'Review the release bundle',version:3,mode:'Standard',pinned:true,
  previewName:'Review the release bundle',previewVersion:3,previewMode:'Standard',
  visitMinutes:20,sourceWitness:'bundle-v3-review-8',startWitness:'bundle-v3-review-8',
  tasks:[
    {id:'summary',name:'Read the change summary',target:1,confirmed:1,completed:true},
    {id:'links',name:'Verify the referenced source links',target:3,confirmed:1,completed:false},
    {id:'keyboard',name:'Inspect the complete keyboard path and long-label wrapping',target:2,confirmed:0,completed:false}
  ],
  startTasks:[
    {id:'summary',name:'Read the change summary',target:1,confirmed:1,completed:true},
    {id:'links',name:'Verify the referenced source links',target:3,confirmed:1,completed:false},
    {id:'keyboard',name:'Inspect the complete keyboard path and long-label wrapping',target:2,confirmed:0,completed:false}
  ],remaining:4
};

export function reviewedBatchExample(prefix='studio',heading=2) {
  const s=reviewedBatchState,ready=s.rows.filter(row=>row.state==='ready');
  return `<section class="sc-card sc-session" id="${prefix}-batch" aria-labelledby="${prefix}-batch-title"><h${heading} id="${prefix}-batch-title">Review a dated batch before adding it</h${heading}><p class="sc-hint">Illustrative editorial reservations, October 12–15, 2026. Disabled choices show a reviewed state; nothing is scheduled or saved by this page.</p>
<dl class="sc-facts"><div><dt>saved starting point</dt><dd>Editorial rhythm · revision ${s.sourceVersion}</dd></div><div><dt>reviewed on</dt><dd>${s.reviewedDate}</dd></div><div><dt>capacity available</dt><dd>${s.capacity} reservations</dd></div></dl>
<ol class="sc-task-list">${s.rows.map(row=>`<li class="sc-task" data-sc-batch-row="${row.id}" data-sc-batch-state="${row.state}"><label class="sc-task__label"><input type="checkbox" data-sc-batch-choice="${row.id}" ${row.state==='ready'?'checked ':''}disabled><span class="sc-task__body"><strong>${row.name}</strong><span class="sc-task__target">${row.date} · ${row.time||'Flexible time'}</span><span class="sc-task__save">${row.reason}</span></span></label></li>`).join('')}</ol>
<details class="sc-disclosure"><summary>What a refresh and Undo must preserve</summary><div class="sc-disclosure__body"><p>The existing source-index reservation keeps its actual name and time. The caption review remains left out when the source is refreshed. Blocked work is not silently moved to another day.</p><p data-sc-batch-undo-count="${s.undoIds.length}">A prior illustrative batch has ${s.untouchedIds.length} untouched reservations and ${s.protectedIds.length} changed reservation. Only the untouched reservations would be removed.</p><button type="button" class="sc-btn sc-btn--secondary" disabled>Undo ${s.undoIds.length} untouched · keep ${s.protectedIds.length} changed</button><p class="sc-hint">The app checks current revisions and linked work before Apply or Undo. A preview is not a completed task, and a time hint is not a reminder.</p></div></details>
<div class="sc-actionbar"><span class="sc-chip sc-chip--neutral">not applied</span><p data-sc-batch-add-count="${ready.length}">${ready.length} new reservation reviewed. Existing, blocked and omitted rows are not additions.</p><button class="sc-btn sc-btn--primary" type="button" disabled>Add ${ready.length} illustrative reservation</button></div></section>`;
}

export function preparedTaskExample(prefix='studio',heading=2) {
  const s=preparedTaskState;
  return `<section class="sc-card sc-session" id="${prefix}-prepared" aria-labelledby="${prefix}-prepared-title"><header class="sc-session__head"><div><p class="sc-eyebrow">illustrative pinned continuation</p><h${heading} id="${prefix}-prepared-title">${s.previewName}</h${heading}><p class="sc-hint">Continue the saved document-review task. This page has no timer, save request or active task.</p></div><span class="sc-chip sc-chip--neutral">preview only</span></header>
<dl class="sc-facts"><div><dt>saved source</dt><dd>Bundle version ${s.previewVersion}</dd></div><div><dt>saved workflow</dt><dd>${s.previewMode}</dd></div><div><dt>work remaining</dt><dd data-sc-prepared-remaining="${s.remaining}">${s.remaining} review passes</dd></div></dl>
<p class="sc-note">The current template is now version 4. This continuation keeps the saved version 3 name, targets and confirmed work; it is not replaced by the newer template.</p>
<div class="sc-task" role="group" aria-labelledby="${prefix}-visit-title"><h${heading+1} id="${prefix}-visit-title">This visit's separate choice · illustrative only</h${heading+1}><label class="sc-field"><span>Available time</span><select class="sc-select" disabled aria-describedby="${prefix}-visit-help"><option value="20" selected>20 minutes</option><option value="35">35 minutes</option><option value="">Open time</option></select></label><p class="sc-hint" id="${prefix}-visit-help">A per-visit hint does not shorten, stop or complete the pinned task. Disabled fixture controls cannot change the saved source.</p></div>
<ol class="sc-task-list">${s.tasks.map(task=>`<li class="sc-task" data-sc-prepared-task="${task.id}"><label class="sc-task__label"><input type="checkbox" ${task.completed?'checked ':''}disabled><span class="sc-task__body"><strong>${task.name}</strong><span class="sc-task__target">${task.completed?'Saved earlier; not repeated':`${task.target-task.confirmed} of ${task.target} passes remaining · ${task.confirmed} already confirmed`}</span></span></label><span class="sc-task__save">${task.completed?'Previously confirmed':'Not complete; Start has not occurred'}</span></li>`).join('')}</ol>
<details class="sc-disclosure"><summary>Source and interaction contract</summary><div class="sc-disclosure__body"><p>The eventual Start must use the same task identity, version, order, targets and confirmed counts as this preview. The application checks the current account, date and source witness again.</p><p>A changed source shows Review again, preserving valid choices. Loading or errors prevent Start. Cancel returns focus to its invoking control; a successful Start focuses the active task.</p><p>Illustrative source: editorial bundle version 3, review revision 8. No private source, provider authorization or health data appears here.</p></div></details>
<div class="sc-actionbar"><span class="sc-chip sc-chip--neutral">not started</span><p>Only ${s.remaining} remaining passes would continue. Earlier confirmation and elapsed time do not manufacture new work.</p><button class="sc-btn sc-btn--primary" type="button" disabled>Continue illustrative review</button></div></section>`;
}
