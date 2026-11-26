import { BANK as builtIn } from './bank.js';
import { bindGameControls } from '/gallery/shared/runtime.js';
import { validatePack } from '/gallery/shared/content.js';
import { read, write } from '/gallery/shared/storage.js';

const $ = selector => document.querySelector(selector);
const query = new URLSearchParams(location.search);
const isBoard = query.get('view') === 'board';
const actions = isBoard ? {
  ...Object.fromEntries(Array.from({ length: 8 }, (_, index) => ['answer' + (index + 1), () => $('.loteria-grid')?.children[index]?.click()])),
  confirm: () => $('#claim')?.click(),
} : {
  confirm: () => advance(), next: () => advance(), hint: () => showHistory(),
};
let custom;
try {
 const pack=read('pack:health-loteria',null);
 if(pack)custom=validatePack(pack,'words');
} catch { /* Keep the built-in deck available. */ }
const words = custom ? [...new Map(custom.items.map(item => [item.word.toLowerCase(), item])).values()] : null;
const BANK = custom ? {
  cards: words.map((item, id) => ({ id, word: item.word, clue: item.clue })),
  sheets: [],
} : builtIn;
const N = BANK.cards.length;
const packHash = custom ? Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',
  new TextEncoder().encode(JSON.stringify(BANK.cards)))), byte => byte.toString(16).padStart(2, '0')).join('') : 'built-in';
const progressKey = 'englishcode:v1:progress:health-loteria';
const legacyKey = 'faro.health-loteria.caller.v1';
const voice = $('#voice');
let storageOK = true, auto = false, timer, playId = 0, historyOpen = false;
const canAdvance = () => state.cursor < N-1 || guessing();

function shuffled() {
  const order = Array.from({length:N}, (_, i) => i);
  for (let end = order.length - 1; end > 0; end--) {
    const other = Math.floor(Math.random() * (end + 1));
    [order[other], order[end]] = [order[end], order[other]];
  }
  return order;
}
function fresh() {
  return { version:2, pack:packHash, round:crypto.randomUUID(), deck:shuffled(), cursor:-1,
    muted:false, interval:12, mode:'words', revealed:true };
}
function restore(value) {
  const source = value?.version === 1 && !custom ?
    { ...value, version:2, pack:packHash, round:'legacy' } : value;
  if (source?.version !== 2 || source.pack !== packHash || typeof source.round !== 'string' ||
      !Array.isArray(source.deck) || source.deck.length !== N || new Set(source.deck).size !== N ||
      !source.deck.every(index => Number.isInteger(index) && index >= 0 && index < N) ||
      !Number.isInteger(source.cursor) || source.cursor < -1 || source.cursor >= N ||
      ![8,12,18,25].includes(source.interval)) return null;
  return { ...source, mode:source.mode === 'clues' ? 'clues' : 'words', revealed:source.revealed !== false, muted:source.muted === true };
}
const prior = read('progress:health-loteria',null);
let legacy;
if (!custom && !prior) {
  try { legacy = JSON.parse(localStorage.getItem(legacyKey)); } catch {}
}
let state = restore(prior ?? legacy) ?? fresh();

