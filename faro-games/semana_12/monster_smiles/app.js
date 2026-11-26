import { gameRuntime } from '/gallery/shared/runtime.js';
import {bank,shuffle} from './bank.js';
import {newGame,question,row,bonus,score,next,undo,standings} from './engine.js';
import {toothIcon,objectSVG,characterSVG} from './art.js';
import {smileSVG} from './smile.js';
const DISPLAY=new URLSearchParams(location.search).get('view')==='display';
document.body.classList.add(DISPLAY?'projection':'teacher');
let screen='setup';
const LIVE='englishcode:v1:monster-smiles:projector';
function publish(){if(DISPLAY)return;try{localStorage.setItem(LIVE,JSON.stringify({state,screen,stamp:Date.now()}));}catch{}}
function receive(){try{const p=JSON.parse(localStorage.getItem(LIVE)||'null');if(!p)return;if(p.state&&!valid(p.state))return;const prior=state;state=p.state;show(p.screen);if(state&&p.screen!=='setup')render();if(prior&&p.screen==='game'&&state.phase==='feedback'&&prior.phase!=='feedback'){scoreEffect(row(state),state.result.correct);if(state.result.correct&&bonus(state))confetti();}}catch(e){console.error('Projection sync',e);}}
const $=s=>document.querySelector(s),legacyKey='faro-monster-smiles-v1',colors=['#62dfce','#ffd16a','#f2a4d6','#afa9ff','#91c7ff','#d1e77e'];
const patients=[['shark','FINN','THE SHARK'],['vampire','VLAD','THE VAMPIRE'],['monster','MOSS','THE FUZZY MONSTER'],['mummy','CLEO','THE MUMMY']];
const familyLabels={quiz:'CHOOSE AN ANSWER',identify:'NAME IT',riddle:'SOLVE THE CLUE',fix:'FIX THE MIX-UP',dialogue:'YOUR LINE',memory:'VISUAL MEMORY',describe:'TELL US ABOUT IT'};
let state=null,stored=null,confirmAction=null,ctx=null,storageError=false,modelVisible=false;
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function canControl(){return !DISPLAY && screen==='game' && !$('#guide').open && !$('#confirm').open;}
const controls=gameRuntime('monster-smiles','quiz',DISPLAY?{}:{
 answer1:()=>choose(0,true),answer2:()=>choose(1,false),answer3:()=>choose(2),answer4:()=>choose(3),answer5:()=>choose(4),answer6:()=>choose(5),
 next:()=>{if(canControl())$('#next').click();},
 confirm:()=>{if(canControl())(state.phase==='feedback'?$('#next'):$('#show-model')).click();},
 hint:()=>{if(!$('#confirm').open)guide();},
});
const pack=controls.pack;
function valid(s){
 if(s?.version!==1||!Array.isArray(s.teams)||s.teams.length<1||s.teams.length>6||
   !Array.isArray(s.deck)||!s.deck.length||s.sizes?.length!==s.teams.length||
   !Number.isInteger(s.turn)||s.turn<0||s.turn>s.deck.length||
   !['intro','study','answer','timeup','feedback','finished'].includes(s.phase)||
   ![1,2,3].includes(s.grade)||s.turn===s.deck.length&&s.phase!=='finished')return false;
 if(s.customQuestions)return Array.isArray(s.customQuestions)&&s.deck.every(id=>{
  const q=s.customQuestions[id];
  return Number.isInteger(id)&&typeof q?.question==='string'&&Array.isArray(q.options)&&q.options.includes(q.answer);
 });
 return s.deck.every(id=>bank.some(q=>q.id===id));
}
try{const s=controls.load(null)??JSON.parse(localStorage.getItem(legacyKey)||'null');if(valid(s))stored=s;}catch{}
function save(){
 if(DISPLAY||!state)return;
 storageError=!controls.save(state);
 if(!storageError)stored=structuredClone(state);
 $('#storage-warning').hidden=!storageError;
 publish();
}
function audio(){try{ctx||=new (window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume();}catch{}}
function sound(kind){if(state?.muted||!ctx)return;const notes={correct:[523,659,784,1047],wrong:[220,165,131],arrival:[330,440],tick:[500],bonus:[523,784,1047,1319],win:[523,659,784,1047,784,1047]}[kind]||[];notes.forEach((hz,i)=>{const osc=ctx.createOscillator(),gain=ctx.createGain(),at=ctx.currentTime+i*.12;osc.type=kind==='wrong'?'triangle':'sine';osc.frequency.setValueAtTime(hz,at);gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.12,at+.015);gain.gain.exponentialRampToValueAtTime(.001,at+.27);osc.connect(gain).connect(ctx.destination);osc.start(at);osc.stop(at+.29);});}
function confetti(){const c=$('#confetti');c.innerHTML=Array.from({length:45},(_,i)=>`<i style="--x:${Math.random()*100}%;--delay:${Math.random()*.5}s;--color:${colors[i%6]}"></i>`).join('');setTimeout(()=>c.replaceChildren(),3500);}
function sizes(){const count=Number($('#rows').value);$('#roster').hidden=count===1;const old=[...document.querySelectorAll('#sizes input')].map(i=>i.value);$('#sizes').innerHTML=Array.from({length:count},(_,i)=>`<label>Equipo ${i+1}<input aria-label="Personas en el equipo ${i+1}" type="number" min="1" max="20" required value="${old[i]||6}"></label>`).join('');}
sizes();$('#rows').onchange=sizes;
if(pack){
 $('#question-pack-label').hidden=false;
 $('#question-pack').append(new Option(pack.title,'custom'));
 $('#question-pack').value='custom';
}$('#cover-patient').innerHTML=characterSVG('shark','braces');$('#resume').hidden=!stored;
function show(target){screen=target;for(const id of ['setup','game','results'])$('#'+id).hidden=id!==target;document.body.classList.toggle('paused',target==='game'&&state?.paused);publish();}
function ask(title,copy,callback){pause(true);$('#confirm-title').textContent=title;$('#confirm-copy').textContent=copy;confirmAction=callback;$('#confirm').showModal();}
$('#cancel').onclick=()=>{$('#confirm').close();confirmAction=null;};$('#confirm-yes').onclick=()=>{$('#confirm').close();const f=confirmAction;confirmAction=null;f?.();};
$('#settings').onsubmit=e=>{e.preventDefault();const config={grade:Number($('#grade').value),customQuestions:$('#question-pack').value==='custom'?pack?.items:null,sizes:[...document.querySelectorAll('#sizes input')].map(i=>Number(i.value)),rounds:Number($('#rounds').value),seconds:Number($('#seconds').value)};
 if(config.sizes.length===1)config.sizes=[1];
 const start=()=>{audio();modelVisible=false;let recent=[];try{recent=JSON.parse(localStorage.getItem('monster-smiles-recent-decks')||'[]');if(!Array.isArray(recent)||!recent.every(d=>Array.isArray(d)))recent=[];}catch{}
 const previous=[...recent.flat(), ...(stored?.customQuestions ? [] : stored?.deck || [])];state=newGame({...config,previous});
 try{if(!config.customQuestions)localStorage.setItem('monster-smiles-recent-decks',JSON.stringify([...recent,state.deck].slice(-3)));}catch{}
 arm(1);save();show('game');render();sound('arrival');};
 if(stored&&stored.phase!=='finished')ask('¿Comenzar otra clase?','Se reemplazará la partida guardada. La nueva empieza con ocho dientes por equipo.',start);else start();};
