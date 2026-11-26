import assert from 'node:assert/strict';
import test from 'node:test';
import { createMission, hint, progress, restoreState, submit, support } from '../faro-games/farito/mission.js';
import { defaultScene, validScene } from '../faro-games/farito/portrait.js';

test('authored review has eight targets and separates independent answers from hints', () => {
 const mission=createMission('A2',null,()=>0.5);
 assert.equal(new Set(mission.reviewItems.map(item=>item.word)).size,8);
 const first=mission.reviewItems[0];
 hint(mission);
 assert.ok(support(mission).choices.includes(first.word));
 submit(mission,first.word);
 assert.equal(mission.independent,0);
 for(const item of mission.reviewItems.slice(1))submit(mission,item.word);
 assert.equal(mission.independent,7);
 assert.equal(progress(mission),40);
 assert.equal(mission.phase,'chat');
 const before=JSON.stringify(mission);
 assert.match(submit(mission,'Ask me at name@example.com').error,/fictional details/);
 assert.equal(JSON.stringify(mission),before);
 for(let i=0;i<6;i++)submit(mission,'My cousin likes reading.');
 assert.equal(progress(mission),75);
 assert.equal(restoreState(mission).phase,'portrait');
 assert.ok(validScene(defaultScene()));
});

test('custom multiword phrases accept the exact answer and preserve their own deck', () => {
 const mission=createMission('B1',{title:'Transport',items:[{word:'a bus',clue:'City transportation',translation:'un autobús'}]});
 assert.equal(mission.reviewTitle,'Transport');
 assert.equal(mission.customReview,true);
 submit(mission,'a bus');
 assert.equal(mission.phase,'chat');
 assert.equal(mission.independent,1);
});
