import { farito } from './farito.js';
import { gameRuntime } from '/gallery/shared/runtime.js';
import { validatePack } from '/gallery/shared/content.js';
import { read,write } from '/gallery/shared/storage.js';
import { createMission, currentPrompt, glossary, hint, levels, progress, restoreState, submit, support } from './mission.js';
import { activities, defaultScene, drawPortrait, outfits, relations, settings, validScene } from './portrait.js';
import { learnerRoom, teacherRoom } from './rooms.js';

const $=selector=>document.querySelector(selector);
const app=$('#app');
const params=new URLSearchParams(location.search);
const role=params.get('view');
const roomCode=params.get('code');
const roomMode=params.get('mode');
const html=text=>String(text??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const codePattern=/^\d{6}$/;
const roomKey=(code,id)=>'farito:mission:'+code+':'+id;
const phases={review:'Review',chat:'Conversation',portrait:'Portrait',done:'Complete'};
const actions=role==='teacher'?{}:{
  confirm:()=>{if(!$('#word-dialog').open)$('#message-form')?.requestSubmit();},
  hint:()=>showHint(),
  next:()=>$('#portrait-finish')?.click(),
  ...Object.fromEntries(Array.from({length:3},(_,index)=>['answer'+(index+1),()=>document.querySelectorAll('[data-response]')[index]?.click()])),
};
const runtime=gameRuntime('farito','words',actions);
const localPack=runtime.pack;
let state, connection, activeMission, classLabel, learnerId, teaching, pending=false, roomLive=false, helpRequested=false;
let lastSettings={level:'A2',mode:'local',custom:Boolean(localPack)};

function notice(message=''){$('#notice').textContent=message;}
function options(values,selected){
  return values.map(value=>`<option ${value===selected?'selected':''}>${html(value)}</option>`).join('');
}
function missionOptions(){
  return `<label>English level <select id="level">${options(levels,lastSettings.level)}</select></label>`+
    (localPack?`<label>Review deck <select id="review-deck"><option value="built-in">Family vocabulary</option><option value="custom" ${lastSettings.custom?'selected':''}>${html(localPack.title)}</option></select></label>`:'');
}
function selectedMission(){
  lastSettings.level=$('#level').value;
  lastSettings.custom=$('#review-deck')?.value==='custom';
  return {level:lastSettings.level,pack:lastSettings.custom?localPack:null};
}

function home(){
  notice();
  const saved=restoreState(runtime.load(null));
  app.innerHTML=`<section class="landing"><div class="intro">${farito('large')}<h1>Conversation Missions</h1><p>Review family vocabulary, tell Farito a story and create an illustrated portrait.</p></div>
    <form id="mission-form" class="panel"><h2>My family, our story</h2>${missionOptions()}
      <button type="submit" class="primary">Start mission</button>
      ${saved?'<button id="resume" type="button">Resume saved mission</button>':''}
      <a href="?view=teacher">Open a classroom room ↗</a><a href="?view=join">Join a classroom room</a>
    </form></section>`;
  $('#mission-form').onsubmit=event=>{event.preventDefault();start(selectedMission());};
  if(saved)$('#resume').onclick=()=>{
    state=saved;
    activeMission=missionFromState(saved);
    renderMission();
  };
}

function missionFromState(saved){
  const pack=saved.customReview?{
    title:saved.reviewTitle,items:saved.reviewItems.map(item=>({word:item.word,clue:item.prompt,translation:item.explanation})),
  }:null;
  return {level:saved.level,pack};
}

function persist(){
  if(!state)return;
  const saved=role==='join'?write(roomKey(roomCode,learnerId),state):runtime.save(state);
  if(!saved)notice('Progress will stay in this tab. Browser storage is unavailable.');
  if(connection)connection.send({type:'progress',phase:state.phase,progress:progress(state)});
}

function start(mission){
  activeMission=mission;
  state=createMission(mission.level,mission.pack);
  helpRequested=false;
  persist();
  renderMission();
}

function renderMission(){
  if(!state)return;
  const step=progress(state);
  const active=['review','chat'].includes(state.phase);
  const available=active?support(state):{choices:[],text:''};
  const promptNumber=state.phase==='review'?`${state.index+1} / ${state.reviewItems.length}`:state.phase==='chat'?`${state.chats.length+1} / 6`:'';
  app.innerHTML=`<div class="workspace">
    <aside class="panel mission-rail">${farito('large')}<h2>My family, our story</h2>
    <p>${html(state.level)}${classLabel?' · '+html(classLabel):''}</p>
    <label for="progress">Mission progress · ${step}%</label><progress id="progress" max="100" value="${step}"></progress>
    <ol>${Object.entries(phases).map(([phase,label])=>`<li class="${state.phase===phase?'current':''}">${label}</li>`).join('')}</ol></aside>
    <section class="panel chat" aria-label="Conversation mission">
      <div class="chat-head">${farito('small')}<div><h1>${state.phase==='done'?'Mission complete':phases[state.phase]}</h1><p>${state.phase==='review'?html(state.reviewTitle):html(promptNumber)}</p></div></div>
      ${active?`<div class="objective">${html(currentPrompt(state))}</div><p class="phase-count">${html(promptNumber)}</p>
      <div id="messages" class="messages" role="log" aria-label="Conversation">${state.messages.map(message=>`<div class="message ${message.role==='learner'?'from-learner':'from-guide'}">${html(message.text)}</div>`).join('')}</div>
      <div class="scaffold">${available.text?`<p id="scaffold" role="status">${html(available.text)}</p>`:''}
        ${available.choices.map(choice=>`<button type="button" data-response="${html(choice)}">${html(choice)}</button>`).join('')}</div>
      <div class="tools">
        <button id="hint" ${state.hint===2?'disabled':''}>Hint</button><button id="word">Find a word</button>
        ${role==='join'?'<button id="teacher-help">Ask the teacher</button>':''}
      </div>
      <form id="message-form" class="compose">
        <label for="draft" class="sr">Your reply</label><textarea id="draft" rows="2" maxlength="360" placeholder="${state.phase==='review'?'Type the family word':'Say your answer aloud, then write it'}" required></textarea>
        <button class="primary" type="submit">Send</button>
      </form>`:'<div id="studio"></div>'}
    </section></div>`;
  if(role==='join'&&$('#teacher-help')){
    $('#teacher-help').disabled=!roomLive||helpRequested;
    $('#teacher-help').textContent=helpRequested?'Help requested':'Ask the teacher';
    $('#teacher-help').onclick=()=>{
      if(!connection||!roomLive)return;
      helpRequested=true;
      connection.send({type:'help'});
      $('#teacher-help').disabled=true;
      $('#teacher-help').textContent='Help requested';
      notice('Your teacher can see your help request.');
    };
  }
  if(!active){renderStudio();return;}
  const stream=$('#messages');
  stream.scrollTop=stream.scrollHeight;
  $('#message-form').onsubmit=event=>{event.preventDefault();reply($('#draft').value);};
  $('#draft').onkeydown=event=>{
    if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();$('#message-form').requestSubmit();}
  };
  $('#hint').onclick=showHint;
  $('#word').onclick=()=>{
    $('#lookup').value='';
    $('#translation').textContent='Type a word to check the local glossary.';
    $('#word-dialog').showModal();
  };
  document.querySelectorAll('[data-response]').forEach(button=>button.onclick=()=>reply(button.dataset.response));
}

