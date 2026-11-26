import { roomTransport } from '../gallery/shared/room-transport.js';
import { gameRuntime } from '../gallery/shared/runtime.js';

const $ = id => document.getElementById(id);
function click(id) {
  const button = $(id);
  if (button?.getClientRects().length && !button.disabled) button.click();
}
const { pack } = gameRuntime('grammar-auction', 'sentences', {
  answer1: () => click('legalBtn'), answer2: () => click('illegalBtn'),
  confirm: () => click(role === 'client' ? 'submitBetBtn' : 'fcCheck'),
  next: () => click($('replay-btn')?.getClientRects().length ? 'replay-btn' : 'nextQuestionBtn')
});
const MAX_BALANCE = 1_000_000_000_000;


// ===== SOUND EFFECTS (Web Audio API — no external files) =====
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx;
function ensureAudio() { if (!audioCtx && AudioCtx) audioCtx = new AudioCtx(); return audioCtx; }

function playStartSound() {
  const ctx = ensureAudio();
  if (!ctx) return;
  [0, 0.15, 0.3].forEach((delay, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = [523, 659, 784][i];
    gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.3);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + 0.3);
  });
}

function playBuzzerSound() {
  const ctx = ensureAudio();
  if (!ctx) return;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  const gain2 = ctx.createGain();
  osc1.connect(gain1); gain1.connect(ctx.destination);
  osc2.connect(gain2); gain2.connect(ctx.destination);
  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(150, ctx.currentTime);
  osc1.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.8);
  gain1.gain.setValueAtTime(0.25, ctx.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
  osc1.start(ctx.currentTime); osc1.stop(ctx.currentTime + 0.8);

  osc2.type = 'square';
  osc2.frequency.setValueAtTime(440, ctx.currentTime);
  osc2.frequency.linearRampToValueAtTime(220, ctx.currentTime + 0.5);
  gain2.gain.setValueAtTime(0.15, ctx.currentTime);
  gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
  osc2.start(ctx.currentTime); osc2.stop(ctx.currentTime + 0.5);
}

