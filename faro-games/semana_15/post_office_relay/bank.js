export const MAIL_REVIEW = [
  { word: 'package / parcel', es: 'paquete', phrase: "I'd like to send this package to Monterrey." },
  { word: 'letter', es: 'carta', phrase: 'I need to mail a letter.' },
  { word: 'envelope', es: 'sobre', phrase: 'Do you sell large envelopes?' },
  { word: 'stamp', es: 'estampilla / timbre', phrase: 'I need two stamps for this letter.' },
  { word: 'address', es: 'dirección', phrase: 'Write the address on the front.' },
  { word: 'zip code', es: 'código postal', phrase: 'What is the zip code?' },
  { word: 'scale / weight', es: 'báscula / peso', phrase: 'Put the box on the scale.' },
  { word: 'fragile', es: 'frágil', phrase: 'Please mark it fragile.' },
  { word: 'standard / express', es: 'normal / exprés', phrase: 'How much is express delivery?' },
  { word: 'tracking number', es: 'número de rastreo', phrase: 'Does it include a tracking number?' },
  { word: 'How long will it take?', es: '¿Cuánto tiempo tardará?', phrase: 'How long will it take to arrive?' },
  { word: 'pick up', es: 'recoger', phrase: "I'm here to pick up a package." }
];

export const MAIL_CHALLENGES = {
  A1: [
    { cat: 'Counter Request', prompt: 'You want to mail a box to Mexico City. Tell the clerk!', frame: "I'd like to send this ___ to Mexico City.", answer: "I'd like to send this package to Mexico City.", tip: 'Package / parcel = paquete.' },
    { cat: 'Buy Supplies', prompt: 'You need a paper cover for your letter. Ask the clerk!', frame: 'Do you have an ___ ?', answer: 'Do you have an envelope?', tip: 'An envelope (starts with vowel sound).' },
    { cat: 'Buy Supplies', prompt: 'You need three postage stickers for letters. Ask!', frame: "I'd like three ___ , please.", answer: "I'd like three stamps, please.", tip: 'Stamp = estampilla.' },
    { cat: 'Shipping Cost', prompt: 'Ask the price to send your package.', frame: 'How ___ is it to send this ___ ?', answer: 'How much is it to send this package?', tip: 'Reuse How much…?' },
    { cat: 'Delivery Time', prompt: 'Ask how many days the letter will take.', frame: 'How ___ will it ___ ?', answer: 'How long will it take?', tip: 'Super useful everyday phrase!' },
    { cat: 'Fragile Box', prompt: 'There is glass inside your box! Warn the postal clerk.', frame: 'Be careful, it is ___ .', answer: 'Be careful, it is fragile.', tip: 'Pronunciation: FRA-juhl.' },
    { cat: 'Pick Up', prompt: 'You received a notice that a box arrived for you. Tell the clerk!', frame: "Hello! I'm here to ___ ___ a package.", answer: "Hello! I'm here to pick up a package.", tip: 'Pick up = recoger.' },
    { cat: 'Address Check', prompt: 'The clerk asks for your postal code. Ask what word means "código postal" and give an example.', frame: 'My ___ ___ is 25000.', answer: 'My zip code (postal code) is 25000.', tip: 'Zip code (US) / postal code (UK).' },
    { cat: 'Fix the Mistake', prompt: 'Fix the error: "I want to send this letter on express."', frame: 'I want to send it BY ___ . / I want ___ delivery.', answer: 'I want express delivery / to send it by express mail.', tip: 'By express mail.' },
    { cat: 'Clerk Question', prompt: 'Clerk says: "Please put the package on the scale." What do they want to check?', frame: 'They want to check the ___ .', answer: 'They want to check the weight (how heavy it is).', tip: 'Scale = báscula · Weight = peso.' },
    { cat: 'Return Address', prompt: 'Spell or say your city and country in English as a return address.', frame: 'Saltillo, Coahuila, Mexico.', answer: 'It is going from Saltillo, Coahuila, Mexico.', tip: 'Clear pronunciation.' },
    { cat: 'Standard or Express?', prompt: 'You are NOT in a hurry and want the cheaper option. Tell the clerk.', frame: '___ delivery, please.', answer: 'Standard delivery, please.', tip: 'Standard = normal/cheaper.' }
  ],
  A2: [
    { cat: 'Counter Role-Play', prompt: 'Ask for BOTH the price AND the delivery time for sending a box to Monterrey.', frame: 'How much is it to…? And how long…?', answer: 'How much is it to send this package to Monterrey, and how long will it take?', tip: 'Two connected questions.' },
    { cat: 'Tracking Check', prompt: 'Ask if your package comes with a tracking number so you can check it online.', frame: 'Does this include a ___ ___ ?', answer: 'Does this include a tracking number?', tip: 'Tracking number = número de guía/rastreo.' },
    { cat: 'Express vs. Standard', prompt: 'Compare standard and express shipping in ONE sentence.', frame: 'Express is ___ , but standard is ___ .', answer: 'Express is faster, but standard is cheaper.', tip: 'Comparatives!' },
    { cat: 'Customs Form', prompt: 'The clerk asks: "What is inside the package?" Answer with TWO items (e.g., clothes and books).', frame: 'There are ___ and ___ inside.', answer: 'There are two books and a hoodie inside.', tip: 'Reuse Week 6 vocabulary!' },
    { cat: 'Missing Zip Code', prompt: 'You forgot the zip code for the address. Apologize and ask if you can check your phone.', frame: "I'm sorry, I forgot the ___ . Can I check…?", answer: "I'm sorry, I forgot the zip code. Can I check it on my phone?", tip: 'Polite repair.' },
    { cat: 'Fix the Mistake', prompt: 'Fix the error: "How many time does it take to arrive?"', frame: 'How ___ does it take…?', answer: 'How LONG does it take to arrive?', tip: 'Never "how many time"!' },
    { cat: 'Pick Up ID', prompt: 'You are the postal clerk. Ask the customer for their name and ID before giving the package.', frame: 'What is your name? May I see your ___ ?', answer: 'What is your name, and may I see your ID, please?', tip: 'Connects Week 14 bank vocab!' },
    { cat: 'Wrong Address', prompt: 'You wrote the wrong house number on the envelope! Ask the clerk for a new envelope.', frame: 'I made a mistake on the ___ . Could I get…?', answer: 'I made a mistake on the address. Could I get a new envelope, please?', tip: 'Make a mistake (not do).' },
    { cat: 'Speed Clue', prompt: 'Describe "stamp" in English WITHOUT saying "stamp".', frame: 'It is a small sticker you put on…', answer: 'It is a small paper sticker you put on an envelope to mail a letter.', tip: 'Great speaking fluency.' },
    { cat: 'Heavy Box', prompt: 'The box weighs 5 kilograms. Ask if it is too heavy for express mail.', frame: 'Is 5 kilograms too ___ for ___ ?', answer: 'Is 5 kilograms too heavy for express delivery?', tip: 'Too + adjective.' },
    { cat: 'Fragile Gift', prompt: 'You are sending a mug as a gift. Tell the clerk it is fragile and ask for bubble wrap or a box.', frame: 'It is ___ . Do you have a ___ ?', answer: 'It is fragile. Do you have a stronger box or bubble wrap?', tip: 'Practical real-life English.' },
    { cat: 'Receipt Request', prompt: 'Pay for your shipment and ask for a receipt with the tracking number.', frame: 'Here you go. Could I have a ___ with the ___ ?', answer: 'Here you go. Could I have a receipt with the tracking number, please?', tip: 'Watch silent P in receipt!' }
  ],
  B1: [
    { cat: 'Delayed Package', prompt: 'Your package was supposed to arrive three days ago. Give your tracking number and ask what happened.', frame: 'My package is three days late. Here is the tracking number…', answer: 'My package was supposed to arrive three days ago. Here is the tracking number—could you check where it is?', tip: 'Polite complaint.' },
    { cat: 'Damaged Delivery', prompt: 'A package arrived damaged even though it was marked fragile. Explain the problem and ask about insurance.', frame: 'The box arrived damaged, even though… Is it covered by…?', answer: 'The box arrived damaged even though it was marked fragile. Is it covered by shipping insurance?', tip: 'Contrast + solution.' },
    { cat: 'International Shipping', prompt: 'You want to send a gift to Canada. Ask about customs forms, delivery time, and prohibited items.', frame: 'I want to ship this to Canada. Do I need to fill out…?', answer: 'I want to ship this to Canada. Do I need a customs form, and is there anything I cannot send?', tip: 'Fill out a form.' },
    { cat: 'Fix Both Errors', prompt: 'Fix BOTH errors: "How much times will the parcel takes to get at Monterrey?"', frame: 'How long · take · get to', answer: 'How LONG will the parcel TAKE to get TO Monterrey?', tip: 'Will + base verb; get to (not get at).' },
    { cat: 'Budget Decision', prompt: 'Express costs $450 (2 days) and Standard costs $160 (6 days). Choose one and justify your decision.', frame: 'I will choose ___ because…', answer: 'I will choose standard delivery because it is not urgent and I can save almost $300.', tip: 'Clear justification.' },
    { cat: 'Clerk Problem-Solving', prompt: 'You are the clerk. A customer’s address is missing the apartment number. Politely explain why it is needed.', frame: 'Excuse me, we need the apartment number so that…', answer: 'Excuse me, we need the apartment number so the delivery driver can find the right door.', tip: 'So (that) + purpose.' },
    { cat: 'Signature Required', prompt: 'Ask if someone needs to be home to sign for the package, or if they can pick it up later.', frame: 'Does someone need to sign for it, or can they…?', answer: 'Does someone need to sign for it, or can they pick it up at the post office?', tip: 'Sign for a package.' },
    { cat: 'Digital vs. Paper Mail', prompt: 'Give ONE reason people still use the post office even though we have email.', frame: 'Even though we have email, we still need…', answer: 'Even though we have email, we still need the post office for physical packages and official documents.', tip: 'Balanced B1 answer.' }
  ]
};
