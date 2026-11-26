export const MODELS = ['quiz', 'words', 'sentences', 'survey', 'axes', 'dialogues'];
export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
export const EXAMPLES = {
  axes: { subject: 'The windows', participle: 'cleaned' },
  words: { word: 'bakery', clue: 'A place where people buy bread.', translation: 'panadería' },
  quiz: { question: 'She ___ to school every day.', options: ['go', 'goes', 'going'], answer: 'goes', explanation: 'Use -s with she in the present simple.' },
  sentences: { text: 'She goes to school every day.', correct: true, correction: 'She goes to school every day.', explanation: 'Present simple: she + goes.' },
  dialogues: { title: 'The wrong drink', order: 'Two teas, please.', reply: 'Here is your coffee.', correction: 'Excuse me, we ordered two teas.', grammar: '' },
  survey: { question: 'Name something you find in a classroom.', answers: [{ text: 'board', points: 40 }, { text: 'desk', points: 35 }, { text: 'book', points: 25 }] }
};
const plain = (v, name, max = 2000) => {
  if (typeof v !== 'string' || !v.trim() || v.length > max) throw new Error(`${name} must be non-empty text (up to ${max} characters).`);
  return v.trim();
};
export function validatePack(input, expectedModel, maxQuizOptions = 6) {
  if (typeof input === 'string' && input.length > 1000000) throw new Error('Use a content pack smaller than 1 MB.');
  const data = typeof input === 'string' ? JSON.parse(input) : input;
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use a JSON object with version, title, level, model, and items.');
  if (data.version !== 1) throw new Error('Content pack version must be 1.');
  if (!LEVELS.includes(data.level)) throw new Error('Level must be A1, A2, B1, B2, C1, or C2.');
  if (!MODELS.includes(data.model) || (expectedModel && data.model !== expectedModel)) throw new Error(`Content model must be ${expectedModel || MODELS.join(', ')}.`);
  if (!Array.isArray(data.items) || data.items.length < 1 || data.items.length > 500) throw new Error('Include between 1 and 500 items.');
  const items = data.items.map((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error(`Item ${index + 1} must be an object.`);
    const name = `Item ${index + 1}`;
    if (data.model === 'axes') return { subject: plain(item.subject, name + ': subject', 80), participle: plain(item.participle, name + ': participle', 80) };
    if (data.model === 'words') return { word: plain(item.word, `${name}: word`, 120), clue: plain(item.clue, `${name}: clue`), ...(item.translation ? { translation: plain(item.translation, `${name}: translation`, 120) } : {}) };
    if (data.model === 'dialogues') return {
      title: plain(item.title, `${name}: title`, 120),
      order: plain(item.order, `${name}: order`, 450),
      reply: plain(item.reply, `${name}: reply`, 450),
      correction: plain(item.correction, `${name}: correction`, 450),
      grammar: item.grammar === undefined || item.grammar === '' ? '' : plain(item.grammar, `${name}: grammar`, 240),
    };
    if (data.model === 'quiz') {
      if (!Array.isArray(item.options) || item.options.length < 2 || item.options.length > maxQuizOptions) throw new Error(`${name}: use 2–${maxQuizOptions} options.`);
      const options = item.options.map(o => plain(o, `${name}: option`, 300));
      if (new Set(options).size !== options.length) throw new Error(`${name}: options must be different.`);
      const answer = plain(item.answer, `${name}: answer`, 300);
      if (!options.includes(answer)) throw new Error(`${name}: answer must exactly match one option.`);
      return { question: plain(item.question, `${name}: question`), options, answer, explanation: item.explanation ? plain(item.explanation, `${name}: explanation`) : '' };
    }
    if (data.model === 'sentences') {
      if (typeof item.correct !== 'boolean') throw new Error(`${name}: correct must be true or false.`);
      if (!item.correct && !item.correction) throw new Error(`${name}: incorrect sentences need a correction.`);
      return { text: plain(item.text, `${name}: text`), correct: item.correct, correction: item.correction ? plain(item.correction, `${name}: correction`) : item.text.trim(), explanation: item.explanation ? plain(item.explanation, `${name}: explanation`) : '' };
    }
    if (!Array.isArray(item.answers) || item.answers.length < 2 || item.answers.length > 10) throw new Error(`${name}: use 2–10 survey answers.`);
    const answers = item.answers.map(a => {
      if (!a || !Number.isInteger(a.points) || a.points < 1 || a.points > 100) throw new Error(`${name}: answer points must be integers from 1 to 100.`);
      return { text: plain(a.text, `${name}: answer`, 200), points: a.points };
    });
    if (new Set(answers.map(a => a.text.toLowerCase())).size !== answers.length) throw new Error(`${name}: survey answers must be different.`);
    return { question: plain(item.question, `${name}: question`), answers };
  });
  if (data.model === 'axes' && (new Set(items.map(item => item.subject.toLowerCase())).size < 10 ||
      new Set(items.map(item => item.participle.toLowerCase())).size < 10)) {
    throw new Error('Board packs need at least 10 different subjects and 10 different participles.');
  }
  return { version: 1, title: plain(data.title, 'Title', 120), level: data.level, model: data.model, items };
}
export function examplePack(model = 'quiz') {
  const subjects = ['The windows', 'The letter', 'The road', 'The books', 'The rooms', 'The car', 'The keys', 'The bags', 'The computer', 'The pictures'];
  const participles = ['cleaned', 'written', 'built', 'read', 'painted', 'repaired', 'found', 'carried', 'used', 'taken'];
  const items = model === 'axes' ? subjects.map((subject, index) => ({ subject, participle: participles[index] })) : [structuredClone(EXAMPLES[model])];
  return { version: 1, title: 'My classroom pack', level: 'A2', model, items };
}
export function aiPrompt(model, maxQuizOptions = 6) {
  if (model === 'dialogues') return `Create 15 original, age-appropriate customer-service dialogues about [MY TOPIC] at CEFR [MY LEVEL]. Return only JSON using this version 1 structure: ${JSON.stringify(examplePack(model), null, 2)}\nEach order is the customer's request. Make the worker's brief reply contain a factual mistake that the learner can correct politely. Write a natural model correction from the customer. Optionally give a separate grammar correction in grammar, or use an empty string. Use CEFR A1, A2, B1, B2, C1 or C2. Use fictional details. Keep lines short and exclude HTML, links and personal information.`;
  return `Create an English teaching content pack about [MY TOPIC] for CEFR [MY LEVEL]. Return only valid JSON, without Markdown fences. Use exactly this version 1 structure: ${JSON.stringify(examplePack(model), null, 2)}\nCreate 15 original, age-appropriate items. Keep model "${model}". For quiz items, answer must exactly match one of 2–${maxQuizOptions} unique options. For sentences, correct must be a boolean and incorrect sentences need a correction. For survey items, provide 2–10 different answers with integer points 1–100. For words, include a helpful clue. For axes, provide at least 10 different subjects and 10 different past participles, one pair per item. Each list becomes a board axis, so the subjects and participles can combine to practise passive sentences. Use a CEFR level from A1, A2, B1, B2, C1, C2. Do not include student names, personal information, HTML, or links. Verify answers and explanations. Replace the topic and level placeholders with my instructions before generating.`;
}
