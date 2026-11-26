// Six challenge families. Each lap keeps the same task format for all rows.
const raw = {
identify:[
 ['brush','I clean teeth. What am I?','Name this object and say what you do with it.','Explain what you use this object for.','A toothbrush.','I use a toothbrush to brush my teeth.','toothbrush|toothpaste|floss'],
 ['paste','What goes on the toothbrush?','Name this and complete: I put…','Explain where you put this and what you do next.','Toothpaste.','I put toothpaste on my toothbrush and brush my teeth.','toothpaste|floss|braces'],
 ['floss','What goes between teeth?','Name this and say where it goes.','Describe what you do with this, using “between”.','Floss.','I use floss between my teeth.','floss|a toothbrush|an X-ray'],
 ['braces','What is on these teeth?','Name these and complete: The shark has…','Describe what you see and where it is.','Braces.','The shark has braces on its teeth.','braces|gums|a filling'],
 ['cavity','What is the dark hole called?','Complete: This tooth has…','Describe the problem in a complete sentence.','A cavity.','This tooth has a cavity.','a cavity|braces|floss'],
 ['xray','What is this picture called?','Name this and complete: The dentist takes…','Ask the dentist whether you need one of these.','An X-ray.','Do I need an X-ray?','an X-ray|a filling|toothpaste'],
 ['gums','What is the pink part called?','Complete: The pink tissue is…','Name the pink tissue around the teeth.','Gums.','The pink tissue around the teeth is the gums.','gums|teeth|braces'],
 ['filling','What repairs a hole in a tooth?','Complete: The dentist puts in…','Explain the difference between a cavity and this repair.','A filling.','A cavity is a hole in a tooth. A filling repairs it.','a filling|floss|braces']
],
riddle:[
 ['mystery','One tooth. Two…?','Complete: One tooth, many…','Correct this sentence and say why: I have two tooth.','Teeth.','I have two teeth. Teeth is the plural of tooth.','teeth|tooths|tooth'],
 ['mystery','My tooth hurts. I have a…','Give another way to say: My tooth hurts.','Tell the dentist about a toothache that started yesterday.','A toothache.','I have a toothache. It started yesterday.','toothache|toothbrush|cleaning'],
 ['mystery','Who checks your teeth?','Complete: I visit the… to check my teeth.','Explain why someone might visit a dentist.','A dentist.','I visit the dentist for a check-up.','dentist|teacher|patient'],
 ['mystery','I visit the dentist. Am I the patient or the dentist?','Describe your role when the dentist examines your teeth.','Use “patient” and “dentist” in one sentence.','The patient.','The dentist examines the patient’s teeth.','patient|dentist|teacher'],
 ['mystery','What do we call a visit to have our teeth cleaned?','Complete: I am here for a…','Tell the receptionist you have an appointment for a cleaning.','A cleaning.','I have an appointment for a cleaning.','cleaning|cavity|toothache'],
 ['mystery','The dentist needs to look inside. Open your…','Give the patient an instruction so you can see their teeth.','Give a polite instruction using “mouth”.','Mouth.','Open your mouth, please.','mouth|eyes|book'],
 ['mystery','Which tool removes decay: a drill or floss?','Name the tool: The dentist uses it to remove decay.','Explain what a dental drill does in the filling process.','A dental drill.','The dentist uses a dental drill to remove decay.','a dental drill|floss|braces'],
 ['mystery','Which action makes the filling smooth: polish or brush?','Complete: The dentist… the filling to make it smooth.','Explain what happens when the dentist polishes a filling.','Polish.','The dentist polishes the filling to make it smooth.','polish|brush|open']
],
fix:[
 ['tooth','One teeth. Say it correctly.','Correct: This is one teeth.','Correct the sentence and explain your change: This is one teeth.','One tooth.','This is one tooth. Tooth is singular.','one tooth|one teeth|one tooths'],
 ['teeth','Three tooth. Say it correctly.','Correct: The monster has three tooth.','Correct and explain: The monster has three tooth.','Three teeth.','The monster has three teeth. Teeth is plural.','three teeth|three tooth|three tooths'],
 ['brush','I brush my gums with floss. Say: I brush my…','Correct the tool: I brush my teeth with an X-ray.','Correct the sentence: I use an X-ray to brush my teeth.','I brush my teeth.','I brush my teeth with a toothbrush.','teeth|braces|X-ray'],
 ['floss','Floss goes on my hair. Where should it go?','Correct: I use floss in my ears.','Correct the sentence using “between”: I use floss in my ears.','Between my teeth.','I use floss between my teeth.','between my teeth|on my hair|in my ears'],
 ['pain','My tooth hurt. Say: My tooth…','Correct: My tooth hurt.','Correct and explain the verb: My tooth hurt.','My tooth hurts.','My tooth hurts. A singular subject takes hurts here.','hurts|hurt|hurting'],
 ['teeth','My teeth hurts. Say: My teeth…','Correct: My teeth hurts.','Correct and explain the verb: My teeth hurts.','My teeth hurt.','My teeth hurt. Teeth is plural.','hurt|hurts|hurting'],
 ['paste','I put toothpaste on my shoe. Where should it go?','Correct: I put toothpaste on my shoe.','Correct the sentence and add what you do next.','On my toothbrush.','I put toothpaste on my toothbrush. Then I brush my teeth.','on my toothbrush|on my shoe|on my book'],
 ['gums','The pink part is called teeth. Correct the name.','Correct: The pink tissue around my teeth is toothpaste.','Correct the statement and describe where the gums are.','Gums.','The gums are the pink tissue around my teeth.','gums|toothpaste|floss']
],
dialogue:[
 ['pain','Dentist: What hurts? Patient: My…','Dentist: What is the problem? Answer as the patient.','Your tooth has hurt since yesterday. Tell the dentist in two sentences.','My tooth hurts.','My tooth hurts. It started yesterday.','My tooth hurts.|I am a toothbrush.|These are gums.'],
 ['mouth','Dentist: Open your mouth, please. What do you open?','Give a polite instruction before examining the teeth.','Ask the patient politely to open their mouth a little wider.','My mouth.','Could you open your mouth a little wider, please?','my mouth|my bag|my eyes'],
 ['xray','Dentist: We will take an…','Complete the dentist’s line: We will take…','Ask a polite question to find out whether an X-ray is needed.','An X-ray.','Do I need an X-ray?','X-ray|toothbrush|floss'],
 ['cleaning','Receptionist: Why are you here? Patient: A…','Tell the receptionist you are here for a cleaning.','Greet the receptionist and explain that you have a cleaning appointment.','A cleaning.','Hello. I have an appointment for a cleaning.','cleaning|toothpaste|gum'],
 ['mystery','You did not hear. Say: Repeat that,…','Ask the dentist to repeat something politely.','You did not understand the dentist. Ask them to repeat and speak more slowly.','Please.','Could you repeat that and speak more slowly, please?','please|teeth|floss'],
 ['braces','Dentist: What is on your teeth? Patient:…','Answer the dentist: Do you have braces?','Answer “Do you have braces?” and add one detail about the picture.','Braces.','Yes, I have braces on my teeth.','braces|toothpaste|an X-ray'],
 ['brush','Dentist: What do you use to brush? Patient: A…','Answer: What do you use to brush your teeth?','Describe your brushing routine in two sentences.','A toothbrush.','I use a toothbrush and toothpaste. I brush my teeth in the morning.','toothbrush|drill|filling'],
 ['appointment','Receptionist: Your visit is at ten. Say: Thank…','The receptionist confirms your appointment. Respond politely.','Ask for an appointment. Then ask what time is available.','Thank you.','I would like an appointment, please. What time is available?','you|teeth|mouth']
],
describe:[
 ['braces','Shark has…?','Describe the shark using “has”.','Describe the shark’s teeth and ask him one question.','Braces.','The shark has braces. Do you use floss?','braces|a toothbrush|an X-ray'],
 ['cavity','Look at the tooth. It has a…','Describe the tooth in a sentence.','Describe what you can see without assuming whether it hurts.','A cavity.','I can see a cavity in the tooth.','cavity|toothbrush|cleaning'],
 ['brushing','What is the monster doing?','Complete: The monster is…','Describe the action and name the two things being used.','Brushing its teeth.','The monster is brushing its teeth with a toothbrush and toothpaste.','brushing|sleeping|eating'],
 ['floss','Point to the floss. Where does it go?','Use “between” to describe where the floss goes.','Explain the difference between brushing and flossing.','Between teeth.','A toothbrush brushes tooth surfaces. Floss goes between teeth.','between teeth|on hair|in ears'],
 ['xray','Finish: This is an…','Describe the picture using “X-ray” and “teeth”.','Pretend you are the dentist. Explain that you will take an X-ray.','An X-ray.','We will take an X-ray of your teeth.','X-ray|toothbrush|appointment'],
 ['paste','Name what is on the brush.','Say where the toothpaste is.','Describe the toothbrush and what is on it in a complete sentence.','Toothpaste.','There is toothpaste on the toothbrush.','toothpaste|floss|braces'],
 ['tooth','Is this one tooth or many teeth?','Describe the number using the correct word.','Make one sentence with “tooth” and another with “teeth”.','One tooth.','This is one tooth. The shark has many teeth.','one tooth|many teeth|one teeth'],
 ['filling','Name the repair on the tooth.','Complete: The tooth has a…','Explain which came first: the cavity or the filling.','A filling.','The tooth had a cavity before the dentist put in a filling.','filling|toothbrush|brace']
]
};
const trays=[['brush','paste','floss','xray'],['paste','floss','braces','tooth'],['xray','brush','braces','filling'],['floss','tooth','paste','cavity'],['braces','xray','gums','brush'],['filling','paste','tooth','floss'],['gums','cavity','xray','braces'],['tooth','filling','brush','paste']];
const labels={brush:'a toothbrush',paste:'toothpaste',floss:'floss',xray:'an X-ray',braces:'braces',tooth:'a tooth',filling:'a filling',cavity:'a cavity',gums:'gums'};
export const families=['identify','riddle','fix','dialogue','memory','describe'];
export const bank=Object.entries(raw).flatMap(([type,items])=>items.map((r,i)=>({id:`${type}-${i}`,type,visual:r[0],prompts:r.slice(1,4),short:r[4],model:r[5],options:r[6].split('|')}))).concat(trays.map((tray,i)=>({id:`memory-${i}`,type:'memory',visual:'tray',tray,missing:i%4,prompts:['What disappeared?','Say what is missing in a complete sentence.','Name the missing object and explain what it is used for.'],short:labels[tray[i%4]],model:`The missing item is ${labels[tray[i%4]]}.`,options:tray.map(x=>labels[x])})));
export function shuffle(list,rng=Math.random){const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
// Quick oral rounds: a clearly specified word, correction or short line, never a clinical justification.
const models={brush:'This is a toothbrush.',paste:'This is toothpaste.',floss:'This is floss.',braces:'These are braces.',cavity:'This is a cavity.',xray:'This is an X-ray.',gums:'These are gums.',filling:'This is a filling.'};
for(const q of bank){
 if(q.type==='identify'){q.prompts=[q.prompts[0],'Name what is shown in one short sentence.','Identify what is shown in one complete sentence.'];q.model=models[q.visual];}
 if(q.type==='riddle'){
  const n=Number(q.id.split('-')[1]);const prompts=['Complete: one tooth, two ___.','My tooth hurts. Name the problem with one word.','Who checks your teeth?','You are having your teeth checked. Are you the dentist or the patient?','Name the appointment for having your teeth cleaned.','Complete the instruction: Open your ___, please.','Name the tool the dentist uses to remove decay.','Which verb means to make a filling smooth: polish or brush?'];
  q.prompts=[prompts[n],prompts[n],prompts[n]];q.model=['Two teeth.','I have a toothache.','A dentist checks my teeth.','I am the patient.','I am here for a cleaning.','Open your mouth, please.','The dentist uses a dental drill.','Polish.'][n];
 }
 if(q.type==='fix'){q.prompts[2]=q.prompts[1];q.model=q.model.split('. ')[0]+'.';if(q.id==='fix-2'){q.prompts=['Name the tool: I brush my teeth with a ___.','Correct the tool: I brush my teeth with an X-ray.','Correct the tool: I brush my teeth with an X-ray.'];q.short='A toothbrush.';q.model='I brush my teeth with a toothbrush.';q.options=['a toothbrush','an X-ray','braces'];}}
 if(q.type==='dialogue'){
  const n=Number(q.id.split('-')[1]);const prompts=['Dentist: What hurts? Answer using “tooth”.','Ask the patient to open their mouth. Add “please”.','Complete: We will take an ___.','Tell the receptionist: I am here for a ___. You want your teeth cleaned.','You did not hear. Ask the dentist to repeat.','Dentist: Do you have braces? Answer yes in a sentence.','Dentist: What do you use to brush your teeth?','The receptionist helped you. Thank them.'];
  q.prompts[1]=prompts[n];q.prompts[2]=prompts[n];if(n===3)q.prompts[0]='You want your teeth cleaned. I am here for a ___.';q.model=['My tooth hurts.','Open your mouth, please.','We will take an X-ray.','I am here for a cleaning.','Could you repeat that, please?','Yes, I have braces.','I use a toothbrush.','Thank you.'][n];
 }
 if(q.type==='describe'){
  const n=Number(q.id.split('-')[1]);const prompts=['Complete: The shark has ___ on its teeth.','Complete: The tooth has a ___.','Complete: The monster is ___ its teeth.','Complete: Floss goes ___ the teeth.','Complete: This picture is an ___.','Complete: There is ___ on the toothbrush.','Choose the correct phrase: one tooth or one teeth?','Complete: The repair is called a ___.'];
  q.prompts=[prompts[n],prompts[n],prompts[n]];q.model=['The shark has braces on its teeth.','The tooth has a cavity.','The monster is brushing its teeth.','Floss goes between the teeth.','This picture is an X-ray.','There is toothpaste on the toothbrush.','One tooth.','The repair is called a filling.'][n];
 }
 if(q.type==='memory')q.prompts=['What disappeared?','Name the missing object.','Say what is missing in one short sentence.'];
 q.accept='Acepta la palabra objetivo o una frase equivalente. No exijas que coincida literalmente con el ejemplo.';
 if(q.id==='dialogue-4')q.accept='Válidas: “Could you repeat that?”, “Say that again, please”, “Can you repeat, please?” y equivalentes.';
 if(q.id==='riddle-7')q.accept='La tarea pide el verbo: polish / polishing / the dentist polishes it. No pide explicar el motivo del tratamiento.';
}
// Keep old IDs valid for saved games, but tag the actual target vocabulary so
// different prompts about the same word do not count as vocabulary variety.
const oldTopics={
 identify:['toothbrush','toothpaste','floss','braces','cavity','xray','gums','filling'],
 riddle:['teeth','toothache','dentist','patient','cleaning','mouth','drill','polish'],
 fix:['teeth','teeth','toothbrush','floss','toothache','toothache','toothpaste','gums'],
 dialogue:['toothache','mouth','xray','cleaning','repeat','braces','toothbrush','thanks'],
 describe:['braces','cavity','brushing','floss','xray','toothpaste','teeth','filling']
};
const visualTopics={brush:'toothbrush',paste:'toothpaste',tooth:'teeth'};
for(const q of bank) q.topic=q.type==='memory'?(visualTopics[q.tray[q.missing]]||q.tray[q.missing]):oldTopics[q.type][Number(q.id.split('-')[1])];

// Clinic language transferred to a dental visit. No medical diagnosis required.
// Each entry has a focused target, rather than an open-ended clinical question.
const clinic={
 riddle:[
  ['appointment','You book a visit for Tuesday at ten. What is that scheduled visit called?','An appointment.','I have an appointment.','appointment|prescription|symptom'],
  ['waiting-room','You sit here until the dentist calls you. Name the room.','The waiting room.','I am in the waiting room.','waiting room|bathroom|classroom'],
  ['receptionist','Who welcomes patients and books appointments at the front desk?','The receptionist.','The receptionist books appointments.','receptionist|patient|chef'],
  ['medical-history','Past illnesses, operations and allergies go in this record. Medical ___?','Medical history.','This is my medical history.','history|appointment|uniform'],
  ['symptoms','Pain and swelling are signs of a problem. These are called ___ (starts with S).','Symptoms.','These are my symptoms.','symptoms|appointments|fillings'],
  ['prescription','The dentist writes an order for medicine. What is this document called?','A prescription.','The dentist writes a prescription.','prescription|receipt|appointment'],
  ['check-up','A routine visit to check that your teeth are healthy is a check-___.','A check-up.','I am here for a check-up.','up|out|in'],
  ['pharmacy','Where do you take a prescription to buy medicine?','A pharmacy.','I buy medicine at the pharmacy.','pharmacy|bakery|waiting room']
 ],
 fix:[
  ['appointment','Correct the last word: I have a dental sandwich at ten.','Appointment.','I have a dental appointment at ten.','appointment|toothpaste|receipt'],
  ['waiting-room','Correct the room: Patients wait for the dentist in the kitchen.','Waiting room.','Patients wait in the waiting room.','waiting room|kitchen|laboratory'],
  ['patient','Correct the role: The person receiving dental care is the receptionist.','Patient.','The person receiving dental care is the patient.','patient|receptionist|dentist'],
  ['medical-history','Correct the last word: The form asks about my medical homework.','History.','The form asks about my medical history.','history|homework|menu'],
  ['prescription','Correct the document: I take my restaurant menu to the pharmacy to get the medicine ordered by my dentist.','Prescription.','I take my prescription to the pharmacy.','prescription|menu|X-ray'],
  ['swollen','Choose the adjective: My cheek is swelling / swollen.','Swollen.','My cheek is swollen.','swollen|swelling|swell'],
  ['bleeding','Choose the verb: My gums are bleeding / booking.','Bleeding.','My gums are bleeding.','bleeding|booking|waiting'],
  ['allergic','Choose the adjective: I am allergy / allergic to this medicine.','Allergic.','I am allergic to this medicine.','allergic|allergy|appointment']
 ],
 dialogue:[
  ['book','You want to arrange a dental visit. Complete: I would like to ___ an appointment.','Book.','I would like to book an appointment.','book|brush|bleed'],
  ['cancel','You cannot attend and do not want another date. Complete: I need to ___ my appointment.','Cancel.','I need to cancel my appointment.','cancel|book|wait'],
  ['reschedule','You want the same visit on a different day. Complete: Can I ___ my appointment?','Reschedule.','Can I reschedule my appointment?','reschedule|cancel|brush'],
  ['fill-out','The receptionist gives you a blank form. Complete: Please ___ out this form.','Fill.','Please fill out this form.','fill|fall|feel'],
  ['allergies','The form asks what medicines cause an allergic reaction. Complete the heading: Medicine ___.','Allergies.','These are my medicine allergies.','allergies|appointments|receipts'],
  ['numb','After the injection, you cannot feel your lip. Complete: My lip feels ___.','Numb.','My lip feels numb.','numb|late|hungry'],
  ['rinse','The dentist gives you water to wash the inside of your mouth. Complete: ___ your mouth, please.','Rinse.','Rinse your mouth, please.','Rinse|Book|Fill'],
  ['spit','After rinsing, let the water out into the basin. Complete: ___ it out, please.','Spit.','Spit it out, please.','Spit|Swallow|Book']
 ],
 describe:[
  ['sensitive','Cold water makes your teeth hurt. Complete: My teeth are ___.','Sensitive.','My teeth are sensitive.','sensitive|hungry|late'],
  ['swollen','Your cheek looks much bigger than usual. Complete: My cheek is ___.','Swollen.','My cheek is swollen.','swollen|empty|numb'],
  ['bleeding','You notice blood when brushing. Complete: My gums are ___.','Bleeding.','My gums are bleeding.','bleeding|waiting|booking'],
  ['pain','Complete the question about discomfort: Where is the ___? It starts with P.','Pain.','Where is the pain?','pain|patient|pharmacy'],
  ['treatment','The dentist explains the care you will receive. Complete: This is your ___ plan. It starts with T.','Treatment.','This is your treatment plan.','treatment|toothpaste|timetable'],
  ['follow-up','A return visit to check how you are doing is a follow-___ appointment.','Follow-up.','I have a follow-up appointment.','up|out|off'],
  ['insurance','A form asks about the company that helps pay for dental care. Dental ___?','Insurance.','I have dental insurance.','insurance|history|symptoms'],
  ['receipt','You have paid for your visit. Name the document showing that you paid.','A receipt.','Can I have a receipt, please?','receipt|prescription|medical history']
 ]
};
for(const [type,items] of Object.entries(clinic)) for(const [topic,prompt,short,model,choices] of items){
 bank.push({id:`${type}-clinic-${topic}`,type,topic,visual:'mystery',prompts:[prompt,prompt,`${prompt} Say the complete sentence.`],short,model,options:choices.split('|'),accept:'Acepta la palabra objetivo y equivalentes que encajen con la pista. En tercero pide la frase completa; no exijas copiar el modelo literalmente.'});
}

const extraObjects=[
 ['mask','A mask.','This is a mask.','mask|glove|form'],
 ['gloves','A glove.','This is a glove.','glove|mask|thermometer'],
 ['thermometer','A thermometer.','This is a thermometer.','thermometer|toothbrush|drill'],
 ['form','A form.','This is a form.','form|mask|X-ray']
];
for(const [visual,short,model,options] of extraObjects){
 bank.push({id:`identify-clinic-${visual}`,type:'identify',topic:visual,visual,prompts:['Name this object.','Name this object in a short sentence.','Identify this object in a complete sentence.'],short,model,options:options.split('|'),accept:'Acepta el nombre del objeto; mask / face mask / surgical mask son válidos. Para la hoja: form / medical form / questionnaire.'});
 bank[bank.length-1].accept=({mask:'Acepta mask, face mask o surgical mask.',gloves:'Acepta glove o medical glove; se muestra un solo guante.',thermometer:'Acepta thermometer o una frase que lo nombre.',form:'Acepta form, medical form o questionnaire.'})[visual];
 labels[visual]=short.toLowerCase().replace(/\.$/,'');
}
const clinicTrays=[['mask','brush','form','thermometer'],['paste','gloves','xray','form'],['floss','braces','thermometer','mask'],['gloves','filling','paste','form']];
for(const [i,tray] of clinicTrays.entries())bank.push({id:`memory-clinic-${i}`,type:'memory',topic:tray[i],visual:'tray',tray,missing:i,prompts:['What disappeared?','Name the missing object.','Say what is missing in one short sentence.'],short:labels[tray[i]],model:`The missing item is ${labels[tray[i]]}.`,options:tray.map(v=>labels[v]),accept:'Acepta el nombre del objeto o una frase equivalente.'});

// Retain IDs solely to let an existing saved game finish safely.
const retired=new Set(['dialogue-4','dialogue-7','dialogue-clinic-spit','dialogue-clinic-allergies','fix-clinic-allergic']);
for(const q of bank)q.retired=retired.has(q.id);
const situations=[
 ['appointment','The receptionist offers Monday at nine or Tuesday at ten. Choose one and ask for an appointment.','I would like an appointment on Tuesday at ten.','Acepta cualquiera de las dos opciones con appointment y día/hora.'],
 ['waiting-room','A new patient asks where to wait. Tell them to sit in the waiting room.','Please sit in the waiting room.','Acepta instrucciones equivalentes que incluyan waiting room.'],
 ['medical-history','You are the receptionist. Ask the patient to complete the medical history form.','Please fill out your medical history form.','Acepta fill in / complete / fill out y medical history.'],
 ['patient','Complete with two different people: The ___ checks the teeth of the ___.','The dentist checks the teeth of the patient.','Dentist y patient en ese orden.'],
 ['toothache','You are the patient. Tell the dentist that your tooth hurts and that it started yesterday.','My tooth hurts. It started yesterday.','Acepta I have a toothache y una referencia a yesterday.'],
 ['prescription','The dentist gives you a prescription. Tell your friend where you will take it.','I will take it to the pharmacy.','Acepta pharmacy / drugstore en una frase.'],
 ['reschedule','Your appointment is on Monday, but you can only come on Friday. Ask to move it.','Can I reschedule my appointment for Friday?','Acepta change / move / reschedule con Friday.'],
 ['check-up','There is no problem with your teeth. You are visiting for a routine check. Tell the receptionist why you are here.','I am here for a check-up.','Acepta dental check-up / routine check.'],
 ['toothbrush','Pack two things to brush your teeth. Name both.','A toothbrush and toothpaste.','Ambos objetos; acepta frase equivalente.'],
 ['floss','The toothbrush cannot reach between two teeth. Name the item for cleaning between them.','I use floss.','Acepta floss / dental floss.'],
 ['xray','You are the dentist. Tell the patient you will take a picture of their teeth using an X-ray.','We will take an X-ray of your teeth.','Acepta frase equivalente con X-ray.'],
 ['cleaning','You booked a visit to have your teeth cleaned. Tell the receptionist what you are here for.','I am here for a cleaning.','Acepta cleaning / dental cleaning.'],
 ['braces','Tell the dentist: you have braces, but you do not have a toothache.','I have braces, but I do not have a toothache.','Acepta dos frases cortas con ambos datos.'],
 ['teeth','Finish both: one ___, four ___.','One tooth, four teeth.','Tooth y teeth en ese orden.'],
 ['receipt','You have just paid at reception and want proof of payment. Ask for it.','Can I have a receipt, please?','Acepta petición con receipt.'],
 ['cancel','You will not attend your appointment and do not want another date. Tell reception what you need to do.','I need to cancel my appointment.','Acepta cancel y appointment en una frase.'],
 ['form','The receptionist hands you a blank form. Tell your partner what you need to do with it.','I need to fill out the form.','Acepta complete / fill in / fill out the form.'],
 ['gums','Name both: the white parts you brush and the pink tissue around them.','Teeth and gums.','Teeth y gums; acepta frase equivalente.'],
 ['cavity','Name the problem and the repair: a hole in a tooth, then the material used to repair it.','A cavity and a filling.','Cavity y filling en ese orden.'],
 ['symptoms','You are at reception. Say two symptoms: your tooth hurts and your cheek is swollen.','I have a toothache and my cheek is swollen.','Acepta my tooth hurts y swollen cheek en frases equivalentes.']
];
for(const [i,[topic,prompt,model,accept]] of situations.entries())bank.push({id:`dialogue-situation-${i}`,type:'dialogue',topic,visual:'mystery',prompts:[prompt,prompt,prompt],short:model,model,accept,options:[],noOptions:true});

// Three visual games with known, illustrated objects: missing item, swapped
// positions and a hidden tray where the player recalls a numbered position.
const objects=['brush','paste','floss','xray','braces','tooth','filling','cavity','gums','mask','gloves','thermometer','form'];
for(let i=0;i<72;i++){
 const tray=Array.from({length:4},(_,n)=>objects[(i*3+n*2)%objects.length]);
 const mode=['missing','swap','position'][i%3],missing=Math.floor(i/3)%4,other=(missing+1+Math.floor(i/12)%3)%4;
 const target=labels[tray[missing]],second=labels[tray[other]];
 const prompt=mode==='swap'?'Two objects changed places. Name both.':mode==='position'?`The objects are hidden. What was in position ${missing+1}, from left to right?`:'Which object disappeared?';
 const answer=mode==='swap'?`${target} and ${second}`:target;
 bank.push({id:`memory-visual-${i}`,type:'memory',topic:mode==='swap'?`${tray[missing]}+${tray[other]}`:(visualTopics[tray[missing]]||tray[missing]),visual:'tray',tray,missing,other,memoryMode:mode,prompts:[prompt,prompt,prompt],short:answer,model:mode==='swap'?`${answer} changed places.`:mode==='position'?`In position ${missing+1}, there was ${target}.`:`The missing item is ${target}.`,options:[],accept:mode==='swap'?'Debe nombrar ambos objetos; cualquier orden es válido.':'Acepta el nombre del objeto o una frase equivalente.'});
}

export function makeDeck(rows,rounds,rng=Math.random,previous=[]){
 const pools=Object.fromEntries(families.map(f=>[f,shuffle(bank.filter(q=>q.type===f&&!q.retired),rng)]));
 const seen=new Set(previous);
 const result=[],uses=new Map(),recent=[];
 let lastFamily='';
 for(let r=0;r<rounds;r++){
  const fresh=families.filter(f=>pools[f].filter(q=>!seen.has(q.id)).length>=rows&&f!==lastFamily);
  const available=fresh.length?fresh:families.filter(f=>pools[f].length>=rows&&f!==lastFamily);
  const choices=available.flatMap(f=>f==='memory'?[f,f,f]:[f]);
  const family=choices[Math.floor(rng()*choices.length)]||families.find(f=>pools[f].length);
  lastFamily=family;
  for(let i=0;i<rows;i++){
  let pool=pools[family];
  if(!pool.length)pool=Object.values(pools).find(p=>p.length);
  if(!pool)throw Error('Not enough challenges');
  // Shuffled ties remain random; prefer vocabulary not yet used in this game,
  // then avoid the last four targets. Never repeat a challenge ID.
  const cost=q=>(seen.has(q.id)?1000:0)+(uses.get(q.topic)||0)*10+(recent.includes(q.topic)?5:0);
  let best=0;for(let n=1;n<pool.length;n++)if(cost(pool[n])<cost(pool[best]))best=n;
  const [q]=pool.splice(best,1);result.push(q.id);
  uses.set(q.topic,(uses.get(q.topic)||0)+1);recent.push(q.topic);if(recent.length>4)recent.shift();
 }}
 return result;
}