function playCorrectSound() {
  const ctx = ensureAudio();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  osc.frequency.setValueAtTime(1109, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
  osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
}

function playWrongSound() {
  const ctx = ensureAudio();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(300, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.4);
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
  osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
}

// ===== QUESTIONS =====
const QUESTIONS = [
  // Simple Present, Daily Routines, & Wh- Questions
  {id: 1, sentence: "He wakes up at seven o'clock every day.", status: "LEGAL", correction: "Correct simple present routine."},
  {id: 2, sentence: "She brushs her teeth after breakfast.", status: "ILLEGAL", correction: "Spelling mistake ('brushes')."},
  {id: 3, sentence: "They don't play soccer on the weekend.", status: "LEGAL", correction: "Correct negative statement."},
  {id: 4, sentence: "My father dosn't drink coffee in the evening.", status: "ILLEGAL", correction: "Spelling mistake ('doesn't')."},
  {id: 5, sentence: "Do you watch television after school?", status: "LEGAL", correction: "Correct simple present question."},
  {id: 6, sentence: "Does your brother likes to play video games?", status: "ILLEGAL", correction: "Grammar mistake ('like' instead of 'likes' with Does)."},
  {id: 7, sentence: "Where does your best friend live?", status: "LEGAL", correction: "Correct Wh- question."},
  {id: 8, sentence: "We have our English class on Wendsday.", status: "ILLEGAL", correction: "Spelling mistake ('Wednesday')."},
  {id: 9, sentence: "She works in a hospital downtown.", status: "LEGAL", correction: "Correct affirmative sentence."},
  {id: 10, sentence: "What time do the supermarket close?", status: "ILLEGAL", correction: "Grammar mistake ('does' the supermarket)."},

  // Adverbs of Frequency & Wh- Questions
  {id: 11, sentence: "I usually eat a sandwich for lunch.", status: "LEGAL", correction: "Correct adverb placement."},
  {id: 12, sentence: "He is allways late for his morning class.", status: "ILLEGAL", correction: "Spelling mistake ('always')."},
  {id: 13, sentence: "They never go to the cinema on Mondays.", status: "LEGAL", correction: "Correct negative frequency."},
  {id: 14, sentence: "How ofen do you go to the gym?", status: "ILLEGAL", correction: "Spelling mistake ('often')."},
  {id: 15, sentence: "Do you often read books in bed?", status: "LEGAL", correction: "Correct question with adverb."},
  {id: 16, sentence: "We don't usally travel during the winter.", status: "ILLEGAL", correction: "Spelling mistake ('usually')."},
  {id: 17, sentence: "The teacher is rarely angry with the students.", status: "LEGAL", correction: "Correct adverb placement after 'to be'."},
  {id: 18, sentence: "She always eat breakfast in the morning.", status: "ILLEGAL", correction: "Grammar mistake ('eats' for singular subject)."},
  {id: 19, sentence: "Does she always finish her homework on time?", status: "LEGAL", correction: "Correct question."},
  {id: 20, sentence: "They sometimes are noisy in the library.", status: "ILLEGAL", correction: "Adverb placement (should be 'are sometimes' after the verb to be)."},

  // Describing Things/People, Have/Has, & Wh- Questions
  {id: 21, sentence: "My best friend has short curly hair.", status: "LEGAL", correction: "Correct description with 'has'."},
  {id: 22, sentence: "She have two older brothers and a sister.", status: "ILLEGAL", correction: "Grammar mistake ('has' for singular subject)."},
  {id: 23, sentence: "This backpack is heavy because it is full of books.", status: "LEGAL", correction: "Correct descriptive statement."},
  {id: 24, sentence: "The new student is very tall and handsom.", status: "ILLEGAL", correction: "Spelling mistake ('handsome')."},
  {id: 25, sentence: "Do they have a big garden in their house?", status: "LEGAL", correction: "Correct question."},
  {id: 26, sentence: "He doesn't has a car, so he takes the bus.", status: "ILLEGAL", correction: "Grammar mistake ('doesn't have')."},
  {id: 27, sentence: "Who do you play tennis with on Saturdays?", status: "LEGAL", correction: "Correct Wh- question."},
  {id: 28, sentence: "Mary has a beautifull dress for the party.", status: "ILLEGAL", correction: "Spelling mistake ('beautiful')."},
  {id: 29, sentence: "Is your new English teacher friendly?", status: "LEGAL", correction: "Correct descriptive question."},
  {id: 30, sentence: "The cat has white paws and a black tale.", status: "ILLEGAL", correction: "Spelling mistake/homophone ('tail')."},

  // Prepositions of Place and Time & Wh- Questions
  {id: 31, sentence: "The keys are on the kitchen table.", status: "LEGAL", correction: "Correct preposition of place."},
  {id: 32, sentence: "My birthday is in the 15th of August.", status: "ILLEGAL", correction: "Preposition mistake ('on' for dates)."},
  {id: 33, sentence: "When is your brother's birthday?", status: "LEGAL", correction: "Correct Wh- question."},
  {id: 34, sentence: "Our flight leaves in night, so we can sleep.", status: "ILLEGAL", correction: "Preposition mistake ('at night')."},
  {id: 35, sentence: "Is the library across from the supermarket?", status: "LEGAL", correction: "Correct question."},
  {id: 36, sentence: "Why dose she wake up so early?", status: "ILLEGAL", correction: "Spelling mistake ('does')."},
  {id: 37, sentence: "We don't have any exams in December.", status: "LEGAL", correction: "Correct preposition of time."},
  {id: 38, sentence: "She leaves her shoes under of the bed.", status: "ILLEGAL", correction: "Grammar mistake (remove 'of', just 'under')."},
  {id: 39, sentence: "Does the movie start at eight o'clock?", status: "LEGAL", correction: "Correct question."},
  {id: 40, sentence: "There is a small park in front the school.", status: "ILLEGAL", correction: "Grammar mistake (missing 'of', 'in front of')."},

  // There is/are (Questions & Answers), Time Expressions, & Misc
  {id: 41, sentence: "Yes, there is a bank next to the school.", status: "LEGAL", correction: "Correct short answer and statement."},
  {id: 42, sentence: "No, there isn't any apples in the basket.", status: "ILLEGAL", correction: "Grammar mistake ('aren't any' for plural)."},
  {id: 43, sentence: "Are there any good restaurants near the hotel?", status: "LEGAL", correction: "Correct question."},
  {id: 44, sentence: "There aren't no chairs in the empty room.", status: "ILLEGAL", correction: "Double negative ('aren't any' or 'are no')."},
  {id: 45, sentence: "The museum is closed once a week on Tuesdays.", status: "LEGAL", correction: "Correct time expression."},
  {id: 46, sentence: "Yes, there are a clock on the classroom wall.", status: "ILLEGAL", correction: "Grammar mistake ('is a clock' for singular)."},
  {id: 47, sentence: "We practice playing the guitar every day.", status: "LEGAL", correction: "Correct statement."},
  {id: 48, sentence: "Does she visit her grandparents every weak?", status: "ILLEGAL", correction: "Spelling mistake/homophone ('week')."},
  {id: 49, sentence: "No, there aren't any eggs in the fridge.", status: "LEGAL", correction: "Correct negative answer."},
  {id: 50, sentence: "He play basketball with his friends on Saturday.", status: "ILLEGAL", correction: "Grammar mistake (missing 's', 'plays')."}
];

// Helper: Shuffle Array (Fisher-Yates)
function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ===== NUMBER TO WORDS =====
function numberToWords(num) {
  if (num === 0) return 'zero';
  const ones = ['','one','two','three','four','five','six','seven','eight','nine',
    'ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
  const tens = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
  function convert(n) {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n/10)] + (n%10 ? ' ' + ones[n%10] : '');
    if (n < 1000) return ones[Math.floor(n/100)] + ' hundred' + (n%100 ? ' ' + convert(n%100) : '');
    if (n < 1000000) return convert(Math.floor(n/1000)) + ' thousand' + (n%1000 ? ' ' + convert(n%1000) : '');
    for (const [amount, label] of [[1e12, 'trillion'], [1e9, 'billion'], [1e6, 'million']]) {
      if (n >= amount) return convert(Math.floor(n / amount)) + ' ' + label + (n % amount ? ' ' + convert(n % amount) : '');
    }
  }
  return convert(Math.abs(Math.floor(num))).trim();
}
function normalizeSpelling(str) {
  return str.toLowerCase().replace(/\bdollars?\b/g,'').replace(/\band\b/g,'').replace(/[-,]/g,' ').replace(/\s+/g,' ').trim();
}

