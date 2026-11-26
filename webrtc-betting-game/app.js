import { roomTransport } from '../gallery/shared/room-transport.js';
import { gameRuntime } from '../gallery/shared/runtime.js';
import { audioCtx, sounds } from './audio.js';
import { QUESTIONS } from './questions.js';
import { scoreRound, wagerBounds } from './scoring.js';

function click(id) {
    const button = document.getElementById(id);
    if (button?.getClientRects().length && !button.disabled) button.click();
}
const { pack } = gameRuntime('webrtc-betting-game', 'quiz', {
    next: () => click('btn-next-round'), confirm: () => click('btn-submit-bet'),
    ...Object.fromEntries(Array.from({ length: 6 }, (_, i) => [
        'answer' + (i + 1), () => click('client-opt-' + String.fromCharCode(65 + i))
    ]))
});

// ==========================================
// SCREENS
// ==========================================
const screens = {
    landing: document.getElementById('landing-screen'),
    clientJoin: document.getElementById('client-join-screen'),
    hostLobby: document.getElementById('host-lobby-screen'),
    hostGame: document.getElementById('host-game-screen'),
    clientLobby: document.getElementById('client-lobby-screen'),
    clientGame: document.getElementById('client-game-screen')
};

function showScreen(s) {
    Object.values(screens).forEach(el => { if (el) el.classList.remove('active'); });
    if (s) s.classList.add('active');
}
function showLoading(text) {
    document.getElementById('loading-overlay').classList.remove('hidden');
    document.getElementById('loading-text').innerText = text;
}
function hideLoading() {
    document.getElementById('loading-overlay').classList.add('hidden');
}
function escHtml(s) {
    const d = document.createElement('div'); d.textContent = s; return d.innerHTML;
}

// ==========================================
// STATE
// ==========================================
let room, joinTimer, hostId;
const teams = Object.create(null);

// Host
let currentQuestionIndex = 0;
let currentQuestion = null;
let gameQuestions = [];
let hostTimerInterval = null;
let deadline = 0, roundId;
let roundRevealed = false;
let gameFinished = false;

// Client
let clientRound = 0, clientPending = false;
let myBankroll = 1000;
let myTeamName = '';
let selectedOption = null;

// ==========================================
// INIT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomCode = urlParams.get('room');
    document.getElementById('join-mode').value = urlParams.get('mode') === 'online' ? 'online' : 'local';
    if (pack) {
        document.getElementById('pack-choice').hidden = false;
        document.getElementById('pack-title').textContent = pack.title;
    }

    document.body.addEventListener('click', () => {
        if (audioCtx?.state === 'suspended') audioCtx.resume().catch(() => {});
    }, { once: true });

    document.getElementById('btn-host-game').addEventListener('click', initHost);
    document.getElementById('btn-show-join').addEventListener('click', () => {
        showScreen(screens.clientJoin);
        if (roomCode) document.getElementById('join-room-code').value = roomCode;
    });
    document.getElementById('btn-back-landing').addEventListener('click', () => showScreen(screens.landing));
    document.getElementById('btn-join-game').addEventListener('click', initClient);

    if (roomCode) {
        showScreen(screens.clientJoin);
        document.getElementById('join-room-code').value = roomCode;
    }

    document.getElementById('btn-mute').addEventListener('click', (e) => {
        const m = sounds.toggleMute();
        e.target.innerText = m ? 'Unmute 🔇' : 'Mute 🔊';
    });
});

