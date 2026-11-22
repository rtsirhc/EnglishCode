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
let caseStatus = "Active";

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
        validation: (text) => {
            const requiredWords = ['at', 'into', 'onto', 'off', 'in', 'on'];
            const lowerText = text.toLowerCase();
            const missed = requiredWords.filter(word => !lowerText.includes(word));
            return {
                valid: missed.length === 0,
                message: missed.length === 0 ? "Excellent work. The path is clear." : `The evidence is incomplete. You missed: ${missed.join(', ')}.`
            };
        }
    },
    2: {
        title: "The Tense Timeline",
        narrative: "With the entry point established, you turn your attention to the suspects. Three people were in the manor tonight. One is lying about their timeline. Listen closely to their alibis.",
        task: "Identify the liar based on their incorrect use of tenses (Simple Past vs Past Perfect).",
        type: "choice",
        options: [
            { text: "The Butler: 'I was polishing the silver when I heard the scream. I had finished dinner service an hour before.'", correct: false },
            { text: "The Maid: 'I arrived at the study at 9 PM. But Lord Blackwood was already dead. I saw him through the keyhole.'", correct: false },
            { text: "The Nephew: 'I didn't do it! I arrived at 8:30 PM. Before that, I met my friend at the pub.'", correct: true }
        ],
        validation: (choiceIndex) => {
            return {
                valid: choiceIndex === 2,
                message: choiceIndex === 2 ? "Correct. He said 'I met', but since it happened *before* he arrived (which is also past), he should have said 'I had met'. The timeline doesn't add up!" : "That alibi seems grammatically consistent. Try again."
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
            { q: "'When I arrived, the train left.' - Did wait for me?", options: ["Yes (implied)", "No (implied it left simultaneously or just after)"], answer: 1 } // Trying to be precise here.
        ],
        currentQuestion: 0
    },
    4: {
        title: "The Final Report",
        narrative: "The phone unlocks. It reveals a text message sent at 8:25 PM: 'The old man is finished.' You have the motive, the method, and the opportunity. Now, you must file the official indictment.",
        task: "Write a 100-word indictment. Use at least 5 of the prepositions (at, into, onto, off, in, on) and at least 3 sentences in the Past Perfect.",
        type: "text",
        validation: (text) => {
            const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
            const preps = ['at', 'into', 'onto', 'off', 'in', 'on'];
            const lowerText = text.toLowerCase();
            const prepCount = preps.reduce((count, p) => lowerText.includes(p) ? count + 1 : count, 0);
            const pastPerfectCount = (lowerText.match(/had\s+\w+/g) || []).length;

            if (wordCount < 50) return { valid: false, message: `Report too short (${wordCount}/100 words). Elaborate on the details.` };
            if (prepCount < 5) return { valid: false, message: `Not enough key prepositions used (found approx ${prepCount}). Needed 5.` }; // Lenient count
            if (pastPerfectCount < 3) return { valid: false, message: `You need more Past Perfect sentences (found approx ${pastPerfectCount}/3). Use 'had + verb'.` };

            return { valid: true, message: "Indictment Filed. The case is closed." };
        }
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
    1: { id: "evidence-slot-1", text: "<strong>Path Established:</strong><br>Killer entered via the <em>front gate</em>, moved <em>into</em> the rose garden, climbed <em>onto</em> the balcony, and entered <em>in</em> the study room." },
    2: { id: "evidence-slot-2", text: "<strong>Suspect Identified:</strong><br>The Nephew lied. He used the Simple Past ('met') for an earlier action, contradicting the sequence. He arrived *after* the murder." },
    3: { id: "evidence-slot-3", text: "<strong>Decrypted Message:</strong><br><em>'The old man is finished.'</em> Sent at 8:25 PM.<br>Motive confirmed." }
};

function initGame() {
    renderPhase(0);

    submitBtn.addEventListener('click', handleSubmit);
    nextBtn.addEventListener('click', nextPhase);

    viewEvidenceBtn.addEventListener('click', () => {
        evidenceModal.classList.remove('hidden');
    });

    closeIndictmentModal.addEventListener('click', () => {
        evidenceModal.classList.add('hidden');
    });

    window.addEventListener('click', (event) => {
        if (event.target === evidenceModal) {
            evidenceModal.classList.add('hidden');
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
        viewEvidenceBtn.style.color = 'var(--success-color)';
        setTimeout(() => viewEvidenceBtn.style.color = '', 1000);
    }
}

function renderPhase(phaseIndex) {
    currentPhase = phaseIndex;
    const phaseData = phases[phaseIndex];

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
    }
}

function renderTrivia(qIndex) {
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
}

function handleTriviaAnswer(qIndex, choiceIndex) {
    const phaseData = phases[3];
    const q = phaseData.questions[qIndex];
    if (choiceIndex === q.answer) {
        showFeedback("Correct.", "success");
        setTimeout(() => {
            if (qIndex + 1 < phaseData.questions.length) {
                renderTrivia(qIndex + 1);
                feedback.classList.add('hidden');
            } else {
                showFeedback("Access Granted. All encryptions bypassed.", "success");
                submitBtn.classList.add('hidden');
                nextBtn.classList.remove('hidden');
            }
        }, 1000);
    } else {
        showFeedback("Access Denied. Incorrect answer.", "error");
    }
}

function handleChoice(choiceIndex) {
    const result = phases[currentPhase].validation(choiceIndex);
    if (result.valid) {
        showFeedback(result.message, "success");
        submitBtn.classList.add('hidden');
        nextBtn.classList.remove('hidden');
        const btns = optionsContainer.querySelectorAll('button');
        btns.forEach(b => b.disabled = true);
    } else {
        showFeedback(result.message, "error");
    }
}

function handleSubmit() {
    if (currentPhase === 0) {
        nextPhase();
        return;
    }

    if (phases[currentPhase].type === 'text') {
        const text = textInput.value;
        const result = phases[currentPhase].validation(text);
        if (result.valid) {
            showFeedback(result.message, "success");
            submitBtn.classList.add('hidden');
            nextBtn.classList.remove('hidden');
        } else {
            showFeedback(result.message, "error");
        }
    }
}

function nextPhase() {
    // Unlock evidence for the phase we just finished
    unlockEvidence(currentPhase);
    renderPhase(currentPhase + 1);
}

function showFeedback(msg, type) {
    feedback.textContent = msg;
    feedback.classList.remove('hidden');
    feedback.className = `feedback-msg feedback-${type}`;
}

initGame();