$('#resume').onclick=()=>{audio();state=structuredClone(stored);modelVisible=false;state.history||=[];if(state.phase==='finished'){showResults();return;}show('game');render();tick();};
function arm(seconds){state.remaining=seconds;state.deadline=Date.now()+seconds*1000;state.paused=false;}
function pause(force=false){if(!state||!['intro','study','answer'].includes(state.phase))return;if(force&&state.paused)return;if(state.paused){arm(state.remaining);}else{state.remaining=Math.max(0,(state.deadline-Date.now())/1000);state.deadline=null;state.paused=true;}save();updateTimer();}
function updateTimer(){if(!state)return;const active=['intro','study','answer'].includes(state.phase);const remaining=state.paused?state.remaining:state.deadline?Math.max(0,(state.deadline-Date.now())/1000):0;
 $('#time').textContent=active?`${Math.ceil(remaining)}s`:state.phase==='timeup'?'0s':'';
 const total=state.phase==='intro'?1:state.phase==='study'?5:state.seconds;
 $('#time-fill').style.width=`${active?Math.min(100,remaining/total*100):state.phase==='feedback'?100:0}%`;
 $('#phase-label').textContent=state.paused?'PAUSED':({intro:'Meet your patient…',study:'LOOK CLOSELY · Remember the four objects',answer:'Your team can help. Your player answers.',timeup:'TIME!',feedback:'Read the answer. Get ready for the next team.'}[state.phase]||'');
 $('#pause').textContent=state.paused?'Reanudar · P':'Pausar · P';$('#pause').disabled=!active;document.body.classList.toggle('paused',state.paused);$('.time-status').classList.toggle('urgent',state.phase==='answer'&&remaining<=5);
}
function tick(){if(DISPLAY){if(state)updateTimer();return;}if(!state||$('#game').hidden||state.paused)return;if(state.deadline&&Date.now()>=state.deadline){if(state.phase==='intro'){state.phase=question(state).type==='memory'?'study':'answer';arm(state.phase==='study'?5:state.seconds);save();render();}
 else if(state.phase==='study'){state.phase='answer';arm(state.seconds);save();render();sound('arrival');}
 else if(state.phase==='answer'){state.phase='timeup';state.deadline=null;state.remaining=0;save();render();sound('tick');}}
 updateTimer();}