// ==========================================
// HOST
// ==========================================
async function initHost() {
    const mode = document.getElementById('host-mode').value;
    const code = crypto.randomUUID().slice(0, 8).toUpperCase();
    showLoading('Creating Room…');
    document.getElementById('host-error').textContent = '';
    try {
        room = await roomTransport({
            namespace: 'grammar-bet', mode, code, host: true,
            receive(message, sender) {
                if (message.type === 'participant-left') {
                    if (!currentQuestionIndex) delete teams[sender];
                    else if (teams[sender]) teams[sender].connected = false;
                    updateLobbyUI();
                    if (currentQuestion && !roundRevealed) updateBetsUI();
                } else handleClientMsg(sender, message);
            }
        });
        const url = new URL(location.pathname, location.origin);
        url.search = new URLSearchParams({ room: code, mode });
        document.getElementById('host-room-code-display').textContent = code;
        const join = document.getElementById('share-url');
        join.href = url.href;
        join.textContent = url.href;
        try {
            new window.QRCode(document.getElementById('qrcode'), { text: url.href, width: 168, height: 168 });
        } catch { document.getElementById('qrcode').textContent = 'Use the team link to join.'; }
        prepareQuestions();
        showScreen(screens.hostLobby);
        updateLobbyUI();
    } catch (error) {
        room?.close();
        room = null;
        document.getElementById('host-error').textContent = error.message;
    } finally { hideLoading(); }
}

function prepareQuestions() {
    const source = pack && document.getElementById('use-pack').checked ? pack.items.map(item => {
        const options = Object.fromEntries(item.options.map((option, index) => [String.fromCharCode(65 + index), option]));
        return { question: item.question, options, correct: Object.keys(options).find(key => options[key] === item.answer), explanation: item.explanation };
    }) : QUESTIONS;
    gameQuestions = [...source];
    for (let i = gameQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gameQuestions[i], gameQuestions[j]] = [gameQuestions[j], gameQuestions[i]];
    }
}

function handleClientMsg(sender, msg) {
    if (msg.type === 'JOIN') {
        const name = typeof msg.teamName === 'string' && msg.teamName.trim();
        if (!name || name.length > 20 || currentQuestionIndex || Object.keys(teams).length >= 24 ||
            Object.values(teams).some(team => team.name.toLowerCase() === name.toLowerCase())) {
            room.send({ type: 'ERROR', message: 'Join before the game starts using a unique team name.' }, sender);
            return;
        }
        teams[sender] = { id: sender, name, bankroll: 1000, lastBet: 0, lastChoice: null, connected: true };
        room.send({ type: 'JOIN_SUCCESS', bankroll: 1000 }, sender);
        updateLobbyUI();
    } else if (msg.type === 'SUBMIT_BET') {
        const team = teams[sender];
        if (!team?.connected || roundRevealed || !currentQuestion || msg.round !== roundId) return;
        if (Date.now() >= deadline) { endTimer(); return; }
        if (team.lastChoice !== null || !Object.hasOwn(currentQuestion.options, msg.choice) || !Number.isSafeInteger(msg.amount)) return;
        const { min, max } = wagerBounds(team.bankroll);
        team.lastBet = Math.min(max, Math.max(min, msg.amount));
        team.lastChoice = msg.choice;
        room.send({ type: 'BET_CONFIRMED', amount: team.lastBet, choice: team.lastChoice }, sender);
        updateBetsUI();
    }
}

function broadcast(message) {
    for (const team of Object.values(teams)) if (team.connected) room.send(message, team.id);
}
document.getElementById('btn-copy-url').onclick = async event => {
    try { await navigator.clipboard.writeText(document.getElementById('share-url').href); event.target.textContent = 'Copied'; }
    catch { event.target.textContent = 'Use the team link above'; }
};
document.getElementById('btn-start-game').onclick = startNextRound;
document.getElementById('btn-skip-timer').onclick = endTimer;
document.getElementById('btn-next-round').onclick = startNextRound;

// ---- Lobby UI ----
function updateLobbyUI() {
    const list = document.getElementById('host-team-list');
    const count = Object.keys(teams).length;
    document.getElementById('connectedCount').innerText = count;

    if (count === 0) {
        list.innerHTML = '<p style="color:#64748b;font-style:italic;font-size:0.85rem;grid-column:1/-1;">Waiting for students to join...</p>';
    } else {
        list.innerHTML = '';
        Object.values(teams).forEach(t => {
            const div = document.createElement('div');
            div.className = 'team-chip';
            div.innerHTML = '<span class="name">' + escHtml(t.name) + '</span>';
            const kb = document.createElement('button');
            kb.className = 'kick-btn'; kb.innerText = '✕';
            kb.onclick = () => {
                room.send({ type: 'KICKED' }, t.id);
                delete teams[t.id];
                updateLobbyUI();
            };
            div.appendChild(kb);
            list.appendChild(div);
        });
    }

    const btn = document.getElementById('btn-start-game');
    btn.disabled = count < 1;
    btn.innerText = count < 1 ? '🎮 Need at least 1 team' : '🎮 Start Game (' + count + ' teams)';
}

