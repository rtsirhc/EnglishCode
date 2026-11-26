import { read, write, savedGameIds, toggleSaved } from './shared/storage.js';
import { LEVELS, validatePack, examplePack, aiPrompt } from './shared/content.js';
import { ACTIONS, DEFAULT_KEYS, DEFAULT_BUTTONS, mapping, saveMapping, listenInput } from './shared/input.js';
import { worker, offlineRequest } from './shared/offline.js';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const node = (tag, className, text) => { const element = document.createElement(tag); if (className) element.className = className; if (text !== undefined) element.textContent = text; return element; };
let games = [], lang = read('language', 'en') === 'es' ? 'es' : 'en', selected = null, deferredInstall, toastTimer;
const filters = { query: '', levels: new Set(), skills: new Set(), theme: '', saved: false, offline: false, custom: false, sort: 'title' };
const words = {
  en: { games:'Explore games',saved:'My collection',guide:'How it works',install:'Install app',hero:'Less prep.<br>More <em>play.</em>',intro:'Free English games you can adapt to your lessons and download for offline play.',explore:'Find your next classroom favourite',free:'Always free',noaccount:'No account needed',made:'Made in Mexico',library:'The game library<span>.</span>',sort:'Sort by',az:'Name: A–Z',levelSort:'English level',durationSort:'Shortest first',filters:'Make it your lesson',reset:'Reset',level:'English level',levelHelp:'CEFR levels describe the English in the activity, not the students’ age.',theme:'Game category',allThemes:'All categories',skill:'Practise a skill',yourClass:'For your classroom',savedOnly:'My saved games',offlineOnly:'Offline ready',customOnly:'Use my own content',local:'Your collection stays on this device',empty:'No games match these filters.',emptyText:'Try a different search or clear your filters.',clear:'Clear filters',aboutEyebrow:'FROM OUR CLASSROOM TO YOURS',aboutTitle:'Better lessons are meant to be shared.',aboutText:'We’re two English teachers in Mexico who started making games for our own classes. This is our growing collection, open to every teacher with a class to inspire.',footer:'Free to play. Made for teaching.',offlineManager:'Offline & storage',search:'What are you teaching today?',view:'Take a look',save:'Save game',unsave:'Remove saved game',play:'Play game',preview:'Preview game',hidePreview:'Close preview',savedToast:'Saved to your collection',removedToast:'Removed from your collection',count:'games to explore',one:'game to explore',download:'Download offline',downloaded:'Downloaded',removeDownload:'Remove download',noDownloads:'No games downloaded yet. Look for the Offline ready label.',content:'Make it your own',fixed:'This activity uses its own authored story or teaching material.',instructions:'Classroom setup',setup:'Open on a classroom screen or your own device. Check the game’s start screen for its rules and team setup.',online:'Internet required',ready:'Offline ready',builtIn:'Built-in content',usePack:'Use this content',example:'Download example',copyPrompt:'Copy AI prompt',importFile:'Import JSON file',exportPack:'Export my pack',resetPack:'Use built-in content',packLabel:'Paste your content pack JSON',packHint:'Use any AI assistant to create a pack with the prompt below. Replace the topic and level in the prompt, then review its answers before using it in class.',savedPack:'Content pack saved on this device.',clipboard:'Prompt copied. Replace the topic and level before asking your AI assistant.',offlineSuccess:'Ready for offline play.',error:'Something went wrong. Please try again.',savedEmpty:'Your collection is empty. Save a game using its bookmark button.',timeLimit:'min limit',minutes:'min · estimated',details:'About this game',keyboard:'Keyboard & touch',share:'Copy game link',shareDone:'Game link copied' },
  es: { games:'Explorar juegos',saved:'Mi colección',guide:'Cómo funciona',install:'Instalar app',hero:'Menos preparar.<br>Más <em>jugar.</em>',intro:'Juegos de inglés gratuitos que puedes adaptar a tus clases y descargar para jugar sin conexión.',explore:'Encuentra el próximo favorito de tu clase',free:'Siempre gratis',noaccount:'Sin crear cuenta',made:'Hecho en México',library:'La biblioteca de juegos<span>.</span>',sort:'Ordenar',az:'Nombre: A–Z',levelSort:'Nivel de inglés',durationSort:'Menor duración',filters:'Hazlo para tu clase',reset:'Limpiar',level:'Nivel de inglés',levelHelp:'Los niveles MCER indican el inglés de la actividad, no la edad de los alumnos.',theme:'Categoría de juego',allThemes:'Todas las categorías',skill:'Practica una habilidad',yourClass:'Para tu salón',savedOnly:'Mis juegos guardados',offlineOnly:'Disponible sin conexión',customOnly:'Usar mi propio contenido',local:'Tu colección se queda en este dispositivo',empty:'Ningún juego coincide con estos filtros.',emptyText:'Prueba otra búsqueda o borra los filtros.',clear:'Borrar filtros',aboutEyebrow:'DE NUESTRO SALÓN AL TUYO',aboutTitle:'Las buenas clases se comparten.',aboutText:'Somos dos maestros de inglés en México que empezamos a crear juegos para nuestras clases. Esta colección sigue creciendo y está abierta para cualquier maestro con un grupo por inspirar.',footer:'Gratis para jugar. Hecho para enseñar.',offlineManager:'Descargas y almacenamiento',search:'¿Qué vas a enseñar hoy?',view:'Ver juego',save:'Guardar juego',unsave:'Quitar de mi colección',play:'Jugar',preview:'Previsualizar',hidePreview:'Cerrar vista previa',savedToast:'Guardado en tu colección',removedToast:'Eliminado de tu colección',count:'juegos para explorar',one:'juego para explorar',download:'Descargar para jugar sin conexión',downloaded:'Descargado',removeDownload:'Eliminar descarga',noDownloads:'Aún no hay juegos descargados. Busca la etiqueta Sin conexión.',content:'Hazlo tuyo',fixed:'Esta actividad tiene una historia o material didáctico propio.',instructions:'Prepara tu clase',setup:'Abre el juego en la pantalla del salón o en tu dispositivo. Revisa las reglas y la organización de equipos en su pantalla inicial.',online:'Requiere internet',ready:'Sin conexión',builtIn:'Contenido incluido',usePack:'Usar este contenido',example:'Descargar ejemplo',copyPrompt:'Copiar prompt para IA',importFile:'Importar archivo JSON',exportPack:'Exportar mi contenido',resetPack:'Usar contenido incluido',packLabel:'Pega el JSON de tu contenido',packHint:'Puedes pedir a cualquier asistente de IA que cree un paquete con este prompt. Cambia el tema y el nivel, y revisa las respuestas antes de usarlas en clase.',savedPack:'Contenido guardado en este dispositivo.',clipboard:'Prompt copiado. Cambia el tema y el nivel antes de pedir el contenido a tu IA.',offlineSuccess:'Listo para jugar sin conexión.',error:'Ocurrió un problema. Intenta de nuevo.',savedEmpty:'Tu colección está vacía. Guarda un juego con su botón de marcador.',timeLimit:'min de límite',minutes:'min · aproximados',details:'Acerca del juego',keyboard:'Teclado y pantalla táctil',share:'Copiar enlace del juego',shareDone:'Enlace del juego copiado' }
};
const t = key => words[lang][key] || key;
const skillES = {Grammar:'Gramática',Vocabulary:'Vocabulario',Speaking:'Conversación',Listening:'Comprensión oral',Reading:'Lectura',Writing:'Escritura',Spelling:'Deletreo',Pronunciation:'Pronunciación'};
function skillName(skill) { return lang === 'es' ? skillES[skill] || skill : skill; }
const themeLabels = {
  adventure: ['Adventure', 'Aventura'], auction: ['Auctions', 'Subastas'], classroom: ['Classroom', 'Salón de clases'],
  food: ['Food & dining', 'Comida y restaurantes'], health: ['Health', 'Salud'], mystery: ['Mystery', 'Misterio'],
  ocean: ['Ocean', 'Océano'], race: ['Racing & relays', 'Carreras y relevos'], science: ['Science', 'Ciencia'],
  show: ['Game shows', 'Concursos'], sound: ['Sounds', 'Sonidos'], space: ['Space', 'Espacio'],
  sport: ['Sports', 'Deportes'], time: ['Dates & time', 'Fechas y horas'],
  words: ['Words & language', 'Palabras e idioma'], world: ['World & culture', 'Mundo y cultura'],
};
const themeName = key => themeLabels[key]?.[lang === 'es' ? 1 : 0] || key;

