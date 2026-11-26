export const PREPOSITIONS = ['at', 'into', 'onto', 'off', 'in', 'on'];

function reportParts(text) {
    const words = text.toLowerCase().match(/[a-z]+(?:['’-][a-z]+)*/g) || [];
    const sentences = text.trim().split(/[.!?]+(?:\s+|$)/).filter(sentence => sentence.trim());
    return { words, sentences };
}

export function validatePath(text) {
    const { words, sentences } = reportParts(text);
    const missing = PREPOSITIONS.filter(word => !words.includes(word));
    if (missing.length) return { valid: false, message: 'Include these prepositions as separate words: ' + missing.join(', ') + '.' };
    if (sentences.length < 3 || sentences.length > 5) return { valid: false, message: 'Write three to five sentences to explain the route.' };
    return { valid: true, message: 'Structure checked. Review the route and the use of each preposition before approving the report.' };
}

export function validateIndictment(text) {
    const { words, sentences } = reportParts(text);
    if (words.length < 100) return { valid: false, message: 'Write at least 100 words. Current count is ' + words.length + '.' };
    const prepositions = PREPOSITIONS.filter(word => words.includes(word));
    if (prepositions.length < 5) return { valid: false, message: 'Use at least five of the six requested prepositions.' };
    const perfectSentences = sentences.filter(sentence => /\bhad\s+(?:[a-z]+ed|been|begun|broken|brought|built|bought|caught|come|cut|done|drunk|driven|eaten|fallen|felt|forgotten|found|given|gone|got|gotten|had|heard|held|hidden|kept|known|left|lost|made|met|paid|put|read|run|said|seen|sent|set|shown|shut|sat|slept|sold|spoken|spent|stood|stolen|swum|taken|taught|thought|told|understood|woken|worn|won|written)\b/i.test(sentence));
    if (perfectSentences.length < 3) return { valid: false, message: 'Include a had + past participle form in at least three different sentences.' };
    return { valid: true, message: 'Structure checked. The teacher should review the past-perfect forms, prepositions and reasoning before approving the indictment.' };
}
