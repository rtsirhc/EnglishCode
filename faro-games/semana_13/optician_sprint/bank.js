export const REVIEW_CARDS = [
  { word: 'glasses', es: 'lentes / anteojos', phrase: 'I need a new pair of glasses.' },
  { word: 'frames', es: 'armazón', phrase: 'I like these black frames.' },
  { word: 'lenses', es: 'micas / cristales', phrase: 'My lenses are scratched.' },
  { word: 'contact lenses (contacts)', es: 'lentes de contacto', phrase: 'Have you ever worn contacts?' },
  { word: 'glasses case', es: 'estuche', phrase: 'Put your glasses in the case.' },
  { word: 'eye exam', es: 'examen de la vista', phrase: "I'd like an eye exam, please." },
  { word: 'prescription', es: 'receta / graduación', phrase: 'Do you have your prescription?' },
  { word: 'blurry', es: 'borroso', phrase: 'The board looks blurry.' },
  { word: 'near / far', es: 'cerca / lejos', phrase: "I can't see far away clearly." },
  { word: 'Can I try these on?', es: '¿Me puedo probar estos?', phrase: 'Can I try these frames on?' },
  { word: 'How much are they?', es: '¿Cuánto cuestan?', phrase: 'How much are these glasses?' },
  { word: 'Have you ever…?', es: '¿Alguna vez has…?', phrase: 'Have you ever broken your glasses?' }
];

const RIMS = '<rect x="86" y="52" width="175" height="102" rx="42"/><rect x="318" y="52" width="175" height="102" rx="42"/><path d="M261 84 Q290 58 318 84 M85 76 L45 28 M494 76 L535 28" fill="none"/>';

export const VISUALS = {
  frames: `<svg role="img" aria-label="Eyeglass frames highlighted" viewBox="0 0 580 185"><g stroke="#ffbd66" fill="#20454b" stroke-width="14" stroke-linecap="round">${RIMS}</g></svg>`,
  lenses: `<svg role="img" aria-label="Eyeglass lenses highlighted" viewBox="0 0 580 185"><g stroke="#94a3b8" fill="#67e8f9" stroke-width="10" stroke-linecap="round">${RIMS}</g><path d="M120 118 l36-34 m216 34 l36-34" stroke="#fff" stroke-width="7" opacity=".7"/></svg>`,
  contacts: `<svg role="img" aria-label="Two contact lenses" viewBox="0 0 580 185"><g fill="#67e8f9" fill-opacity=".45" stroke="#a5f3fc" stroke-width="5"><path d="M65 72 Q165 162 265 72 Q200 205 100 135 Z"/><ellipse cx="165" cy="72" rx="100" ry="22"/><path d="M315 72 Q415 162 515 72 Q450 205 350 135 Z"/><ellipse cx="415" cy="72" rx="100" ry="22"/></g></svg>`,
  chart: `<svg role="img" aria-label="Eye exam chart" viewBox="0 0 580 185"><rect x="175" y="8" width="230" height="169" rx="10" fill="#fff8e7"/><g fill="#0f2529" font-family="monospace" font-weight="900" text-anchor="middle"><text x="290" y="64" font-size="60">E</text><text x="290" y="106" font-size="38">F P</text><text x="290" y="138" font-size="26">T O Z</text><text x="290" y="164" font-size="18">L P E D</text></g></svg>`,
  rx: `<svg role="img" aria-label="Optician prescription" viewBox="0 0 580 185"><rect x="135" y="10" width="310" height="165" rx="10" fill="#fff8e7"/><g font-family="system-ui" fill="#0f2529" font-weight="700"><text x="160" y="58" font-size="36">℞</text><text x="160" y="102" font-size="22">Right eye: -1.50</text><text x="160" y="140" font-size="22">Left eye:  -1.25</text></g></svg>`,
  case: `<svg role="img" aria-label="Glasses case" viewBox="0 0 580 185"><rect x="120" y="42" width="340" height="104" rx="46" fill="#0f766e" stroke="#ffd477" stroke-width="8"/><line x1="126" y1="94" x2="454" y2="94" stroke="#ffd477" stroke-width="5"/><circle cx="290" cy="94" r="10" fill="#ffd477"/></svg>`
};

