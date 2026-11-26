import { gameRuntime } from '/gallery/shared/runtime.js';
import { createGame, rallyEngine } from './rally.mjs';
import { hostRoom, joinRoom } from './connection.mjs';

const $ = selector => document.querySelector(selector);
const app = $('#app');
const params = new URLSearchParams(location.search);
const isDisplay = params.get('view') === 'display';
const isPlayer = params.get('view') === 'team';
const teacher = !isDisplay && !isPlayer;
const colors = ['#58ebdc', '#ffb948', '#ee89da', '#a7bcff', '#9ced82'];
const sessionKey = 'englishcode:v1:clinic-rally:team';
let state = { game: null }, session, task, feedback, pending, room, engine;
let busy = false, connecting = false, loading = false, boardKey, audioContext, audioArmed = false;
let answerOrder = [], pairs = {}, selectedLeft, selectedRight;
const runtime = gameRuntime('clinic-rally', 'quiz', {
  ...Object.fromEntries(Array.from({ length: 8 }, (_, index) => ['answer' + (index + 1), () => {
    document.querySelectorAll('.answers [data-answer], [data-direction], [data-word], [data-left], [data-right]')[index]?.click();
  }])),
  confirm: () => ($('#check') || $('#timing-hit') || $('[data-admin="start"]'))?.click(),
  next: () => ($('#continue') || $('[data-admin="next"]'))?.click(),
});

if (isPlayer) {
  document.documentElement.classList.add('player-device');
  const resize = () => document.documentElement.style.setProperty('--play-height', Math.floor(window.visualViewport?.height || innerHeight) + 'px');
  resize();
  window.addEventListener('resize', resize);
  window.visualViewport?.addEventListener('resize', resize);
}
document.addEventListener('pointerdown', () => { audioArmed = true; }, { once: true });
document.addEventListener('keydown', () => { audioArmed = true; }, { once: true });

function storeTeam(value) {
  try { sessionStorage.setItem(sessionKey, JSON.stringify(value)); } catch { /* This tab can still play. */ }
}
function previousTeam() {
  try { return JSON.parse(sessionStorage.getItem(sessionKey)); } catch { return null; }
}
function roomUrl(view, game = state.game) {
  const url = new URL(location.pathname, location.origin);
  url.search = new URLSearchParams({ view, code: game.code, mode: game.connection });
  return url.href;
}
function updateState(next) {
  const old = state.game, game = next.game;
  if (game?.id === old?.id && game?.revision < old?.revision) return;
  state = next;
  if (teacher || isDisplay) {
    if (old?.phase === 'running' && game?.phase === 'finished') sound('start');
    board();
    return;
  }
  if (old?.id !== game?.id || old?.arena !== game?.arena) {
    task = feedback = pending = null;
    busy = false;
    skillKey = null;
    if (session?.game !== game?.id) session = null;
    player();
  } else if (old?.phase !== game?.phase && !busy) {
    player();
  }
  if (session && game?.phase === 'running' && (old?.phase !== game.phase || old?.arena !== game.arena)) getTask();
}
async function api(route, body) {
  try {
    if (route === 'admin') {
      if (body.action === 'create') {
        const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 900000 + 100000);
        await openHost(createGame(code, body.connection, body, runtime.pack));
        return state;
      }
      if (body.action === 'clear') {
        room?.close();
        room = engine = null;
        runtime.save(null);
        return { game: null };
      }
      try { return engine.admin(body.action); } finally { room.publish(); }
    }
    if (!room) throw new Error('Connect to the room first.');
    return await room.request(route, body);
  } catch (error) {
    if (error.status === 401 && body.token === session?.token) {
      session = null;
      task = feedback = pending = null;
      storeTeam(null);
    }
    throw error;
  }
}
async function openHost(game) {
  if (room || connecting) throw new Error('A room is already open or connecting.');
  connecting = true;
  try {
    const currentEngine = rallyEngine(game);
    room = await hostRoom(game, currentEngine, next => {
      runtime.save(game);
      updateState(next);
    });
    engine = currentEngine;
    room.publish();
  } finally { connecting = false; }
}
function connectPage(message = 'Abre el enlace que compartió tu docente.') {
  app.innerHTML = `<main class="join-page">${brand}<h1>${isDisplay ? 'Proyección' : 'Tu equipo. Tu aventura.'}</h1>
    <p>${esc(message)}</p><button class="primary wide" id="reconnect">Conectar</button>
    <p><a href="./index.html">Abrir como docente</a></p></main>`;
  $('#reconnect').onclick = connectGuest;
}
async function connectGuest() {
  const code = params.get('code'), mode = params.get('mode');
  if (connecting) return;
  if (!/^[0-9]{6}$/.test(code || '') || !['local', 'online'].includes(mode)) {
    connectPage();
    $('#reconnect').hidden = true;
    return;
  }
  connecting = true;
  connectPage('Buscando la partida…');
  $('#reconnect').disabled = true;
  try {
    room = await joinRoom(code, mode, updateState, () => {
      state = { game: null };
      room = session = task = feedback = pending = null;
      busy = false;
      stopAtmosphere();
      window.rallyStage3D?.dispose();
      connectPage('Se cerró la conexión con el docente.');
    });
    updateState(await room.request('state'));
    const previous = isPlayer ? previousTeam() : null;
    if (previous?.game === state.game.id) {
      try {
        session = await api('join', { code, team: previous.team, token: previous.token });
        storeTeam(session);
        await getTask();
      } catch (error) { notify(error.message); }
    }
    render();
  } catch (error) {
    room?.close();
    room = null;
    connectPage(error.message);
  } finally { connecting = false; }
}

