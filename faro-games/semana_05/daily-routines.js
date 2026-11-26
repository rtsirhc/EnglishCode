import { gameRuntime } from '/gallery/shared/runtime.js';
import { localClipPlayer } from '/gallery/shared/lesson-audio.js';
import { slides as authored } from './daily-bank.js';

const $=id=>document.getElementById(id);
const runtime=gameRuntime('daily-routines','quiz',{
  ...Object.fromEntries(Array.from({length:6},(_,i)=>['answer'+(i+1),()=>choose(i)])),
  confirm:()=>{if(currentClip())speak();else reveal();},
  next:()=>move(1),
  hint:()=>reveal(),
});
const player=localClipPlayer();
const saved=runtime.load(null);
const pack=runtime.pack;
const slides=[...authored,...(pack?pack.items.map((item,index)=>({
  section:'custom',kind:'custom',title:item.question,line:item.explanation,answer:item.answer,options:item.options,
  correct:item.options.indexOf(item.answer),key:'custom:'+JSON.stringify([index,item.question,item.answer,item.options]),
})):[])];
const shapes={sun:'<circle cx="50" cy="50" r="19"/><path d="M50 5v12m0 66v12M5 50h12m66 0h12M18 18l9 9m46 46 9 9M18 82l9-9m46-46 9-9"/>',bed:'<path d="M10 80V25m0 35h80v20M10 42h25v18m0-12h48l7 12M10 70h80"/>',brush:'<path d="M40 88V35h20v53M35 35V12h30v23zM40 12v23m10-23v23m10-23v23"/>',shirt:'<path d="M30 15 8 30l12 22 12-7v42h36V45l12 7 12-22-22-15-10 10H40z"/>',plate:'<circle cx="55" cy="50" r="32"/><circle cx="55" cy="50" r="22"/><path d="M10 15v30m-7-30v20h14V15M10 45v40"/>',school:'<path d="M15 85V35h70v50zM10 35 50 10l40 25M42 85V60h16v25M27 45h9m28 0h9M27 58h9m28 0h9"/>',book:'<path d="M50 25c-15-12-30-12-40-7v62c15-5 26-4 40 6 14-10 25-11 40-6V18c-10-5-25-5-40 7v61M21 35h17m-17 14h17m24-14h17m-17 14h17"/>',moon:'<path d="M67 13a38 38 0 1 0 20 64A39 39 0 0 1 67 13z"/>',clock:'<circle cx="50" cy="50" r="38"/><path d="M50 25v25l19 12"/>'};
function art(name){return `<div class="art"><svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shapes[name]||shapes.clock}</svg></div>`}
let index=Number.isInteger(saved?.index)?Math.max(0,Math.min(slides.length-1,saved.index)):0;
let shown=saved?.shown===true;
const answers=saved?.answers&&typeof saved.answers==='object'?saved.answers:{};
const schedule=Array.isArray(saved?.schedule)?saved.schedule.slice(0,3):[];
const prompts=['wake up','go to school','go to bed'];
const esc=text=>String(text??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const key=()=>slides[index].key||'slide:'+index;
function save(){runtime.save({index,shown,answers,schedule});}
function choose(i){
 const slide=slides[index];
 if(!slide.options||shown||Object.hasOwn(answers,key())||!Number.isInteger(i)||i<0||i>=slide.options.length)return;
 answers[key()]=i;
 shown=true;
 render();
}
function choices(slide){
 return `<div class="choices">${slide.options.map((option,i)=>`<button class="choice ${shown&&i===slide.correct?'correct':''} ${shown&&i===answers[key()]&&i!==slide.correct?'incorrect':''}"
   data-answer="${i}" ${shown||Object.hasOwn(answers,key())?'disabled':''}><span class="number">${i+1}</span><span>${esc(option)}</span></button>`).join('')}</div>`;
}
function timeLabel(value){
 if(!/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(value||''))return '';
 const [hour,minute]=value.split(':');
 return `${Number(hour)%12||12}:${minute} ${Number(hour)<12?'a.m.':'p.m.'}`;
}
function routineLine(prompt,value){
 return `I ${prompt} at ${timeLabel(value)||'______.'}`;
}
function currentClip(){
 const slide=slides[index];
 return slide.spoken||(slide.kind==='word'?`I ${slide.word}.`:slide.kind==='compare'?slide.sentence:'');
}
function render(){
 const slide=slides[index];
 let body='';
 if(slide.kind==='intro')body=`<h1>${slide.title}</h1><p class="instruction">${slide.line}</p><div class="panel"><p class="sentence">I wake up. I get up.<br>I go to school.</p></div>`;
 if(slide.kind==='compare')body=`<h1>${slide.title}</h1><p class="instruction">${slide.line}</p><div class="panel"><p class="sentence">${slide.sentence}</p></div>`;
 if(slide.kind==='word')body=`<p class="eyebrow">Escucha y repite</p><div class="hero">${art(slide.icon)}<div><h1>${slide.word}</h1><p class="translation">${slide.translation}</p></div></div><div class="panel"><p class="sentence">I ${slide.word}.</p></div>`;
 if(['model','rule','complete','story'].includes(slide.kind))body=`<p class="eyebrow">${slide.title}</p><p class="sentence">${slide.sentence}</p><p class="sub">${slide.line}</p>`;
 if(slide.kind==='listen')body=`<p class="eyebrow">Comprensión auditiva</p><h1>${slide.title}</h1><p class="instruction">Pulsa Escuchar y elige una opción.</p>`;
 if(slide.kind==='custom')body=`<p class="eyebrow">${esc(pack.title)}</p><h1>${esc(slide.title)}</h1>`;
 if(slide.options)body+=choices(slide);
 if(slide.kind==='personal'||slide.kind==='end'){
  body=`<h1>${slide.title}</h1><p class="instruction">${slide.line}</p>`;
  if(slide.kind==='personal')body+=`<div class="routine-fields">${prompts.map((prompt,i)=>`<label>${prompt}<input type="time" data-time="${i}" value="${timeLabel(schedule[i])?esc(schedule[i]):''}"></label>`).join('')}</div>`;
  body+=`<div class="closing" id="schedule">${prompts.map((prompt,i)=>`<p>${routineLine(prompt,schedule[i])}</p>`).join('')}</div>`;
 }
 if(slide.answer)body+=`<div class="answer" role="status" ${shown?'':'hidden'}>${esc(slide.answer)}${slide.kind==='custom'&&slide.line?`<p>${esc(slide.line)}</p>`:''}</div>`;
 $('slide').innerHTML=body;
 $('counter').textContent=`${index+1} / ${slides.length}`;
 $('back').disabled=index===0;
 $('next').disabled=index===slides.length-1;
 $('reveal').hidden=!slide.answer;
 $('reveal').textContent=shown?'Ocultar respuesta':'Ver respuesta';
 $('speak').hidden=!currentClip();
 $('progress').style.width=`${(index+1)/slides.length*100}%`;
 document.querySelectorAll('[data-section]').forEach(button=>button.setAttribute('aria-current',String(button.dataset.section===slide.section)));
 document.querySelectorAll('[data-answer]').forEach(button=>button.onclick=()=>choose(Number(button.dataset.answer)));
 document.querySelectorAll('[data-time]').forEach(input=>input.onchange=()=>{
   schedule[Number(input.dataset.time)]=input.value;
   document.querySelectorAll('#schedule p').forEach((p,i)=>{p.textContent=routineLine(prompts[i],schedule[i]);});
   save();
 });
 save();
}
function goTo(target){
 player.stop();
 index=Math.max(0,Math.min(slides.length-1,target));
 shown=Object.hasOwn(answers,key());
 render();
}
function move(step){goTo(index+step);}
function reveal(){if(!slides[index].answer)return;shown=!shown;render();}
function speak(){player.play(currentClip(),$('speak'));}
async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{}}
$('custom').hidden=!pack;
$('back').onclick=()=>move(-1);$('next').onclick=()=>move(1);
$('reveal').onclick=reveal;$('speak').onclick=speak;$('full').onclick=fullscreen;
document.querySelectorAll('[data-section]').forEach(button=>button.onclick=()=>goTo(slides.findIndex(slide=>slide.section===button.dataset.section)));
document.addEventListener('keydown',event=>{
 if(event.defaultPrevented||event.repeat||event.altKey||event.ctrlKey||event.metaKey||event.target.matches('input,select,textarea'))return;
 const key=event.key.toLowerCase();
 if(key==='arrowleft'||key==='pageup'){event.preventDefault();move(-1);}
 if(key==='pagedown'){event.preventDefault();move(1);}
 if(key==='r')reveal();
 if(key==='f')fullscreen();
});
render();
