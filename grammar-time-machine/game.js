import { bindGameControls } from '../gallery/shared/runtime.js';
const chapterTimers = new Set();
let disposeControls = () => {};
function chapterDelay(callback, delay) {
    const timer = setTimeout(() => {
        chapterTimers.delete(timer);
        callback();
    }, delay);
    chapterTimers.add(timer);
}

    // ==================== STATE ====================
    let currentChapter = 0;
    const totalChapters = 7;

    // Chapter 2 state
    let ch2Selected = null;
    let ch2Matches = {};
    const ch2Pairs = { 'I': 'Am', 'You': 'Are', 'She': 'Is', 'They': 'Are' };

    // Chapter 3 state
    let ch3Current = 0;
    const ch3Questions = [
        { blank: '___', subject: 'Timmy', verb: 'like apples', answer: 'Does', emoji: '🍎' },
        { blank: '___', subject: 'you', verb: 'play soccer', answer: 'Do', emoji: '⚽' },
        { blank: '___', subject: 'they', verb: 'go to school', answer: 'Do', emoji: '🏫' },
        { blank: '___', subject: 'she', verb: 'eat breakfast', answer: 'Does', emoji: '🥣' },
        { blank: '___', subject: 'we', verb: 'have a pet', answer: 'Do', emoji: '🐶' },
        { blank: '___', subject: 'he', verb: 'speak English', answer: 'Does', emoji: '🗣️' },
    ];

    // Chapter 5 state
    let ch5Current = 0;
    const ch5Scenes = [
        { cat: 'inside', answer: 'In', desc: 'The cat is inside the box!', visual: '📦🐱' },
        { cat: 'on', answer: 'On', desc: 'The cat is sitting on the box!', visual: '<div class="relative inline-block"><span class="text-6xl">📦</span><span class="text-4xl absolute -top-8 left-3">🐱</span></div>' },
        { cat: 'under', answer: 'Under', desc: 'The cat is hiding under the box!', visual: '<div class="relative inline-block"><span class="text-6xl">📦</span><span class="text-4xl absolute -bottom-6 left-3 opacity-70">🐱</span></div>' },
        { cat: 'next-to', answer: 'Next To', desc: 'The cat is next to the box!', visual: '<span class="text-6xl">📦</span><span class="text-5xl ml-2">🐱</span>' },
    ];

    // Chapter 6 state
    let ch6Selected = null;
    let ch6Matches = {};
    const ch6Pairs = { 'I': 'My', 'You': 'Your', 'He': 'His', 'She': 'Her', 'We': 'Our', 'They': 'Their' };

    // Chapter 7 state
    let isGrayscale = false;

    // ==================== RENDER ====================
    function renderProgressDots() {
        const container = document.getElementById('progress-dots');
        const chapterNames = ['Present', 'To Be', 'Do/Does', 'Is/Are', 'Prepositions', 'Possessives', 'Past'];
        const colors = ['bg-storybook-accent1', 'bg-storybook-accent2', 'bg-storybook-accent3', 'bg-storybook-accent4', 'bg-storybook-accent5', 'bg-storybook-accent6', 'bg-storybook-accent7'];
        container.innerHTML = chapterNames.map((name, i) => `
            <button onclick="goToChapter(${i})" class="chapter-dot flex flex-col items-center gap-1 group" title="Chapter ${i+1}">
                <div class="w-4 h-4 md:w-5 md:h-5 rounded-full ${i === currentChapter ? colors[i] + ' active shadow-lg' : (i < currentChapter ? colors[i] + ' opacity-50' : 'bg-gray-200')} transition-all"></div>
                <span class="text-[10px] md:text-xs font-semibold ${i === currentChapter ? 'text-storybook-dark' : 'text-gray-400'} group-hover:text-storybook-dark transition-colors">${name}</span>
            </button>
        `).join('');
    }

    function updateNav() {
        document.getElementById('prev-btn').disabled = currentChapter === 0;
        document.getElementById('next-btn').disabled = currentChapter === totalChapters - 1;
        document.getElementById('page-indicator').textContent = `Chapter ${currentChapter + 1} of ${totalChapters}`;
    }

    function goToChapter(index) {
        currentChapter = index;
        renderChapter();
    }
    function prevChapter() { if (currentChapter > 0) { currentChapter--; renderChapter(); } }
    function nextChapter() { if (currentChapter < totalChapters - 1) { currentChapter++; renderChapter(); } }

    function renderChapter() {
        for (const timer of chapterTimers) clearTimeout(timer);
        chapterTimers.clear();
        isGrayscale = false;
        document.body.classList.remove('grayscale-mode');
        renderProgressDots();
        updateNav();
        const el = document.getElementById('chapter-content');
        el.scrollTop = 0;
        const chapters = [renderCh1, renderCh2, renderCh3, renderCh4, renderCh5, renderCh6, renderCh7];
        el.innerHTML = `<div class="page-enter">${chapters[currentChapter]()}</div>`;
        if (currentChapter === 2) renderCh3Question();
        if (currentChapter === 4) renderCh5Scene();
        updateControls();
    }

    // ==================== CHAPTER 1: Simple Present ====================
    function renderCh1() {
        return `
        <div class="text-center mb-6">
            <span class="text-6xl inline-block animate-float">👦</span>
            <h2 class="font-bubblegum text-3xl md:text-4xl text-storybook-accent1 mt-2">Chapter 1: Simple Present</h2>
            <p class="text-lg text-gray-500 mt-1">Meet Timmy and his Daily Routine!</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div class="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 text-center border-2 border-yellow-200 shadow-sm">
                <span class="text-5xl block mb-3">☀️</span>
                <p class="text-xl font-bold text-storybook-dark">Timmy <span class="text-storybook-accent2">wake<span class="super-s">s</span></span> up.</p>
                <p class="text-sm text-gray-400 mt-1">Every morning!</p>
            </div>
            <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 text-center border-2 border-green-200 shadow-sm">
                <span class="text-5xl block mb-3">🍎</span>
                <p class="text-xl font-bold text-storybook-dark">He <span class="text-storybook-accent2">eat<span class="super-s">s</span></span> an apple.</p>
                <p class="text-sm text-gray-400 mt-1">For breakfast!</p>
            </div>
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 text-center border-2 border-blue-200 shadow-sm">
                <span class="text-5xl block mb-3">⚽</span>
                <p class="text-xl font-bold text-storybook-dark">He <span class="text-storybook-accent2">play<span class="super-s">s</span></span> soccer.</p>
                <p class="text-sm text-gray-400 mt-1">After school!</p>
            </div>
        </div>

        <!-- Super S Rule -->
        <div class="bg-gradient-to-r from-red-50 via-pink-50 to-red-50 rounded-2xl p-6 border-2 border-red-200 text-center">
            <h3 class="font-bubblegum text-2xl text-storybook-accent1 mb-3">⭐ The Super S Rule! ⭐</h3>
            <p class="text-lg mb-4 text-storybook-dark"><strong>He</strong>, <strong>She</strong>, and <strong>It</strong> need a <span class="super-s">Super S</span> at the end of the verb!</p>
            <div class="flex flex-wrap justify-center gap-4 text-lg">
                <div class="bg-white rounded-xl px-5 py-3 shadow-sm border border-gray-100">
                    <span class="text-gray-400">I</span> play ✅
                </div>
                <div class="bg-white rounded-xl px-5 py-3 shadow-sm border border-gray-100">
                    <span class="text-gray-400">You</span> play ✅
                </div>
                <div class="bg-white rounded-xl px-5 py-3 shadow-sm border border-red-200 ring-2 ring-red-100">
                    <span class="font-bold text-storybook-accent1">He</span> play<span class="super-s">s</span> 🌟
                </div>
                <div class="bg-white rounded-xl px-5 py-3 shadow-sm border border-red-200 ring-2 ring-red-100">
                    <span class="font-bold text-storybook-accent1">She</span> play<span class="super-s">s</span> 🌟
                </div>
                <div class="bg-white rounded-xl px-5 py-3 shadow-sm border border-gray-100">
                    <span class="text-gray-400">We</span> play ✅
                </div>
                <div class="bg-white rounded-xl px-5 py-3 shadow-sm border border-gray-100">
                    <span class="text-gray-400">They</span> play ✅
                </div>
            </div>
        </div>
        `;
    }

    // ==================== CHAPTER 2: Verb To Be ====================
    function renderCh2() {
        ch2Selected = null;
        ch2Matches = {};
        return `
        <div class="text-center mb-6">
            <span class="text-5xl inline-block animate-wiggle">🪪</span>
            <h2 class="font-bubblegum text-3xl md:text-4xl text-storybook-accent2 mt-2">Chapter 2: Verb To Be</h2>
            <p class="text-lg text-gray-500 mt-1">Identity Badges — Am, Is, Are!</p>
        </div>

        <!-- Explanation -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div class="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-5 text-center border-2 border-teal-200">
                <p class="text-3xl mb-2">🙋</p>
                <p class="font-bold text-xl text-teal-700">I <span class="text-storybook-accent1">am</span></p>
                <p class="text-sm text-gray-500 mt-1">Only for "I"!</p>
            </div>
            <div class="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-5 text-center border-2 border-purple-200">
                <p class="text-3xl mb-2">👤 👧 🐕</p>
                <p class="font-bold text-xl text-purple-700">He / She / It <span class="text-storybook-accent1">is</span></p>
                <p class="text-sm text-gray-500 mt-1">One person or thing!</p>
            </div>
            <div class="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl p-5 text-center border-2 border-blue-200">
                <p class="text-3xl mb-2">👫 👥 👉</p>
                <p class="font-bold text-xl text-blue-700">You / We / They <span class="text-storybook-accent1">are</span></p>
                <p class="text-sm text-gray-500 mt-1">You or many people!</p>
            </div>
        </div>

        <!-- Matching Game -->
        <div class="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-6 border-2 border-teal-200">
            <h3 class="font-bubblegum text-xl text-center text-teal-700 mb-1">🎮 Match the Subject to the Verb!</h3>
            <p class="text-center text-sm text-gray-500 mb-4">Click a subject, then click the correct verb.</p>
            <div id="ch2-game" class="flex flex-col md:flex-row justify-center gap-6 items-center">
                <div class="flex flex-wrap justify-center gap-3">
                    ${Object.keys(ch2Pairs).map(s => `
                        <button class="match-card bg-white rounded-xl px-6 py-3 border-2 border-teal-200 text-lg font-bold text-teal-700"
                             id="ch2-subj-${s}" onclick="ch2SelectSubject('${s}')">${s}</button>
                    `).join('')}
                </div>
                <span class="text-2xl text-gray-300 hidden md:inline">➜</span>
                <div class="flex flex-wrap justify-center gap-3">
                    ${['Am', 'Is', 'Are'].map(v => `
                        <button class="match-card bg-white rounded-xl px-6 py-3 border-2 border-purple-200 text-lg font-bold text-purple-700"
                             id="ch2-verb-${v}" onclick="ch2SelectVerb('${v}')">${v}</button>
                    `).join('')}
                </div>
            </div>
            <div id="ch2-feedback" class="text-center mt-4 text-lg font-bold"></div>
        </div>
        `;
    }

    function ch2SelectSubject(subj) {
        if (ch2Matches[subj]) return;
        document.querySelectorAll('[id^="ch2-subj-"]').forEach(el => el.classList.remove('selected'));
        document.getElementById(`ch2-subj-${subj}`).classList.add('selected');
        ch2Selected = subj;
    }

    function ch2SelectVerb(verb) {
        if (!ch2Selected) {
            document.getElementById('ch2-feedback').innerHTML = '👆 Pick a subject first!';
            return;
        }
        const subj = ch2Selected;
        const correct = ch2Pairs[subj];
        const subjEl = document.getElementById(`ch2-subj-${subj}`);
        const verbEl = document.getElementById(`ch2-verb-${verb}`);
        if (verb === correct) {
            subjEl.classList.remove('selected');
            subjEl.classList.add('correct', 'matched');
            ch2Matches[subj] = true;
            document.getElementById('ch2-feedback').innerHTML = `✅ "${subj}" + "${verb}" is correct! Great job!`;
        } else {
            subjEl.classList.remove('selected');
            subjEl.classList.add('incorrect');
            chapterDelay(() => subjEl.classList.remove('incorrect'), 600);
            document.getElementById('ch2-feedback').innerHTML = `❌ Try again! "${subj}" doesn't go with "${verb}".`;
        }
        ch2Selected = null;
        // Check win
        if (Object.keys(ch2Matches).length === Object.keys(ch2Pairs).length) {
            chapterDelay(() => {
                document.getElementById('ch2-feedback').innerHTML = '🎉🎉 You matched them all! Amazing! 🎉🎉';
            }, 500);
        }
    }

    // ==================== CHAPTER 3: Do / Does ====================
    function renderCh3() {
        ch3Current = 0;
        return `
        <div class="text-center mb-6">
            <span class="text-5xl inline-block animate-float">❓</span>
            <h2 class="font-bubblegum text-3xl md:text-4xl text-storybook-accent3 mt-2" style="color: #E6A800;">Chapter 3: Do / Does</h2>
            <p class="text-lg text-gray-500 mt-1">Timmy wants to ask questions!</p>
        </div>

        <!-- Rule -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div class="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-5 border-2 border-amber-200 text-center">
                <p class="font-bubblegum text-xl text-amber-700 mb-2">DO ✋</p>
                <p class="text-lg"><strong>I / You / We / They</strong></p>
                <p class="text-sm text-gray-500 mt-1">The big group!</p>
            </div>
            <div class="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-5 border-2 border-orange-200 text-center">
                <p class="font-bubblegum text-xl text-orange-700 mb-2">DOES 🌟</p>
                <p class="text-lg"><strong>He / She / It</strong></p>
                <p class="text-sm text-gray-500 mt-1">The Super S group!</p>
            </div>
        </div>

        <!-- Quiz -->
        <div class="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6 border-2 border-yellow-200" id="ch3-quiz">
            <h3 class="font-bubblegum text-xl text-center text-amber-800 mb-4">🧪 Quiz Time! Pick DO or DOES</h3>
            <div id="ch3-question"></div>
        </div>
        `;
    }

    function renderCh3Question() {
        if (ch3Current >= ch3Questions.length) {
            document.getElementById('ch3-question').innerHTML = `
                <div class="text-center py-6">
                    <span class="text-5xl">🏆</span>
                    <p class="font-bubblegum text-2xl text-amber-700 mt-3">You finished the quiz! Amazing! 🎉</p>
                </div>`;
            return;
        }
        const q = ch3Questions[ch3Current];
        document.getElementById('ch3-question').innerHTML = `
            <div class="text-center page-enter">
                <span class="text-4xl mb-3 block">${q.emoji}</span>
                <p class="text-2xl font-bold text-storybook-dark mb-6">
                    <span class="bg-amber-200 px-3 py-1 rounded-lg text-amber-800" id="ch3-blank">___</span>
                    ${q.subject} ${q.verb}?
                </p>
                <div class="flex justify-center gap-4">
                    <button class="quiz-btn bg-white border-2 border-amber-300 rounded-full px-8 py-3 text-xl font-bold text-amber-700 shadow-sm hover:shadow-md" onclick="ch3Answer('Do')">DO</button>
                    <button class="quiz-btn bg-white border-2 border-orange-300 rounded-full px-8 py-3 text-xl font-bold text-orange-700 shadow-sm hover:shadow-md" onclick="ch3Answer('Does')">DOES</button>
                </div>
                <p class="text-sm text-gray-400 mt-3">Question ${ch3Current + 1} of ${ch3Questions.length}</p>
            </div>`;
    }

    function ch3Answer(choice) {
        const q = ch3Questions[ch3Current];
        if (!q || chapterTimers.size) return;
        const btns = document.querySelectorAll('.quiz-btn');
        btns.forEach(b => b.disabled = true);

        if (choice === q.answer) {
            document.getElementById('ch3-blank').textContent = choice;
            document.getElementById('ch3-blank').classList.add('bg-green-300', 'text-green-900');
            btns.forEach(b => { if (b.textContent.trim().toLowerCase() === choice.toLowerCase()) b.classList.add('correct-answer'); });
            chapterDelay(() => { ch3Current++; renderCh3Question(); }, 1200);
        } else {
            btns.forEach(b => { if (b.textContent.trim().toLowerCase() === choice.toLowerCase()) b.classList.add('wrong-answer'); });
            chapterDelay(() => {
                btns.forEach(b => { b.classList.remove('wrong-answer'); b.disabled = false; });
            }, 800);
        }
    }

    // ==================== CHAPTER 4: There Is / There Are ====================
    function renderCh4() {
        return `
        <div class="text-center mb-6">
            <span class="text-5xl inline-block animate-bounce-in">🔢</span>
            <h2 class="font-bubblegum text-3xl md:text-4xl text-storybook-accent4 mt-2">Chapter 4: There Is / There Are</h2>
            <p class="text-lg text-gray-500 mt-1">The Counter — How many are there?</p>
        </div>

        <!-- Rule -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border-2 border-violet-200 text-center">
                <p class="text-6xl mb-3">🍎</p>
                <p class="font-bubblegum text-2xl text-violet-700">There <span class="text-storybook-accent1 underline">is</span></p>
                <p class="text-lg text-gray-600 mt-1"><strong>1</strong> apple.</p>
                <div class="mt-3 inline-block bg-violet-100 rounded-full px-4 py-1 text-sm font-bold text-violet-700">= ONE thing</div>
            </div>
            <div class="bg-gradient-to-br from-fuchsia-50 to-pink-50 rounded-2xl p-6 border-2 border-fuchsia-200 text-center">
                <p class="text-6xl mb-3">🍎🍎🍎</p>
                <p class="font-bubblegum text-2xl text-fuchsia-700">There <span class="text-storybook-accent1 underline">are</span></p>
                <p class="text-lg text-gray-600 mt-1"><strong>3</strong> apples.</p>
                <div class="mt-3 inline-block bg-fuchsia-100 rounded-full px-4 py-1 text-sm font-bold text-fuchsia-700">= TWO or MORE</div>
            </div>
        </div>

        <!-- More Examples -->
        <div class="bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50 rounded-2xl p-6 border-2 border-purple-200">
            <h3 class="font-bubblegum text-xl text-center text-purple-700 mb-4">More Examples! 🌈</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="bg-white rounded-xl p-4 text-center shadow-sm border border-purple-100">
                    <p class="text-3xl">🐱</p>
                    <p class="text-lg mt-1">There <strong class="text-storybook-accent4">is</strong> a cat.</p>
                </div>
                <div class="bg-white rounded-xl p-4 text-center shadow-sm border border-purple-100">
                    <p class="text-3xl">🐱🐱🐱🐱🐱</p>
                    <p class="text-lg mt-1">There <strong class="text-storybook-accent4">are</strong> five cats.</p>
                </div>
                <div class="bg-white rounded-xl p-4 text-center shadow-sm border border-purple-100">
                    <p class="text-3xl">📚</p>
                    <p class="text-lg mt-1">There <strong class="text-storybook-accent4">is</strong> a book.</p>
                </div>
                <div class="bg-white rounded-xl p-4 text-center shadow-sm border border-purple-100">
                    <p class="text-3xl">🌳🌳</p>
                    <p class="text-lg mt-1">There <strong class="text-storybook-accent4">are</strong> two trees.</p>
                </div>
            </div>
            <p class="text-center text-sm text-gray-500 mt-4">💡 Remember: <strong>Is = 1</strong> &nbsp;|&nbsp; <strong>Are = 2+</strong></p>
        </div>
        `;
    }

    // ==================== CHAPTER 5: Prepositions ====================
    function renderCh5() {
        ch5Current = 0;
        return `
        <div class="text-center mb-6">
            <span class="text-5xl inline-block animate-float">🐱</span>
            <h2 class="font-bubblegum text-3xl md:text-4xl text-storybook-accent5 mt-2">Chapter 5: Prepositions</h2>
            <p class="text-lg text-gray-500 mt-1">The Hiding Game — Where is the cat?</p>
        </div>

        <!-- Explanation -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div class="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 text-center border-2 border-pink-200">
                <p class="text-3xl mb-1">📦🐱</p>
                <p class="font-bold text-pink-700">IN</p>
                <p class="text-xs text-gray-500">Inside!</p>
            </div>
            <div class="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 text-center border-2 border-pink-200">
                <p class="text-3xl mb-1 relative">📦<span class="absolute -top-1 left-1/2 -translate-x-1/2 text-xl">🐱</span></p>
                <p class="font-bold text-pink-700 mt-2">ON</p>
                <p class="text-xs text-gray-500">On top!</p>
            </div>
            <div class="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 text-center border-2 border-pink-200">
                <p class="text-3xl mb-1">📦<br><span class="text-xl opacity-70">🐱</span></p>
                <p class="font-bold text-pink-700">UNDER</p>
                <p class="text-xs text-gray-500">Below!</p>
            </div>
            <div class="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 text-center border-2 border-pink-200">
                <p class="text-3xl mb-1">📦 🐱</p>
                <p class="font-bold text-pink-700">NEXT TO</p>
                <p class="text-xs text-gray-500">Beside!</p>
            </div>
        </div>

        <!-- Game -->
        <div class="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border-2 border-pink-200" id="ch5-game">
            <h3 class="font-bubblegum text-xl text-center text-pink-700 mb-2">🎮 Where is the cat? 🐱</h3>
            <div id="ch5-scene"></div>
        </div>
        `;
    }

    function renderCh5Scene() {
        if (ch5Current >= ch5Scenes.length) {
            document.getElementById('ch5-scene').innerHTML = `
                <div class="text-center py-6 page-enter">
                    <span class="text-5xl">🎉</span>
                    <p class="font-bubblegum text-2xl text-pink-700 mt-3">You found the cat every time! 🐱✨</p>
                </div>`;
            return;
        }
        const scene = ch5Scenes[ch5Current];
        document.getElementById('ch5-scene').innerHTML = `
            <div class="text-center page-enter">
                <div class="my-6 text-6xl">${scene.visual}</div>
                <div class="flex flex-wrap justify-center gap-3 mt-4">
                    ${['In', 'On', 'Under', 'Next To'].map(p => `
                        <button class="quiz-btn bg-white border-2 border-pink-300 rounded-full px-6 py-3 text-lg font-bold text-pink-700 shadow-sm hover:shadow-md" onclick="ch5Answer('${p}')">${p}</button>
                    `).join('')}
                </div>
                <p class="text-sm text-gray-400 mt-3">Round ${ch5Current + 1} of ${ch5Scenes.length}</p>
                <div id="ch5-feedback" class="mt-3 text-lg font-bold"></div>
            </div>`;
    }

    function ch5Answer(choice) {
        const scene = ch5Scenes[ch5Current];
        if (!scene || chapterTimers.size) return;
        const btns = document.querySelectorAll('#ch5-scene .quiz-btn');
        btns.forEach(b => b.disabled = true);
        if (choice === scene.answer) {
            btns.forEach(b => { if (b.textContent.trim().toLowerCase() === choice.toLowerCase()) b.classList.add('correct-answer'); });
            document.getElementById('ch5-feedback').innerHTML = `✅ Correct! ${scene.desc}`;
            chapterDelay(() => { ch5Current++; renderCh5Scene(); }, 1500);
        } else {
            btns.forEach(b => { if (b.textContent.trim().toLowerCase() === choice.toLowerCase()) b.classList.add('wrong-answer'); });
            document.getElementById('ch5-feedback').innerHTML = `❌ Not quite! Try again!`;
            chapterDelay(() => {
                btns.forEach(b => { b.classList.remove('wrong-answer'); b.disabled = false; });
                document.getElementById('ch5-feedback').innerHTML = '';
            }, 800);
        }
    }

    // ==================== CHAPTER 6: Possessives ====================
    function renderCh6() {
        ch6Selected = null;
        ch6Matches = {};
        return `
        <div class="text-center mb-6">
            <span class="text-5xl inline-block animate-sparkle">👑</span>
            <h2 class="font-bubblegum text-3xl md:text-4xl text-storybook-accent6 mt-2">Chapter 6: Possessives</h2>
            <p class="text-lg text-gray-500 mt-1">The Ownership Game — My, Your, His...</p>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto mb-6">
            <table class="verb-table w-full max-w-md mx-auto text-lg rounded-xl overflow-hidden border-2 border-green-200">
                <thead>
                    <tr class="bg-gradient-to-r from-green-100 to-emerald-100">
                        <th class="px-6 py-3 text-green-800 font-bubblegum">Subject</th>
                        <th class="px-6 py-3 text-green-800 font-bubblegum">Possessive</th>
                    </tr>
                </thead>
                <tbody class="bg-white">
                    ${Object.entries(ch6Pairs).map(([s, p]) => `
                        <tr class="border-t border-green-100">
                            <td class="px-6 py-2 text-center font-bold">${s}</td>
                            <td class="px-6 py-2 text-center font-bold text-storybook-accent6">${p}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <!-- Matching Game -->
        <div class="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border-2 border-emerald-200">
            <h3 class="font-bubblegum text-xl text-center text-emerald-700 mb-1">🎮 Match the Subject to its Possessive!</h3>
            <p class="text-center text-sm text-gray-500 mb-4">Click a subject, then click the possessive.</p>
            <div class="flex flex-col md:flex-row justify-center gap-6 items-center">
                <div class="flex flex-wrap justify-center gap-2">
                    ${Object.keys(ch6Pairs).map(s => `
                        <button class="match-card bg-white rounded-xl px-5 py-2 border-2 border-emerald-200 text-base font-bold text-emerald-700"
                             id="ch6-subj-${s}" onclick="ch6SelectSubject('${s}')">${s}</button>
                    `).join('')}
                </div>
                <span class="text-2xl text-gray-300 hidden md:inline">➜</span>
                <div class="flex flex-wrap justify-center gap-2">
                    ${Object.values(ch6Pairs).map(p => `
                        <button class="match-card bg-white rounded-xl px-5 py-2 border-2 border-lime-200 text-base font-bold text-lime-700"
                             id="ch6-poss-${p}" onclick="ch6SelectPoss('${p}')">${p}</button>
                    `).join('')}
                </div>
            </div>
            <div id="ch6-feedback" class="text-center mt-4 text-lg font-bold"></div>
        </div>
        `;
    }

    function ch6SelectSubject(subj) {
        if (ch6Matches[subj]) return;
        document.querySelectorAll('[id^="ch6-subj-"]').forEach(el => el.classList.remove('selected'));
        document.getElementById(`ch6-subj-${subj}`).classList.add('selected');
        ch6Selected = subj;
    }

    function ch6SelectPoss(poss) {
        if (!ch6Selected) {
            document.getElementById('ch6-feedback').innerHTML = '👆 Pick a subject first!';
            return;
        }
        const subj = ch6Selected;
        const correct = ch6Pairs[subj];
        const subjEl = document.getElementById(`ch6-subj-${subj}`);

        if (poss === correct) {
            subjEl.classList.remove('selected');
            subjEl.classList.add('correct', 'matched');
            document.getElementById(`ch6-poss-${poss}`).classList.add('correct', 'matched');
            ch6Matches[subj] = true;
            document.getElementById('ch6-feedback').innerHTML = `✅ "${subj}" → "${poss}" is correct!`;
        } else {
            subjEl.classList.remove('selected');
            subjEl.classList.add('incorrect');
            chapterDelay(() => subjEl.classList.remove('incorrect'), 600);
            document.getElementById('ch6-feedback').innerHTML = `❌ Try again! "${poss}" doesn't belong to "${subj}".`;
        }
        ch6Selected = null;

        if (Object.keys(ch6Matches).length === Object.keys(ch6Pairs).length) {
            chapterDelay(() => {
                document.getElementById('ch6-feedback').innerHTML = '🎉🎉 Perfect matches! You own this topic! 👑🎉🎉';
            }, 500);
        }
    }

    // ==================== CHAPTER 7: Simple Past ====================
    function renderCh7() {
        return `
        <div class="text-center mb-6">
            <span class="text-5xl inline-block animate-float">⏳</span>
            <h2 class="font-bubblegum text-3xl md:text-4xl text-storybook-accent7 mt-2">Chapter 7: Simple Past</h2>
            <p class="text-lg text-gray-500 mt-1">The Time Machine — Let's travel to the past!</p>
        </div>

        <!-- Time Machine Button -->
        <div class="text-center mb-8">
            <button id="time-machine-toggle" class="time-machine-btn text-white font-bubblegum text-2xl px-10 py-5 rounded-full" onclick="toggleTimeMachine()">
                ${isGrayscale ? '🔄 RETURN TO PRESENT ☀️' : '⏳ ACTIVATE TIME MACHINE ⏳'}
            </button>
            <p id="tm-status" class="mt-3 text-lg font-bold ${isGrayscale ? 'text-gray-600' : 'text-storybook-accent7'}">${isGrayscale ? '🕰️ You are in the PAST! Everything is old and gray...' : '👆 Click to travel to the past!'}</p>
        </div>

        <!-- Regular Verbs -->
        <div class="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl p-6 border-2 border-blue-200 mb-6">
            <h3 class="font-bubblegum text-xl text-blue-700 mb-3">📝 Regular Verbs — Add "-ed"</h3>
            <p class="text-gray-600 mb-3">These verbs are polite! They just add <strong class="text-storybook-accent1">-ed</strong> to the end.</p>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                ${[
                    ['Walk','Walked'], ['Play','Played'], ['Talk','Talked'],
                    ['Jump','Jumped'], ['Cook','Cooked'], ['Clean','Cleaned'],
                    ['Watch','Watched'], ['Listen','Listened'], ['Help','Helped'],
                ].map(([base, past]) => `
                    <div class="bg-white rounded-lg px-3 py-2 text-center border border-blue-100 shadow-sm">
                        <span class="text-gray-500">${base}</span> → <strong class="text-blue-700">${past}</strong>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- Irregular Verbs -->
        <div class="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border-2 border-red-200 mb-6">
            <h3 class="font-bubblegum text-xl text-red-700 mb-3">🤪 Irregular Verbs — The Rebels!</h3>
            <p class="text-gray-600 mb-3">These verbs are rebels! They change completely. You have to <strong>memorize</strong> them! 🧠</p>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                ${[
                    ['Go','Went'], ['Eat','Ate'], ['Sleep','Slept'],
                    ['Drink','Drank'], ['See','Saw'], ['Buy','Bought'],
                    ['Come','Came'], ['Run','Ran'], ['Give','Gave'],
                    ['Take','Took'], ['Make','Made'], ['Think','Thought'],
                    ['Swim','Swam'], ['Read','Read'], ['Write','Wrote'],
                    ['Sing','Sang'], ['Sit','Sat'], ['Fly','Flew'],
                ].map(([base, past]) => `
                    <div class="bg-white rounded-lg px-3 py-2 text-center border border-red-100 shadow-sm">
                        <span class="text-gray-500">${base}</span> → <strong class="text-red-700">${past}</strong>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- Was / Were -->
        <div class="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border-2 border-purple-200">
            <h3 class="font-bubblegum text-xl text-purple-700 mb-3">🕰️ Was & Were — Past "To Be"</h3>
            <p class="text-gray-600 mb-3">Remember Am/Is/Are? In the past they become <strong>Was</strong> and <strong>Were</strong>!</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="bg-white rounded-xl p-4 border border-purple-100 text-center">
                    <p class="font-bubblegum text-lg text-purple-700 mb-2">WAS</p>
                    <p><strong>I</strong> was happy. 😊</p>
                    <p><strong>He / She / It</strong> was fun. 🎉</p>
                </div>
                <div class="bg-white rounded-xl p-4 border border-purple-100 text-center">
                    <p class="font-bubblegum text-lg text-purple-700 mb-2">WERE</p>
                    <p><strong>You</strong> were amazing! 🌟</p>
                    <p><strong>We / They</strong> were friends. 👫</p>
                </div>
            </div>
        </div>
        `;
    }

    function toggleTimeMachine() {
        isGrayscale = !isGrayscale;
        const body = document.body;
        const btn = document.getElementById('time-machine-toggle');
        const status = document.getElementById('tm-status');

        if (isGrayscale) {
            body.classList.add('grayscale-mode');
            btn.innerHTML = '🔄 RETURN TO PRESENT ☀️';
            status.textContent = '🕰️ WHOOSH! Traveling to the past... Everything is old and gray!';
            status.className = 'mt-3 text-lg font-bold text-gray-600';
            btn.classList.add('animate-whoosh');
            chapterDelay(() => btn.classList.remove('animate-whoosh'), 900);
        } else {
            body.classList.remove('grayscale-mode');
            btn.innerHTML = '⏳ ACTIVATE TIME MACHINE ⏳';
            status.textContent = '☀️ Welcome back to the PRESENT! Colors are back!';
            status.className = 'mt-3 text-lg font-bold text-storybook-accent7';
            btn.classList.add('animate-whoosh');
            chapterDelay(() => btn.classList.remove('animate-whoosh'), 900);
        }
    }


Object.assign(window, { ch2SelectSubject, ch2SelectVerb, ch3Answer, ch5Answer, ch6SelectPoss, ch6SelectSubject, goToChapter, nextChapter, prevChapter, toggleTimeMachine });
renderChapter();
function updateControls() {
    disposeControls();
    const actions = {};
    if (currentChapter < totalChapters - 1) actions.next = nextChapter;
    if ([2, 4].includes(currentChapter)) {
        for (let index = 0; index < (currentChapter === 2 ? 2 : 4); index++) {
            actions['answer' + (index + 1)] = () => {
                const button = document.querySelectorAll('#chapter-content .quiz-btn')[index];
                if (button && !button.disabled) button.click();
            };
        }
    }
    if (currentChapter === 6) actions.confirm = toggleTimeMachine;
    disposeControls = bindGameControls('grammar-time-machine', actions);
}
window.addEventListener('pagehide', () => {
    for (const timer of chapterTimers) clearTimeout(timer);
});
