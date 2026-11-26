import { lessons } from './numbers-bank.js';
import { gameRuntime } from '/gallery/shared/runtime.js';
import { localClipPlayer } from '/gallery/shared/lesson-audio.js';
const runtime=gameRuntime('numbers-dates-times','fixed',{
  next:()=>{if(!helpOpen)advance();},
  confirm:()=>{if(!helpOpen)(document.querySelector('#tool-audio')||document.querySelector('#timer-toggle')).click();},
  hint:()=>{if(!helpOpen)(document.querySelector('#tool-reveal')||document.querySelector('#reveal'))?.click();},
  buzzer:()=>{if(!helpOpen)toggleTimer();},
  answer1:()=>{if(!helpOpen)goTo(blockStart(1),true);},
  answer2:()=>{if(!helpOpen)goTo(blockStart(2),true);},
  answer3:()=>{if(!helpOpen)goTo(blockStart(3),true);},
});
const player=localClipPlayer();
const saved=runtime.load(null);
const explicit=Object.keys({'1':'A1','2':'A2','3':'B1'}).find(index=>['A1','A2','B1'][Number(index)-1]===new URLSearchParams(location.search).get('level'));

const grade = explicit || document.body.dataset.grade || (lessons[saved?.grade]?saved.grade:'1');
const gradeMeta = {
  '1': {label:'A1 · Start', accent:'#008ca2'},
  '2': {label:'A2 · Build', accent:'#5f8f00'},
  '3': {label:'B1 · Challenge', accent:'#d9235b'}
};

const slides = lessons[grade];
const duration=15*60;
const prior=saved?.grade===grade?saved:null;
let index=Number.isInteger(prior?.index)?Math.min(slides.length-1,Math.max(0,prior.index)):0;
let revealed=prior?.revealed===true;
const toolRounds=new Map(Array.isArray(prior?.toolRounds)?prior.toolRounds:[]);
let helpOpen=false;
let seconds=prior?.deadline?Math.max(0,Math.ceil((prior.deadline-Date.now())/1000)):Number.isInteger(prior?.seconds)?Math.max(0,Math.min(duration,prior.seconds)):duration;
let deadline=0;
let timerId;
const app = document.querySelector('#app');