setInterval(tick,100);
function renderScores(){const active=row(state);$('#scores').innerHTML=state.teams.map((t,i)=>`<article class="score ${i===active?'active':''}" style="--team:${colors[i]}"><div class="score-top"><span>TEAM ${i+1}</span><span class="coins">● ${t.coins}<span class="score-number">${t.teeth}/8</span></span></div>${smileSVG(t.teeth,colors[i])}</article>`).join('');}
function render(){if(!state)return;if(state.phase==='finished'){showResults();return;}const q=question(state),i=row(state),lap=Math.floor(state.turn/state.teams.length),kind=patients[q.visual==='braces'?0:q.visual==='brushing'?2:(state.turn+lap)%4];
 renderScores();$('#lap').textContent=`VUELTA ${lap+1} / ${state.rounds}`;$('#turn').textContent=`TEAM ${i+1} · YOUR TURN`;$('#turn').style.color=colors[i];
 const person=state.phase==='feedback'?(state.teams[i].person-1+state.sizes[i])%state.sizes[i]:state.teams[i].person;
 $('#student').textContent=`PLAYER ${person+1} / ${state.sizes[i]}`;$('#patient-kind').textContent=kind[2];$('#patient-name').textContent=kind[1];
 $('#patient').innerHTML=characterSVG(kind[0],q.visual);$('.patient-zone').className=`patient-zone ${state.phase==='intro'?'entering':''} ${state.result?state.result.correct?'mood-correct':'mood-wrong':''}`;
 $('#arrival').hidden=state.phase!=='intro';$('#bonus-tag').hidden=!bonus(state);$('#prop').hidden=q.visual==='tray';$('#prop').innerHTML=q.visual==='tray'?'':objectSVG(q.visual);
 $('#challenge-type').textContent=familyLabels[q.type];$('#prompt').textContent=state.phase==='intro'?'A new patient is here!':state.phase==='study'?'Remember these four objects.':q.prompts[state.grade-1];
 const testing=['answer','timeup'].includes(state.phase),tray=q.type==='memory'?[...q.tray]:[];
 if(testing&&q.memoryMode==='swap')[tray[q.missing],tray[q.other]]=[tray[q.other],tray[q.missing]];
 $('#tray').innerHTML=q.type==='memory'&&state.phase!=='intro'?tray.map((v,n)=>`<div class="tray-slot">${testing&&(q.memoryMode==='position'||(!q.memoryMode||q.memoryMode==='missing')&&n===q.missing)?`<span>${q.memoryMode==='position'?n+1:'?'}</span>`:objectSVG(v)}</div>`).join(''):'';
 const solo=state.teams.length===1;
 document.body.classList.toggle('solo-view',solo);
 const teacherArt=$('#teacher-prop');
 const hasTeacherArt=!DISPLAY&&(testing||state.phase==='feedback')&&q.visual!=='tray'&&q.visual!=='mystery';
 teacherArt.hidden=!hasTeacherArt;
 teacherArt.innerHTML=hasTeacherArt?objectSVG(q.visual):'';
 const custom=Boolean(state.customQuestions);
 const options=testing&&(custom||state.grade===1&&q.type!=='memory'&&!q.noOptions)?optionOrder(q):[];
 const canChoose=custom&&solo&&!DISPLAY;
 $('#options').replaceChildren(...options.map((option,index)=>{
  const entry=document.createElement(canChoose?'button':'div');
  entry.className='option';
  const letter=document.createElement('b');
  letter.textContent='ABCDEF'[index];
  entry.append(letter,document.createTextNode(option));
  if(canChoose)entry.onclick=()=>judge(option===q.correct);
  return entry;
 }));

 $('#feedback').hidden=state.phase!=='feedback';if(state.result){const correct=state.result.correct;$('#feedback').innerHTML=`${correct?'✓':'↻'} ${escape(state.grade===1?q.short:q.model)}<small>${correct?`+1 coin${state.result.restored?` · ${state.result.restored} tooth restored!`:''}`:'One tooth lost. Try saying the model answer.'}</small>`;}
 const canScore=['answer','timeup'].includes(state.phase);$('#correct').disabled=!canScore;$('#wrong').disabled=!canScore;const manual=!(solo&&custom)&&(!solo||modelVisible);$('#correct').hidden=!canScore||!manual;$('#wrong').hidden=!canScore||!manual;$('#show-model').hidden=DISPLAY||!solo||custom||!canScore||modelVisible;$('#next').hidden=state.phase!=='feedback';$('#next').textContent=state.turn+1===state.deck.length?'Ver ganador · Enter':'Siguiente equipo · Enter';$('#undo').disabled=!state.history.length;$('#skip-student').disabled=!['intro','study','answer','timeup'].includes(state.phase);$('#mute').textContent=`Sonido: ${state.muted?'OFF':'ON'}`;const showReference=!DISPLAY&&(!solo||!custom&&modelVisible)&&testing;
 $('#teacher-answer').textContent=showReference?(state.grade===1?q.short:q.model):'';
 $('#teacher-accept').textContent=showReference?q.accept:'';
 $('#teacher-reference').hidden=DISPLAY||solo&&!showReference&&$('#show-model').hidden;updateTimer();publish();}
