
import React from 'react';
import { createRoot } from 'react-dom/client';
import { jsx as _jsxDEV, Fragment as _Fragment } from 'react/jsx-runtime';
import { gameRuntime } from '../gallery/shared/runtime.js';
const actions = Object.fromEntries(Array.from({ length: 8 }, (_, index) => [
  'answer' + (index + 1), () => document.querySelectorAll('.mc-btn')[index]?.click()
]));
actions.confirm = () => document.querySelector('[data-game-action="confirm"]')?.click();
const { pack } = gameRuntime('tense-master-sudden-death', 'quiz', actions);

const {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo
} = React;

// ═══════════════════════════════════════════════════════════════
// PARTICLE SYSTEM
// ═══════════════════════════════════════════════════════════════
(function initParticles() {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let W,
    H,
    particles = [];
  const COLORS = ['#00f5ff22', '#ff2d7822', '#39ff1422', '#ffe60022'];
  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  for (let i = 0; i < 40; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 3 + 1,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    });
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > W) p.dx *= -1;
      if (p.y < 0 || p.y > H) p.dy *= -1;
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

// ═══════════════════════════════════════════════════════════════
// DATA: MASTER QUESTION BANK (100 questions)
// ═══════════════════════════════════════════════════════════════

const TENSES = ['Present Simple', 'Present Continuous', 'Present Perfect', 'Past Simple', 'Past Continuous', 'Past Perfect', 'Will', 'Be Going To'];
const TABLE_RULES = {
  'Present Simple': 'action that is a routine or fact',
  'Present Continuous': 'action happening right now',
  'Present Perfect': 'action started in the past and still continues now',
  'Past Simple': 'action that started and finished in the past',
  'Past Continuous': 'action that is background and is interrupted by focus action (simple past)',
  'Past Perfect': 'action that happened before simple past',
  'Will': 'prediction or decision made at the moment (not planned)',
  'Be Going To': 'plan or prediction with evidence (already decided)'
};

