// Word list loaded from words.js (window.gameLevels)

class MegaConsole {
    constructor() {
        this.totalLevels = window.gameLevels.length;
        this.currentLevelIndex = 0;

        // Game State
        this.currentLevelWords = []; // Array of 10 words for current level
        this.currentWordIndex = 0;
        this.isLocked = false;

        // Scoring
        this.score = 0;
        this.wordStartTime = 0;
        this.baseWordScore = 1000;
        this.wrongGuessPenalty = 50;
        this.timeDecayRate = 5;
        this.hintPenalty = 50;
        this.renderedHintIndices = new Set();

        // UI Elements
        this.levelTitle = document.getElementById('level-title');
        this.levelIndicator = document.getElementById('level-indicator');
        this.clueText = document.getElementById('clue-text');
        this.wordInput = document.getElementById('word-input');
        this.wordMask = document.getElementById('word-mask');
        this.hintBtn = document.getElementById('hint-btn');
        this.feedbackMessage = document.getElementById('feedback-message');
        this.progressBar = document.getElementById('progress-bar');
        this.progressText = document.getElementById('progress-text');
        this.gameScreen = document.getElementById('game-screen');
        this.victoryScreen = document.getElementById('victory-screen');
        this.restartBtn = document.getElementById('restart-btn');
        this.scoreDisplay = document.getElementById('score-display');
        this.finalScoreDisplay = document.getElementById('final-score');

        // Leaderboard Elements
        this.leaderboardSection = document.getElementById('leaderboard-section');
        this.playerNameInput = document.getElementById('player-name');
        this.saveScoreBtn = document.getElementById('save-score-btn');
        this.scoreList = document.getElementById('score-list');
        this.highScoresDiv = document.getElementById('high-scores');
        this.highScoresDiv = document.getElementById('high-scores');
        this.inputNameContainer = document.querySelector('.input-name-container');
        this.optionsContainer = document.getElementById('options-container');

        this.addEventListeners();
        this.init();
    }

    init() {
        this.currentLevelIndex = 0;
        this.score = 0;
        this.updateScoreDisplay();

        this.gameScreen.classList.remove('hidden');
        this.victoryScreen.classList.add('hidden');

        this.startLevel(0);
        this.updateProgress();
    }

    addEventListeners() {
        this.wordInput.addEventListener('keydown', (e) => {
            if (this.feedbackMessage.classList.contains('error')) {
                this.feedbackMessage.textContent = '';
                this.feedbackMessage.classList.remove('error');
            }
            if (e.key === 'Enter') {
                this.checkInput();
            }
            // Add Control key shortcut for hint
            if (e.key === 'Control' || e.key === 'Tab') {
                e.preventDefault(); // Stop tab from moving focus
                this.useHint();
            }
        });

        this.wordInput.addEventListener('input', () => {
            this.updateMaskState();
        });

        this.hintBtn.addEventListener('click', () => {
            this.useHint();
        });

        this.restartBtn.addEventListener('click', () => {
            // Reset UI for next game
            this.inputNameContainer.classList.remove('hidden');
            this.highScoresDiv.classList.add('hidden');
            this.restartBtn.classList.add('hidden');
            this.init();
        });

        this.saveScoreBtn.addEventListener('click', () => {
            this.saveScore();
        });

        document.addEventListener('click', (e) => {
            // Don't auto focus if we are typing name or clicking hint
            // Use closest to detect if click originated from button or its children
            if (e.target.closest('#hint-btn') || e.target === this.playerNameInput || e.target === this.saveScoreBtn) return;
            if (!this.victoryScreen.classList.contains('hidden')) return;
            this.wordInput.focus();
        });
    }

    startLevel(levelIndex) {
        if (levelIndex >= this.totalLevels) {
            this.triggerVictory();
            return;
        }

        this.currentLevelIndex = levelIndex;
        this.currentWordIndex = 0;

        // Randomly pick 10 unique words from the pool
        const pool = [...window.gameLevels[levelIndex].words];
        this.currentLevelWords = [];

        // Fisher-Yates Shuffle or simple loop
        for (let i = 0; i < 10 && pool.length > 0; i++) {
            const r = Math.floor(Math.random() * pool.length);
            this.currentLevelWords.push(pool.splice(r, 1)[0]);
        }

        this.loadCurrentWord();
    }

