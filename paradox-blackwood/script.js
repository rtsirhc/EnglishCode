import { bindGameControls } from '../gallery/shared/runtime.js';
import { validatePath, validateIndictment } from './validation.js';
const narrativeLog = document.getElementById('narrative-log');
const taskInstructions = document.getElementById('task-instructions');
const textInput = document.getElementById('text-input');
const inputContainer = document.getElementById('input-container');
const optionsContainer = document.getElementById('options-container');
const submitBtn = document.getElementById('submit-btn');
const nextBtn = document.getElementById('next-btn');
const feedback = document.getElementById('feedback');
const fileList = document.getElementById('file-list');
const evidenceDisplay = document.getElementById('evidence-display');
const evidenceContent = document.getElementById('evidence-content');

let currentPhase = 0;
let phaseComplete = false;
let triviaIndex = 0;
let transitionTimer = null;
let disposeControls = () => {};

const phases = {
    0: {
        title: "Introduction",
        narrative: "Lightning cracks across the sky, illuminating the towering silhouette of Blackwood Manor. The rain hammers relentlessly against the cobblestones—a perfect night for a murder.<br><br>We stand before the heavy oak doors. Inside, Lord Alistair Blackwood lies dead in his study, a cryptic expression frozen on his face. The local police are baffled. They have sealed the scene, but the clues make no sense to them. They need a specialist. They need <em>you</em>.<br><br><strong>Your Role:</strong> The Detective.<br><strong>Mission:</strong> Solve the Paradox at Blackwood Manor.",
        task: "Click 'Start Investigation' to begin.",
        type: "intro",
        image: "manor.png"
    },
    1: {
        title: "The Preposition Path",
        narrative: "You step into the wet grass outside the manor. Inspector Graves hands you a flashlight. 'We found muddy footprints, Detective,' he growls. 'But they don't make sense. They start at the gate, but there's no mud in the front hall. How did he get in?'<br><br>You shine your light around the perimeter. You see:<br>1. Muddy prints stopped <strong>at the high iron gate</strong>.<br>2. A trail of crushed grass leading <strong>into the rose garden</strong>.<br>3. Scuff marks going up the trellis and <strong>onto the second-floor balcony</strong>.<br>4. Wet mud <strong>on the Persian rug</strong> inside the study.<br>5. A smashed vase <strong>on the floor</strong> next to the body.",
        task: "Write a short report (3-5 sentences) explaining how the killer entered. You MUST use the following prepositions correctly: <strong>at, into, onto, off, in, on</strong>.",
        type: "text",
        image: "map.png",
        validation: validatePath
    },
    2: {
        title: "The Tense Timeline",
        narrative: "With the entry point established, you turn your attention to the suspects. The medical examiner has confirmed that Blackwood died at 8:25 PM. Three people were in the manor tonight. One alibi contradicts that time.",
        task: "Identify the alibi that places his death before the confirmed time. Read how the past perfect orders the events.",
        type: "choice",
        options: [
            { text: "The Butler: 'I was polishing the silver when I heard the scream. I had finished dinner service an hour before.'", correct: false },
            { text: "The Maid: 'I arrived at the study at 9 PM. But Lord Blackwood was already dead. I saw him through the keyhole.'", correct: false },
            { text: "The Nephew: 'I arrived at 8:20 PM. Lord Blackwood had already died before I arrived.'", correct: true }
        ],
        validation: (choiceIndex) => {
            return {
                valid: choiceIndex === 2,
                message: choiceIndex === 2 ? "Correct. Had already died places the death before his arrival at 8:20 PM, but the confirmed death time is 8:25 PM." : "That alibi fits the confirmed death time. Try again."
            };
        }
    },
    3: {
        title: "The Trivia Encryption",
        narrative: "You've cornered the Nephew, but he's encrypted his phone with a riddle based on grammar. To unlock the final evidence, you must answer three questions correctly.",
        task: "Answer the trivia questions to decrypt the phone.",
        type: "trivia",
        questions: [
            { q: "Which sentence implies the person is still in Paris?", options: ["She went to Paris.", "She has gone to Paris."], answer: 1 },
            { q: "Which sentence implies a finished time period?", options: ["I have seen him today.", "I saw him yesterday."], answer: 1 },
            { q: "Which sentence clearly places the departure before my arrival?", options: ["When I arrived, the train left.", "When I arrived, the train had left."], answer: 1 } // Trying to be precise here.
        ],
        currentQuestion: 0
    },
    4: {
        title: "The Final Report",
        narrative: "The phone unlocks. It reveals a text message sent at 8:25 PM: 'The old man is finished.' You have the motive, the method, and the opportunity. Now, you must file the official indictment.",
        task: "Write an indictment of at least 100 words. Use at least 5 of the prepositions (at, into, onto, off, in, on) and at least 3 sentences in the Past Perfect.",
        type: "text",
        validation: validateIndictment
    },
    5: {
        title: "Case Closed",
        narrative: "Excellent work, Detective. Lord Blackwood can finally rest in peace. The Nephew has been taken into custody, muttering about irregular verbs.",
        task: "CASE CLOSED - YOU WIN",
        type: "end"
    }
};

