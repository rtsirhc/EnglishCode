import { read } from '../../../gallery/shared/storage.js';
import { validatePack } from '../../../gallery/shared/content.js';
export let lessonTitle = '';
let customItems;
try {
  const pack = validatePack(read('pack:timezone-game', null), 'words');
  lessonTitle = pack.title;
  customItems = pack.items.map(item => ({ question: item.clue, answer: item.word }));
} catch { /* Use the authored English bank. */ }

/**
 * Grammar & Vocabulary Game — Question Data
 * 30 questions text-based questions.
 */

const rawQuestions = [
    { question: 'What electronic accessory do you use to protect a cellular device?', answer: 'Cell phone cover' },
    { question: 'Fill in the blank for this positive sentence: "He _______ a laptop."', answer: 'wants' },
    { question: 'Fill in the blank for this negative sentence: "They _______ want laptops."', answer: 'don\'t' },
    { question: 'Fill in the blank for this negative sentence: "She _______ want a laptop."', answer: 'doesn\'t' },
    { question: 'If the answer is "He wants a tablet," what is the question?', answer: 'What does he want?' },
    { question: 'How do you spell the number 15?', answer: 'fifteen' },
    { question: 'How do you spell the number 40?', answer: 'forty' },
    { question: 'How do you spell the number 100?', answer: 'one hundred' },
    { question: 'What word completes the phrase: "A ______ of chocolates"?', answer: 'box' },
    { question: 'What word completes the phrase: "A ______ of bananas"?', answer: 'bunch' },
    { question: 'What word completes the phrase: "A ______ of olives"?', answer: 'jar' },
    { question: 'What word completes the phrase: "A ______ of apples"?', answer: 'bag' },
    { question: 'What question do you ask to find out the price of something, expecting an answer like "It\'s forty-two dollars"?', answer: 'How much is it?' },
    { question: 'What question asks for the quantity of an item, like apples?', answer: 'How many apples are there?' },
    { question: 'In math vocabulary, what word is used for the "+" sign?', answer: 'plus' },
    { question: 'In math vocabulary, what word is used for the "x" sign?', answer: 'times' },
    { question: 'In math vocabulary, what word is used for the "=" sign?', answer: 'equals' },
    { question: 'If someone asks "Which one do you want?", how do you reply that you want a gaming system?', answer: 'I want the games console.' },
    { question: 'What is the correct form of "get up" when talking about a boy?', answer: 'gets up' },
    { question: 'What is the correct form of "have breakfast" when talking about a girl?', answer: 'has breakfast' },
    { question: 'What is the correct form of "do my homework" when talking about a boy?', answer: 'does his homework' },
    { question: 'Fill in the blank: "I ______ to school at 6:30 am."', answer: 'go' },
    { question: 'Fill in the blank: "She ______ to school at 6:30 am."', answer: 'goes' },
    { question: 'What time of day does "am" stand for?', answer: 'in the morning' },
    { question: 'If the time is between 7:00 pm and 9:59 pm, what part of the day is it?', answer: 'in the evening' },
    { question: 'If the time is between 10 pm and 11:59 pm, what part of the day is it?', answer: 'at night' },
    { question: 'What question word means the same thing as "What time"?', answer: 'When' },
    { question: 'What is it called when the sun comes up?', answer: 'sunrise' },
    { question: 'What is it called when the sun comes down?', answer: 'sunset' },
    { question: 'If someone says "I get up at 5 in the morning", what is a common Everyday English response?', answer: 'That\'s really early' },
]

// Simple seeded shuffle or Math.random shuffle
const shuffled = [...(customItems || rawQuestions)];
for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
}

export const questions = shuffled.map((q, index) => ({
    id: index + 1,
    ...q,
}))
