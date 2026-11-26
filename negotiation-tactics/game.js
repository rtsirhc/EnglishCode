import { P1_TASKS, P2_TASKS, P3_TASKS, P4_TASKS } from './tasks.js';
import { bindGameControls } from '../gallery/shared/runtime.js';
// --- STATE ENGINE ---
const state = {
    phase: 'INTRO',
    index: 0,
    strikes: 0,
    startTime: 0,
    timerInterval: null,
    feedbackOpen: false
};

// --- CORE FUNCTIONS ---

function startGame() {
    state.phase = 'P1';
    state.index = 0;
    state.strikes = 0;
    state.startTime = Date.now() + (30 * 60 * 1000); // 30 mins

    // Start Timer
    if (state.timerInterval) clearInterval(state.timerInterval);
    state.timerInterval = setInterval(updateTimer, 1000);

    document.getElementById('feedback-modal').style.display = 'none';
    updateTimer();
    updateHUD("PHASE 1: INFILTRATION");
    render();
}

function updateTimer() {
    const now = Date.now();
    const diff = state.startTime - now;

    if (diff <= 0) {
        endGame("TIME EXPIRED", "Mission Failed. The timeline collapsed.");
        return;
    }

    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    const display = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    const timerEl = document.getElementById('timer-display');
    timerEl.innerText = display;

    if (mins < 5) timerEl.classList.add('timer-warning');
    else timerEl.classList.remove('timer-warning');
}

function endGame(title, msg) {
    clearInterval(state.timerInterval);
    state.feedbackOpen = false;
    document.getElementById('feedback-modal').style.display = 'none';
    document.getElementById('feedback-btn').onclick = null;
    if (title === 'TIME EXPIRED') document.getElementById('timer-display').textContent = '00:00';
    state.phase = 'END';
    updateHUD(title);
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('end-screen').classList.add('active');

    const h2 = document.getElementById('end-title');
    h2.innerText = title;
    if (title === "TIME EXPIRED") h2.style.color = "var(--danger-color)";
    else h2.style.color = "var(--success-color)";

    document.getElementById('end-msg').innerText = msg;
    updateControls();
}

function updateHUD(text) {
    document.getElementById('phase-status').textContent = text;
}

function render() {
    // Clear Screens
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

    if (state.phase === 'P1') renderP1();
    else if (state.phase === 'P2') renderP2();
    else if (state.phase === 'P3') renderP3();
    else if (state.phase === 'P4') renderP4();
    updateControls();
}

function showFeedback(title, msg, type, callback) {
    const modal = document.getElementById('feedback-modal');
    const t = document.getElementById('feedback-title');
    const m = document.getElementById('feedback-msg');
    const b = document.getElementById('feedback-btn');

    t.innerText = title;
    t.className = type;
    m.innerText = msg;
    state.feedbackOpen = true;
    modal.style.display = 'flex';
    b.focus();
    updateControls();

    b.onclick = () => {
        if (!state.feedbackOpen || state.phase === 'END') return;
        state.feedbackOpen = false;
        modal.style.display = 'none';
        if (callback) callback();
        updateControls();
    };
}

// --- PHASE 1 LOGIC ---
function renderP1() {
    document.getElementById('phase-1-screen').classList.add('active');
    updateHUD(`P1: TASK ${state.index + 1}/${P1_TASKS.length}`);

    const task = P1_TASKS[state.index];
    document.getElementById('p1-desc').innerText = task.desc;
    document.getElementById('p1-image').src = task.img;

    // Progress Bar
    document.getElementById('p1-progress').style.width = `${((state.index) / P1_TASKS.length) * 100}%`;

    const c = document.getElementById('p1-cards');
    c.innerHTML = '';
    task.opts.forEach(o => {
        const div = document.createElement('button');
        div.type = 'button';
        div.className = 'tactical-card';
        div.innerText = o.t;
        div.onclick = () => {
            if (state.feedbackOpen || state.phase === 'END') return;
            if (o.ok) {
                showFeedback("CLEAR", o.msg, "success", () => {
                    state.index++;
                    if (state.index >= P1_TASKS.length) {
                        state.phase = 'P2';
                        state.index = 0;
                    }
                    render();
                });
            } else {
                showFeedback("FAILURE", o.msg + " (Retry)", "tragic", () => { }); // No progress, retry
            }
        };
        c.appendChild(div);
    });
}

// --- PHASE 2 LOGIC ---
function renderP2() {
    document.getElementById('phase-2-screen').classList.add('active');
    updateHUD(`P2: PUZZLE ${state.index + 1}/${P2_TASKS.length}`);

    const task = P2_TASKS[state.index];
    document.getElementById('p2-event1').innerText = task.e1;
    document.getElementById('p2-event2').innerText = task.e2;
    document.getElementById('p2-input').value = ""; // clear
    document.getElementById('p2-progress').style.width = `${((state.index) / P2_TASKS.length) * 100}%`;
}