function guessing(){return state.mode==='clues'&&state.cursor>=0&&!state.revealed;}
function save(){storageOK=write('progress:health-loteria',state);}
function note(s=''){const notice=$(isBoard?'#solo-note':'#notice');if(!notice)return;notice.textContent=s||(!storageOK?'El navegador no permite guardar. Mantén esta pestaña abierta.':'');}
function stopVoice(){playId++;voice.pause();voice.onended=null;voice.onerror=null;if(custom&&window.speechSynthesis)speechSynthesis.cancel();}
function clearTimer(){clearTimeout(timer);timer=null;}
function schedule(){clearTimer();if(auto&&canAdvance()&&!historyOpen&&!$('#reset-dialog').open){timer=setTimeout(()=>{timer=null;advance();},state.interval*1000);}}
function setAuto(enabled){auto=enabled&&canAdvance()&&!historyOpen&&!$('#reset-dialog').open;clearTimer();$('#auto').setAttribute('aria-pressed',String(auto));$('#auto').textContent=auto?'Pausar':'Automático';if(auto&&voice.paused&&!window.speechSynthesis?.speaking)schedule();}
function speak(id, after, clue = false) {
 stopVoice();clearTimer();note();
 const token=playId, card=BANK.cards[id];
 if(state.muted){after?.();return;}
 if(custom){
  const localVoice=window.speechSynthesis?.getVoices().find(voice=>voice.localService&&voice.lang.toLowerCase().startsWith('en'));
  if(!localVoice){note('Lee la carta en voz alta. Este dispositivo no tiene una voz local en inglés.');after?.();return;}
  const utterance=new SpeechSynthesisUtterance(clue?card.clue:card.word);
  utterance.voice=localVoice;
  utterance.onend=()=>{if(token===playId)after?.();};
  utterance.onerror=()=>{if(token===playId){note('Lee la carta en voz alta.');after?.();}};
  speechSynthesis.speak(utterance);
  return;
 }
 voice.src=clue?card.clueAudio:card.audio;
 voice.onended=()=>{if(token===playId)after?.();};
 const failed=()=>{if(token===playId){setAuto(false);note('No se pudo reproducir la voz. Pulsa Repetir voz.');}};
 voice.onerror=failed;
 voice.play().catch(failed);
}
function setArt(node,id){const local=id%12,row=Math.floor(local/4),col=local%4;node.style.backgroundImage='url("'+BANK.sheets[Math.floor(id/12)]+'")';node.style.backgroundPosition=`${col/3*100}% ${row/2*100}%`;let top=0,bottom=0,left=0,right=0;if(id>=36){if(row===0)bottom=2.5;if(row===2)top=5;if(local===5)left=4;if(local===10)right=4;}node.style.clipPath=`inset(${top}% ${right}% ${bottom}% ${left}%)`;node.setAttribute('aria-label',BANK.cards[id].word);}
function render(){const active=state.cursor>=0,hiddenAnswer=guessing();$('#welcome').hidden=active;$('#card').hidden=!active;$('#counter').textContent=`${state.cursor+1} / ${N}`;$('#undo').disabled=!active||historyOpen;$('#repeat').disabled=!active||historyOpen;$('#next').disabled=historyOpen||!canAdvance();$('#next').textContent=hiddenAnswer?'Revelar respuesta':active?'Siguiente carta →':'Sacar primera carta →';$('#done').hidden=state.cursor!==N-1||hiddenAnswer;$('#done').textContent=`¡Las ${N} cartas han salido!`;$('#interval').value=state.interval;$('#mode').value=state.mode;$('#sound').textContent=state.muted?'Sonido: no':'Sonido: sí';$('#sound').setAttribute('aria-pressed',String(!state.muted));$('#picture').hidden=hiddenAnswer||Boolean(custom);$('#word').hidden=hiddenAnswer;$('#clue').hidden=!hiddenAnswer;$('#question-mark').hidden=!hiddenAnswer;if(active){const id=state.deck[state.cursor];if(hiddenAnswer){$('#picture').style.backgroundImage='none';$('#picture').removeAttribute('aria-label');$('#word').textContent='';$('#clue').textContent=BANK.cards[id].clue;}else{if(!custom)setArt($('#picture'),id);$('#word').textContent=BANK.cards[id].word;$('#clue').textContent='';}}if(historyOpen)renderHistory();note();}
function draw(){if($('#reset-dialog').open||historyOpen||state.cursor>=N-1)return;state.cursor++;state.revealed=state.mode!=='clues';save();render();$('#card').classList.remove('enter');void $('#card').offsetWidth;$('#card').classList.add('enter');if(!canAdvance())setAuto(false);speak(state.deck[state.cursor],schedule,guessing());}
function reveal(){if(!guessing()||historyOpen||$('#reset-dialog').open)return;state.revealed=true;save();render();if(state.cursor===N-1)setAuto(false);speak(state.deck[state.cursor],schedule);}
function advance(){if(guessing())reveal();else draw();}
function undo(){if($('#reset-dialog').open||historyOpen||state.cursor<0)return;setAuto(false);stopVoice();state.cursor--;state.revealed=true;save();render();}
function repeat(){if(state.cursor<0)return;speak(state.deck[state.cursor],schedule,guessing());}
function renderHistory(){const grid=$('#history-grid');grid.replaceChildren();const count=state.cursor+1-(guessing()?1:0);$('#empty-history').hidden=count>0;state.deck.slice(0,count).forEach((id,i)=>{const b=document.createElement('button');b.className='small-card';b.title='Escuchar '+BANK.cards[id].word;const num=document.createElement('small');num.textContent=String(i+1).padStart(2,'0');const img=document.createElement('div');img.className='art';if(!custom)setArt(img,id);img.setAttribute('aria-hidden','true');const label=document.createElement('b');label.textContent=BANK.cards[id].word;if(custom)b.append(num,label);else b.append(num,img,label);b.onclick=()=>speak(id);grid.append(b);});}
function showHistory(value=!historyOpen){historyOpen=value;if(value){setAuto(false);stopVoice();}$('#history').hidden=!value;$('#history-button').setAttribute('aria-expanded',String(value));$('#history-button').textContent=value?'Volver':'Cantadas';render();}
async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch(e){note('Usa F11 para pantalla completa en este navegador.');}}
function startCaller(){
$('#next').onclick=advance;$('#undo').onclick=undo;$('#repeat').onclick=repeat;$('#mode').onchange=()=>{setAuto(false);stopVoice();state.mode=$('#mode').value;state.revealed=state.mode!=='clues';save();render();if(state.cursor>=0)repeat();};$('#auto').onclick=()=>{if(!auto&&state.cursor<0){setAuto(true);draw();}else setAuto(!auto);};
$('#interval').onchange=()=>{state.interval=Number($('#interval').value);save();if(auto&&voice.paused&&!window.speechSynthesis?.speaking)schedule();};$('#sound').onclick=()=>{state.muted=!state.muted;save();if(state.muted){stopVoice();schedule();}render();};$('#history-button').onclick=()=>showHistory();$('#fullscreen').onclick=fullscreen;
$('#new').onclick=()=>{setAuto(false);stopVoice();$('#reset-dialog').showModal();};$('#cancel-new').onclick=()=>$('#reset-dialog').close();$('#confirm-new').onclick=()=>{const muted=state.muted,interval=state.interval,mode=state.mode;state={...fresh(),muted,interval,mode};save();$('#reset-dialog').close();showHistory(false);render();};
document.addEventListener('keydown',e=>{if(e.defaultPrevented||e.repeat||e.altKey||e.metaKey||['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)||$('#reset-dialog').open)return;const k=e.key.toLowerCase();if(e.ctrlKey&&k!=='z')return;if(e.ctrlKey&&k==='z'){e.preventDefault();undo();return;}if(k===' '&&!e.target.closest('button, a[href], summary')||k==='n'){e.preventDefault();advance();}else if(k==='v'){e.preventDefault();reveal();}else if(k==='arrowleft'||k==='z'){e.preventDefault();undo();}else if(k==='r'){e.preventDefault();repeat();}else if(k==='p'){e.preventDefault();$('#auto').click();}else if(k==='h'){e.preventDefault();showHistory();}else if(k==='f'){e.preventDefault();fullscreen();}else if(k==='escape'&&historyOpen){e.preventDefault();showHistory(false);}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)setAuto(false);});window.addEventListener('pagehide',()=>{setAuto(false);stopVoice();});
$('#help').innerHTML='<kbd>Espacio / →</kbd> revelar o siguiente · <kbd>V</kbd> revelar · <kbd>R</kbd> repetir · <kbd>← / Ctrl Z</kbd> deshacer · <kbd>P</kbd> automático/pausa · <kbd>H</kbd> cantadas · <kbd>F</kbd> pantalla completa';
$('#deck-size').textContent=`${N} cartas · 23 cartones digitales`;
$('#reset-copy').textContent=`Se mezclarán de nuevo las ${N} cartas.`;
updateBoardLink();
$('#board-number').onchange=updateBoardLink;
if(custom)$('#bank-title').textContent=custom.title;
save();render();
}

function updateBoardLink() {
 const number = $('#board-number').value || '1';
 $('#board-link').href = '?' + new URLSearchParams({view:'board', board:number});
}

function layout(number, size) {
 const list = Array.from({length:N}, (_, index) => index);
 let seed = number;
 for (let end=list.length-1; end>0; end--) {
  seed = (Math.imul(seed,1664525)+1013904223) >>> 0;
  const other = Math.floor(seed / 4294967296 * (end + 1));
  [list[other],list[end]] = [list[end],list[other]];
 }
 return list.slice(0, size * size);
}

function calledCards() {
 return new Set(state.deck.slice(0, state.cursor + (guessing() ? 0 : 1)));
}

function startBoard() {
 const number = Math.max(1, Math.min(23, Math.floor(Number(query.get('board')) || 1)));
 const solo = query.get('solo') === '1';
 const size = Math.min(4, Math.floor(Math.sqrt(N)));
 const cells = layout(number,size);
 const boardKey = `health-loteria:${solo ? 'solo' : 'board'}:${number}`;
 const savedBoard = read(boardKey,null);
 if(solo)state = restore(savedBoard?.state) ?? fresh();
 let marked = new Set(savedBoard?.round === state.round && Array.isArray(savedBoard.marked) ?
   savedBoard.marked.filter(id => cells.includes(id)) : []);
 const panel=$('#player-board');
 let claimed = false;
 $('#caller').hidden=true;
 panel.hidden=false;
 panel.innerHTML = `<header><h1>Health Lotería · Cartón ${number}</h1><a href="./index.html">Cantor</a></header>
  <main class="player-loteria">
   <p>Marca las cartas que ya se revelaron. Completa una fila, columna o diagonal.</p>
   <p id="incoming" aria-live="polite"></p>
   ${solo?'<div class="board-links"><button id="solo-next">Siguiente</button><label>Modo <select id="solo-mode"><option value="words">Palabras</option><option value="clues">Adivinanzas</option></select></label><button id="solo-restart">Nueva partida</button></div>':''}
   <div class="loteria-grid" style="--size:${size}"></div>
   <div class="board-links"><button id="claim">¡Lotería!</button><button id="print-board">Imprimir cartón</button></div>
   <p id="claim-status" role="status"></p><p id="solo-note" role="status"></p>
  </main>`;

 function saveBoard() { write(boardKey,{round:state.round,marked:[...marked],...(solo?{state}:{})}); }
 function status(message) { $('#claim-status').textContent=message; }
 function hasLine() {
  const rows=Array.from({length:size},(_,index)=>index);
  const matches=indices=>indices.every(index=>marked.has(cells[index]));
  return rows.some(row=>matches(rows.map(col=>row*size+col))) ||
   rows.some(col=>matches(rows.map(row=>row*size+col))) ||
   matches(rows.map(row=>row*size+row)) || matches(rows.map(row=>row*size+size-1-row));
 }
 function renderBoard() {
  const known=calledCards();
  marked=new Set([...marked].filter(id=>known.has(id)));
  if(claimed&&!hasLine()){claimed=false;status('La línea ya no está completa.');}
  const current=state.cursor>=0?BANK.cards[state.deck[state.cursor]]:null;
  $('#incoming').textContent=current?(guessing()?current.clue:`Carta ${state.cursor+1} / ${N} · ${current.word}`):'Esperando la primera carta…';
  $('.loteria-grid').replaceChildren(...cells.map(id=>{
   const button=document.createElement('button');
   button.className='board-cell';
   button.setAttribute('aria-pressed',String(marked.has(id)));
   if(!custom){
    const img=document.createElement('span');
    img.className='art';
    img.setAttribute('aria-hidden','true');
    setArt(img,id);
    button.append(img);
   }
   const word=document.createElement('strong');
   word.textContent=BANK.cards[id].word;
   button.append(word);
   button.onclick=()=>{
    if(!known.has(id)){status('Esa carta aún no se ha revelado.');return;}
    if(marked.has(id))marked.delete(id);else marked.add(id);
    if(claimed&&!hasLine())claimed=false;
    status('');
    button.setAttribute('aria-pressed',String(marked.has(id)));
    saveBoard();
   };
   return button;
  }));
  if(solo){
   $('#solo-mode').value=state.mode;
   $('#solo-next').textContent=guessing()?'Revelar respuesta':'Siguiente carta →';
   $('#solo-next').disabled=!canAdvance();
  }
  saveBoard();
 }
 $('#claim').onclick=()=>{
  claimed=hasLine();
  status(claimed?'¡Lotería! Completaste una línea.':'Todavía falta completar una línea.');
 };
 $('#print-board').onclick=()=>window.print();
 if(solo){
  $('#solo-next').onclick=()=>{
   if(!canAdvance())return;
   if(guessing())state.revealed=true;
   else {state.cursor++;state.revealed=state.mode!=='clues';}
   renderBoard();
   speak(state.deck[state.cursor],null,guessing());
  };
  $('#solo-restart').onclick=()=>{
   stopVoice();
   const mode=state.mode;
   state={...fresh(),mode};
   marked.clear();
   claimed=false;
   status('');
   renderBoard();
  };
  $('#solo-mode').onchange=event=>{
   stopVoice();
   state.mode=event.target.value;
   if(state.mode==='words')state.revealed=true;
   renderBoard();
  };
 }else{
  window.addEventListener('storage',event=>{
   if(event.key!==progressKey)return;
   const next=restore(read('progress:health-loteria',null));
   if(!next){status('El contenido cambió. Recarga este cartón.');return;}
   if(state.round!==next.round){marked.clear();claimed=false;status('');}
   state=next;
   renderBoard();
  });
 }
 renderBoard();
}

bindGameControls('health-loteria', actions);
if (isBoard) startBoard();
else {
 $('#board-number').replaceChildren(...Array.from({length:23},(_,index)=>new Option(String(index+1),String(index+1))));
 startCaller();
}
