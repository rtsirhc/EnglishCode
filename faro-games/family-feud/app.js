import { gameRuntime } from '/gallery/shared/runtime.js';
import { read, write } from '/gallery/shared/storage.js';
import { BANK } from './questions.js';
import { playGameSound } from './sounds.js';
import { mappedTeam, SerialButtonParser } from './serial.js';
import { accept, buzz, canAnswer, createGame, flow, matchAnswer, publicView, strike, undo } from './engine.js';

const $ = id => document.getElementById(id);
const projectionId = new URLSearchParams(location.search).get('project');
const isDisplay = projectionId !== null;
const phases = { ready:'Next survey', buzz:'Face-off', opening:'Face-off', play:'Run the board', steal:'Steal attempt', done:'Round complete' };
const projectionKey = id => 'survey-show:projector:' + id;
const standardRounds = 4;
const controls = gameRuntime('family-feud-faro','survey',isDisplay ? {} : {
  ...Object.fromEntries(Array.from({length:8},(_,index)=>['answer'+(index+1),()=>submitIndex(index)])),
  next:() => $('next').click(),
  buzzer:() => act(game=>buzz(game,0),'buzz'),
  confirm:() => { if(game?.round.phase==='buzz')act(game=>buzz(game,1),'buzz');else if(canAnswer(game))$('typed').focus();else $('next').click(); },
  hint:() => { if(game) $('reference').open=!$('reference').open; },
});
const pack = controls.pack;
const saved = controls.load(null);
let stored = saved?.version===2 && saved?.deck?.length && saved?.round?.answers?.length ? saved : null;
let game = null, visible = null, audio, recognition, serial, swap = read('survey-show:swap',false);
const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const speechAvailable = Boolean(Recognition?.prototype && 'processLocally' in Recognition.prototype);
const speechOptions = { langs:['en-US'], processLocally:true };

function notice(text='') { $('notice').textContent=text; }

async function sound(kind) {
  if(!kind)return;
  try{
    const Context=window.AudioContext||window.webkitAudioContext;
    audio ||= new Context();
    if(audio.state==='suspended')await audio.resume();
    playGameSound(audio,kind);
  }catch{}
}

function levelLabel(level) {
  return ({1:'A1',2:'A2',3:'B1'})[level] || (String(level).startsWith('custom:') ? String(level).slice(7) : level);
}

function renderPublic(snapshot) {
  visible=snapshot;
  $('game').hidden=!snapshot;
  $('game').classList.toggle('finished',Boolean(snapshot?.finished));
  if(isDisplay)$('waiting').hidden=Boolean(snapshot);
  if(!snapshot)return;
  $('name-a').textContent=snapshot.teams[0]; $('name-b').textContent=snapshot.teams[1];
  $('points-a').textContent=snapshot.scores[0]; $('points-b').textContent=snapshot.scores[1];
  $('score-a').classList.toggle('active',snapshot.active===0);
  $('score-b').classList.toggle('active',snapshot.active===1);
  $('round').textContent=`Round ${snapshot.turn+1} / ${snapshot.total} · ${levelLabel(snapshot.level)}`;
  $('pot').textContent=snapshot.pot;
  $('multiplier').textContent=`Board points ×${snapshot.multiplier}`;
  $('phase').textContent=snapshot.finished?'Final scores':phases[snapshot.phase];
  $('question').textContent=snapshot.finished?
    snapshot.scores[0]===snapshot.scores[1]?'It’s a tie!':`${snapshot.teams[Number(snapshot.scores[1]>snapshot.scores[0])]} wins!`:
    snapshot.question||'Ready for the next question?';
  $('answers').hidden=snapshot.finished;
  $('answers').replaceChildren(...snapshot.answers.map((answer,index)=>{
    const tile=document.createElement('article');
    tile.className='tile'+(answer?' revealed'+(answer.found?'':' review'):'');
    const rank=document.createElement('b');
    rank.textContent=index+1;
    const label=document.createElement('span');
    label.textContent=answer?.text || '•••';
    const points=document.createElement('strong');
    points.textContent=answer ? String(answer.points*snapshot.multiplier) : '';
    if(!answer)label.setAttribute('aria-label','Covered answer');
    tile.append(rank,label,points);
    return tile;
  }));
  $('feedback').textContent=snapshot.finished?'':snapshot.message;
  $('strikes').textContent=snapshot.strikes?`${'✕ '.repeat(snapshot.strikes).trim()} · ${snapshot.strikes} / 3`:'';
  tick();
}

function save() {
  if(!game)return;
  if(controls.save(game))stored=game;
  write(projectionKey(game.id),publicView(game));
}