// ===== STATE =====
let role, room, joinUrl, joinTimer, hostId, finalTimer, roundId;
const hostState = {
  teamCount: 4, teams: Object.create(null), currentQ: 0, bets: Object.create(null),
  shuffledQuestions: [], timerInterval: null, deadline: 0, bettingOpen: false,
  gameStarted: false, roundRevealed: false, finalChallengeActive: false, fcTeamOrder: []
};
const clientState = { teamName: '', balance: 1000, selectedChoice: null, betSubmitted: false, round: null };

async function initHost() {
  const mode = $('host-mode').value;
  const roomCode = crypto.randomUUID().slice(0, 8).toUpperCase();
  $('host-role').disabled = true;
  $('host-error').textContent = 'Opening room…';
  try {
    room = await roomTransport({
      namespace: 'grammar-auction', code: roomCode, mode, host: true,
      receive(data, sender) {
        if (data.type === 'participant-left') {
          const team = hostState.teams[sender];
          if (team && hostState.gameStarted) team.connected = false;
          else delete hostState.teams[sender];
          updateConnectedTeams();
          updateStartBtn();
        } else handleClientMessage(sender, data);
      }
    });
    role = 'host';
    $('roleSelect').classList.add('hidden');
    $('hostScreen').classList.remove('hidden');
    $('hostRoomCode').textContent = roomCode;
    const url = new URL(location.pathname, location.origin);
    url.search = new URLSearchParams({ role: 'client', room: roomCode, mode });
    joinUrl = url.href;
    $('joinLinkDisplay').href = joinUrl;
    $('joinLinkDisplay').textContent = joinUrl;
    try { new window.QRCode($('qrCode'), { text: joinUrl, width: 168, height: 168 }); }
    catch { $('qrCode').textContent = 'Use the team link to join.'; }
    for (let i = 2; i <= 8; i++) {
      const button = document.createElement('button');
      button.className = 'team-count-btn' + (i === 4 ? ' active' : '');
      button.textContent = i;
      button.onclick = () => {
        if (Object.keys(hostState.teams).length > i) return;
        $('teamCountBtns').querySelector('.active')?.classList.remove('active');
        button.classList.add('active');
        hostState.teamCount = i;
      };
      $('teamCountBtns').appendChild(button);
    }
  } catch (error) {
    room?.close();
    room = null;
    $('host-error').textContent = error.message;
    $('host-role').disabled = false;
  }
}

function handleClientMessage(sender, data) {
  const team = hostState.teams[sender];
  if (data.type === 'join') {
    const name = typeof data.teamName === 'string' && data.teamName.trim();
    if (!name || name.length > 20 || hostState.gameStarted || !/^[a-f0-9-]{36}$/i.test(sender) ||
        Object.keys(hostState.teams).length >= hostState.teamCount ||
        Object.values(hostState.teams).some(item => item.name.toLowerCase() === name.toLowerCase())) {
      room.send({ type: 'joinError', error: 'Join before the game starts. Use a unique team name and check that space is available.' }, sender);
      return;
    }
    hostState.teams[sender] = { name, balance: 1000, connected: true };
    room.send({ type: 'joined', balance: 1000 }, sender);
    updateConnectedTeams();
    updateStartBtn();
  } else if (data.type === 'bet' && team?.connected && hostState.bettingOpen && data.round === roundId && !hostState.bets[sender]) {
    if (Date.now() >= hostState.deadline) { revealAnswer(); return; }
    if (!['LEGAL', 'ILLEGAL'].includes(data.choice) || !Number.isSafeInteger(data.amount)) return;
    const amount = Math.min(Math.max(100, data.amount), team.balance);
    hostState.bets[sender] = { choice: data.choice, amount };
    room.send({ type: 'betConfirmed' }, sender);
    updateBetsDisplay();
  }
}

function updateConnectedTeams() {
  const container = document.getElementById('connectedTeams');
  const teamEntries = Object.entries(hostState.teams);
  document.getElementById('connectedCount').textContent = teamEntries.length;
  if (teamEntries.length === 0) {
    container.innerHTML = '<p style="color:#64748b;font-style:italic;font-size:0.85rem;">Waiting for students to join...</p>';
    return;
  }
  container.innerHTML = teamEntries.map(([pid, t]) =>
    `<div class="team-chip"><div class="dot"></div><div class="name">${escHtml(t.name)}</div><button class="kick-btn" onclick="kickTeam('${pid}')" title="Remove Team">✕</button></div>`
  ).join('');
}