function toast(message) { clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').hidden = false; toastTimer = setTimeout(() => $('#toast').hidden = true, 5000); }
function localize() {
  document.documentElement.lang = lang;
  $$('[data-i18n]').forEach(el => { const value = t(el.dataset.i18n); if (['hero','library'].includes(el.dataset.i18n)) el.innerHTML = value; else el.textContent = value; });
  $('#language').textContent = lang === 'en' ? 'ES' : 'EN';
  $('#search').placeholder = t('search'); $('#search').ariaLabel = t('search');
  renderFilters(); render();
}
function showDialog(id) { const dialog = $(id); if (!dialog.open) dialog.showModal(); }
$$('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
$$('dialog').forEach(dialog => { dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } }); });
$('#detail').addEventListener('close', () => { $$('#detail iframe').forEach(el => el.remove()); selected = null; const url = new URL(location); url.searchParams.delete('game'); history.replaceState({}, '', url); });
function renderFilters() {
  $('#levels').replaceChildren(...LEVELS.map(level => { const button = node('button','',level); button.type = 'button'; button.setAttribute('aria-pressed', String(filters.levels.has(level))); button.addEventListener('click', () => { filters.levels.has(level) ? filters.levels.delete(level) : filters.levels.add(level); renderFilters(); render(); }); return button; }));
  $('#skills').replaceChildren(...[...new Set(games.flatMap(g => g.skills))].sort().map(skill => { const label = node('label','check'); const input = node('input'); input.type = 'checkbox'; input.checked = filters.skills.has(skill); input.addEventListener('change', () => { input.checked ? filters.skills.add(skill) : filters.skills.delete(skill); render(); }); label.append(input,node('span','',skillName(skill))); return label; }));
  const option = (value, text) => { const item = node('option', '', text); item.value = value; return item; };
  const themes = [...new Set(games.map(game => game.theme))].sort((a,b) => themeName(a).localeCompare(themeName(b),lang));
  $('#theme').replaceChildren(option('', t('allThemes')), ...themes.map(theme => option(theme, themeName(theme))));
  $('#theme').value = filters.theme;

}
function matches(game, savedIds) {
  const query = filters.query.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const text = [game.title,game.description,...game.skills,...game.skills.map(skillName),...game.levels,game.theme,themeName(game.theme),...(game.tags || [])].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  return query.split(/\s+/).every(word => text.includes(word)) && (!filters.levels.size || game.levels.some(l => filters.levels.has(l))) && (!filters.skills.size || game.skills.some(s => filters.skills.has(s))) && (!filters.theme || game.theme === filters.theme) && (!filters.saved || savedIds.has(game.id)) && (!filters.offline || game.offline) && (!filters.custom || game.customizable);
}
function render() {
  const savedIds = savedGameIds();
  const visible = games.filter(game => matches(game, savedIds)).sort((a,b) => filters.sort === 'level' ? LEVELS.indexOf(a.levels[0])-LEVELS.indexOf(b.levels[0]) || a.title.localeCompare(b.title) : filters.sort === 'duration' ? (a.duration ?? Infinity)-(b.duration ?? Infinity) || a.title.localeCompare(b.title) : a.title.localeCompare(b.title));
  $('#result-count').textContent = `${visible.length} ${t(visible.length === 1 ? 'one' : 'count')}`;
  $('#game-grid').replaceChildren(...visible.map(game => card(game, savedIds))); $('#empty').hidden = visible.length !== 0;
  $('#active-filters').replaceChildren(...[...filters.levels,...[...filters.skills].map(skillName),...(filters.theme?[themeName(filters.theme)]:[])].map(label => node('span','filter-chip',label)));
  syncURL();
}
function syncURL() {
  const url = new URL(location);
  for (const [key,value] of Object.entries({q:filters.query,level:[...filters.levels].join(','),skill:[...filters.skills].join(','),theme:filters.theme,saved:filters.saved?'1':'',offline:filters.offline?'1':'',custom:filters.custom?'1':'',sort:filters.sort === 'title'?'':filters.sort})) value ? url.searchParams.set(key,value) : url.searchParams.delete(key);
  history.replaceState({}, '', url);
}
function durationLabel(game) {
  if (!game.duration) return '';
  return game.duration + ' ' + t(game.durationLimit ? 'timeLimit' : 'minutes');
}
function card(game, savedIds) {
  const article = node('article','game-card');
  const coverButton = node('button','cover-button'); coverButton.ariaLabel = `${t('view')}: ${game.title}`; coverButton.addEventListener('click', () => openDetail(game));
  const image = node('img','game-cover'); image.src = game.preview; image.alt = ''; image.width=500; image.height=300; image.loading='lazy'; image.decoding='async'; coverButton.append(image);
  const saved = savedIds.has(game.id); const save = node('button','save-button', saved?'▣':'▯'); save.ariaLabel = `${t(saved?'unsave':'save')}: ${game.title}`; save.setAttribute('aria-pressed',String(saved)); save.addEventListener('click', () => { try { const result = toggleSaved(game.id); render(); toast(t(result?'savedToast':'removedToast')); } catch(error) { toast(error.message); } });
  const body=node('div','card-body'), meta=node('div','card-meta');
  meta.append(node('span','level',game.levels.length > 3 ? `${game.levels[0]}–${game.levels.at(-1)}` : game.levels.join(' · ')),node('span','',skillName(game.skills[0])));
  const title = node('button','card-title',game.title); title.addEventListener('click',() => openDetail(game));
  const footer=node('div','card-footer');
  const details = [durationLabel(game), game.offline && t('ready')].filter(Boolean);
  footer.append(node('span','',details.join(' · ') || skillName(game.skills[1] || game.skills[0]))); const view=node('button','',t('view')); view.addEventListener('click',() => openDetail(game)); footer.append(view);
  body.append(meta,title,node('p','card-description',game.description),footer); article.append(coverButton,save,body); return article;
}
function reset() { Object.assign(filters,{query:'',levels:new Set(),skills:new Set(),theme:'',saved:false,offline:false,custom:false,sort:'title'}); $('#search').value=''; $('#sort').value='title'; for(const id of ['saved-only','offline-only','custom-only']) $('#'+id).checked=false; renderFilters();render(); }
$('#search').addEventListener('input',e => {filters.query=e.target.value.trim();render();});
$('#sort').addEventListener('change',e => {filters.sort=e.target.value;render();});
$('#theme').addEventListener('change',e => {filters.theme=e.target.value;render();});
for(const [id,key] of [['saved-only','saved'],['offline-only','offline'],['custom-only','custom']]) $('#'+id).addEventListener('change',e => {filters[key]=e.target.checked;render();});
for(const id of ['reset','empty-reset']) $('#'+id).addEventListener('click',reset);
$('#saved-nav').addEventListener('click',() => {reset(); filters.saved=true;$('#saved-only').checked=true;render();$('#library').scrollIntoView({behavior:'smooth'});});
$('#language').addEventListener('click',() => {lang=lang==='en'?'es':'en';write('language',lang);localize();});
for(const id of ['guide-nav','about-guide']) $('#'+id).addEventListener('click',() => showDialog('#guide-dialog'));
document.addEventListener('keydown',e => {if(e.key==='/' && !document.querySelector('dialog[open]') && !['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)){e.preventDefault();$('#search').focus();}});
async function copy(text) { if(navigator.clipboard?.writeText) await navigator.clipboard.writeText(text); else throw new Error('Clipboard is unavailable. Select and copy the text manually.'); }
function downloadJSON(value, name) { const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)+'\n'],{type:'application/json'}));const link=node('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000); }
function button(label,action,className='button secondary small') {const b=node('button',className,label);b.type='button';b.addEventListener('click',action);return b;}
async function openDetail(game) {
  selected=game;const root=$('#detail-content');root.replaceChildren();
  const image=node('img','detail-hero');image.src=game.preview;image.alt='';root.append(image);
  const content=node('div','detail-content');const heading=node('h2','',game.title);heading.id='detail-title';
  const pills=node('div','detail-pills');pills.append(...[...game.levels,...game.skills.map(skillName),themeName(game.theme)].map(text=>node('span','pill',text)));
  if (game.duration) pills.append(node('span','pill',durationLabel(game)));
  const actions=node('div','dialog-actions');const play=node('a','button',t('play'));play.href='/play.html?game='+encodeURIComponent(game.id);
  const preview=button(t('preview'),()=> { const existing=$('iframe',content);if(existing){existing.remove();preview.textContent=t('preview');return;}const frame=node('iframe');frame.src=game.entry+(game.entry.includes('?')?'&':'?')+'ecGame='+encodeURIComponent(game.id);frame.title=game.title;frame.allow='fullscreen; gamepad';frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-modals allow-popups');content.append(frame);preview.textContent=t('hidePreview'); });
  actions.append(play,preview);
  const share=button(t('share'),async()=>{try{const url=new URL('/',location);url.searchParams.set('game',game.id);await copy(url.href);toast(t('shareDone'));}catch(error){toast(error.message);}});
  content.append(heading,node('p','',game.description),pills,actions,share);
  const setup=node('details');setup.open=true;setup.append(node('summary','',t('instructions')),node('p','',game.instructions || t('setup')));
  const requirements=node('p','notice',game.requirements || t('keyboard'));setup.append(requirements);content.append(setup);
  const custom=node('details');custom.append(node('summary','',t('content')));
  if(game.customizable) createPackEditor(custom,game); else custom.append(node('p','',t('fixed')));
  content.append(custom);
  if(game.offline) {const offlineButton=button(t('download'),async()=>{offlineButton.disabled=true;try{await offlineRequest('DOWNLOAD',{id:game.id},percent=>offlineButton.textContent=`${percent}%`);offlineButton.textContent=t('downloaded');toast(t('offlineSuccess'));}catch(error){toast(error.message);offlineButton.textContent=t('download');}finally{offlineButton.disabled=false;} });content.append(offlineButton);}
  root.append(content);showDialog('#detail');const url=new URL(location);url.searchParams.set('game',game.id);history.replaceState({},'',url);
}
function createPackEditor(container,game) {
  container.append(node('p','',t('packHint')));
  const label=node('label','',t('packLabel'));label.htmlFor='pack-json';const textarea=node('textarea');textarea.id='pack-json';textarea.spellcheck=false;textarea.value=JSON.stringify(read('pack:'+game.id,null)||examplePack(game.contentModel),null,2);
  const status=node('p','pack-status');status.setAttribute('role','status');const setStatus=(text,error=false)=>{status.textContent=text;status.classList.toggle('error',error);};
  const tools=node('div','dialog-actions');tools.append(button(t('example'),()=>downloadJSON(examplePack(game.contentModel),`${game.id}-example.json`)),button(t('copyPrompt'),async()=>{try{await copy(aiPrompt(game.contentModel,game.maxQuizOptions));toast(t('clipboard'));}catch(error){setStatus(error.message,true);}}));
  const prompt=node('details');prompt.append(node('summary','','AI prompt'));const promptText=node('textarea');promptText.readOnly=true;promptText.ariaLabel='AI content prompt';promptText.value=aiPrompt(game.contentModel,game.maxQuizOptions);prompt.append(promptText);
  const file=node('input');file.type='file';file.accept='.json,application/json';file.hidden=true;file.addEventListener('change',async()=>{const selectedFile=file.files[0];if(!selectedFile)return;if(selectedFile.size>1024*1024){setStatus('Use a JSON file smaller than 1 MB.',true);return;}try{const pack=validatePack(await selectedFile.text(),game.contentModel,game.maxQuizOptions);textarea.value=JSON.stringify(pack,null,2);setStatus('Valid JSON. Choose “'+t('usePack')+'” to save it.');}catch(error){setStatus(error.message,true);}file.value='';});
  tools.append(button(t('importFile'),()=>file.click()));
  const actions=node('div','dialog-actions');actions.append(button(t('usePack'),()=>{try{const pack=validatePack(textarea.value,game.contentModel,game.maxQuizOptions);if(!write('pack:'+game.id,pack))throw new Error('Could not save this pack. Check browser storage.');setStatus(t('savedPack'));}catch(error){setStatus(error.message,true);}},'button'),button(t('exportPack'),()=>{try{downloadJSON(validatePack(textarea.value,game.contentModel,game.maxQuizOptions),`${game.id}-pack.json`);}catch(error){setStatus(error.message,true);}}),button(t('resetPack'),()=>{if(!write('pack:'+game.id,null)){setStatus(t('error'),true);return;}textarea.value=JSON.stringify(examplePack(game.contentModel),null,2);setStatus(t('builtIn'));}));
  container.append(tools,prompt,label,textarea,file,actions,status);
}
function renderMapping(value=mapping()) {
 const table=$('#mapping-table');const header=node('div','mapping-row mapping-header');header.append(node('span','','Action'),node('span','','Keyboard code'),node('span','','Gamepad'));table.replaceChildren(header);
 for(const action of ACTIONS){const row=node('div','mapping-row');row.append(node('label','',action));for(const type of ['keys','buttons']){const input=node('input');input.name=`${type}:${action}`;input.value=value[type][action];input.ariaLabel=`${action} ${type}`;if(type==='keys'){input.readOnly=true;input.addEventListener('keydown',e=>{if(e.code==='Tab')return;e.preventDefault();input.value=e.code;});}else{input.type='number';input.min=0;input.max=31;input.required=true;}row.append(input);}table.append(row);}
}
$('#settings').addEventListener('click',()=>{renderMapping();showDialog('#settings-dialog');});
$('#input-form').addEventListener('submit',e=>{e.preventDefault();const form=new FormData(e.target),value={keys:{},buttons:{}};for(const action of ACTIONS){value.keys[action]=form.get('keys:'+action);value.buttons[action]=Number(form.get('buttons:'+action));}try{saveMapping(value);$('#input-status').textContent='Controls saved on this device.';}catch(error){$('#input-status').textContent=error.message;}});
$('#input-reset').addEventListener('click',()=>{renderMapping({keys:DEFAULT_KEYS,buttons:DEFAULT_BUTTONS});$('#input-status').textContent='Defaults loaded. Save controls to apply.';});
const stopInput=listenInput((action,source)=>{if($('#settings-dialog').open)$('#input-output').textContent=`${action} · ${source.type}${source.button!==undefined?' · button '+source.button:''}`;});
window.addEventListener('pagehide',stopInput);
window.addEventListener('gamepadconnected',e=>$('#gamepad-status').textContent=e.gamepad.id);
window.addEventListener('gamepaddisconnected',()=>$('#gamepad-status').textContent='Gamepad disconnected.');
async function refreshDownloads() {
 const list=$('#downloads-list');list.textContent='Loading…';try{const ids=await offlineRequest('LIST');list.replaceChildren();if(!ids.length)list.append(node('p','',t('noDownloads')));for(const id of ids){const game=games.find(g=>g.id===id);const row=node('div','download-row');row.append(node('span','',game?.title||id),button(t('removeDownload'),async()=>{try{await offlineRequest('REMOVE',{id});await refreshDownloads();}catch(error){toast(error.message);}}));list.append(row);}if(navigator.storage?.estimate){const estimate=await navigator.storage.estimate();$('#storage-estimate').textContent=`${Math.round((estimate.usage||0)/1048576)} MB used of approximately ${Math.round((estimate.quota||0)/1048576)} MB available to this site.`;}}catch(error){list.textContent=error.message;}
}
$('#storage-button').addEventListener('click',()=>{showDialog('#storage-dialog');refreshDownloads();});$('#refresh-downloads').addEventListener('click',refreshDownloads);
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;$('#install').hidden=false;});
$('#install').addEventListener('click',async()=>{if(!deferredInstall)return;await deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;$('#install').hidden=true;});
window.addEventListener('appinstalled',()=>{$('#install').hidden=true;deferredInstall=null;});
try {
  const response=await fetch('/catalog/games.json');if(!response.ok)throw new Error('Could not load the game library.');games=(await response.json()).games;
  const url=new URL(location);filters.query=url.searchParams.get('q')||'';for(const l of (url.searchParams.get('level')||'').split(','))if(LEVELS.includes(l))filters.levels.add(l);for(const s of (url.searchParams.get('skill')||'').split(','))if(games.some(g=>g.skills.includes(s)))filters.skills.add(s);
  const theme=url.searchParams.get('theme');if(games.some(game=>game.theme===theme))filters.theme=theme;
  for(const key of ['saved','offline','custom'])filters[key]=url.searchParams.get(key)==='1';filters.sort=['title','level','duration'].includes(url.searchParams.get('sort'))?url.searchParams.get('sort'):'title';
  $('#search').value=filters.query;$('#sort').value=filters.sort;for(const [id,key]of[['saved-only','saved'],['offline-only','offline'],['custom-only','custom']])$('#'+id).checked=filters[key];
  const gameId=url.searchParams.get('game');localize();if(gameId){const game=games.find(g=>g.id===gameId);if(game)openDetail(game);}
  if(url.searchParams.get('settings')==='1'){renderMapping();showDialog('#settings-dialog');}
  worker().catch(()=>{/* Offline UI reports unsupported/registration errors when requested. */});
} catch(error) {$('#result-count').textContent='';$('#load-error').hidden=false;$('#load-error').textContent=`${error.message} Reload this page to try again.`;}
