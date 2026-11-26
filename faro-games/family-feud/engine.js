import { hydrateAnswers } from './round.js';

const playable = ['opening','play','steal'];
function newRound(game) {
  return {
    phase:'ready', active:null, owner:null, opening:null, attempts:[0,0], strikes:0,
    answers:hydrateAnswers(game.deck[game.turn][1]), deadline:null, awarded:null,
    message:'Open the survey when both teams are ready.',
  };
}
export function createGame(deck, teams, level) {
  const game={ version:2, id:crypto.randomUUID(), deck, teams, level, turn:0, scores:[0,0], history:[], finished:false };
  game.round=newRound(game);
  return game;
}
export const multiplier=game=>[1,1,2,3][game.turn]||1;
export function pot(game) {
  return game.round.answers.reduce((sum,answer)=>sum+(answer.found?answer.points*multiplier(game):0),0);
}
export const canAnswer=game=>Boolean(game && !game.finished && playable.includes(game.round.phase));
function snapshot(game) {
  const round=structuredClone(game.round);
  round.deadline=null;
  game.history.push({ round, turn:game.turn, scores:[...game.scores], finished:game.finished });
  if(game.history.length>40)game.history.shift();
}
function change(game, mutate) {
  snapshot(game);
  mutate(game.round);
  return true;
}
export function undo(game) {
  if(!game?.history.length)return false;
  Object.assign(game,game.history.pop());
  return true;
}
function award(game, team, message) {
  const round=game.round;
  if(team!==null)game.scores[team]+=pot(game);
  round.awarded=team;
  round.active=null;
  round.deadline=null;
  round.phase='done';
  round.message=message;
}
export function flow(game) {
  if(!game||game.finished)return false;
  const round=game.round;
  if(round.phase==='ready')return change(game,r=>{r.phase='buzz';r.message='Buzz in to answer first.';});
  if(round.phase!=='done')return false;
  return change(game,r=>{
    const remaining=r.answers.find(answer=>!answer.found&&!answer.uncovered);
    if(remaining){
      remaining.uncovered=true;
      r.message='Review the remaining responses.';
    }else if(game.turn+1<game.deck.length){
      game.turn++;
      game.round=newRound(game);
    }else game.finished=true;
  });
}
export function buzz(game, team) {
  if(!game||game.finished||game.round.phase!=='buzz'||![0,1].includes(team))return false;
  return change(game,r=>{r.active=team;r.phase='opening';r.message=`${game.teams[team]} buzzed first.`;});
}
function control(game, team) {
  const round=game.round;
  if(round.answers.every(answer=>answer.found)){
    award(game,team,`${game.teams[team]} cleared the board.`);
    return;
  }
  round.phase='play';
  round.owner=round.active=team;
  round.message=`${game.teams[team]} controls the board.`;
}
export function accept(game, index) {
  if(!canAnswer(game)||!Number.isInteger(index))return false;
  const answer=game.round.answers[index];
  if(!answer||answer.found)return false;
  return change(game,r=>{
    r.deadline=null;
    answer.found=true;
    if(r.phase==='opening'){
      if(r.opening){
        const challenger=answer.points>r.opening.points?r.active:r.opening.team;
        control(game,challenger);
      }else if(answer.points===Math.max(...r.answers.map(item=>item.points))){
        control(game,r.active);
      }else{
        r.opening={team:r.active,points:answer.points};
        r.active=1-r.active;
        r.message=`${game.teams[r.active]} can try for a higher answer.`;
      }
    }else if(r.phase==='steal'){
      award(game,r.active,`${game.teams[r.active]} stole the round.`);
    }else if(r.answers.every(item=>item.found)){
      award(game,r.owner,`${game.teams[r.owner]} cleared the board.`);
    }else r.message=`${answer.text} is on the board.`;
  });
}
export function strike(game, reason='Strike') {
  if(!canAnswer(game))return false;
  return change(game,r=>{
    r.deadline=null;
    if(r.phase==='opening'){
      r.attempts[r.active]++;
      if(r.opening)control(game,r.opening.team);
      else if(r.attempts.every(value=>value>=2)){
        award(game,null,'Both teams missed. No points this round.');
      }else{
        r.active=1-r.active;
        r.message=`${reason}. ${game.teams[r.active]} can answer.`;
      }
    }else if(r.phase==='steal'){
      award(game,r.owner,`Steal missed. ${game.teams[r.owner]} keeps the round.`);
    }else{
      r.strikes++;
      if(r.strikes===3){
        r.phase='steal';
        r.active=1-r.owner;
        r.message=`${game.teams[r.active]} can steal with one answer.`;
      }else r.message=`${reason}. ${r.strikes} of 3 strikes.`;
    }
  });
}
export function normalize(text) {
  return String(text).normalize('NFKD').replace(/\p{Diacritic}/gu,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
}
export function matchAnswer(game,text) {
  const value=normalize(text);
  if(!value)return {kind:'unknown'};
  const hits=game.round.answers.flatMap((answer,index)=>
    [answer.text,...answer.aliases].some(option=>normalize(option)===value)?[index]:[]);
  if(hits.length!==1)return {kind:hits.length?'ambiguous':'unknown'};
  return {kind:game.round.answers[hits[0]].found?'duplicate':'match',index:hits[0]};
}
export function publicView(game) {
  const { round }=game;
  return {
    id:game.id, level:game.level, turn:game.turn, total:game.deck.length, multiplier:multiplier(game),
    teams:game.teams, scores:game.scores, pot:pot(game), finished:game.finished, phase:round.phase,
    question:round.phase==='ready'?'':game.deck[game.turn][0], active:round.active,
    strikes:round.strikes, message:round.message, deadline:round.deadline,
    answers:round.answers.map(answer=>{
      if(!answer.found&&!answer.uncovered)return null;
      return {text:answer.text,points:answer.points,found:answer.found};
    }),
  };
}
