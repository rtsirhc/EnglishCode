import { questions as builtInQuestions } from './questions.js';
import { gameRuntime } from '/gallery/shared/runtime.js';
import { tone } from '/gallery/shared/sound.js';
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const runtime = gameRuntime('wh-questions-game', 'words', {
    confirm: checkAnswer,
    next: proceedToNext,
    hint: revealLetter,
    buzzer: () => { if (state.currentQuestionIndex >= 0 && elements.feedback.classList.contains('hidden')) togglePause(); },
});
const questions = runtime.pack ? runtime.pack.items.map(item => ({ q: item.clue, a: [item.word], clue: item.clue })) : builtInQuestions;
// Game State
const state = {
    teams: [],
    currentTeamIndex: 0,
    currentQuestionIndex: -1,
    usedQuestions: new Set(),
    revealedIndices: new Set(),
    currentAnswerString: "",
    timer: 15,
    timerInterval: null,
    advanceTimeout: null,
    isPaused: false,
    shouldIncrementTurn: true,
    shouldPickNewQuestion: true
};

// DOM Elements
const elements = {
    app: document.getElementById('app'),
    startScreen: document.getElementById('start-screen'),
    teamSelectBtns: document.querySelectorAll('.team-select-btn'),
    timerText: document.getElementById('timer-text'),
    timerBar: document.getElementById('timer-bar'),
    pauseBtn: document.getElementById('pause-btn'),
    questionText: document.getElementById('question-text'),
    answerSlots: document.getElementById('answer-slots'),
    teamName: document.getElementById('team-name'),
    answerInput: document.getElementById('answer-input'),
    clueBtn: document.getElementById('clue-btn'),
    revealBtn: document.getElementById('reveal-btn'),
    nextBtn: document.getElementById('overlay-next-btn'),
    feedback: document.getElementById('feedback-message'),
    feedbackContent: document.querySelector('.feedback-content'),
    scoreboardContainer: document.getElementById('scoreboard'),
    sounds: {
        correct: { play: () => tone('correct') },
        wrong: { play: () => tone('wrong') }
    }
};

// Initialization
function init() {
    elements.teamSelectBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const count = parseInt(btn.dataset.teams);
            startGame(count);
        });
    });

    elements.answerInput.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' || event.repeat) return;
        event.preventDefault();
        checkAnswer();
    });

    elements.clueBtn.addEventListener('click', revealLetter);
    document.getElementById('check-btn').addEventListener('click', checkAnswer);
    elements.revealBtn.addEventListener('click', revealAnswer);
    elements.pauseBtn.addEventListener('click', togglePause);

    elements.nextBtn.addEventListener('click', () => {
        proceedToNext();
    });
}

function startGame(teamCount) {
    state.teams = [];
    for (let i = 1; i <= teamCount; i++) {
        state.teams.push({ name: `Team ${i}`, score: 0 });
    }

    renderScoreboard();

    elements.startScreen.style.display = 'none';
    elements.app.classList.remove('hidden');

    updateActiveTeam();
    pickNewQuestion();
}

function renderScoreboard() {
    elements.scoreboardContainer.innerHTML = '<h3>Scores</h3>';

    state.teams.forEach((team, index) => {
        const div = document.createElement('div');
        div.className = 'team-score';
        div.id = `score-team-${index}`;
        div.innerHTML = `
            <span class="team-label">${team.name}</span>
            <span class="score-value">0</span>
        `;
        elements.scoreboardContainer.appendChild(div);
    });
}

function getScoreboardElement(index) {
    return document.getElementById(`score-team-${index}`);
}