function kickTeam(peerId) {
  const t = hostState.teams[peerId];
  if (!t) return;
  if (confirm(`Are you sure you want to remove team "${t.name}"?`)) {
    room.send({ type: 'KICK' }, peerId);
    delete hostState.teams[peerId];
    delete hostState.bets[peerId];
    updateConnectedTeams();
    updateStartBtn();
    
    if (hostState.gameStarted) {
      if (hostState.bettingOpen) updateBetsDisplay();
      else document.querySelectorAll('[data-team-card]').forEach(card => { if (card.dataset.teamCard === peerId) card.remove(); });
      updateLeaderboard();
    }
  }
}

function updateStartBtn() {
  const count = Object.keys(hostState.teams).length;
  const btn = document.getElementById('startGameBtn');
  btn.disabled = count < 2;
  btn.textContent = count < 2 ? `🎮 Need at least 2 teams (${count} joined)` : `🎮 Start Game (${count} teams)`;
}

function copyJoinLink() {
  navigator.clipboard.writeText(joinUrl).catch(() => {
    const ta = document.createElement('textarea'); ta.value = joinUrl;
    document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
  });
  const msg = document.getElementById('copyMsg');
  msg.classList.remove('hidden'); setTimeout(() => msg.classList.add('hidden'), 2000);
}

// ===== GAME FLOW =====
function startGame() {
  if (hostState.gameStarted || Object.keys(hostState.teams).length < 2) return;
  hostState.gameStarted = true;
  const selected = pack && $('use-pack').checked ? pack.items.map(item => ({
    sentence: item.text, status: item.correct ? 'LEGAL' : 'ILLEGAL',
    correction: [item.correct ? '' : item.correction, item.explanation].filter(Boolean).join(' · ')
  })) : QUESTIONS;
  hostState.shuffledQuestions = shuffleArray(selected);
  hostState.currentQ = 0;

  document.getElementById('hostSetup').classList.add('hidden');
  document.getElementById('hostGame').classList.remove('hidden');
  broadcastToAll({ type: 'gameStarted' });
  updateLeaderboard();
  updateBetsDisplay();
}

function nextQuestion() {
  if (!hostState.gameStarted || hostState.bettingOpen || hostState.finalChallengeActive) return;
  if (!hostState.shuffledQuestions || hostState.shuffledQuestions.length === 0) {
    hostState.shuffledQuestions = shuffleArray(QUESTIONS);
  }

  if (hostState.currentQ >= hostState.shuffledQuestions.length) {
    triggerFinalChallenge(); return;
  }

  const q = hostState.shuffledQuestions[hostState.currentQ];
  hostState.currentQ++;
  hostState.bets = {};
  hostState.bettingOpen = true;
  hostState.roundRevealed = false;
  hostState.deadline = Date.now() + 30000;
  roundId = crypto.randomUUID();

  playStartSound();

  document.getElementById('questionDisplay').classList.remove('hidden');
  document.getElementById('qNumber').textContent = `Question ${hostState.currentQ} / ${hostState.shuffledQuestions.length}`;
  document.getElementById('qSentence').textContent = `"${q.sentence}"`;
  document.getElementById('qTimer').textContent = '30';
  document.getElementById('qTimer').classList.remove('urgent');
  document.getElementById('nextQuestionBtn').disabled = true;
  document.getElementById('skipTimerBtn').disabled = false;

  const ar = document.getElementById('answerReveal');
  ar.classList.remove('show', 'legal-answer', 'illegal-answer');
  ar.innerHTML = '';

  updateBetsDisplay();
  broadcastToAll({ type: 'openBetting', questionId: hostState.currentQ, round: roundId, sentence: q.sentence });

  clearInterval(hostState.timerInterval);
  hostState.timerInterval = setInterval(() => {
    const timeLeft = Math.max(0, Math.ceil((hostState.deadline - Date.now()) / 1000));
    const timerEl = document.getElementById('qTimer');
    timerEl.textContent = timeLeft;
    if (timeLeft <= 5) timerEl.classList.add('urgent');
    if (timeLeft <= 0) {
      clearInterval(hostState.timerInterval);
      timerEl.textContent = "⏱️ TIME'S UP!";
      playBuzzerSound();
      document.getElementById('skipTimerBtn').disabled = true;
      revealAnswer();
    }
  }, 1000);
}

function skipTimer() {
  if (!hostState.bettingOpen || hostState.roundRevealed) return;
  clearInterval(hostState.timerInterval);
  document.getElementById('qTimer').textContent = "⏱️ SKIPPED";
  document.getElementById('skipTimerBtn').disabled = true;
  playBuzzerSound();
  revealAnswer();
}