// ---- Leaderboard ----
function updateLeaderboard() {
    const lb = document.getElementById('leaderboard-list');
    lb.innerHTML = '';
    const sorted = Object.values(teams).sort((a, b) => b.bankroll - a.bankroll);
    sorted.forEach((t, i) => {
        const row = document.createElement('div');
        row.className = 'lb-row';
        row.innerHTML = '<div class="lb-rank">#' + (i + 1) + '</div>' +
            '<div class="lb-name">' + escHtml(t.name) + '</div>' +
            '<div class="lb-balance' + (t.bankroll < 0 ? ' debt' : '') + '">' +
            (t.bankroll < 0 ? '-$' : '$') + Math.abs(t.bankroll).toLocaleString() + '</div>';
        lb.appendChild(row);
    });
}

// ---- Bets UI (during betting) ----
function updateBetsUI() {
    const grid = document.getElementById('bets-grid');
    grid.innerHTML = '';
    Object.values(teams).forEach(t => {
        const card = document.createElement('div');
        card.className = 'bet-card' + (t.lastChoice ? ' submitted' : '');
        let html = '<div class="team-name">' + escHtml(t.name) + '</div>';
        html += '<div class="balance">$' + t.bankroll + '</div>';
        if (t.lastChoice) {
            html += '<div class="bet-info">Bet: <span class="bet-amount">$' + t.lastBet + '</span></div>';
        } else {
            html += '<div class="bet-info" style="color:#94a3b8;">Waiting...</div>';
        }
        card.innerHTML = html;
        grid.appendChild(card);
    });
}

// ---- Bets UI (after reveal) ----
function updateBetsUIReveal(results) {
    const grid = document.getElementById('bets-grid');
    grid.innerHTML = '';
    Object.values(teams).forEach(t => {
        const r = results[t.id];
        const card = document.createElement('div');
        let cls = 'bet-card';
        if (r.result === 'WIN') cls += ' correct-reveal';
        else if (r.result === 'LOSE') cls += ' incorrect-reveal';
        else cls += ' no-bet-reveal';
        card.className = cls;

        let html = '<div class="team-name">' + escHtml(t.name) + '</div>';
        html += '<div class="balance">$' + t.bankroll + '</div>';

        if (t.lastChoice) {
            const choiceClass = r.result === 'WIN' ? 'correct-choice' : 'wrong-choice';
            html += '<div class="bet-info">Bet: <span class="bet-amount">$' + t.lastBet + '</span>';
            html += ' <span class="reveal-choice ' + choiceClass + '">' + t.lastChoice + '</span></div>';
        } else {
            html += '<div class="bet-info" style="color:#ef4444;">No bet (penalty!)</div>';
        }

        if (r.result === 'WIN') {
            html += '<div class="delta positive">+$' + r.change + '</div>';
        } else if (r.result === 'LOSE') {
            html += '<div class="delta negative">-$' + r.change + '</div>';
        } else {
            html += '<div class="delta negative">-$' + r.change + ' (penalty)</div>';
        }

        card.innerHTML = html;
        grid.appendChild(card);
    });
}

