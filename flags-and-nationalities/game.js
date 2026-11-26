import { bindGameControls } from '/gallery/shared/runtime.js';
bindGameControls('flags-and-nationalities', {
  confirm: () => { if (document.querySelector('#reveal-btn-area.visible')) revealAnswer(); },
  next: () => { if (document.querySelector('#next-btn-area.visible')) document.querySelector('#btn-next').click(); }
});

    // =========================
    // STATE
    // =========================
    let allCountries = [];    // Full bank of valid countries
    let questions = [];       // 20 questions for this session
    let currentIndex = 0;     // Current question index
    let timerInterval = null; // Timer interval ID
    let timeLeft = 15;        // Seconds remaining
    let audioCtx = null;      // Web Audio context (created on first user click)

    const TOTAL_QUESTIONS = 20;
    const TIMER_SECONDS = 15;

    // =========================
    // DING SOUND (Web Audio API)
    // =========================
    function ensureAudioContext() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    }

    function playDing() {
      try {
        ensureAudioContext();
        const now = audioCtx.currentTime;

        // Main chime tone (bright, pleasant)
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, now);       // A5
        osc1.frequency.setValueAtTime(1318.5, now + 0.08); // E6
        gain1.gain.setValueAtTime(0.35, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.start(now);
        osc1.stop(now + 0.6);

        // Harmonic shimmer
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1760, now + 0.05); // A6
        gain2.gain.setValueAtTime(0.12, now + 0.05);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start(now + 0.05);
        osc2.stop(now + 0.45);
      } catch (e) {
        // Audio not supported — fail silently
      }
    }

    // =========================
    // FLOATING EMOJIS (decorative)
    // =========================
    (function initFloatingEmojis() {
      const container = document.getElementById('floating-emojis-container');
      const emojis = ['🌍', '🌎', '🌏', '🇺🇳', '🗺️', '✈️', '🏳️', '⭐', '🌟', '🎌'];
      for (let i = 0; i < 14; i++) {
        const el = document.createElement('div');
        el.className = 'floating-emoji';
        el.textContent = emojis[i % emojis.length];
        el.style.left = Math.random() * 100 + '%';
        el.style.fontSize = (1.2 + Math.random() * 1.5) + 'rem';
        el.style.animationDuration = (18 + Math.random() * 25) + 's';
        el.style.animationDelay = -(Math.random() * 30) + 's';
        container.appendChild(el);
      }
    })();

    // =========================
    // SCREEN MANAGEMENT
    // =========================
    function showScreen(id) {
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      document.getElementById(id).classList.add('active');
    }

    // =========================
    // FETCH & PREPARE DATA
    // =========================
    async function fetchCountries() {
      const res = await fetch('./countries.json');
      if (!res.ok) throw new Error('Country data unavailable');
      const data = await res.json();
      return data;
    }

    function prepareCountryBank(raw) {
      // Filter: must have a flag SVG, a common name, and a demonym
      const valid = raw.filter(c =>
        c.flags?.svg &&
        c.name?.common &&
        c.demonyms?.eng?.m
      ).map(c => ({
        name: c.name.common,
        flag: c.flags.svg,
        nationality: c.demonyms.eng.m,
        population: c.population || 0,
      }));

      // Sort by population descending
      valid.sort((a, b) => b.population - a.population);

      // Assign difficulty tiers
      return valid.map((c, i) => {
        if (i < 50) c.difficulty = 'easy';
        else if (i < 125) c.difficulty = 'medium';
        else c.difficulty = 'hard';
        return c;
      });
    }

    // =========================
    // QUESTION GENERATION
    // =========================
    function shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    function pickRandom(arr, n) {
      const shuffled = shuffle([...arr]);
      return shuffled.slice(0, n);
    }

    function generateQuestions(bank) {
      const easy = bank.filter(c => c.difficulty === 'easy');
      const medium = bank.filter(c => c.difficulty === 'medium');
      const hard = bank.filter(c => c.difficulty === 'hard');

      // Pick: ~7 easy, ~7 medium, ~6 hard = 20
      const easyPicks = pickRandom(easy, 7);
      const mediumPicks = pickRandom(medium, 7);
      const hardPicks = pickRandom(hard, 6);

      // If any tier doesn't have enough, backfill from others
      const selected = [...easyPicks, ...mediumPicks, ...hardPicks];

      // If we somehow have fewer than 20, top up from the full bank
      if (selected.length < TOTAL_QUESTIONS) {
        const remaining = bank.filter(c => !selected.includes(c));
        const extra = pickRandom(remaining, TOTAL_QUESTIONS - selected.length);
        selected.push(...extra);
      }

      // Build questions (easy first, then medium, then hard within each group)
      const orderedSelections = selected.slice(0, TOTAL_QUESTIONS);

      return orderedSelections.map((country, idx) => {
        // Randomly decide question type
        const type = Math.random() < 0.5 ? 'country' : 'nationality';

        // Find distractors from the same difficulty tier
        const sameTier = bank.filter(c =>
          c.difficulty === country.difficulty && c.name !== country.name
        );
        const distractors = pickRandom(sameTier, 3);

        // If not enough from same tier, pull from neighbors
        while (distractors.length < 3) {
          const any = bank.filter(c =>
            c.name !== country.name && !distractors.some(d => d.name === c.name)
          );
          distractors.push(pickRandom(any, 1)[0]);
        }

        // Build options
        const correctOption = type === 'country' ? country.name : country.nationality;
        const distractorOptions = distractors.map(d =>
          type === 'country' ? d.name : d.nationality
        );

        // Deduplicate options (some countries share nationalities)
        const allOpts = [correctOption, ...distractorOptions];
        const uniqueOpts = [...new Set(allOpts)];

        // If dedup removed options, backfill
        while (uniqueOpts.length < 4) {
          const extras = bank.filter(c =>
            c.name !== country.name &&
            !uniqueOpts.includes(type === 'country' ? c.name : c.nationality)
          );
          if (extras.length === 0) break;
          const pick = extras[Math.floor(Math.random() * extras.length)];
          uniqueOpts.push(type === 'country' ? pick.name : pick.nationality);
        }

        // Shuffle options and track correct index
        const options = shuffle(uniqueOpts.slice(0, 4));
        const correctIndex = options.indexOf(correctOption);

        return {
          country: country.name,
          nationality: country.nationality,
          flag: country.flag,
          type,
          options,
          correctIndex,
          difficulty: country.difficulty,
        };
      });
    }

    // =========================
    // GAME FLOW
    // =========================
    async function startGame() {
      showScreen('loading-screen');

      try {
        // Only fetch once; reuse on replay
        if (allCountries.length === 0) {
          const raw = await fetchCountries();
          allCountries = prepareCountryBank(raw);
        }

        if (allCountries.length < 20) {
          throw new Error('Not enough country data');
        }

        questions = generateQuestions(allCountries);
        currentIndex = 0;
        showScreen('game-screen');
        loadQuestion();
      } catch (err) {
        console.error('Failed to start game:', err);
        showScreen('error-screen');
      }
    }

    function loadQuestion() {
      const q = questions[currentIndex];

      // Update progress
      document.getElementById('current-q').textContent = currentIndex + 1;
      document.getElementById('total-q').textContent = TOTAL_QUESTIONS;
      const progressPct = ((currentIndex + 1) / TOTAL_QUESTIONS) * 100;
      document.getElementById('progress-bar-fill').style.width = progressPct + '%';

      // Question type badge
      const typeBadge = document.getElementById('question-type-badge');
      if (q.type === 'country') {
        typeBadge.textContent = '🏳️ Country';
        document.getElementById('question-prompt').textContent =
          'What country does this flag belong to?';
      } else {
        typeBadge.textContent = '👤 Nationality';
        document.getElementById('question-prompt').textContent =
          'What is the nationality of the people from this country?';
      }

      // Flag
      const flagImg = document.getElementById('flag-img');
      flagImg.src = q.flag;
      flagImg.alt = 'Flag of a mystery country';
      // Re-trigger animation
      const flagContainer = flagImg.parentElement;
      flagContainer.style.animation = 'none';
      flagContainer.offsetHeight; // Force reflow
      flagContainer.style.animation = '';

      // Options
      const letters = ['A', 'B', 'C', 'D'];
      letters.forEach((letter, i) => {
        const card = document.getElementById('option-' + letter.toLowerCase());
        const textEl = document.getElementById('option-' + letter.toLowerCase() + '-text');
        textEl.textContent = q.options[i] || '—';
        card.classList.remove('correct', 'dimmed');
        // Re-trigger slide animation
        card.style.animation = 'none';
        card.offsetHeight;
        card.style.animation = '';
      });

      // Hide all reveal-row elements
      document.getElementById('reveal-btn-area').classList.remove('visible');
      document.getElementById('correct-banner').classList.remove('visible');
      document.getElementById('next-btn-area').classList.remove('visible');

      // Start timer
      startTimer();
    }

    // =========================
    // TIMER
    // =========================
    function startTimer() {
      clearInterval(timerInterval);
      timeLeft = TIMER_SECONDS;
      updateTimerDisplay();

      timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          onTimerEnd();
        }
      }, 1000);
    }

    function updateTimerDisplay() {
      const timerText = document.getElementById('timer-text');
      const timerBar = document.getElementById('timer-bar-fill');

      timerText.textContent = timeLeft;
      timerBar.style.width = (timeLeft / TIMER_SECONDS) * 100 + '%';

      // Color states
      timerText.classList.remove('warning', 'danger');
      if (timeLeft <= 3) {
        timerText.classList.add('danger');
      } else if (timeLeft <= 7) {
        timerText.classList.add('warning');
      }
    }

    // =========================
    // TIMER END → show Reveal button
    // =========================
    function onTimerEnd() {
      // Play ding to signal time's up
      playDing();

      // Show the "Reveal Answer" button
      document.getElementById('reveal-btn-area').classList.add('visible');
    }

    // =========================
    // ANSWER REVEAL (manual)
    // =========================
    function revealAnswer() {
      const q = questions[currentIndex];
      const letters = ['a', 'b', 'c', 'd'];

      // Hide the reveal button
      document.getElementById('reveal-btn-area').classList.remove('visible');

      // Highlight correct / dim wrong
      letters.forEach((letter, i) => {
        const card = document.getElementById('option-' + letter);
        if (i === q.correctIndex) {
          card.classList.add('correct');
        } else {
          card.classList.add('dimmed');
        }
      });

      // Show correct banner
      const banner = document.getElementById('correct-banner');
      const bannerText = document.getElementById('correct-banner-text');
      if (q.type === 'country') {
        bannerText.textContent = `The answer is: ${q.country}!`;
      } else {
        bannerText.textContent = `People from ${q.country} are ${q.nationality}!`;
      }
      banner.classList.add('visible');

      // Show next button (or finish button)
      const nextArea = document.getElementById('next-btn-area');
      const nextBtn = document.getElementById('btn-next');
      if (currentIndex >= TOTAL_QUESTIONS - 1) {
        nextBtn.textContent = 'See Results 🎉';
        nextBtn.onclick = () => showScreen('end-screen');
      } else {
        nextBtn.textContent = 'Next Question ▶';
        nextBtn.onclick = nextQuestion;
      }
      nextArea.classList.add('visible');
    }

    function nextQuestion() {
      currentIndex++;
      if (currentIndex >= TOTAL_QUESTIONS) {
        showScreen('end-screen');
        return;
      }
      loadQuestion();
    }

    // =========================
    // CLEANUP on page unload
    // =========================
    window.addEventListener('beforeunload', () => {
      clearInterval(timerInterval);
    });
  
document.getElementById('btn-start').addEventListener('click', startGame);
document.getElementById('btn-play-again').addEventListener('click', startGame);
document.getElementById('btn-retry').addEventListener('click', startGame);
document.getElementById('btn-reveal').addEventListener('click', revealAnswer);
document.getElementById('btn-next').onclick = nextQuestion;