// Helper: build fill-in sentence with blank at the verb
const Q_BANK = pack ? pack.items.map((item, index) => ({
  ...item, id: index + 1, type: 'recognition', sentence: item.question, theme: pack.title
})) : [
// ─── RECOGNITION (16: 2 per tense × 8 tenses) ───
{
  id: 1,
  type: 'recognition',
  theme: '⚽ Soccer',
  tense: 'Present Simple',
  sentence: 'The goalkeeper dives to the right and stops the penalty.',
  answer: 'Present Simple',
  options: TENSES
}, {
  id: 2,
  type: 'recognition',
  theme: '🔬 Science',
  tense: 'Present Simple',
  sentence: 'Water freezes at zero degrees and turns into ice.',
  answer: 'Present Simple',
  options: TENSES
}, {
  id: 3,
  type: 'recognition',
  theme: '⚽ Soccer',
  tense: 'Present Continuous',
  sentence: 'Right now, the goalkeeper is warming up on the edge of the penalty area.',
  answer: 'Present Continuous',
  options: TENSES
}, {
  id: 4,
  type: 'recognition',
  theme: '🔬 Science',
  tense: 'Present Continuous',
  sentence: 'The scientists are testing a new medicine against the virus right now.',
  answer: 'Present Continuous',
  options: TENSES
}, {
  id: 5,
  type: 'recognition',
  theme: '⚽ Soccer',
  tense: 'Present Perfect',
  sentence: 'The goalie has kept a clean sheet for five matches in a row.',
  answer: 'Present Perfect',
  options: TENSES
}, {
  id: 6,
  type: 'recognition',
  theme: '🌍 Geography',
  tense: 'Present Perfect',
  sentence: 'Scientists have found many new planets far outside our solar system.',
  answer: 'Present Perfect',
  options: TENSES
}, {
  id: 7,
  type: 'recognition',
  theme: '⚽ Soccer',
  tense: 'Past Simple',
  sentence: 'Our goalkeeper saved three shots in a row during the shootout.',
  answer: 'Past Simple',
  options: TENSES
}, {
  id: 8,
  type: 'recognition',
  theme: '🏛 History',
  tense: 'Past Simple',
  sentence: 'The Roman Empire fell in 476 AD after many years of power.',
  answer: 'Past Simple',
  options: TENSES
}, {
  id: 9,
  type: 'recognition',
  theme: '⚽ Soccer',
  tense: 'Past Continuous',
  sentence: 'The goalkeeper was shouting orders when the referee blew the whistle.',
  answer: 'Past Continuous',
  options: TENSES
}, {
  id: 10,
  type: 'recognition',
  theme: '🏛 History',
  tense: 'Past Continuous',
  sentence: 'The soldiers were crossing the river when the enemy attacked.',
  answer: 'Past Continuous',
  options: TENSES
}, {
  id: 11,
  type: 'recognition',
  theme: '⚽ Soccer',
  tense: 'Past Perfect',
  sentence: 'The goalkeeper had already saved two penalties before the match ended.',
  answer: 'Past Perfect',
  options: TENSES
}, {
  id: 12,
  type: 'recognition',
  theme: '🏛 History',
  tense: 'Past Perfect',
  sentence: 'Columbus had already sailed across the Atlantic before other explorers followed.',
  answer: 'Past Perfect',
  options: TENSES
}, {
  id: 13,
  type: 'recognition',
  theme: '⚽ Soccer',
  tense: 'Will',
  sentence: 'I think it will be a great game tomorrow — both teams look very strong.',
  answer: 'Will',
  options: TENSES
}, {
  id: 14,
  type: 'recognition',
  theme: '🔬 Science',
  tense: 'Will',
  sentence: "Don't worry! I think the new medicine will help many sick people.",
  answer: 'Will',
  options: TENSES
}, {
  id: 15,
  type: 'recognition',
  theme: '⚽ Soccer',
  tense: 'Be Going To',
  sentence: 'She is going to play in the big match next Saturday — the coach already told her.',
  answer: 'Be Going To',
  options: TENSES
}, {
  id: 16,
  type: 'recognition',
  theme: '🌍 Geography',
  tense: 'Be Going To',
  sentence: 'Look at those dark clouds! It is going to rain very soon.',
  answer: 'Be Going To',
  options: TENSES
},
// ─── FILL-IN (16: 2 per tense × 8 tenses) ───
{
  id: 17,
  type: 'fill',
  theme: '⚽ Soccer',
  tense: 'Present Simple',
  sentence: 'The goalkeeper always ___ the wall before every free kick.',
  blank: 'checks',
  answer: 'checks',
  baseVerb: 'check'
}, {
  id: 18,
  type: 'fill',
  theme: '🔬 Science',
  tense: 'Present Simple',
  sentence: 'The Earth ___ around the Sun once every 365 days.',
  blank: 'orbits',
  answer: 'orbits',
  baseVerb: 'orbit'
}, {
  id: 19,
  type: 'fill',
  theme: '⚽ Soccer',
  tense: 'Present Continuous',
  sentence: 'The goalkeeper ___ his gloves right now before the penalty shootout.',
  blank: 'is putting on',
  answer: 'is putting on',
  baseVerb: 'put on'
}, {
  id: 20,
  type: 'fill',
  theme: '🔬 Science',
  tense: 'Present Continuous',
  sentence: 'The robot ___ photos on the ground of Mars right now.',
  blank: 'is taking',
  answer: 'is taking',
  baseVerb: 'take'
}, {
  id: 21,
  type: 'fill',
  theme: '⚽ Soccer',
  tense: 'Present Perfect',
  sentence: 'The goalkeeper ___ every penalty this season without exception.',
  blank: 'has saved',
  answer: 'has saved',
  baseVerb: 'save'
}, {
  id: 22,
  type: 'fill',
  theme: '🔬 Science',
  tense: 'Present Perfect',
  sentence: 'Scientists ___ a new type of small animal in the deep ocean.',
  blank: 'have found',
  answer: 'have found',
  baseVerb: 'find'
}, {
  id: 23,
  type: 'fill',
  theme: '⚽ Soccer',
  tense: 'Past Simple',
  sentence: 'During the final, the goalie ___ to his left and caught the ball.',
  blank: 'dived',
  answer: 'dived',
  baseVerb: 'dive'
}, {
  id: 24,
  type: 'fill',
  theme: '🏛 History',
  tense: 'Past Simple',
  sentence: 'Napoleon ___ the Battle of Waterloo in 1815.',
  blank: 'lost',
  answer: 'lost',
  baseVerb: 'lose'
}, {
  id: 25,
  type: 'fill',
  theme: '⚽ Soccer',
  tense: 'Past Continuous',
  sentence: 'The goalkeeper ___ the ball when the striker ran into him.',
  blank: 'was holding',
  answer: 'was holding',
  baseVerb: 'hold'
}, {
  id: 26,
  type: 'fill',
  theme: '🔬 Science',
  tense: 'Past Continuous',
  sentence: 'The scientist ___ the test when the liquid suddenly changed colour.',
  blank: 'was watching',
  answer: 'was watching',
  baseVerb: 'watch'
}, {
  id: 27,
  type: 'fill',
  theme: '⚽ Soccer',
  tense: 'Past Perfect',
  sentence: 'The goalkeeper ___ three shots before the referee stopped the game.',
  blank: 'had stopped',
  answer: 'had stopped',
  baseVerb: 'stop'
}, {
  id: 28,
  type: 'fill',
  theme: '🏛 History',
  tense: 'Past Perfect',
  sentence: 'The king ___ the city before the enemy got to the gates.',
  blank: 'had left',
  answer: 'had left',
  baseVerb: 'leave'
}, {
  id: 29,
  type: 'fill',
  theme: '⚽ Soccer',
  tense: 'Will',
  sentence: 'I think the team ___ the championship this year — they are playing very well.',
  blank: 'will win',
  answer: 'will win',
  baseVerb: 'win'
}, {
  id: 30,
  type: 'fill',
  theme: '🌍 Geography',
  tense: 'Will',
  sentence: "I don't know the answer, but I think the weather ___ get better after the storm.",
  blank: 'will get',
  answer: 'will get',
  baseVerb: 'get'
}, {
  id: 31,
  type: 'fill',
  theme: '⚽ Soccer',
  tense: 'Be Going To',
  sentence: 'The coach ___ change the goalkeeper before the game — he already decided.',
  blank: 'is going to change',
  answer: 'is going to change',
  baseVerb: 'change'
}, {
  id: 32,
  type: 'fill',
  theme: '🌍 Geography',
  tense: 'Be Going To',
  sentence: 'Look at those big clouds — it ___ rain very soon!',
  blank: 'is going to rain',
  answer: 'is going to rain',
  baseVerb: 'rain'
},
// ─── FIX (16: 2 per tense × 8 tenses) ───
{
  id: 33,
  type: 'fix',
  theme: '⚽ Soccer',
  tense: 'Present Simple',
  sentenceWithError: 'The goalkeeper always stop the ball during practice and he trains every day.',
  errorWord: 'stop',
  correction: 'stops'
}, {
  id: 34,
  type: 'fix',
  theme: '🔬 Science',
  tense: 'Present Simple',
  sentenceWithError: 'The heart pumps blood around the body and it beated about 70 times per minute.',
  errorWord: 'beated',
  correction: 'beats'
}, {
  id: 35,
  type: 'fix',
  theme: '⚽ Soccer',
  tense: 'Present Continuous',
  sentenceWithError: 'The goalkeeper is practice jumping and catching the ball right now.',
  errorWord: 'practice',
  correction: 'practising'
}, {
  id: 36,
  type: 'fix',
  theme: '🔬 Science',
  tense: 'Present Continuous',
  sentenceWithError: 'The scientist are looking at the test in the lab right now.',
  errorWord: 'are',
  correction: 'is'
}, {
  id: 37,
  type: 'fix',
  theme: '⚽ Soccer',
  tense: 'Present Perfect',
  sentenceWithError: 'She have saved over fifty penalties in her career.',
  errorWord: 'have',
  correction: 'has'
}, {
  id: 38,
  type: 'fix',
  theme: '🏛 History',
  tense: 'Present Perfect',
  sentenceWithError: 'Students has read many old books about the history of the Roman Empire.',
  errorWord: 'has',
  correction: 'have'
}, {
  id: 39,
  type: 'fix',
  theme: '⚽ Soccer',
  tense: 'Past Simple',
  sentenceWithError: 'The goalie catched the high cross perfectly in the final minute.',
  errorWord: 'catched',
  correction: 'caught'
}, {
  id: 40,
  type: 'fix',
  theme: '🏛 History',
  tense: 'Past Simple',
  sentenceWithError: 'Julius Caesar leaded his army across the river in 49 BC.',
  errorWord: 'leaded',
  correction: 'led'
}, {
  id: 41,
  type: 'fix',
  theme: '⚽ Soccer',
  tense: 'Past Continuous',
  sentenceWithError: 'The goalkeeper were tracking the ball as it moved across the sky.',
  errorWord: 'were',
  correction: 'was'
}, {
  id: 42,
  type: 'fix',
  theme: '🏛 History',
  tense: 'Past Continuous',
  sentenceWithError: 'The knights was defending the castle when the big weapons arrived.',
  errorWord: 'was',
  correction: 'were'
}, {
  id: 43,
  type: 'fix',
  theme: '⚽ Soccer',
  tense: 'Past Perfect',
  sentenceWithError: 'The goalkeeper had already make three great saves before half time.',
  errorWord: 'make',
  correction: 'made'
}, {
  id: 44,
  type: 'fix',
  theme: '🔬 Science',
  tense: 'Past Perfect',
  sentenceWithError: 'The team had finish all the tests before they shared their results.',
  errorWord: 'finish',
  correction: 'finished'
}, {
  id: 45,
  type: 'fix',
  theme: '⚽ Soccer',
  tense: 'Will',
  sentenceWithError: 'I think it will rains a lot tomorrow during the match.',
  errorWord: 'rains',
  correction: 'rain'
}, {
  id: 46,
  type: 'fix',
  theme: '🌍 Geography',
  tense: 'Will',
  sentenceWithError: 'She will goes to the mountains if the weather is good next week.',
  errorWord: 'goes',
  correction: 'go'
}, {
  id: 47,
  type: 'fix',
  theme: '⚽ Soccer',
  tense: 'Be Going To',
  sentenceWithError: 'She are going to play in the final tomorrow — the coach told her.',
  errorWord: 'are',
  correction: 'is'
}, {
  id: 48,
  type: 'fix',
  theme: '🌍 Geography',
  tense: 'Be Going To',
  sentenceWithError: 'They is going to build a new bridge across the river next year.',
  errorWord: 'is',
  correction: 'are'
},
// ─── TABLE (16: 2 per tense × 8 tenses) ───
{
  id: 49,
  type: 'table',
  theme: '⚽ Soccer',
  tense: 'Present Simple',
  hiddenCell: 0
}, {
  id: 50,
  type: 'table',
  theme: '🔬 Science',
  tense: 'Present Simple',
  hiddenCell: 0
}, {
  id: 51,
  type: 'table',
  theme: '🏛 History',
  tense: 'Present Continuous',
  hiddenCell: 1
}, {
  id: 52,
  type: 'table',
  theme: '🌍 Geography',
  tense: 'Present Continuous',
  hiddenCell: 1
}, {
  id: 53,
  type: 'table',
  theme: '⚽ Soccer',
  tense: 'Present Perfect',
  hiddenCell: 2
}, {
  id: 54,
  type: 'table',
  theme: '🔬 Science',
  tense: 'Present Perfect',
  hiddenCell: 2
}, {
  id: 55,
  type: 'table',
  theme: '🏛 History',
  tense: 'Past Simple',
  hiddenCell: 3
}, {
  id: 56,
  type: 'table',
  theme: '🌍 Geography',
  tense: 'Past Simple',
  hiddenCell: 3
}, {
  id: 57,
  type: 'table',
  theme: '⚽ Soccer',
  tense: 'Past Continuous',
  hiddenCell: 4
}, {
  id: 58,
  type: 'table',
  theme: '🔬 Science',
  tense: 'Past Continuous',
  hiddenCell: 4
}, {
  id: 59,
  type: 'table',
  theme: '🏛 History',
  tense: 'Past Perfect',
  hiddenCell: 5
}, {
  id: 60,
  type: 'table',
  theme: '🌍 Geography',
  tense: 'Past Perfect',
  hiddenCell: 5
}, {
  id: 61,
  type: 'table',
  theme: '⚽ Soccer',
  tense: 'Will',
  hiddenCell: 6
}, {
  id: 62,
  type: 'table',
  theme: '🔬 Science',
  tense: 'Will',
  hiddenCell: 6
}, {
  id: 63,
  type: 'table',
  theme: '🏛 History',
  tense: 'Be Going To',
  hiddenCell: 7
}, {
  id: 64,
  type: 'table',
  theme: '🌍 Geography',
  tense: 'Be Going To',
  hiddenCell: 7
}];

