import { useState, useRef, useEffect } from 'react';

export default function Setup({ onSetupComplete }) {
  const [step, setStep] = useState('count');
  const [count, setCount] = useState('');
  const [names, setNames] = useState([]);
  const [wordListText, setWordListText] = useState('');
  const inputRefs = useRef([]);

  const handleCountSubmit = (e) => {
    e.preventDefault();
    const n = parseInt(count, 10);
    if (n >= 1 && n <= 30) {
      setNames(Array(n).fill(''));
      setStep('names');
    }
  };

  useEffect(() => {
    if (step === 'names') inputRefs.current[0]?.focus();
  }, [step]);

  const handleNameChange = (i, val) => {
    setNames((prev) => { const n = [...prev]; n[i] = val; return n; });
  };

  const handleNameKey = (e, i) => {
    if (e.key === 'Enter' && i < names.length - 1) inputRefs.current[i + 1]?.focus();
  };

  const allFilled = names.length > 0 && names.every((n) => n.trim());

  const handleStart = () => {
    const wordList = wordListText
      .split('\n')
      .map((w) => w.trim())
      .filter(Boolean);
    if (allFilled) {
      onSetupComplete({
        students: names.map((n) => n.trim()),
        wordList,
      });
    }
  };

  // ── Step 1: Count ──
  if (step === 'count') return (
    <div className="setup-screen">
      <div className="setup-card">
        <div className="setup-bee">🐝</div>
        <h1 className="setup-title">Spelling Bee</h1>
        <p className="setup-sub">How many students are playing today?</p>
        <form onSubmit={handleCountSubmit} className="setup-form">
          <input
            className="setup-number-input"
            type="number" min="1" max="30"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            placeholder="e.g. 6"
            autoFocus
          />
          <button className="setup-btn" type="submit" disabled={!count || parseInt(count, 10) < 1}>
            Next →
          </button>
        </form>
      </div>
    </div>
  );

  // ── Step 2: Names ──
  if (step === 'names') return (
    <div className="setup-screen">
      <div className="setup-card names-card">
        <div className="setup-bee">🐝</div>
        <h1 className="setup-title">Student Names</h1>
        <p className="setup-sub">{names.length} student{names.length !== 1 ? 's' : ''}</p>
        <div className="names-grid">
          {names.map((name, i) => (
            <div key={i} className="name-row">
              <span className="name-num">{i + 1}</span>
              <input
                ref={(el) => (inputRefs.current[i] = el)}
                className="name-input"
                type="text"
                value={name}
                onChange={(e) => handleNameChange(i, e.target.value)}
                onKeyDown={(e) => handleNameKey(e, i)}
                placeholder={`Student ${i + 1}`}
              />
            </div>
          ))}
        </div>
        <div className="setup-actions">
          <button className="back-btn" onClick={() => setStep('count')}>← Back</button>
          <button
            className="setup-btn"
            onClick={() => allFilled && setStep('words')}
            disabled={!allFilled}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );

  // ── Step 3: Word list ──
  return (
    <div className="setup-screen">
      <div className="setup-card words-card">
        <div className="setup-bee">🐝</div>
        <h1 className="setup-title">Word List</h1>
        <p className="setup-sub">
          Type one word per line. These will be used for the random word draw.
        </p>
        <textarea
          className="word-list-textarea"
          value={wordListText}
          onChange={(e) => setWordListText(e.target.value)}
          placeholder={'cat\ndog\nbird\nbeautiful\nJanuary'}
          autoFocus
        />
        <p className="word-count-hint">
          {wordListText.split('\n').filter((w) => w.trim()).length} words added
        </p>
        <div className="setup-actions">
          <button className="back-btn" onClick={() => setStep('names')}>← Back</button>
          <button className="setup-btn start-btn" onClick={handleStart}>
            Start Game 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
