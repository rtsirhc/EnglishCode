import {products,price} from './engine.mjs';
export function freshShop(){return {revision:0,stock:Object.fromEntries(products.map(p=>[p.id,'available'])),basket:[],sales:[],history:[],clock:{startedAt:null,pausedAt:null,pausedMs:0}};}
export function shopAction(state,a,now=Date.now()){
 if(a.type==='reset'){const n=freshShop();n.finalDismissedAt=now;n.revision=state.revision+1;return n;}
 const n=structuredClone(state),fail=m=>{throw Error(m)};
 if(a.type==='dismissFinal'){n.finalDismissedAt=now;}
 else if(a.type==='start'){if(n.clock.startedAt)fail('El reloj ya está iniciado.');n.clock.startedAt=now;}
 else if(a.type==='pause'){if(!n.clock.startedAt)fail('Primero inicia el reloj.');if(n.clock.pausedAt){n.clock.pausedMs+=now-n.clock.pausedAt;n.clock.pausedAt=null;}else n.clock.pausedAt=now;}
 else if(a.type==='undo'){const previous=n.history.pop();if(!previous)fail('No hay cobros que deshacer.');Object.assign(n,previous);}
 else{
  const snapshot={stock:structuredClone(n.stock),basket:[...n.basket],sales:structuredClone(n.sales)};
  if(a.type==='add'){if(!Object.hasOwn(n.stock,a.id))fail('Producto no encontrado.');if(n.stock[a.id]!=='available')fail('Ese producto ya está vendido o en la compra.');n.basket.push(a.id);n.stock[a.id]='reserved';}
  else if(a.type==='remove'){if(!n.basket.includes(a.id))fail('Ese producto no está en la compra.');n.basket=n.basket.filter(id=>id!==a.id);n.stock[a.id]='available';}
  else if(a.type==='cancel'){for(const id of n.basket)n.stock[id]='available';n.basket=[];}
  else if(a.type==='pay'){if(!n.basket.length)fail('Selecciona un producto.');const total=n.basket.reduce((sum,id)=>sum+price(id),0),cash=a.cash??total;if(!Number.isInteger(cash)||cash<total)fail('El dinero recibido no alcanza para el total.');for(const id of n.basket)n.stock[id]='sold';n.sales.push({items:[...n.basket],total,cash,change:cash-total,time:now});n.basket=[];}
  else fail('Acción no reconocida.');
  n.history.push(snapshot);n.history=n.history.slice(-100);
 }
 n.revision=state.revision+1;return n;
}