function showHint(){
  if(!state||$('#word-dialog').open||!hint(state))return;
  const draft=$('#draft')?.value;
  persist();
  renderMission();
  if(draft&&$('#draft'))$('#draft').value=draft;
}

function reply(text){
  if(!state||$('#word-dialog').open)return;
  const result=submit(state,text);
  if(result.error){notice(result.error);return;}
  notice();
  persist();
  renderMission();
  $('#draft')?.focus({preventScroll:true});
}

function renderStudio(){
  const studio=$('#studio');
  if(!validScene(state.scene))state.scene=defaultScene();
  const scene=state.scene;
  if(state.phase==='done'){
    studio.innerHTML=`<p>Vocabulary correct on the first try: <strong>${state.independent} / ${state.reviewItems.length}</strong>.</p>
      <p>You wrote ${state.chats.length} replies and illustrated your story.</p><canvas width="720" height="460" aria-label="Illustration of your fictional family"></canvas>
      <div class="tools"><button class="primary" id="download">Download portrait</button><button id="replay">Start again</button></div>`;
    const canvas=studio.querySelector('canvas');
    drawPortrait(canvas,scene);
    $('#download').onclick=()=>canvas.toBlob(blob=>{
      if(!blob)return;
      const link=document.createElement('a');
      const url=URL.createObjectURL(blob);
      link.href=url;link.download='farito-family-portrait.png';link.click();
      setTimeout(()=>URL.revokeObjectURL(url),1000);
    });
    $('#replay').onclick=()=>start(activeMission||{level:state.level,pack:null});
    return;
  }
  studio.innerHTML=`<h2>Imagine the picture.</h2><p>Choose a cast and a scene, then describe it aloud in English.</p>
    <form id="portrait-form">
      <div class="portrait-settings">
        <label>Place <select id="place">${options(settings,scene.setting)}</select></label>
        <label>Activity <select id="activity">${options(activities,scene.activity)}</select></label>
        <label>Pet <select id="pet">${options(['None','Cat','Dog'],scene.pet)}</select></label>
      </div>
      <div id="cast">${scene.people.map((person,index)=>`<fieldset><legend>Person ${index+1}</legend><label>Role <select data-role>${options(relations,person.relation)}</select></label>
        <label>Outfit <select data-outfit>${options(outfits,person.outfit)}</select></label></fieldset>`).join('')}</div>
      <div class="tools"><button type="button" id="add-person" ${scene.people.length===4?'disabled':''}>Add person</button>
      <button type="button" id="remove-person" ${scene.people.length===1?'disabled':''}>Remove last person</button></div>
      <p id="portrait-description"></p><canvas width="720" height="460" aria-label="Preview of the fictional family portrait"></canvas>
      <button class="primary" id="portrait-finish" type="submit">Create portrait</button>
    </form>`;
  const canvas=studio.querySelector('canvas');
  function redraw(){
    drawPortrait(canvas,scene);
    $('#portrait-description').textContent=`At the ${scene.setting.toLowerCase()}: ${scene.activity.toLowerCase()}. ${scene.people.map(({relation,outfit})=>`${relation} wears ${outfit.toLowerCase()}.`).join(' ')}`;
  }
  function saveScene(){persist();redraw();}
  $('#place').onchange=event=>{scene.setting=event.target.value;saveScene();};
  $('#activity').onchange=event=>{scene.activity=event.target.value;saveScene();};
  $('#pet').onchange=event=>{scene.pet=event.target.value;saveScene();};
  document.querySelectorAll('[data-role]').forEach((select,index)=>{select.onchange=()=>{scene.people[index].relation=select.value;saveScene();};});
  document.querySelectorAll('[data-outfit]').forEach((select,index)=>{select.onchange=()=>{scene.people[index].outfit=select.value;saveScene();};});
  $('#add-person').onclick=()=>{if(scene.people.length<4)scene.people.push({relation:'Friend',outfit:outfits[scene.people.length]});persist();renderStudio();};
  $('#remove-person').onclick=()=>{if(scene.people.length>1)scene.people.pop();persist();renderStudio();};
  $('#portrait-form').onsubmit=event=>{
    event.preventDefault();
    if(!validScene(scene))return;
    state.phase='done';persist();renderMission();
  };
  redraw();
}

