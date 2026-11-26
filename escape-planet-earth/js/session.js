import { GAME_DATA } from './game-data.js';

const rooms = GAME_DATA.rooms;
const normalize = value => typeof value === 'string' ? value.trim().toUpperCase() : '';
const elapsed = (team, now) => team.startedAt === null ? 0 : (team.finishedAt ?? now) - team.startedAt;

export function createEscapeSession(now = Date.now) {
  const teams = new Map();
  let started = false;

  function join(id, name) {
    if (teams.has(id)) return true;
    if (teams.size >= 30 || typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 20) return false;
    if ([...teams.values()].some(team => team.name.toLowerCase() === name.trim().toLowerCase())) return false;
    teams.set(id, {
      name: name.trim(), phase: started ? 'story' : 'waiting', startedAt: started ? now() : null,
      room: 0, question: 0, letters: [], finalLetters: [], hints: Array(rooms.length).fill(0),
      revision: 0, penalty: 0, finishedAt: null, progress: 0
    });
    return true;
  }

  function start() {
    if (started || !teams.size) return false;
    started = true;
    const startedAt = now();
    for (const team of teams.values()) Object.assign(team, { phase: 'story', startedAt });
    return true;
  }

  function openRoom(team, room) {
    Object.assign(team, { room, question: 0, phase: 'question', letters: [], hint: null, feedback: null, progress: room * 20 });
  }

  function command(id, event, data) {
    const team = teams.get(id);
    if (!team || data.revision !== team.revision || team.startedAt === null || team.finishedAt !== null) return false;
    const { phase } = team;
    const room = rooms[team.room];
    const question = room.questions[team.question];
    if (event === 'begin' && phase === 'story') openRoom(team, 0);
    else if (event === 'hint' && (phase === 'question' || phase === 'code') && team.hints[team.room] < 2) {
      const count = ++team.hints[team.room];
      const hint = phase === 'code' ? room['codeHint' + count] : question['hint' + count];
      team.hint = hint.text;
      team.penalty += hint.penaltyMs;
    } else if (event === 'answer' && phase === 'question') {
      const answer = data.value;
      const choice = question.type === 'multiple-choice';
      if (choice ? !Number.isInteger(answer) || answer < 0 || answer >= question.options.length : typeof answer !== 'boolean') return false;
      const correct = answer === (choice ? question.correctIndex : question.correctAnswer);
      const letter = correct ? question.correctLetter : question.fakeLetter;
      team.letters.push(letter);
      if (correct) team.progress += 3;
      team.feedback = { letter, correct, text: correct ? question.letterExplanation : 'That answer may have given you a decoy letter.' };
      team.hint = null;
      team.phase = 'letter';
    } else if (event === 'continue' && phase === 'letter') {
      team.question++;
      team.feedback = null;
      team.phase = team.question < room.questions.length ? 'question' : 'code';
    } else if (event === 'unlock' && phase === 'code') {
      const correct = normalize(data.value) === room.codeWord;
      team.feedback = { correct };
      if (correct) {
        const positions = room.finalLetterPositions ?? [room.finalLetterPosition];
        team.finalLetters.push(...positions.map(index => room.codeWord[index]));
        team.phase = 'unlocked';
        team.progress = Math.min(99, (team.room + 1) * 20);
      }
    } else if (event === 'continue' && phase === 'unlocked') {
      if (team.room + 1 < rooms.length) openRoom(team, team.room + 1);
      else Object.assign(team, { phase: 'final', feedback: null });
    } else if (event === 'escape' && phase === 'final') {
      const correct = normalize(data.value) === GAME_DATA.finalEscape.answer;
      team.feedback = { correct };
      if (correct) Object.assign(team, { phase: 'finished', finishedAt: now(), progress: 100 });
    } else if (event === 'retry' && phase === 'code') openRoom(team, team.room);
    else if (event === 'restart' && ['question', 'code', 'final'].includes(phase)) {
      team.finalLetters = [];
      openRoom(team, 0);
    } else return false;
    team.revision++;
    return true;
  }

  function snapshot(id) {
    const team = teams.get(id);
    return { ...team, elapsed: elapsed(team, now()) };
  }
  function leaderboard() {
    return [...teams.values()].map(team => ({
      name: team.name, room: team.room + 1, progress: team.progress,
      startedAt: team.startedAt, penalty: team.penalty, elapsed: elapsed(team, now()),
      finished: team.finishedAt !== null
    })).sort((a, b) => b.progress - a.progress || a.elapsed + a.penalty - b.elapsed - b.penalty);
  }
  return { teams, join, start, command, snapshot, leaderboard, leave: id => teams.delete(id) };
}