const viewEvidenceBtn = document.getElementById('view-evidence-btn');
const evidenceModal = document.getElementById('evidence-modal');
const closeIndictmentModal = document.getElementById('close-modal');

const evidenceData = {
    1: { id: "evidence-slot-1", text: "<strong>Path Established:</strong><br>The killer stopped <em>at</em> the front gate, moved <em>into</em> the rose garden, climbed <em>onto</em> the balcony, climbed <em>off</em> the trellis and stood <em>in</em> the study, leaving mud <em>on</em> the rug." },
    2: { id: "evidence-slot-2", text: "<strong>Suspect Identified:</strong><br>The Nephew claimed Blackwood had died before 8:20 PM. That contradicts the confirmed death time of 8:25 PM." },
    3: { id: "evidence-slot-3", text: "<strong>Decrypted Message:</strong><br><em>'The old man is finished.'</em> Sent at 8:25 PM.<br>Motive confirmed." }
};

function initGame() {
    renderPhase(0);
    textInput.addEventListener('input', () => {
        if (!phaseComplete) return;
        phaseComplete = false;
        nextBtn.classList.add('hidden');
        submitBtn.classList.remove('hidden');
        feedback.classList.add('hidden');
        updateControls();
    });

    submitBtn.addEventListener('click', handleSubmit);
    nextBtn.addEventListener('click', nextPhase);

    viewEvidenceBtn.addEventListener('click', () => {
        evidenceModal.classList.remove('hidden');
        closeIndictmentModal.focus();
        updateControls();
    });

    closeIndictmentModal.addEventListener('click', () => {
        closeEvidence();
    });

    window.addEventListener('click', (event) => {
        if (event.target === evidenceModal) {
            closeEvidence();
        }
    });
}

function unlockEvidence(phaseIndex) {
    if (evidenceData[phaseIndex]) {
        const slot = document.getElementById(evidenceData[phaseIndex].id);
        const p = slot.querySelector('p');
        p.innerHTML = evidenceData[phaseIndex].text;
        slot.classList.remove('locked');
        slot.classList.add('unlocked');

        // Visual cue
        viewEvidenceBtn.style.color = '#a3d5a7';
        setTimeout(() => viewEvidenceBtn.style.color = '', 1000);
    }
}

function renderPhase(phaseIndex) {
    clearTimeout(transitionTimer);
    transitionTimer = null;
    phaseComplete = false;
    currentPhase = phaseIndex;
    const phaseData = phases[phaseIndex];
    document.getElementById('case-status').textContent = phaseIndex === 5 ? 'Case closed' : phaseData.title;
    nextBtn.textContent = 'Proceed to Next Phase';

    // Update UI
    narrativeLog.innerHTML = phaseData.narrative;
    taskInstructions.innerHTML = `<strong>TASK:</strong> ${phaseData.task}`;
    feedback.classList.add('hidden');
    feedback.className = 'feedback-msg hidden';

    // Image Handling
    if (phaseData.image) {
        evidenceDisplay.classList.remove('hidden');
        evidenceContent.innerHTML = `<img src="${phaseData.image}" alt="Evidence Image">`;
    } else {
        evidenceDisplay.classList.add('hidden');
        evidenceContent.innerHTML = '';
    }

    // Hide all inputs initially
    textInput.classList.add('hidden');
    optionsContainer.innerHTML = '';
    optionsContainer.classList.add('hidden');
    submitBtn.classList.remove('hidden');
    nextBtn.classList.add('hidden');

    // Sidebar update
    document.querySelectorAll('#file-list li').forEach((li, idx) => {
        li.classList.remove('active');
        if (idx + 1 === phaseIndex) li.classList.add('active');
        if (idx + 1 < phaseIndex) li.classList.add('completed');
    });

    if (phaseData.type === 'intro') {
        submitBtn.textContent = "Start Investigation";
    } else if (phaseData.type === 'text') {
        textInput.classList.remove('hidden');
        textInput.value = '';
        nextBtn.textContent = 'Approve report & continue';
        submitBtn.textContent = "Submit Report";
    } else if (phaseData.type === 'choice') {
        optionsContainer.classList.remove('hidden');
        phaseData.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'action-btn';
            btn.style.display = 'block';
            btn.style.width = '100%';
            btn.style.marginBottom = '10px';
            btn.textContent = opt.text;
            btn.onclick = () => handleChoice(idx);
            optionsContainer.appendChild(btn);
        });
        submitBtn.classList.add('hidden');
    } else if (phaseData.type === 'trivia') {
        renderTrivia(0);
        submitBtn.classList.add('hidden');
    } else if (phaseData.type === 'end') {
        submitBtn.classList.add('hidden');
        textInput.classList.add('hidden');
        feedback.textContent = "CONGRATULATIONS!";
        feedback.classList.remove('hidden');
        feedback.classList.add('feedback-success');
        nextBtn.textContent = 'New investigation';
        nextBtn.classList.remove('hidden');
    }
    updateControls();
}

