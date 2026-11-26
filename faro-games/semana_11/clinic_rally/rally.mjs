import { isCorrect, makeDeck, publicTask, shuffle } from './bank.mjs';
import { skillCorrect, skillFor } from './mechanics.mjs';

export function createGame(code, mode, config, pack) {
  const count = Number(config.count);
  if (!Number.isInteger(count) || count < 1 || count > 5) throw new Error('Choose 1–5 teams.');
  const playlist = [...new Set(config.playlist)].filter(id => Number.isInteger(id) && id >= 0 && id < 5);
  if (!playlist.length) throw new Error('Choose at least one game.');
  const minutes = Math.max(3, Math.min(20, Number(config.minutes) || 6));
  const level = ['support', 'core', 'stretch'].includes(config.level) ? config.level : 'core';
  const deck = config.bank === 'custom' && pack ? shuffle(pack.items).map((item, index) => ({
    id: String(index), type: 'choice', prompt: item.question,
    options: shuffle(item.options).map(text => ({ id: String(item.options.indexOf(text)), text })),
    answer: String(item.options.indexOf(item.answer)), explanation: item.explanation || item.answer,
  })) : makeDeck(level, config.bank);
  return {
    id: crypto.randomUUID(), code, connection: mode, phase: 'lobby', arena: 0,
    goal: 12, remaining: minutes * 60000, minutes, playlist, deck, dexterity: config.dexterity,
    winners: [], revision: 0,
    teams: Array.from({ length: count }, (_, id) => ({
      id, name: String(config.names?.[id] || '').trim().slice(0, 24) || `Team ${id + 1}`,
      steps: 0, total: 0, wins: 0, attempts: 0, cursor: 0, token: crypto.randomUUID(),
    })),
  };
}

export function rallyEngine(game, now = Date.now) {
  const owners = new Map();
  function snapshot() {
    const { id, code, connection, phase, arena, playlist, goal, remaining, deadline, winners, revision } = game;
    return { game: { id, code, connection, phase, arena, playlist, goal, remaining, deadline, winners, revision,
      mode: playlist[arena], rounds: playlist.length,
      teams: game.teams.map(({ id, name, steps, total, wins }) => ({ id, name, steps, total, wins, online: owners.has(id) })),
    } };
  }
  function finish() {
    game.phase = 'finished';
    game.remaining = 0;
    const highest = Math.max(...game.teams.map(team => team.steps));
    const leaders = game.teams.filter(team => highest > 0 && team.steps === highest);
    game.winners = leaders.map(team => team.id);
    for (const team of leaders) team.wins++;
  }
  function tick() {
    if (game.phase !== 'running' || now() < game.deadline) return false;
    finish();
    game.revision++;
    return true;
  }
  function admin(action) {
    tick();
    if (action === 'start' && ['lobby', 'paused'].includes(game.phase)) {
      game.phase = 'running';
      game.deadline = now() + game.remaining;
    } else if (action === 'pause' && game.phase === 'running') {
      game.remaining = Math.max(0, game.deadline - now());
      game.phase = 'paused';
    } else if (action === 'finish' && ['running', 'paused'].includes(game.phase)) {
      finish();
    } else if (action === 'next' && game.phase === 'finished' && game.arena + 1 < game.playlist.length) {
      game.arena++;
      game.phase = 'lobby';
      game.remaining = game.minutes * 60000;
      game.winners = [];
      for (const team of game.teams) Object.assign(team, { steps: 0, attempts: 0, last: null, skill: null });
    } else throw new Error('That action is unavailable.');
    game.revision++;
    return snapshot();
  }
  function leave(sender) {
    for (const [id, owner] of owners) {
      if (sender === owner) {
        owners.delete(id);
        game.revision++;
        return true;
      }
    }
    return false;
  }
  function request(route, body, sender) {
    if (route === 'state') return snapshot();
    const team = game.teams.find(team => team.id === Number(body.team));
    if (route === 'join') {
      if (body.code !== game.code || !team) throw new Error('Check your room code and team.');
      const owner = owners.get(team.id);
      if (owner && owner !== sender) throw new Error('This team already has a screen.');
      leave(sender);
      // Rotate the credential when a different participant takes an available team.
      if (body.token !== team.token) team.token = crypto.randomUUID();
      owners.set(team.id, sender);
      game.revision++;
      return { team: team.id, token: team.token, game: game.id };
    }
    if (!team || owners.get(team.id) !== sender || body.game !== game.id || body.token !== team.token) {
      throw Object.assign(new Error('Join the current race again.'), { status: 401 });
    }
    const question = game.deck[team.cursor % game.deck.length];
    const key = team.skill?.id ?? `${game.arena}:${team.cursor}:${question.id}`;
    if (route === 'task') {
      const task = game.phase === 'running' ? { ...(team.skill ?? publicTask(question)), key } : null;
      return { ...snapshot(), task };
    }
    if (route !== 'answer') throw new Error('Unknown game action.');
    if (team.last?.request === body.request) return team.last;
    if (game.phase !== 'running') throw new Error('The race is paused or finished.');
    if (body.task !== key) throw Object.assign(new Error('This challenge was already answered.'), { status: 409 });

    const skill = Boolean(team.skill);
    const correct = skill ? skillCorrect(team.skill, body.answer) : isCorrect(question, body.answer);
    if (skill) {
      if (correct) team.skill = null;
    } else {
      team.attempts++;
      team.cursor++;
      if (correct) {
        team.steps++;
        team.total++;
      }
      if (team.steps >= game.goal) finish();
      else if (game.dexterity && team.attempts % 3 === 0) team.skill = skillFor(team, game.arena);
    }
    const explanation = skill ? (correct ? '¡Camino libre!' : 'Inténtalo otra vez.') : question.explanation;
    team.last = { request: body.request, correct, skill, explanation, steps: team.steps };
    game.revision++;
    return team.last;
  }
  return { snapshot, admin, request, leave, tick };
}