function revealAnswer() {
  if (!hostState.bettingOpen || hostState.roundRevealed) return;
  clearInterval(hostState.timerInterval);
  hostState.bettingOpen = false;
  hostState.roundRevealed = true;
  document.getElementById('skipTimerBtn').disabled = true;
  broadcastToAll({ type: 'bettingClosed' });

  const q = hostState.shuffledQuestions[hostState.currentQ - 1];

  const ar = document.getElementById('answerReveal');
  ar.className = `answer-reveal card show ${q.status === 'LEGAL' ? 'legal-answer' : 'illegal-answer'}`;
  ar.innerHTML = `
    <div class="verdict ${q.status === 'LEGAL' ? 'green' : 'red'}">${q.status === 'LEGAL' ? '✅ LEGAL' : '❌ ILLEGAL'}</div>
    <div class="correction">${escHtml(q.correction)}</div>
  `;

  // Scoring Logic:
  // 1. Correct teams earn their bet amount.
  // 2. Incorrect teams lose their bet amount.
  // 3. Teams that didn't answer lose a default penalty ($100 or minimum bet).
  // 4. Any pool of lost money (from wrong bets + non-answers) is divided among correct teams!
  // 5. If all teams are correct, correct teams simply earn their bet amount (without taking from anywhere).

  let wrongPool = 0;
  const correctTeams = [];
  const incorrectTeams = [];
  const nonBettingTeams = [];

  for (const pid of Object.keys(hostState.teams)) {
    const bet = hostState.bets[pid];
    if (bet) {
      if (bet.choice === q.status) correctTeams.push(pid);
      else {
        incorrectTeams.push(pid);
        wrongPool += bet.amount;
      }
    } else {
      // Didn't answer: penalty loss of $100 or remaining balance if < $100
      nonBettingTeams.push(pid);
      const team = hostState.teams[pid];
      const penalty = Math.min(100, team.balance);
      wrongPool += penalty;
    }
  }

  // Bonus share from wrong pool if any correct teams exist
  const bonusShare = correctTeams.length > 0 ? Math.floor(wrongPool / correctTeams.length) : 0;

  const results = {};

  for (const pid of correctTeams) {
    const team = hostState.teams[pid];
    const bet = hostState.bets[pid];
    // Earn their bet amount + bonus share from wrong pool (if any)
    const gain = Math.min(MAX_BALANCE - team.balance, bet.amount + bonusShare);
    team.balance += gain;
    results[pid] = { correct: true, delta: +gain };
    room.send({ type: 'result', correct: true, delta: +gain, newBalance: team.balance, answer: q.status, correction: q.correction }, pid);
  }

  for (const pid of incorrectTeams) {
    const team = hostState.teams[pid];
    const bet = hostState.bets[pid];
    team.balance -= bet.amount;
    if (team.balance < 0) team.balance = 0;
    results[pid] = { correct: false, delta: -bet.amount };
    room.send({ type: 'result', correct: false, delta: -bet.amount, newBalance: team.balance, answer: q.status, correction: q.correction }, pid);
  }

  for (const pid of nonBettingTeams) {
    const team = hostState.teams[pid];
    const penalty = Math.min(100, team.balance);
    team.balance -= penalty;
    if (team.balance < 0) team.balance = 0;
    results[pid] = { correct: false, delta: -penalty, noBet: true };
    room.send({ type: 'result', correct: false, delta: -penalty, newBalance: team.balance, answer: q.status, correction: q.correction, noBet: true }, pid);
  }

  updateBetsDisplayRevealed(results);
  updateLeaderboard();
  document.getElementById('nextQuestionBtn').disabled = false;

  if (hostState.currentQ >= hostState.shuffledQuestions.length) {
    document.getElementById('nextQuestionBtn').textContent = '🏁 Final Challenge';
    document.getElementById('nextQuestionBtn').onclick = triggerFinalChallenge;
  }
}

function updateBetsDisplay() {
  const grid = document.getElementById('betsGrid');
  grid.innerHTML = Object.entries(hostState.teams).map(([pid, team]) => {
    const bet = hostState.bets[pid];
    return `
      <div class="bet-card ${bet ? 'submitted' : ''}">
        <button class="kick-btn" onclick="kickTeam('${pid}')" title="Remove Team">✕</button>
        <div class="team-name">${escHtml(team.name)}</div>
        <div class="balance">\$${team.balance.toLocaleString()}</div>
        ${bet
          ? `<div class="bet-info"><span class="bet-amount">💰 \$${bet.amount.toLocaleString()}</span></div>`
          : `<div class="bet-info" style="color:#64748b;">⏳ Waiting...</div>`}
      </div>`;
  }).join('');
}

function updateBetsDisplayRevealed(results) {
  const grid = document.getElementById('betsGrid');
  grid.innerHTML = Object.entries(hostState.teams).map(([pid, team]) => {
    const bet = hostState.bets[pid];
    const res = results[pid];
    let cardClass = 'bet-card';
    if (res) {
      if (res.noBet) cardClass += ' no-bet-reveal';
      else if (res.correct) cardClass += ' correct-reveal';
      else cardClass += ' incorrect-reveal';
    }
    return `
      <div class="${cardClass}" data-team-card="${pid}">
        <button class="kick-btn" onclick="kickTeam('${pid}')" title="Remove Team">✕</button>
        <div class="team-name">${escHtml(team.name)}</div>
        <div class="balance">\$${team.balance.toLocaleString()}</div>
        ${bet ? `
          <div class="bet-info">
            <span class="bet-amount">\$${bet.amount.toLocaleString()}</span>
            <span class="reveal-choice ${bet.choice.toLowerCase()}">${bet.choice}</span>
          </div>
          <div class="delta ${res.delta > 0 ? 'positive' : res.delta < 0 ? 'negative' : ''}">${
            res.delta > 0 ? '+$' + res.delta.toLocaleString() :
            res.delta < 0 ? '-$' + Math.abs(res.delta).toLocaleString() : '—'
          }</div>
        ` : `
          <div class="bet-info" style="color:#ef4444;">❌ No bet</div>
          <div class="delta negative">-\$${Math.abs(res.delta).toLocaleString()}</div>
        `}
      </div>`;
  }).join('');
}