// ---- Game Flow ----
function startNextRound() {
    if (currentQuestion && !roundRevealed) return;
    if (gameFinished) {
        currentQuestionIndex = 0;
        currentQuestion = null;
        gameFinished = false;
        for (const team of Object.values(teams)) {
            if (!team.connected) delete teams[team.id];
            else team.bankroll = 1000;
        }
        prepareQuestions();
        broadcast({ type: 'JOIN_SUCCESS', bankroll: 1000 });
        updateLobbyUI();
        showScreen(screens.hostLobby);
        return;
    }
    if (currentQuestionIndex >= gameQuestions.length) {
        gameFinished = true;
        const ranked = Object.values(teams).sort((a, b) => b.bankroll - a.bankroll);
        const winners = ranked.filter(team => team.bankroll === ranked[0]?.bankroll).map(team => team.name);
        const result = (winners.length > 1 ? 'Tie: ' : 'Winner: ') + winners.join(', ');
        document.getElementById('question-display').textContent = result;
        document.getElementById('question-counter').textContent = 'Game Complete';
        for (const id of ['options-display', 'answer-reveal', 'bets-grid', 'timer-display']) document.getElementById(id).classList.add('hidden');
        document.getElementById('btn-next-round').textContent = 'Play Again';
        broadcast({ type: 'GAME_OVER', result });
        return;
    }
    for (const id of ['options-display', 'bets-grid', 'timer-display']) document.getElementById(id).classList.remove('hidden');

    currentQuestion = gameQuestions[currentQuestionIndex];
    currentQuestionIndex++;
    roundId = crypto.randomUUID();
    roundRevealed = false;

    // Reset bets
    Object.values(teams).forEach(t => { t.lastBet = 0; t.lastChoice = null; });

    showScreen(screens.hostGame);

    // Hide answer reveal + next button
    document.getElementById('answer-reveal').classList.add('hidden');
    document.getElementById('btn-next-round').classList.add('hidden');
    document.getElementById('btn-skip-timer').classList.remove('hidden');
    document.getElementById('btn-skip-timer').disabled = false;

    // Question
    document.getElementById('question-counter').innerText = 'Question ' + currentQuestionIndex + '/' + gameQuestions.length;
    document.getElementById('question-display').innerText = currentQuestion.question;

    // Options
    const og = document.getElementById('options-display');
    og.innerHTML = '';
    Object.entries(currentQuestion.options).forEach(([key, val]) => {
        const d = document.createElement('div');
        d.className = 'option-btn';
        d.id = 'host-opt-' + key;
        d.innerText = key + ') ' + val;
        og.appendChild(d);
    });

    // Timer
    deadline = Date.now() + 20000;
    const td = document.getElementById('timer-display');
    td.innerText = 20;
    td.classList.remove('urgent');

    clearInterval(hostTimerInterval);
    hostTimerInterval = setInterval(() => {
        const timeLeft = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
        td.innerText = timeLeft;
        if (timeLeft <= 5) { sounds.tick(); td.classList.add('urgent'); }
        if (timeLeft <= 0) endTimer();
    }, 1000);

    // Broadcast to clients
    broadcast({
        type: 'START_BETTING',
        round: roundId,
        question: currentQuestion.question,
        options: Object.keys(currentQuestion.options),
        optionTexts: currentQuestion.options
    });

    // Init bets grid
    updateBetsUI();
    updateLeaderboard();
}

function endTimer() {
    if (!currentQuestion || roundRevealed) return;
    clearInterval(hostTimerInterval);
    document.getElementById('timer-display').innerText = '0';
    document.getElementById('timer-display').classList.remove('urgent');
    document.getElementById('btn-skip-timer').disabled = true;
    resolveBets();
}

