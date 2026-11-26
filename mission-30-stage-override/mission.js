import { gameRuntime } from '/gallery/shared/runtime.js';
const $=selector=>document.querySelector(selector);
const response=await fetch('./challenges.json');
if(!response.ok){$('#clue').textContent='Mission could not load. Reconnect and reload the page.';throw new Error('Mission content unavailable');}
const builtIn=await response.json();
const runtime=gameRuntime('mission-30-stage-override','words',{confirm:()=>$('#answer-form').requestSubmit(),next:()=>$('#answer').focus()});
const challenges=runtime.pack?.items||builtIn;
const fingerprint=JSON.stringify(challenges);
const previous=runtime.load(null);
let state=previous?.fingerprint===fingerprint && Number.isInteger(previous.stage) && previous.stage>=0 && previous.stage<=challenges.length && Number.isInteger(previous.attempts) && previous.attempts>=0 ? previous : {fingerprint,stage:0,attempts:0};
if(runtime.pack){$('#pack-title').textContent=runtime.pack.title.toUpperCase();$('#level').textContent=runtime.pack.level;}
let transientFeedback='';
function persist(){if(!runtime.save(state))$('.privacy').textContent='Browser storage is unavailable. This session can still be played, but progress will not be saved.';}
function render(){
 const complete=state.stage===challenges.length;
 $('.mission-panel').hidden=complete;$('#victory').hidden=!complete;
 if(complete){$('#results').textContent=`${challenges.length} stages completed in ${state.attempts} attempts.`;$('#replay').focus();return;}
 $('#stage').textContent=`STAGE ${String(state.stage+1).padStart(2,'0')} / ${challenges.length}`;
 $('#percent').textContent=`${Math.floor(state.stage/challenges.length*100)}% UNLOCKED`;
 $('#progress').max=challenges.length;$('#progress').value=state.stage;
 $('#clue').textContent=challenges[state.stage].clue;
 $('#answer').disabled=false;$('#answer').value='';$('#feedback').textContent=transientFeedback;$('#feedback').classList.remove('error');$('#hint-text').textContent='';$('#answer').focus();
}
const normalize=value=>value.trim().toLocaleLowerCase('en').replace(/\s+/g,' ');
$('#answer-form').addEventListener('submit',event=>{event.preventDefault();if(state.stage>=challenges.length)return;const answer=$('#answer').value;if(!answer.trim())return;state.attempts++;
 if(normalize(answer)===normalize(challenges[state.stage].word)){state.stage++;transientFeedback='Access granted. Next stage unlocked.';persist();render();}
 else{$('#feedback').textContent='Not quite. Check the clue and try again.';$('#feedback').classList.add('error');persist();$('#answer').select();}
});
$('#hint').addEventListener('click',()=>{const word=challenges[state.stage].word;$('#hint-text').textContent=[...word].map((letter,index)=>letter===' '?' / ':index===0?letter:'_').join(' ');$('#answer').focus();});
function restart(){state={fingerprint,stage:0,attempts:0};transientFeedback='';persist();render();}
$('#restart').addEventListener('click',()=>$('#restart-dialog').showModal());
$('#cancel-restart').addEventListener('click',()=>$('#restart-dialog').close());
$('#confirm-restart').addEventListener('click',()=>{$('#restart-dialog').close();restart();});
$('#replay').addEventListener('click',restart);
render();