// Table cell order (indices 0-7 map to table cells; index 8 = N/A Future Perfect)
const TABLE_CELL_ORDER = ['Present Simple', 'Present Continuous', 'Present Perfect', 'Past Simple', 'Past Continuous', 'Past Perfect', 'Will', 'Be Going To'];

// ═══════════════════════════════════════════════════════════════
// UTILITY
// ═══════════════════════════════════════════════════════════════
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
function getLSLeaderboard() {
  try {
    const data = localStorage.getItem('tm_leaderboard');
    const rows = JSON.parse(data);
    return Array.isArray(rows) ? rows.filter(row => Number.isFinite(row?.time) && row.time >= 0) : [];
  } catch {
    return [];
  }
}
function saveLSLeaderboard(lb) {
  try {
    localStorage.setItem('tm_leaderboard', JSON.stringify(lb));
  } catch {}
}
function addToLeaderboard(timeSecs) {
  const lb = getLSLeaderboard();
  lb.push({
    time: timeSecs,
    date: new Date().toLocaleDateString()
  });
  lb.sort((a, b) => a.time - b.time);
  const trimmed = lb.slice(0, 10);
  saveLSLeaderboard(trimmed);
  return trimmed;
}
function getTimerMax(type) {
  if (type === 'recognition') return 20;
  if (type === 'fill') return 20;
  if (type === 'fix') return 30;
  if (type === 'table') return 30;
  return 20;
}
function buildTableOptions(hidden) {
  // Generate 4 wrong answers from the other rules
  const allRules = Object.values(TABLE_RULES);
  const correctRule = TABLE_RULES[hidden];
  const wrong = shuffle(allRules.filter(r => r !== correctRule)).slice(0, 3);
  return shuffle([correctRule, ...wrong]);
}

// ═══════════════════════════════════════════════════════════════
// SUBCOMPONENTS
// ═══════════════════════════════════════════════════════════════