function updateLeaderboard() {
  const sorted = Object.entries(hostState.teams)
    .map(([pid, t]) => ({ name: t.name, balance: t.balance }))
    .sort((a, b) => b.balance - a.balance);
  document.getElementById('lbRows').innerHTML = sorted.map((t, i) => `
    <div class="lb-row animate-in" style="animation-delay:${i*0.04}s;">
      <div class="lb-rank">${i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : '#'+(i+1)}</div>
      <div class="lb-name">${escHtml(t.name)}</div>
      <div class="lb-balance">\$${t.balance.toLocaleString()}</div>
    </div>
  `).join('');
}

// ===== FINAL CHALLENGE =====
function triggerFinalChallenge() {
  if (!hostState.gameStarted || hostState.finalChallengeActive || !Object.keys(hostState.teams).length) return;
  if (hostState.bettingOpen) revealAnswer();
  clearInterval(hostState.timerInterval);
  hostState.bettingOpen = false;
  hostState.finalChallengeActive = true;
  document.getElementById('gameLayout').classList.add('hidden');
  document.getElementById('finalChallenge').classList.remove('hidden');
  broadcastToAll({ type: 'finalChallenge' });
  showFcTeam();
}

function showFcTeam() {
  hostState.fcTeamOrder = Object.entries(hostState.teams)
    .map(([pid, t]) => ({ pid, name: t.name, balance: t.balance }))
    .sort((a, b) => b.balance - a.balance);
  const team = hostState.fcTeamOrder[0];
  document.getElementById('fcTeam').textContent = team.name;
  document.getElementById('fcAmount').textContent = `\$${team.balance.toLocaleString()}`;
  $('fcInput').disabled = $('fcCheck').disabled = false;
  document.getElementById('fcInput').value = '';
  document.getElementById('fcFeedback').textContent = '';
  document.getElementById('fcInput').focus();
}

function checkSpelling() {
  if (!hostState.finalChallengeActive || $('fcCheck').disabled) return;
  const input = $('fcInput').value;
  if (!input.trim()) return;
  const team = hostState.fcTeamOrder[0];
  const correct = numberToWords(team.balance);
  if (normalizeSpelling(input) === normalizeSpelling(correct)) {
    showWinner(team);
  } else {
    $('fcInput').disabled = $('fcCheck').disabled = true;
    playWrongSound();
    const pid = team.pid;
    const loss = Math.min(1000, hostState.teams[pid].balance);
    hostState.teams[pid].balance -= loss;
    for (const [op, ot] of Object.entries(hostState.teams)) {
      if (op !== pid) ot.balance = Math.min(MAX_BALANCE, ot.balance + 1000);
    }
    for (const [p, t] of Object.entries(hostState.teams)) {
      room.send({ type: 'balanceUpdate', newBalance: t.balance }, p);
    }
    document.getElementById('fcFeedback').innerHTML = `
      <span class="red">❌ INCORRECT!</span><br>
      <span style="font-size:0.85rem;color:#94a3b8;">${escHtml(team.name)} loses \$${loss.toLocaleString()}. Other teams receive up to \$1,000.</span><br>
      <span style="font-size:0.75rem;color:#64748b;">Expected: "${correct}"</span>`;
    finalTimer = setTimeout(showFcTeam, 2000);
  }
}

function showWinner(team) {
  hostState.finalChallengeActive = false;
  playCorrectSound();
  document.getElementById('finalChallenge').classList.add('hidden');
  document.getElementById('winnerScreen').classList.remove('hidden');
  document.getElementById('winnerName').textContent = team.name;
  const title = team.balance >= 1000000000 ? '🌟 BILLIONAIRE 🌟' :
                team.balance >= 1000000 ? '💎 MILLIONAIRE 💎' : '🏆 CHAMPION 🏆';
  document.getElementById('winnerTitle').textContent = title;
  const sorted = Object.entries(hostState.teams)
    .map(([pid, t]) => ({ name: t.name, balance: t.balance }))
    .sort((a, b) => b.balance - a.balance);
  document.getElementById('finalStandings').innerHTML = `
    <h3 class="gold" style="margin-bottom:10px;">📊 Final Standings</h3>
    ${sorted.map((t, i) => `
      <div class="lb-row"><div class="lb-rank">${i===0?'👑':'#'+(i+1)}</div>
      <div class="lb-name">${escHtml(t.name)}</div>
      <div class="lb-balance">\$${t.balance.toLocaleString()}</div></div>
    `).join('')}`;
  broadcastToAll({ type: 'gameOver', winner: team.name });
  spawnConfetti();
}

