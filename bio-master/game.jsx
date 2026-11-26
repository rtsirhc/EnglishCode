import React from 'react';
import { createRoot } from 'react-dom/client';
import { gameRuntime } from '../gallery/shared/runtime.js';

const answerActions = Object.fromEntries(Array.from({ length: 6 }, (_, index) => [
  'answer' + (index + 1),
  () => document.querySelectorAll('.mc-btn')[index]?.click()
]));
const { pack } = gameRuntime('bio-master', 'quiz', answerActions);
const { useState, useEffect, useRef, useCallback, useMemo } = React;

// ═══════════════════════════════════════════════════════════════
// BUBBLE PARTICLE SYSTEM
// ═══════════════════════════════════════════════════════════════
(function initBubbles() {
  const canvas = document.getElementById('bubbles');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  const COLORS = ['rgba(46,125,50,0.10)','rgba(0,137,123,0.10)','rgba(2,119,189,0.08)','rgba(124,179,66,0.12)','rgba(67,160,71,0.10)'];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 30; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 12 + 4,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      p.x += p.dx; p.y += p.dy;
      if (p.x < -20 || p.x > W+20) p.dx *= -1;
      if (p.y < -20 || p.y > H+20) p.dy *= -1;
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

// ═══════════════════════════════════════════════════════════════
// CONFETTI SYSTEM
// ═══════════════════════════════════════════════════════════════
const confettiSystem = (() => {
  const canvas = document.getElementById('confetti');
  const ctx = canvas.getContext('2d');
  let particles = [], animId = null;
  const COLORS = ['#2E7D32','#43A047','#00897B','#0277BD','#7CB342','#F9A825'];

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize(); window.addEventListener('resize', resize);

  function launch() {
    particles = [];
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.5 - canvas.height * 0.3,
        r: Math.random() * 6 + 3,
        dx: (Math.random() - 0.5) * 6,
        dy: Math.random() * 3 + 2,
        rot: Math.random() * 360,
        dr: (Math.random() - 0.5) * 8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: 1,
      });
    }
    if (animId) cancelAnimationFrame(animId);
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    particles.forEach(p => {
      if (p.life <= 0) return;
      alive = true;
      p.x += p.dx; p.y += p.dy; p.dy += 0.08;
      p.rot += p.dr; p.life -= 0.005;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r/2, -p.r/2, p.r, p.r * 0.6);
      ctx.restore();
    });
    if (alive) animId = requestAnimationFrame(draw);
  }

  return { launch };
})();

// ═══════════════════════════════════════════════════════════════
// DATA: BIOLOGY QUESTION BANK
// ═══════════════════════════════════════════════════════════════