export const CHALLENGES = {
  A1: [
    { cat: 'Visual Clue', visual: 'frames', prompt: 'Look at the orange part. What is it? Say a full sentence.', frame: 'These are ___ . / I like these ___ .', answer: 'These are frames. / I like these frames.', tip: 'Frames = armazón.' },
    { cat: 'Visual Clue', visual: 'lenses', prompt: 'Look at the blue glass part. What is it? Say a full sentence.', frame: 'These are ___ .', answer: 'These are lenses.', tip: 'Pronunciation: len-ziz (2 syllables).' },
    { cat: 'Visual Clue', visual: 'contacts', prompt: 'What are these? Say a sentence.', frame: 'They are ___ . / I wear ___ .', answer: 'They are contact lenses (contacts).', tip: 'Short form: contacts.' },
    { cat: 'Visual Clue', visual: 'chart', prompt: 'What test uses this letter chart? Ask for it politely.', frame: "I'd like an ___ , please.", answer: "I'd like an eye exam, please.", tip: 'Eye sounds like "I".' },
    { cat: 'Visual Clue', visual: 'rx', prompt: 'What paper is this? Answer the optician.', frame: 'Yes, here is my ___ .', answer: 'Yes, here is my prescription.', tip: 'Prescription = receta / graduación.' },
    { cat: 'Visual Clue', visual: 'case', prompt: 'Where do you put your glasses? Say a sentence.', frame: 'I put my glasses in the ___ .', answer: 'I put my glasses in the case.', tip: 'Glasses case = estuche.' },
    { cat: 'Shop Request', prompt: 'You want to test some blue glasses on your face. Ask the optician!', frame: 'Can I ___ these ___ ?', answer: 'Can I try these on?', tip: 'Try on = probarse.' },
    { cat: 'Shop Request', prompt: 'You want to know the price of the glasses. Ask!', frame: 'How ___ are ___ ?', answer: 'How much are they? / How much are these glasses?', tip: 'Glasses is plural → are they.' },
    { cat: 'Vision Problem', prompt: 'The words on the board are not clear. Tell the doctor.', frame: 'I cannot see clearly. It is ___ .', answer: 'I cannot see clearly. It is blurry.', tip: 'Blurry = borroso.' },
    { cat: 'Vision Problem', prompt: 'You need new glasses. Tell the optician.', frame: 'Hello! I need a new ___ of ___ .', answer: 'Hello! I need a new pair of glasses.', tip: 'A pair of glasses (not "a glass").' },
    { cat: 'Have You Ever…?', prompt: 'Ask the teacher if they have ever worn glasses.', frame: 'Have you ever ___ glasses?', answer: 'Have you ever worn glasses?', tip: 'wear → wore → worn.' },
    { cat: 'Fix the Mistake', prompt: 'Find and fix the error: "How much is these glasses?"', frame: 'How much ___ these glasses?', answer: 'How much ARE these glasses?', tip: 'Glasses is always plural.' },
    { cat: 'Pronunciation Check', prompt: 'Say BOTH words clearly: "glasses" and "lenses".', frame: 'glass-iz · len-ziz', answer: 'glasses (/ɪz/) and lenses (/ɪz/).', tip: 'Two syllables each.' },
    { cat: 'Shop Reply', prompt: 'Optician asks: "Do you have your prescription?" Answer YES.', frame: 'Yes, ___ ___ .', answer: 'Yes, I do. / Yes, here it is.', tip: 'Short answer to Do you…? → Yes, I do.' },
    { cat: 'Near or Far?', prompt: 'You can read your phone, but you cannot read the board. Say your problem.', frame: "I can't see ___ away.", answer: "I can't see far away.", tip: 'Near = cerca · Far = lejos.' },
    { cat: 'Have You Ever…?', prompt: 'Answer for yourself: "Have you ever lost your keys?"', frame: 'Yes, I have. / No, I have never ___ my keys.', answer: 'Yes, I have. / No, I have never lost my keys.', tip: 'lose → lost → lost.' }
  ],
  A2: [
    { cat: 'Visual Clue', visual: 'frames', prompt: 'Describe the orange part and ask to try them on.', frame: 'I like these ___ . Can I ___ ?', answer: 'I like these frames. Can I try them on?', tip: 'Combine preference + request.' },
    { cat: 'Visual Clue', visual: 'chart', prompt: 'You are at the optician. Ask for this test and say why.', frame: "I'd like an ___ because ___ .", answer: "I'd like an eye exam because the board looks blurry.", tip: 'Give a simple reason.' },
    { cat: 'Visual Clue', visual: 'contacts', prompt: 'Ask the optician a question about these.', frame: 'Do you have ___ ? / How much ___ ?', answer: 'Do you sell contact lenses? / How much are contact lenses?', tip: 'Contact lenses is plural.' },
    { cat: 'Visual Clue', visual: 'rx', prompt: 'Tell the optician you forgot this document at home.', frame: "I'm sorry, I forgot my ___ .", answer: "I'm sorry, I forgot my prescription at home.", tip: 'Useful real-world repair line.' },
    { cat: 'Fix the Mistake', prompt: 'Fix the sentence: "Have you ever broke your glasses?"', frame: 'break → broke → ___', answer: 'Have you ever BROKEN your glasses?', tip: 'Have you ever + past participle.' },
    { cat: 'Fix the Mistake', prompt: 'Fix the sentence: "I need a new glass for school."', frame: 'a ___ of ___', answer: 'I need a new pair of glasses for school.', tip: 'A glass = un vaso. A pair of glasses = lentes.' },
    { cat: 'Fix the Mistake', prompt: 'Fix the sentence: "How much does these frames cost?"', frame: 'How much ___ these frames cost?', answer: 'How much DO these frames cost? / How much are these frames?', tip: 'Plural subject → do / are.' },
    { cat: 'Shop Role-Play', prompt: 'Customer: Ask for black frames and ask the price in TWO sentences.', frame: 'Do you have ___ ? How much ___ ?', answer: 'Do you have black frames? How much are they?', tip: 'Two complete questions.' },
    { cat: 'Shop Role-Play', prompt: 'Optician: A customer says "I cannot see the board." Suggest an eye exam.', frame: 'You should get an ___ . / Would you like an ___ ?', answer: 'Would you like an eye exam? We can check your eyes today.', tip: 'Polite offer.' },
    { cat: 'Have You Ever…?', prompt: 'Answer with YES or NO + 1 detail: "Have you ever worn sunglasses inside?"', frame: 'Yes, I have. I wore them… / No, I haven’t.', answer: 'Yes, I have. I wore them at the mall. / No, I haven’t.', tip: 'Switch to simple past for the story.' },
    { cat: 'Have You Ever…?', prompt: 'Make a question using "Have you ever" + BUY + "glasses online".', frame: 'Have you ever ___ ?', answer: 'Have you ever bought glasses online?', tip: 'buy → bought → bought.' },
    { cat: 'Pronunciation Trap', prompt: 'Say this sentence clearly: "I ate at the breakfast buffet."', frame: 'buffet ≈ buh-FAY (silent T)', answer: 'I ate at the breakfast buffet (buh-FAY).', tip: 'Silent final T like ballet and valet.' },
    { cat: 'Vision Problem', prompt: 'Explain TWO problems: reading far away + headaches.', frame: "I can't see ___ and I have a ___ .", answer: "I can't see far away and I have a headache.", tip: 'Connects Week 10–11 clinic vocab!' },
    { cat: 'Speed Clue', prompt: 'Describe "glasses case" in English WITHOUT saying "case".', frame: 'It is a small box where you put…', answer: 'It is a small box where you keep your glasses safe.', tip: 'Paraphrasing builds fluency.' },
    { cat: 'Been vs. Gone', prompt: 'Choose the right word and say the full sentence: "Have you ever (been / gone) to an optician?"', frame: 'Have you ever ___ to…?', answer: 'Have you ever BEEN to an optician?', tip: 'Been to = visited and came back.' },
    { cat: 'Shop Choice', prompt: 'Compare glasses and contacts: Which do you prefer and why?', frame: 'I prefer ___ because ___ .', answer: 'I prefer glasses because they are easier to put on.', tip: 'Any logical reason counts.' }
  ],
  B1: [
    { cat: 'Visual Role-Play', visual: 'frames', prompt: 'You tried these frames on, but they feel too tight. Ask politely for another pair and give a reason.', frame: 'These frames feel… Could I try…?', answer: 'These frames feel a bit tight. Could I try a lighter pair, please?', tip: 'Polite complaint + request.' },
    { cat: 'Visual Role-Play', visual: 'rx', prompt: 'Your prescription is two years old and things look blurry. Explain the situation and ask for an appointment.', frame: 'My prescription is… Could I book…?', answer: 'My prescription is two years old and things look blurry. Could I book an eye exam?', tip: 'Connects clinic + optician.' },
    { cat: 'Visual Debate', visual: 'contacts', prompt: 'Give ONE advantage and ONE disadvantage of contact lenses.', frame: 'One advantage is… However, …', answer: 'Contacts are great for sports, however they can dry out your eyes.', tip: 'Use a contrast connector.' },
    { cat: 'Fix the Mistake', prompt: 'Spot BOTH errors: "Have you ever saw a doctor because your glass were blurry?"', frame: 'seen · glasses', answer: 'Have you ever SEEN a doctor because your GLASSES were blurry?', tip: 'Past participle + plural noun.' },
    { cat: 'Been vs. Gone', prompt: 'Explain the difference in English: "Ana has been to London" vs. "Ana has gone to London."', frame: 'Been = returned · Gone = still there', answer: 'Been to means she visited and came back. Gone to means she is still in London.', tip: 'Clear explanation earns full points.' },
    { cat: 'Story Switch', prompt: 'Answer and add a past-simple detail: "Have you ever broken something expensive?"', frame: 'Yes, I have. Last year I…', answer: 'Yes, I have. Last year I dropped my phone and cracked the screen.', tip: 'Present perfect → Simple past.' },
    { cat: 'Customer Complication', prompt: 'The glasses cost $3,500, which is over your budget. Negotiate or ask for a cheaper option politely.', frame: 'That is a bit expensive for me. Do you have…?', answer: 'That is a bit expensive for me. Do you have similar frames at a lower price?', tip: 'Polite negotiation.' },
    { cat: 'Pronunciation Trio', prompt: 'Read aloud cleanly: "After ballet, the valet parked by the buffet."', frame: 'bal-LAY · val-LAY · buh-FAY', answer: 'After bal-LAY, the val-LAY parked by the buh-FAY.', tip: 'Silent final T in all three French loans.' },
    { cat: 'Repair Strategy', prompt: 'The optician spoke too fast about your prescription. Ask them to repeat and explain slowly.', frame: 'Excuse me, could you…?', answer: 'Excuse me, could you repeat that more slowly? What does this number mean?', tip: 'Communication repair.' },
    { cat: 'Optician Advice', prompt: 'A student gets headaches from screens every night. Give TWO pieces of advice.', frame: 'You should… Also, try…', answer: 'You should get an eye exam and take breaks from screens every 20 minutes.', tip: 'Two clear suggestions.' },
    { cat: 'Have You Ever…?', prompt: 'Ask a follow-up question after someone says: "Yes, I have worn contacts."', frame: 'When did you…? / Were they…?', answer: 'Were they comfortable? / How long did you wear them?', tip: 'Follow-up in simple past.' },
    { cat: 'Shop Closing', prompt: 'You decided to buy the glasses. Ask TWO closing questions (ready date + warranty/case).', frame: 'When will they be ready? Does it come with…?', answer: 'When will they be ready, and do they come with a case?', tip: 'Natural closing.' }
  ]
};
