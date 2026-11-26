export const playlistFor=g=>g.playlist||[0,1,2];
export function skillFor(team,arena){
 const n=Math.floor(team.attempts/3);
 if(n%2){
  const directions=['up','right','down','left'];
  const sequence=Array.from({length:4},(_,i)=>directions[(arena+n+i*3)%4]);
  return {id:`skill-${arena}-${team.cursor}`,type:'swipe',sequence,issued:Date.now()};
 }
 return {id:`skill-${arena}-${team.cursor}`,type:'timing',low:.36,high:.66,period:1900,issued:Date.now()};
}
export function skillCorrect(skill,answer){
 if(skill.type==='swipe')return Array.isArray(answer)&&answer.join(',')===skill.sequence.join(',');
 return typeof answer==='number'&&Number.isFinite(answer)&&answer>=skill.low&&answer<=skill.high;
}