const Q_BANK = pack ? pack.items.map((item, index) => ({ ...item, id: index, q: item.question, unit: pack.title })) : [
  // Unit I: Biodiversity and Darwin
  { id:1, unit:"🧬 Biodiversity & Darwin", q: "What term describes the total variety of all living things on Earth?", options: ["Evolution", "Biodiversity", "Ecosystem", "Genetics"], answer: "Biodiversity" },
  { id:2, unit:"🧬 Biodiversity & Darwin", q: "Who is the scientist most famous for his contributions to the theory of evolution?", options: ["Isaac Newton", "Albert Einstein", "Charles Darwin", "Galileo Galilei"], answer: "Charles Darwin" },
  { id:3, unit:"🧬 Biodiversity & Darwin", q: "What is 'natural selection'?", options: ["Animals choosing their friends", "The process where organisms best suited to their environment survive and reproduce", "Humans breeding dogs", "The sudden appearance of new species"], answer: "The process where organisms best suited to their environment survive and reproduce" },
  { id:4, unit:"🧬 Biodiversity & Darwin", q: "How do science and technology interact to satisfy human needs regarding biodiversity?", options: ["By destroying habitats", "By inventing microscopes and tools to study and protect species", "By stopping all evolution", "By creating synthetic animals"], answer: "By inventing microscopes and tools to study and protect species" },
  { id:5, unit:"🧬 Biodiversity & Darwin", q: "Which of the following is a direct consequence of evolution?", options: ["Gravity", "Biodiversity", "The rotation of the Earth", "Solar eclipses"], answer: "Biodiversity" },
  { id:6, unit:"🧬 Biodiversity & Darwin", q: "If an animal is born with a trait that helps it survive, what is likely to happen?", options: ["It will die quickly", "It will live longer and pass the trait to its offspring", "It will change its environment", "It will become a plant"], answer: "It will live longer and pass the trait to its offspring" },

  // Unit II: Nutrition and Adaptation
  { id:7, unit:"🥗 Nutrition & Adaptation", q: "Why is nutrition considered the foundation for health and life?", options: ["It makes organisms sleep", "It provides the energy and building blocks required for survival", "It prevents organisms from evolving", "It creates oxygen"], answer: "It provides the energy and building blocks required for survival" },
  { id:8, unit:"🥗 Nutrition & Adaptation", q: "Organisms that can make their own food, like plants using sunlight, are called:", options: ["Heterotrophs", "Autotrophs", "Carnivores", "Decomposers"], answer: "Autotrophs" },
  { id:9, unit:"🥗 Nutrition & Adaptation", q: "Organisms that must consume other living things for energy are called:", options: ["Autotrophs", "Producers", "Heterotrophs", "Flora"], answer: "Heterotrophs" },
  { id:10, unit:"🥗 Nutrition & Adaptation", q: "A hummingbird's long beak is an example of an adaptation for:", options: ["Respiration", "Reproduction", "Feeding and nutrition", "Sleeping"], answer: "Feeding and nutrition" },
  { id:11, unit:"🥗 Nutrition & Adaptation", q: "How is biodiversity a result of feeding adaptations?", options: ["All animals eat the exact same food", "Different species evolve different traits to eat specific foods in their environment", "Nutrition stops evolution", "Animals stop eating when they evolve"], answer: "Different species evolve different traits to eat specific foods in their environment" },
  { id:12, unit:"🥗 Nutrition & Adaptation", q: "How does technology help satisfy human nutritional needs?", options: ["By eliminating the need for food", "By improving farming techniques and food preservation", "By changing the weather", "By making humans autotrophs"], answer: "By improving farming techniques and food preservation" },

  // Unit III: Respiration and Health
  { id:13, unit:"🫁 Respiration & Health", q: "What is the primary purpose of cellular respiration?", options: ["To break down food and turn it into usable energy", "To create sunlight", "To pump blood", "To absorb water"], answer: "To break down food and turn it into usable energy" },
  { id:14, unit:"🫁 Respiration & Health", q: "Respiration that requires oxygen is called:", options: ["Anaerobic", "Photosynthesis", "Aerobic", "Digestion"], answer: "Aerobic" },
  { id:15, unit:"🫁 Respiration & Health", q: "How have fish adapted their respiratory systems to their environment?", options: ["They use lungs", "They absorb oxygen through their scales", "They use gills to pull oxygen from water", "They do not need oxygen"], answer: "They use gills to pull oxygen from water" },
  { id:16, unit:"🫁 Respiration & Health", q: "Which environmental factor severely harms human respiratory health?", options: ["Clean water", "Air pollution and smoking", "Ecotourism", "Solar energy"], answer: "Air pollution and smoking" },
  { id:17, unit:"🫁 Respiration & Health", q: "How does medical technology interact with respiratory health?", options: ["It creates smog", "It provides tools like inhalers and ventilators to treat diseases", "It stops people from breathing", "It prevents the need for oxygen"], answer: "It provides tools like inhalers and ventilators to treat diseases" },
  { id:18, unit:"🫁 Respiration & Health", q: "What happens if a human's respiratory system is compromised?", options: ["Their body cannot get enough oxygen to create energy", "They will become autotrophs", "Their cells will produce more light", "They will breathe water"], answer: "Their body cannot get enough oxygen to create energy" },

  // Unit IV: Reproduction and Offspring Survival
  { id:19, unit:"🧫 Reproduction", q: "What type of reproduction requires two parents and mixes their DNA?", options: ["Asexual reproduction", "Cellular respiration", "Sexual reproduction", "Mitosis"], answer: "Sexual reproduction" },
  { id:20, unit:"🧫 Reproduction", q: "What is the main advantage of sexual reproduction?", options: ["It is very fast", "It creates genetic variation in the offspring", "It creates exact clones", "It requires no energy"], answer: "It creates genetic variation in the offspring" },
  { id:21, unit:"🧫 Reproduction", q: "Asexual reproduction involves how many parents?", options: ["Two", "Three", "One", "Zero"], answer: "One" },
  { id:22, unit:"🧫 Reproduction", q: "What is a major risk for a population that reproduces asexually?", options: ["Because they are clones, a single disease could wipe out the entire population", "They will evolve too quickly", "They will have too much genetic variety", "They will live forever"], answer: "Because they are clones, a single disease could wipe out the entire population" },
  { id:23, unit:"🧫 Reproduction", q: "Which of the following is an adaptation to help offspring survive?", options: ["A fish eating its own eggs", "A bird building a safe nest high in a tree", "A plant producing no seeds", "An animal abandoning its young immediately"], answer: "A bird building a safe nest high in a tree" },
  { id:24, unit:"🧫 Reproduction", q: "Why do some plants wrap their seeds in sweet, delicious fruit?", options: ["To poison animals", "So animals eat the fruit and scatter the seeds far away", "To make the plant heavier", "To stop the seeds from growing"], answer: "So animals eat the fruit and scatter the seeds far away" },
  { id:25, unit:"🧫 Reproduction", q: "Which of the following organisms primarily uses asexual reproduction?", options: ["Humans", "Birds", "Certain bacteria and fungi", "Lions"], answer: "Certain bacteria and fungi" },

  // Unit V: Health, Environment, and Quality of Life
  { id:26, unit:"💚 Health & Environment", q: "What does a 'culture of prevention' mean in healthcare?", options: ["Waiting until you are sick to see a doctor", "Taking proactive steps like washing hands and getting vaccines to avoid illness", "Ignoring medical advice", "Only using herbal remedies"], answer: "Taking proactive steps like washing hands and getting vaccines to avoid illness" },
  { id:27, unit:"💚 Health & Environment", q: "Which of the following directly improves a population's quality of life?", options: ["High levels of air pollution", "Access to clean water, good nutrition, and healthcare", "Loss of biodiversity", "Extreme poverty"], answer: "Access to clean water, good nutrition, and healthcare" },
  { id:28, unit:"💚 Health & Environment", q: "How do vaccines contribute to a culture of prevention?", options: ["They cure a disease after you have it", "They train the immune system to fight off a disease before you get sick", "They cause cellular respiration", "They change your DNA to make you a plant"], answer: "They train the immune system to fight off a disease before you get sick" },
  { id:29, unit:"💚 Health & Environment", q: "Why is protecting the environment important for human health?", options: ["It isn't; human health is separate from the environment", "Polluted environments directly cause respiratory and waterborne diseases in humans", "Animals need to be hunted", "Pollution increases our quality of life"], answer: "Polluted environments directly cause respiratory and waterborne diseases in humans" },
  { id:30, unit:"💚 Health & Environment", q: "Which is an example of using technology to promote health?", options: ["Building more coal power plants", "Using water purification plants to provide clean drinking water", "Removing seatbelts from cars", "Dumping industrial waste in rivers"], answer: "Using water purification plants to provide clean drinking water" },
  { id:31, unit:"💚 Health & Environment", q: "Good personal hygiene, proper diet, and regular exercise are all part of:", options: ["Asexual reproduction", "Promoting health and a culture of prevention", "Industrialization", "Natural selection"], answer: "Promoting health and a culture of prevention" }
];

