import { review } from './review.js';

export const levels = ['A1','A2','B1'];
const names = ['aunt','cousin','sister','siblings','uncle','grandmother','nephew','grandfather'];
const aliases = {aunt:['auntie'],siblings:['brothers and sisters'],grandmother:['grandma','granny'],grandfather:['grandpa','granddad']};
export const glossary = {
  abuela:'grandmother', abuelo:'grandfather', 'tía':'aunt', 'tío':'uncle', prima:'cousin', primo:'cousin',
  hermana:'sister', hermano:'brother', hermanos:'siblings', sobrina:'niece', sobrino:'nephew',
  madre:'mother', padre:'father', familia:'family', padres:'parents', parque:'park', playa:'beach',
  'jugar':'to play', cocinar:'to cook', pintar:'to paint', divertido:'funny', amable:'kind',
};
const topics = [
  ['Who is in your imaginary family?','My family includes …','My family includes my aunt and my cousin.'],
  ['What does your family enjoy doing together?','We like … together.','We like playing games together.'],
  ['Tell me about a different relative. What are they like?','My … is …','My grandfather is kind and very funny.'],
  ['Compare two people in your story. What do they like?','My … likes …, but …','My aunt likes reading, but my cousin prefers sports.'],
  ['Choose a weekend activity. Why is it a good choice?','I would choose … because …','I would choose a picnic because everyone could come.'],
  ['Invite Farito to join your story for a day.','Would you like to … with us?','Would you like to visit the park with us?'],
];
const simple = [
  ['Who is in your imaginary family?','My family includes …','My family includes my aunt and my cousin.'],
  ['What do you do together?','We … together.','We play together.'],
  ['Choose another person. What are they like?','My … is …','My uncle is funny.'],
  ['Where do they go on Sundays?','They go to …','They go to the park.'],
  ['Choose one thing to do on Sunday.','I want to …','I want to play football.'],
  ['Invite Farito to go with you.','Would you like to …?','Would you like to come with us?'],
];
const transitions = ['Thanks for introducing them.','Let’s add someone else to the story.','Now imagine them together.','Let’s plan their weekend.','One last part of the story.'];
const normalize = value => String(value).normalize('NFKD').replace(/\p{Diacritic}/gu,'')
  .toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();

function shuffle(items, rng) {
  const result = [...items];
  for (let end=result.length-1;end>0;end--) {
    const other=Math.floor(rng()*(end+1));
    [result[end],result[other]]=[result[other],result[end]];
  }
  return result;
}

export function createMission(level='A2', pack=null, rng=Math.random) {
  const deck=pack?shuffle([...new Map(pack.items.map(item=>[normalize(item.word),item])).values()],rng)
    .map(item=>({prompt:item.clue,word:item.word,explanation:item.translation||item.word})):
    shuffle(names.map(word=>shuffle(review.filter(item=>item.word===word),rng)[0]),rng);
  const reviewItems=deck.map(question=>{
    const alternatives=question.options||[question.word,...shuffle(deck.filter(item=>item.word!==question.word),rng).slice(0,2).map(item=>item.word)];
    return {...question,options:shuffle(alternatives,rng)};
  });
  return {
    version:1, level:levels.includes(level)?level:'A2', phase:'review', index:0, reviewItems,
    reviewTitle:pack?.title||'Family vocabulary', customReview:Boolean(pack), hint:0, helped:0, wrong:false, independent:0,
    chats:[], messages:[{role:'guide',text:'Let’s solve a few riddles and make a portrait of an imaginary family.'},
      {role:'guide',text:reviewItems[0].prompt}], scene:null,
  };
}

export function currentPrompt(state) {
  if(state.phase==='review')return state.reviewItems[state.index].prompt;
  return (state.level==='A1'?simple:topics)[state.chats.length]?.[0]||'';
}

function say(state, role, text) {
  state.messages.push({role,text});
  if(state.messages.length>24)state.messages.splice(0,state.messages.length-24);
}

export function looksPrivate(text) {
  return /https?:\/\/|\bwww\.|[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(text) ||
    /\d(?:[\s().-]*\d){6,}/.test(text);
}

export function hint(state) {
  if(!['review','chat'].includes(state.phase))return false;
  if(state.hint===2)return false;
  state.hint++;
  if(state.hint===1)state.helped++;
  return true;
}

export function support(state) {
  if(state.phase==='review'){
    const q=state.reviewItems[state.index];
    return {choices:state.hint===1&&q.options.length>1?q.options:[],
      text:state.hint===2?`${q.word} · ${q.explanation}`:state.hint===1&&q.options.length===1?`Starts with “${q.word[0]}”.`:''};
  }
  const item=(state.level==='A1'?simple:topics)[state.chats.length];
  return item?{choices:[],text:state.hint===2?item[2]:state.hint===1?item[1]:''}:{choices:[],text:''};
}

export function submit(state, raw) {
  const text=String(raw).trim().slice(0,360);
  if(!text)return {error:'Write a reply first.'};
  if(looksPrivate(text))return {error:'Use fictional details and leave out phone numbers, links, or email addresses.'};
  if(!['review','chat'].includes(state.phase))return {error:'Continue with the portrait.'};
  if(state.phase==='review'){
    const item=state.reviewItems[state.index], expected=normalize(item.word);
    const direct=normalize(text);
    const answer=direct.replace(/^(?:the answer is|it s|it is|my|an?) /,'');
    if(direct!==expected&&answer!==expected&&!(aliases[expected]||[]).includes(answer)){
      state.wrong=true;
      say(state,'learner',text);
      say(state,'guide','Try the word or use a hint.');
      return {};
    }
    if(!state.wrong&&state.hint===0)state.independent++;
    say(state,'learner',text);
    say(state,'guide',item.explanation===item.word?`That’s right: ${item.word}.`:item.explanation);
    state.index++;
    state.hint=0;
    state.wrong=false;
    if(state.index===state.reviewItems.length){state.phase='chat';say(state,'guide','Now tell me a story about an imaginary family.');}
    say(state,'guide',currentPrompt(state));
    return {};
  }
  const words=normalize(text).split(' ').filter(Boolean);
  if(words.length<2)return {error:'Try a short phrase or sentence. Hint shows a sentence starter.'};
  state.chats.push(text);
  state.hint=0;
  say(state,'learner',text);
  if(state.chats.length===6){
    state.phase='portrait';
    say(state,'guide','Let’s turn your story into a picture. Choose who appears, where they are and what they do.');
  }else{
    say(state,'guide',transitions[state.chats.length-1]);
    say(state,'guide',currentPrompt(state));
  }
  return {};
}

export function progress(state) {
  return state.phase==='done'?100:state.phase==='portrait'?75:state.phase==='chat'?40+Math.round(state.chats.length/6*35):
    Math.round(state.index/state.reviewItems.length*40);
}

export function restoreState(value) {
  if(value?.version!==1||!levels.includes(value.level)||!['review','chat','portrait','done'].includes(value.phase)||
      !Array.isArray(value.reviewItems)||!value.reviewItems.length||!Number.isInteger(value.index)||
      value.index<0||value.index>value.reviewItems.length||value.phase==='review'&&value.index===value.reviewItems.length||
      !Array.isArray(value.chats)||value.chats.length>6||value.phase==='chat'&&value.chats.length===6||
      !Array.isArray(value.messages)||!value.reviewItems.every(item=>typeof item?.word==='string'&&typeof item.prompt==='string'&&Array.isArray(item.options)))return null;
  return value;
}
