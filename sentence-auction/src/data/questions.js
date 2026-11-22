// Passive Voice Question Bank
// Focused on: Present Simple, Past Simple, Present Continuous, Past Continuous
// 65 questions total — all randomized per game

export const questionsBank = [
  // ─── PRESENT SIMPLE PASSIVE ───────────────────────────────
  { id: 1, sentence: "English is spoken in more than 60 countries.", status: "Perfect", explanation: "Correct present simple passive (is + past participle).", tense: "Present Simple" },
  { id: 2, sentence: "Millions of emails are send every single day.", status: "Toxic", explanation: "'send' should be 'sent'. (are sent)", tense: "Present Simple" },
  { id: 3, sentence: "Spanish is spoken in many countries around the world.", status: "Perfect", explanation: "Correct present simple passive.", tense: "Present Simple" },
  { id: 4, sentence: "The packages are delivered every morning at 9 AM.", status: "Perfect", explanation: "Correct present simple passive.", tense: "Present Simple" },
  { id: 5, sentence: "Coffee is grow in Brazil and Colombia.", status: "Toxic", explanation: "'grow' should be 'grown'. (is grown)", tense: "Present Simple" },
  { id: 6, sentence: "The rules are explained on the first page.", status: "Perfect", explanation: "Correct present simple passive.", tense: "Present Simple" },
  { id: 7, sentence: "Glass is made from sand and extreme heat.", status: "Perfect", explanation: "Correct present simple passive.", tense: "Present Simple" },
  { id: 8, sentence: "The room is clean by the hotel staff every day.", status: "Toxic", explanation: "'clean' should be 'cleaned'. (is cleaned)", tense: "Present Simple" },
  { id: 9, sentence: "Rice is ate in many Asian countries.", status: "Toxic", explanation: "'ate' is past simple, not past participle. Should be 'eaten'. (is eaten)", tense: "Present Simple" },
  { id: 10, sentence: "The winner of the competition is announced every year in December.", status: "Perfect", explanation: "Correct present simple passive.", tense: "Present Simple" },
  { id: 11, sentence: "The newspaper is deliver to our house every morning.", status: "Toxic", explanation: "'deliver' should be 'delivered'. (is delivered)", tense: "Present Simple" },
  { id: 12, sentence: "Cheese is made from milk.", status: "Perfect", explanation: "Correct present simple passive.", tense: "Present Simple" },
  { id: 13, sentence: "Homework is gave to students every Friday.", status: "Toxic", explanation: "'gave' is past simple, not past participle. Should be 'given'. (is given)", tense: "Present Simple" },
  { id: 14, sentence: "The museum is visited by thousands of tourists every year.", status: "Perfect", explanation: "Correct present simple passive.", tense: "Present Simple" },
  { id: 15, sentence: "Cars are produce in that factory.", status: "Toxic", explanation: "'produce' should be 'produced'. (are produced)", tense: "Present Simple" },

  // ─── PAST SIMPLE PASSIVE ──────────────────────────────────
  { id: 16, sentence: "The new iPhone was released last week.", status: "Perfect", explanation: "Correct past simple passive.", tense: "Past Simple" },
  { id: 17, sentence: "The thief was caught by the police.", status: "Perfect", explanation: "Correct past simple passive.", tense: "Past Simple" },
  { id: 18, sentence: "This ancient coin found in a cave in 1998.", status: "Toxic", explanation: "Missing 'was'. Should be 'was found'.", tense: "Past Simple" },
  { id: 19, sentence: "The homework was finish by the student before dinner.", status: "Toxic", explanation: "'finish' should be 'finished'. (was finished)", tense: "Past Simple" },
  { id: 20, sentence: "The letter was delivered yesterday morning.", status: "Perfect", explanation: "Correct past simple passive.", tense: "Past Simple" },
  { id: 21, sentence: "The building was designed by a famous architect.", status: "Perfect", explanation: "Correct past simple passive.", tense: "Past Simple" },
  { id: 22, sentence: "My wallet was steal on the train.", status: "Toxic", explanation: "'steal' should be 'stolen'. (was stolen)", tense: "Past Simple" },
  { id: 23, sentence: "The window was broke by a baseball.", status: "Toxic", explanation: "'broke' is past simple, not past participle. Should be 'broken'. (was broken)", tense: "Past Simple" },
  { id: 24, sentence: "A lot of money was stolen from the bank.", status: "Perfect", explanation: "Correct past simple passive.", tense: "Past Simple" },
  { id: 25, sentence: "My car was fixed by the mechanic yesterday.", status: "Perfect", explanation: "Correct past simple passive.", tense: "Past Simple" },
  { id: 26, sentence: "The picture was drawed by my little sister.", status: "Toxic", explanation: "Irregular past participle. Should be 'drawn'. (was drawn)", tense: "Past Simple" },
  { id: 27, sentence: "The cookies were ate by the dog.", status: "Toxic", explanation: "'ate' is past simple, not past participle. Should be 'eaten'. (were eaten)", tense: "Past Simple" },
  { id: 28, sentence: "The software was updated automatically last night.", status: "Perfect", explanation: "Correct past simple passive.", tense: "Past Simple" },
  { id: 29, sentence: "The concert tickets were sold out in five minutes.", status: "Perfect", explanation: "Correct past simple passive.", tense: "Past Simple" },
  { id: 30, sentence: "This song was wrote by Ed Sheeran.", status: "Toxic", explanation: "'wrote' is past simple, not past participle. Should be 'written'. (was written)", tense: "Past Simple" },
  { id: 31, sentence: "The cake was eat before I got home.", status: "Toxic", explanation: "'eat' should be 'eaten'. (was eaten)", tense: "Past Simple" },
  { id: 32, sentence: "The mysterious lights were seen in the sky last night.", status: "Perfect", explanation: "Correct past simple passive.", tense: "Past Simple" },
  { id: 33, sentence: "My favorite mug was broke by my cat.", status: "Toxic", explanation: "'broke' should be 'broken'. (was broken)", tense: "Past Simple" },
  { id: 34, sentence: "The electricity was cut off because the bill wasn't paid.", status: "Perfect", explanation: "Double passive combo. Both correct.", tense: "Past Simple" },
  { id: 35, sentence: "She was given a promotion for her excellent work.", status: "Perfect", explanation: "Correct passive with double object.", tense: "Past Simple" },
  { id: 36, sentence: "The instructions was written clearly on the board.", status: "Toxic", explanation: "'Instructions' is plural, so it must be 'were written'.", tense: "Past Simple" },
  { id: 37, sentence: "The terrible news were broadcasted on every channel.", status: "Toxic", explanation: "'News' is uncountable — singular verb. Should be 'The news was broadcast'.", tense: "Past Simple" },
  { id: 38, sentence: "These beautiful photographs were took in Japan.", status: "Toxic", explanation: "'took' is past simple, not past participle. Should be 'taken'. (were taken)", tense: "Past Simple" },
  { id: 39, sentence: "All the information was deleted from the computer.", status: "Perfect", explanation: "'Information' is uncountable, so 'was' is correct.", tense: "Past Simple" },
  { id: 40, sentence: "The vegetables was bought at the local farmer's market.", status: "Toxic", explanation: "Subject-verb agreement: 'vegetables' is plural, needs 'were bought'.", tense: "Past Simple" },

  // ─── PRESENT CONTINUOUS PASSIVE ───────────────────────────
  { id: 41, sentence: "The suspect is being interrogated right now.", status: "Perfect", explanation: "Correct present continuous passive (is being + past participle).", tense: "Present Continuous" },
  { id: 42, sentence: "A new bridge is being built across the river.", status: "Perfect", explanation: "Correct present continuous passive.", tense: "Present Continuous" },
  { id: 43, sentence: "The house is painting right now.", status: "Toxic", explanation: "Should be 'is being painted'. Missing 'being'.", tense: "Present Continuous" },
  { id: 44, sentence: "A new shopping mall is building near the highway.", status: "Toxic", explanation: "Should be 'is being built'. Missing 'being'.", tense: "Present Continuous" },
  { id: 45, sentence: "The meeting is currently being held in the main conference room.", status: "Perfect", explanation: "Correct present continuous passive.", tense: "Present Continuous" },
  { id: 46, sentence: "The road is being repaired by the construction crew.", status: "Perfect", explanation: "Correct present continuous passive.", tense: "Present Continuous" },
  { id: 47, sentence: "My laptop is being fixing at the repair shop.", status: "Toxic", explanation: "'fixing' should be 'fixed'. (is being fixed)", tense: "Present Continuous" },
  { id: 48, sentence: "The documents are being reviewed by the team.", status: "Perfect", explanation: "Correct present continuous passive.", tense: "Present Continuous" },
  { id: 49, sentence: "The food is being preparing in the kitchen.", status: "Toxic", explanation: "'preparing' should be 'prepared'. (is being prepared)", tense: "Present Continuous" },
  { id: 50, sentence: "New employees are being trained this week.", status: "Perfect", explanation: "Correct present continuous passive.", tense: "Present Continuous" },
  { id: 51, sentence: "The windows are being cleaning by the janitor.", status: "Toxic", explanation: "'cleaning' should be 'cleaned'. (are being cleaned)", tense: "Present Continuous" },
  { id: 52, sentence: "A documentary about climate change is being filmed in the Arctic.", status: "Perfect", explanation: "Correct present continuous passive.", tense: "Present Continuous" },

  // ─── PAST CONTINUOUS PASSIVE ──────────────────────────────
  { id: 53, sentence: "The car was being washed when it started to rain.", status: "Perfect", explanation: "Correct past continuous passive (was being + past participle).", tense: "Past Continuous" },
  { id: 54, sentence: "The children were being taught by a substitute teacher.", status: "Perfect", explanation: "Correct past continuous passive.", tense: "Past Continuous" },
  { id: 55, sentence: "The house was being painting when the storm hit.", status: "Toxic", explanation: "'painting' should be 'painted'. (was being painted)", tense: "Past Continuous" },
  { id: 56, sentence: "Dinner was being prepared when the guests arrived.", status: "Perfect", explanation: "Correct past continuous passive.", tense: "Past Continuous" },
  { id: 57, sentence: "The patient was being examining by the doctor.", status: "Toxic", explanation: "'examining' should be 'examined'. (was being examined)", tense: "Past Continuous" },
  { id: 58, sentence: "The evidence was being collected when the detective arrived.", status: "Perfect", explanation: "Correct past continuous passive.", tense: "Past Continuous" },
  { id: 59, sentence: "The bridge was being build when the accident happened.", status: "Toxic", explanation: "'build' should be 'built'. (was being built)", tense: "Past Continuous" },
  { id: 60, sentence: "The packages were being delivered all afternoon.", status: "Perfect", explanation: "Correct past continuous passive.", tense: "Past Continuous" },
  { id: 61, sentence: "The report was being writing by the intern.", status: "Toxic", explanation: "'writing' should be 'written'. (was being written)", tense: "Past Continuous" },
  { id: 62, sentence: "The old building was being demolished when we drove past.", status: "Perfect", explanation: "Correct past continuous passive.", tense: "Past Continuous" },
  { id: 63, sentence: "The cake was being decorating for the birthday party.", status: "Toxic", explanation: "'decorating' should be 'decorated'. (was being decorated)", tense: "Past Continuous" },
  { id: 64, sentence: "The project was being discussed by the managers all morning.", status: "Perfect", explanation: "Correct past continuous passive.", tense: "Past Continuous" },
  { id: 65, sentence: "A new policy was being considered by the government.", status: "Perfect", explanation: "Correct past continuous passive.", tense: "Past Continuous" },
];

// Fisher-Yates shuffle
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Returns all 65 questions, shuffled
export function getRandomGameSet() {
  return shuffle(questionsBank);
}
