import { gameRuntime } from '/gallery/shared/runtime.js';
import { read,write } from '/gallery/shared/storage.js';
import { challengeBanks, words } from './clothing-bank.js';

const $=selector=>document.querySelector(selector);
const params=new URLSearchParams(location.search);
const display=params.get('display')==='projector';
const runtime=gameRuntime('clothing-vocabulary','words',display?{}:{
  next:()=>{if(session.view==='scene')nextScene();else nextChallenge();},
  confirm:()=>{if(session.view==='challenge')toggleAnswer();else $('#listen-word')?.click();},
  hint:()=>toggleAnswer(),
});
const pack=runtime.pack;
const customWords=(pack?.items||[]).map(item=>[item.word,'Imported','',item.word,item.clue,null,item.translation||'']);
const catalog=[...words,...customWords];
const banks={...challengeBanks};
if(pack)banks.custom=pack.items.map(item=>['Name the word',item.clue,'Say the word in English.',item.word]);
const saved=runtime.load(null);
const newSession=()=>({
  version:1,id:crypto.randomUUID(),view:'word',card:null,glossary:[],category:'All',search:'',
  memberCount:6,present:[1,2,3,4,5,6],level:'A1',sceneIndex:0,scenes:[],
  challengeType:pack?'custom':'describe',challengeQueues:{},last:{},answerShown:false,
});
const session=saved?.version===1&&typeof saved.id==='string'?{...newSession(),...saved}:newSession();
if(!Object.hasOwn(banks,session.challengeType))session.challengeType='describe';
if(!pack&&session.card?.[1]==='Imported'){session.card=null;session.view='word';}
const projectionKey=id=>'clothing-lab:projector:'+id;
const esc=text=>String(text??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function notice(text=''){$('#notice').textContent=text;}
function paint(model){
  if(!model?.card){$('#projector').innerHTML='<p class="display-empty">Choose a word to begin.</p>';return;}
  const item=model.card;
  if(model.view==='scene'){
    $('#projector').innerHTML=`<div class="eyebrow">Scene ${model.sceneIndex+1} / ${model.sceneCount}</div><h2>${esc(item.title)}</h2>
      <p>${esc(item.prompt)}</p><div class="phrase">${esc(item.line)}</div>`;
    return;
  }
  if(model.view==='challenge'){
    $('#projector').innerHTML=`<h2>${esc(item[0])}</h2><p>${esc(item[1])}</p><div class="phrase">${esc(item[2])}</div>
      ${model.answerShown?`<p class="example">Example: ${esc(item[3])}</p>`:''}`;
    return;
  }
  const visual=item[5]&&/^assets\/[a-z]+\.webp$/.test(item[5])?
    `<img src="${item[5]}" alt="">`:esc(item[2]);
  $('#projector').innerHTML=`${visual?`<div class="big-emoji" aria-hidden="true">${visual}</div>`:''}<h2>${esc(item[0])}</h2>
    <p>${esc(item[3])}${item[6]?' · '+esc(item[6]):''}</p><div class="phrase">${esc(item[4])}</div>
    ${!display?'<button id="listen-word">Listen</button>':''}`;
  if(!display)$('#listen-word').onclick=()=>speak(item[4]);
}
function speak(text){
  const voice=window.speechSynthesis?.getVoices().find(item=>item.localService&&item.lang.toLowerCase().startsWith('en'));
  if(!voice){notice('Read the example aloud. This device does not have a local English voice.');return;}
  const utterance=new SpeechSynthesisUtterance(text);
  utterance.voice=voice;
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

function projection(){
 const card=session.view==='challenge'&&!session.answerShown?session.card?.slice(0,3):session.card;
 return {view:session.view,card,sceneIndex:session.sceneIndex,sceneCount:session.scenes.length,answerShown:session.answerShown};
}
function save(publish=false){
  if(!runtime.save(session))notice('Browser storage is unavailable. Keep this tab open to keep your work.');
  if(publish)write(projectionKey(session.id),projection());
}
function show(){
  paint({ ...projection(), card:session.card });
  $('#glossary').innerHTML=session.glossary.length?session.glossary.map(word=>`<span>${esc(word)}</span>`).join(''):'<p class="empty-glossary">Selected words appear here.</p>';
  $('#challengeAnswer').disabled=session.view!=='challenge';
  $('#challengeAnswer').textContent=session.answerShown?'Hide example':'Show example';
  $('#nextScene').disabled=session.scenes.length<2;
  save(true);
}
function renderWords(){
  const input=$('#search'), query=input.value.toLowerCase().trim();
  const relevant=catalog.map((item,index)=>({item,index})).filter(({item})=>(session.category==='All'||item[1]===session.category)&&
    [item[0],item[6]].some(value=>value?.toLowerCase().includes(query)));
  $('#wordList').innerHTML=relevant.map(({item,index})=>`<div class="word-row">
    ${item[5]?`<img class="thumb" src="${item[5]}" alt="">`:item[2]?`<span class="emoji" aria-hidden="true">${esc(item[2])}</span>`:''}
    <div class="word">${esc(item[0])}<small>${esc(item[1])}${item[6]?' · '+esc(item[6]):''}</small></div>
    <button data-word="${index}" aria-label="Show ${esc(item[0])}">Show</button></div>`).join('')||'<p>No matches.</p>';
  document.querySelectorAll('[data-word]').forEach(button=>button.onclick=()=>{
    const item=catalog[Number(button.dataset.word)];
    session.card=item;
    session.view='word';
    if(!session.glossary.includes(item[0]))session.glossary.push(item[0]);
    notice();
    show();
  });
}
function renderCategories(){
  const categories=['All',...new Set(catalog.map(item=>item[1]))];
  if(!categories.includes(session.category))session.category='All';
  $('#categories').innerHTML=categories.map(category=>`<button data-category="${esc(category)}" aria-pressed="${category===session.category}" class="${category===session.category?'active':''}">${esc(category)}</button>`).join('');
  document.querySelectorAll('[data-category]').forEach(button=>button.onclick=()=>{
    session.category=button.dataset.category;
    renderCategories();
    renderWords();
    save();
  });
}
function shuffle(items){
 const indices=items.map((_,index)=>index);
 for(let i=indices.length-1;i>0;i--){
   const next=Math.floor(Math.random()*(i+1));
   [indices[i],indices[next]]=[indices[next],indices[i]];
 }
 return indices;
}
function nextChallenge(type=session.challengeType){
  const bank=banks[type];
  if(!bank?.length)return;
  session.challengeType=type;
  let queue=session.challengeQueues[type];
  if(!queue?.length||queue.some(index=>!bank[index])){
    queue=shuffle(bank);
    if(queue.length>1&&queue.at(-1)===session.last[type])[queue[0],queue[queue.length-1]]=[queue.at(-1),queue[0]];
    session.challengeQueues[type]=queue;
  }
  const index=queue.pop();
  session.last[type]=index;
  session.card=bank[index];
  session.answerShown=false;
  session.view='challenge';
  notice();
  show();
}
function toggleAnswer(){
  if(session.view!=='challenge'||!session.card)return;
  session.answerShown=!session.answerShown;
  show();
}
function renderPresent(){
  $('#presentList').innerHTML=Array.from({length:session.memberCount},(_,index)=>{
    const number=index+1, present=session.present.includes(number);
    return `<button data-person="${number}" aria-pressed="${present}" class="student ${present?'on':''}">Learner ${number}</button>`;
  }).join('');
  document.querySelectorAll('[data-person]').forEach(button=>button.onclick=()=>{
    const number=Number(button.dataset.person);
    session.present=session.present.includes(number)?session.present.filter(item=>item!==number):[...session.present,number].sort((a,b)=>a-b);
    renderPresent();
    save();
  });
}
const roleCards=[
  ['Customer','The customer enters the store.','I’m looking for a blue hoodie, please.','Excuse me. Do you have a blue hoodie in medium?'],
  ['Clerk','The clerk shows the item.','Here you are.','Here you are. It costs 300 pesos.'],
  ['Stock assistant','Someone checks availability.','We have it in blue.','We have blue and green in medium.'],
  ['Manager','The manager offers the fitting room.','You can try it on.','The fitting room is near the counter. Would you like to try it on?'],
  ['Customer’s friend','A friend gives an opinion.','I like the blue one.','I think the blue one looks great on you.'],
];
function showScenes(){
  $('#sceneList').innerHTML=session.scenes.length?`<ol>${session.scenes.map((scene,index)=>`<li ${index===session.sceneIndex?'aria-current="step"':''}><b>${esc(scene.title)}</b></li>`).join('')}</ol>`:'';
}
function selectScene(){
  session.card=session.scenes[session.sceneIndex];
  session.view='scene';
  showScenes();
  show();
}
function makeSketch(){
  if(session.present.length<2){notice('Mark at least two participants present.');return;}
  session.scenes=session.present.map((person,index)=>{
    const row=roleCards[index%roleCards.length];
    return {title:`Learner ${person} · ${row[0]}`,prompt:row[1],line:row[session.level==='A1'?2:3]};
  });
  session.sceneIndex=0;
  notice();
  selectScene();
}
function nextScene(){
  if(session.scenes.length<2)return;
  if(session.view==='scene')session.sceneIndex=(session.sceneIndex+1)%session.scenes.length;
  selectScene();
}

if(display){
  document.body.classList.add('projector-mode');
  const id=params.get('room')||saved?.id;
  const receive=()=>paint(read(projectionKey(id),null));
  window.addEventListener('storage',event=>{if(event.key==='englishcode:v1:'+projectionKey(id))receive();});
  receive();
}else{
  if(!pack)delete session.challengeQueues.custom;
  $('#custom-review').hidden=!pack;
  $('#search').value=session.search;
  $('#lesson-level').value=session.level;
  $('#participant-count').value=session.memberCount;
  $('#search').oninput=event=>{session.search=event.target.value;renderWords();save();};
  $('#lesson-level').onchange=event=>{session.level=event.target.value;save();};
  $('#load-count').onclick=()=>{
    const count=Number($('#participant-count').value);
    if(!Number.isInteger(count)||count<2||count>24){notice('Choose 2 to 24 participants.');return;}
    session.memberCount=count;
    session.present=Array.from({length:count},(_,index)=>index+1);
    renderPresent();save();notice();
  };
  $('.tabs').querySelectorAll('[data-tab]').forEach(button=>button.onclick=()=>{
    document.querySelectorAll('[data-tab]').forEach(tab=>tab.classList.toggle('active',tab===button));
    document.querySelectorAll('.panel').forEach(panel=>panel.classList.toggle('active',panel.id===button.dataset.tab));
  });
  $('#openDisplay').onclick=()=>{
    const locationUrl=new URL(location.pathname,location.origin);
    locationUrl.search=new URLSearchParams({display:'projector',room:session.id});
    save(true);
    window.open(locationUrl.href,'_blank','noopener');
  };
  $('#projectCurrent').onclick=()=>save(true);
  $('#clear').onclick=()=>{
    session.view='word';session.card=null;session.glossary=[];session.answerShown=false;
    show();
  };
  $('#makeSketch').onclick=makeSketch;
  $('#nextScene').onclick=nextScene;
  document.querySelectorAll('[data-challenge]').forEach(button=>button.onclick=()=>nextChallenge(button.dataset.challenge));
  $('#nextChallenge').onclick=()=>nextChallenge();
  $('#challengeAnswer').onclick=toggleAnswer;
  renderCategories();
  renderWords();
  renderPresent();
  showScenes();
  show();
}