async function admin(action) {
  try {
    state = await api('admin', { action });
    sound(action === 'start' ? 'start' : 'correct');
    render();
  } catch (error) { notify(error.message); }
}
function joinPage() {
  const game = state.game;
  if (!game) return connectPage();
  app.innerHTML = `<main class="join-page">${brand}<div class="join-hero"><h1>Tu equipo.<br>Tu aventura.</h1></div>
    <form id="join"><label>Tu equipo<select id="team">${game.teams.map(team => `<option value="${team.id}">${esc(team.name)}${team.online ? ' (ocupado)' : ''}</option>`).join('')}</select></label>
    <button class="primary wide">Entrar</button></form></main>`;
  $('#join').onsubmit = async event => {
    event.preventDefault();
    const button = $('#join button');
    button.disabled = true;
    try {
      session = await api('join', { code: game.code, team: Number($('#team').value) });
      storeTeam(session);
      sound('start');
      await getTask();
    } catch (error) { notify(error.message); }
    finally { button.disabled = false; }
  };
}
function render() { if (isPlayer) player(); else board(); }

const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function notify(s){$('#toast').textContent=s;clearTimeout(notify.timer);notify.timer=setTimeout(()=>$('#toast').textContent='',5000);}
function sound(kind){if(!audioArmed)return;try{audioContext ||=new(window.AudioContext||window.webkitAudioContext)();audioContext.resume().catch(()=>{});const now=audioContext.currentTime;const notes=kind==='correct'?[523,659,784]:kind==='wrong'?[230,190]:[392,523,659,784];notes.forEach((f,i)=>{const o=audioContext.createOscillator(),g=audioContext.createGain();o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(.0001,now+i*.10);g.gain.exponentialRampToValueAtTime(.1,now+i*.1+.01);g.gain.exponentialRampToValueAtTime(.0001,now+i*.1+.18);o.connect(g);g.connect(audioContext.destination);o.start(now+i*.1);o.stop(now+i*.1+.2);});}catch{}}
function picture(p){const cols=p.sheet===2?3:4,rows=p.sheet===2?2:4,src=['review','clinic','extra'][p.sheet];return `<div class="picture sheet-${p.sheet}" role="img" aria-label="${esc(p.label||'Vocabulary illustration')}" style="background-image:url('assets/${src}.webp');background-position:${p.tile%cols/(cols-1)*100}% ${Math.floor(p.tile/cols)/(rows-1)*100}%"></div>`;}
function time(){const g=state.game;if(!g)return'';const s=Math.max(0,Math.ceil((g.phase==='running'?g.deadline-Date.now():g.remaining)/1000));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;}