function render() {
  $('setup').hidden=Boolean(game);
  $('resume').hidden=!stored;
  $('projector').hidden=!game;
  if(!game){renderPublic(null);return;}
  const publicState=publicView(game);
  renderPublic(publicState);
  $('projector').href='?'+new URLSearchParams({project:game.id});
  const round=game.round, answering=canAnswer(game);
  $('buzz-a').disabled=$('buzz-b').disabled=round.phase!=='buzz'||game.finished;
  $('buzz-a').textContent=`Buzz · ${game.teams[0]}`;
  $('buzz-b').textContent=`Buzz · ${game.teams[1]}`;
  $('next').disabled=game.finished||!['ready','done'].includes(round.phase);
  $('next').textContent=round.phase==='ready'?'Open survey':round.answers.some(answer=>!answer.found&&!answer.uncovered)?'Reveal another answer':
    game.turn+1<game.deck.length?'Next survey':'Show winner';
  $('clock').disabled=$('strike').disabled=!answering;
  $('clock').textContent=round.deadline?'Restart timer':'Start 10-second timer';
  $('undo').disabled=!game.history.length;
  $('typed').disabled=$('check').disabled=!answering;
  $('record').hidden=!speechAvailable;
  $('record').disabled=!answering;
  $('record').textContent=recognition?'Stop dictation':'Dictate on device';
  $('reference-answers').replaceChildren(...round.answers.map((answer,index)=>{
    const entry=document.createElement('button');
    entry.type='button';
    entry.textContent=`${index+1}. ${answer.text} · ${answer.points}`;
    entry.disabled=!answering||answer.found;
    entry.onclick=()=>submitIndex(index);
    return entry;
  }));
}

function act(operation, cue) {
  if(!game || $('hardware-dialog').open)return false;
  if(!operation(game))return false;
  cancelDictation();
  $('typed').value='';
  notice();
  save();
  render();
  sound(cue);
  return true;
}

function tick() {
  const deadline=visible?.deadline;
  $('timer').textContent=deadline?`${Math.max(0,Math.ceil((deadline-Date.now())/1000))}s`:'';
}

function overdue() {
  if(game?.round.deadline && game.round.deadline<=Date.now()){
    return act(game=>strike(game,'Time expired'),'wrong');
  }
  return false;
}

function submitIndex(index) {
  if(overdue())return;
  if(!act(game=>accept(game,index),'correct')&&canAnswer(game))notice('Choose an unrevealed answer from the teacher list.');
}

function submitTyped(event) {
  event.preventDefault();
  if(overdue()||!canAnswer(game))return;
  const result=matchAnswer(game,$('typed').value);
  if(result.kind==='match'){submitIndex(result.index);return;}
  notice({
    duplicate:'That response is already on the board.',
    ambiguous:'More than one response matches. Choose the category from the teacher list.',
    unknown:'No exact match. Use the teacher list to accept an equivalent answer, or mark a strike.',
  }[result.kind]);
  sound('duplicate');
}

function randomRounds(deck) {
  const selection=[...deck];
  for(let end=selection.length-1;end>0;end--){
    const other=Math.floor(Math.random()*(end+1));
    [selection[end],selection[other]]=[selection[other],selection[end]];
  }
  return selection.slice(0,standardRounds).map(([question,answers])=>[question,[...answers].sort((a,b)=>b[2]-a[2])]);
}

function start(event) {
  event.preventDefault();
  const selected=$('level').value;
  const usePack=selected==='custom'&&pack;
  const source=usePack?pack.items.map(item=>[item.question,item.answers.map(answer=>[answer.text,[],answer.points])]):BANK[selected];
  const teams=[$('team-a').value.trim()||'Team A',$('team-b').value.trim()||'Team B'];
  if(stored)write(projectionKey(stored.id),null);
  game=createGame(randomRounds(source),teams,usePack?'custom:'+pack.level:selected);
  $('reference').open=false;
  save();
  render();
}

function resume() {
  if(!stored)return;
  game=stored;
  game.round.deadline=null;
  save();
  render();
}

function refreshDisplay() {
  const snapshot=read(projectionKey(projectionId),null);
  renderPublic(snapshot?.id===projectionId?snapshot:null);
}

function cancelDictation() {
  const active=recognition;
  recognition=null;
  if(active)try{active.abort();}catch{}
}

function dictate() {
  if(!speechAvailable||!canAnswer(game))return;
  if(recognition){recognition.stop();return;}
  const input=new Recognition();
  input.lang=speechOptions.langs[0];
  input.processLocally=true;
  recognition=input;
  const end=()=>{
    if(recognition===input){recognition=null;$('record').textContent='Dictate on device';}
  };
  input.onresult=event=>{
    if(recognition!==input)return;
    $('typed').value=event.results[0][0].transcript.slice(0,250);
    $('typed').focus();
    notice('Review the transcription and check the match.');
  };
  input.onend=end;
  input.onerror=()=>{
    if(recognition!==input)return;
    end();
    notice('Dictation is unavailable. Type the spoken answer or select it from the teacher list.');
  };
  try{
    input.start();
    $('record').textContent='Stop dictation';
  }catch{input.onerror();}
}