function QuestionTimer({
  value,
  max,
  danger
}) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - value / max * circumference;
  return /*#__PURE__*/_jsxDEV("div", {
    className: "q-timer-wrap",
    children: /*#__PURE__*/_jsxDEV("div", {
      className: "q-timer-ring",
      children: [/*#__PURE__*/_jsxDEV("svg", {
        viewBox: "0 0 80 80",
        children: [/*#__PURE__*/_jsxDEV("circle", {
          className: "bg-circle",
          cx: "40",
          cy: "40",
          r: radius,
          strokeDasharray: circumference
        }, void 0, false), /*#__PURE__*/_jsxDEV("circle", {
          className: `fg-circle${danger ? ' danger' : ''}`,
          cx: "40",
          cy: "40",
          r: radius,
          strokeDasharray: circumference,
          strokeDashoffset: offset
        }, void 0, false)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: `q-timer-num${danger ? ' danger' : ''}`,
        children: value
      }, void 0, false)]
    }, void 0, true)
  }, void 0, false);
}
function Lives({
  count
}) {
  return /*#__PURE__*/_jsxDEV("span", {
    className: "lives-display",
    children: Array.from({
      length: 3
    }).map((_, i) => /*#__PURE__*/_jsxDEV("span", {
      style: {
        opacity: i < count ? 1 : 0.15,
        transition: 'opacity 0.3s'
      },
      children: "❤️"
    }, i, false))
  }, void 0, false);
}
function FeedbackToast({
  feedback
}) {
  if (!feedback) return null;
  return /*#__PURE__*/_jsxDEV("div", {
    className: "feedback-overlay",
    children: /*#__PURE__*/_jsxDEV("div", {
      className: `feedback-toast ${feedback.correct ? 'correct' : 'wrong'}`,
      children: feedback.correct ? '✓ CORRECT!' : '✗ WRONG!'
    }, void 0, false)
  }, void 0, false);
}
function Leaderboard({
  entries,
  highlightTime
}) {
  const ranks = ['🥇', '🥈', '🥉', '4', '5'];
  const rankClass = ['gold', 'silver', 'bronze', '', ''];
  const top5 = entries.slice(0, 5);
  return /*#__PURE__*/_jsxDEV("div", {
    className: "leaderboard",
    children: [/*#__PURE__*/_jsxDEV("div", {
      className: "lb-title",
      children: "🏆 Top 5 Fastest Times"
    }, void 0, false), top5.length === 0 ? /*#__PURE__*/_jsxDEV("div", {
      className: "lb-empty",
      children: "No records yet — be the first!"
    }, void 0, false) : top5.map((e, i) => /*#__PURE__*/_jsxDEV("div", {
      className: `lb-row${e.time === highlightTime ? ' highlight' : ''}`,
      children: [/*#__PURE__*/_jsxDEV("span", {
        className: `lb-rank ${rankClass[i]}`,
        children: ranks[i]
      }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
        style: {
          flex: 1,
          color: 'var(--text-muted)',
          fontSize: '0.85rem'
        },
        children: e.date
      }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
        className: "lb-time",
        children: formatTime(e.time)
      }, void 0, false)]
    }, i, true))]
  }, void 0, true);
}

// ═══════════════════════════════════════════════════════════════
// QUESTION RENDERERS
// ═══════════════════════════════════════════════════════════════