function renderTeam(){if(!session||session.game!==state.game?.id)return joinPage();const g=state.game,t=g.teams.find(t=>t.id===session.team);if(!t)return joinPage();let inner='';
 if(feedback)inner=`<section class="feedback ${feedback.correct?'':'wrong'}"><div class="kicker">${feedback.correct?'+1 PASO':'SIN AVANCE'}</div><h2>${feedback.correct?'¡Correcto!':'Mira la respuesta'}</h2><p>${esc(feedback.explanation)}</p><button class="primary wide" id="continue">Siguiente reto</button></section>`;
 else if(g.phase!=='running')inner=`<section class="status-page"><h2>${g.phase==='lobby'?'¡Equipo listo!':g.phase==='paused'?'Pausa':'¡Carrera terminada!'}</h2><p>${g.phase==='finished'?'Miren la pantalla.':'Esperen al docente.'}</p><div class="stats">${t.steps} / ${g.goal}</div></section>`;
 else if(!task)inner='<section class="status-page">Preparando el reto…</section>';
 else{
 inner=`<div class="kicker">${({choice:'ELIGE UNA RESPUESTA',picture:'TOCA LA IMAGEN',match:'UNE LAS PAREJAS',order:'ORDENA LA FRASE'})[task.type]}</div><h2 class="challenge">${esc(task.prompt)}</h2>${task.clue?`<p class="muted">${esc(task.clue)}</p>`:''}${task.picture?picture(task.picture):''}`;
 if(['choice','picture'].includes(task.type))inner+=`<div class="answers">${task.options.map(o=>`<button data-answer="${o.id}" ${busy?'disabled':''}>${o.picture?picture(o.picture):esc(o.text)}</button>`).join('')}</div>`;
 if(task.type==='order')inner+=`<div class="sentence word-tray" id="sentence">${answerOrder.map(id=>`<button data-remove="${id}">${esc(task.options.find(o=>o.id===id).text)}</button>`).join('')}</div><div class="word-tray">${task.options.filter(o=>!answerOrder.includes(o.id)).map(o=>`<button data-word="${o.id}">${esc(o.text)}</button>`).join('')}</div><button class="primary wide" id="check" ${busy||answerOrder.length!==task.options.length?'disabled':''}>Comprobar</button>`;
 if(task.type==='match')inner+=`<div class="match-grid"><div class="match-col">${task.left.map(o=>`<button class="${pairs[o.id]?'matched':''} ${selectedLeft===o.id?'selected':''}" data-left="${o.id}">${esc(o.text)}</button>`).join('')}</div><div class="match-col">${task.right.map(o=>`<button class="${Object.values(pairs).includes(o.id)?'matched':''} ${selectedRight===o.id?'selected':''}" data-right="${o.id}">${esc(o.text)}</button>`).join('')}</div></div><p class="muted tiny">${Object.keys(pairs).length} / ${task.left.length} parejas. Toca una pareja para cambiarla.</p><button class="primary wide" id="check" ${busy||Object.keys(pairs).length!==task.left.length?'disabled':''}>Comprobar</button>`;
 }
 app.innerHTML=`<main class="player"><header class="player-top"><div><h1 style="color:${colors[t.id]}">${esc(t.name)}</h1><span class="connection">Conectado</span></div><strong>${t.steps} / ${g.goal}</strong><span class="clock" style="font-size:24px">${time()}</span></header><div class="progress"><i style="width:${t.steps/g.goal*100}%"></i></div>${inner}</main>`;
 if($('#continue'))$('#continue').onclick=async()=>{feedback=null;task=null;await getTask();};
 document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>submit(b.dataset.answer));
 document.querySelectorAll('[data-word]').forEach(b=>b.onclick=()=>{answerOrder.push(b.dataset.word);player();});
 document.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{answerOrder=answerOrder.filter(x=>x!==b.dataset.remove);player();});
 function link(){if(selectedLeft&&selectedRight){for(const [a,b]of Object.entries(pairs))if(b===selectedRight)delete pairs[a];pairs[selectedLeft]=selectedRight;selectedLeft=selectedRight=null;}player();}
 document.querySelectorAll('[data-left]').forEach(b=>b.onclick=()=>{selectedLeft=b.dataset.left;delete pairs[selectedLeft];link();});
 document.querySelectorAll('[data-right]').forEach(b=>b.onclick=()=>{selectedRight=b.dataset.right;link();});
 if($('#check'))$('#check').onclick=()=>submit(task.type==='order'?answerOrder.join(','):Object.entries(pairs).map(([a,b])=>`${a}:${b}`).sort().join(','));
}