function teacherForm(){
  app.innerHTML=`<section class="panel room-form"><h1>Classroom room</h1><p>Each learner gets a numbered place. The dashboard shows progress and help requests.</p>
    <form id="room-form">${missionOptions()}<label>Connection <select id="connection"><option value="local">Same browser · offline</option><option value="online">Separate devices · internet</option></select></label>
      <button class="primary" id="open-room" type="submit">Open room</button></form></section>`;
  $('#connection').value=lastSettings.mode;
  $('#room-form').onsubmit=async event=>{
    event.preventDefault();
    if(pending)return;
    const mission=selectedMission(), code=String(crypto.getRandomValues(new Uint32Array(1))[0]%900000+100000);
    const mode=lastSettings.mode=$('#connection').value;
    const button=$('#open-room');
    button.disabled=true;
    button.textContent='Opening room…';
    pending=true;
    try{
      teaching=await teacherRoom({code,mode,mission,update:renderRoster});
      renderTeacher(code,mode);
    }catch(error){notice(error.message);}
    finally{pending=false;button.disabled=false;button.textContent='Open room';}
  };
}

function renderTeacher(code,mode){
  const link='?'+new URLSearchParams({view:'join',code,mode});
  app.innerHTML=`<section class="panel teacher"><div class="tools teacher-head"><h1>Classroom room</h1><button id="close-room">Close room</button></div>
    <p>Room code <strong id="room-code">${code}</strong></p>
    <p>${mode==='local'?'Open a new learner tab in this browser.':'Send the learner link to devices with internet access.'}</p>
    <div class="tools"><a class="button primary" id="learner-link" href="${html(link)}" target="_blank" rel="noopener">Open learner link ↗</a>
    <button id="copy-link">Copy link</button></div>
    <div id="roster"><p>Waiting for learners…</p></div></section>`;
  $('#close-room').onclick=()=>{teaching.close();teaching=null;notice('Classroom room closed.');teacherForm();};
  $('#copy-link').onclick=async()=>{
    try{await navigator.clipboard.writeText(new URL(link,location.href).href);notice('Learner link copied.');}
    catch{notice('Open the learner link and copy the address from your browser.');}
  };
}