function optionOrder(q){let seed=[...q.id].reduce((n,c)=>n+c.charCodeAt(0),0);return shuffle(q.options,()=>{seed=(seed*9301+49297)%233280;return seed/233280;});}
function scoreEffect(i,correct){const panel=document.querySelectorAll('.score')[i];if(!panel)return;panel.classList.add(correct?'gain':'hit');if(!correct){const lost=document.createElement('div');lost.className='lost-tooth';lost.innerHTML=toothIcon();panel.append(lost);setTimeout(()=>lost.remove(),1200);}}
function choose(index,manual){
 if(!canControl())return;
 const options=$('#options').querySelectorAll('button.option');
 if(options.length){options[index]?.click();return;}
 if(typeof manual==='boolean'&&!$('#correct').hidden)judge(manual);
}
function judge(correct){if(!canControl())return;audio();if(!state||!score(state,correct))return;save();render();scoreEffect(row(state),correct);sound(correct?state.result.restored?'bonus':'correct':'wrong');if(correct&&bonus(state))confetti();}
$('#show-model').onclick=()=>{if(!canControl()||$('#show-model').hidden)return;modelVisible=true;pause(true);render();};
$('#correct').onclick=()=>judge(true);$('#wrong').onclick=()=>judge(false);$('#pause').onclick=()=>{audio();pause();};
$('#next').onclick=()=>{if(!state||!next(state))return;if(state.phase==='intro')arm(1);modelVisible=false;save();render();sound(state.phase==='finished'?'win':'arrival');};
$('#undo').onclick=()=>{if(!state)return;const previous=undo(state);if(!previous)return;state=previous;modelVisible=false;save();show('game');render();};
$('#skip-student').onclick=()=>{const i=row(state);state.teams[i].person=(state.teams[i].person+1)%state.sizes[i];save();render();};
$('#mute').onclick=()=>{audio();state.muted=!state.muted;save();$('#mute').textContent=`Sonido: ${state.muted?'OFF':'ON'}`;if(!state.muted)sound('arrival');};
$('#full').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen?.();else document.documentElement.requestFullscreen?.();};
function menu(){pause(true);save();$('#resume').hidden=!stored;show('setup');}
$('#menu').onclick=menu;
$('#finish').onclick=()=>ask('¿Cerrar la clínica?',state.turn%state.teams.length===state.teams.length-1&&state.phase==='feedback'?'Se mostrarán los resultados de la partida.':'Esta vuelta está incompleta: no todos los equipos han tenido los mismos turnos. Puedes cancelar y terminar la vuelta.',()=>{state.finishedFrom={phase:state.phase,remaining:state.remaining};state.phase='finished';state.deadline=null;save();showResults();sound('win');});
function showResults(){show('results');const ranking=standings(state),leaders=ranking.filter(t=>t.teeth===ranking[0].teeth&&t.coins===ranking[0].coins);$('#winner').textContent=leaders.length===1?`TEAM ${leaders[0].row+1} WINS!`:`SHARED VICTORY · TEAMS ${leaders.map(t=>t.row+1).join(' + ')}`;
 $('#podium').innerHTML=ranking.map((t,n)=>`<article class="podium-row ${leaders.some(l=>l.row===t.row)?'winner':''}" style="--team:${colors[t.row]}"><div class="rank">${leaders.some(l=>l.row===t.row)?'★':n+1}</div><h3>TEAM ${t.row+1}</h3>${smileSVG(t.teeth,colors[t.row])}<p><b>${t.teeth} teeth · ${t.coins} coins</b></p><small>${t.played} turns</small></article>`).join('');$('#back-result').disabled=!state.history.length&&!state.finishedFrom;confetti();}