const modes=[
 {name:'Saddle Sprint',tag:'AL GALOPE',desc:'Llega primero a la meta.'},
 {name:'Turbo Tide',tag:'A TODA MÁQUINA',desc:'Cruza el océano a toda velocidad.'},
 {name:'Orbit Run',tag:'RUMBO A LAS ESTRELLAS',desc:'Impulsa tu nave hasta la meta.'},
 {name:'Timber Trouble',tag:'¡TRONCO FUERA!',desc:'Rompe las 12 piezas del tronco.'},
 {name:'Pop Party',tag:'¡QUE EXPLOTE!',desc:'Infla tu globo hasta hacerlo explotar.'}
];
const modeOf=g=>g.mode??g.arena,roundsOf=g=>g.rounds||3;
const brand='<div class="brand"><span>CLINIC</span> RALLY<b>✦</b></div>';
function modeTile(id){return `<div class="mode-art mode-art-${id}"><i></i></div><span class="mode-number">0${id+1}</span><strong>${modes[id].name}</strong><small>${modes[id].tag}</small>`;}
function hostSetup(){
 boardKey=null;stopAtmosphere();window.rallyStage3D?.dispose();
 app.innerHTML=`<main class="game-hub"><header class="hub-header">${brand}<span>ENGLISH PARTY GAMES</span></header><div class="hub-heading"><div><p class="eyebrow">PLAY TOGETHER</p><h1>Un salón.<br><em>Cinco aventuras.</em></h1></div><p>Elige los juegos.<br>Prepara a tu equipo.<br>¡Que comience el torneo!</p></div><form id="setup"><div class="mode-picker">${[0,3,1,4,2].map(id=>`<label class="mode-card"><input type="checkbox" name="mode" value="${id}" checked><div class="mode-card-face">${modeTile(id)}<b class="mode-check">✓</b></div></label>`).join('')}</div><div class="hub-bottom"><section class="configuration"><h2>Prepara la partida</h2><div class="config-grid"><label>Equipos<select id="count"><option>1</option><option>2</option><option>3</option><option selected>4</option><option>5</option></select></label><label>Minutos por juego<select id="minutes"><option>4</option><option selected>6</option><option>8</option><option>10</option></select></label><label>Dificultad<select id="level"><option value="support">A2 · imágenes y significado</option><option value="core" selected>A2–B1 · frases y parejas</option><option value="stretch">B1 · pistas en inglés</option></select></label><label>Vocabulario<select id="bank"><option value="mixed">Salud + inglés general</option><option value="health">Clínica y salud</option><option value="review">General English</option>${runtime.pack?`<option value="custom" selected>${esc(runtime.pack.title)}</option>`:''}</select></label><label>Pantallas<select id="connection"><option value="local">Mismo navegador · sin internet</option><option value="online">Dispositivos separados · internet</option></select></label></div><label class="toggle"><input id="dexterity" type="checkbox" checked><span>Retos de destreza<small>Desliza y apunta cada 3 retos de inglés</small></span></label></section><section class="team-setup"><h2>Elige tu escuadrón</h2><div class="names">${colors.map((c,i)=>`<label id="name-label-${i}" style="--team:${c}"><span>${i+1}</span><input aria-label="Nombre del equipo ${i+1}" id="name-${i}" maxlength="24" value="Team ${i+1}"></label>`).join('')}</div><button class="primary play-button">¡VAMOS A JUGAR! <span>▶</span></button></section></div></form><p class="muted">Abre una pestaña por equipo en modo local o comparte el enlace en modo internet.</p></main>`;
 const saved = runtime.load(null);
 if (saved?.deck?.length && saved.teams?.length) {
  $('.team-setup').insertAdjacentHTML('beforeend', '<button id="resume" type="button">Recuperar partida</button>');
  $('#resume').onclick = async event => {
   const button = event.currentTarget;
   button.disabled = true;
   if (saved.phase === 'running') {
    saved.remaining = Math.max(0, saved.deadline - Date.now());
    saved.phase = 'paused';
   }
   try { await openHost(saved); } catch(error) { notify(error.message); }
   finally { button.disabled = false; }
  };
 }
 const names=()=>colors.forEach((_,i)=>$('#name-label-'+i).hidden=i>=Number($('#count').value));$('#count').onchange=names;names();
 $('#setup').onsubmit=async e=>{e.preventDefault();const playlist=[...document.querySelectorAll('[name=mode]:checked')].map(x=>Number(x.value));if(!playlist.length)return notify('Elige al menos un juego.');const button=$('#setup button');button.disabled=true;try{state=await api('admin',{action:'create',connection:$('#connection').value,count:$('#count').value,level:$('#level').value,minutes:$('#minutes').value,bank:$('#bank').value,dexterity:$('#dexterity').checked,playlist,names:colors.map((_,i)=>$('#name-'+i).value)});sound('start');render();}catch(e){notify(e.message);}finally{button.disabled=false;}};
};
function station(t,g){const m=modeOf(g),p=t.steps/g.goal;return `<div class="party-station" data-team="${t.id}" data-steps="${t.steps}" style="--team:${colors[t.id]};--tint:hue-rotate(${t.id*55}deg);--growth:${.25+p*.75}"><header><strong>${esc(t.name)}</strong><span class="station-score">${t.steps}<small> / ${g.goal}</small></span></header><div class="station-stage"><div class="party-character"></div>${m===3?`<div class="timber-stack">${Array.from({length:g.goal},(_,i)=>`<i class="${i<t.steps?'broken':''}"></i>`).join('')}</div>`:`<div class="balloon ${p>=1?'popped':''}"><i></i></div>`}<div class="impact"><i>✦</i><i>✧</i><i>✦</i></div></div><div class="station-meter"><i style="width:${p*100}%"></i></div><p>${m===3?'ROMPE EL TRONCO':'INFLA EL GLOBO'}</p></div>`;}
function updateBoard(g){window.rallyStage3D?.update(g);g.teams.forEach(t=>{
 if(modeOf(g)<3){const lane=document.querySelectorAll('.lane')[t.id];if(!lane)return;lane.querySelector('.runner').style.left=`${t.steps/g.goal*91}%`;lane.querySelector('.team-label span').textContent=`${t.steps} / ${g.goal}`;}
 else{const el=$(`[data-team="${t.id}"]`);if(!el)return;const changed=t.steps>Number(el.dataset.steps);el.dataset.steps=t.steps;el.style.setProperty('--growth',.25+t.steps/g.goal*.75);el.querySelector('.station-score').innerHTML=`${t.steps}<small> / ${g.goal}</small>`;el.querySelector('.station-meter i').style.width=`${t.steps/g.goal*100}%`;el.querySelectorAll('.timber-stack i').forEach((log,i)=>log.classList.toggle('broken',i<t.steps));el.querySelector('.balloon')?.classList.toggle('popped',t.steps>=g.goal);if(changed){el.classList.remove('hit');void el.offsetWidth;el.classList.add('hit');}}
 });}
