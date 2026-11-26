import confetti from 'canvas-confetti';
import { gameRuntime } from '../gallery/shared/runtime.js';

const runtime = gameRuntime('human-sentence-scramble', 'sentences', {
  next: () => { if (document.getElementById('rosterModal').classList.contains('hidden')) nextPrompt(); },
  confirm: () => { if (document.getElementById('rosterModal').classList.contains('hidden')) toggleTimer(); }
});

function renderIcons() {
  const symbols = { shuffle:'⤨', 'volume-2':'♪', 'volume-x':'♩', 'refresh-cw':'↻', users:'♟', sparkles:'✧', trophy:'★', layers:'▤', 'chevron-left':'‹', 'chevron-right':'›', pause:'Ⅱ', play:'▶', 'rotate-ccw':'↺', crown:'♛', 'users-2':'♟', plus:'+', 'edit-3':'✎', x:'×', 'user-plus':'+', 'trash-2':'−', 'x-circle':'×' };
  for (const icon of document.querySelectorAll('[data-lucide]')) {
    icon.textContent = symbols[icon.dataset.lucide] || '';
    icon.setAttribute('aria-hidden', 'true');
  }
}

    // --- 48 A1-A2 PROMPTS DATASET (Short, punchy & open-ended) ---
    const PROMPTS_DATASET = [
      // To Be
      { id: 1, text: 'Form a sentence with "am", "is", or "are".', category: 'To Be' },
      { id: 2, text: 'Form a negative sentence with "is not" or "are not".', category: 'To Be' },
      { id: 3, text: 'Form a Yes/No question starting with "Is" or "Are".', category: 'To Be' },
      { id: 4, text: 'Form a sentence starting with "There is" or "There are".', category: 'To Be' },
      { id: 5, text: 'Form a sentence with "There are" with 5 words.', category: 'To Be', challenge: true },
      { id: 6, text: 'Form a negative sentence with "to be" with 5 words.', category: 'To Be', challenge: true },

      // Have / Has & Numbers
      { id: 7, text: 'Form a sentence with "has" or "have".', category: 'Have / Has' },
      { id: 8, text: 'Form an affirmative sentence with "has" and a number.', category: 'Have / Has' },
      { id: 9, text: 'Form a negative sentence with "don\'t" or "doesn\'t".', category: 'Have / Has' },
      { id: 10, text: 'Form a question with "Do you have".', category: 'Have / Has' },
      { id: 11, text: 'Form a sentence with "have" with 6 words.', category: 'Have / Has', challenge: true },
      { id: 12, text: 'Form a negative sentence with "doesn\'t" with 7 words.', category: 'Have / Has', challenge: true },

      // Daily Routines & Habits
      { id: 13, text: 'Form a sentence about a daily routine.', category: 'Daily Routine' },
      { id: 14, text: 'Form a sentence with "always", "usually", or "never".', category: 'Daily Routine' },
      { id: 15, text: 'Form a sentence with a 3rd person singular verb (he / she / it).', category: 'Simple Present' },
      { id: 16, text: 'Form a sentence about a daily routine with 6 words.', category: 'Daily Routine', challenge: true },
      { id: 17, text: 'Form a negative 3rd person sentence with 8 words.', category: 'Simple Present', challenge: true },
      { id: 18, text: 'Form a sentence about habits with 7 words.', category: 'Daily Routine', challenge: true },

      // Do / Does & Questions
      { id: 19, text: 'Form a Yes/No question with "Do you".', category: 'Do / Does Questions' },
      { id: 20, text: 'Form a Yes/No question with "Does he" or "Does she".', category: 'Do / Does Questions' },
      { id: 21, text: 'Form a question with "What".', category: 'Wh- Questions' },
      { id: 22, text: 'Form a question with "Where".', category: 'Wh- Questions' },
      { id: 23, text: 'Form a question with "When" or "What time".', category: 'Wh- Questions' },
      { id: 24, text: 'Form a question with "How many".', category: 'Wh- Questions' },
      { id: 25, text: 'Form a question with "Who" or "Why".', category: 'Wh- Questions' },
      { id: 26, text: 'Form a Yes/No question with "Do" or "Does" with 6 words.', category: 'Do / Does Questions', challenge: true },
      { id: 27, text: 'Form a question with "Where" with 7 words.', category: 'Wh- Questions', challenge: true },
      { id: 28, text: 'Form a question with "What time" with 7 words.', category: 'Wh- Questions', challenge: true },
      { id: 29, text: 'Form a Yes/No question with "Does" with 7 words.', category: 'Do / Does Questions', challenge: true },

      // Prepositions of Place
      { id: 30, text: 'Form a sentence with "in", "on", or "under".', category: 'Prepositions of Place' },
      { id: 31, text: 'Form a sentence with "next to" or "behind".', category: 'Prepositions of Place' },
      { id: 32, text: 'Form a sentence with "between".', category: 'Prepositions of Place' },
      { id: 33, text: 'Form a sentence with a preposition of place with 6 words.', category: 'Prepositions of Place', challenge: true },
      { id: 34, text: 'Form a sentence with "There is" with 6 words.', category: 'To Be', challenge: true },
      { id: 35, text: 'Form a sentence with a preposition of place and a number.', category: 'Prepositions of Place' },

      // Prepositions of Time
      { id: 36, text: 'Form a sentence with "at", "on", or "in" (for time).', category: 'Prepositions of Time' },
      { id: 37, text: 'Form a sentence with "at" + a specific time (e.g. at 7 o\'clock).', category: 'Prepositions of Time' },
      { id: 38, text: 'Form a sentence with "before" or "after".', category: 'Prepositions of Time' },
      { id: 39, text: 'Form a sentence with time with 7 words.', category: 'Prepositions of Time', challenge: true },

      // Directions & Movement
      { id: 40, text: 'Form a sentence with "Turn left" or "Turn right".', category: 'Directions' },
      { id: 41, text: 'Form a sentence with "Go straight".', category: 'Directions' },
      { id: 42, text: 'Form a sentence with "across from" or "next to".', category: 'Directions' },
      { id: 43, text: 'Form a direction question starting with "How do I get to...".', category: 'Directions' },
      { id: 44, text: 'Form a direction sentence with 8 words.', category: 'Directions', challenge: true },

      // Combo & Challenges
      { id: 45, text: 'Form an affirmative 3rd person sentence with 6 words.', category: 'Simple Present', challenge: true },
      { id: 46, text: 'Form a question with "Do" and a preposition of time.', category: 'Combo Challenge' },
      { id: 47, text: 'Form a sentence with a number with 6 words.', category: 'Numbers', challenge: true },
      { id: 48, text: 'Form a sentence with "have/has", a number, and a preposition of place with 8 words.', category: 'Super Challenge', challenge: true }
    ];

    // --- GAME STATE ---
    let promptsDeck = [];
    let currentPromptIndex = 0;
    let students = []; // { id, name, score }
    let audioEnabled = true;

    // Timer Variables
    let timerDuration = 30;
    let timerRemaining = 30;
    let timerInterval = null;
    let isTimerRunning = false;

    // Web Audio API Synthesizer
    let audioCtx = null;

    function getAudioContext() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return audioCtx;
    }

    // --- SOUND EFFECTS GENERATOR ---
    function playSound(type) {
      if (!audioEnabled) return;
      try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        if (type === 'start') {
          [261.63, 329.63, 392.00, 523.25].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, now + i * 0.08);
            gain.gain.linearRampToValueAtTime(0.18, now + i * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.08);
            osc.stop(now + i * 0.08 + 0.3);
          });
        } 
        else if (type === 'tick') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.05);
        } 
        else if (type === 'end') {
          const freqs = [392.00, 311.13, 261.63];
          freqs.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, now + i * 0.12);
            gain.gain.linearRampToValueAtTime(0.2, now + i * 0.12 + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.5);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.12);
            osc.stop(now + i * 0.12 + 0.55);
          });
        }
        else if (type === 'score') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.22);
        }
      } catch (e) {}
    }

    function toggleAudio() {
      audioEnabled = !audioEnabled;
      const soundIcon = document.getElementById('soundIcon');
      const soundLabel = document.getElementById('soundLabel');
      if (audioEnabled) {
        soundIcon.setAttribute('data-lucide', 'volume-2');
        soundIcon.className = 'w-3.5 h-3.5 text-emerald-400';
        soundLabel.textContent = 'Sound ON';
        playSound('score');
      } else {
        soundIcon.setAttribute('data-lucide', 'volume-x');
        soundIcon.className = 'w-3.5 h-3.5 text-rose-400';
        soundLabel.textContent = 'Sound OFF';
      }
      renderIcons();
    }

    // --- INIT APP ---
    window.addEventListener('DOMContentLoaded', () => {
      renderIcons();
      loadStudentsFromStorage();
      shufflePromptsDeck();
      renderPrompt();
      renderRoster();
      renderLeaderboard();
      startTimer();
    });

    // --- PROMPT DECK MANAGEMENT ---
    function shufflePromptsDeck() {
      promptsDeck = runtime.pack ? runtime.pack.items.map(item => {
        const words = (item.correct ? item.text : item.correction).split(/\s+/);
        const original = words.join(' ');
        for (let i = words.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [words[i], words[j]] = [words[j], words[i]];
        }
        if (words.join(' ') === original && words.length > 1) words.push(words.shift());
        return { text: words.join(' · '), category: runtime.pack.title };
      }) : [...PROMPTS_DATASET];
      document.getElementById('levelLabel').textContent = runtime.pack?.level || 'A1–A2';
      for (let i = promptsDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [promptsDeck[i], promptsDeck[j]] = [promptsDeck[j], promptsDeck[i]];
      }
      currentPromptIndex = 0;
      document.getElementById('totalRoundsNum').textContent = promptsDeck.length;
      renderPrompt();
      resetTimer();
    }

    function renderPrompt() {
      if (promptsDeck.length === 0) return;
      const current = promptsDeck[currentPromptIndex];

      document.getElementById('currentRoundNum').textContent = currentPromptIndex + 1;
      document.getElementById('promptDisplay').textContent = `"${current.text}"`;
      document.getElementById('promptCategory').textContent = current.category;

      const challengeBadge = document.getElementById('challengeBadge');
      if (current.challenge) {
        challengeBadge.classList.remove('hidden');
      } else {
        challengeBadge.classList.add('hidden');
      }

      document.getElementById('prevBtn').disabled = (currentPromptIndex === 0);
      document.getElementById('prevBtn').style.opacity = (currentPromptIndex === 0) ? '0.5' : '1';
    }

    function nextPrompt() {
      if (currentPromptIndex < promptsDeck.length - 1) {
        currentPromptIndex++;
      } else {
        currentPromptIndex = 0;
      }
      renderPrompt();
      resetTimer();
      startTimer();
    }

    function prevPrompt() {
      if (currentPromptIndex > 0) {
        currentPromptIndex--;
        renderPrompt();
        resetTimer();
      }
    }

    // --- TIMER LOGIC ---
    function startTimer() {
      clearInterval(timerInterval);
      isTimerRunning = true;
      updateTimerUI();
      playSound('start');

      timerInterval = setInterval(() => {
        if (timerRemaining > 0) {
          timerRemaining--;
          if (timerRemaining <= 3 && timerRemaining > 0) {
            playSound('tick');
          }
          updateTimerUI();
        } else {
          clearInterval(timerInterval);
          isTimerRunning = false;
          playSound('end');
          updateTimerUI();
        }
      }, 1000);
    }

    function toggleTimer() {
      if (isTimerRunning) {
        clearInterval(timerInterval);
        isTimerRunning = false;
      } else {
        if (timerRemaining === 0) timerRemaining = 30;
        startTimer();
      }
      updateTimerUI();
    }

    function resetTimer() {
      clearInterval(timerInterval);
      timerRemaining = 30;
      isTimerRunning = false;
      updateTimerUI();
    }

    function updateTimerUI() {
      const timerDisplay = document.getElementById('timerSeconds');
      const timerProgress = document.getElementById('timerProgress');
      const statusText = document.getElementById('timerStatusText');
      const statusDot = document.getElementById('timerStatusDot');
      const pausePlayText = document.getElementById('pausePlayText');
      const pausePlayIcon = document.getElementById('pausePlayIcon');

      timerDisplay.textContent = timerRemaining;

      // Circular ring offset (Radius 40 => Circumference = 251.32)
      const offset = 251.32 - (timerRemaining / 30) * 251.32;
      timerProgress.style.strokeDashoffset = offset;

      if (timerRemaining <= 5) {
        timerProgress.setAttribute('class', 'text-rose-500 transition-all duration-300 ease-linear animate-pulse');
        timerDisplay.className = 'text-2xl font-black tracking-tight text-rose-400';
      } else if (timerRemaining <= 10) {
        timerProgress.setAttribute('class', 'text-amber-500 transition-all duration-300 ease-linear');
        timerDisplay.className = 'text-2xl font-black tracking-tight text-amber-300';
      } else {
        timerProgress.setAttribute('class', 'text-indigo-400 transition-all duration-300 ease-linear');
        timerDisplay.className = 'text-2xl font-black tracking-tight text-white';
      }

      if (isTimerRunning) {
        statusText.textContent = 'Countdown Active';
        statusText.className = 'text-xs font-extrabold text-emerald-400 uppercase tracking-wider';
        statusDot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping';
        pausePlayText.textContent = 'Pause Timer';
        pausePlayIcon.setAttribute('data-lucide', 'pause');
      } else if (timerRemaining === 0) {
        statusText.textContent = "TIME'S UP!";
        statusText.className = 'text-xs font-extrabold text-rose-500 uppercase tracking-wider animate-bounce';
        statusDot.className = 'w-2.5 h-2.5 rounded-full bg-rose-500';
        pausePlayText.textContent = 'Start Timer';
        pausePlayIcon.setAttribute('data-lucide', 'play');
      } else {
        statusText.textContent = 'Paused';
        statusText.className = 'text-xs font-extrabold text-amber-400 uppercase tracking-wider';
        statusDot.className = 'w-2.5 h-2.5 rounded-full bg-amber-500';
        pausePlayText.textContent = 'Resume Timer';
        pausePlayIcon.setAttribute('data-lucide', 'play');
      }
      renderIcons();
    }

    // --- STUDENT ROSTER & SCORING ---
    function loadStudentsFromStorage() {
      let saved;
      try { saved = localStorage.getItem('scramble_students'); } catch {}
      if (saved) {
        try {
          const entries = JSON.parse(saved);
          students = Array.isArray(entries) ? entries.filter(student =>
            student && /^[a-z0-9-]+$/i.test(student.id) && typeof student.name === 'string' && Number.isFinite(student.score)
          ) : [];
        } catch (e) {
          students = [];
        }
      } else {
        students = Array.from({ length: 5 }, (_, index) => ({
          id: String(index + 1), name: 'Player ' + (index + 1), score: 0
        }));
        saveStudentsToStorage();
      }
    }

    function saveStudentsToStorage() {
      try { localStorage.setItem('scramble_students', JSON.stringify(students)); } catch {}
    }

    function addSingleStudent() {
      const input = document.getElementById('quickAddInput');
      const name = input.value.trim();
      if (name) {
        students.push({
          id: Date.now().toString(),
          name: name,
          score: 0
        });
        saveStudentsToStorage();
        input.value = '';
        renderRoster();
        renderLeaderboard();
      }
    }

    function addPoints(studentId, amount) {
      const student = students.find(s => s.id === studentId);
      if (student) {
        student.score = Math.max(0, student.score + amount);
        saveStudentsToStorage();
        
        if (amount > 0) {
          playSound('score');
          try {
            confetti({
              particleCount: 20,
              spread: 50,
              origin: { y: 0.85 }
            });
          } catch(e){}
        }

        renderRoster();
        renderLeaderboard();
      }
    }

    function deleteStudent(studentId) {
      students = students.filter(s => s.id !== studentId);
      saveStudentsToStorage();
      renderRoster();
      renderLeaderboard();
    }

    function resetAllScores() {
      if (confirm('Reset scores for all students to 0?')) {
        students.forEach(s => s.score = 0);
        saveStudentsToStorage();
        renderRoster();
        renderLeaderboard();
      }
    }

    // --- ALPHABETICAL ROSTER RENDER ---
    function rosterText(value) {
      return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
    }

    function renderRoster() {
      const container = document.getElementById('rosterList');
      const countBadge = document.getElementById('studentCountBadge');
      container.innerHTML = '';

      countBadge.textContent = `${students.length} Student${students.length !== 1 ? 's' : ''}`;

      if (students.length === 0) {
        container.innerHTML = `<div class="text-center py-6 text-xs text-slate-500">No students added.</div>`;
        return;
      }

      const sortedRoster = [...students].sort((a, b) => a.name.localeCompare(b.name));

      sortedRoster.forEach(student => {
        const row = document.createElement('div');
        row.className = 'flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all';
        row.innerHTML = `
          <div class="flex items-center gap-2 overflow-hidden">
            <div class="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-300 font-bold text-[11px] flex items-center justify-center border border-indigo-500/30 flex-shrink-0">
              ${rosterText(student.name.charAt(0).toUpperCase())}
            </div>
            <span class="font-bold text-xs text-slate-200 truncate" title="${rosterText(student.name)}">${rosterText(student.name)}</span>
          </div>

          <div class="flex items-center gap-1.5 flex-shrink-0">
            <span class="text-xs font-black text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 min-w-[24px] text-center">${student.score}</span>
            <button onclick="addPoints('${student.id}', 1)" class="px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-sm shadow-emerald-600/30 flex items-center transition-all transform active:scale-95">
              +1
            </button>
            <button onclick="deleteStudent('${student.id}')" class="text-slate-600 hover:text-rose-400 p-0.5 transition-colors" title="Delete">
              <i data-lucide="x-circle" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        `;
        container.appendChild(row);
      });
      renderIcons();
    }

    // --- LEADERBOARD RENDER ---
    function renderLeaderboard() {
      const container = document.getElementById('leaderboardList');
      container.innerHTML = '';

      if (students.length === 0) {
        container.innerHTML = `<div class="text-center py-2 text-[11px] text-slate-500">No student scores yet</div>`;
        return;
      }

      const sortedByScore = [...students]
        .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
        .slice(0, 5);

      const rankIcons = ['🥇', '🥈', '🥉', '4th', '5th'];

      sortedByScore.forEach((student, index) => {
        const row = document.createElement('div');
        const isTop3 = index < 3;
        
        row.className = `flex items-center justify-between p-1.5 rounded-lg text-[11px] ${
          index === 0 ? 'bg-amber-500/15 border border-amber-500/30 text-amber-200' :
          index === 1 ? 'bg-slate-800/80 border border-slate-700 text-slate-200' :
          index === 2 ? 'bg-amber-900/20 border border-amber-800/30 text-amber-300' :
          'bg-slate-900/40 text-slate-400'
        }`;

        row.innerHTML = `
          <div class="flex items-center gap-1.5 overflow-hidden">
            <span class="w-5 text-center font-bold">${rankIcons[index]}</span>
            <span class="font-bold truncate">${rosterText(student.name)}</span>
          </div>
          <span class="font-black px-1.5 py-0.5 rounded ${isTop3 ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-300'}">
            ${student.score} pts
          </span>
        `;
        container.appendChild(row);
      });
    }

    // --- MODAL FUNCTIONS ---
    function openRosterModal() {
      document.getElementById('rosterModal').classList.remove('hidden');
    }

    function closeRosterModal() {
      document.getElementById('rosterModal').classList.add('hidden');
    }

    function saveBulkRoster() {
      const text = document.getElementById('bulkRosterInput').value;
      if (!text.trim()) return;

      const lines = text.split(/[\n,]/).map(s => s.trim()).filter(s => s.length > 0);
      lines.forEach(name => {
        if (!students.some(s => s.name.toLowerCase() === name.toLowerCase())) {
          students.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
            name: name,
            score: 0
          });
        }
      });

      saveStudentsToStorage();
      document.getElementById('bulkRosterInput').value = '';
      closeRosterModal();
      renderRoster();
      renderLeaderboard();
    }

    function clearEntireRoster() {
      if (confirm('Are you sure you want to delete ALL students from the roster?')) {
        students = [];
        saveStudentsToStorage();
        closeRosterModal();
        renderRoster();
        renderLeaderboard();
      }
    }
  
Object.assign(window, { addPoints, addSingleStudent, clearEntireRoster, closeRosterModal, deleteStudent, nextPrompt, openRosterModal, prevPrompt, resetAllScores, resetTimer, saveBulkRoster, shufflePromptsDeck, toggleAudio, toggleTimer });