// Core Game Logic
function pickNewQuestion() {
    stopTimer();
    state.isPaused = false;
    updatePauseBtn();

    // Reset state for new question
    state.revealedIndices.clear();
    elements.feedback.className = 'feedback hidden';
    elements.answerInput.value = '';
    elements.answerInput.focus();

    // Pick random question
    if (state.usedQuestions.size >= questions.length) {
        state.usedQuestions.clear();
    }

    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * questions.length);
    } while (state.usedQuestions.has(randomIndex));

    state.usedQuestions.add(randomIndex);
    state.currentQuestionIndex = randomIndex;

    const q = questions[randomIndex];
    elements.questionText.textContent = q.q;

    state.currentAnswerString = q.a[0];
    renderAnswerSlots();

    startTimer();
}

function renderAnswerSlots() {
    elements.answerSlots.innerHTML = '';
    const answer = state.currentAnswerString;

    for (let i = 0; i < answer.length; i++) {
        const char = answer[i];
        const slot = document.createElement('div');

        if (char === ' ') {
            slot.className = 'answer-slot space';
        } else {
            slot.className = 'answer-slot';
            // Determine if revealed
            if (state.revealedIndices.has(i)) {
                slot.textContent = char;
                slot.classList.add('revealed');
            }
        }
        elements.answerSlots.appendChild(slot);
    }
}

function updateActiveTeam() {
    elements.teamName.textContent = state.teams[state.currentTeamIndex].name;

    state.teams.forEach((team, index) => {
        const board = getScoreboardElement(index);
        if (board) {
            if (index === state.currentTeamIndex) {
                board.classList.add('active');
            } else {
                board.classList.remove('active');
            }
        }
    });
}

function updateScoreboardValues() {
    state.teams.forEach((team, index) => {
        const board = getScoreboardElement(index);
        if (board) {
            const scoreSpan = board.querySelector('.score-value');
            scoreSpan.textContent = team.score;
        }
    });
}

function checkAnswer() {
    if (!elements.feedback.classList.contains('hidden') || state.currentQuestionIndex < 0) return;
    const userAnswer = elements.answerInput.value.trim().toLowerCase();
    const currentQ = questions[state.currentQuestionIndex];

    if (!userAnswer) return;

    const isCorrect = currentQ.a.some(answer => userAnswer === answer.toLowerCase());

    if (isCorrect) {
        handleCorrect();
    } else {
        handleIncorrect();
    }
}

function handleCorrect() {
    stopTimer();
    state.teams[state.currentTeamIndex].score += 5;
    updateScoreboardValues();

    // Reveal everything
    const answer = state.currentAnswerString;
    for (let i = 0; i < answer.length; i++) {
        state.revealedIndices.add(i);
    }
    renderAnswerSlots();

    elements.sounds.correct.currentTime = 0;
    elements.sounds.correct.play().catch(e => console.log("Audio play failed", e));

    state.shouldIncrementTurn = true;
    state.shouldPickNewQuestion = true;

    // Manual continue for correct answer
    // Use green color explicitly for the answer text
    showFeedback(`Correct!<br><span style="font-size: 0.6em; color: var(--success-color); background: white; padding: 0 1rem; border-radius: 10px;">${escapeHTML(answer.toUpperCase())}</span>`, "success", true);
}

function handleIncorrect() {
    stopTimer();
    elements.sounds.wrong.currentTime = 0;
    elements.sounds.wrong.play().catch(e => console.log("Audio play failed", e));

    state.shouldIncrementTurn = true;
    state.shouldPickNewQuestion = false; // SAME question

    // Auto-advance for incorrect, no arrow
    showFeedback("Incorrect!", "error", false);

    state.advanceTimeout = setTimeout(proceedToNext, 2000);
}

function revealLetter() {
    if (state.currentQuestionIndex < 0 || !elements.feedback.classList.contains('hidden')) return;
    const remaining = state.currentAnswerString.split('').map((letter, index) => index)
        .filter(index => state.currentAnswerString[index] !== ' ' && !state.revealedIndices.has(index));
    if (!remaining.length) return;
    state.revealedIndices.add(remaining[Math.floor(Math.random() * remaining.length)]);
    state.teams[state.currentTeamIndex].score -= 2;
    updateScoreboardValues();
    renderAnswerSlots();
}

