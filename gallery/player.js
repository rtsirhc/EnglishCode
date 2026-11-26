import { offlineRequest, worker } from './shared/offline.js';
const $=selector=>document.querySelector(selector);
const frame=$('#game-frame');let game;
try{
 const response=await fetch('/catalog/games.json');if(!response.ok)throw new Error('The game library could not be loaded.');
 const games=(await response.json()).games;const id=new URL(location).searchParams.get('game');game=games.find(item=>item.id===id);if(!game)throw new Error('This game is not in the library. Return to the library and choose a game.');
 document.title=game.title+' · EnglishCode';$('#game-title').textContent=game.title;$('#info-title').textContent=game.title;$('#game-description').textContent=game.description;$('#instructions').textContent=game.instructions||'Follow the game’s start screen to choose your teams and begin. Use keyboard or touch controls where available.';$('#requirements').textContent=game.requirements||'Check the game’s start screen for its device setup and connection requirements.';
 $('#customise').href='/?game='+encodeURIComponent(game.id);$('#library').href='/#library';
 frame.title=game.title;frame.src=game.entry+(game.entry.includes('?')?'&':'?')+'ecGame='+encodeURIComponent(game.id);frame.hidden=false;$('#player-status').hidden=true;
 $('#download').hidden=!game.offline;
 $('#download').addEventListener('click',async()=>{const button=$('#download');button.disabled=true;try{await offlineRequest('DOWNLOAD',{id:game.id},percent=>$('#download-status').textContent=`Downloading: ${percent}%`);$('#download-status').textContent='Download complete. This game is available offline on this device.';}catch(error){$('#download-status').textContent=error.message;}finally{button.disabled=false;}});
 worker().catch(()=>{});
}catch(error){$('#player-status').textContent=error.message;$('#game-title').textContent='Game unavailable';}
$('#info').addEventListener('click',()=>$('#game-info').showModal());$('#close-info').addEventListener('click',()=>$('#game-info').close());
$('#fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('#game-info').showModal();$('#download-status').textContent='Full screen is unavailable in this browser. Use your browser’s full-screen control.';}});
$('#touch-toggle').addEventListener('click',()=>{const controls=$('#touch-controls');controls.hidden=!controls.hidden;$('#touch-toggle').setAttribute('aria-expanded',String(!controls.hidden));});
window.addEventListener('message',event=>{
 if(event.origin!==location.origin||event.source!==frame.contentWindow||event.data?.type!=='englishcode-ready'||event.data.game!==game?.id)return;
 const labels={answer1:'1',answer2:'2',answer3:'3',answer4:'4',answer5:'5',answer6:'6',answer7:'7',answer8:'8',confirm:'Confirm',next:'Next',buzzer:'Buzz',hint:'Hint'};
 const actions=Array.isArray(event.data.actions)?event.data.actions.filter(action=>Object.hasOwn(labels,action)):[];
 $('#touch-toggle').hidden=!actions.length;$('#touch-controls').replaceChildren(...actions.map(action=>{const button=document.createElement('button');button.textContent=labels[action];button.addEventListener('click',()=>frame.contentWindow.postMessage({type:'englishcode-action',action},location.origin));return button;}));
});
