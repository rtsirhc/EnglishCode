import { marketRequest, viewURL } from './local-market.js';
import { bindGameControls } from '../../../gallery/shared/runtime.js';
import {products} from './engine.mjs';import {art} from './art.mjs';
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),money=n=>n.toLocaleString('en-US'),norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const projected=new URLSearchParams(location.search).get('view')==='shop-display';document.body.classList.add(projected?'display':'teacher','simple-shop');
let state,page=0,query='',busy=false,queue=Promise.resolve(),receipt=null;
function notice(s){$('#notice').textContent=s;}
async function act(type,extra={}){
 if(busy)return;
 busy=true;
 try {
  const result=await marketRequest('shop',{type,revision:state.revision,...extra});
  state=result.state;
  notice('');
  if(type==='pay')receipt=state.sales.at(-1);
  if(type==='reset'||type==='undo')receipt=null;
  render();
  return true;
 }catch(error){notice(error.message);await poll();return false;}
 finally{busy=false;}
}
function clock(){if(!state)return;const c=state.clock,t=c.startedAt?Math.max(0,((c.pausedAt||Date.now())-c.startedAt-c.pausedMs)/1000):0,left=Math.max(0,(t<960?960:1200)-t);$('#clock').textContent=c.startedAt?`${String(Math.floor(left/60)).padStart(2,'0')}:${String(Math.floor(left%60)).padStart(2,'0')}`:'20:00';$('#phase').textContent=c.pausedAt?'PAUSED':!c.startedAt?'THE MARKET':t<960?`BUYER ${Math.min(4,Math.floor(t/240)+1)}`:t<1200?'PLAN YOUR MENU':'TIME TO PRESENT';}
function cards(list){return list.map(p=>`<${projected?'article':'button'} class="product ${state.stock[p.id]}" ${projected?'':`data-product="${p.id}" ${state.stock[p.id]!=='available'?'disabled':''}`}><div class="art">${art(p)}</div><strong>${esc(p.name)}</strong><div class="price">${money(p.price)}</div><small>STALL ${p.stall}${projected?'':' · '+esc(p.es)}</small>${state.stock[p.id]!=='available'?`<div class="stamp">${state.stock[p.id]==='sold'?'SOLD OUT':'EN CAJA'}</div>`:''}</${projected?'article':'button'}>`).join('');}
function renderProducts(){$('#shopProducts').innerHTML=cards(products.filter(p=>norm(p.name+' '+p.es+' '+p.id).includes(norm(query))));document.querySelectorAll('[data-product]').forEach(b=>b.onclick=()=>act('add',{id:b.dataset.product}));}
function render(){if(!state)return;clock();$('#teams').hidden=true;
 if(projected){$('#app').innerHTML=`<div class="board-title"><h1>THE MARKET</h1><span class="page-label">${page+1} / 3 · Water, salt & oil are free</span></div><div class="grid">${cards(products.slice(page*20,page*20+20))}</div>`;return;}
 const basket=state.basket.map(id=>products.find(p=>p.id===id)),total=basket.reduce((v,p)=>v+p.price,0),focus=document.activeElement?.id,cash=$('#shopCash')?.value||'';
 $('#app').innerHTML=`<div class="shop-toolbar"><button id="project">Proyectar ↗</button><button id="shopClock">${!state.clock.startedAt?'Iniciar 20 min':state.clock.pausedAt?'Reanudar':'Pausar'}</button><button id="shopUndo">Deshacer</button><button id="shopReset" class="danger">Nuevo salón</button></div><div class="shop-layout"><section class="shop-catalog"><label for="shopSearch">Buscar o escanear</label><input id="shopSearch" type="search" autocomplete="off" placeholder="Nombre en inglés, español o código de barras" value="${esc(query)}"><div id="shopProducts" class="grid"></div></section><aside class="panel shop-checkout"><h2>Caja</h2><div class="shop-basket">${basket.length?basket.map(p=>`<div class="line"><span>${esc(p.name)}</span><b>${money(p.price)}</b><button data-remove="${p.id}" aria-label="Quitar ${esc(p.name)}">×</button></div>`).join(''):'<p class="muted">Selecciona o escanea los productos.</p>'}</div><div class="total">${money(total)}</div><label for="shopCash">Recibido · opcional</label><input id="shopCash" type="number" min="0" step="500" placeholder="Pago exacto" value="${esc(cash)}"><div class="actions"><button id="shopPay" class="primary" ${basket.length?'':'disabled'}>Cobrar</button><button id="shopCancel" ${basket.length?'':'disabled'}>Vaciar</button></div>${receipt?`<div class="shop-receipt"><strong>Cambio: ${money(receipt.change)}</strong><small>Cobrado: ${money(receipt.total)}</small></div>`:''}</aside></div>`;
 renderProducts();$('#project').onclick=()=>window.open(viewURL('shop-display'),'_blank','noopener');$('#shopClock').onclick=()=>act(state.clock.startedAt?'pause':'start');$('#shopUndo').onclick=()=>act('undo');$('#shopReset').onclick=async()=>{if(confirm('¿Nuevo salón? Se borrarán los cobros y todos los productos volverán a estar disponibles.')){query='';page=0;if(await act('reset'))$('#shopCash').value='';}};
 $('#shopSearch').oninput=e=>{query=e.target.value;renderProducts();};$('#shopSearch').onkeydown=e=>{if(e.key!=='Enter')return;e.preventDefault();const q=e.target.value.trim(),p=products.find(p=>p.id===q)||products.find(p=>norm(p.name)===norm(q)||norm(p.es)===norm(q));if(!p){notice('Selecciona el producto de la lista.');return;}queue=queue.then(async()=>{query='';await act('add',{id:p.id});$('#shopSearch')?.focus();});};
 $('#shopPay').onclick=()=>act('pay',{cash:$('#shopCash').value.trim()?Number($('#shopCash').value):undefined}).then(ok=>{if(ok){$('#shopCash').value='';$('#shopSearch').focus();}});$('#shopCancel').onclick=()=>act('cancel');document.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>act('remove',{id:b.dataset.remove}));if(focus&&$('#'+focus))$('#'+focus).focus();
}
async function poll(){
 try {
  const result=await marketRequest('shop');
  const changed=!state||state.revision!==result.state.revision;
  state=result.state;
  if(changed&&!busy)render();
  clock();
 }catch(error){notice(error.message);}
}
await poll();
setInterval(poll,1000);setInterval(clock,250);if(projected)setInterval(()=>{page=(page+1)%3;render();},14000);
document.addEventListener('keydown',e=>{if(projected){if(e.key==='ArrowLeft'){page=(page+2)%3;render();}return;}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();act('undo');}});

bindGameControls('mystery-menu', projected ? { next: () => { page=(page+1)%3;render(); } } :
 { confirm: () => $('#shopPay')?.click() });
