const sharedEnd = [
  {block:3,type:'quote',kicker:'A learning trick',title:'Learn it twice',quote:'“When you teach something, you get to learn it twice.”',author:'— Jim Kwik'},
  {block:3,type:'sounds',kicker:'Pronunciation Lab',title:'T vs TH',lead:'Mira la boca. Escucha. Repite una vez.',groups:[
    {title:'T /t/',tip:'Lengua detrás de los dientes',words:['tin','tree','taught']},
    {title:'TH /θ/',tip:'Lengua visible + aire',words:['thin','three','thought']},
    {title:'TH /ð/',tip:'Lengua visible + voz',words:['this','they','those']}
  ]}
];

const quickGames = {
  '1': [
    ['NUMBER','7','seven'],['NUMBER','11','eleven'],['NUMBER','12','twelve'],['NUMBER','13','thirteen'],['NUMBER','14','fourteen'],
    ['NUMBER','15','fifteen'],['NUMBER','16','sixteen'],['NUMBER','18','eighteen'],['NUMBER','19','nineteen'],['NUMBER','20','twenty'],
    ['TIME','7:00','It is seven o’clock.'],['TIME','7:15','It is seven fifteen.'],['TIME','7:30','It is seven thirty.'],['TIME','8:00','It is eight o’clock.'],['TIME','8:20','It is eight twenty.'],
    ['TIME','9:10','It is nine ten.'],['TIME','9:30','It is nine thirty.'],['TIME','10:00','It is ten o’clock.'],['TIME','10:45','It is ten forty-five.'],['TIME','11:50','It is eleven fifty.'],
    ['DATE','September 1','September first.'],['DATE','September 2','September second.'],['DATE','September 3','September third.'],['DATE','September 5','September fifth.'],['DATE','September 8','September eighth.'],
    ['IN · ON · AT','My birthday is ___ September.','in'],['IN · ON · AT','English class starts ___ 10:15.','at'],['IN · ON · AT','The test is ___ Monday.','on'],['IN · ON · AT','We are ___ 2026.','in'],['IN · ON · AT','The party is ___ September 21.','on']
  ],
  '2': [
    ['NUMBER','13','thirteen'],['NUMBER','30','thirty'],['NUMBER','14','fourteen'],['NUMBER','40','forty'],['NUMBER','15','fifteen'],
    ['NUMBER','50','fifty'],['NUMBER','16','sixteen'],['NUMBER','60','sixty'],['NUMBER','18','eighteen'],['NUMBER','80','eighty'],
    ['TIME','7:15','It is seven fifteen.'],['TIME','7:45','It is seven forty-five.'],['TIME','8:30','It is eight thirty.'],['TIME','9:05','It is nine oh five.'],['TIME','10:50','It is ten fifty.'],
    ['TIME','11:20','It is eleven twenty.'],['TIME','12:00','It is twelve o’clock.'],['TIME','1:35','It is one thirty-five.'],['TIME','2:40','It is two forty.'],['TIME','3:55','It is three fifty-five.'],
    ['DATE','May 1','May first.'],['DATE','June 2','June second.'],['DATE','July 3','July third.'],['DATE','August 8','August eighth.'],['DATE','September 9','September ninth.'],
    ['IN · ON · AT','My sister was born ___ 2012.','in'],['IN · ON · AT','The game begins ___ 8:30.','at'],['IN · ON · AT','We have English ___ Tuesday.','on'],['IN · ON · AT','Vacation starts ___ December 20.','on'],['IN · ON · AT','My birthday is ___ May.','in']
  ],
  '3': [
    ["NUMBERS","30 guests · 13 chairs","We need seventeen more chairs because thirty guests are coming.","Explain the problem and ask for what you need."],
    ["NUMBERS","You ordered 14 tickets. The seller heard 40.","I asked for fourteen tickets, not forty. Could you change the order, please?","Correct the misunderstanding politely. Stress the difference."],
    ["NUMBERS","Budget: $100 · 4 tickets at $18 each","Four tickets cost seventy-two dollars. We have twenty-eight dollars left.","Explain the total cost and how much money remains."],
    ["NUMBERS","Bus A: 40 seats · Bus B: 30 seats · 60 students","Neither bus is big enough alone. Together they have seventy seats, so everyone can go.","Can everyone travel? Explain which buses you need."],
    ["NUMBERS","6 guests · Pizza A: 8 slices · Pizza B: 12 slices","I would choose pizza B because each guest can have two slices.","Choose a pizza for equal portions. Explain your choice."],
    ["NUMBERS","Buy 3 tickets for $45, or pay $18 each.","The three-ticket offer costs forty-five dollars instead of fifty-four. It saves nine dollars.","Recommend the cheaper option for three people and explain."],
    ["NUMBERS","A: 15 votes · B: 50 votes · C: 13 votes","B won with fifty votes. It received thirty-five more votes than A.","Announce the winner and compare it with second place."],
    ["NUMBERS","You need 20 bottles. Packs contain 6 bottles.","We need four packs, which contain twenty-four bottles. Four will be left over.","Explain how many whole packs to buy and why."],
    ["NUMBERS","A seat costs $30. Your friend says “thirteen.”","The seat costs thirty dollars, not thirteen. Could you confirm the price?","Correct your friend and ask the seller to confirm."],
    ["NUMBERS","Race places: Ana 21st · Leo 12th · Sam 3rd","Sam finished third, ahead of Leo in twelfth place. Ana finished twenty-first.","Describe all three results, starting with the fastest."],
    ["TIME","Movie: 6:45 p.m. · Journey: 30 min","We should leave at six fifteen at the latest. The journey takes half an hour.","When must you leave to arrive by the start? Explain."],
    ["TIME","Train: 14:20 · Arrive 15 min early","We must arrive at two oh five p.m. That is fifteen minutes before the train leaves.","Give the arrival time in 12-hour format and explain."],
    ["TIME","Game: 11:40 a.m. · Duration: 50 min","The game ends at twelve thirty p.m. It lasts fifty minutes.","Tell a friend when the game ends, including a.m. or p.m."],
    ["TIME","Practice ends 4:30 · Movie starts 4:45 · Walk: 20 min","We cannot arrive on time. We would reach the cinema at four fifty, five minutes late.","Can you do both on time? Explain the conflict."],
    ["TIME","“A quarter to eight” · Your friend writes 8:15.","It means seven forty-five, not eight fifteen. It is fifteen minutes before eight.","Correct the time and explain what “to” means here."],
    ["TIME","Lesson: 9:15–10:00 · Break: 10 min","The lesson lasts forty-five minutes. After the break, we start again at ten ten.","Explain the lesson length and when the next lesson starts."],
    ["TIME","Departure: 11:50 p.m. · Journey: 25 min","We arrive at twelve fifteen a.m. That is the next day.","Explain the arrival time and whether the date changes."],
    ["TIME","You are free 3:00–5:00 · A: 2:30–4:00 · B: 3:30–4:30","I would choose B because it fits my free time. A starts before I am available.","Choose an activity you can attend from start to finish."],
    ["TIME","Meeting: 6:20 p.m. → 40 minutes later","The meeting is now at seven p.m. It has been moved forty minutes later.","Tell your friend the new time and explain the change."],
    ["TIME","Cafe opens 8:30 a.m. · You arrive 8:10 a.m.","We need to wait twenty minutes. The cafe opens at half past eight.","Explain the wait and say the opening time another way."],
    ["DATES","“The party is in Friday, on 7 p.m.”","The party is on Friday at seven p.m. We use on for days and at for times.","Correct the whole invitation and explain both changes."],
    ["DATES","Birthday: May 21 · Party: May 23 at 6 p.m.","My birthday is on May twenty-first, but the party is on May twenty-third at six p.m.","Invite a friend without confusing the birthday and party dates."],
    ["DATES","“The concert is on 04/05.”","Do you mean April fifth or May fourth? Could you write the month as a word?","The date format is unknown. Ask for clarification; do not guess."],
    ["DATES","Today: September 18 · Deadline: September 21","The deadline is on September twenty-first, three days from today.","Explain the deadline and how many days remain."],
    ["DATES","“I was born on 2012, at September.”","I was born in September, in two thousand twelve. We use in for months and years.","Correct the sentence and explain your preposition choice."],
    ["DATES","Trip: October 30 → November 2","The trip starts on October thirtieth and ends on November second. It crosses into a new month.","Describe both dates clearly, including the months."],
    ["DATES","A: June 3 at 4 p.m. · B: June 13 at 4 p.m.","These are different dates: June third and June thirteenth. Which date is correct?","Two invitations disagree. Explain the difference and ask."],
    ["DATES","Today: December 31, 2026 · Meet tomorrow, 9 a.m.","Let’s meet on January first, two thousand twenty-seven, at nine a.m.","Make the invitation with the full new date and time."],
    ["DATES","Course: ___ October · First class: ___ October 5 ___ 8 a.m.","The course starts in October. The first class is on October fifth at eight a.m.","Say both complete sentences using in, on and at."],
    ["DATES","Your event: November 12, 5:30 p.m. · Choose the activity.","Would you like to come to my game night on November twelfth at five thirty? What games do you like?","Create an invitation with the date and time; ask about preferences."]
  ]
};