$('#back-result').onclick=()=>{if(state.finishedFrom){state.phase=state.finishedFrom.phase;state.remaining=state.finishedFrom.remaining;state.paused=['intro','study','answer'].includes(state.phase);delete state.finishedFrom;}else{state.turn=Math.max(0,state.turn-1);state.phase='feedback';}save();show('game');render();};
$('#new-game').onclick=menu;
function guide(){if($('#guide').open){$('#guide').close();return;}pause(true);$('#guide').showModal();}
document.querySelectorAll('[data-guide]').forEach(b=>b.onclick=guide);$('[data-close]').onclick=()=>$('#guide').close();
document.addEventListener('keydown',e=>{const key=e.key.toLowerCase();if(DISPLAY){if(key==='f')$('#full').click();return;}if(e.defaultPrevented||e.target.matches('input,select,textarea'))return;if($('#confirm').open)return;if(key==='h'){e.preventDefault();guide();return;}if($('#guide').open)return;if($('#game').hidden)return;
 if((e.ctrlKey||e.metaKey)&&key==='z'){e.preventDefault();$('#undo').click();return;}if(e.ctrlKey||e.metaKey||e.altKey||e.repeat)return;
 if(key==='c'&&!$('#correct').hidden)judge(true);else if(key==='x'&&!$('#wrong').hidden)judge(false);else if(key==='p')$('#pause').click();else if(key==='f')$('#full').click();else if(key==='escape')menu();});
// Switching focus to the projector must not pause the teacher's clock.
window.addEventListener('storage',e=>{if(DISPLAY&&e.key===LIVE)receive();});
document.querySelectorAll('[data-project]').forEach(b=>b.onclick=()=>{publish();window.open(new URL('?view=display',location.href).href,'monster-smiles-display');});
if(DISPLAY)receive();

