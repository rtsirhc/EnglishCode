/* ── Vocabulary Lists for Spelling Bee ── */

export const GRADE_5_WORDS = [
  'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December', 'xylophone', 'drums', 'flute',
  'table tennis', 'golf', 'hockey', 'volleyball', 'the USA', 'the UK', 'Brazil',
  'Italy', 'Mexico', 'Japan', 'Australia', 'city', 'town', 'the countryside',
  'the suburbs', 'games console', 'headphone', 'laptop', 'calculator', 'cell phone',
  'tablet', 'camera', 'watchband', 'thirty', 'forty', 'fifty', 'sixty-four',
  'seventy-two', 'eighty-six', 'ninety-nine', 'one hundred', 'plus', 'minus',
  'times', 'divided by', 'equals', 'get up', 'get dressed', 'go to school',
  'play with friends', 'take a shower', 'go to bed', 'have breakfast', 'have lunch',
  'have dinner', 'have a snack', 'clean the bedroom', 'make the bed', 'do the laundry',
  'cook dinner', 'wash the dishes', 'fold clothes', 'vacuum the carpet', 'set the table',
  'walk the dog', 'water the plants', 'cut the grass', 'take out the trash',
];

export const GRADE_6_WORDS = [
  'mask', 'pin', 'autograph', 'key ring', 'model', 'bracelet', 'comic book',
  'sticker', 'colorful', 'shiny', 'plain', 'printed', 'drive', 'find', 'study',
  'teach', 'fix', 'dig', 'break', 'carry', 'shout', 'whisper', 'touch', 'share',
  'hot air balloon', 'truck', 'bus', 'van', 'taxi', 'tram', 'scooter', 'motorcycle',
  'expensive', 'cheap', 'crowded', 'comfortable', 'boring', 'exciting', 'steep',
  'high', 'low', 'safe', 'dangerous', 'flat', 'score', 'child', 'children', 'woman',
  'women', 'man', 'men', 'baby', 'babies', 'boy', 'girl', 'person', 'people',
  'teenager', 'signpost', 'flag', 'fountain', 'bench', 'flour', 'chocolate chips',
  'eggs', 'oil', 'vanilla', 'honey', 'nuts', 'sugar', 'bowl', 'plate', 'spoon', 'cup',
];

/**
 * Score a word by difficulty.
 * Higher score = harder word.
 *   - base: string length
 *   - multi-word bonus: +4 per extra word
 *   - special chars (hyphens, periods): +2 each
 */
function getDifficultyScore(word) {
  const len = word.length;
  const wordCount = word.trim().split(/\s+/).length;
  const specialChars = (word.match(/[-.']/g) || []).length;
  return len + (wordCount - 1) * 4 + specialChars * 2;
}

/**
 * Shuffle an array in place (Fisher-Yates).
 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build a difficulty-sorted word queue.
 * Splits into 3 tiers (easy/medium/hard), shuffles within each tier,
 * then concatenates them in order.
 */
export function buildWordQueue(grade) {
  const rawList = grade === 5 ? [...GRADE_5_WORDS] : [...GRADE_6_WORDS];

  // Score and sort ascending
  const scored = rawList.map((w) => ({ word: w, score: getDifficultyScore(w) }));
  scored.sort((a, b) => a.score - b.score);

  // Split into 3 tiers
  const third = Math.ceil(scored.length / 3);
  const easy = scored.slice(0, third).map((s) => s.word);
  const medium = scored.slice(third, third * 2).map((s) => s.word);
  const hard = scored.slice(third * 2).map((s) => s.word);

  return [...shuffle(easy), ...shuffle(medium), ...shuffle(hard)];
}