function RecognitionQuestion({
  q,
  onAnswer,
  disabled,
  result
}) {
  return /*#__PURE__*/_jsxDEV("div", {
    children: [/*#__PURE__*/_jsxDEV("p", {
      className: "instruction",
      children: pack ? "Choose the best answer." : "Read the sentence and choose the correct tense name."
    }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
      className: "q-sentence",
      children: q.sentence
    }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
      className: "mc-grid",
      children: q.options.map(opt => {
        let cls = 'mc-btn';
        if (disabled) {
          if (opt === q.answer) cls += ' correct';else if (result && result.selected === opt) cls += ' wrong';
        }
        return /*#__PURE__*/_jsxDEV("button", {
          className: cls,
          onClick: () => !disabled && onAnswer(opt),
          disabled: disabled,
          children: opt
        }, opt, false);
      })
    }, void 0, false)]
  }, void 0, true);
}
function FillInQuestion({
  q,
  onAnswer,
  disabled,
  result
}) {
  const [val, setVal] = useState('');
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);
  function submit() {
    if (disabled || !val.trim()) return;
    const correct = val.trim().toLowerCase() === q.answer.toLowerCase();
    if (!correct) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
    onAnswer(val.trim());
  }
  const parts = q.sentence.split('___');
  const baseVerb = q.baseVerb || null;
  return /*#__PURE__*/_jsxDEV("div", {
    children: [/*#__PURE__*/_jsxDEV("p", {
      className: "instruction",
      children: "Type the correct verb form in the blank. Press Enter to submit."
    }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
      className: "q-sentence",
      children: [parts[0], /*#__PURE__*/_jsxDEV("span", {
        className: "blank",
        children: "\xA0\xA0\xA0\xA0\xA0\xA0"
      }, void 0, false), parts[1]]
    }, void 0, true), baseVerb && /*#__PURE__*/_jsxDEV("div", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(255,230,0,0.08)',
        border: '1px solid rgba(255,230,0,0.25)',
        borderRadius: '8px',
        padding: '6px 14px',
        marginBottom: '16px',
        fontFamily: "'Rajdhani', sans-serif",
        fontSize: '0.9rem',
        fontWeight: 600
      },
      children: [/*#__PURE__*/_jsxDEV("span", {
        style: {
          color: 'var(--text-muted)'
        },
        children: "Base verb:"
      }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
        style: {
          color: 'var(--neon-yellow)',
          fontFamily: "'Orbitron', monospace",
          fontSize: '0.85rem',
          letterSpacing: '1px'
        },
        children: baseVerb
      }, void 0, false)]
    }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
      className: "fill-form",
      children: [/*#__PURE__*/_jsxDEV("input", {
        ref: inputRef,
        className: `fill-input${shake ? ' shake' : ''}`,
        value: val,
        onChange: e => setVal(e.target.value),
        onKeyDown: e => e.key === 'Enter' && submit(),
        placeholder: "Type the verb phrase…",
        disabled: disabled
      }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
        className: "btn btn-primary",
        'data-game-action': 'confirm',
        onClick: submit,
        disabled: disabled,
        children: "Submit"
      }, void 0, false)]
    }, void 0, true), disabled && result && /*#__PURE__*/_jsxDEV("div", {
      className: "answer-reveal mt-16",
      children: result.correct ? /*#__PURE__*/_jsxDEV(_Fragment, {
        children: [/*#__PURE__*/_jsxDEV("strong", {
          children: "✓"
        }, void 0, false), " Correct! The answer is: ", /*#__PURE__*/_jsxDEV("strong", {
          children: ["\"", q.answer, "\""]
        }, void 0, true)]
      }, void 0, true) : /*#__PURE__*/_jsxDEV(_Fragment, {
        children: [/*#__PURE__*/_jsxDEV("strong", {
          children: "✗"
        }, void 0, false), " The correct answer is: ", /*#__PURE__*/_jsxDEV("strong", {
          children: ["\"", q.answer, "\""]
        }, void 0, true)]
      }, void 0, true)
    }, void 0, false)]
  }, void 0, true);
}
function FixQuestion({
  q,
  onAnswer,
  disabled,
  result
}) {
  const words = q.sentenceWithError.split(' ');
  const [selected, setSelected] = useState(null);
  const [correction, setCorrection] = useState('');
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);
  useEffect(() => {
    if (selected !== null && inputRef.current) inputRef.current.focus();
  }, [selected]);
  function submit() {
    if (disabled || selected === null || !correction.trim()) return;
    const pickedWord = words[selected].replace(/[.,!?;:'"]/g, '');
    const isRightWord = pickedWord.toLowerCase() === q.errorWord.toLowerCase();
    const isRightFix = correction.trim().toLowerCase() === q.correction.toLowerCase();
    if (isRightWord && isRightFix) {
      onAnswer({
        correct: true
      });
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      onAnswer({
        correct: false
      });
    }
  }
  return /*#__PURE__*/_jsxDEV("div", {
    children: [/*#__PURE__*/_jsxDEV("p", {
      className: "instruction",
      children: "Click the incorrect word, then type the correction and press Enter."
    }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
      className: "fix-sentence",
      children: words.map((w, i) => /*#__PURE__*/_jsxDEV("button", {
        type: "button", disabled,
        className: `fix-word${selected === i ? ' selected' : ''}`,
        onClick: () => !disabled && setSelected(i),
        children: w
      }, i, false))
    }, void 0, false), selected !== null && !disabled && /*#__PURE__*/_jsxDEV("div", {
      className: "fix-correction",
      children: [/*#__PURE__*/_jsxDEV("div", {
        className: "fix-hint",
        children: ["You clicked: ", /*#__PURE__*/_jsxDEV("strong", {
          style: {
            color: 'var(--neon-orange)'
          },
          children: words[selected]
        }, void 0, false), " — type the correction:"]
      }, void 0, true), /*#__PURE__*/_jsxDEV("input", {
        ref: inputRef,
        className: `fill-input${shake ? ' shake' : ''}`,
        value: correction,
        onChange: e => setCorrection(e.target.value),
        onKeyDown: e => e.key === 'Enter' && submit(),
        placeholder: "Corrected word…",
        style: {
          maxWidth: '280px'
        }
      }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
        className: "btn btn-primary",
        'data-game-action': 'confirm',
        onClick: submit,
        children: "Submit"
      }, void 0, false)]
    }, void 0, true), disabled && /*#__PURE__*/_jsxDEV("div", {
      className: "answer-reveal mt-16",
      children: result && result.correct ? /*#__PURE__*/_jsxDEV(_Fragment, {
        children: [/*#__PURE__*/_jsxDEV("strong", {
          children: "✓"
        }, void 0, false), " Correct! \"", /*#__PURE__*/_jsxDEV("strong", {
          children: q.errorWord
        }, void 0, false), "\" → \"", /*#__PURE__*/_jsxDEV("strong", {
          children: q.correction
        }, void 0, false), "\""]
      }, void 0, true) : /*#__PURE__*/_jsxDEV(_Fragment, {
        children: [/*#__PURE__*/_jsxDEV("strong", {
          children: "✗"
        }, void 0, false), " The error was \"", /*#__PURE__*/_jsxDEV("strong", {
          children: q.errorWord
        }, void 0, false), "\" → should be \"", /*#__PURE__*/_jsxDEV("strong", {
          children: q.correction
        }, void 0, false), "\""]
      }, void 0, true)
    }, void 0, false)]
  }, void 0, true);
}
function TableQuestion({
  q,
  onAnswer,
  disabled,
  result
}) {
  const [val, setVal] = useState('');
  const hiddenTense = TABLE_CELL_ORDER[q.hiddenCell];
  const options = useMemo(() => buildTableOptions(hiddenTense), [q.id]);
  const [selectedOpt, setSelectedOpt] = useState(null);
  function handleSelect(opt) {
    if (disabled) return;
    setSelectedOpt(opt);
    onAnswer(opt);
  }

  // Render 3 rows × 3 cols (Present / Past / Future)
  const rows = [{
    label: 'Present',
    cells: [0, 1, 2]
  }, {
    label: 'Past',
    cells: [3, 4, 5]
  }, {
    label: 'Future',
    cells: [6, 7, null]
  }];
  const colLabels = ['Simple', 'Continuous', 'Perfect'];
  return /*#__PURE__*/_jsxDEV("div", {
    children: [/*#__PURE__*/_jsxDEV("p", {
      className: "instruction",
      children: "One rule is hidden. Select the correct description from the options below."
    }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
      style: {
        overflowX: 'auto'
      },
      children: /*#__PURE__*/_jsxDEV("table", {
        className: "tense-table",
        children: [/*#__PURE__*/_jsxDEV("thead", {
          children: /*#__PURE__*/_jsxDEV("tr", {
            children: [/*#__PURE__*/_jsxDEV("th", {
              style: {
                width: '80px'
              }
            }, void 0, false), colLabels.map(c => /*#__PURE__*/_jsxDEV("th", {
              children: c
            }, c, false))]
          }, void 0, true)
        }, void 0, false), /*#__PURE__*/_jsxDEV("tbody", {
          children: rows.map(row => /*#__PURE__*/_jsxDEV("tr", {
            children: [/*#__PURE__*/_jsxDEV("td", {
              className: "row-label",
              children: row.label
            }, void 0, false), row.cells.map((cellIdx, ci) => {
              if (cellIdx === null) {
                return /*#__PURE__*/_jsxDEV("td", {
                  className: "cell-filled",
                  style: {
                    opacity: 0.3
                  },
                  children: /*#__PURE__*/_jsxDEV("span", {
                    style: {
                      fontSize: '0.8rem',
                      fontStyle: 'italic',
                      color: 'var(--text-dim)'
                    },
                    children: "N / A"
                  }, void 0, false)
                }, 'na-' + ci, false);
              }
              const tense = TABLE_CELL_ORDER[cellIdx];
              const isHidden = cellIdx === q.hiddenCell;
              return /*#__PURE__*/_jsxDEV("td", {
                className: isHidden ? 'cell-hidden' : 'cell-filled',
                children: isHidden ? /*#__PURE__*/_jsxDEV("span", {
                  style: {
                    color: 'var(--neon-purple)',
                    fontSize: '1.4rem'
                  },
                  children: "?"
                }, void 0, false) : /*#__PURE__*/_jsxDEV("span", {
                  style: {
                    fontSize: '0.82rem',
                    lineHeight: 1.5
                  },
                  children: TABLE_RULES[tense]
                }, void 0, false)
              }, cellIdx, false);
            })]
          }, row.label, true))
        }, void 0, false)]
      }, void 0, true)
    }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
      style: {
        marginTop: '16px',
        marginBottom: '8px',
        fontSize: '0.85rem',
        color: 'var(--neon-purple)'
      },
      children: ["Hidden tense: ", /*#__PURE__*/_jsxDEV("strong", {
        children: hiddenTense
      }, void 0, false)]
    }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
      className: "table-mc",
      children: options.map(opt => {
        let cls = 'mc-btn';
        if (disabled) {
          if (opt === TABLE_RULES[hiddenTense]) cls += ' correct';else if (selectedOpt === opt) cls += ' wrong';
        }
        return /*#__PURE__*/_jsxDEV("button", {
          className: cls,
          onClick: () => handleSelect(opt),
          disabled: disabled,
          children: opt
        }, opt, false);
      })
    }, void 0, false), disabled && /*#__PURE__*/_jsxDEV("div", {
      className: "answer-reveal mt-16",
      children: result && result.correct ? /*#__PURE__*/_jsxDEV(_Fragment, {
        children: [/*#__PURE__*/_jsxDEV("strong", {
          children: "✓"
        }, void 0, false), " Correct! The rule for ", /*#__PURE__*/_jsxDEV("strong", {
          children: hiddenTense
        }, void 0, false), " is: \"", TABLE_RULES[hiddenTense], "\""]
      }, void 0, true) : /*#__PURE__*/_jsxDEV(_Fragment, {
        children: [/*#__PURE__*/_jsxDEV("strong", {
          children: "✗"
        }, void 0, false), " The correct rule is: \"", TABLE_RULES[hiddenTense], "\""]
      }, void 0, true)
    }, void 0, false)]
  }, void 0, true);
}