function revealAnswer() {
    if (!elements.feedback.classList.contains('hidden') || state.currentQuestionIndex < 0) return;
    stopTimer();
    const answer = state.currentAnswerString;
    for (let i = 0; i < answer.length; i++) {
        state.revealedIndices.add(i);
    }
    renderAnswerSlots();

    state.shouldIncrementTurn = false; // Turn stays
    state.shouldPickNewQuestion = true; // New question (since answer revealed)

    showFeedback(`Answer Revealed<br><span style="font-size: 0.6em;">${escapeHTML(answer.toUpperCase())}</span>`, "error", true);
}

function proceedToNext() {
    if (elements.feedback.classList.contains('hidden')) return;
    clearTimeout(state.advanceTimeout);
    elements.feedback.classList.remove('success', 'error');
    elements.feedback.classList.add('hidden');

    if (state.shouldIncrementTurn) {
        state.currentTeamIndex = (state.currentTeamIndex + 1) % state.teams.length;
    }
    updateActiveTeam();

    if (state.shouldPickNewQuestion) {
        pickNewQuestion();
    } else {
        // Same question for next team
        prepareSameQuestion();
    }
}

function prepareSameQuestion() {
    stopTimer();
    state.isPaused = false;
    updatePauseBtn();

    elements.answerInput.value = '';
    elements.answerInput.focus();
    // Don't clear slots

    startTimer();
}

function showFeedback(html, type, showArrow) {
    elements.feedbackContent.innerHTML = html;
    elements.feedback.classList.remove('hidden', 'success', 'error');
    elements.feedback.classList.add(type);

    if (showArrow) {
        elements.nextBtn.style.display = 'block';
        elements.answerInput.blur();
        elements.nextBtn.focus();
    } else {
        elements.nextBtn.style.display = 'none';
        elements.answerInput.focus();
    }
}

// Timer Logic
function startTimer() {
    state.timer = 15;
    updateTimerDisplay();
    state.isPaused = false;
    updatePauseBtn();

    if (state.timerInterval) clearInterval(state.timerInterval);

    state.timerInterval = setInterval(() => {
        if (!state.isPaused) {
            state.timer--;
            updateTimerDisplay();

            if (state.timer <= 0) {
                handleTimeout();
            }
        }
    }, 1000);
}

function stopTimer() {
    if (state.timerInterval) clearInterval(state.timerInterval);
}

function togglePause() {
    state.isPaused = !state.isPaused;
    updatePauseBtn();
}

function updatePauseBtn() {
    elements.pauseBtn.setAttribute('aria-label', state.isPaused ? 'Resume timer' : 'Pause timer');
    if (state.isPaused) {
        elements.pauseBtn.textContent = '▶';
        elements.pauseBtn.classList.add('paused');
    } else {
        elements.pauseBtn.textContent = '❚❚';
        elements.pauseBtn.classList.remove('paused');
    }
}

function updateTimerDisplay() {
    elements.timerText.textContent = state.timer;
    const percentage = (state.timer / 15) * 100;
    elements.timerBar.style.width = `${percentage}%`;

    if (state.timer <= 5) {
        elements.timerBar.style.backgroundColor = '#d63031';
    } else {
        elements.timerBar.style.backgroundColor = '#00CEC9';
    }
}

function handleTimeout() {
    stopTimer();
    elements.sounds.wrong.currentTime = 0;
    elements.sounds.wrong.play().catch(e => console.log("Audio play failed", e));

    state.teams[state.currentTeamIndex].score -= 1;
    updateScoreboardValues();

    state.shouldIncrementTurn = true;
    state.shouldPickNewQuestion = false; // SAME question

    showFeedback("Time's Up! -1 Pt", "error", false);

    state.advanceTimeout = setTimeout(proceedToNext, 2000);
}

// Start
init();
