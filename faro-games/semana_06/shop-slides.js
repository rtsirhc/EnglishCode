import { gameRuntime } from '/gallery/shared/runtime.js';
const $=id=>document.getElementById(id);
const tabs=[...document.querySelectorAll('.tab')];
const allSlides=[...document.querySelectorAll('.slide')];
const runtime=gameRuntime('clothing-store','fixed',{
  next:()=>{if(dialog.open)deal();else move(1);},
  confirm:()=>{if(dialog.open)switchRole();else openRolePlay();},
  answer1:()=>setLevel('first'),answer2:()=>setLevel('second'),answer3:()=>setLevel('third'),
});
const saved=runtime.load({});
const levels=tabs.map(tab=>tab.dataset.level);
let level=levels.includes(saved?.level)?saved.level:'first';
let index=Number.isInteger(saved?.index)?saved.index:0;
const dialog=$('role-dialog');
const cards=[
  {item:'a blue hoodie',subject:'it',size:'medium',price:'300 pesos'},
  {item:'black jeans',subject:'them',size:'size 28',price:'450 pesos'},
  {item:'a red dress',subject:'it',size:'small',price:'350 pesos'},
  {item:'white shoes',subject:'them',size:'size 8',price:'500 pesos'},
  {item:'a green jacket',subject:'it',size:'large',price:'420 pesos'},
];
let cardIndex=-1,clerk=false;
function render(){
  const slides=allSlides.filter(slide=>slide.dataset.level===level);
  index=Math.min(slides.length-1,Math.max(0,index));
  allSlides.forEach(slide=>slide.classList.toggle('active',slide===slides[index]));
  for(const tab of tabs){
    const current=tab.dataset.level===level;
    tab.classList.toggle('active',current);
    tab.setAttribute('aria-pressed',String(current));
  }
  $('counter').textContent=`${index+1} / ${slides.length}`;
  $('prev').disabled=index===0;
  $('next').disabled=index===slides.length-1;
  runtime.save({level,index});
}
function setLevel(next){if(dialog.open)return;level=next;index=0;render();}
function move(step){index+=step;render();}
function renderCard(){
  const card=cards[cardIndex];
  const plural=card.subject==='them';
  $('card-context').textContent=`The customer wants ${card.item} in ${card.size}.`;
  $('card-role').textContent=clerk?'Clerk':'Customer';
  if(clerk){
    $('card-line').textContent=level==='first'?'Here you are.':
      `Yes, here you are. ${plural?'They cost':'It costs'} ${card.price}. The fitting room is over there.`;
  }else{
    $('card-line').textContent=level==='first'?`I’m looking for ${card.item}, please.`:
      level==='second'?`Do you have ${card.item} in ${card.size}? How much ${plural?'are they':'is it'}?`:
      `I’m looking for ${card.item} for a weekend trip. Do you have ${card.subject} in ${card.size}? Can I try ${card.subject} on?`;
  }
}
function deal(){cardIndex=(cardIndex+1)%cards.length;clerk=false;renderCard();}
function switchRole(){clerk=!clerk;renderCard();}
function openRolePlay(){deal();dialog.showModal();}
tabs.forEach(tab=>tab.onclick=()=>setLevel(tab.dataset.level));
$('prev').onclick=()=>move(-1);
$('next').onclick=()=>move(1);
$('role-play').onclick=openRolePlay;
$('card-swap').onclick=switchRole;
$('card-next').onclick=deal;
document.addEventListener('keydown',event=>{
  if(event.defaultPrevented||event.repeat||dialog.open||event.altKey||event.ctrlKey||event.metaKey||event.target.matches('input,select,textarea'))return;
  if(event.key==='ArrowLeft'){event.preventDefault();move(-1);}
  if(event.key==='Home'){event.preventDefault();index=0;render();}
});
render();