const pronunciationSentences = [
  'I thought you threw the ball through the window.',
  'Though the test was tough, I thought carefully.',
  'The teacher taught three students through a game.',
  'We threw three stones through the hoop.',
  'I thought the thorough explanation was tough.',
  'Though it was tough, they walked through the rain.',
  'She taught us to throw the ball through the ring.',
  'They thought the tree was thin.',
  'Throughout the class, they thought about three answers.',
  'He threw the ball, though he thought it was too far.',
  'The tough coach taught them to throw carefully.',
  'Three friends walked through the thick forest.',
  'I thought this thread was too thin.',
  'Though those shoes are tough, they feel light.',
  'The teacher thought three questions were enough.',
  'They threw the rope through three rings.',
  'She thought the thorough report was useful.',
  'Throughout the trip, they told three stories.',
  'The lesson was tough, though the teacher taught it well.',
  'Throw those three balls through the hoop.',
  'I thought they threw this away.',
  'Though the road was tough, we made it through.',
  'The teacher taught us the difference between tree and three.',
  'They thought this thin rope was strong.',
  'We walked through three rooms throughout the tour.',
  'He threw a tough question at the teacher.',
  'I thought those three answers were correct.',
  'Though she taught the class, the topic was tough.',
  'They threw the ball through the trees.',
  'A thorough teacher thought through the problem.'
];