function submitP2() {
    if (state.phase !== 'P2' || state.feedbackOpen) return;
    const input = document.getElementById('p2-input').value.trim();
    const task = P2_TASKS[state.index];

    // Check against all valid answers
    const isCorrect = task.answers.some(ans => normalizeAnswer(ans) === normalizeAnswer(input));

    if (isCorrect) {
        showFeedback("ACCEPTED", "Timeline Stabilized.", "success", () => {
            state.index++;
            if (state.index >= P2_TASKS.length) {
                state.phase = 'P3';
                state.index = 0;
                state.strikes = 0;
            }
            render();
        });
    } else {
        const msg = "Try again. Describe the earlier event with had + past participle, then use before for the later event.";
        showFeedback("ERROR", msg, "tragic");
    }
}

// --- PHASE 3 LOGIC (Mad Scientist) ---
function renderP3() {
    document.getElementById('phase-3-screen').classList.add('active');
    updateHUD(`P3: SCIENTIST Q${state.index + 1}/${P3_TASKS.length}`);

    // Strikes
    const strikesEl = document.getElementById('strike-display');
    strikesEl.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const s = document.createElement('span');
        s.className = `strike ${i < state.strikes ? 'active' : ''}`;
        s.innerText = 'X ';
        strikesEl.appendChild(s);
    }

    const task = P3_TASKS[state.index];
    document.getElementById('p3-question').innerText = task.q;
    document.getElementById('p3-progress').style.width = `${((state.index) / P3_TASKS.length) * 100}%`;

    const c = document.getElementById('p3-options');
    c.innerHTML = '';
    task.opts.forEach((optText, idx) => {
        const div = document.createElement('button');
        div.type = 'button';
        div.className = 'tactical-card';
        div.innerText = optText;
        div.onclick = () => {
            if (state.feedbackOpen || state.phase === 'END') return;
            if (idx === task.a) {
                // Correct
                state.index++;
                if (state.index >= P3_TASKS.length) {
                    state.phase = 'P4';
                    state.index = 0;
                }
                render();
            } else {
                // Wrong
                state.strikes++;
                if (state.strikes >= 3) {
                    showFeedback("SYSTEM RESET", "Too many errors. The Scientist rejects you. RESTARTING PHASE.", "tragic", () => {
                        state.strikes = 0;
                        state.index = 0;
                        render();
                    });
                } else {
                    showFeedback("INCORRECT", "Strike " + state.strikes, "tragic", () => render());
                }
            }
        };
        c.appendChild(div);
    });
}


// --- PHASE 4 LOGIC (Debrief) ---
function renderP4() {
    document.getElementById('phase-4-screen').classList.add('active');
    updateHUD(`P4: FINAL EDIT ${state.index + 1}/${P4_TASKS.length}`);

    const task = P4_TASKS[state.index];
    document.getElementById('p4-draft').innerText = task.draft;
    document.getElementById('p4-input').value = "";
    document.getElementById('p4-progress').style.width = `${((state.index) / P4_TASKS.length) * 100}%`;
}

function submitP4() {
    if (state.phase !== 'P4' || state.feedbackOpen) return;
    const input = document.getElementById('p4-input').value.trim();
    const task = P4_TASKS[state.index];

    if (normalizeAnswer(input) === normalizeAnswer(task.ans)) {
        showFeedback("APPROVED", "Draft saved.", "success", () => {
            state.index++;
            if (state.index >= P4_TASKS.length) {
                endGame("MISSION SUCCESS", "The hostages are safe. The timeline is restored. You are a hero.");
            } else {
                render();
            }
        });
    } else {
        showFeedback("REJECTED", "Check the tense, verb form or preposition and try again.", "tragic");
    }
}


function normalizeAnswer(text) {
    return text.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.!?]+$/, '');
}
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('p2-submit').addEventListener('click', submitP2);
document.getElementById('p4-submit').addEventListener('click', submitP4);
for (const phase of ['p2', 'p4']) {
    document.getElementById(phase + '-input').addEventListener('keydown', event => {
if (event.key === 'Enter') document.getElementById(phase + '-submit').click();
    });
}
function confirm() {
    if (state.feedbackOpen) document.getElementById('feedback-btn').click();
    else if (state.phase === 'INTRO') startGame();
    else if (state.phase === 'P2') submitP2();
    else if (state.phase === 'P4') submitP4();
    else if (state.phase === 'END') location.reload();
}
let disposeControls = () => {};
function updateControls() {
    disposeControls();
    const actions = { confirm };
    const container = state.phase === 'P1' ? 'p1-cards' : state.phase === 'P3' ? 'p3-options' : null;
    if (container && !state.feedbackOpen) {
        Array.from(document.getElementById(container).children).forEach((button, index) => {
            actions['answer' + (index + 1)] = () => button.click();
        });
    }
    disposeControls = bindGameControls('negotiation-tactics', actions);
}
updateControls();
window.addEventListener('pagehide', () => clearInterval(state.timerInterval));