function spawnConfetti() {
  const colors = ['#f59e0b','#22c55e','#ef4444','#3b82f6','#a855f7','#ec4899'];
  for (let i = 0; i < 50; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.left = Math.random()*100+'vw'; p.style.top = (80+Math.random()*20)+'vh';
    p.style.background = colors[Math.floor(Math.random()*colors.length)];
    p.style.animationDuration = (2+Math.random()*2)+'s';
    p.style.animationDelay = Math.random()*1.5+'s';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 5000);
  }
}

function broadcastToAll(message) {
  for (const [id, team] of Object.entries(hostState.teams)) if (team.connected) room.send(message, id);
}
function replay() {
  hostState.gameStarted = false;
  hostState.currentQ = 0;
  hostState.bets = Object.create(null);
  for (const [id, team] of Object.entries(hostState.teams)) {
    if (team.connected) team.balance = 1000;
    else delete hostState.teams[id];
  }
  $('hostGame').classList.add('hidden');
  $('winnerScreen').classList.add('hidden');
  $('questionDisplay').classList.add('hidden');
  $('hostSetup').classList.remove('hidden');
  $('gameLayout').classList.remove('hidden');
  $('nextQuestionBtn').textContent = 'Next Question';
  $('nextQuestionBtn').onclick = nextQuestion;
  $('nextQuestionBtn').disabled = false;
  updateConnectedTeams();
  updateStartBtn();
  broadcastToAll({ type: 'joined', balance: 1000 });
  broadcastToAll({ type: 'resetClient' });
}

function showClientJoin() {
  role = 'client';
  $('roleSelect').classList.add('hidden');
  $('clientScreen').classList.remove('hidden');
}
function clientError(message) {
  clearTimeout(joinTimer);
  room?.close();
  room = hostId = null;
  $('clientGame').classList.add('hidden');
  $('clientJoin').classList.remove('hidden');
  $('clientError').textContent = message;
  $('join-btn').disabled = false;
}
async function connectToHost() {
  const code = $('clientRoomInput').value.trim().toUpperCase();
  const name = $('clientTeamInput').value.trim();
  if (!/^[A-F0-9]{8}$/.test(code) || !name) {
    clientError('Enter the eight-character room code and a team name.');
    return;
  }
  $('join-btn').disabled = true;
  $('clientError').textContent = 'Connecting…';
  clientState.teamName = name;
  try {
    room = await roomTransport({
      namespace: 'grammar-auction', code, mode: $('client-mode').value, host: false,
      receive(data, sender) {
        if (hostId && hostId !== sender) return;
        if (data.type === 'joined') hostId = sender;
        if (hostId || data.type === 'joinError') handleHostMessage(data);
      },
      disconnected() { clientError('The teacher closed the room.'); }
    });
    joinTimer = setTimeout(() => clientError('Room did not respond. Check the code and connection mode.'), 6000);
    room.send({ type: 'join', teamName: name });
  } catch (error) { clientError(error.message); }
}

function handleHostMessage(data) {
  switch (data.type) {
    case 'KICK':
      clientError('Your team was removed by the host.');
      break;
    case 'joinError':
      clientError(data.error);
      break;
    case 'joined':
      clearTimeout(joinTimer);
      clientState.balance = data.balance;
      document.getElementById('clientJoin').classList.add('hidden');
      document.getElementById('clientGame').classList.remove('hidden');
      document.getElementById('clientTeamDisplay').textContent = clientState.teamName;
      document.getElementById('clientBalanceDisplay').textContent = clientState.balance.toLocaleString();
      document.getElementById('clientStatusText').textContent = 'Connected! Waiting for game...';
      break;
    case 'resetClient':
      showClientWaiting();
      $('clientWaiting').textContent = 'Waiting for the teacher to start.';
      break;
    case 'gameStarted':
      document.getElementById('clientStatusText').textContent = '🎮 Game is live!';
      showClientWaiting(); break;
    case 'openBetting':
      clientState.round = data.round;
      $('client-sentence').textContent = data.sentence;
      clientState.betSubmitted = false; clientState.selectedChoice = null;
      document.getElementById('clientStatusText').textContent = `❓ Q${data.questionId} — Place your bet!`;
      showClientBetting(); break;
    case 'bettingClosed':
      if (!clientState.betSubmitted) {
        document.getElementById('clientStatusText').textContent = "⏱️ Time's up! No bet placed.";
        showClientWaiting();
      } break;
    case 'betConfirmed':
      clientState.betSubmitted = true; showClientBetSubmitted(); break;
    case 'result':
      clientState.balance = data.newBalance;
      document.getElementById('clientBalanceDisplay').textContent = clientState.balance.toLocaleString();
      showClientResult(data); break;
    case 'balanceUpdate':
      clientState.balance = data.newBalance;
      document.getElementById('clientBalanceDisplay').textContent = clientState.balance.toLocaleString();
      break;
    case 'finalChallenge':
      document.getElementById('clientStatusText').textContent = '✍️ Final Challenge!';
      showClientPanel('clientWaiting');
      document.getElementById('clientWaiting').innerHTML = `
        <div style="font-size:2rem;margin-bottom:10px;">✍️</div>
        <p style="font-size:1.1rem;color:#f59e0b;font-weight:700;">FINAL CHALLENGE</p>
        <p style="margin-top:8px;">Watch the big screen!</p>
        <p style="margin-top:12px;font-size:1.3rem;font-weight:700;">Your balance: \$${clientState.balance.toLocaleString()}</p>`;
      break;
    case 'gameOver':
      document.getElementById('clientStatusText').textContent = '🏆 Game Over!';
      showClientPanel('clientWaiting');
      document.getElementById('clientWaiting').innerHTML = `
        <div style="font-size:2.5rem;margin-bottom:10px;">🏆</div>
        <p style="font-size:1.2rem;color:#f59e0b;font-weight:700;">GAME OVER!</p>
        <p style="margin-top:8px;">Winner: <strong class="gold">${escHtml(data.winner)}</strong></p>
        <p style="margin-top:12px;font-size:1.8rem;font-weight:700;color:#22c55e;">\$${clientState.balance.toLocaleString()}</p>`;
      break;
  }
}

