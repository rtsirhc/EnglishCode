export function markedIndexes(answers, key) {
  return answers.flatMap((answer, index) => answer[key] ? [index] : []);
}

export function hydrateAnswers(rawAnswers, found = [], uncovered = []) {
  const foundSet = new Set(found);
  const uncoveredSet = new Set(uncovered);
  return rawAnswers.map(([text, aliases, points], index) => ({
    text,
    aliases,
    points,
    found: foundSet.has(index),
    uncovered: uncoveredSet.has(index),
  }));
}

export function nextUncoveredIndex(answers) {
  return answers.findIndex(answer => !answer.found && !answer.uncovered);
}