// ═══════════════════════════════════════════════════════════════
// MAIN GAME COMPONENT
// ═══════════════════════════════════════════════════════════════

const TOTAL_QUESTIONS = Math.min(30, Q_BANK.length);
function App() {
  const [gameState, setGameState] = useState('start');
  const [lives, setLives] = useState(3);
  const [globalTimer, setGlobalTimer] = useState(0);
  const [questionTimer, setQuestionTimer] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [roundQuestions, setRoundQuestions] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [questionResult, setQuestionResult] = useState(null);
  const [questionLocked, setQuestionLocked] = useState(false);
  const [leaderboard, setLeaderboard] = useState(getLSLeaderboard());
  const [finalTime, setFinalTime] = useState(null);
  const [newRecord, setNewRecord] = useState(false);
  const globalIntervalRef = useRef(null);
  const questionIntervalRef = useRef(null);
  // Live refs so callbacks never go stale
  const globalTimerRef = useRef(0);
  const livesRef = useRef(3);
  const questionLockedRef = useRef(false);
  const currentIndexRef = useRef(0);

  // ── Select 30 random questions ──
  function startGame() {
    const selected = shuffle(Q_BANK).slice(0, TOTAL_QUESTIONS);
    setRoundQuestions(selected);
    setCurrentIndex(0);
    currentIndexRef.current = 0;
    setLives(3);
    livesRef.current = 3;
    setGlobalTimer(0);
    globalTimerRef.current = 0;
    setQuestionResult(null);
    setFeedback(null);
    setQuestionLocked(false);
    questionLockedRef.current = false;
    setFinalTime(null);
    setNewRecord(false);
    setGameState('playing');
  }

  // ── Global timer (also keep ref in sync) ──
  useEffect(() => {
    if (gameState === 'playing') {
      globalIntervalRef.current = setInterval(() => {
        globalTimerRef.current += 1;
        setGlobalTimer(t => t + 1);
      }, 1000);
    } else {
      clearInterval(globalIntervalRef.current);
    }
    return () => clearInterval(globalIntervalRef.current);
  }, [gameState]);

  // ── Question timer ──
  const currentQ = roundQuestions[currentIndex];
  useEffect(() => {
    if (gameState !== 'playing' || !currentQ || questionLockedRef.current) {
      clearInterval(questionIntervalRef.current);
      return;
    }
    const max = getTimerMax(currentQ.type);
    setQuestionTimer(max);
    clearInterval(questionIntervalRef.current);
    questionIntervalRef.current = setInterval(() => {
      setQuestionTimer(t => {
        if (t <= 1) {
          clearInterval(questionIntervalRef.current);
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(questionIntervalRef.current);
  }, [currentIndex, gameState]);

  // ── Timeout ──
  function handleTimeout() {
    if (questionLockedRef.current) return;
    questionLockedRef.current = true;
    setQuestionLocked(true);
    setFeedback({
      correct: false
    });
    setQuestionResult({
      correct: false,
      timeout: true
    });
    processResult(false);
  }

  // ── Process correct/wrong ──
  function processResult(correct) {
    const prevLives = livesRef.current;
    const nextLives = correct ? prevLives : prevLives - 1;
    livesRef.current = nextLives < 0 ? 0 : nextLives;
    setLives(livesRef.current);
    if (!correct && livesRef.current <= 0) {
      setTimeout(() => setGameState('gameover'), 1100);
      setTimeout(() => setFeedback(null), 1100);
      return;
    }
    setTimeout(() => {
      setFeedback(null);
      advanceQuestion();
    }, 1100);
  }
  function advanceQuestion() {
    questionLockedRef.current = false;
    setQuestionLocked(false);
    setQuestionResult(null);
    const nextIndex = currentIndexRef.current + 1;
    if (nextIndex >= TOTAL_QUESTIONS) {
      // Victory — capture time from ref (never stale)
      const elapsed = globalTimerRef.current;
      const lb = addToLeaderboard(elapsed);
      const isNew = lb[0] && lb[0].time === elapsed;
      setFinalTime(elapsed);
      setNewRecord(isNew);
      setLeaderboard(lb);
      setGameState('victory');
    } else {
      currentIndexRef.current = nextIndex;
      setCurrentIndex(nextIndex);
    }
  }

  // ── Answer handlers ──
  function handleAnswer(answer) {
    if (questionLockedRef.current || gameState !== 'playing') return;
    clearInterval(questionIntervalRef.current);
    questionLockedRef.current = true;
    setQuestionLocked(true);
    const q = currentQ;
    let correct = false;
    if (q.type === 'recognition') {
      correct = answer === q.answer;
      setQuestionResult({
        correct,
        selected: answer
      });
    } else if (q.type === 'fill') {
      correct = answer.toLowerCase() === q.answer.toLowerCase();
      setQuestionResult({
        correct
      });
    } else if (q.type === 'fix') {
      correct = answer.correct === true;
      setQuestionResult({
        correct
      });
    } else if (q.type === 'table') {
      const hiddenTense = TABLE_CELL_ORDER[q.hiddenCell];
      correct = answer === TABLE_RULES[hiddenTense];
      setQuestionResult({
        correct,
        selected: answer
      });
    }
    setFeedback({
      correct
    });
    processResult(correct);
  }

  // ── Fix question special handler ──
  function handleFixAnswer(ansObj) {
    if (questionLockedRef.current || gameState !== 'playing') return;
    clearInterval(questionIntervalRef.current);
    questionLockedRef.current = true;
    setQuestionLocked(true);
    const correct = ansObj.correct;
    setQuestionResult({
      correct
    });
    setFeedback({
      correct
    });
    processResult(correct);
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER: START SCREEN
  // ═══════════════════════════════════════════════════════════════
  if (gameState === 'start') {
    return /*#__PURE__*/_jsxDEV("div", {
      className: "app",
      children: /*#__PURE__*/_jsxDEV("div", {
        className: "main",
        children: /*#__PURE__*/_jsxDEV("div", {
          className: "card start-screen",
          children: [/*#__PURE__*/_jsxDEV("div", {
            style: {
              fontSize: '3rem',
              marginBottom: '16px'
            },
            children: "⚡"
          }, void 0, false), /*#__PURE__*/_jsxDEV("h1", {
            className: "start-title",
            children: "TENSE MASTER"
          }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
            className: "start-subtitle",
            children: pack?.title || "Sudden Death"
          }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
            className: "rules-grid",
            children: [/*#__PURE__*/_jsxDEV("div", {
              className: "rule-item",
              children: [/*#__PURE__*/_jsxDEV("span", {
                className: "rule-icon",
                children: "🎯"
              }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
                className: "rule-text",
                children: [/*#__PURE__*/_jsxDEV("strong", {
                  children: "Recognition"
                }, void 0, false), /*#__PURE__*/_jsxDEV("br", {}, void 0, false), "10s — Choose the correct tense name"]
              }, void 0, true)]
            }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
              className: "rule-item",
              children: [/*#__PURE__*/_jsxDEV("span", {
                className: "rule-icon",
                children: "✍️"
              }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
                className: "rule-text",
                children: [/*#__PURE__*/_jsxDEV("strong", {
                  children: "Fill-in"
                }, void 0, false), /*#__PURE__*/_jsxDEV("br", {}, void 0, false), "20s — Type the missing verb phrase"]
              }, void 0, true)]
            }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
              className: "rule-item",
              children: [/*#__PURE__*/_jsxDEV("span", {
                className: "rule-icon",
                children: "🔧"
              }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
                className: "rule-text",
                children: [/*#__PURE__*/_jsxDEV("strong", {
                  children: "Error Fix"
                }, void 0, false), /*#__PURE__*/_jsxDEV("br", {}, void 0, false), "30s — Click the wrong word & correct it"]
              }, void 0, true)]
            }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
              className: "rule-item",
              children: [/*#__PURE__*/_jsxDEV("span", {
                className: "rule-icon",
                children: "📋"
              }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
                className: "rule-text",
                children: [/*#__PURE__*/_jsxDEV("strong", {
                  children: "Table"
                }, void 0, false), /*#__PURE__*/_jsxDEV("br", {}, void 0, false), "30s — Fill in the missing grammar rule"]
              }, void 0, true)]
            }, void 0, true)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
            className: "btn btn-primary btn-lg",
            onClick: startGame,
            children: "⚡ START GAME"
          }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
            style: {
              marginTop: '28px'
            },
            children: /*#__PURE__*/_jsxDEV(Leaderboard, {
              entries: leaderboard
            }, void 0, false)
          }, void 0, false)]
        }, void 0, true)
      }, void 0, false)
    }, void 0, false);
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER: GAME OVER
  // ═══════════════════════════════════════════════════════════════
  if (gameState === 'gameover') {
    return /*#__PURE__*/_jsxDEV("div", {
      className: "app",
      children: /*#__PURE__*/_jsxDEV("div", {
        className: "main",
        children: /*#__PURE__*/_jsxDEV("div", {
          className: "card end-screen",
          children: [/*#__PURE__*/_jsxDEV("span", {
            className: "end-icon",
            children: "💀"
          }, void 0, false), /*#__PURE__*/_jsxDEV("h1", {
            className: "end-title defeat",
            children: "GAME OVER"
          }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
            className: "end-sub",
            children: ["You ran out of lives on question ", currentIndex + 1, " of ", TOTAL_QUESTIONS, "."]
          }, void 0, true), /*#__PURE__*/_jsxDEV("p", {
            style: {
              color: 'var(--text-muted)',
              marginBottom: '28px',
              lineHeight: 1.7
            },
            children: ["Don't worry — even the best goalkeepers train harder after a loss!", /*#__PURE__*/_jsxDEV("br", {}, void 0, false), "Study your tenses and come back stronger. ⚽"]
          }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
            className: "btn btn-primary btn-lg",
            onClick: startGame,
            children: "🔄 TRY AGAIN"
          }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
            className: "mt-24",
            children: /*#__PURE__*/_jsxDEV(Leaderboard, {
              entries: leaderboard
            }, void 0, false)
          }, void 0, false)]
        }, void 0, true)
      }, void 0, false)
    }, void 0, false);
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER: VICTORY
  // ═══════════════════════════════════════════════════════════════
  if (gameState === 'victory') {
    return /*#__PURE__*/_jsxDEV("div", {
      className: "app",
      children: /*#__PURE__*/_jsxDEV("div", {
        className: "main",
        children: /*#__PURE__*/_jsxDEV("div", {
          className: "card end-screen",
          children: [/*#__PURE__*/_jsxDEV("span", {
            className: "end-icon",
            children: "🏆"
          }, void 0, false), /*#__PURE__*/_jsxDEV("h1", {
            className: "end-title victory",
            children: "VICTORY!"
          }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
            className: "end-sub",
            children: ["You survived all ", TOTAL_QUESTIONS, " questions with ", lives, " ❤️ remaining!"]
          }, void 0, true), newRecord && /*#__PURE__*/_jsxDEV("div", {
            style: {
              color: 'var(--neon-yellow)',
              fontSize: '1rem',
              fontWeight: 700,
              letterSpacing: '2px',
              marginBottom: '12px',
              textShadow: 'var(--glow-yellow)'
            },
            children: "🌟 NEW PERSONAL BEST! 🌟"
          }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
            className: "final-time",
            children: formatTime(finalTime ?? globalTimer)
          }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
            className: "btn btn-green btn-lg",
            onClick: startGame,
            style: {
              marginBottom: '12px'
            },
            children: "⚡ PLAY AGAIN"
          }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
            className: "btn btn-ghost",
            onClick: () => setGameState('start'),
            children: "← Back to Menu"
          }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
            className: "mt-24",
            children: /*#__PURE__*/_jsxDEV(Leaderboard, {
              entries: leaderboard,
              highlightTime: finalTime ?? globalTimer
            }, void 0, false)
          }, void 0, false)]
        }, void 0, true)
      }, void 0, false)
    }, void 0, false);
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER: PLAYING
  // ═══════════════════════════════════════════════════════════════
  if (!currentQ) return null;
  const timerMax = getTimerMax(currentQ.type);
  const isDanger = questionTimer < 5 && questionTimer > 0;
  const progress = currentIndex / TOTAL_QUESTIONS * 100;
  const typeBadge = {
    recognition: 'badge-recognition',
    fill: 'badge-fill',
    fix: 'badge-fix',
    table: 'badge-table'
  }[currentQ.type];
  const typeLabel = {
    recognition: pack ? 'Choose an answer' : '🎯 Identify Tense',
    fill: '✍️ Fill in Blank',
    fix: '🔧 Fix the Error',
    table: '📋 Table Challenge'
  }[currentQ.type];
  return /*#__PURE__*/_jsxDEV("div", {
    className: "app",
    children: [/*#__PURE__*/_jsxDEV("div", {
      className: "topbar",
      children: [/*#__PURE__*/_jsxDEV("div", {
        className: "topbar-brand",
        children: "TENSE MASTER"
      }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
        className: "topbar-stats",
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "stat-pill",
          children: [/*#__PURE__*/_jsxDEV("span", {
            className: "stat-label",
            children: "Time"
          }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
            className: "stat-value cyan",
            children: formatTime(globalTimer)
          }, void 0, false)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "stat-pill",
          children: [/*#__PURE__*/_jsxDEV("span", {
            className: "stat-label",
            children: "Q"
          }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
            className: "stat-value",
            children: [currentIndex + 1, " / ", TOTAL_QUESTIONS]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "stat-pill",
          children: /*#__PURE__*/_jsxDEV(Lives, {
            count: lives
          }, void 0, false)
        }, void 0, false)]
      }, void 0, true)]
    }, void 0, true), /*#__PURE__*/_jsxDEV(FeedbackToast, {
      feedback: feedback
    }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
      className: "main",
      children: [/*#__PURE__*/_jsxDEV("div", {
        className: "progress-bar-wrap",
        children: /*#__PURE__*/_jsxDEV("div", {
          className: "progress-bar-bg",
          children: /*#__PURE__*/_jsxDEV("div", {
            className: "progress-bar-fill",
            style: {
              width: `${progress}%`
            }
          }, void 0, false)
        }, void 0, false)
      }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
        className: "card",
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "q-header",
          children: [/*#__PURE__*/_jsxDEV("div", {
            style: {
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              flexWrap: 'wrap'
            },
            children: [/*#__PURE__*/_jsxDEV("span", {
              className: `q-type-badge ${typeBadge}`,
              children: typeLabel
            }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
              className: "q-theme-badge",
              children: currentQ.theme
            }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
              style: {
                fontSize: '0.75rem',
                padding: '3px 10px',
                borderRadius: '999px',
                background: 'rgba(0,245,255,0.06)',
                color: 'var(--text-muted)',
                border: '1px solid rgba(0,245,255,0.15)'
              },
              children: currentQ.tense
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV(QuestionTimer, {
            value: questionTimer,
            max: timerMax,
            danger: isDanger
          }, void 0, false)]
        }, void 0, true), currentQ.type === 'recognition' && /*#__PURE__*/_jsxDEV(RecognitionQuestion, {
          q: currentQ,
          onAnswer: handleAnswer,
          disabled: questionLocked,
          result: questionResult
        }, void 0, false), currentQ.type === 'fill' && /*#__PURE__*/_jsxDEV(FillInQuestion, {
          q: currentQ,
          onAnswer: handleAnswer,
          disabled: questionLocked,
          result: questionResult
        }, currentQ.id, false), currentQ.type === 'fix' && /*#__PURE__*/_jsxDEV(FixQuestion, {
          q: currentQ,
          onAnswer: handleFixAnswer,
          disabled: questionLocked,
          result: questionResult
        }, currentQ.id, false), currentQ.type === 'table' && /*#__PURE__*/_jsxDEV(TableQuestion, {
          q: currentQ,
          onAnswer: handleAnswer,
          disabled: questionLocked,
          result: questionResult
        }, currentQ.id, false)]
      }, void 0, true)]
    }, void 0, true)]
  }, void 0, true);
}
const root = createRoot(document.getElementById('root'));
root.render(/*#__PURE__*/_jsxDEV(App, {}, void 0, false));