// ═══════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getLSLeaderboard() {
  try { const d = localStorage.getItem('bio_master_lb'); const rows = JSON.parse(d); return Array.isArray(rows) ? rows : []; }
  catch { return []; }
}
function saveLSLeaderboard(lb) {
  try { localStorage.setItem('bio_master_lb', JSON.stringify(lb)); } catch {}
}
function addToLeaderboard(score, strikes) {
  const lb = getLSLeaderboard();
  lb.push({ score, total: TOTAL_QUESTIONS, strikes, date: new Date().toLocaleDateString() });
  lb.sort((a,b) => b.score - a.score);
  const trimmed = lb.slice(0, 10);
  saveLSLeaderboard(trimmed);
  return trimmed;
}

const CORRECT_MSGS = ['🧬 Brilliant!','🌿 Amazing!','✨ Perfect!','🎉 Great Job!','🔬 Well Done!','🌱 Excellent!'];
const WRONG_MSGS = ['Not quite! 💪','Oops! 😊','Almost! 🤔','Keep trying! 💫'];
function randomMsg(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const TOTAL_QUESTIONS = Math.min(30, Q_BANK.length);
const MAX_STRIKES = 3;

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

function Strikes({ count }) {
  return (
    <span className="strikes-display">
      {Array.from({length: MAX_STRIKES}).map((_, i) => (
        <span key={i} style={{
          opacity: i < count ? 1 : 0.2,
          transition: 'opacity 0.3s, transform 0.3s',
          display: 'inline-block',
          transform: i < count ? 'scale(1.1)' : 'scale(0.8)',
          filter: i < count ? 'none' : 'grayscale(1)',
          fontSize: '1.3rem'
        }}>🍃</span>
      ))}
    </span>
  );
}

function StrikesRemaining({ strikes }) {
  const remaining = MAX_STRIKES - strikes;
  return (
    <span className="strikes-display">
      {Array.from({length: MAX_STRIKES}).map((_, i) => (
        <span key={i} style={{
          opacity: i < remaining ? 1 : 0.15,
          transition: 'all 0.3s',
          display: 'inline-block',
          transform: i < remaining ? 'scale(1)' : 'scale(0.7)',
          fontSize: '1.3rem'
        }}>{i < remaining ? '🍃' : '💀'}</span>
      ))}
    </span>
  );
}

function FeedbackToast({ feedback }) {
  if (!feedback) return null;
  return (
    <div className="feedback-overlay">
      <div className={`feedback-toast ${feedback.correct ? 'correct' : 'wrong'}`}>
        {feedback.msg}
      </div>
    </div>
  );
}

function Leaderboard({ entries, highlightScore }) {
  const medals = ['🥇','🥈','🥉','4','5'];
  const top5 = entries.slice(0,5);
  return (
    <div className="leaderboard">
      <div className="lb-title">🏆 Top 5 Best Scores</div>
      {top5.length === 0
        ? <div className="lb-empty">No records yet — be the first! 🌟</div>
        : top5.map((e,i) => (
          <div key={i} className={`lb-row${e.score===highlightScore?' highlight':''}`}>
            <span className="lb-rank">{medals[i]}</span>
            <span style={{flex:1}}>
              <span style={{color:'var(--text-dark)'}}>{e.score} / {e.total || 30}</span>
              <span style={{color:'var(--text-light)', fontSize:'0.8rem', marginLeft:'8px'}}>({e.strikes} strikes)</span>
            </span>
            <span style={{fontSize:'0.8rem', color:'var(--text-light)'}}>{e.date}</span>
          </div>
        ))
      }
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN GAME COMPONENT
// ═══════════════════════════════════════════════════════════════

function App() {
  const [gameState, setGameState] = useState('start');
  const [strikes, setStrikes] = useState(0);
  const [score, setScore] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [roundQuestions, setRoundQuestions] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [questionResult, setQuestionResult] = useState(null);
  const [questionLocked, setQuestionLocked] = useState(false);
  const [leaderboard, setLeaderboard] = useState(getLSLeaderboard());
  const [finalScore, setFinalScore] = useState(null);

  const strikesRef = useRef(0);
  const scoreRef = useRef(0);
  const questionLockedRef = useRef(false);
  const currentIndexRef = useRef(0);
  const advanceTimeoutRef = useRef(null);

  function startGame() {
    // Clear any pending timeouts
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);

    const selected = shuffle(Q_BANK).slice(0, TOTAL_QUESTIONS);
    // Shuffle options for each question
    const prepared = selected.map(q => ({
      ...q,
      options: shuffle([...q.options])
    }));
    setRoundQuestions(prepared);
    setCurrentIndex(0);     currentIndexRef.current = 0;
    setStrikes(0);          strikesRef.current = 0;
    setScore(0);            scoreRef.current = 0;
    setQuestionResult(null);
    setFeedback(null);
    setQuestionLocked(false); questionLockedRef.current = false;
    setFinalScore(null);
    setGameState('playing');
  }

  function advanceQuestion() {
    questionLockedRef.current = false;
    setQuestionLocked(false);
    setQuestionResult(null);
    setFeedback(null);
    const nextIndex = currentIndexRef.current + 1;
    if (nextIndex >= TOTAL_QUESTIONS) {
      // Victory!
      const s = scoreRef.current;
      const st = strikesRef.current;
      const lb = addToLeaderboard(s, st);
      setFinalScore(s);
      setLeaderboard(lb);
      confettiSystem.launch();
      setGameState('victory');
    } else {
      currentIndexRef.current = nextIndex;
      setCurrentIndex(nextIndex);
    }
  }

  function handleAnswer(selectedOption) {
    if (questionLockedRef.current || gameState !== 'playing') return;
    const currentQ = roundQuestions[currentIndexRef.current];

    questionLockedRef.current = true;
    setQuestionLocked(true);

    const correct = selectedOption === currentQ.answer;

    if (correct) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
      setQuestionResult({ correct: true, selected: selectedOption });
      setFeedback({ correct: true, msg: randomMsg(CORRECT_MSGS) });

      // Pause 1 second, then advance
      advanceTimeoutRef.current = setTimeout(() => {
        advanceQuestion();
      }, 1000);
    } else {
      strikesRef.current += 1;
      setStrikes(strikesRef.current);
      setQuestionResult({ correct: false, selected: selectedOption });
      setFeedback({ correct: false, msg: randomMsg(WRONG_MSGS) });

      if (strikesRef.current >= MAX_STRIKES) {
        // Game over after 2.5s so they can see the correct answer
        advanceTimeoutRef.current = setTimeout(() => {
          setFeedback(null);
          setGameState('gameover');
        }, 2500);
      } else {
        // Pause 2.5 seconds so user can study, then advance
        advanceTimeoutRef.current = setTimeout(() => {
          advanceQuestion();
        }, 2500);
      }
    }
  }

  const currentQ = roundQuestions[currentIndex];
  const LETTERS = ['A','B','C','D','E','F'];

  // ═══════════════════════════════════════════════════════════
  // RENDER: START
  // ═══════════════════════════════════════════════════════════
  if (gameState === 'start') {
    return (
      <div className="app">
        <div className="main">
          <div className="card start-screen">
            <span className="start-icon">🔬</span>
            <h1 className="start-title">BIO MASTER</h1>
            <div className="start-subtitle">{pack?.title || 'Biology in English'}</div>
            <p className="start-desc">
              {pack ? 'Play with your selected question pack.' : 'Test your biology knowledge with questions about biodiversity, nutrition, respiration, reproduction, and health!'}
              Answer {TOTAL_QUESTIONS} questions before you get 3 strikes. Can you master them all? 🧬
            </p>

            <div className="rules-grid">
              <div className="rule-item">
                <span className="rule-icon">🎯</span>
                <div className="rule-text"><strong>{TOTAL_QUESTIONS} Questions</strong><br/>Randomly selected from the question bank each round</div>
              </div>
              <div className="rule-item">
                <span className="rule-icon">🍃</span>
                <div className="rule-text"><strong>3 Strikes Max</strong><br/>Get 3 wrong and it's game over!</div>
              </div>
              <div className="rule-item">
                <span className="rule-icon">📖</span>
                <div className="rule-text"><strong>Learn as You Go</strong><br/>Wrong answers are revealed so you can study</div>
              </div>
            </div>

            <button id="start-game-btn" className="btn btn-primary btn-lg" onClick={startGame}>
              🔬 Start Game!
            </button>
            <div className="mt-24">
              <Leaderboard entries={leaderboard} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: GAME OVER
  // ═══════════════════════════════════════════════════════════
  if (gameState === 'gameover') {
    return (
      <div className="app">
        <div className="main">
          <div className="card end-screen">
            <span className="end-icon">🧪</span>
            <h1 className="end-title defeat">Game Over!</h1>
            <p className="end-sub">
              You answered {scoreRef.current} out of {currentIndexRef.current + 1} questions correctly before striking out.<br/>
              Keep studying and you'll master biology in no time! 📚✨
            </p>
            <div className="final-score">{scoreRef.current} / {TOTAL_QUESTIONS} correct</div>
            <button id="try-again-btn" className="btn btn-primary btn-lg" onClick={startGame}>
              🔄 Try Again
            </button>
            <div style={{marginTop:'12px'}}>
              <button className="btn btn-ghost" onClick={() => setGameState('start')}>← Back to Menu</button>
            </div>
            <div className="mt-24">
              <Leaderboard entries={leaderboard} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: VICTORY
  // ═══════════════════════════════════════════════════════════
  if (gameState === 'victory') {
    return (
      <div className="app">
        <div className="main">
          <div className="card end-screen">
            <span className="end-icon">🏆</span>
            <h1 className="end-title victory">Victory!</h1>
            <p className="end-sub">
              Congratulations! You mastered all {TOTAL_QUESTIONS} biology questions with only {strikesRef.current} strike{strikesRef.current !== 1 ? 's' : ''}!<br/>
              You're a Biology Superstar! 🌟🧬
            </p>
            <div className="final-score">{scoreRef.current} / {TOTAL_QUESTIONS} correct</div>
            <button id="play-again-btn" className="btn btn-green btn-lg" onClick={startGame} style={{marginBottom:'12px'}}>
              ⚡ Play Again
            </button>
            <button className="btn btn-ghost" onClick={() => setGameState('start')}>
              ← Back to Menu
            </button>
            <div className="mt-24">
              <Leaderboard entries={leaderboard} highlightScore={finalScore} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: PLAYING
  // ═══════════════════════════════════════════════════════════
  if (!currentQ) return null;
  const progress = ((currentIndex) / TOTAL_QUESTIONS) * 100;

  return (
    <div className="app">
      {/* TOP BAR */}
      <div className="topbar">
        <div className="topbar-brand">🔬 BIO MASTER</div>
        <div className="topbar-stats">
          <div className="stat-pill">
            <span className="stat-label">Score</span>
            <span className="stat-value primary">{score}</span>
          </div>
          <div className="stat-pill">
            <span className="stat-label">Q</span>
            <span className="stat-value">{currentIndex + 1} / {TOTAL_QUESTIONS}</span>
          </div>
          <div className="stat-pill">
            <span className="stat-label">Strikes</span>
            <StrikesRemaining strikes={strikes} />
          </div>
        </div>
      </div>

      <FeedbackToast feedback={feedback} />

      <div className="main">
        {/* Progress bar */}
        <div className="progress-bar-wrap">
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{width:`${progress}%`}} />
          </div>
        </div>

        <div className="card">
          {/* Question header */}
          <div className="q-header">
            <div className="q-badges">
              <span className="q-unit-badge">{currentQ.unit}</span>
            </div>
            <div style={{
              fontFamily: "'Fredoka', sans-serif",
              fontSize: '0.85rem',
              fontWeight: 700,
              color: strikes >= 2 ? 'var(--red)' : 'var(--text-medium)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              background: strikes >= 2 ? 'var(--red-soft)' : 'transparent',
              border: strikes >= 2 ? '1.5px solid var(--red)' : '1.5px solid transparent',
              transition: 'all 0.3s'
            }}>
              Strikes: {strikes} / {MAX_STRIKES}
            </div>
          </div>

          {/* Question */}
          <p className="instruction">Read the question and choose the best answer.</p>
          <div className="q-sentence">{currentQ.q}</div>
          <div className="mc-grid">
            {currentQ.options.map((opt, idx) => {
              let cls = 'mc-btn';
              if (questionLocked) {
                if (opt === currentQ.answer) cls += ' correct';
                else if (questionResult && questionResult.selected === opt) cls += ' wrong';
              }
              return (
                <button
                  key={opt}
                  id={`option-${idx}`}
                  className={cls}
                  onClick={() => !questionLocked && handleAnswer(opt)}
                  disabled={questionLocked}
                >
                  <span className="mc-letter">{LETTERS[idx]}</span>
                  {opt}
                </button>
              );
            })}
          </div>
          {questionLocked && questionResult && !questionResult.correct && (
            <div className="mt-16" style={{
              background: 'var(--green-soft)',
              border: '1.5px solid #A5D6A7',
              borderRadius: 'var(--radius)',
              padding: '14px 18px',
              fontFamily: "'Nunito', sans-serif",
              fontSize: '0.95rem',
              fontWeight: 700,
              color: '#1B5E20'
            }}>
              ✅ The correct answer is: <strong>{currentQ.answer}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