const firstListeningGame = [
  ['LISTEN','TIN or THIN?','tin'],['LISTEN','TIN or THIN?','thin'],
  ['LISTEN','TREE or THREE?','tree'],['LISTEN','TREE or THREE?','three'],
  ['LISTEN','TANK or THANK?','tank'],['LISTEN','TANK or THANK?','thank'],
  ['LISTEN','TICK or THICK?','tick'],['LISTEN','TICK or THICK?','thick'],
  ['LISTEN','TAUGHT or THOUGHT?','taught'],['LISTEN','TAUGHT or THOUGHT?','thought'],
  ['LISTEN','TORN or THORN?','torn'],['LISTEN','TORN or THORN?','thorn'],
  ['LISTEN','TEAM or THEME?','team'],['LISTEN','TEAM or THEME?','theme'],
  ['LISTEN','TIE or THIGH?','tie'],['LISTEN','TIE or THIGH?','thigh'],
  ['LISTEN','TRUE or THROUGH?','true'],['LISTEN','TRUE or THROUGH?','through'],
  ['LISTEN','BAT or BATH?','bat'],['LISTEN','BAT or BATH?','bath'],
  ['LISTEN','BOAT or BOTH?','boat'],['LISTEN','BOAT or BOTH?','both'],
  ['LISTEN','MAT or MATH?','mat'],['LISTEN','MAT or MATH?','math'],
  ['LISTEN','FORT or FOURTH?','fort'],['LISTEN','FORT or FOURTH?','fourth'],
  ['LISTEN','FATE or FAITH?','fate'],['LISTEN','FATE or FAITH?','faith'],
  ['LISTEN','MOUSE or MOUTH?','mouse'],['LISTEN','MOUSE or MOUTH?','mouth']
];