function resolveBets() {
    roundRevealed = true;
    const correctAns = currentQuestion.correct;

    // Highlight correct option on host
    const correctEl = document.getElementById('host-opt-' + correctAns);
    if (correctEl) correctEl.classList.add('correct');
    Object.keys(currentQuestion.options).forEach(k => {
        if (k !== correctAns) {
            const el = document.getElementById('host-opt-' + k);
            if (el) el.classList.add('wrong');
        }
    });

    // Show answer reveal bar
    const revealBar = document.getElementById('answer-reveal');
    revealBar.classList.remove('hidden');
    revealBar.classList.add('correct-bg');
    revealBar.innerHTML = '<div class="verdict green">✅ Correct Answer: ' + correctAns + ') ' + escHtml(currentQuestion.options[correctAns]) + '</div>';

    if (currentQuestion.explanation) {
        const explanation = document.createElement('p');
        explanation.textContent = currentQuestion.explanation;
        revealBar.appendChild(explanation);
    }
    const results = scoreRound(Object.values(teams), correctAns);
    if (Object.values(results).some(result => result.result === 'WIN')) sounds.chime();
    else sounds.buzz();
    updateBetsUIReveal(results);
    updateLeaderboard();
    document.getElementById('btn-skip-timer').classList.add('hidden');
    const next = document.getElementById('btn-next-round');
    next.classList.remove('hidden');
    next.textContent = currentQuestionIndex === gameQuestions.length ? 'Final Scores' : 'Next Question';

    // Notify clients
    Object.values(teams).forEach(t => {
        const r = results[t.id];
        if (t.connected) {
            room.send({
                type: 'RESULT',
                result: r.result,
                change: r.change,
                newBankroll: t.bankroll,
                correctAnswer: correctAns,
                correctText: currentQuestion.options[correctAns]
            }, t.id);
        }
    });
}


// ==========================================
// CLIENT
// ==========================================
function joinError(message) {
    clearTimeout(joinTimer);
    room?.close();
    room = hostId = null;
    clientPending = false;
    hideLoading();
    showScreen(screens.clientJoin);
    const error = document.getElementById('join-error');
    error.textContent = message;
    error.classList.remove('hidden');
}

async function initClient() {
    const code = document.getElementById('join-room-code').value.trim().toUpperCase();
    const mode = document.getElementById('join-mode').value;
    myTeamName = document.getElementById('join-team-name').value.trim();
    if (!/^[A-F0-9]{8}$/.test(code) || !myTeamName) {
        joinError('Enter the eight-character room code and a team name.');
        return;
    }
    showLoading('Connecting to Host…');
    try {
        room = await roomTransport({
            namespace: 'grammar-bet', code, mode, host: false,
            receive(message, sender) {
                if (hostId && sender !== hostId) return;
                if (message.type === 'JOIN_SUCCESS') hostId = sender;
                if (hostId || message.type === 'ERROR') handleHostMsg(message);
            },
            disconnected() { joinError('The teacher closed the room.'); }
        });
        joinTimer = setTimeout(() => joinError('Room did not respond. Check its code and connection mode.'), 6000);
        room.send({ type: 'JOIN', teamName: myTeamName });
    } catch (error) { joinError(error.message); }
}