function board(){
 const g=state.game;if(!g){if(teacher)return hostSetup();stopAtmosphere();app.innerHTML=`<main class="join-page">${brand}<h1>La aventura está por comenzar.</h1><p>Esperando una partida.</p></main>`;return;}
 const m=modeOf(g),key=`${g.id}:${g.arena}:${g.phase}`,final=g.arena===roundsOf(g)-1;
 if(boardKey===key&&$('.board')){
  updateBoard(g);
  g.teams.forEach((team, index) => {
    const label = document.querySelectorAll('.ready-teams span')[index];
    if (!label) return;
    label.classList.toggle('ready', team.online);
    label.textContent = (team.online ? '● ' : '○ ') + team.name;
  });
  return;
 }
 boardKey=key;
 const rank=[...g.teams].sort((a,b)=>b.wins-a.wins||b.total-a.total),connect=roomUrl('team');let overlay='';
 if(g.phase==='lobby')overlay=`<div class="overlay lobby-overlay"><div class="lobby-title"><p class="eyebrow">JUEGO ${g.arena+1} / ${roundsOf(g)}</p><h2>${modes[m].name}</h2><p>${modes[m].desc}</p><span class="goal-pill">Cada acierto = 1 ${m===3?'golpe':m===4?'carga':'paso'}</span></div><div class="lobby-connect">${g.connection==='online'?'<div id="room-qr" aria-label="Código QR para entrar"></div>':''}<div><small>ÚNETE A LA PARTIDA</small><div class="code">${g.code}</div><p class="join-address"><a href="${esc(connect)}" target="_blank" rel="noopener">Abrir pantalla de equipo ↗</a></p><div class="ready-teams">${g.teams.map(t=>`<span style="--team:${colors[t.id]}" class="${t.online?'ready':''}">${t.online?'●':'○'} ${esc(t.name)}</span>`).join('')}</div></div></div></div>`;
 if(g.phase==='paused')overlay='<div class="overlay"><div class="message"><div class="pause-symbol">Ⅱ</div><h2>PAUSA</h2><p>Respira. La aventura continúa.</p></div></div>';
 if(g.phase==='finished'){const leaders=final?rank.filter(t=>t.total>0&&t.wins===rank[0].wins&&t.total===rank[0].total):g.teams.filter(t=>(g.winners||[g.winner]).includes(t.id));overlay=`<div class="overlay win-overlay"><div class="confetti-rain">${Array.from({length:24},(_,i)=>`<i style="--i:${i};--team:${colors[i%5]}"></i>`).join('')}</div><div class="message"><p class="eyebrow">${final?'CAMPEONES DEL TORNEO':'¡JUEGO COMPLETADO!'}</p><div class="trophy">★</div><h2>${esc(leaders.map(t=>t.name).join(' + ')||'¡Buen intento!')}</h2><p>${leaders.length>1?'¡Empate!':'¡Bien jugado!'}</p><div class="podium">${rank.map((t,i)=>`<div style="--team:${colors[t.id]}"><b>${i+1}</b><strong>${esc(t.name)}</strong><p>${t.wins} ★ · ${t.total} ✓</p></div>`).join('')}</div></div></div>`;}
 const bar=teacher?`${g.phase==='running'?'<button data-admin="pause">Ⅱ Pausar</button>':''}${['lobby','paused'].includes(g.phase)?`<button class="primary" data-admin="start">▶ ${g.phase==='paused'?'Continuar':'¡Comenzar!'}</button>`:''}${['running','paused'].includes(g.phase)?'<button data-admin="finish">Terminar juego</button>':''}${g.phase==='finished'&&!final?'<button class="primary" data-admin="next">Siguiente juego →</button>':''}<button id="display">Proyectar ↗</button><button id="full" aria-label="Pantalla completa">⛶</button><button id="newgame">Menú</button>`:'<button id="full" aria-label="Pantalla completa">⛶</button>';
 const arena=m<3?`<section class="race"><canvas class="atmosphere" aria-hidden="true"></canvas><div class="finish"></div>${g.teams.map(t=>`<div class="lane"><div class="team-label"><strong style="color:${colors[t.id]}">${esc(t.name)}</strong><span>${t.steps} / ${g.goal}</span></div><div class="runner" style="left:${t.steps/g.goal*91}%;--team:${colors[t.id]};--tint:hue-rotate(${t.id*55}deg)"><div class="sprite"></div></div></div>`).join('')}</section>`:`<section class="party-floor"><canvas class="atmosphere" aria-hidden="true"></canvas><div class="party-stations" style="--count:${g.teams.length}">${g.teams.map(t=>station(t,g)).join('')}</div></section>`;
 app.innerHTML=`<main class="board arena-${m} ${g.phase}"><header class="top"><div><small>CLINIC RALLY · JUEGO ${g.arena+1} / ${roundsOf(g)}</small><h1>${modes[m].name}</h1></div><div class="round-path">${(g.playlist||[0,1,2]).map((v,i)=>`<span class="${i===g.arena?'current':''}">${i<g.arena?'✓':i+1}</span>`).join('')}</div><div class="clock">${time()}</div></header>${arena}${overlay}<footer class="hostbar">${bar}</footer></main>`;
 if ($('#room-qr') && window.QRCode) new window.QRCode($('#room-qr'), { text: connect, width: 152, height: 152 });
 startAtmosphere(m);document.querySelectorAll('[data-admin]').forEach(el=>el.onclick=()=>admin(el.dataset.admin));if($('#display'))$('#display').onclick=()=>window.open(roomUrl('display'),'_blank','noopener');if($('#newgame'))$('#newgame').onclick=()=>{if(confirm('¿Volver al menú y reiniciar esta partida?'))admin('clear');};$('#full').onclick=async()=>{sound('start');try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{notify('Usa F11 para pantalla completa.');}};
};
const arrows={up:'↑',down:'↓',left:'←',right:'→'};
let skillFrame=0,skillKey=null,swipeProgress=0,skillLock=0;
function player(){
 cancelAnimationFrame(skillFrame);const q=task,g=state.game,isSkill=q&&['swipe','timing'].includes(q.type);
 if(q?.key!==skillKey){skillKey=q?.key;swipeProgress=0;skillLock=0;}
 // Shared rendering retains vocabulary, accessibility and feedback behavior.
 renderTeam();if(!$('.player'))return;
 if(g.phase!=='running'&&feedback){const saved=feedback;feedback=null;renderTeam();feedback=saved;}
 const team=g.teams.find(t=>t.id===session.team);$('.player').style.setProperty('--team',colors[team.id]);
 const top=$('.player-top');top.insertAdjacentHTML('afterbegin',`<div class="mobile-mode">${esc(modes[modeOf(g)].name)}</div>`);
 document.querySelectorAll('.answers button').forEach((b,i)=>b.insertAdjacentHTML('afterbegin',`<span class="answer-letter" aria-hidden="true">${'ABCDEF'[i]}</span>`));
 if(feedback&&$('.feedback')){const f=$('.feedback');f.insertAdjacentHTML('afterbegin',`<div class="result-symbol">${feedback.correct?'✓':'↻'}</div>`);if(feedback.skill)f.querySelector('.kicker').textContent='DESTREZA SUPERADA';else if(feedback.correct)f.querySelector('.kicker').textContent='+1 '+(modeOf(g)===3?'GOLPE':modeOf(g)===4?'CARGA':'PASO');}
 if(!isSkill||feedback||g.phase!=='running')return;
 const header=top.outerHTML+$('.progress').outerHTML;
 const content=q.type==='swipe'?`<h2>Sigue las flechas</h2><p>Desliza en este orden.</p><div class="swipe-sequence">${q.sequence.map((d,i)=>`<span class="${i<swipeProgress?'done':''} ${i===swipeProgress?'active':''}">${arrows[d]}</span>`).join('')}</div><div id="swipe-pad" tabindex="0" role="group" aria-label="Zona para deslizar"><span>${arrows[q.sequence[swipeProgress]]||'✓'}</span><small>DESLIZA AQUÍ</small></div><div class="direction-buttons">${['left','up','down','right'].map(d=>`<button data-direction="${d}" aria-label="${d}">${arrows[d]}</button>`).join('')}</div><p id="skill-note" aria-live="polite">También puedes tocar las flechas.</p>`:`<h2>¡En la zona!</h2><p>Detén la aguja dentro del verde.</p><div class="timing-track"><div class="timing-zone" style="left:${q.low*100}%;width:${(q.high-q.low)*100}%">✓</div><i id="timing-needle"></i></div><button id="timing-hit" class="primary play-button">¡AHORA!</button><p id="skill-note" aria-live="polite">Apunta bien. No necesitas tocar muchas veces.</p>`;
 $('.player').innerHTML=header+`<section class="skill-panel"><p class="eyebrow">${q.type==='swipe'?'REFLEX BREAK':'PERFECT TIMING'}</p>${content}</section>`;
 bindSkill(q);
};
function bindSkill(q){
 if(q.type==='swipe'){
  const paint=()=>{document.querySelectorAll('.swipe-sequence span').forEach((el,i)=>{el.classList.toggle('done',i<swipeProgress);el.classList.toggle('active',i===swipeProgress);});$('#swipe-pad span').textContent=arrows[q.sequence[swipeProgress]]||'✓';};
  const take=d=>{if(busy||Date.now()<skillLock||state.game?.phase!=='running')return;if(d!==q.sequence[swipeProgress]){swipeProgress=0;skillLock=Date.now()+650;paint();$('#skill-note').textContent='¡Cuidado! Empieza la secuencia de nuevo.';sound('wrong');return;}swipeProgress++;paint();if(swipeProgress===q.sequence.length)submit(q.sequence);};
  document.querySelectorAll('[data-direction]').forEach(b=>b.onclick=()=>take(b.dataset.direction));
  const pad=$('#swipe-pad');let start=null;
  const begin=p=>{start={x:p.clientX,y:p.clientY,id:p.identifier??p.pointerId};};
  const end=p=>{if(!start||(p.identifier??p.pointerId)!==start.id)return;const dx=p.clientX-start.x,dy=p.clientY-start.y;start=null;if(Math.max(Math.abs(dx),Math.abs(dy))<24)return;take(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));};
  // Touch events avoid older Safari pointer-capture/scroll cancellation quirks.
  pad.addEventListener('touchstart',e=>{if(e.touches.length!==1){start=null;return;}e.preventDefault();begin(e.touches[0]);},{passive:false});
  pad.addEventListener('touchmove',e=>{if(e.cancelable)e.preventDefault();},{passive:false});
  pad.addEventListener('touchend',e=>{if(e.cancelable)e.preventDefault();if(e.changedTouches[0])end(e.changedTouches[0]);},{passive:false});
  pad.addEventListener('touchcancel',()=>start=null);
  pad.onpointerdown=e=>{if(e.pointerType==='touch'||e.isPrimary===false)return;begin(e);try{pad.setPointerCapture(e.pointerId);}catch{}};
  pad.onpointercancel=e=>{if(e.pointerType!=='touch')start=null;};pad.onpointerup=e=>{if(e.pointerType!=='touch')end(e);};
  pad.onkeydown=e=>{const d={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'}[e.key];if(d){e.preventDefault();take(d);}};
 }else{const needle=$('#timing-needle'),start=performance.now();let position=0;const animate=now=>{position=(1-Math.cos((now-start)/q.period*Math.PI*2))/2;needle.style.left=`${position*100}%`;skillFrame=requestAnimationFrame(animate);};skillFrame=requestAnimationFrame(animate);$('#timing-hit').onclick=()=>{if(busy)return;cancelAnimationFrame(skillFrame);submit(position);};}
}
async function submit(answer){
 if(busy||!task)return;busy=true;cancelAnimationFrame(skillFrame);document.querySelectorAll('.player button').forEach(b=>b.disabled=true);
 const activeSession=session,activeTask=task;
 if(pending&&(pending.token!==session.token||pending.game!==session.game||pending.task!==task.key))pending=null;
 pending ||= {...session,task:task.key,answer,request:crypto.randomUUID()};
 try{const result=await api('answer',pending);if(session!==activeSession||task!==activeTask)return;pending=null;busy=false;sound(result.correct?'correct':'wrong');
  if(result.skill&&!result.correct){feedback=null;swipeProgress=0;await getTask(false);player();if($('#skill-note'))$('#skill-note').textContent='¡Casi! Vuelve a intentar. No pierdes puntos.';return;}
  feedback=result;task=null;answerOrder=[];pairs={};selectedLeft=selectedRight=null;await getTask(false);player();
 }catch(e){if(session&&session!==activeSession)return;busy=false;notify(e.message);if(e.status===409||e.status===401){pending=null;task=null;feedback=null;await getTask();player();}else player();}
};
let taskRequest=0;
async function getTask(redraw=true){if(!session||busy)return;if(loading&&!redraw)return;const request=++taskRequest,activeSession=session,oldTask=task;loading=true;try{const oldKey=task?.key,oldPhase=state.game?.phase;const d=await api('task',activeSession);if(request!==taskRequest||session!==activeSession||busy||task!==oldTask||d.game.revision<state.game?.revision)return;state={game:d.game};if(d.task&&task?.key!==d.task.key){pending=null;task=d.task;answerOrder=[];pairs={};selectedLeft=selectedRight=null;}else if(!d.task)task=null;if(redraw||oldKey!==task?.key||oldPhase!==d.game.phase)render();}catch(e){if(request!==taskRequest||session&&session!==activeSession)return;notify(e.message);if(!session)joinPage();}finally{if(request===taskRequest)loading=false;}};
let atmosphereFrame=0;
function stopAtmosphere(){cancelAnimationFrame(atmosphereFrame);}
let loadingStage;
function startAtmosphere(mode){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 if (!reduced && !loadingStage) {
  loadingStage = import('./assets/stage3d.mjs').then(stage => {
   window.rallyStage3D = stage;
   const container = $('.race') || $('.party-floor');
   if (container && state.game && stage.mount(container, state.game)) stopAtmosphere();
  }).catch(() => {});
 }
 if(!reduced&&window.rallyStage3D){cancelAnimationFrame(atmosphereFrame);const stage=$('.race')||$('.party-floor');if(stage&&window.rallyStage3D.mount(stage,state.game))return;}
 stopAtmosphere();const canvas=$('.atmosphere');if(!canvas)return;const ctx=canvas.getContext('2d');if(!ctx)return;let previous=0;
 const draw=now=>{
  if(!canvas.isConnected)return;if(document.hidden||now-previous<32){atmosphereFrame=requestAnimationFrame(draw);return;}previous=now;
  const w=canvas.clientWidth,h=canvas.clientHeight,dpr=Math.min(devicePixelRatio||1,1.5);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);const t=reduced?0:now/1000;
  if(mode===0){
   for(let i=0;i<65;i++){const x=(i+.5)*w/65,y=h*.18+Math.sin(i*2)*h*.04-Math.sin(t*3+i)*3;ctx.fillStyle=colors[i%5];ctx.fillRect(x,y,4,6);}
   for(let i=0;i<9;i++){const x=i*w/8;ctx.strokeStyle='#eee';ctx.beginPath();ctx.moveTo(x,h*.08);ctx.lineTo(x,h*.18);ctx.stroke();ctx.fillStyle=colors[i%5];ctx.beginPath();ctx.moveTo(x,h*.08);ctx.lineTo(x+22,h*.09+Math.sin(t*4+i)*4);ctx.lineTo(x,h*.12);ctx.fill();}
   ctx.fillStyle='#fff8';for(let i=0;i<5;i++){const x=(i*w/4+t*8)%(w+180)-90;ctx.beginPath();ctx.ellipse(x,h*.06+Math.sin(i)*15,55,12,0,0,Math.PI*2);ctx.fill();}
  }else if(mode===1){
   for(let j=0;j<18;j++){ctx.strokeStyle=j%3===0?'#c8fcff70':'#76ddff40';ctx.lineWidth=j%3===0?3:1.5;ctx.beginPath();for(let x=0;x<=w;x+=12){const y=h*(.28+j*.04)+Math.sin(x/65+t*2.2+j)*6;x?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();}
   for(let i=0;i<35;i++){const x=(i*97+t*27)%w,y=h*.35+(i*59)%(h*.6);ctx.fillStyle='#fff8';ctx.fillRect(x,y,3+Math.sin(t*2+i)*2,2);}
  }else if(mode===2){
   for(let i=0;i<80;i++){const x=((i*173-t*(10+i%4*8))%w+w)%w,y=(i*83)%h;ctx.globalAlpha=.35+.5*(1+Math.sin(t*2+i))/2;ctx.fillStyle=i%5?'white':'#8cfbff';ctx.beginPath();ctx.arc(x,y,i%3===0?2:1,0,7);ctx.fill();}ctx.globalAlpha=1;
   for(let i=0;i<3;i++){const x=w-((t*95+i*450)%(w+300)),y=(i+1)*h*.2;const grad=ctx.createLinearGradient(x,y,x+90,y-30);grad.addColorStop(0,'#b4efffcc');grad.addColorStop(1,'#b4efff00');ctx.strokeStyle=grad;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+90,y-30);ctx.stroke();}
  }else if(mode===3){for(let i=0;i<26;i++){const x=(i*113+Math.sin(t+i)*25)%w,y=(i*77+t*(12+i%3*4))%h;ctx.save();ctx.translate(x,y);ctx.rotate(t+i);ctx.fillStyle=['#ffc34a99','#8bdd5299','#d1ea6599'][i%3];ctx.beginPath();ctx.ellipse(0,0,8,3,0,0,7);ctx.fill();ctx.restore();}}
  else{for(let i=0;i<32;i++){const x=(i*127+Math.sin(t+i)*18)%w,y=h-(i*51+t*(12+i%4*6))%h;ctx.save();ctx.translate(x,y);ctx.rotate(t+i);ctx.fillStyle=colors[i%5]+'99';ctx.fillRect(-3,-5,6,10);ctx.restore();}}
  if(!reduced)atmosphereFrame=requestAnimationFrame(draw);
 };atmosphereFrame=requestAnimationFrame(draw);
}


if (teacher) render();
else connectGuest();
setInterval(() => {
  document.querySelectorAll('.clock').forEach(clock => { clock.textContent = time(); });
  if (isPlayer && session && !busy && state.game?.phase === 'running' && !task && !feedback) getTask(false);
}, 1000);
window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
window.addEventListener('pagehide', () => { room?.close(); });
