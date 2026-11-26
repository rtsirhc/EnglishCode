import {bank,makeDeck,shuffle} from './bank.js';
function customDeck(length,count){
 if(!length)throw new Error('The quiz needs at least one question.');
 const result=[];
 while(result.length<count){
  const batch=shuffle(Array.from({length},(_,index)=>index));
  if(length>1&&batch[0]===result.at(-1))[batch[0],batch[1]]=[batch[1],batch[0]];
  result.push(...batch.slice(0,count-result.length));
 }
 return result;
}
export function newGame({grade=2,sizes=[6,6,6,6],rounds=6,seconds=12,previous=[],customQuestions=null}){
 const deck=customQuestions?customDeck(customQuestions.length,sizes.length*rounds):makeDeck(sizes.length,rounds,Math.random,previous);
 return {version:1,grade,sizes,rounds,seconds,deck,customQuestions,turn:0,teams:sizes.map(()=>({teeth:8,coins:0,played:0,person:0})),phase:'intro',remaining:1,deadline:null,paused:false,result:null,history:[],muted:false};
}
export function question(state){
 const id=state.deck[state.turn];
 if(!state.customQuestions)return bank.find(item=>item.id===id);
 const item=state.customQuestions[id];
 return {id:'custom-'+id,type:'quiz',visual:'mystery',prompts:[item.question,item.question,item.question],
  short:item.answer,model:item.answer,accept:item.explanation,options:item.options,correct:item.answer};
}
export const row=s=>s.turn%s.teams.length;
export const bonus=s=>Math.floor(s.turn/s.teams.length)%3===2;
export function score(s,correct){if(!['answer','timeup'].includes(s.phase))return false;
 s.history.push(JSON.stringify({...s,customQuestions:undefined,history:[]}));if(s.history.length>60)s.history.shift();
 const t=s.teams[row(s)];let restored=0;
 if(correct){t.coins++;if(bonus(s)&&t.teeth<8){t.teeth++;restored++;}while(t.coins>=3&&t.teeth<8){t.coins-=3;t.teeth++;restored++;}}
 else t.teeth=Math.max(0,t.teeth-1);
 t.played++;t.person=(t.person+1)%s.sizes[row(s)];s.phase='feedback';s.result={correct,restored};s.deadline=null;s.paused=false;return true;
}
export function next(s){if(s.phase!=='feedback')return false;s.turn++;s.phase=s.turn>=s.deck.length?'finished':'intro';s.remaining=1;s.deadline=null;if(s.phase!=='finished')s.result=null;s.paused=false;return true;}
export function undo(s){if(!s.history.length)return null;const history=[...s.history];const previous=JSON.parse(history.pop());return {...previous,customQuestions:s.customQuestions,history,phase:'answer',remaining:previous.seconds,deadline:null,paused:true,result:null};}
export function standings(s){return s.teams.map((t,i)=>({...t,row:i})).sort((a,b)=>b.teeth-a.teeth||b.coins-a.coins);}