    loadCurrentWord() {
        if (this.currentWordIndex >= this.currentLevelWords.length) {
            this.levelComplete();
            return;
        }

        const levelData = window.gameLevels[this.currentLevelIndex];
        const wordData = this.currentLevelWords[this.currentWordIndex];
        const targetWord = wordData.word;

        // Update UI
        this.levelTitle.textContent = levelData.title;
        this.levelTitle.setAttribute('data-text', levelData.title);
        this.levelIndicator.textContent = `LEVEL ${String(this.currentLevelIndex + 1).padStart(2, '0')} | SEQ ${String(this.currentWordIndex + 1).padStart(2, '0')}`;

        this.scrambleText(this.clueText, wordData.clue);

        this.wordInput.value = '';
        this.feedbackMessage.textContent = '';
        this.isLocked = false;

        // Start Timer
        this.wordStartTime = Date.now();

        // CHECK UI MODE: CHOICE or INPUT
        if (wordData.options && wordData.options.length > 0) {
            // MULTIPLE CHOICE MODE
            this.wordInput.classList.add('hidden');
            this.wordMask.classList.add('hidden');
            this.hintBtn.classList.add('hidden');
            this.optionsContainer.classList.remove('hidden');
            this.optionsContainer.innerHTML = '';

            // Randomize options? No need if generated randomly, but let's shuffle just in case
            // actually generate_words.py usually has correct answer in the list.
            // Let's create buttons
            wordData.options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'option-btn';
                btn.textContent = opt;
                btn.onclick = () => this.handleOptionClick(opt); // Bind logic
                this.optionsContainer.appendChild(btn);
            });

        } else {
            // STANDARD INPUT MODE
            this.wordInput.classList.remove('hidden');
            this.wordMask.classList.remove('hidden');
            this.hintBtn.classList.remove('hidden');
            this.optionsContainer.classList.add('hidden');
            this.hintBtn.disabled = false;

            // Setup Mask
            this.renderedHintIndices = new Set();
            this.renderMask(targetWord);

            this.wordInput.placeholder = '';
            this.wordInput.maxLength = targetWord.length;
            this.wordInput.focus();
            this.wordInput.style.borderColor = 'var(--dim-green)';

            // Calculate Dynamic Hint Penalty
            this.hintPenalty = Math.floor(this.baseWordScore / targetWord.length) + 50;
            this.hintBtn.textContent = `DECRYPT LETTER [-${this.hintPenalty} PTS]`;
            this.hintsUsed = 0;
        }

        this.updateProgress();
    }

    handleOptionClick(selectedOption) {
        if (this.isLocked) return;
        this.isLocked = true; // Lock input to prevent multiple clicks

        const target = this.currentLevelWords[this.currentWordIndex].word.toUpperCase();
        if (selectedOption.toUpperCase() === target) {
            this.handleSuccess();
        } else {
            this.handleFailure();
        }
    }

    renderMask(word) {
        this.wordMask.innerHTML = '';
        for (let i = 0; i < word.length; i++) {
            const span = document.createElement('span');
            // If index is in hint set, show letter
            if (this.renderedHintIndices.has(i)) {
                span.textContent = word[i];
                span.className = 'revealed';
            } else {
                span.textContent = '';
            }
            this.wordMask.appendChild(span);
        }
    }

    updateMaskState() {
        // Just sync standard input typing to the mask (as preview)
        // Requested to REMOVE this feature. Mask only shows hints now.
    }

    useHint() {
        if (this.isLocked) return;

        // Check Limit
        if (this.hintsUsed >= 3) {
            this.feedbackMessage.textContent = 'MAX HINTS REACHED';
            this.feedbackMessage.className = 'feedback error';
            return;
        }

        // CHECK FUNDS
        if (this.score < this.hintPenalty) {
            this.feedbackMessage.textContent = 'INSUFFICIENT DATA POINTS';
            this.feedbackMessage.className = 'feedback error';
            setTimeout(() => {
                if (this.feedbackMessage.textContent === 'INSUFFICIENT DATA POINTS') {
                    this.feedbackMessage.textContent = '';
                    this.feedbackMessage.className = 'feedback';
                }
            }, 1000);
            return;
        }

        const targetWord = this.currentLevelWords[this.currentWordIndex].word;
        const availableIndices = [];

        for (let i = 0; i < targetWord.length; i++) {
            if (!this.renderedHintIndices.has(i)) {
                availableIndices.push(i);
            }
        }

        if (availableIndices.length === 0) return;

        // Penalize score
        this.score -= this.hintPenalty;
        this.updateScoreDisplay();

        // Track Usage
        this.hintsUsed++;
        if (this.hintsUsed >= 3) {
            this.hintBtn.disabled = true;
            this.hintBtn.textContent = 'MAX HINTS (3/3)';
        } else {
            // Optional: update text to show remaining
            // this.hintBtn.textContent = `DECRYPT LETTER (${this.hintsUsed}/3) [-${this.hintPenalty}]`;
        }

        // Reveal random index
        const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        this.renderedHintIndices.add(randomIndex);

        this.renderMask(targetWord);
        this.updateMaskState();

        // Flash feedback
        this.feedbackMessage.textContent = `DECRYPTING... [-${this.hintPenalty}]`;
        setTimeout(() => { this.feedbackMessage.textContent = ''; }, 500);
    }

    checkInput() {
        if (this.isLocked) return;

        const input = this.wordInput.value.trim().toUpperCase();
        const target = this.currentLevelWords[this.currentWordIndex].word.toUpperCase();

        if (input === target) {
            this.handleSuccess();
        } else {
            this.handleFailure();
        }
    }

    handleSuccess() {
        this.isLocked = true;

        // Calculate Score
        const timeTakenSec = (Date.now() - this.wordStartTime) / 1000;
        let points = this.baseWordScore - Math.floor(timeTakenSec * this.timeDecayRate);
        if (points < 100) points = 100; // Minimum score

        this.score += points;
        this.updateScoreDisplay();

        this.feedbackMessage.textContent = `ACCESS GRANTED [+${points} PTS]`;
        this.feedbackMessage.className = 'feedback success';
        this.wordInput.style.borderColor = 'var(--neon-green)';

        // Disable buttons if in choice mode
        const buttons = this.optionsContainer.querySelectorAll('button');
        buttons.forEach(btn => btn.disabled = true);

        setTimeout(() => {
            this.currentWordIndex++;
            this.loadCurrentWord();
        }, 1500);
    }

    handleFailure() {
        this.score -= this.wrongGuessPenalty;
        if (this.score < 0) this.score = 0;
        this.updateScoreDisplay();

        this.feedbackMessage.textContent = `ACCESS DENIED [-${this.wrongGuessPenalty} PTS]`;
        this.feedbackMessage.className = 'feedback error';

        // If Input mode, select text
        if (!this.wordInput.classList.contains('hidden')) {
            this.wordInput.select();
        } else {
            // If Choice mode, unlock to allow retry
            this.isLocked = false;
        }
    }

    updateScoreDisplay() {
        this.scoreDisplay.textContent = String(this.score).padStart(6, '0');
    }

    levelComplete() {
        this.feedbackMessage.textContent = 'SYSTEM UPGRADE...';
        setTimeout(() => {
            this.startLevel(this.currentLevelIndex + 1);
        }, 1000);
    }

    updateProgress() {
        // Calculate generally based on level
        const percent = Math.floor((this.currentLevelIndex / this.totalLevels) * 100);
        this.progressBar.style.width = `${percent}%`;
        this.progressText.textContent = `${percent}% DETECTED`;
    }

    triggerVictory() {
        this.gameScreen.classList.add('hidden');
        this.victoryScreen.classList.remove('hidden');

        this.progressBar.style.width = '100%';
        this.progressText.textContent = '100% COMPLETE';
        this.finalScoreDisplay.textContent = this.score;

        // Reset inputs
        this.playerNameInput.value = '';
        this.inputNameContainer.classList.remove('hidden');
        this.highScoresDiv.classList.add('hidden');
        this.restartBtn.classList.add('hidden');

        // Show Certificate (initially hidden until name logic?) No, show it below
        this.renderCertificate('AGENT_UNKNOWN', this.score);
    }

    renderCertificate(name, score) {
        const certDisplay = document.getElementById('certificate-display');
        certDisplay.innerHTML = `
            <div class="cert-header">OFFICIAL CERTIFICATION</div>
            <div class="cert-body">
                This certifies that <strong>${name}</strong> has successfully overridden the MEGA-CONSOLE.
                <br><br>
                Final Score: <strong>${score}</strong>
                <br>
                Status: <strong>SPELLING LEGEND</strong>
                <br>
                Clearance Level: <strong>UNRESTRICTED</strong>
            </div>
            <div class="cert-signature">
                Verified by: <br> SYSTEM ADMINISTRATOR
            </div>
            <div class="cert-stamp">PASSED</div>
        `;
        certDisplay.className = 'visible';
    }

    saveScore() {
        const name = this.playerNameInput.value.trim().toUpperCase() || 'UNKNOWN';

        // Save to LocalStorage
        const newScore = { name: name, score: this.score, date: new Date().toISOString() };
        let highScores = JSON.parse(localStorage.getItem('megaConsoleScores') || '[]');
        highScores.push(newScore);

        // Sort by score desc
        highScores.sort((a, b) => b.score - a.score);

        // Keep top 5 (storage) but display top 3
        highScores = highScores.slice(0, 5); // Keep a few more in storage
        localStorage.setItem('megaConsoleScores', JSON.stringify(highScores));

        // Show Leaderboard
        this.showLeaderboard(highScores);
        this.renderCertificate(name, this.score);
    }

    showLeaderboard(scores) {
        this.inputNameContainer.classList.add('hidden');
        this.highScoresDiv.classList.remove('hidden');
        this.restartBtn.classList.remove('hidden');

        this.scoreList.innerHTML = '';
        scores.slice(0, 3).forEach((s, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${index + 1}. ${s.name}</span>
                <span>${s.score}</span>
            `;
            this.scoreList.appendChild(li);
        });
    }

    scrambleText(element, finalText) {
        let iterations = 0;
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';

        if (element.dataset.interval) clearInterval(parseInt(element.dataset.interval));

        const interval = setInterval(() => {
            element.textContent = finalText
                .split('')
                .map((letter, index) => {
                    if (index < iterations) {
                        return finalText[index];
                    }
                    return chars[Math.floor(Math.random() * chars.length)];
                })
                .join('');

            if (iterations >= finalText.length) {
                clearInterval(interval);
            }

            iterations += 1 / 2;
        }, 20);

        element.dataset.interval = interval;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MegaConsole();
});