function esc(value){return String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
function blockStart(block){return slides.findIndex(slide=>slide.block===block);}
function blockName(block){return block===1?'Aprende':block===2?'Juega':'Idea + sonidos';}
function optional(text='Cuaderno opcional'){return `<span class="optional">${esc(text)}</span>`;}
function cardHTML(item,i){return `<article class="card ${i===0?'pop':''}"><strong>${esc(item[0])}</strong><span>${esc(item[1])}</span></article>`;}
function soundHTML(group){return `<section class="sound-column"><h2>${esc(group.title)}</h2><p>${esc(group.tip)}</p><div class="word-list">${group.words.map(word=>`<button class="speak" data-speak="${esc(word)}">${esc(word)} 🔊</button>`).join('')}</div></section>`;}
function gameInstruction(kind){
  if(kind==='NUMBER PAIR')return 'PRONUNCIA LOS DOS NÚMEROS EN INGLÉS';
  if(kind==='NUMBER')return 'DI ESTE NÚMERO EN INGLÉS';
  if(kind==='TIME')return 'DI ESTA HORA EN INGLÉS';
  if(kind==='DATE')return 'DI ESTA FECHA EN INGLÉS';
  if(kind==='YEAR')return 'DI ESTE AÑO EN INGLÉS';
  if(kind==='IN · ON · AT')return 'COMPLETA CON IN, ON O AT';
  if(kind==='LISTEN')return 'ESCUCHA Y ELIGE UNA OPCIÓN';
  return kind;
}
function shuffledIndexes(size,avoidFirst=null){
  const deck=Array.from({length:size},(_,i)=>i);
  for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
  if(deck.length>1&&deck[deck.length-1]===avoidFirst){[deck[0],deck[deck.length-1]]=[deck[deck.length-1],deck[0]];}
  return deck;
}
function toolRoundState(){
  const items=slides[index].items||[];
  let state=toolRounds.get(index);
  if(!state||state.size!==items.length){
    const remaining=shuffledIndexes(items.length);
    state={size:items.length,current:remaining.pop(),remaining};
    toolRounds.set(index,state);
  }
  return state;
}
function currentToolIndex(){return toolRoundState().current;}
function toolControls(canReveal=true,canAudio=true){return `<div class="tool-controls">${canReveal?'<button class="tool-reveal" id="tool-reveal" aria-keyshortcuts="Space R">Ver respuesta</button>':''}${canAudio?'<button class="tool-audio" id="tool-audio" aria-keyshortcuts="A">🔊 Escuchar</button>':''}<button class="tool-new" id="tool-new" aria-keyshortcuts="N ArrowDown">Otro →</button></div>`;}
function helpHTML(){return `<div class="key-help" role="dialog" aria-modal="true" aria-label="Controles de teclado"><div class="key-help-card"><div class="key-help-head"><h2>Control con teclado</h2><button id="help-close" aria-label="Cerrar ayuda">×</button></div><div class="key-grid"><span><kbd>→</kbd> <kbd>Enter</kbd><b>Siguiente</b></span><span><kbd>←</kbd><b>Anterior</b></span><span><kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd><b>Ir a un bloque</b></span><span><kbd>Espacio</kbd> <kbd>R</kbd><b>Ver respuesta</b></span><span><kbd>N</kbd> <kbd>↓</kbd><b>Otro reto</b></span><span><kbd>A</kbd><b>Escuchar audio</b></span><span><kbd>T</kbd><b>Temporizador</b></span><span><kbd>F</kbd><b>Pantalla completa</b></span><span><kbd>Inicio</kbd> <kbd>Fin</kbd><b>Primera / última</b></span><span><kbd>H</kbd> <kbd>?</kbd><b>Mostrar esta ayuda</b></span></div></div></div>`;}

function slideHTML(slide){
  const head=`<div class="slide-head"><span class="step-number" style="--accent:${gradeMeta[grade].accent}">${slide.block}</span><div><p class="kicker">${esc(slide.kicker)}</p></div></div>`;
  if(slide.type==='intro')return `${head}<h1>${esc(slide.title)}</h1><p class="lead">${esc(slide.lead)}</p><div class="hero-grid" style="--columns:3">${slide.items.map((x,i)=>`<article class="card ${i===1?'pop':''}"><strong>${esc(x)}</strong><span>${['Mira y escucha','Di tu respuesta','Mira la solución'][i]}</span></article>`).join('')}</div>`;
  if(slide.type==='cards')return `${head}<h1>${esc(slide.title)}</h1><div class="cards" style="--columns:${slide.columns||3}">${slide.cards.map(cardHTML).join('')}</div>${optional()}`;
  if(slide.type==='dateGuide')return `${head}<h1>${esc(slide.title)}</h1>${slide.forms?`<p class="date-forms">${esc(slide.forms)}</p>`:''}<div class="date-rules">${slide.rules.map(rule=>`<article><strong>${esc(rule[0])}</strong><span>${esc(rule[1])}</span><b>${esc(rule[2])}</b></article>`).join('')}</div>${slide.examples?`<div class="date-examples">${slide.examples.map(example=>`<p>${esc(example)}</p>`).join('')}</div>`:''}${optional()}`;
  if(slide.type==='example')return `${head}<h1>${esc(slide.title)}</h1><div class="example">${slide.example}</div><p class="lead">${esc(slide.lead)}</p>${optional()}`;
  if(slide.type==='rule')return `${head}<h1>${esc(slide.title)}</h1><div class="rule"><b>①</b><span>${esc(slide.rule)}</span></div><div class="rule" style="margin-top:14px"><b>②</b><span>${esc(slide.rule2)}</span></div>${optional()}`;
  if(slide.type==='challenge')return `${head}<h1>${esc(slide.title)}</h1><div class="challenge"><div class="challenge-main"><span class="prompt-label">Tu reto</span><strong>${esc(slide.prompt)}</strong></div><div class="answer-panel" ${revealed?'':'hidden'}><b>Respuesta</b><strong>${esc(slide.answer)}</strong><span>${esc(slide.note||'')}</span></div></div>${optional()}`;
  if(slide.type==='generator'){
    const item=slide.items[currentToolIndex()];
    if(item[3])return `${head}<h1>Think. Explain. Respond.</h1><div class="game-tool advanced-tool"><span class="game-kind">${esc(item[0])} · SPEAK IN FULL SENTENCES</span><strong class="advanced-prompt">${esc(item[1])}</strong><p class="advanced-task">${esc(item[3])}</p><div class="game-answer" ${revealed?'':'hidden'}><span>ONE POSSIBLE ANSWER</span><b>${esc(item[2])}</b></div>${toolControls(true,false)}</div>`;
    const sentencePrompt=item[0]==='IN · ON · AT';
    return `${head}<h1>${esc(slide.title)}</h1><p class="lead">${esc(slide.lead)}</p><div class="game-tool"><span class="game-kind">${esc(gameInstruction(item[0]))}</span><strong class="game-prompt ${sentencePrompt?'game-sentence':''}">${esc(item[1])}</strong><div class="game-answer" ${revealed?'':'hidden'}><span>RESPUESTA</span><b>${esc(item[2])}</b></div>${toolControls(true,Boolean(slide.audio))}</div>`;
  }
  if(slide.type==='quote')return `${head}<h1>${esc(slide.title)}</h1><blockquote class="quote">${esc(slide.quote)}<span>${esc(slide.author)}</span></blockquote>`;
  if(slide.type==='sounds')return `${head}<h1>${esc(slide.title)}</h1><p class="lead">${esc(slide.lead)}</p><div class="sound-grid">${slide.groups.map(soundHTML).join('')}</div>`;
  if(slide.type==='sentenceGenerator'){
    const sentence=slide.items[currentToolIndex()];
    return `${head}<h1>${esc(slide.title)}</h1><p class="lead">${esc(slide.lead)}</p><div class="sentence-tool"><span>2–3 SONIDOS DIFÍCILES</span><strong>${esc(sentence)}</strong>${toolControls(false)}</div>`;
  }
  return `${head}<h1>${esc(slide.title)}</h1><p class="lead">${esc(slide.lead)}</p><div class="cards" style="--columns:${Math.min(4,slide.items.length)}">${slide.items.map((item,i)=>cardHTML([item,'Elige uno'],i)).join('')}</div>${optional(slide.note)}`;
}

function render(){
  const slide=slides[index];
  document.documentElement.style.setProperty('--accent',gradeMeta[grade].accent);
  app.innerHTML=`<div class="board-app"><header class="topbar"><span class="lesson-name">${gradeMeta[grade].label}</span><nav class="block-nav" aria-label="Bloques">${[1,2,3].map(b=>`<button class="block-button ${slide.block===b?'active':''} ${slide.block>b?'done':''}" data-block="${b}">${b}. <span>${blockName(b)}</span></button>`).join('')}</nav><nav class="grade-switch" aria-label="Nivel de inglés">${['1','2','3'].map(g=>`<a class="${g===grade?'active':''}" href="monday_numbers_dates_times.html?level=${['A1','A2','B1'][Number(g)-1]}">${['A1','A2','B1'][Number(g)-1]}</a>`).join('')}</nav><button class="icon-btn" id="shortcuts" aria-label="Ayuda de teclado" title="Teclas: H">?</button><button class="icon-btn" id="full" aria-label="Pantalla completa" title="Pantalla completa: F">⛶</button></header><main class="stage"><section class="slide">${slideHTML(slide)}</section></main><footer class="bottom"><button class="back" id="prev" aria-keyshortcuts="ArrowLeft" ${index===0?'disabled':''}>← Atrás</button><span class="counter">${index+1} / ${slides.length}</span><button class="back" id="timer-toggle" aria-keyshortcuts="T">${deadline?'Pausa':seconds===0?'Reiniciar':'▶'}</button><span class="timer" id="timer" role="timer">${formatTime(seconds)}</span><div class="spacer"></div>${slide.type==='challenge'?`<button class="reveal" id="reveal">${revealed?'Ocultar':'Ver respuesta'}</button>`:''}<button class="next" id="next" aria-keyshortcuts="ArrowRight Enter">${index===slides.length-1?'Inicio ↺':'Siguiente →'}</button></footer>${helpOpen?helpHTML():''}</div>`;
  document.querySelector('#prev').onclick=()=>move(-1);
  document.querySelector('#next').onclick=advance;
  document.querySelector('#full').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{}};
  document.querySelector('#shortcuts').onclick=()=>{helpOpen=true;render();};
  document.querySelector('#help-close')?.addEventListener('click',()=>{helpOpen=false;render();});
  document.querySelector('#timer-toggle').onclick=toggleTimer;
  document.querySelector('#reveal')?.addEventListener('click',()=>{revealed=!revealed;render();});
  document.querySelector('#tool-reveal')?.addEventListener('click',()=>{revealed=!revealed;render();});
  document.querySelector('#tool-new')?.addEventListener('click',newToolItem);
  document.querySelector('#tool-audio')?.addEventListener('click',event=>player.play(currentToolText(),event.currentTarget));
  document.querySelectorAll('[data-block]').forEach(button=>button.onclick=()=>goTo(blockStart(Number(button.dataset.block)),true));
  document.querySelectorAll('[data-speak]').forEach(button=>button.onclick=event=>player.play(button.dataset.speak,event.currentTarget));
  runtime.save({grade,index,revealed,seconds,deadline,toolRounds:[...toolRounds]});
}
function formatTime(value){const m=Math.floor(value/60).toString().padStart(2,'0');const s=(value%60).toString().padStart(2,'0');return `${m}:${s}`;}
function updateTimer(){
  if(!deadline)return;
  seconds=Math.max(0,Math.ceil((deadline-Date.now())/1000));
  document.querySelector('#timer').textContent=formatTime(seconds);
  if(seconds)return;
  haltTimer();
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.body.animate([{background:'#fff'},{background:'#ffd45c'},{background:'#fff'}],{duration:900,iterations:2});
  render();
}
function haltTimer(){deadline=0;clearInterval(timerId);timerId=null;}
function toggleTimer(){
  if(deadline){seconds=Math.max(0,Math.ceil((deadline-Date.now())/1000));haltTimer();}
  else{
    if(!seconds)seconds=duration;
    deadline=Date.now()+seconds*1000;
    timerId=setInterval(updateTimer,200);
  }
  render();
}
function goTo(next,resetTimer=false){
  index=Math.max(0,Math.min(slides.length-1,next));
  revealed=false;
  player.stop();
  if(resetTimer){haltTimer();seconds=duration;}
  render();
}
function move(delta){
 const target=Math.max(0,Math.min(slides.length-1,index+delta));
 goTo(target,slides[target].block!==slides[index].block);
}
function advance(){if(index===slides.length-1)goTo(0,true);else move(1);}
function currentToolText(){const slide=slides[index];if(slide.type==='generator')return slide.items[currentToolIndex()][2];if(slide.type==='sentenceGenerator')return slide.items[currentToolIndex()];return '';}
function newToolItem(){
  const items=slides[index].items||[];
  if(items.length<2)return;
  player.stop();
  const state=toolRoundState();
  if(!state.remaining.length)state.remaining=shuffledIndexes(items.length,state.current);
  state.current=state.remaining.pop();
  revealed=false;
  render();
}
document.addEventListener('keydown',event=>{
  if(event.defaultPrevented||event.repeat||event.altKey||event.ctrlKey||event.metaKey||event.target.matches('input,select,textarea'))return;
  const key=event.key;
  const lower=key.toLowerCase();
  const focusedControl=event.target.closest?.('button,a');
  if(helpOpen){if(key==='Escape'||lower==='h'||key==='?'){event.preventDefault();helpOpen=false;render();}return;}
  if((key==='Enter'||key===' ')&&focusedControl)return;
  if(key==='PageDown'){event.preventDefault();advance();return;}
  if(key==='ArrowLeft'||key==='PageUp'||key==='Backspace'){event.preventDefault();move(-1);return;}
  if(key==='Home'){event.preventDefault();goTo(0);return;}
  if(key==='End'){event.preventDefault();goTo(slides.length-1);return;}
  
  if((key===' '||lower==='r')&&['challenge','generator'].includes(slides[index].type)){event.preventDefault();revealed=!revealed;render();return;}
  if((lower==='n'||key==='ArrowDown')&&['generator','sentenceGenerator'].includes(slides[index].type)){event.preventDefault();newToolItem();return;}
  if(lower==='a'&&document.querySelector('#tool-audio')){event.preventDefault();document.querySelector('#tool-audio').click();return;}
  if(lower==='t'){event.preventDefault();toggleTimer();return;}
  if(lower==='f'){event.preventDefault();document.querySelector('#full').click();return;}
  if(lower==='h'||key==='?'){event.preventDefault();helpOpen=true;render();}
});
render();
