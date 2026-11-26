export const judges=[
 {name:'Traditional',label:'El clásico',focus:'Sabor y coherencia',personality:'Valora combinaciones equilibradas y un menú que tenga sentido. Prefiere ingredientes bien aprovechados a adornos innecesarios.'},
 {name:'Creative',label:'La creativa',focus:'Originalidad',personality:'Valora ideas originales y usos inesperados que funcionen. No premia mezclas extrañas sin una explicación convincente.'},
 {name:'Practical',label:'El práctico',focus:'Preparación y aprovechamiento',personality:'Valora cómo prepararían los platos y que cada ingrediente tenga una función real. Detecta ingredientes olvidados o añadidos sin comprarlos.'}
];
export function ranking(state){return state.results.teams.map(r=>{const team=state.teams.find(t=>t.id===r.id);return {...r,team,max:state.results.includeEnglish===false?30:40,total:Math.round((r.judges.reduce((v,j)=>v+j.score,0)+(state.results.includeEnglish===false?0:team.english))*10)/10};}).sort((a,b)=>b.total-a.total||a.id-b.id).map((r,i,all)=>({...r,place:all.findIndex(x=>x.total===r.total)+1}));}
// The saved start timestamp keeps the reveal in sync across tabs.
export function revealStage(state,now=Date.now()){
 if(state.resultsScreen!=='live'||!Number.isFinite(state.resultsStartedAt))return null;
 const seconds=Math.max(0,(now-state.resultsStartedAt)/1000),order=state.teams.filter(t=>state.results.teams.some(r=>r.id===t.id));
 if(seconds<5)return {type:'intro',key:'intro'};
 const elapsed=seconds-5,index=Math.floor(elapsed/28);
 if(index>=order.length){const end=elapsed-order.length*28;return end<6?{type:'suspense',key:'suspense'}:{type:'podium',key:'podium'};}
 const local=elapsed-index*28,team=order[index];
 if(local>=24)return {type:'total',team:team.id,key:`${team.id}:total`};
 const judge=Math.floor(local/8),revealed=local%8>=4;
 return {type:'judge',team:team.id,judge,revealed,key:`${team.id}:${judge}:${revealed?'score':'opinion'}`};
}

export function validateVerdict(data,teams){if(!Array.isArray(data?.teams)||data.teams.length!==teams.length)throw Error('El veredicto debe incluir todos los equipos.');const ids=new Set();for(const r of data.teams){if(!teams.some(t=>t.id===r.id)||ids.has(r.id)||!Array.isArray(r.judges)||r.judges.length!==3)throw Error('Equipo o jueces inválidos.');ids.add(r.id);const names=new Set();for(const j of r.judges){if(!j||!['Traditional','Creative','Practical'].includes(j.name)||names.has(j.name)||!Number.isFinite(j.score)||j.score<0||j.score>10||typeof j.comment!=='string'||j.comment.length>500)throw Error('Puntuación inválida.');names.add(j.name)}}return data;}