async function installDictation() {
  const status=$('speech-status');
  try{
    const ready=await Recognition.install(speechOptions);
    status.textContent=ready?'Offline English dictation is ready.':'English dictation could not be enabled on this device.';
  }catch{status.textContent='English dictation could not be enabled on this device.';}
}

function updateHardware(text) { $('hardware-status').textContent=text; }

async function resetController() {
  const connection=serial;
  if(!connection?.port.writable)return;
  let writer;
  try{
    writer=connection.port.writable.getWriter();
    await writer.write(new TextEncoder().encode('R\n'));
  }catch{}finally{writer?.releaseLock();}
}

async function connect() {
  if(serial){await serial.reader.cancel().catch(()=>{});return;}
  if(!navigator.serial){updateHardware('Web Serial is unavailable. Keyboard and touch buzzers are ready.');return;}
  let port,reader;
  try{
    port=await navigator.serial.requestPort();
    await port.open({baudRate:115200});
    reader=port.readable.getReader();
    serial={port,reader};
    $('connect').textContent='Disconnect Arduino';
    updateHardware('Arduino connected.');
    const parser=new SerialButtonParser(), decoder=new TextDecoder();
    await resetController();
    while(true){
      const {value,done}=await reader.read();
      if(done)break;
      for(const button of parser.push(decoder.decode(value,{stream:true}))){
        const team=mappedTeam(button,swap?'B':'A',swap?'A':'B');
        if(team!==null && !act(game=>buzz(game,team),'buzz')&&game?.round.phase==='ready')await resetController();
      }
    }
  }catch{
    updateHardware('Could not connect. Check that the port is available, or use keyboard and touch.');
  }finally{
    if(reader){
      reader.releaseLock();
      await port.close().catch(()=>{});
      serial=null;
      $('connect').textContent='Connect Arduino';
      updateHardware('Arduino disconnected. Keyboard and touch buzzers are ready.');
    }
  }
}

if(isDisplay){
  $('setup').hidden=$('host-tools').hidden=$('host-controls').hidden=true;
  refreshDisplay();
  window.addEventListener('storage',event=>{
    if(event.key==='englishcode:v1:'+projectionKey(projectionId))refreshDisplay();
  });
}else{
  if(pack){$('level').append(new Option(pack.title,'custom'));$('level').value='custom';}
  if(stored){
    $('team-a').value=stored.teams[0];
    $('team-b').value=stored.teams[1];
  }
  $('settings').onsubmit=start;
  $('resume').onclick=resume;
  $('next').onclick=()=>{
    if(act(flow,'reveal')&&game.round.phase==='buzz')resetController();
  };
  $('buzz-a').onclick=()=>act(game=>buzz(game,0),'buzz');
  $('buzz-b').onclick=()=>act(game=>buzz(game,1),'buzz');
  $('strike').onclick=()=>{if(!overdue())act(strike,'wrong');};
  $('undo').onclick=()=>{if(act(undo)&&game.round.phase==='buzz')resetController();};
  $('clock').onclick=()=>{
    if(!canAnswer(game)||overdue())return;
    game.round.deadline=Date.now()+10000;
    save();render();
  };
  $('menu').onclick=()=>{
    if(game){game.round.deadline=null;save();}
    cancelDictation();game=null;render();
  };
  $('answer-form').onsubmit=submitTyped;
  $('record').onclick=dictate;
  $('hardware').onclick=()=>$('hardware-dialog').showModal();
  $('connect').onclick=connect;
  $('swap').checked=swap;
  $('swap').onchange=()=>{swap=$('swap').checked;write('survey-show:swap',swap);};
  $('install-speech').hidden=!speechAvailable||typeof Recognition.install!=='function';
  $('install-speech').onclick=installDictation;
  document.addEventListener('keydown',event=>{
    if(event.defaultPrevented||event.repeat||$('hardware-dialog').open)return;
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'&&!event.target.matches('input,textarea')){
      event.preventDefault();$('undo').click();return;
    }
    if(event.ctrlKey||event.metaKey||event.altKey||event.target.matches('input,textarea,select'))return;
    if(event.key.toLowerCase()==='a')$('buzz-a').click();
    if(event.key.toLowerCase()==='b')$('buzz-b').click();
  });
  render();
}
setInterval(()=>{if(!isDisplay)overdue();tick();},200);
window.addEventListener('pagehide',()=>{cancelDictation();serial?.reader.cancel().catch(()=>{});});
