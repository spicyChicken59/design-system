// These functions validate actual rendered observations supplied
// by the approved browser tool or CI renderer. They do not operate a browser.
// Passing invented rectangles is not a rendered acceptance pass.
import assert from 'node:assert/strict';

const tolerance = 1.5;
function rect(value, label) {
  for (const k of ['left','top','right','bottom','width','height'])
    assert(Number.isFinite(value[k]), `${label}: finite ${k}`);
}

export function assertIntrinsicStage(observation) {
  const {stage,frames,activeCount,previousStageHeight,hasForcedRatio} = observation;
  rect(stage,'stage');
  assert(stage.width>0&&stage.height>0,'a loaded stage has real dimensions');
  assert.equal(activeCount,1,'exactly one frame is presented');
  assert.equal(frames.filter(frame=>frame.active).length,1,'exactly one frame is marked active');
  assert.equal(hasForcedRatio,false,'the stage has no unrelated fixed ratio');
  for(const frame of frames) {
    rect(frame,'frame');
    assert(frame.sourceWidth>0&&frame.sourceHeight>0,'source dimensions are genuine');
    const expectedHeight=frame.width*frame.sourceHeight/frame.sourceWidth;
    assert(Math.abs(frame.height-expectedHeight)<=tolerance,'rendering preserves source ratio');
    assert(frame.left>=stage.left-tolerance&&frame.right<=stage.right+tolerance,'frame stays inside stage');
    if(frame.active) {
      assert(!frame.ariaHidden&&!frame.visibilityHidden,'active frame is exposed');
      assert(Math.abs(frame.width-stage.contentWidth)<=tolerance,'active frame fills its content width');
      assert(Math.abs(frame.height-stage.contentHeight)<=tolerance,'matching-ratio frame introduces no empty strip');
    } else assert(frame.ariaHidden&&frame.visibilityHidden,'inactive frame is unavailable to inspection');
  }
  if(previousStageHeight!==undefined)
    assert(Math.abs(stage.height-previousStageHeight)<=tolerance,'matching frames do not jump on selection');
}

export function assertDockLayout(observation) {
  const {viewport,header,body,dock,targets,focused,focusedInDock,safeAreaBottom,dockPaddingBottom} = observation;
  for(const [name,value] of Object.entries({header,body,dock})) rect(value,name);
  assert(viewport.width>0&&viewport.height>0,'finite viewport');
  assert(header.bottom<=body.top+tolerance,'header does not overlap scrolling content');
  assert(body.bottom<=dock.top+tolerance,'dock is a reserved row, not an overlay');
  assert(body.height>0,'some content area remains in a short viewport');
  assert(dock.left>=-tolerance&&dock.right<=viewport.width+tolerance,'dock has no horizontal clipping');
  assert(dock.bottom<=viewport.height+tolerance,'dock stays inside the current layout viewport');
  assert(dockPaddingBottom>=safeAreaBottom-tolerance,'safe area is respected');
  for(const target of targets) {
    rect(target,'target');
    assert(target.width>=44-tolerance&&target.height>=44-tolerance,'navigation/action target is at least 44px');
    assert(target.left>=dock.left-tolerance&&target.right<=dock.right+tolerance,'dock target does not overflow horizontally');
  }
  if(focused) {
    rect(focused,'focused control');
    assert(focused.top>=body.top-tolerance&&focused.bottom<=body.bottom+tolerance,'focused body control is fully visible');
  }
  if(focusedInDock) {
    rect(focusedInDock,'focused dock control');
    assert(focusedInDock.top>=dock.top-tolerance&&focusedInDock.bottom<=dock.bottom-safeAreaBottom+tolerance,'dock scrolling reveals its focused control above the safe area');
  }
}
