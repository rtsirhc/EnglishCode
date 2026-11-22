// Game 1: 35 Grammar Transformation Questions
// Covers: Simple Present, Simple Past, Present Continuous, Past Continuous

const game1Questions = [
  // ── SIMPLE PRESENT ──────────────────────────────────────────────────
  {
    id: 1,
    original_sentence: "She plays tennis every day.",
    request: "Change to Simple Past",
    correct_answer: "She played tennis every day.",
  },
  {
    id: 2,
    original_sentence: "They don't eat meat.",
    request: "Change to Affirmative",
    correct_answer: "They eat meat.",
  },
  {
    id: 3,
    original_sentence: "He works at a hospital.",
    request: "Change to Negative",
    correct_answer: "He doesn't work at a hospital.",
  },
  {
    id: 4,
    original_sentence: "Do you speak Spanish?",
    request: "Change to Affirmative Statement",
    correct_answer: "You speak Spanish.",
  },
  {
    id: 5,
    original_sentence: "The children go to bed at nine.",
    request: "Change to a Yes/No Question",
    correct_answer: "Do the children go to bed at nine?",
  },
  {
    id: 6,
    original_sentence: "She doesn't like cold weather.",
    request: "Change to Present Continuous",
    correct_answer: "She isn't liking cold weather. / She is not used to cold weather.",
  },
  {
    id: 7,
    original_sentence: "My brother reads comic books every weekend.",
    request: "Change to Negative",
    correct_answer: "My brother doesn't read comic books every weekend.",
  },
  {
    id: 8,
    original_sentence: "We visit our grandparents on Sundays.",
    request: "Change to Simple Past",
    correct_answer: "We visited our grandparents on Sundays.",
  },
  // ── SIMPLE PAST ─────────────────────────────────────────────────────
  {
    id: 9,
    original_sentence: "He called his mother last night.",
    request: "Change to Negative",
    correct_answer: "He didn't call his mother last night.",
  },
  {
    id: 10,
    original_sentence: "They didn't finish the project.",
    request: "Change to Affirmative",
    correct_answer: "They finished the project.",
  },
  {
    id: 11,
    original_sentence: "She bought a new dress yesterday.",
    request: "Change to a Yes/No Question",
    correct_answer: "Did she buy a new dress yesterday?",
  },
  {
    id: 12,
    original_sentence: "Did you see that movie?",
    request: "Change to Negative Statement",
    correct_answer: "You didn't see that movie.",
  },
  {
    id: 13,
    original_sentence: "We went to the beach last summer.",
    request: "Change to Negative",
    correct_answer: "We didn't go to the beach last summer.",
  },
  {
    id: 14,
    original_sentence: "The students studied hard for the exam.",
    request: "Change to a Yes/No Question",
    correct_answer: "Did the students study hard for the exam?",
  },
  {
    id: 15,
    original_sentence: "He didn't understand the instructions.",
    request: "Change to Affirmative",
    correct_answer: "He understood the instructions.",
  },
  {
    id: 16,
    original_sentence: "My parents travelled to Italy two years ago.",
    request: "Change to Negative",
    correct_answer: "My parents didn't travel to Italy two years ago.",
  },
  {
    id: 17,
    original_sentence: "She lost her keys this morning.",
    request: "Change to Past Continuous",
    correct_answer: "She was losing her keys this morning. / She was looking for her keys this morning.",
  },
  // ── PRESENT CONTINUOUS ──────────────────────────────────────────────
  {
    id: 18,
    original_sentence: "He is watching TV right now.",
    request: "Change to Negative",
    correct_answer: "He isn't watching TV right now.",
  },
  {
    id: 19,
    original_sentence: "They aren't playing football.",
    request: "Change to Affirmative",
    correct_answer: "They are playing football.",
  },
  {
    id: 20,
    original_sentence: "Is she cooking dinner?",
    request: "Change to Affirmative Statement",
    correct_answer: "She is cooking dinner.",
  },
  {
    id: 21,
    original_sentence: "We are studying for our exams.",
    request: "Change to a Yes/No Question",
    correct_answer: "Are we studying for our exams?",
  },
  {
    id: 22,
    original_sentence: "The baby is sleeping in the crib.",
    request: "Change to Negative",
    correct_answer: "The baby isn't sleeping in the crib.",
  },
  {
    id: 23,
    original_sentence: "She is talking on the phone.",
    request: "Change to Simple Past",
    correct_answer: "She talked on the phone.",
  },
  {
    id: 24,
    original_sentence: "Are you listening to music?",
    request: "Change to Negative Statement",
    correct_answer: "You aren't listening to music.",
  },
  {
    id: 25,
    original_sentence: "They are building a new bridge.",
    request: "Change to Past Continuous",
    correct_answer: "They were building a new bridge.",
  },
  // ── PAST CONTINUOUS ─────────────────────────────────────────────────
  {
    id: 26,
    original_sentence: "She was reading a book when he called.",
    request: "Change to Negative",
    correct_answer: "She wasn't reading a book when he called.",
  },
  {
    id: 27,
    original_sentence: "They weren't sleeping at midnight.",
    request: "Change to Affirmative",
    correct_answer: "They were sleeping at midnight.",
  },
  {
    id: 28,
    original_sentence: "Was he driving when the accident happened?",
    request: "Change to Affirmative Statement",
    correct_answer: "He was driving when the accident happened.",
  },
  {
    id: 29,
    original_sentence: "I was cooking dinner at seven o'clock.",
    request: "Change to a Yes/No Question",
    correct_answer: "Were you cooking dinner at seven o'clock?",
  },
  {
    id: 30,
    original_sentence: "The children were playing in the garden.",
    request: "Change to Negative",
    correct_answer: "The children weren't playing in the garden.",
  },
  {
    id: 31,
    original_sentence: "He was working late last night.",
    request: "Change to Simple Past",
    correct_answer: "He worked late last night.",
  },
  {
    id: 32,
    original_sentence: "Were they having a meeting at noon?",
    request: "Change to Negative Statement",
    correct_answer: "They weren't having a meeting at noon.",
  },
  {
    id: 33,
    original_sentence: "She was singing in the shower.",
    request: "Change to Present Continuous",
    correct_answer: "She is singing in the shower.",
  },
  {
    id: 34,
    original_sentence: "We weren't paying attention in class.",
    request: "Change to Affirmative",
    correct_answer: "We were paying attention in class.",
  },
  {
    id: 35,
    original_sentence: "He was waiting for the bus when it started to rain.",
    request: "Change to a Yes/No Question",
    correct_answer: "Was he waiting for the bus when it started to rain?",
  },
];

export default game1Questions;