function showClientPanel(id) {
  ['clientWaiting','clientBetting','clientBetSubmitted','clientResult'].forEach(p =>
    document.getElementById(p).classList.toggle('hidden', p !== id));
}
function showClientWaiting() { showClientPanel('clientWaiting'); }
function showClientBetting() {
  showClientPanel('clientBetting');
  document.getElementById('legalBtn').classList.remove('selected');
  document.getElementById('illegalBtn').classList.remove('selected');
  $('betAmountInput').value = Math.min(100, clientState.balance);
  document.getElementById('submitBetBtn').disabled = true;
  clientState.selectedChoice = null;
}
function showClientBetSubmitted() { showClientPanel('clientBetSubmitted'); }
function showClientResult(data) {
  showClientPanel('clientResult');
  const el = document.getElementById('clientResult');
  if (data.noBet) {
    el.innerHTML = `<div class="verdict red">⏱️ NO BET PENALTY</div>
      <div class="change red">-\$${Math.abs(data.delta).toLocaleString()}</div>
      <p style="color:#94a3b8;margin-top:8px;">Answer: <strong class="${data.answer==='LEGAL'?'green':'red'}">${data.answer}</strong></p>
      <p style="color:#64748b;font-size:0.8rem;margin-top:4px;">${escHtml(data.correction)}</p>`;
  } else if (data.correct) {
    el.innerHTML = `<div class="verdict green">✅ CORRECT!</div>
      <div class="change green">+\$${Math.abs(data.delta).toLocaleString()}</div>
      <p style="color:#94a3b8;margin-top:8px;">Answer: <strong class="${data.answer==='LEGAL'?'green':'red'}">${data.answer}</strong></p>
      <p style="color:#64748b;font-size:0.8rem;margin-top:4px;">${escHtml(data.correction)}</p>`;
  } else {
    el.innerHTML = `<div class="verdict red">❌ WRONG!</div>
      <div class="change red">-\$${Math.abs(data.delta).toLocaleString()}</div>
      <p style="color:#94a3b8;margin-top:8px;">Answer: <strong class="${data.answer==='LEGAL'?'green':'red'}">${data.answer}</strong></p>
      <p style="color:#64748b;font-size:0.8rem;margin-top:4px;">${escHtml(data.correction)}</p>`;
  }
}

function selectChoice(choice) {
  clientState.selectedChoice = choice;
  document.getElementById('legalBtn').classList.toggle('selected', choice === 'LEGAL');
  document.getElementById('illegalBtn').classList.toggle('selected', choice === 'ILLEGAL');
  document.getElementById('submitBetBtn').disabled = false;
}
function adjustBet(delta) {
  const input = document.getElementById('betAmountInput');
  let val = parseInt(input.value) || 0;
  input.value = Math.min(clientState.balance, Math.max(100, val + delta));
}
function allIn() { document.getElementById('betAmountInput').value = clientState.balance; }
function submitBet() {
  if (!clientState.selectedChoice) return;
  const amount = Math.min(Math.max(100, parseInt(document.getElementById('betAmountInput').value)||100), clientState.balance);
  if (room) {
    room.send({ type: 'bet', choice: clientState.selectedChoice, amount, round: clientState.round });
    $('submitBetBtn').disabled = true;
  }
}
function escHtml(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }

Object.assign(window, { initHost, showClientJoin, connectToHost, startGame, copyJoinLink, nextQuestion,
  skipTimer, triggerFinalChallenge, checkSpelling, selectChoice, adjustBet, allIn, submitBet, kickTeam, replay });
if (pack) {
  $('pack-choice').hidden = false;
  $('pack-title').textContent = pack.title;
}
const params = new URLSearchParams(location.search);
if (params.get('role') === 'host') initHost();
if (params.get('role') === 'client') {
  showClientJoin();
  $('clientRoomInput').value = params.get('room') ?? '';
  $('client-mode').value = params.get('mode') === 'online' ? 'online' : 'local';
}
window.addEventListener('pagehide', () => {
  clearInterval(hostState.timerInterval);
  clearTimeout(joinTimer);
  clearTimeout(finalTimer);
});