export const lessons = {
'1': [
  {block:1,type:'intro',kicker:'Block 1 · 15 min',title:'Números, horas y fechas',lead:'Primero aprendemos las palabras. Después decimos respuestas completas en inglés.',items:['1. APRENDE','2. RESPONDE','3. COMPRUEBA']},
  {block:1,type:'cards',kicker:'Numbers 1–10',title:'Count with me',columns:5,cards:[['1','one'],['2','two'],['3','three'],['4','four'],['5','five'],['6','six'],['7','seven'],['8','eight'],['9','nine'],['10','ten']]},
  {block:1,type:'cards',kicker:'Numbers 11–20',title:'The teen family',columns:5,cards:[['11','eleven'],['12','twelve'],['13','thirteen'],['14','fourteen'],['15','fifteen'],['16','sixteen'],['17','seventeen'],['18','eighteen'],['19','nineteen'],['20','twenty']]},
  {block:1,type:'example',kicker:'Time',title:'What time is it?',example:'7:00 → It is <em>seven o’clock.</em>',lead:'7:30 → It is seven thirty.'},
  {block:1,type:'dateGuide',kicker:'Dates & time',title:'Dates: say them and place them',forms:'1st first · 2nd second · 3rd third · 4th fourth · 5th fifth · 10th tenth · 14th fourteenth · 20th twentieth',rules:[['IN','month or year','in September · in 2026'],['ON','day or date','on Monday · on September first'],['AT','clock time','at 10:15']]},
  {block:2,type:'generator',kicker:'Block 2 · 15 min',title:'Dilo en inglés',lead:'Piensa. Responde. Después comprueba.',items:quickGames['1']},
  ...sharedEnd,
  {block:3,type:'generator',kicker:'Listening game · 30 rounds',title:'¿Cuál escuchaste?',lead:'Pulsa Escuchar. Elige una opción. Después comprueba.',audio:true,items:firstListeningGame}
],
'2': [
  {block:1,type:'intro',kicker:'Block 1 · 15 min',title:'Números, horas y fechas',lead:'Primero repasamos las formas. Después resolvemos retos en la misma pantalla.',items:['1. APRENDE','2. RESPONDE','3. COMPRUEBA']},
  {block:1,type:'cards',kicker:'Teen or ty?',title:'Stress changes the number',columns:4,cards:[['13','thirTEEN'],['30','THIRty'],['14','fourTEEN'],['40','FORty'],['15','fifTEEN'],['50','FIFty'],['16','sixTEEN'],['60','SIXty']]},
  {block:1,type:'example',kicker:'Time',title:'Read digital time',example:'11:45 → It is <em>eleven forty-five.</em>',lead:'Exactly on the hour: 9:00 → nine o’clock.'},
  {block:1,type:'cards',kicker:'Useful date words',title:'Ordinal numbers',columns:4,cards:[['1st','first'],['2nd','second'],['3rd','third'],['8th','eighth'],['9th','ninth'],['12th','twelfth'],['20th','twentieth'],['21st','twenty-first']]},
  {block:1,type:'dateGuide',kicker:'Dates & time',title:'In, on or at?',rules:[['IN','month or year','in May · in 2012'],['ON','day or date','on Tuesday · on May twenty-first'],['AT','clock time','at eleven forty-five']],examples:['When is your birthday? → It is on May twenty-first.','What time does class start? → It starts at eleven forty-five.']},
  {block:2,type:'generator',kicker:'Block 2 · 15 min',title:'Reto rápido',lead:'Di la respuesta completa antes de revelarla.',items:quickGames['2']},
  ...sharedEnd,
  {block:3,type:'generator',kicker:'Listening game · 30 rounds',title:'¿Cuál escuchaste?',lead:'Pulsa Escuchar. Di la palabra que escuchaste. Después comprueba.',audio:true,items:firstListeningGame}
],
'3': [
  {block:1,type:'intro',kicker:'Block 1 · 15 min',title:'Números, horas y fechas',lead:'Primero repasamos las formas. Después resolvemos retos de precisión.',items:['1. APRENDE','2. RESPONDE','3. COMPRUEBA']},
  {block:1,type:'cards',kicker:'Precision set',title:'Say it clearly',columns:4,cards:[['13','thirTEEN'],['30','THIRty'],['18','eighTEEN'],['80','EIGHty'],['1:15','one fifteen'],['1:50','one fifty'],['14th','fourteenth'],['40th','fortieth']]},
  {block:1,type:'example',kicker:'Time',title:'Two natural forms',example:'7:45 → <em>seven forty-five</em> / <em>a quarter to eight</em>',lead:'8:30 → eight thirty / half past eight'},
  {block:1,type:'cards',kicker:'Dates & years',title:'Read with precision',columns:3,cards:[['09/14','September fourteenth'],['05/21','May twenty-first'],['2026','twenty twenty-six'],['1998','nineteen ninety-eight'],['2005','two thousand five'],['31st','thirty-first']]},
  {block:1,type:'dateGuide',kicker:'Dates & time',title:'In, on or at?',rules:[['IN','month or year','in September · in 2026'],['ON','day or date','on Friday · on September fourteenth'],['AT','clock time','at eleven forty-five']],examples:['The meeting is on September fourteenth at eleven forty-five.','The course begins in September.']},
  {block:2,type:'generator',kicker:'Block 2 · 15 min',title:'Reto de precisión',lead:'Responde o corrige la frase. Después comprueba.',items:quickGames['3']},
  ...sharedEnd.slice(0,2),
  {block:3,type:'sounds',kicker:'Pronunciation Lab',title:'The OUGH maze',lead:'La ortografía se parece; el sonido cambia.',groups:[
    {title:'/θ/ + aire',tip:'lengua visible',words:['throw','threw','through','thought','thorough','throughout']},
    {title:'/ð/ + voz',tip:'vibración',words:['though','although','therefore']},
    {title:'Sin TH',tip:'empieza con /t/',words:['taught','tough','true','tree']}
  ]},
  {block:3,type:'sentenceGenerator',kicker:'Pronunciation game',title:'Lee la oración',lead:'Primero ustedes. Después escucha el modelo.',items:pronunciationSentences}
]};

