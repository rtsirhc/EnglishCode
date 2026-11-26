// All artwork and audio are generated locally. No asset downloads.
const spookyIcons = {
 ghost:'<path d="M34 102V52a30 30 0 0 1 60 0v50l-12-9-12 9-12-9-12 9-12-9Z" fill="#faf3db" stroke="#9273ab" stroke-width="2"/><ellipse cx="54" cy="54" rx="5" ry="8"/><ellipse cx="77" cy="54" rx="5" ry="8"/><ellipse cx="65" cy="77" rx="7" ry="9"/>',
 pumpkin:'<path d="M65 32q-6-19 11-23" fill="none" stroke="#a3e46b" stroke-width="9"/><ellipse cx="64" cy="72" rx="47" ry="37" fill="#fc8a29"/><ellipse cx="64" cy="72" rx="24" ry="37" fill="none" stroke="#cc4d23" stroke-width="3"/><path d="m37 65 12-15 9 17m13 0 10-17 12 15M38 81l14 9 12-7 11 8 16-12" fill="#20172e" stroke="#20172e" stroke-width="4"/>',
 bat:'<path d="M61 58 53 40 48 58Q25 37 7 40q8 21 2 40 17-7 24 10 14-6 25 6h12q13-12 25-6 7-17 24-10-6-19 2-40-22-3-43 18l-4-18-8 18Z" fill="#ae88ec"/><circle cx="59" cy="68" r="3" fill="#fff3c4"/><circle cx="71" cy="68" r="3" fill="#fff3c4"/>',
 spider:'<g fill="none" stroke="#ba93ed" stroke-width="5"><path d="M51 57 28 36 12 50m40 34-12 20-18 4m54-24 12 20 18 4m39 16L23 60 8 76m44 0L26 90l-3 19m53-52 23-21 16 14M77 66l28-6 15 16M76 76l26 14 3 19"/></g><ellipse cx="64" cy="70" rx="22" ry="28" fill="#ba93ed"/><circle cx="56" cy="62" r="4"/><circle cx="73" cy="62" r="4"/>',
 candy:'<path d="m38 44-25-9 3 35 25 3m49-22 24-8-2 35-25-4" fill="#b7e879"/><rect x="32" y="39" width="64" height="48" rx="15" fill="#fb8b93" transform="rotate(15 64 64)"/><path d="m53 39 17 49m-2-43 15 42" stroke="#fff0cf" stroke-width="8"/>',
 witch:'<path d="m30 83 33-69 30 69Z" fill="#ac85e6"/><path d="m40 64 45 5-4 14-48-4Z" fill="#ff963c"/><ellipse cx="64" cy="87" rx="53" ry="11" fill="#ac85e6"/>',
 moon:'<path d="M88 17A49 49 0 1 0 110 91 48 48 0 0 1 88 17Z" fill="#ffe5a0"/><path d="m96 24 4 11 12 1-9 7 3 12-10-7-10 7 3-12-9-7 12-1Z" fill="#b4e47b"/>',
 cat:'<path d="M33 45 30 15l25 20h19l25-20-4 33q17 49-32 55-48-7-30-58Z" fill="#29202f" stroke="#b58cdc" stroke-width="3"/><path d="m41 57 17 4m14 0 17-4" stroke="#d7fc81" stroke-width="6"/><path d="m59 75 6 5 6-5m-6 5v9" fill="none" stroke="#20172e" stroke-width="3"/>',
};
Object.assign(spookyIcons, {
 broom:'<path d="m83 14-35 65" stroke="#c99c62" stroke-width="8"/><path d="m39 72 27 13-9 32-45-25Z" fill="#ffc15b"/><path d="m43 82-16 22m25-17-13 23" stroke="#a16538" stroke-width="3"/>',
 mask:'<path d="M13 42q23-20 51 0 28-20 51 0l-8 37q-27 21-43-4-16 25-43 4Z" fill="#b78ee6"/><ellipse cx="40" cy="56" rx="13" ry="8"/><ellipse cx="87" cy="56" rx="13" ry="8"/><path d="m14 48-9 22m110-22 9 22" stroke="#ffbf62" stroke-width="4"/>',
 house:'<path d="m15 58 49-40 49 40-13 0v53H28V58Z" fill="#b38bd8"/><path d="m23 35 12-15 12 15v11H23Z" fill="#b38bd8"/><path d="M55 110V80h20v30M40 58h13v15H40m37-15h13v15H77" fill="#ffb858"/><path d="m64 18 8-12 8 24" fill="#b38bd8"/>',
 web:'<g fill="none" stroke="#9273ab" stroke-width="3"><path d="M64 9v110M9 64h110M23 23l82 82M23 105l82-82"/><path d="M64 22q12 16 30 8-7 19 12 34-19 12-12 30-18-7-30 12-12-19-30-12 7-18-12-30 19-15 12-34 18 8 30-8Z"/><path d="M64 43q7 9 15 6-4 9 7 15-11 6-7 15-8-3-15 7-7-10-15-7 4-9-7-15 11-6 7-15 8 3 15-6Z"/></g>',
 costume:'<path d="m44 26 20 13 20-13 30 75-50-17-50 17Z" fill="#a675d4"/><path d="m44 26 20 13-15 15m35-28L64 39l15 15" fill="#fb915c"/><circle cx="64" cy="53" r="5" fill="#ffd471"/>',
});
function spookyArt(key) { return '<svg viewBox="0 0 128 128" role="img" aria-label="Halloween illustration">'+(spookyIcons[key] || spookyIcons.ghost)+'</svg>'; }
const halloweenWords = [
 ['pumpkin','calabaza','pumpkin','A pumpkin is orange.','A pumpkin is a black animal.','A1'],
 ['ghost','fantasma','ghost','A ghost says boo.','A ghost is a sweet to eat.','A1'],
 ['bat','murciélago','bat','A bat can fly.','A bat is a round orange vegetable.','A1'],
 ['spider','araña','spider','A spider has eight legs.','A spider has two legs.','A1'],
 ['candy','dulces','candy','Candy tastes sweet.','Candy is a flying animal.','A1'],
 ['witch','bruja','witch','A witch can wear a pointed hat.','A witch is a piece of candy.','A1'],
 ['moon','luna','moon','We can see the moon in the night sky.','The moon is a type of cake.','A1'],
 ['black cat','gato negro','cat','A black cat is an animal.','A black cat has eight legs.','A1'],
 ['costume','disfraz','costume','You wear a costume for Halloween.','You eat a costume for dessert.','A2'],
 ['broom','escoba','broom','You can sweep the floor with a broom.','A broom is a sweet drink.','A2'],
 ['web','telaraña','web','A spider makes a web.','A web is a pair of shoes.','A2'],
 ['trick or treat','dulce o truco','candy','Children say trick or treat to ask for candy.','Trick or treat means good morning.','A2'],
 ['scary','que da miedo','ghost','Scary means frightening.','Scary means delicious.','A2'],
 ['mask','máscara','mask','You wear a mask on your face.','You wear a mask on your feet.','A2'],
 ['haunted house','casa embrujada','house','In stories, ghosts live in a haunted house.','A haunted house is a type of sandwich.','A2'],
 ['night','noche','moon','Night is the dark part of the day.','Night means a small orange vegetable.','A2']
];
window.HALLOWEEN_QUESTIONS = halloweenWords.flatMap(([word, spanish, art, yes, no, level], i) => [true,false].map((correct,j) => ({
 id:300+i*2+j, topic:'halloween',level,sentence:correct?yes:no,status:correct?'LEGAL':'ILLEGAL',
 correction:yes,explanation:word+' = '+spanish+'. '+yes,example:'Halloween word: '+word+'.',art,word
})));
// Simple Halloween vocabulary with progressively more demanding language structures.
window.HALLOWEEN_QUESTIONS.push(...[
  {
    "id": 400,
    "topic": "halloween",
    "level": "B1",
    "art": "costume",
    "sentence": "Although her costume looked scary, the children were not afraid.",
    "status": "LEGAL",
    "correction": "Although her costume looked scary, the children were not afraid.",
    "explanation": "Use although without but in the same clause pair.",
    "example": "Although the mask was scary, we laughed."
  },
  {
    "id": 401,
    "topic": "halloween",
    "level": "B1",
    "art": "costume",
    "sentence": "Although her costume looked scary, but the children were not afraid.",
    "status": "ILLEGAL",
    "correction": "Although her costume looked scary, the children were not afraid.",
    "explanation": "Use although without but in the same clause pair.",
    "example": "Although the mask was scary, we laughed."
  },
  {
    "id": 402,
    "topic": "halloween",
    "level": "B1",
    "art": "pumpkin",
    "sentence": "We carved a face into the pumpkin before putting a candle inside.",
    "status": "LEGAL",
    "correction": "We carved a face into the pumpkin before putting a candle inside.",
    "explanation": "After the preposition before, use a noun or an -ing form: before putting.",
    "example": "Wash the pumpkin before carving it."
  },
  {
    "id": 403,
    "topic": "halloween",
    "level": "B1",
    "art": "pumpkin",
    "sentence": "We carved a face into the pumpkin before put a candle inside.",
    "status": "ILLEGAL",
    "correction": "We carved a face into the pumpkin before putting a candle inside.",
    "explanation": "After the preposition before, use a noun or an -ing form: before putting.",
    "example": "Wash the pumpkin before carving it."
  },
  {
    "id": 404,
    "topic": "halloween",
    "level": "B1",
    "art": "house",
    "sentence": "The haunted house was decorated with paper ghosts.",
    "status": "LEGAL",
    "correction": "The haunted house was decorated with paper ghosts.",
    "explanation": "The passive uses was or were plus the past participle: decorated.",
    "example": "The room was decorated with bats."
  },
  {
    "id": 405,
    "topic": "halloween",
    "level": "B1",
    "art": "house",
    "sentence": "The haunted house was decorate with paper ghosts.",
    "status": "ILLEGAL",
    "correction": "The haunted house was decorated with paper ghosts.",
    "explanation": "The passive uses was or were plus the past participle: decorated.",
    "example": "The room was decorated with bats."
  },
  {
    "id": 406,
    "topic": "halloween",
    "level": "B1",
    "art": "candy",
    "sentence": "If it rains tonight, we will give out candy indoors.",
    "status": "LEGAL",
    "correction": "If it rains tonight, we will give out candy indoors.",
    "explanation": "For this future condition, use present simple after if and will in the result.",
    "example": "If it rains, we will stay inside."
  },
  {
    "id": 407,
    "topic": "halloween",
    "level": "B1",
    "art": "candy",
    "sentence": "If it will rain tonight, we will give out candy indoors.",
    "status": "ILLEGAL",
    "correction": "If it rains tonight, we will give out candy indoors.",
    "explanation": "For this future condition, use present simple after if and will in the result.",
    "example": "If it rains, we will stay inside."
  },
  {
    "id": 408,
    "topic": "halloween",
    "level": "B1",
    "art": "mask",
    "sentence": "This is the mask that I bought for the party.",
    "status": "LEGAL",
    "correction": "This is the mask that I bought for the party.",
    "explanation": "Use that or which for a thing. Who refers to a person.",
    "example": "This is the costume that I made."
  },
  {
    "id": 409,
    "topic": "halloween",
    "level": "B1",
    "art": "mask",
    "sentence": "This is the mask who I bought for the party.",
    "status": "ILLEGAL",
    "correction": "This is the mask that I bought for the party.",
    "explanation": "Use that or which for a thing. Who refers to a person.",
    "example": "This is the costume that I made."
  },
  {
    "id": 410,
    "topic": "halloween",
    "level": "B1",
    "art": "ghost",
    "sentence": "I have never seen a ghost, but I enjoy ghost stories.",
    "status": "LEGAL",
    "correction": "I have never seen a ghost, but I enjoy ghost stories.",
    "explanation": "Present perfect uses have plus the past participle: seen, not saw.",
    "example": "Have you ever seen a bat?"
  },
  {
    "id": 411,
    "topic": "halloween",
    "level": "B1",
    "art": "ghost",
    "sentence": "I have never saw a ghost, but I enjoy ghost stories.",
    "status": "ILLEGAL",
    "correction": "I have never seen a ghost, but I enjoy ghost stories.",
    "explanation": "Present perfect uses have plus the past participle: seen, not saw.",
    "example": "Have you ever seen a bat?"
  },
  {
    "id": 412,
    "topic": "halloween",
    "level": "B1",
    "art": "witch",
    "sentence": "She suggested wearing witch hats to the party.",
    "status": "LEGAL",
    "correction": "She suggested wearing witch hats to the party.",
    "explanation": "Suggest can be followed by an -ing form: suggested wearing.",
    "example": "He suggested making paper bats."
  },
  {
    "id": 413,
    "topic": "halloween",
    "level": "B1",
    "art": "witch",
    "sentence": "She suggested to wear witch hats to the party.",
    "status": "ILLEGAL",
    "correction": "She suggested wearing witch hats to the party.",
    "explanation": "Suggest can be followed by an -ing form: suggested wearing.",
    "example": "He suggested making paper bats."
  },
  {
    "id": 414,
    "topic": "halloween",
    "level": "B1",
    "art": "bat",
    "sentence": "There were fewer bats in the cave than we expected.",
    "status": "LEGAL",
    "correction": "There were fewer bats in the cave than we expected.",
    "explanation": "In standard classroom English, use fewer with plural countable nouns such as bats.",
    "example": "There were fewer costumes this year."
  },
  {
    "id": 415,
    "topic": "halloween",
    "level": "B1",
    "art": "bat",
    "sentence": "There were less bats in the cave than we expected.",
    "status": "ILLEGAL",
    "correction": "There were fewer bats in the cave than we expected.",
    "explanation": "In standard classroom English, use fewer with plural countable nouns such as bats.",
    "example": "There were fewer costumes this year."
  },
  {
    "id": 416,
    "topic": "halloween",
    "level": "B2",
    "art": "house",
    "sentence": "Had we known the house was empty, we would not have knocked.",
    "status": "LEGAL",
    "correction": "Had we known the house was empty, we would not have knocked.",
    "explanation": "In an inverted third conditional, use had plus the past participle: known.",
    "example": "Had I known, I would have brought a torch."
  },
  {
    "id": 417,
    "topic": "halloween",
    "level": "B2",
    "art": "house",
    "sentence": "Had we knew the house was empty, we would not have knocked.",
    "status": "ILLEGAL",
    "correction": "Had we known the house was empty, we would not have knocked.",
    "explanation": "In an inverted third conditional, use had plus the past participle: known.",
    "example": "Had I known, I would have brought a torch."
  },
  {
    "id": 418,
    "topic": "halloween",
    "level": "B2",
    "art": "pumpkin",
    "sentence": "By the time the guests arrive, we will have carved all the pumpkins.",
    "status": "LEGAL",
    "correction": "By the time the guests arrive, we will have carved all the pumpkins.",
    "explanation": "Future perfect uses will have plus a past participle: carved.",
    "example": "By six, we will have finished our costumes."
  },
  {
    "id": 419,
    "topic": "halloween",
    "level": "B2",
    "art": "pumpkin",
    "sentence": "By the time the guests arrive, we will have carve all the pumpkins.",
    "status": "ILLEGAL",
    "correction": "By the time the guests arrive, we will have carved all the pumpkins.",
    "explanation": "Future perfect uses will have plus a past participle: carved.",
    "example": "By six, we will have finished our costumes."
  },
  {
    "id": 420,
    "topic": "halloween",
    "level": "B2",
    "art": "ghost",
    "sentence": "No sooner had the ghost appeared than everyone screamed.",
    "status": "LEGAL",
    "correction": "No sooner had the ghost appeared than everyone screamed.",
    "explanation": "The fixed pair is no sooner ... than. Use inversion after no sooner at the start.",
    "example": "No sooner had we arrived than the lights went out."
  },
  {
    "id": 421,
    "topic": "halloween",
    "level": "B2",
    "art": "ghost",
    "sentence": "No sooner had the ghost appeared when everyone screamed.",
    "status": "ILLEGAL",
    "correction": "No sooner had the ghost appeared than everyone screamed.",
    "explanation": "The fixed pair is no sooner ... than. Use inversion after no sooner at the start.",
    "example": "No sooner had we arrived than the lights went out."
  },
  {
    "id": 422,
    "topic": "halloween",
    "level": "B2",
    "art": "costume",
    "sentence": "Despite being homemade, the costume looked very convincing.",
    "status": "LEGAL",
    "correction": "Despite being homemade, the costume looked very convincing.",
    "explanation": "Despite takes a noun or -ing form. Alternatively say although it was homemade.",
    "example": "Despite looking scary, the mask was funny."
  },
  {
    "id": 423,
    "topic": "halloween",
    "level": "B2",
    "art": "costume",
    "sentence": "Despite it was homemade, the costume looked very convincing.",
    "status": "ILLEGAL",
    "correction": "Despite being homemade, the costume looked very convincing.",
    "explanation": "Despite takes a noun or -ing form. Alternatively say although it was homemade.",
    "example": "Despite looking scary, the mask was funny."
  },
  {
    "id": 424,
    "topic": "halloween",
    "level": "B2",
    "art": "mask",
    "sentence": "The mask was so realistic that I mistook my friend for a stranger.",
    "status": "LEGAL",
    "correction": "The mask was so realistic that I mistook my friend for a stranger.",
    "explanation": "The expression is mistake someone for someone else.",
    "example": "I mistook the decoration for a real spider."
  },
  {
    "id": 425,
    "topic": "halloween",
    "level": "B2",
    "art": "mask",
    "sentence": "The mask was so realistic that I mistook my friend as a stranger.",
    "status": "ILLEGAL",
    "correction": "The mask was so realistic that I mistook my friend for a stranger.",
    "explanation": "The expression is mistake someone for someone else.",
    "example": "I mistook the decoration for a real spider."
  },
  {
    "id": 426,
    "topic": "halloween",
    "level": "B2",
    "art": "witch",
    "sentence": "The organizer insisted that everyone wear a costume.",
    "status": "LEGAL",
    "correction": "The organizer insisted that everyone wear a costume.",
    "explanation": "After insisted that, use a clause: everyone wear or everyone should wear, not everyone to wear.",
    "example": "She insisted that we bring our own masks."
  },
  {
    "id": 427,
    "topic": "halloween",
    "level": "B2",
    "art": "witch",
    "sentence": "The organizer insisted that everyone to wear a costume.",
    "status": "ILLEGAL",
    "correction": "The organizer insisted that everyone wear a costume.",
    "explanation": "After insisted that, use a clause: everyone wear or everyone should wear, not everyone to wear.",
    "example": "She insisted that we bring our own masks."
  },
  {
    "id": 428,
    "topic": "halloween",
    "level": "B2",
    "art": "candy",
    "sentence": "We would have brought more candy if we had expected so many visitors.",
    "status": "LEGAL",
    "correction": "We would have brought more candy if we had expected so many visitors.",
    "explanation": "An unreal past condition uses if plus past perfect: had expected.",
    "example": "If we had known, we would have bought more candy."
  },
  {
    "id": 429,
    "topic": "halloween",
    "level": "B2",
    "art": "candy",
    "sentence": "We would have brought more candy if we have expected so many visitors.",
    "status": "ILLEGAL",
    "correction": "We would have brought more candy if we had expected so many visitors.",
    "explanation": "An unreal past condition uses if plus past perfect: had expected.",
    "example": "If we had known, we would have bought more candy."
  },
  {
    "id": 430,
    "topic": "halloween",
    "level": "B2",
    "art": "moon",
    "sentence": "Not until the moon appeared did we leave the haunted house.",
    "status": "LEGAL",
    "correction": "Not until the moon appeared did we leave the haunted house.",
    "explanation": "After not until at the start, invert the subject and auxiliary in the main clause: did we leave.",
    "example": "Not until midnight did the party end."
  },
  {
    "id": 431,
    "topic": "halloween",
    "level": "B2",
    "art": "moon",
    "sentence": "Not until the moon appeared we did leave the haunted house.",
    "status": "ILLEGAL",
    "correction": "Not until the moon appeared did we leave the haunted house.",
    "explanation": "After not until at the start, invert the subject and auxiliary in the main clause: did we leave.",
    "example": "Not until midnight did the party end."
  }
]);
let spookySoundEnabled = false;
function spookyTone(kind) {
 if (!spookySoundEnabled || !(window.AudioContext || window.webkitAudioContext)) return;
 try {
 const ctx = ensureAudio(); ctx.resume();
 const notes = kind==='start'?[261.63,311.13,369.99,523.25]:kind==='correct'?[523.25,659.25,1046.5]:[220,185,130.81];
 notes.forEach((note,i)=>{const osc=ctx.createOscillator(),gain=ctx.createGain(),time=ctx.currentTime+i*.13;
 osc.type='triangle';osc.frequency.setValueAtTime(note,time);gain.gain.setValueAtTime(.0001,time);gain.gain.exponentialRampToValueAtTime(.12,time+.025);gain.gain.exponentialRampToValueAtTime(.0001,time+.4);osc.connect(gain);gain.connect(ctx.destination);osc.start(time);osc.stop(time+.42);});
 } catch (_) { /* Audio availability never blocks play. */ }
}
function toggleSpookySound() {spookySoundEnabled=!spookySoundEnabled;document.getElementById('spookySound').textContent=spookySoundEnabled?'♫ Sonido: ON':'♫ Sonido: OFF';document.getElementById('spookySound').setAttribute('aria-pressed',String(spookySoundEnabled));spookyTone('start');}
function halloweenMix() {
 hostState.topicFilters=['halloween'];hostState.levelFilters=['A1','A2','B1','B2'];renderTopicPicker();handleQuestionFilterChange();
}
function showHalloweenCards() {
 const dialog=document.getElementById('halloweenCards');
 document.getElementById('halloweenCardGrid').innerHTML=halloweenWords.map(([word,spanish,art])=>'<article class="vocab-tile">'+spookyArt(art)+'<h3>'+word+'</h3><p>'+spanish+'</p></article>').join('');
 dialog.showModal();
}
document.body.classList.add('halloween');
document.body.insertAdjacentHTML('afterbegin','<div class="spooky-sky" aria-hidden="true"><span class="spooky-moon"></span><span class="flying-bat">'+spookyArt('bat')+'</span><span class="floating-ghost">'+spookyArt('ghost')+'</span></div><nav class="spooky-toolbar" aria-label="Halloween tools"><span>OCT 31 / HAUNTED CLASSROOM</span><button type="button" onclick="showHalloweenCards()">✦ Vocabulario</button><button id="spookySound" type="button" aria-pressed="false" onclick="toggleSpookySound()">♫ Sonido: OFF</button></nav><dialog id="halloweenCards"><header><h2>Halloween word cards</h2><button onclick="document.getElementById(\'halloweenCards\').close()" aria-label="Cerrar tarjetas">✕</button></header><p>16 palabras sencillas · Lee la palabra y su significado antes de jugar.</p><div id="halloweenCardGrid"></div></dialog>');
