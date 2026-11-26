export const words=[
['prescription','receta médica','a doctor’s written order for medicine','Do I need a prescription?',0,1],
['thermometer','termómetro','an object that measures your temperature','We need a thermometer.',0,2],
['bandage','venda','a strip of material that covers an injury','I need a bandage.',0,3],
['stomachache','dolor de estómago','pain in your stomach','I have a stomachache.',0,6],
['sore throat','dolor de garganta','pain in your throat','I have a sore throat.',0,7],
['runny nose','escurrimiento nasal','liquid coming from your nose','I have a runny nose.',0,10],
['toothache','dolor de muela','pain in a tooth','I have a toothache.',0,11],
['earache','dolor de oído','pain in your ear','I have an earache.',0,12],
['appointment','cita médica','a visit arranged for a specific time','I need an appointment.',1,0],
['receptionist','recepcionista','the person who welcomes you at the front desk','Ask the receptionist.',1,1],
['waiting room','sala de espera','the place where you sit before seeing the doctor','Please sit in the waiting room.',1,2],
['examination room','consultorio','the room where a doctor examines you','Please enter the examination room.',1,3],
['medical history','historial médico','a record of past illnesses and treatments','The doctor checks my medical history.',1,4],
['health insurance','seguro médico','coverage that helps pay for medical care','Do you have health insurance?',1,5],
['blood pressure','presión arterial','what a nurse checks with a cuff around your arm','The nurse checks my blood pressure.',1,6],
['checkup','revisión médica','a routine visit to check your health','I am here for a checkup.',1,7],
['blood test','análisis de sangre','a test using a small sample of blood','I need a blood test.',1,8],
['symptoms','síntomas','signs of illness such as a cough or fever','What are your symptoms?',1,9],
['stethoscope','estetoscopio','an instrument used to listen to your heart and lungs','The doctor uses a stethoscope.',1,10],
['allergy','alergia','a reaction to something such as pollen','I have an allergy.',1,11],
['painkiller','analgésico','medicine that helps reduce pain','Do I need a painkiller?',1,12],
['specialist','especialista','a doctor who focuses on one area of medicine','I need to see a specialist.',2,0],
['referral','pase a un especialista','a request for you to see another doctor','Do I need a referral?',2,1],
['follow-up appointment','cita de seguimiento','a return visit to check your progress','When is my follow-up appointment?',2,2],
['vaccination','vacunación','receiving a vaccine to help prevent illness','I am here for a vaccination.',2,3],
['medical form','formulario médico','a document you fill in with your information','Please fill out this medical form.',2,4]
];
export function shuffle(values,rng=Math.random){const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const review=[
['menu','menú','a list of food and drinks at a restaurant','Can I see the menu?'],
['bill','cuenta','the amount you pay after a restaurant meal','Can we have the bill?'],
['order','pedido','the food or drink you ask for','Can I take your order?'],
['nephew','sobrino','your brother’s or sister’s son','My nephew is five years old.'],
['cousin','primo o prima','the child of your aunt or uncle','My cousin lives nearby.'],
['siblings','hermanos y hermanas','your brothers and sisters together','I have two siblings.'],
['half past','y media','thirty minutes after an hour','The class starts at half past eight.'],
['quarter to','cuarto para','fifteen minutes before an hour','It is quarter to nine.'],
['at','a las','the preposition before a specific time','My appointment is at ten.'],
['on','el (con días y fechas)','the preposition before a day or a date','My birthday is on Monday.'],
['in','en (con meses)','the preposition before a month','My birthday is in November.'],
['birthday','cumpleaños','the date when you celebrate being born','When is your birthday?'],
['fitting room','probador','a place to try on clothes in a shop','Where is the fitting room?'],
['receipt','recibo o ticket','a paper showing what you bought and paid','Can I have a receipt?'],
['size','talla','how large or small a piece of clothing is','What size do you need?'],
['aisle','pasillo de tienda','a passage between shelves in a supermarket','The milk is in aisle five.'],
['checkout','caja','the place where you pay for your shopping','Please pay at the checkout.'],
['change','cambio de dinero','the money you receive back after paying','Here is your change.'],
['loaf','barra o pieza de pan','one whole piece of bread before slicing','I would like a loaf of bread.'],
['dozen','docena','a group of twelve items','I would like a dozen cookies.'],
['croissant','cruasán','a crescent-shaped buttery pastry','I would like a croissant.'],
['wake up','despertarse','to stop sleeping','I wake up at seven.'],
['brush my teeth','cepillarme los dientes','to clean my teeth with a toothbrush','I brush my teeth after breakfast.'],
['get dressed','vestirse','to put on clothes','I get dressed before school.']
];
const image=i=>({sheet:words[i][4],tile:words[i][5],label:words[i][2]});
function gap(sentence, phrase) {
 const index=sentence.toLowerCase().search(new RegExp('\\b'+phrase+'\\b','i'));
 return index<0 ? null : sentence.slice(0,index)+'_____'+sentence.slice(index+phrase.length);
}
export function makeDeck(level='core',bank='mixed'){
 const tasks=[];
 words.forEach((w,i)=>{
  const options=shuffle([i,...shuffle(words.map((_,j)=>j).filter(j=>j!==i)).slice(0,3)]);
  tasks.push({type:'choice',prompt:'Choose the word',picture:image(i),options:options.map(j=>({id:String(j),text:words[j][0]})),answer:String(i),explanation:`${w[0]} = ${w[1]}. ${w[3]}`});
  const pics=shuffle([i,...shuffle(words.map((_,j)=>j).filter(j=>j!==i)).slice(0,3)]);
  tasks.push({type:'picture',prompt:`Find: ${w[0]}`,options:pics.map(j=>({id:String(j),picture:image(j)})),answer:String(i),explanation:`${w[0]} = ${w[1]}.`});
  tasks.push({type:'choice',prompt:level==='support'?w[1]:w[2],options:options.map(j=>({id:String(j),text:words[j][0]})),answer:String(i),explanation:`${w[0]}: ${w[2]}.`});
  const cloze=gap(w[3],w[0]);
  if(cloze)tasks.push({type:'choice',prompt:cloze,options:options.map(j=>({id:String(j),text:words[j][0]})),answer:String(i),explanation:w[3]});
  if(level!=='support'){
   const tokens=w[3].replace(/[.?]/g,'').split(' ');const chips=shuffle(tokens.map((text,n)=>({id:String(n),text})));
   tasks.push({type:'order',prompt:'Build the sentence',clue:level==='stretch'?undefined:w[0],options:chips,answer:tokens.map((_,n)=>String(n)).join(','),explanation:w[3]});
  }
 });
 for(let i=0;i<26;i+=3){const ids=Array.from({length:Math.min(3,26-i)},(_,k)=>i+k);tasks.push({type:'match',prompt:'Match the pairs',left:ids.map(j=>({id:String(j),text:words[j][0]})),right:shuffle(ids).map(j=>({id:'r'+j,text:level==='stretch'?words[j][2]:words[j][1]})),answer:ids.map(j=>`${j}:r${j}`).sort().join(','),explanation:ids.map(j=>`${words[j][0]} = ${words[j][1]}`).join(' · ')});}
 if(bank!=='health'){
  const cumulative=[];
  review.forEach((w,i)=>{
   const ids=shuffle([i,...shuffle(review.map((_,j)=>j).filter(j=>j!==i)).slice(0,3)]);
   const options=ids.map(j=>({id:'v'+j,text:review[j][0]}));
   cumulative.push({type:'choice',prompt:level==='support'?w[1]:w[2],options,answer:'v'+i,explanation:`${w[0]} = ${w[1]}. ${w[3]}`});
   const cloze=gap(w[3],w[0]);
   if(cloze)cumulative.push({type:'choice',prompt:cloze,options:shuffle(options),answer:'v'+i,explanation:w[3]});
   if(level!=='support'){const tokens=w[3].replace(/[.?]/g,'').split(' ');cumulative.push({type:'order',prompt:'Build the sentence',clue:level==='stretch'?undefined:w[0],options:shuffle(tokens.map((text,n)=>({id:String(n),text}))),answer:tokens.map((_,n)=>String(n)).join(','),explanation:w[3]});}
  });
  for(let i=0;i<review.length;i+=3){const ids=[i,i+1,i+2];cumulative.push({type:'match',prompt:'Match the pairs',left:ids.map(j=>({id:String(j),text:review[j][0]})),right:shuffle(ids).map(j=>({id:'r'+j,text:level==='stretch'?review[j][2]:review[j][1]})),answer:ids.map(j=>`${j}:r${j}`).sort().join(','),explanation:ids.map(j=>`${review[j][0]} = ${review[j][1]}`).join(' · ')});}
  if(bank==='review')tasks.splice(0,tasks.length,...cumulative);else tasks.push(...cumulative);
 }
 // All teams see the same shuffled sequence. A complete cycle has no repeated task.
 const warmup=shuffle(tasks.filter(t=>t.type==='choice'&&t.picture)).slice(0,3);
 return [...warmup,...shuffle(tasks.filter(t=>!warmup.includes(t)))].map((t,i)=>({...t,id:String(i)}));
}
export function publicTask(task){const {answer,explanation,...safe}=task;return safe;}
export function isCorrect(task,answer){
 if(task.type!=='order')return String(answer)===task.answer;
 const ids=String(answer).split(',');if(ids.length!==task.options.length||new Set(ids).size!==ids.length)return false;
 const sentence=ids.map(id=>task.options.find(o=>o.id===id)?.text).join(' ');
 const expected=task.answer.split(',').map(id=>task.options.find(o=>o.id===id)?.text).join(' ');
 return sentence===expected;
}