function handleHostMsg(msg) {
    hideLoading();

    if (msg.type === 'ERROR') {
        joinError(msg.message);
    }
    else if (msg.type === 'JOIN_SUCCESS') {
        clearTimeout(joinTimer);
        myBankroll = msg.bankroll;
        document.getElementById('client-team-name-display').innerText = myTeamName;
        document.getElementById('client-team-name-game').innerText = myTeamName;
        document.getElementById('client-bankroll').innerText = myBankroll;
        showScreen(screens.clientLobby);
    }
    else if (msg.type === 'START_BETTING') {
        clientRound = msg.round;
        clientPending = false;
        selectedOption = null;
        document.getElementById('client-question').textContent = msg.question;
        showScreen(screens.clientGame);

        document.getElementById('client-bankroll-game').innerText = myBankroll;
        document.getElementById('client-status-game').innerText = 'Place your bet!';
        document.getElementById('client-betting-area').classList.remove('hidden');
        document.getElementById('client-waiting-area').classList.add('hidden');
        document.getElementById('client-result-area').classList.add('hidden');
        document.getElementById('btn-submit-bet').disabled = true;

        // Slider setup
        const slider = document.getElementById('wager-slider');
        const numInput = document.getElementById('wager-amount');
        const { min, max } = wagerBounds(myBankroll);
        slider.min = numInput.min = min;
        slider.max = numInput.max = max;
        const defBet = Math.max(min, Math.floor(max * 0.1));
        slider.value = defBet; numInput.value = defBet;
        slider.oninput = () => numInput.value = slider.value;
        numInput.oninput = () => slider.value = Math.min(Math.max(min, numInput.value), max);

        document.getElementById('btn-bet-min').onclick = () => { slider.value = min; numInput.value = min; };
        document.getElementById('btn-bet-half').onclick = () => { const v = Math.max(min, Math.floor(max / 2)); slider.value = v; numInput.value = v; };
        document.getElementById('btn-bet-max').onclick = () => { slider.value = max; numInput.value = max; };

        // Option buttons
        const optDiv = document.getElementById('client-options');
        optDiv.innerHTML = '';
        msg.options.forEach(key => {
            const btn = document.createElement('button');
            btn.id = 'client-opt-' + key;
            btn.className = 'client-option-btn';
            const label = msg.optionTexts ? (key + ') ' + msg.optionTexts[key]) : ('Option ' + key);
            btn.innerText = label;
            btn.onclick = () => {
                document.querySelectorAll('.client-option-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedOption = key;
                document.getElementById('btn-submit-bet').disabled = false;
            };
            optDiv.appendChild(btn);
        });

        document.getElementById('btn-submit-bet').onclick = submitBet;
    }
    else if (msg.type === 'BET_CONFIRMED') {
        document.getElementById('client-betting-area').classList.add('hidden');
        document.getElementById('client-waiting-area').classList.remove('hidden');
        document.getElementById('client-current-bet').textContent = msg.amount;
        document.getElementById('client-current-choice').textContent = msg.choice;
        document.getElementById('client-status-game').textContent = 'Bet locked in!';
    }
    else if (msg.type === 'RESULT') {
        document.getElementById('client-betting-area').classList.add('hidden');
        document.getElementById('client-waiting-area').classList.add('hidden');
        document.getElementById('client-result-area').classList.remove('hidden');

        myBankroll = msg.newBankroll;
        document.getElementById('client-bankroll-game').innerText = myBankroll;

        const title = document.getElementById('client-result-title');
        const detail = document.getElementById('client-result-detail');

        if (msg.result === 'WIN') {
            title.innerText = '🎉 CORRECT!';
            title.style.color = '#22c55e';
            detail.innerHTML = 'You won <span style="color:#22c55e;font-weight:900;">+$' + msg.change + '</span>!<br><span style="color:#94a3b8;font-size:0.9rem;">Answer: ' + msg.correctAnswer + ') ' + escHtml(msg.correctText) + '</span>';
            sounds.chime();
        } else if (msg.result === 'LOSE') {
            title.innerText = '❌ WRONG!';
            title.style.color = '#ef4444';
            detail.innerHTML = 'You lost <span style="color:#ef4444;font-weight:900;">-$' + msg.change + '</span><br><span style="color:#94a3b8;font-size:0.9rem;">Correct: ' + msg.correctAnswer + ') ' + escHtml(msg.correctText) + '</span>';
            sounds.buzz();
        } else {
            title.innerText = '⏱️ TOO SLOW!';
            title.style.color = '#ef4444';
            detail.innerHTML = 'No vote penalty: <span style="color:#ef4444;font-weight:900;">-$' + msg.change + '</span><br><span style="color:#94a3b8;font-size:0.9rem;">Correct: ' + msg.correctAnswer + ') ' + escHtml(msg.correctText) + '</span>';
            sounds.buzz();
        }
    }
    else if (msg.type === 'GAME_OVER') {
        document.getElementById('client-status-game').textContent = 'Game complete';
        document.getElementById('client-result-title').textContent = msg.result;
        document.getElementById('client-result-detail').textContent = '$' + myBankroll;
    }
    else if (msg.type === 'KICKED') joinError('Your team was removed by the host.');
}

function submitBet() {
    if (!selectedOption || clientPending || !room) return;
    const amount = document.getElementById('wager-amount').valueAsNumber;
    if (!Number.isSafeInteger(amount)) return;
    clientPending = true;
    document.getElementById('btn-submit-bet').disabled = true;
    room.send({ type: 'SUBMIT_BET', amount, choice: selectedOption, round: clientRound });
}
window.addEventListener('pagehide', () => { clearInterval(hostTimerInterval); clearTimeout(joinTimer); });
