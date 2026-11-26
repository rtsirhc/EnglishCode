const TURN_MS = 15000;

export function createGame(rosters) {
  return {
    teams: rosters.map((students, i) => ({ id: i + 1, score: 0, students, speaker: 0 })),
    championId: 1, challengerId: 2, activeTalkerId: 1, qIndex: 0, revealed: [],
    deadline: null, remaining: TURN_MS, event: null, eventId: 0, finished: false
  };
}

export function winners(state) {
  const high = Math.max(...state.teams.map(team => team.score));
  return state.finished || high >= 1000 ? state.teams.filter(team => team.score === high).map(team => team.id) : [];
}

export function turnSeconds(state, now) {
  return Math.ceil(Math.max(0, state.deadline === null ? state.remaining : state.deadline - now) / 1000);
}

function switchTurn(state, now, event) {
  return {
    ...state, activeTalkerId: state.activeTalkerId === state.championId ? state.challengerId : state.championId,
    deadline: now + TURN_MS, remaining: TURN_MS, event, eventId: state.eventId + 1
  };
}

export function reduceGame(state, action) {
  const { type, now } = action;
  if (type === 'replay') return { ...createGame(state.teams.map(team => team.students)), eventId: state.eventId + 1 };
  if (type === 'score' && !state.finished) {
    const next = { ...state, teams: state.teams.map(team => team.id === action.id ? { ...team, score: action.score } : team) };
    if (winners(next).length) next.deadline = null;
    return next;
  }
  if (winners(state).length) return state;
  if (type === 'tick') {
    if (state.deadline !== null && now >= state.deadline) return switchTurn(state, now, 'strike');
    return state;
  }
  if (type === 'reveal') {
    if (state.revealed.includes(action.index)) return state;
    if (state.deadline !== null && now >= state.deadline) return switchTurn(state, now, 'strike');
    const next = switchTurn({
      ...state, revealed: [...state.revealed, action.index],
      teams: state.teams.map(team => team.id === state.activeTalkerId ? { ...team, score: team.score + action.points } : team)
    }, now, 'reveal');
    if (winners(next).length || next.revealed.length === action.total) next.deadline = null;
    return next;
  }
  if (type === 'strike') return switchTurn(state, now, 'strike');
  if (type === 'toggle') {
    if (state.deadline === null) return { ...state, deadline: now + state.remaining };
    if (now >= state.deadline) return switchTurn(state, now, 'strike');
    return { ...state, deadline: null, remaining: state.deadline - now };
  }
  if (type === 'reset') return { ...state, deadline: null, remaining: TURN_MS };
  if (type === 'next') return state.qIndex + 1 < action.total
    ? { ...state, qIndex: state.qIndex + 1, revealed: [], activeTalkerId: state.challengerId, deadline: null, remaining: TURN_MS }
    : { ...state, finished: true, deadline: null };
  if (type === 'draw') return { ...state, teams: state.teams.map(team => team.id === action.id
    ? { ...team, speaker: (team.speaker + 1) % team.students.length } : team) };
  if (type === 'talker') return { ...state, activeTalkerId: action.id, deadline: null, remaining: TURN_MS };
  if (type === 'match') {
    const { championId, challengerId } = action;
    if (championId === challengerId) return state;
    return { ...state, championId, challengerId, activeTalkerId: action.activeTalkerId ?? championId, deadline: null, remaining: TURN_MS };
  }
  return state;
}

export function projectorState(state, question, now) {
  return {
    teams: state.teams.map(team => ({ id: team.id, score: team.score, activeStudent: team.students[team.speaker] })),
    championId: state.championId, challengerId: state.challengerId, activeTalkerId: state.activeTalkerId,
    qIndex: state.qIndex, winners: winners(state), question: { question: question.question,
      answers: question.answers.map((answer, index) => state.revealed.includes(index) ? answer : null) },
    timerRemaining: turnSeconds(state, now), event: state.event, eventId: state.eventId
  };
}

export function projectorUrl(room) {
  const url = new URL(location.pathname, location.origin);
  url.search = new URLSearchParams({ role: 'projector', room });
  return url.href;
}
