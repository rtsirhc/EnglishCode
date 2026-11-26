import { bindGameControls } from '/gallery/shared/runtime.js';
/* =========================================================
   DETECTIVE CASE FILES — Game Logic
   ========================================================= */
(function () {
  const STORAGE_KEY = "detectiveCaseFiles_v1";
  const CASES = window.CASES || [];

  // ---------- Persistent State ----------
  function defaultState() {
    return {
      teamName: "",
      muted: false,
      cases: {} // id -> { evidence: [sentenceText], answers: {qIdx: optIdx}, hints: [qIdx], submitted: bool, score: number, correctCount: number, report: {...} }
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      const restored = defaultState();
      if (!parsed || typeof parsed !== 'object') return restored;
      restored.teamName = typeof parsed.teamName === 'string' ? parsed.teamName.slice(0, 120) : '';
      restored.muted = parsed.muted === true;
      for (const c of CASES) {
        const saved = parsed.cases?.[c.id];
        if (!saved || typeof saved !== 'object') continue;
        const item = defaultCaseState();
        item.evidence = Array.isArray(saved.evidence) ? saved.evidence.filter(value => typeof value === 'string') : [];
        item.hints = Array.isArray(saved.hints) ? [...new Set(saved.hints.filter(index => Number.isInteger(index) && c.questions[index]))] : [];
        for (const [index, answer] of Object.entries(saved.answers || {})) {
          if (Number.isInteger(answer) && c.questions[index]?.options[answer] !== undefined) item.answers[index] = answer;
        }
        for (const key of ['score', 'correctCount', 'evidenceBonus']) {
          if (Number.isFinite(saved[key]) && saved[key] >= 0) item[key] = saved[key];
        }
        item.submitted = saved.submitted === true;
        for (const key of ['ev1', 'ev2', 'ev3', 'fairness', 'fairnessWhy']) {
          if (typeof saved.report?.[key] === 'string') item.report[key] = saved.report[key];
        }
        if (Array.isArray(saved.report?.extras)) item.report.extras = saved.report.extras.map(value => typeof value === 'string' ? value : '');
        restored.cases[c.id] = item;
      }
      return restored;
    } catch {
      return defaultState();
    }
  }

  let state = loadState();
  let currentCaseId = null;
  let currentFilter = "all";
  let showKeyCluesInStory = false;

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }

  function defaultCaseState() {
    return {
      evidence: [], answers: {}, hints: [], submitted: false,
      score: 0, correctCount: 0, evidenceBonus: 0,
      report: { ev1: '', ev2: '', ev3: '', extras: [], fairness: '', fairnessWhy: '' }
    };
  }
  function getCaseState(id) {
    state.cases[id] ||= defaultCaseState();
    return state.cases[id];
  }

  // ---------- Web Audio Sound Effects ----------
  let audioCtx = null;
  function getAudio() {
    if (state.muted) return null;
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playClick() {
    const ctx = getAudio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.045);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.055);
  }

  function playStamp() {
    const ctx = getAudio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(42, ctx.currentTime + 0.16);
    gain.gain.setValueAtTime(0.24, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }

  // ---------- Helpers ----------
  function splitSentences(paragraph) {
    // Split on sentence endings (. ! ?) followed by space, keeping quotes attached
    const parts = paragraph.match(/[^.!?]+[.!?]+(?:["”’']*)?(?=\s|$)|[^.!?]+$/g);
    return (parts || [paragraph]).map(s => s.trim()).filter(Boolean);
  }

  function estimateMinutes(caseObj) {
    const words = caseObj.story.join(" ").split(/\s+/).length;
    return Math.max(3, Math.round(words / 130));
  }

  function difficultyStars(d) {
    return "★".repeat(d) + "☆".repeat(3 - d);
  }

  function getRank(totalScore) {
    if (totalScore >= 3800) return "Chief Inspector";
    if (totalScore >= 2200) return "Inspector";
    if (totalScore >= 900) return "Detective";
    return "Rookie";
  }

  function isKeySentence(sentence, caseObj) {
    const low = sentence.toLowerCase();
    return (caseObj.keyEvidence || []).some(phrase => low.includes(phrase.toLowerCase()));
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ---------- DOM Elements ----------
  const el = {
    homeBtn: document.getElementById("home-btn"),
    teamName: document.getElementById("team-name"),
    rankLabel: document.getElementById("rank-label"),
    totalScore: document.getElementById("total-score"),
    solvedCount: document.getElementById("solved-count"),
    muteBtn: document.getElementById("mute-btn"),
    boardView: document.getElementById("board-view"),
    caseView: document.getElementById("case-view"),
    caseGrid: document.getElementById("case-grid"),
    resetProgressBtn: document.getElementById("reset-progress-btn"),
    caseTitle: document.getElementById("case-title"),
    caseSub: document.getElementById("case-sub"),
    backBoardBtn: document.getElementById("back-board-btn"),
    tabReveal: document.getElementById("tab-reveal"),
    panelRead: document.getElementById("panel-read"),
    panelQuiz: document.getElementById("panel-quiz"),
    panelReport: document.getElementById("panel-report"),
    panelReveal: document.getElementById("panel-reveal"),
    dossierCode: document.getElementById("dossier-code"),
    dossierVictim: document.getElementById("dossier-victim"),
    storyBody: document.getElementById("story-body"),
    readEvidenceStatus: document.getElementById("read-evidence-status"),
    goQuizBtn: document.getElementById("go-quiz-btn"),
    suspectCount: document.getElementById("suspect-count"),
    suspectList: document.getElementById("suspect-list"),
    evidenceCount: document.getElementById("evidence-count"),
    evidenceList: document.getElementById("evidence-list"),
    questionsContainer: document.getElementById("questions-container"),
    backReadBtn: document.getElementById("back-read-btn"),
    quizProgress: document.getElementById("quiz-progress"),
    submitQuizBtn: document.getElementById("submit-quiz-btn"),
    reportMeta: document.getElementById("report-meta"),
    fillEvidenceBtn: document.getElementById("fill-evidence-btn"),
    repEv1: document.getElementById("rep-ev1"),
    repEv2: document.getElementById("rep-ev2"),
    repEv3: document.getElementById("rep-ev3"),
    extraReportFields: document.getElementById("extra-report-fields"),
    repFairnessWhy: document.getElementById("rep-fairness-why"),
    copyReportBtn: document.getElementById("copy-report-btn"),
    printReportBtn: document.getElementById("print-report-btn"),
    copyToast: document.getElementById("copy-toast"),
    reportNextBtn: document.getElementById("report-next-btn"),
    verdictStamp: document.getElementById("verdict-stamp"),
    verdictNote: document.getElementById("verdict-note"),
    scoreBreakdown: document.getElementById("score-breakdown"),
    solCulprit: document.getElementById("sol-culprit"),
    solText: document.getElementById("sol-text"),
    solHerring: document.getElementById("sol-herring"),
    solTwist: document.getElementById("sol-twist"),
    reviewList: document.getElementById("review-list"),
    showCluesStoryBtn: document.getElementById("show-clues-story-btn"),
    retryCaseBtn: document.getElementById("retry-case-btn"),
    goReportFromRevealBtn: document.getElementById("go-report-from-reveal-btn"),
    revealBoardBtn: document.getElementById("reveal-board-btn")
  };

  // ---------- Header Updates ----------
  function updateHeader() {
    let total = 0;
    let solved = 0;
    CASES.forEach(c => {
      const cs = state.cases[c.id];
      if (cs && cs.submitted) {
        total += cs.score || 0;
        if (cs.correctCount >= Math.ceil(c.questions.length * 0.6)) {
          solved++;
        }
      }
    });
    el.totalScore.textContent = total;
    el.rankLabel.textContent = getRank(total);
    el.solvedCount.textContent = `${solved} / ${CASES.length}`;
    el.muteBtn.textContent = state.muted ? "🔇 Muted" : "🔊 Sound";
    el.teamName.value = state.teamName || "";
  }

  // ---------- Render Case Board ----------
  function renderBoard() {
    currentCaseId = null;
    el.caseView.classList.add("hidden");
    el.boardView.classList.remove("hidden");
    updateHeader();

    const filtered = CASES.filter(c => {
      const cs = state.cases[c.id];
      const isSolved = cs && cs.submitted && cs.correctCount >= Math.ceil(c.questions.length * 0.6);
      if (currentFilter === "solved") return isSolved;
      if (currentFilter === "unsolved") return !isSolved;
      return true;
    });

    if (filtered.length === 0) {
      el.caseGrid.innerHTML = `<p style="color:#b5a998;">No cases match this filter yet.</p>`;
      return;
    }

    el.caseGrid.innerHTML = filtered.map(c => {
      const idx = CASES.indexOf(c) + 1;
      const cs = state.cases[c.id];
      const mins = estimateMinutes(c);
      let stampHtml = `<span class="stamp-mini classified">CLASSIFIED</span>`;
      if (cs && cs.submitted) {
        if (c.openEnding) {
          stampHtml = `<span class="stamp-mini open">OPEN FILE · ${cs.score} pts</span>`;
        } else if (cs.correctCount >= Math.ceil(c.questions.length * 0.6)) {
          stampHtml = `<span class="stamp-mini solved">SOLVED · ${cs.score} pts</span>`;
        } else {
          stampHtml = `<span class="stamp-mini cold">COLD CASE · ${cs.score} pts</span>`;
        }
      } else if (c.openEnding) {
        stampHtml = `<span class="stamp-mini open">OPEN ENDING</span>`;
      }

      return `
        <button class="case-card" type="button" data-case-id="${c.id}" data-tab="CASE #${String(idx).padStart(2, "0")}">
          <div class="case-card-head">
            <h3>${escapeHtml(c.title)}</h3>
            ${stampHtml}
          </div>
          <div class="case-meta">
            <span>📍 ${escapeHtml(c.setting)}</span>
          </div>
          <p class="case-teaser">${escapeHtml(c.teaser)}</p>
          <div class="case-footer">
            <span>⏱ ~${mins} min read</span>
            <span title="Difficulty">Difficulty: ${difficultyStars(c.difficulty)}</span>
          </div>
        </button>
      `;
    }).join("");

    el.caseGrid.querySelectorAll(".case-card").forEach(btn => {
      btn.addEventListener("click", () => {
        playClick();
        openCase(btn.dataset.caseId);
      });
    });
  }

  // ---------- Open a Case ----------
  function openCase(id, initialStep = "read") {
    const c = CASES.find(item => item.id === id);
    if (!c) return;
    currentCaseId = id;
    showKeyCluesInStory = false;
    const cs = getCaseState(id);
    const idx = CASES.indexOf(c) + 1;

    el.boardView.classList.add("hidden");
    el.caseView.classList.remove("hidden");

    el.caseTitle.textContent = c.title;
    el.caseSub.textContent = `${c.setting} · Victim: ${c.victim}`;
    el.dossierCode.textContent = `CASE FILE #${String(idx).padStart(2, "0")} — CONFIDENTIAL`;
    el.dossierVictim.textContent = `Victim: ${c.victim}`;

    el.tabReveal.disabled = !cs.submitted;

    renderStory(c, cs);
    renderSuspects(c);
    renderEvidence(c, cs);
    renderQuiz(c, cs);
    renderReport(c, cs);
    if (cs.submitted) renderReveal(c, cs);

    switchStep(initialStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function switchStep(step) {
    document.querySelectorAll(".step-tab").forEach(t => {
      t.classList.toggle("active", t.dataset.step === step);
    });
    el.panelRead.classList.toggle("hidden", step !== "read");
    el.panelQuiz.classList.toggle("hidden", step !== "quiz");
    el.panelReport.classList.toggle("hidden", step !== "report");
    el.panelReveal.classList.toggle("hidden", step !== "reveal");
  }

  // ---------- Step 1: Story, Suspects & Evidence ----------
  function renderStory(c, cs) {
    el.storyBody.innerHTML = c.story.map(para => {
      if (para.startsWith("## ")) {
        return `<h3>${escapeHtml(para.slice(3))}</h3>`;
      }
      const sentences = splitSentences(para);
      const html = sentences.map(sent => {
        const collected = cs.evidence.includes(sent);
        const keyClass = (showKeyCluesInStory && isKeySentence(sent, c)) ? " key-reveal" : "";
        return `<span class="sentence${collected ? " collected" : ""}${keyClass}" role="checkbox" tabindex="0" aria-checked="${collected}" data-sent="${escapeHtml(sent)}">${escapeHtml(sent)}</span>`;
      }).join(" ");
      return `<p>${html}</p>`;
    }).join("");

    el.storyBody.querySelectorAll(".sentence").forEach(span => {
      span.addEventListener("keydown", event => {
        if (!event.repeat && ['Enter', ' '].includes(event.key)) {
          event.preventDefault(); span.click();
        }
      });
      span.addEventListener("click", () => {
        const text = span.dataset.sent;
        const pos = cs.evidence.indexOf(text);
        if (pos >= 0) {
          cs.evidence.splice(pos, 1);
          span.classList.remove("collected");
        } else {
          cs.evidence.push(text);
          span.classList.add("collected");
        }
        span.setAttribute("aria-checked", String(cs.evidence.includes(text)));
        playClick();
        saveState();
        renderEvidence(c, cs);
      });
    });
  }

  function renderSuspects(c) {
    el.suspectCount.textContent = `${c.suspects.length}`;
    el.suspectList.innerHTML = c.suspects.map(s => `
      <div class="suspect-item">
        <div class="suspect-name">${escapeHtml(s.name)}</div>
        <div class="suspect-role">${escapeHtml(s.role)}</div>
        <div class="suspect-note">${escapeHtml(s.note)}</div>
      </div>
    `).join("");
  }

  function renderEvidence(c, cs) {
    el.evidenceCount.textContent = cs.evidence.length;
    el.readEvidenceStatus.textContent = cs.evidence.length === 0
      ? "No clues saved yet — click sentences in the story to collect them."
      : `${cs.evidence.length} clue${cs.evidence.length === 1 ? "" : "s"} saved in your Evidence Notebook.`;

    if (cs.evidence.length === 0) {
      el.evidenceList.innerHTML = `<p class="evidence-empty">Click any sentence in the case file to save it here.</p>`;
      return;
    }

    el.evidenceList.innerHTML = cs.evidence.map((item, i) => `
      <div class="evidence-item">
        <span>“${escapeHtml(item)}”</span>
        <button class="evidence-remove" type="button" data-idx="${i}" title="Remove clue">×</button>
      </div>
    `).join("");

    el.evidenceList.querySelectorAll(".evidence-remove").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.idx);
        cs.evidence.splice(idx, 1);
        playClick();
        saveState();
        renderStory(c, cs);
        renderEvidence(c, cs);
      });
    });
  }

  // ---------- Step 2: Quiz / Accusation ----------
  function renderQuiz(c, cs) {
    const letters = ["A", "B", "C", "D"];
    el.questionsContainer.innerHTML = c.questions.map((qObj, qi) => {
      const hintUsed = cs.hints.includes(qi);
      const chosen = cs.answers[qi];
      return `
        <div class="question-card" data-q="${qi}">
          <div class="question-head">
            <div>
              <div class="question-num">Question ${qi + 1} of ${c.questions.length}</div>
              <div class="question-text">${escapeHtml(qObj.q)}</div>
            </div>
            <button class="hint-btn" type="button" data-hint="${qi}" ${hintUsed ? "disabled" : ""}>
              ${hintUsed ? "💡 Hint Used (-25)" : "💡 Use Hint (-25 pts)"}
            </button>
          </div>
          ${hintUsed ? `<div class="hint-box"><strong>Hint:</strong> ${escapeHtml(qObj.hint)}</div>` : ""}
          <div class="options-list">
            ${qObj.options.map((opt, oi) => `
              <button class="option-btn${chosen === oi ? " selected" : ""}" type="button"
                      data-q="${qi}" data-o="${oi}">
                <span class="option-letter">${letters[oi]}.</span>
                <span>${escapeHtml(opt)}</span>
              </button>
            `).join("")}
          </div>
        </div>
      `;
    }).join("");

    el.questionsContainer.querySelectorAll(".hint-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const qi = Number(btn.dataset.hint);
        if (!cs.hints.includes(qi)) {
          cs.hints.push(qi);
          playClick();
          saveState();
          renderQuiz(c, cs);
        }
      });
    });

    el.questionsContainer.querySelectorAll(".option-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const qi = Number(btn.dataset.q);
        const oi = Number(btn.dataset.o);
        cs.answers[qi] = oi;
        playClick();
        saveState();
        renderQuiz(c, cs);
      });
    });

    const answered = Object.keys(cs.answers).length;
    el.quizProgress.textContent = `${answered} / ${c.questions.length} answered`;
    el.submitQuizBtn.disabled = answered < c.questions.length;
    el.submitQuizBtn.textContent = cs.submitted ? "Update Accusation" : "Submit Accusation";
  }

  function submitAccusation() {
    const c = CASES.find(item => item.id === currentCaseId);
    if (!c) return;
    const cs = getCaseState(c.id);

    let correctCount = 0;
    c.questions.forEach((qObj, qi) => {
      if (cs.answers[qi] === qObj.answer) correctCount++;
    });

    // Evidence bonus: +20 per unique key evidence phrase matched in collected sentences (max 100)
    const matchedPhrases = new Set();
    cs.evidence.forEach(sent => {
      const low = sent.toLowerCase();
      (c.keyEvidence || []).forEach(phrase => {
        if (low.includes(phrase.toLowerCase())) matchedPhrases.add(phrase);
      });
    });
    const evidenceBonus = Math.min(100, matchedPhrases.size * 20);
    const hintPenalty = cs.hints.length * 25;
    const score = Math.max(0, correctCount * 100 - hintPenalty + evidenceBonus);

    cs.submitted = true;
    cs.correctCount = correctCount;
    cs.evidenceBonus = evidenceBonus;
    cs.score = score;

    saveState();
    updateHeader();
    el.tabReveal.disabled = false;
    el.reportNextBtn.textContent = "View Case Closed →";
    renderReveal(c, cs);
    switchStep("reveal");
    playStamp();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---------- Step 3: Investigator's Report ----------
  function renderReport(c, cs) {
    const team = state.teamName ? ` · Detective / Team: ${state.teamName}` : "";
    el.reportMeta.textContent = `Case: ${c.title}${team}`;

    const rep = cs.report || { ev1: "", ev2: "", ev3: "", extras: [], fairness: "", fairnessWhy: "" };
    cs.report = rep;

    el.repEv1.value = rep.ev1 || "";
    el.repEv2.value = rep.ev2 || "";
    el.repEv3.value = rep.ev3 || "";
    el.repFairnessWhy.value = rep.fairnessWhy || "";

    document.querySelectorAll('input[name="fairness"]').forEach(r => {
      r.checked = (r.value === rep.fairness);
    });

    const prompts = c.report || [];
    el.extraReportFields.innerHTML = prompts.map((p, i) => `
      <div class="field-group">
        <label for="rep-extra-${i}">${escapeHtml(p)}</label>
        <textarea id="rep-extra-${i}" rows="2" placeholder="Write your answer...">${escapeHtml((rep.extras && rep.extras[i]) || "")}</textarea>
      </div>
    `).join("");

    el.extraReportFields.querySelectorAll("textarea").forEach((ta, i) => {
      ta.addEventListener("input", () => {
        if (!rep.extras) rep.extras = [];
        rep.extras[i] = ta.value;
        saveState();
      });
    });

    el.reportNextBtn.textContent = cs.submitted ? "View Case Closed →" : "Go to Accusation →";
  }

  function bindReportInputs() {
    const saveField = (key, value) => {
      if (!currentCaseId) return;
      const cs = getCaseState(currentCaseId);
      cs.report[key] = value;
      saveState();
    };
    el.repEv1.addEventListener("input", () => saveField("ev1", el.repEv1.value));
    el.repEv2.addEventListener("input", () => saveField("ev2", el.repEv2.value));
    el.repEv3.addEventListener("input", () => saveField("ev3", el.repEv3.value));
    el.repFairnessWhy.addEventListener("input", () => saveField("fairnessWhy", el.repFairnessWhy.value));
    document.querySelectorAll('input[name="fairness"]').forEach(r => {
      r.addEventListener("change", () => saveField("fairness", r.value));
    });

    el.fillEvidenceBtn.addEventListener("click", () => {
      if (!currentCaseId) return;
      const cs = getCaseState(currentCaseId);
      if (cs.evidence.length === 0) {
        alert("Your Evidence Notebook is empty. Click sentences in the story first!");
        return;
      }
      if (cs.evidence[0]) { el.repEv1.value = cs.evidence[0]; cs.report.ev1 = cs.evidence[0]; }
      if (cs.evidence[1]) { el.repEv2.value = cs.evidence[1]; cs.report.ev2 = cs.evidence[1]; }
      if (cs.evidence[2]) { el.repEv3.value = cs.evidence[2]; cs.report.ev3 = cs.evidence[2]; }
      playClick();
      saveState();
    });

    el.copyReportBtn.addEventListener("click", () => {
      const c = CASES.find(item => item.id === currentCaseId);
      if (!c) return;
      const cs = getCaseState(c.id);
      const rep = cs.report;
      const lines = [
        `INVESTIGATOR'S REPORT`,
        `Case: ${c.title}`,
        state.teamName ? `Detective / Team: ${state.teamName}` : null,
        ``,
        `Evidence 1: ${rep.ev1 || "(blank)"}`,
        `Evidence 2: ${rep.ev2 || "(blank)"}`,
        `Evidence 3: ${rep.ev3 || "(blank)"}`,
        ``
      ].filter(x => x !== null);

      (c.report || []).forEach((q, i) => {
        lines.push(`${q}`);
        lines.push(`Answer: ${(rep.extras && rep.extras[i]) || "(blank)"}`);
        lines.push(``);
      });

      lines.push(`Fairness rating: ${rep.fairness || "(not selected)"}`);
      lines.push(`Explanation: ${rep.fairnessWhy || "(blank)"}`);

      navigator.clipboard.writeText(lines.join("\n")).then(() => {
        el.copyToast.classList.remove("hidden");
        setTimeout(() => el.copyToast.classList.add("hidden"), 2000);
      }).catch(() => {
        alert("Could not copy automatically. You can use Print Report instead.");
      });
    });

    el.printReportBtn.addEventListener("click", () => window.print());
    el.reportNextBtn.addEventListener("click", () => {
      if (!currentCaseId) return;
      const cs = getCaseState(currentCaseId);
      switchStep(cs.submitted ? "reveal" : "quiz");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ---------- Step 4: Case Closed Reveal ----------
  function renderReveal(c, cs) {
    const passed = cs.correctCount >= Math.ceil(c.questions.length * 0.6);

    el.verdictStamp.className = "big-stamp";
    if (c.openEnding) {
      el.verdictStamp.classList.add("open");
      el.verdictStamp.textContent = "OPEN FILE";
      el.verdictNote.textContent = `You answered ${cs.correctCount} of ${c.questions.length} reasoning questions correctly. Now debate the verdict with your class!`;
    } else if (passed) {
      el.verdictStamp.classList.add("solved");
      el.verdictStamp.textContent = "CASE SOLVED";
      el.verdictNote.textContent = `Great detective work! You got ${cs.correctCount} out of ${c.questions.length} questions right.`;
    } else {
      el.verdictStamp.classList.add("cold");
      el.verdictStamp.textContent = "COLD CASE";
      el.verdictNote.textContent = `You got ${cs.correctCount} out of ${c.questions.length} right. Review the official solution and try again!`;
    }

    const hintPenalty = cs.hints.length * 25;
    el.scoreBreakdown.innerHTML = `
      <div class="score-chip">
        <div class="val">${cs.correctCount * 100}</div>
        <div class="lbl">Questions</div>
      </div>
      <div class="score-chip">
        <div class="val">+${cs.evidenceBonus || 0}</div>
        <div class="lbl">Clue Bonus</div>
      </div>
      <div class="score-chip">
        <div class="val">-${hintPenalty}</div>
        <div class="lbl">Hints</div>
      </div>
      <div class="score-chip">
        <div class="val" style="color:#b92b27;">${cs.score}</div>
        <div class="lbl">Total Pts</div>
      </div>
    `;

    el.solCulprit.textContent = c.solution.culprit;
    el.solText.innerHTML = c.solution.text.map(p => `<p>${escapeHtml(p)}</p>`).join("");
    el.solHerring.textContent = c.solution.redHerring;
    el.solTwist.textContent = c.solution.twist;

    el.reviewList.innerHTML = c.questions.map((qObj, qi) => {
      const chosen = cs.answers[qi];
      const ok = chosen === qObj.answer;
      return `
        <div class="review-item ${ok ? "ok" : "bad"}">
          <div class="review-q">${ok ? "✅" : "❌"} Q${qi + 1}: ${escapeHtml(qObj.q)}</div>
          <div class="review-a">
            ${ok
              ? `<span class="right">${escapeHtml(qObj.options[qObj.answer])}</span>`
              : `<span class="wrong">${escapeHtml(qObj.options[chosen] ?? "No answer")}</span>
                 <span class="right">Correct: ${escapeHtml(qObj.options[qObj.answer])}</span>`
            }
          </div>
        </div>
      `;
    }).join("");
  }

  // ---------- Global Events ----------
  function init() {
    el.homeBtn.addEventListener("click", renderBoard);
    el.backBoardBtn.addEventListener("click", renderBoard);
    el.revealBoardBtn.addEventListener("click", renderBoard);

    el.teamName.addEventListener("input", () => {
      state.teamName = el.teamName.value.trim();
      saveState();
    });

    el.muteBtn.addEventListener("click", () => {
      state.muted = !state.muted;
      saveState();
      updateHeader();
    });

    el.resetProgressBtn.addEventListener("click", () => {
      if (confirm("Reset all solved cases, scores, and saved notes?")) {
        state = defaultState();
        saveState();
        renderBoard();
      }
    });

    document.querySelectorAll(".filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        currentFilter = btn.dataset.filter;
        document.querySelectorAll(".filter-btn").forEach(b => b.classList.toggle("active", b === btn));
        renderBoard();
      });
    });

    document.querySelectorAll(".step-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        if (tab.disabled) return;
        playClick();
        switchStep(tab.dataset.step);
      });
    });

    el.goQuizBtn.addEventListener("click", () => {
      playClick();
      switchStep("quiz");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    el.backReadBtn.addEventListener("click", () => {
      playClick();
      switchStep("read");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    el.submitQuizBtn.addEventListener("click", submitAccusation);

    el.showCluesStoryBtn.addEventListener("click", () => {
      const c = CASES.find(item => item.id === currentCaseId);
      if (!c) return;
      const cs = getCaseState(c.id);
      showKeyCluesInStory = true;
      renderStory(c, cs);
      switchStep("read");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    el.retryCaseBtn.addEventListener("click", () => {
      const c = CASES.find(item => item.id === currentCaseId);
      if (!c) return;
      const cs = getCaseState(c.id);
      cs.answers = {};
      cs.hints = [];
      cs.submitted = false;
      cs.score = 0;
      cs.correctCount = 0;
      cs.evidenceBonus = 0;
      saveState();
      updateHeader();
      openCase(c.id, "quiz");
    });

    el.goReportFromRevealBtn.addEventListener("click", () => {
      playClick();
      switchStep("report");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    bindReportInputs();
    renderBoard();
  }

  bindGameControls('detective-case-files', {
    confirm: () => { if (!el.panelQuiz.classList.contains('hidden') && !el.submitQuizBtn.disabled) el.submitQuizBtn.click(); },
    ...Object.fromEntries(Array.from({ length: 4 }, (_, index) => [
      'answer' + (index + 1), () => {
        if (el.panelQuiz.classList.contains('hidden')) return;
        const cards = [...el.questionsContainer.querySelectorAll('.question-card')];
        const card = cards.find(item => !item.querySelector('.selected'));
        card?.querySelectorAll('.option-btn')[index]?.click();
      }
    ]))
  });
  init();
})();