function renderRoster(rows){
  const roster=$('#roster');
  if(!roster)return;
  roster.innerHTML=rows.length?rows.map((row,index)=>`<article class="learner-row">
    <div><h2>${html(row.label)}</h2><p>${row.connected?'Connected':'Disconnected'} · ${html(phases[row.phase])}</p></div>
    <div><label for="learner-progress-${index}">${row.progress}% complete</label><progress id="learner-progress-${index}" value="${row.progress}" max="100"></progress></div>
    ${row.help?`<div><button data-ack="${html(row.id)}">Acknowledge help</button></div>`:''}</article>`).join(''):'<p>Waiting for learners…</p>';
  roster.querySelectorAll('[data-ack]').forEach(button=>{
    button.onclick=()=>teaching?.acknowledge(button.dataset.ack);
  });
}

function joinForm(){
  let priorId;
  if(codePattern.test(roomCode||''))try{priorId=sessionStorage.getItem('englishcode:farito:'+roomCode);}catch{}
  const prior=priorId?restoreState(read(roomKey(roomCode,priorId),null)):null;
  app.innerHTML=`<section class="panel room-form"><h1>Join a classroom room</h1>
    <form id="join-form"><label>Six-digit room code <input id="code" pattern="[0-9]{6}" maxlength="6" inputmode="numeric" autocomplete="off" required></label>
    <label>Connection <select id="join-mode"><option value="local">Same browser · offline</option><option value="online">Separate devices · internet</option></select></label>
    <button class="primary" type="submit">Connect</button></form>
    ${prior?'<button id="resume-room" type="button">Continue on this device</button>':''}</section>`;
  if(roomCode)$('#code').value=roomCode;
  if(roomMode==='online')$('#join-mode').value='online';
  if(prior)$('#resume-room').onclick=()=>{
    learnerId=priorId;
    state=prior;
    activeMission=missionFromState(prior);
    notice('Continue your saved mission on this device.');
    renderMission();
  };
  $('#join-form').onsubmit=event=>{
    event.preventDefault();
    location.search=new URLSearchParams({view:'join',code:$('#code').value,mode:$('#join-mode').value}).toString();
  };
}

function roomEnded(){
  roomLive=false;
  connection=null;
  notice('The teacher room closed. You can finish the mission in this tab.');
  if($('#teacher-help'))$('#teacher-help').disabled=true;
}
async function join(){
  if(!codePattern.test(roomCode||'')||!['local','online'].includes(roomMode)){joinForm();return;}
  app.innerHTML='<section class="panel room-form"><h1>Opening your room…</h1></section>';
  try{
    connection=await learnerRoom({code:roomCode,mode:roomMode,disconnected:roomEnded,acknowledged(){
      helpRequested=false;
      const button=$('#teacher-help');
      if(button){button.disabled=false;button.textContent='Ask the teacher';}
      notice('Your teacher saw your request.');
    }});
    const info=connection.welcome;
    if(!info.mission||!levels.includes(info.mission.level)||typeof info.label!=='string')throw new Error('Invalid classroom mission.');
    const mission={level:info.mission.level,pack:info.mission.pack?validatePack(info.mission.pack,'words'):null};
    roomLive=true;
    classLabel=info.label;
    learnerId=connection.id;
    activeMission=mission;
    state=restoreState(read(roomKey(roomCode,learnerId),null))||createMission(mission.level,mission.pack);
    persist();
    renderMission();
  }catch(error){
    connection?.close();
    connection=null;
    joinForm();
    notice(error.message);
  }
}

function lookup(){
  const strip=value=>value.normalize('NFKD').replace(/\p{Diacritic}/gu,'').trim().toLowerCase();
  const term=$('#lookup').value;
  const word=Object.entries(glossary).find(([source])=>strip(source)===strip(term))?.[1];
  $('#translation').textContent=word||'Try a family word such as abuela, tío or primo.';
}
$('#lookup').oninput=lookup;
window.addEventListener('pageshow',event=>{if(event.persisted&&(role==='teacher'||role==='join'))location.reload();});
if(role==='teacher')teacherForm();
else if(role==='join')join();
else home();