function renderTrivia(qIndex) {
    triviaIndex = qIndex;
    const phaseData = phases[3];
    optionsContainer.classList.remove('hidden');
    optionsContainer.innerHTML = '';

    const q = phaseData.questions[qIndex];
    const qTitle = document.createElement('h3');
    qTitle.textContent = `Question ${qIndex + 1}: ${q.q}`;
    qTitle.style.color = '#e0e0e0';
    optionsContainer.appendChild(qTitle);

    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'action-btn';
        btn.style.display = 'block';
        btn.style.width = '100%';
        btn.style.marginBottom = '10px';
        btn.textContent = opt;
        btn.onclick = () => handleTriviaAnswer(qIndex, idx);
        optionsContainer.appendChild(btn);
    });
    updateControls();
}

function handleTriviaAnswer(qIndex, choiceIndex) {
    if (currentPhase !== 3 || qIndex !== triviaIndex || phaseComplete || transitionTimer) return;
    const phaseData = phases[3];
    const q = phaseData.questions[qIndex];
    if (choiceIndex === q.answer) {
        showFeedback("Correct.", "success");
        optionsContainer.querySelectorAll('button').forEach(button => button.disabled = true);
        transitionTimer = setTimeout(() => {
            transitionTimer = null;
            if (qIndex + 1 < phaseData.questions.length) {
                renderTrivia(qIndex + 1);
                feedback.classList.add('hidden');
            } else {
                phaseComplete = true;
                showFeedback("Access Granted. All encryptions bypassed.", "success");
                submitBtn.classList.add('hidden');
                nextBtn.classList.remove('hidden');
                updateControls();
            }
        }, 1000);
        updateControls();
    } else {
        showFeedback("Access Denied. Incorrect answer.", "error");
    }
}

function handleChoice(choiceIndex) {
    if (currentPhase !== 2 || phaseComplete) return;
    const result = phases[currentPhase].validation(choiceIndex);
    if (result.valid) {
        phaseComplete = true;
        showFeedback(result.message, "success");
        submitBtn.classList.add('hidden');
        nextBtn.classList.remove('hidden');
        const btns = optionsContainer.querySelectorAll('button');
        btns.forEach(b => b.disabled = true);
    } else {
        showFeedback(result.message, "error");
    }
    updateControls();
}

function handleSubmit() {
    if (phaseComplete) return;
    if (currentPhase === 0) {
        nextPhase();
        return;
    }

    if (phases[currentPhase].type === 'text') {
        const text = textInput.value;
        const result = phases[currentPhase].validation(text);
        if (result.valid) {
            phaseComplete = true;
            showFeedback(result.message, "success");
            submitBtn.classList.add('hidden');
            nextBtn.classList.remove('hidden');
        } else {
            showFeedback(result.message, "error");
        }
    }
    updateControls();
}

function nextPhase() {
    if (currentPhase === 5) { location.reload(); return; }
    if (currentPhase !== 0 && !phaseComplete) return;
    unlockEvidence(currentPhase);
    renderPhase(currentPhase + 1);
}

function showFeedback(msg, type) {
    feedback.textContent = msg;
    feedback.classList.remove('hidden');
    feedback.className = `feedback-msg feedback-${type}`;
}

function closeEvidence() {
    evidenceModal.classList.add('hidden');
    viewEvidenceBtn.focus();
    updateControls();
}
function updateControls() {
    disposeControls();
    const actions = { hint: () => {
        if (evidenceModal.classList.contains('hidden')) viewEvidenceBtn.click();
        else closeEvidence();
    } };
    if (!evidenceModal.classList.contains('hidden')) actions.confirm = closeEvidence;
    else {
        if (!nextBtn.classList.contains('hidden')) actions.next = nextPhase;
        else if (!submitBtn.classList.contains('hidden')) actions.confirm = handleSubmit;
        optionsContainer.querySelectorAll('button').forEach((button, index) => {
            if (!button.disabled) actions['answer' + (index + 1)] = () => button.click();
        });
    }
    disposeControls = bindGameControls('paradox-blackwood', actions);
}
window.addEventListener('keydown', event => {
    if (evidenceModal.classList.contains('hidden')) return;
    if (event.key === 'Escape') closeEvidence();
    if (event.key === 'Tab') {
        event.preventDefault();
        closeIndictmentModal.focus();
    }
});
window.addEventListener('pagehide', () => clearTimeout(transitionTimer));
initGame();
