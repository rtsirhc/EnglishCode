import { ESCAPE_BANK } from './public-bank.js';
import { bindGameControls } from '/gallery/shared/runtime.js';

(() => {
 const KEY='englishcode:v1:progress:the-missing-key', LEGACY_KEY='faro.missing-key.v2', root=document.querySelector('#app');
 const query = new URLSearchParams(location.search);
 const isDisplay = query.get('view') === 'display';
 const isClues = query.get('view') === 'clues';
 const fresh=()=>({version:3,level:'1',count:4,minutes:30,status:'setup',remaining:1800000,deadline:null,solved:[],extraSolved:[],cooldowns:{},attempts:[],winner:null,screen:'setup',sound:true,project:false});
 let state=fresh(),storageOK=true,audioCtx=null,overlay=false,checking=false,bonusView=false;
 function restore(data){
  if(data?.version!==3||!ESCAPE_BANK.some(l=>l.id===data.level)||
    !Number.isInteger(data.count)||data.count<1||data.count>40||
    !['setup','ready','running','paused','ended'].includes(data.status)||
    !Number.isFinite(data.remaining)||data.remaining<0) return fresh();
  const validTeam=team=>Number.isInteger(team)&&team>=1&&team<=data.count;
  const validScore=item=>validTeam(item?.team)&&Number.isFinite(item.elapsed)&&item.elapsed>=0;
  const scores=items=>Array.isArray(items)?items.filter(validScore):[];
  const solved=scores(data.solved), extraSolved=scores(data.extraSolved);
  const cooldowns=Object.fromEntries(Object.entries(data.cooldowns||{}).filter(([team,deadline])=>validTeam(Number(team))&&Number.isFinite(deadline)));
  const saved={...fresh(),...data,solved,extraSolved,cooldowns,winner:solved[0]||null,
   minutes:Number.isFinite(data.minutes)&&data.minutes>0?data.minutes:30,
   attempts:Array.isArray(data.attempts)?data.attempts:[]};
  if(!['setup','ready','board'].includes(saved.screen))saved.screen='setup';
  if(saved.status==='running'&&!Number.isFinite(saved.deadline)) saved.status='paused';
  return saved;
 }
 try{state=restore(JSON.parse(localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY) ?? 'null'));}catch{storageOK=false;}
 const level=()=>ESCAPE_BANK.find(l=>l.id===state.level);
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function save(){if(isDisplay||isClues)return;try{localStorage.setItem(KEY,JSON.stringify(state));}catch{storageOK=false;}}
 function clueLink(id=state.level){return '?'+new URLSearchParams({view:'clues',case:id});}
 function openDisplay(){const url=location.href.split('?')[0].split('#')[0]+'?view=display';const display=window.open(url,'missing-key-display','popup,width=1280,height=720');if(display)display.focus();else announce('Permite las ventanas emergentes para abrir las pistas en la tele.');}
 function remaining(){return state.status==='running'?Math.max(0,state.deadline-Date.now()):state.remaining;}
 function time(ms){const sec=Math.ceil(Math.max(0,ms)/1000);return `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;}
 function announce(text){document.querySelector('#live').textContent=text;}
 function sound(win=false){if(!state.sound)return;try{audioCtx=audioCtx||new(window.AudioContext||window.webkitAudioContext)();audioCtx.resume().catch(()=>{});const now=audioCtx.currentTime; (win?[392,494,587,784]:[180,140]).forEach((f,i)=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(.0001,now+i*.14);g.gain.exponentialRampToValueAtTime(.12,now+i*.14+.025);g.gain.exponentialRampToValueAtTime(.0001,now+i*.14+.3);o.connect(g);g.connect(audioCtx.destination);o.start(now+i*.14);o.stop(now+i*.14+.32);});}catch{/* Sound must never block a submission. */}}
 const top=()=>`<div class="top"><div class="brand">THE MISSING KEY<span class="sr"> · Escape de vocabulario</span></div><span class="eyebrow">${esc(level().name)}</span></div>`;
 function render(){overlay=false;
  if(isDisplay){if(state.screen==='board')projectedBoard();else root.innerHTML=`<div class="display-waiting">${top()}<h1>${esc(level().name)}</h1><p>${state.level==='1'?'Esperando el inicio de la partida…':'Waiting for the game to begin…'}</p><button id="fullscreen">Pantalla completa</button></div>`;if(document.querySelector('#fullscreen'))document.querySelector('#fullscreen').onclick=fullscreen;return;}
  if(state.screen==='setup')setup();else if(state.screen==='ready')ready();else board();
  if(!storageOK)root.insertAdjacentHTML('afterbegin','<div class="warning" role="alert">Este navegador no permite guardar el progreso. No cierres ni recargues esta pestaña. Usa Chrome, Edge o Firefox con almacenamiento habilitado.</div>');
 }
 function setup(){root.innerHTML=`<div class="wrap">${top()}<div class="setup"><section><p class="eyebrow">The Missing Key</p><h1 class="cover-title">FIND THE KEY.<br><em>MAKE YOUR<br>ESCAPE.</em></h1></section><form id="settings" class="form"><h2>Nueva partida</h2><label class="field">Nivel y caso<select id="level">${ESCAPE_BANK.map(l=>`<option value="${l.id}" ${l.id===state.level?'selected':''}>${l.name}</option>`).join('')}</select></label><label class="field">Equipos<input id="teams" type="number" min="1" max="40" value="${state.count}" required></label><label class="field">Minutos<input id="minutes" type="number" min="5" max="60" value="${state.minutes}" required></label><label class="row help"><input id="sound" type="checkbox" ${state.sound?'checked':''}> Sonido</label><button class="primary" type="submit">Continuar →</button><div class="links"><a id="clue-link" href="${clueLink()}" target="_blank" rel="noopener">Leer o imprimir las pistas ↗</a></div></form></div></div>`;
 document.querySelector('#level').onchange=e=>{document.querySelector('#clue-link').href=clueLink(e.target.value);};
 document.querySelector('#sound').parentNode.insertAdjacentHTML('afterend',`<label class="row help"><input id="project" type="checkbox" ${state.project?'checked':''}> Proyectar pistas · sin imprimir</label>`);
 document.querySelector('#project').parentNode.insertAdjacentHTML('afterend','<button id="open-display" type="button">Abrir pistas en la tele ↗</button>');
 document.querySelector('#open-display').onclick=()=>{state.level=document.querySelector('#level').value;save();openDisplay();};
 document.querySelector('#settings').onsubmit=e=>{e.preventDefault();state={...fresh(),level:document.querySelector('#level').value,count:Number(document.querySelector('#teams').value),minutes:Number(document.querySelector('#minutes').value),sound:document.querySelector('#sound').checked,project:document.querySelector('#project').checked,status:'ready',screen:'ready'};state.remaining=state.minutes*60000;save();render();};
 }
 function ready(){root.innerHTML=`<div class="wrap">${top()}<section class="instructions"><p class="eyebrow">${esc(level().subtitle)}</p><h1>The Missing Key</h1><p class="intro">${esc(level().mission)}</p><ol>${level().instructions.map(x=>`<li>${esc(x)}</li>`).join('')}</ol><div class="example">${state.level==='1'?'Ejemplo de formato':'Format example'}: <strong>04-ABCDEFGH</strong><br><small>${state.level==='1'?'04 = equipo 4 · ABCDEFGH = ejemplo':'04 = Team 4 · ABCDEFGH = example'}</small></div><div class="row"><button class="primary" id="start">Comenzar · ${state.minutes} min</button><button id="back">Volver</button><a class="clue-link" href="${clueLink()}" target="_blank" rel="noopener">Leer o imprimir las pistas ↗</a><button id="fullscreen">Pantalla completa</button></div></section></div>`;
 document.querySelector('#back').insertAdjacentHTML('afterend','<button id="open-display">Abrir pistas en la tele ↗</button>');document.querySelector('#open-display').onclick=openDisplay;
 document.querySelector('#start').onclick=()=>{state.status='running';state.screen='board';state.deadline=Date.now()+state.remaining;save();if(state.project)openDisplay();sound(true);render();};document.querySelector('#back').onclick=()=>{state.screen='setup';save();render();};document.querySelector('#fullscreen').onclick=fullscreen;
 }
 function symbol(name){const shapes={SUN:'<circle cx="16" cy="16" r="7"/><path d="M16 1v4m0 22v4M1 16h4m22 0h4M5 5l3 3m16 16 3 3M5 27l3-3M24 8l3-3"/>',MOON:'<path d="M25 3C3-4-5 25 13 30c8 2 15-3 17-10C15 30 5 7 25 3Z" fill="currentColor" stroke="none"/>',STAR:'<path d="m16 2 4 9 10 1-8 7 3 11-9-6-9 6 3-11-8-7 10-1Z"/>',KEY:'<circle cx="10" cy="10" r="7"/><path d="m15 15 14 14m-7-7 4-4m0 8 4-4"/>',HEART:'<path d="M16 29C-7 13 5-5 16 8 27-5 39 13 16 29Z"/>',LEAF:'<path d="M3 29C-1 9 15 1 29 3c1 18-9 29-26 26Zm0 0L24 8"/>',CLOUD:'<path d="M7 27a6 6 0 0 1-1-12A9 9 0 0 1 23 11a8 8 0 0 1 1 16Z"/>',DIAMOND:'<path d="m16 2 14 14-14 14L2 16Z"/>'};return `<svg class="symbol" viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">${shapes[name]||''}</svg>`;}
 const docCard=d=>`<article class="evidence"><h3>${esc(d.title)}</h3><p>${esc(d.intro)}</p><ul>${d.rows.map(r=>`<li><span>${esc(r[0])} · ${esc(r[1])}</span><strong>${symbol(r[2])}${esc(r[2])}</strong></li>`).join('')}</ul></article>`;
 function schoolRoute(places){
  const route=['DIAMOND','KEY','MOON',null,'CLOUD','SUN','STAR','HEART','LEAF'];
  return `<ol class="school-route" aria-label="Walking route">${route.map(place=>`<li>${esc(place ? places[place] : 'Storage room (skip)')}</li>`).join('')}</ol>`;
 }
 function clueColumns(l=level()){const p=l.puzzle,one=l.id==='1';
 const riddles=`<section class="clue-column"><h2>${one?'01 / Acertijos':'01 / Riddles'}</h2><p class="section-note">${one?'Resuelve. Toma la letra indicada.':l.id==='2'?'Solve. Take the letter shown, counting from the left.':l.id==='3'?'Solve. Your PLACE gives the letter number.':'Solve. Keep the answers for the letter calculations.'}</p>${p.riddles.map(r=>`<article class="riddle"><h3>${symbol(r.symbol)}${esc(r.symbol)}<small>${r.length} ${one?'letras':'letters'}</small></h3><p>${esc(r.text)}</p>${r.letter?`<b>${one?'Letra':'Letter'} ${r.letter}</b>`:p.places?`<b>PLACE: ${esc(p.places[r.symbol])}</b>`:''}</article>`).join('')}</section>`;
 const finish=`<p class="section-note">${one?'Ordena los símbolos. Copia sus letras y añade tu equipo:':'Order the symbols. Copy their letters. Add your team:'} <b>04-ABCDEFGH</b></p>`;
 if(l.id==='4'){const c=p.case;return riddles+`<section class="clue-column"><h2>02 / The five orders</h2><p class="section-note">One different product, collection time and bill per customer. Use every option once. Subtract each voucher once.</p><p><b>Customers:</b> ${esc(c.people.join(' · '))}</p><p><b>Products:</b> ${esc(c.products.join(' · '))}</p><p><b>Times:</b> ${esc(c.times.join(' · '))}</p><h3>Receipts</h3>${c.receipts.map(r=>`<p><b>${esc(r.label)}.</b> ${esc(r.description)}</p>`).join('')}<h3>Witness statements</h3><ol>${c.clues.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></section><section class="clue-column"><h2>03 / Letter numbers</h2><p class="section-note">Reconstruct the five orders. Calculate each number. Take that letter from the matching riddle answer, counting from the left.</p>${p.extraction.map(r=>`<article class="riddle"><h3>${symbol(r[0])}${esc(r[0])}</h3><p>${esc(r[1])}</p></article>`).join('')}</section><section class="clue-column"><h2>04 / The last lock</h2><p class="section-note">Use each symbol once. Positions 1–8, left to right. Follow all four notes.</p>${p.finalNotes.map(n=>`<article class="evidence"><h3>${esc(n.title)}</h3><p>${esc(n.text).replace(/\n/g,'<br>')}</p></article>`).join('')}${finish}</section>`;}
 if(l.id==='3')return riddles+`<section class="clue-column"><h2>02 / School route</h2>${p.routeInstructions.map(s=>`<p>${esc(s)}</p>`).join('')}${schoolRoute(p.places)}<p class="section-note">Number the eight places in walking order. Each number tells you which letter to take from its riddle answer. This is NOT the final symbol order.</p>${finish}</section><section class="clue-column"><h2>03 / Final order</h2>${p.documents.map(docCard).join('')}</section>`;
 return riddles+`<section class="clue-column"><h2>${one?'02 / Documentos':'02 / Documents'}</h2>${p.documents.map(docCard).join('')}</section><section class="clue-column"><h2>${one?'03 / Orden final':'03 / Final order'}</h2>${p.ordering.map((s,i)=>`<article class="evidence"><h3>${String(i+1).padStart(2,'0')}</h3><p>${esc(s)}</p></article>`).join('')}${finish}</section>`;
 }
 function clueBook(){
  const chosen=ESCAPE_BANK.find(item=>item.id===query.get('case'))||ESCAPE_BANK[0];
  root.innerHTML=`<article class="clue-book"><header><p>THE MISSING KEY</p><h1>${esc(chosen.name)}</h1>
  <p>${esc(chosen.mission)}</p><button id="print">Imprimir pistas</button></header>
  <div class="clue-grid">${clueColumns(chosen)}</div>${chosen.id==='3'?'<footer><a href="?view=clues&case=4">Reto adicional · B2 ↗</a></footer>':''}</article>`;
  document.querySelector('#print').onclick=()=>window.print();
 }
 function fitProjection(){const el=document.querySelector('#projection-sheet');if(!el)return;el.style.transform=`scale(${Math.min(window.innerWidth/1920,window.innerHeight/1080)})`;for(const col of el.querySelectorAll('.clue-column')){if(col.hidden)continue;const content=col.firstElementChild;content.style.zoom=1;for(let i=0;i<20&&col.scrollHeight>col.clientHeight+1;i++)content.style.zoom=Number(content.style.zoom)*.97;}}
 function completed(){return state.solved.length===state.count&&(state.level!=='3'||state.extraSolved.length===state.count);}
 function statusText(){return state.status==='paused'?'En pausa':state.status==='ended'?(completed()?'Misterio resuelto':'Tiempo terminado'):state.winner?`Primer lugar: equipo ${state.winner.team}`:'';}
 function projectedBoard(){
 const chosen=bonusView&&state.level==='3'?ESCAPE_BANK.find(l=>l.id==='4'):level();
 root.innerHTML=`<div class="projection-viewport"><div id="projection-sheet" class="projection-sheet ${chosen.id==='4'?'extra':''}"><header class="projection-top"><span class="brand">THE MISSING KEY</span><span>${esc(chosen.name)}</span><span id="clock" class="projection-clock" role="timer">${time(remaining())}</span></header><div class="clue-grid">${clueColumns(chosen)}</div><footer class="projection-bottom"><p id="display-status" role="status">${statusText()}</p>${state.level==='3'?'<button id="bonus" class="quiet">'+(bonusView?'Volver al recorrido':'Ver reto adicional')+'</button>':''}<button id="zoom" class="quiet">Ampliar sección</button><button id="fullscreen" class="quiet">Pantalla completa</button></footer></div></div>`;
 const bonus=document.querySelector('#bonus');
 if(bonus)bonus.onclick=()=>{bonusView=!bonusView;projectedBoard();document.querySelector('#bonus').focus();};
 document.querySelectorAll('.clue-column').forEach(col=>{const content=document.createElement('div');content.className='clue-content';content.innerHTML=col.innerHTML;col.replaceChildren(content);});
 document.querySelector('#fullscreen').onclick=fullscreen;
 document.querySelector('#zoom').onclick=()=>{const grid=document.querySelector('.clue-grid'),next=(Number(grid.dataset.zoom||0)+1)%(grid.children.length+1);grid.dataset.zoom=next;grid.classList.toggle('zoomed',next>0);Array.from(grid.children).forEach((el,i)=>el.hidden=next>0&&i!==next-1);document.querySelector('#zoom').textContent=next?'Siguiente sección · '+next:'Ampliar sección';fitProjection();};fitProjection();
 }
 window.addEventListener('resize',fitProjection);
 function board(){root.innerHTML=`<div class="board"><div class="top"><span class="brand">THE MISSING KEY</span><div class="row"><span class="eyebrow">${esc(level().name)}</span><button class="quiet" id="view">Proyectar ↗</button><a class="clue-link" href="${clueLink()}" target="_blank" rel="noopener">Pistas ↗</a><button class="quiet" id="teacher">Docente · Esc</button></div></div><div class="stage"><section><p class="eyebrow" id="timerlabel">${state.status==='paused'?'En pausa':state.status==='ended'?(completed()?'Misterio resuelto':'Tiempo terminado'):'Time remaining'}</p><div id="clock" class="time" role="timer" aria-label="Tiempo restante">${time(remaining())}</div><div class="teams" aria-label="Equipos">${Array.from({length:state.count},(_,i)=>`<div class="team ${state.solved.some(s=>s.team===i+1)?'done':''}">${i+1}${state.extraSolved.some(s=>s.team===i+1)?' ★':state.solved.some(s=>s.team===i+1)?' ✓':''}</div>`).join('')}</div></section><section><p class="eyebrow">Unlock the box</p><h1>UNLOCK<br><em>THE DOOR.</em></h1><form id="codeform" class="codeform"><label for="code">${state.level==='1'?'Número de equipo + ocho letras':'Team number + eight letters'}</label><input id="code" class="codeinput" aria-label="Tu código secreto" type="password" inputmode="text" autocomplete="off" autocorrect="off" autocapitalize="characters" spellcheck="false" maxlength="20" placeholder="04-XXXXXXXX" aria-describedby="result" ${state.status!=='running'?'disabled':''}><button class="primary" type="submit" ${state.status!=='running'?'disabled':''}>Unlock / Abrir</button><p id="result" class="status" role="status">${state.status==='paused'?'Juego en pausa.':state.status==='ended'?(completed()?'Todos los equipos escaparon.':'Puedes añadir tiempo desde el control docente.'):' '}</p></form></section></div><div class="footer"><span id="winnerline" class="winnerline">${state.winner?`Primer lugar: equipo ${state.winner.team} · ${time(state.winner.elapsed)}`:' '}</span><span>${state.solved.length} / ${state.count} equipos</span></div></div>`;
 document.querySelector('#view').onclick=openDisplay;
 document.querySelector('#teacher').onclick=teacher;document.querySelector('#codeform').onsubmit=submit;
 }
 function result(text){document.querySelector('#result').textContent=text;announce(text);}
 async function submit(e){e.preventDefault();if(checking)return;if(state.status!=='running'||remaining()<=0){tick();return;}
 const input=document.querySelector('#code'),raw=input.value.toUpperCase().replace(/[\s-]/g,''),match=raw.match(/^(\d{1,2})([A-Z]{8})$/);
 if(!match){result('Formato: número de equipo y ocho letras. Ejemplo: 04-ABCDEFGH.');return;}
 const team=Number(match[1]);if(team<1||team>state.count){result(`Usa un equipo del 1 al ${state.count}.`);return;}
 const already=state.solved.some(s=>s.team===team);
 if(already&&state.level!=='3'){result(`El equipo ${team} ya resolvió el acertijo.`);return;}
 if((state.cooldowns[team]||0)>Date.now()){result(`Equipo ${team}: vuelve a revisar las pistas. Próximo intento en ${Math.ceil((state.cooldowns[team]-Date.now())/1000)} s.`);return;}
 checking=true;const expected=state;let correct,extraCorrect;
 try{const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(match[2])),hash=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');correct=hash===level().codeHash;extraCorrect=state.level==='3'&&hash===ESCAPE_BANK.find(l=>l.id==='4')?.codeHash;}catch{result('No se pudo comprobar el código. Intenta de nuevo en Chrome, Edge o Firefox.');return;}finally{checking=false;}
 if(state!==expected||state.status!=='running')return;if(remaining()<=0){tick();return;}
 if(correct&&already){result(`El equipo ${team} ya resolvió el acertijo.`);return;}
 if(extraCorrect&&!already){result('Resuelvan primero el caso del recorrido escolar.');return;}
 if(extraCorrect&&state.extraSolved.some(s=>s.team===team)){result(`El equipo ${team} ya resolvió Extra Hard.`);return;}
 if(!correct&&!extraCorrect){state.cooldowns[team]=Date.now()+60000;state.attempts.push({team,at:Date.now(),correct:false});save();sound();result(`Equipo ${team}: la caja sigue cerrada. Revisen letras y orden. Esperen 60 s antes del siguiente intento.`);input.value='';return;}
 const solved={team,elapsed:state.minutes*60000-remaining(),at:Date.now()};
 if(extraCorrect){state.extraSolved.push(solved);state.attempts.push({team,at:Date.now(),correct:true,level:'4'});save();sound(true);render();celebrate(solved,state.extraSolved.length===1,true);return;}
 state.solved.push(solved);if(!state.winner)state.winner=solved;state.attempts.push({team,at:Date.now(),correct:true});save();sound(true);render();celebrate(solved,state.solved.length===1);
 }
 function celebrate(s,first,isExtra=false){overlay=true;root.insertAdjacentHTML('beforeend',`<section class="victory" role="dialog" aria-modal="true" aria-labelledby="victoryTitle"><p class="eyebrow">${isExtra?'Extra Hard unlocked':first?'The first escape':'Another mystery solved'}</p><div class="door-reveal" aria-hidden="true"><div class="door-leaf"><i></i><span></span></div></div><h1 id="victoryTitle">¡El equipo ${s.team}<br>resolvió ${isExtra?'Extra Hard':'el acertijo'}!</h1><p>${first?'Primer lugar':'Código correcto'} · ${time(s.elapsed)}</p><button class="primary" id="continue">${state.level==='3'?'Continuar':state.solved.length===state.count?'Ver resultados':'Seguir con los demás'}</button></section>`);document.querySelector('#continue').focus();document.querySelector('#continue').onclick=()=>{overlay=false;document.querySelector('.victory').remove();if(completed()){state.remaining=remaining();state.status='ended';state.deadline=null;save();render();result('Todos los equipos escaparon. ¡Misterio resuelto!');}else render();};announce(`El equipo ${s.team} resolvió ${isExtra?'Extra Hard':'el acertijo'}.${first?' Primer lugar.':''}`);}
 function teacher(){if(document.querySelector('dialog'))return;const wasRunning=state.status==='running';let resumeOnClose=wasRunning||state.status==='paused';if(wasRunning){state.remaining=remaining();state.deadline=null;state.status='paused';save();}const d=document.createElement('dialog');d.innerHTML=`<h2>Control docente</h2><p>El reloj está detenido. Al cerrar este panel, la partida ${resumeOnClose?'continúa':'conserva su estado'}.</p><div class="pausebox"><strong>${state.solved.length} equipos han resuelto</strong><p>${state.solved.map(s=>`Equipo ${s.team} · ${time(s.elapsed)}`).join('<br>')||'Todavía no hay aciertos.'}</p>${state.extraSolved.length?`<p>Extra Hard: ${state.extraSolved.map(s=>'equipo '+s.team).join(', ')}</p>`:''}</div><div class="row"><button class="primary" id="resume">${resumeOnClose?'Continuar':'Cerrar'}</button><button id="add" ${completed()?'disabled':''}>Añadir 5 min</button><button id="fs">Pantalla completa</button></div><hr><p>Nueva partida borra solo esta partida, incluyendo ganador, intentos y reloj.</p><button id="new">Nueva partida</button><div id="confirm"></div>`;root.append(d);d.showModal();
 const close=()=>{d.close();d.remove();if(resumeOnClose&&state.status==='paused'){state.status='running';state.deadline=Date.now()+state.remaining;}save();render();};d.oncancel=e=>{e.preventDefault();close();};document.querySelector('#resume').onclick=close;document.querySelector('#fs').onclick=fullscreen;
 document.querySelector('#add').onclick=()=>{state.remaining+=300000;state.minutes+=5;if(state.status==='ended'){state.status='paused';}resumeOnClose=true;state.deadline=null;save();d.querySelector('p').textContent='Se añadieron 5 minutos. Cierra este panel para continuar.';document.querySelector('#resume').textContent='Reanudar juego';};
 document.querySelector('#new').onclick=()=>{document.querySelector('#confirm').innerHTML='<p><strong>¿Borrar esta partida y preparar otra?</strong></p><button id="yesreset">Sí, nueva partida</button>';document.querySelector('#yesreset').onclick=()=>{const old={level:state.level,count:state.count,minutes:30,sound:state.sound,project:state.project};state={...fresh(),...old};save();d.close();d.remove();render();};};
 }
 async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{announce('Usa F11 para pantalla completa.');}}
 function tick(){if(state.status!=='running')return;const ms=remaining(),clock=document.querySelector('#clock');if(clock){clock.textContent=time(ms);clock.classList.toggle('danger',ms<60000);}if(isDisplay){const status=document.querySelector('#display-status');if(ms===0&&status)status.textContent='Tiempo terminado';return;}if(ms===0){state.status='ended';state.remaining=0;state.deadline=null;save();if(!overlay&&!document.querySelector('dialog')){render();announce('Tiempo terminado.');}}}
 document.addEventListener('keydown',e=>{if(!isDisplay&&e.key==='Escape'&&state.screen==='board'&&!document.querySelector('dialog')){e.preventDefault();if(overlay){overlay=false;document.querySelector('.victory')?.remove();}teacher();}if(e.key.toLowerCase()==='f'&&!['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)){e.preventDefault();fullscreen();}});
 if(isDisplay)window.addEventListener('storage',event=>{
  if(event.key!==KEY)return;
  try{
   const next=restore(JSON.parse(event.newValue)),old=state;
   state=next;
   if(old.level!==next.level||old.screen!==next.screen){bonusView=false;render();}
   else{
    const status=document.querySelector('#display-status'),clock=document.querySelector('#clock');
    if(status)status.textContent=statusText();
    if(clock)clock.textContent=time(remaining());
   }
   tick();
  }catch{/* Ignore invalid state from another tab. */}
 });
 if(isClues){clueBook();return;}
 bindGameControls('the-missing-key',isDisplay ? {
  next:()=>document.querySelector('#zoom')?.click()
 } : {
  confirm:()=>{const form=document.querySelector('#codeform');if(form&&!document.querySelector('dialog')&&!overlay&&state.status==='running')form.requestSubmit();else if(state.screen==='setup')document.querySelector('#settings')?.requestSubmit();else if(state.screen==='ready')document.querySelector('#start')?.click();},
  next:()=>document.querySelector('#continue')?.click(),
  hint:()=>{if(overlay)return;document.querySelector('#view')?.click();},
 });
 setInterval(tick,250);tick();render();
})();
