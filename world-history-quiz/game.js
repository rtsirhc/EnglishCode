import { gameRuntime } from '/gallery/shared/runtime.js';
const runtime = gameRuntime('world-history-quiz', 'quiz', {
 answer1: () => chooseVisible(0), answer2: () => chooseVisible(1), answer3: () => chooseVisible(2), answer4: () => chooseVisible(3), answer5: () => chooseVisible(4), answer6: () => chooseVisible(5),
 confirm: () => { if (screens.boss.classList.contains('active')) submitBossAnswer(); }
});
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function chooseVisible(index) { if (screens.quiz.classList.contains('active') && !optionButtons[index]?.hidden && !optionButtons[index]?.disabled) selectAnswer(index); }
/* ═══════════════════════════════════════════
   WORLD HISTORY QUIZ — Game Logic
   100-question bank · 30-Q quiz · 10-Q Boss
   Timers · Leaderboards (localStorage)
   ═══════════════════════════════════════════ */

// ─── Question Bank ──────────────────────────
const QUESTION_BANK = [
  // Topic 1
  { q: "What is a primary characteristic of contemporary warfare?", options: ["Swords and shields", "Use of advanced technology and cyber tactics", "Line formations", "Cavalry charges"], answer: "Use of advanced technology and cyber tactics" },
  { q: "What term describes a war fought within a single country between its own citizens?", options: ["Cold War", "Proxy War", "Civil War", "World War"], answer: "Civil War" },
  { q: "Which of the following is often a root cause of modern conflicts?", options: ["Space exploration", "Resource scarcity and political instability", "Olympic games", "Agricultural surplus"], answer: "Resource scarcity and political instability" },
  { q: "What is a 'proxy war'?", options: ["A war fought in space", "A war fought through other countries instead of directly", "A war with no weapons", "A war fought entirely at sea"], answer: "A war fought through other countries instead of directly" },
  { q: "Which international organization was primarily created to prevent contemporary global wars?", options: ["The United Nations", "The World Bank", "The European Union", "The League of Nations"], answer: "The United Nations" },
  // Topic 2
  { q: "Which century saw the massive rise of global European empires?", options: ["15th Century", "17th Century", "19th Century", "21st Century"], answer: "19th Century" },
  { q: "What was the main economic driver that changed society during the 1800s?", options: ["Feudalism", "Industrialization", "Mercantilism", "Digital technology"], answer: "Industrialization" },
  { q: "Which political ideology grew rapidly in the 19th century, causing people to unite based on shared culture and language?", options: ["Nationalism", "Feudalism", "Anarchism", "Pacifism"], answer: "Nationalism" },
  { q: "The period before World War 1 in Europe was heavily marked by:", options: ["Peace and disarmament", "Imperial expansion and colonization", "The collapse of monarchies", "Space races"], answer: "Imperial expansion and colonization" },
  { q: "What new social class grew significantly during this period due to factories?", options: ["The nobility", "The clergy", "The working class", "The samurai"], answer: "The working class" },
  // Topic 3
  { q: "The Enlightenment is also commonly known as the Age of...?", options: ["Reason", "Empires", "Discovery", "Faith"], answer: "Reason" },
  { q: "Which philosopher argued that all people have natural rights like life, liberty, and property?", options: ["Thomas Hobbes", "John Locke", "Karl Marx", "Aristotle"], answer: "John Locke" },
  { q: "The Enlightenment challenged the absolute authority of:", options: ["Scientists", "Kings and the Church", "Peasants", "Merchants"], answer: "Kings and the Church" },
  { q: "Which idea did Montesquieu contribute to modern governments?", options: ["Divine Right of Kings", "Separation of powers", "Absolute monarchy", "Communism"], answer: "Separation of powers" },
  { q: "Which major historical event was directly inspired by Enlightenment ideas?", options: ["The Crusades", "The French Revolution", "The Fall of Rome", "The Black Death"], answer: "The French Revolution" },
  // Topic 4
  { q: "What is the primary goal of political liberalism?", options: ["Government control of business", "Protecting individual liberties and freedoms", "Establishing empires", "Expanding the military"], answer: "Protecting individual liberties and freedoms" },
  { q: "Who is considered the father of modern capitalism?", options: ["Karl Marx", "Adam Smith", "John Locke", "Voltaire"], answer: "Adam Smith" },
  { q: "In a capitalist economy, the means of production are owned by:", options: ["The government", "The military", "Private individuals and businesses", "The king"], answer: "Private individuals and businesses" },
  { q: "What 'invisible force' did Adam Smith say guides the free market?", options: ["The Invisible Hand", "The Divine Right", "The Iron Fist", "The Social Contract"], answer: "The Invisible Hand" },
  { q: "Liberalism heavily promoted the creation of which type of document to limit government power?", options: ["A Magna Carta", "A Constitution", "A Treaty", "A Manifesto"], answer: "A Constitution" },
  // Topic 5
  { q: "Which revolution started in 1789 and overthrew the absolute monarchy?", options: ["The Russian Revolution", "The French Revolution", "The Industrial Revolution", "The Scientific Revolution"], answer: "The French Revolution" },
  { q: "The American Revolution was fought by the 13 colonies against which empire?", options: ["Spanish Empire", "French Empire", "British Empire", "Ottoman Empire"], answer: "British Empire" },
  { q: "What was the main battle cry of the American Revolution regarding taxes?", options: ["Liberty, Equality, Fraternity", "No taxation without representation", "Workers of the world, unite!", "Give me liberty or give me death"], answer: "No taxation without representation" },
  { q: "The famous French document declaring equality is the Declaration of the Rights of...?", options: ["Man and of the Citizen", "Independence", "Women", "Kings"], answer: "Man and of the Citizen" },
  { q: "What was a major outcome of the liberal revolutions?", options: ["Kings gained more power", "The establishment of republics and democracies", "The end of global trade", "The rise of feudalism"], answer: "The establishment of republics and democracies" },
  // Topic 6
  { q: "Where did the Industrial Revolution begin?", options: ["France", "Great Britain", "The United States", "Germany"], answer: "Great Britain" },
  { q: "What invention was crucial to powering factories and trains during the Industrial Revolution?", options: ["The cotton gin", "The steam engine", "The telegraph", "The printing press"], answer: "The steam engine" },
  { q: "How did the Industrial Revolution change where people lived?", options: ["People moved from cities to farms", "People moved from farms to crowded cities (Urbanization)", "People moved to other continents", "People lived in nomadic tribes"], answer: "People moved from farms to crowded cities (Urbanization)" },
  { q: "What were the typical working conditions in early factories?", options: ["Short hours and high pay", "Safe, clean, and well-regulated", "Long hours, dangerous, and low pay", "Only adults were allowed to work"], answer: "Long hours, dangerous, and low pay" },
  { q: "Which industry was the first to be industrialized?", options: ["Automobile", "Textile (Clothing)", "Steel", "Chemical"], answer: "Textile (Clothing)" },
  // Topic 7
  { q: "The term 'great wars' generally refers to which conflicts?", options: ["The Napoleonic Wars", "World War I and World War II", "The Cold War", "The Punic Wars"], answer: "World War I and World War II" },
  { q: "What type of warfare characterized the Western Front in the First Great War?", options: ["Trench warfare", "Nuclear warfare", "Guerrilla warfare", "Naval blockades"], answer: "Trench warfare" },
  { q: "Which new technology was NOT used during the great wars?", options: ["Airplanes", "Tanks", "Poison Gas", "Drones"], answer: "Drones" },
  { q: "Both great wars involved a global alliance system. What were the two sides in WWII called?", options: ["Central Powers and Allies", "Axis and Allies", "NATO and Warsaw Pact", "Union and Confederacy"], answer: "Axis and Allies" },
  { q: "What was a massive global consequence of the great wars?", options: ["The expansion of European empires", "The destruction of Europe and the rise of the USA and USSR", "The return of absolute monarchs", "A century of total global peace"], answer: "The destruction of Europe and the rise of the USA and USSR" },
  // Topic 8
  { q: "What does the term 'Armed Peace' refer to?", options: ["The peace after WWII", "The tense decades before WWI where European countries built huge armies", "The Cold War era", "The era of the Roman Empire"], answer: "The tense decades before WWI where European countries built huge armies" },
  { q: "During the Armed Peace, countries formed secret...?", options: ["Trade agreements", "Alliances", "Democracies", "Colonies"], answer: "Alliances" },
  { q: "What is 'Militarism', a key feature of the Armed Peace?", options: ["Reducing the size of armies", "Glorifying military power and keeping an army prepared for war", "Relying on mercenaries", "Banning all weapons"], answer: "Glorifying military power and keeping an army prepared for war" },
  { q: "Which continent was heavily colonized during the Armed Peace, increasing tensions?", options: ["North America", "Africa", "Antarctica", "Australia"], answer: "Africa" },
  { q: "The Armed Peace created a situation often described as a...", options: ["Golden Age", "Powder Keg waiting to explode", "Utopia", "Reign of Terror"], answer: "Powder Keg waiting to explode" },
  // Topic 9
  { q: "What specific event triggered the start of World War 1?", options: ["The bombing of Pearl Harbor", "The assassination of Archduke Franz Ferdinand", "The invasion of Poland", "The sinking of the Lusitania"], answer: "The assassination of Archduke Franz Ferdinand" },
  { q: "What year did World War 1 begin?", options: ["1914", "1918", "1939", "1899"], answer: "1914" },
  { q: "Which countries made up the Central Powers in WW1?", options: ["USA, Britain, France", "Germany, Austria-Hungary, Ottoman Empire", "Japan, Italy, Germany", "Russia, France, Serbia"], answer: "Germany, Austria-Hungary, Ottoman Empire" },
  { q: "What area between opposing trenches was incredibly deadly to cross?", options: ["No Man's Land", "The Dead Zone", "The Iron Curtain", "The DMZ"], answer: "No Man's Land" },
  { q: "Why did the United States enter World War 1 in 1917?", options: ["To conquer territory", "Unrestricted submarine warfare by Germany and the Zimmermann Telegram", "To stop the French Revolution", "To protect its colonies in Africa"], answer: "Unrestricted submarine warfare by Germany and the Zimmermann Telegram" },
  // Topic 10
  { q: "The Treaty of Versailles officially ended which war?", options: ["World War I", "World War II", "The Cold War", "The Franco-Prussian War"], answer: "World War I" },
  { q: "Which country was forced to accept full blame for the war in the treaty?", options: ["Austria-Hungary", "Germany", "Russia", "Serbia"], answer: "Germany" },
  { q: "What are 'reparations'?", options: ["Land given to the winner", "Massive financial payments forced on the loser to pay for war damages", "Treaties of friendship", "Military bases"], answer: "Massive financial payments forced on the loser to pay for war damages" },
  { q: "How did the Treaty of Versailles affect the German military?", options: ["It made it stronger", "It severely restricted its size and banned certain weapons", "It had no effect", "It forced them to join the Allies"], answer: "It severely restricted its size and banned certain weapons" },
  { q: "What international organization was created by the treaty to maintain peace (but ultimately failed)?", options: ["The United Nations", "The League of Nations", "NATO", "The European Union"], answer: "The League of Nations" },
  // Topic 11
  { q: "What event caused Great Britain and France to declare war on Germany, starting WWII?", options: ["The bombing of London", "The invasion of Poland in 1939", "The assassination of Hitler", "The attack on Pearl Harbor"], answer: "The invasion of Poland in 1939" },
  { q: "Who was the fascist dictator of Germany during WWII?", options: ["Benito Mussolini", "Adolf Hitler", "Joseph Stalin", "Winston Churchill"], answer: "Adolf Hitler" },
  { q: "What was the German military tactic of rapid, overwhelming force called?", options: ["Blitzkrieg (Lightning War)", "Trench Warfare", "Guerrilla Warfare", "Attrition"], answer: "Blitzkrieg (Lightning War)" },
  { q: "Which event brought the United States into WWII in 1941?", options: ["The sinking of the Lusitania", "The invasion of France", "The Japanese attack on Pearl Harbor", "The Battle of Stalingrad"], answer: "The Japanese attack on Pearl Harbor" },
  { q: "How did World War 2 end in the Pacific?", options: ["A peace treaty was signed in Tokyo", "The US dropped atomic bombs on Hiroshima and Nagasaki", "Japan invaded the US mainland", "The Soviet Union conquered Japan"], answer: "The US dropped atomic bombs on Hiroshima and Nagasaki" },
  // Topic 12
  { q: "What term is used to describe the systematic, state-sponsored genocide of six million Jews by the Nazi regime?", options: ["The Great Purge", "The Holocaust", "The Inquisition", "The Diaspora"], answer: "The Holocaust" },
  { q: "What were the 'ghettos' created by the Nazis?", options: ["Luxury neighborhoods", "Enclosed, overcrowded city districts where Jews were forced to live", "Military training camps", "Farming communes"], answer: "Enclosed, overcrowded city districts where Jews were forced to live" },
  { q: "What was the primary purpose of an extermination camp like Auschwitz?", options: ["To train soldiers", "To hold political prisoners temporarily", "The mass murder of Jews and other targeted groups", "To manufacture weapons"], answer: "The mass murder of Jews and other targeted groups" },
  { q: "Aside from Jewish people, who else was targeted by the Nazis in these camps?", options: ["Romani people, people with disabilities, and political opponents", "Only French citizens", "American prisoners of war only", "Members of the Nazi party"], answer: "Romani people, people with disabilities, and political opponents" },
  { q: "What was the Nazi code name for their plan to murder all the Jews in Europe?", options: ["The Final Solution", "Operation Barbarossa", "The Manhattan Project", "The Blitz"], answer: "The Final Solution" },
  // Topic 13
  { q: "What two nations emerged as global superpowers after World War II?", options: ["Britain and France", "Germany and Japan", "The United States and the Soviet Union", "China and India"], answer: "The United States and the Soviet Union" },
  { q: "The era of tension and rivalry between these two superpowers without direct fighting is called:", options: ["The Great War", "The Cold War", "The Proxy War", "The Silent War"], answer: "The Cold War" },
  { q: "What metaphorical barrier divided democratic Western Europe from communist Eastern Europe?", options: ["The Berlin Wall", "The Iron Curtain", "The Maginot Line", "The Demilitarized Zone"], answer: "The Iron Curtain" },
  { q: "What was a major goal of the United States during this period?", options: ["To expand its empire in Africa", "To contain the spread of communism", "To become a communist nation", "To return to isolationism"], answer: "To contain the spread of communism" },
  { q: "What major technological race defined this era?", options: ["The Car Race", "The Space Race", "The Internet Race", "The Naval Race"], answer: "The Space Race" },
  // Topic 14
  { q: "Which global organization was founded in 1945 to promote peace and security after WWII?", options: ["The League of Nations", "The United Nations (UN)", "The World Trade Organization", "NATO"], answer: "The United Nations (UN)" },
  { q: "What is the most powerful body within the UN, responsible for maintaining international peace?", options: ["The General Assembly", "The Security Council", "The World Health Organization", "UNICEF"], answer: "The Security Council" },
  { q: "How many countries have permanent seats and veto power on the UN Security Council?", options: ["3", "5", "10", "15"], answer: "5" },
  { q: "Which document did the UN adopt in 1948 to protect individual freedoms globally?", options: ["The Magna Carta", "The Universal Declaration of Human Rights", "The Treaty of Versailles", "The Geneva Convention"], answer: "The Universal Declaration of Human Rights" },
  { q: "Which economic institution was created alongside the UN to help rebuild war-torn countries and reduce poverty?", options: ["The World Bank", "The Federal Reserve", "Wall Street", "The European Central Bank"], answer: "The World Bank" },
  // Topic 15
  { q: "During the Cold War, the world was divided into two main blocs based on:", options: ["Religion", "Economic and political systems", "Language", "Geography only"], answer: "Economic and political systems" },
  { q: "The Capitalist bloc was led by the United States. What is a key feature of capitalism?", options: ["State ownership of all property", "Free markets and private property", "A single-party political system", "Equal distribution of wealth by the state"], answer: "Free markets and private property" },
  { q: "The Socialist/Communist bloc was led by the Soviet Union. What is a key feature of this system?", options: ["Free elections", "Government control of the economy and production", "Private corporations", "Freedom of the press"], answer: "Government control of the economy and production" },
  { q: "What military alliance did the Capitalist bloc form to defend against Soviet expansion?", options: ["The Warsaw Pact", "NATO (North Atlantic Treaty Organization)", "The Axis Powers", "The League of Nations"], answer: "NATO (North Atlantic Treaty Organization)" },
  { q: "What rival military alliance did the Soviet Union form in response?", options: ["The Warsaw Pact", "The Allied Powers", "The Iron Curtain", "The Comintern"], answer: "The Warsaw Pact" },
  // Topic 16
  { q: "Because the USA and USSR had nuclear weapons, they fought through other countries. What is this called?", options: ["Direct War", "Total War", "Proxy War", "Trench War"], answer: "Proxy War" },
  { q: "Which regional conflict divided a peninsula at the 38th parallel into a communist North and capitalist South?", options: ["The Vietnam War", "The Korean War", "The Cuban Missile Crisis", "The Afghan War"], answer: "The Korean War" },
  { q: "In the Vietnam War, who was the United States fighting against?", options: ["French colonists", "Communist forces (Viet Cong and North Vietnam)", "The Chinese Army directly", "Japanese remnants"], answer: "Communist forces (Viet Cong and North Vietnam)" },
  { q: "Which regional conflict in 1962 brought the world closest to actual nuclear war?", options: ["The Korean War", "The Cuban Missile Crisis", "The Berlin Airlift", "The Soviet invasion of Afghanistan"], answer: "The Cuban Missile Crisis" },
  { q: "Why did the Soviet Union invade Afghanistan in 1979?", options: ["To access the ocean", "To prop up a communist government facing a rebellion", "To spread capitalism", "To fight the United States directly"], answer: "To prop up a communist government facing a rebellion" },
  // Topic 17
  { q: "During the Cold War, what was the primary reason for US intervention in Latin America?", options: ["To build colonies", "To prevent the spread of communism and protect corporate interests", "To spread the Spanish language", "To fight European empires"], answer: "To prevent the spread of communism and protect corporate interests" },
  { q: "Which Latin American country had a communist revolution led by Fidel Castro in 1959?", options: ["Mexico", "Brazil", "Cuba", "Argentina"], answer: "Cuba" },
  { q: "What was a common method the US used to intervene in Latin American politics during this era?", options: ["Inviting leaders to join the US", "Supporting military coups to overthrow left-wing leaders", "Building universal healthcare systems", "Ignoring the region completely"], answer: "Supporting military coups to overthrow left-wing leaders" },
  { q: "In 1973, the US CIA backed a military coup to overthrow the democratically elected socialist president of which country?", options: ["Chile", "Canada", "Costa Rica", "Peru"], answer: "Chile" },
  { q: "What was the economic consequence of American intervention in many Latin American nations?", options: ["Total economic collapse", "Unequal wealth distribution favoring large US corporations", "Immediate industrialization", "Total isolation from the global market"], answer: "Unequal wealth distribution favoring large US corporations" },
  // Topic 18
  { q: "What does 'globalization' refer to?", options: ["The building of global walls", "The increasing interconnectedness of the world's economies, cultures, and populations", "The isolation of countries", "The return to local farming"], answer: "The increasing interconnectedness of the world's economies, cultures, and populations" },
  { q: "Which technological advancement massively accelerated globalization in the late 20th century?", options: ["The steam engine", "The internet and digital communication", "The printing press", "The telegraph"], answer: "The internet and digital communication" },
  { q: "What is a major economic characteristic of globalization?", options: ["High tariffs on all goods", "Free trade and international supply chains", "Complete self-reliance of nations", "Barter systems"], answer: "Free trade and international supply chains" },
  { q: "What is a common criticism of economic globalization?", options: ["It makes communication too fast", "It can lead to job losses in developed countries and exploitation in developing ones", "It stops people from traveling", "It prevents cultural exchange"], answer: "It can lead to job losses in developed countries and exploitation in developing ones" },
  { q: "Which global organization regulates international trade rules between nations?", options: ["The World Trade Organization (WTO)", "The United Nations Security Council", "NATO", "The Red Cross"], answer: "The World Trade Organization (WTO)" },
  // Topic 19
  { q: "What is the primary purpose of the European Union (EU)?", options: ["To create a single European military", "To promote peace, political unity, and economic cooperation in Europe", "To conquer other continents", "To rebuild the Roman Empire"], answer: "To promote peace, political unity, and economic cooperation in Europe" },
  { q: "The EU was originally formed to bind European countries together so tightly economically that:", options: ["They would never go to war with each other again", "They could isolate themselves from the USA", "They could stop trading entirely", "They could all speak one language"], answer: "They would never go to war with each other again" },
  { q: "What is the name of the single currency used by many, but not all, EU member nations?", options: ["The Pound", "The Franc", "The Euro", "The Mark"], answer: "The Euro" },
  { q: "One of the key freedoms of the EU is the free movement of:", options: ["Only goods, not people", "People, goods, services, and capital across member borders", "Only military forces", "Only money"], answer: "People, goods, services, and capital across member borders" },
  { q: "Which major event happened in 2020 regarding the EU?", options: ["The EU disbanded", "The United Kingdom officially left the EU (Brexit)", "The US joined the EU", "Russia joined the EU"], answer: "The United Kingdom officially left the EU (Brexit)" },
  // Topic 20
  { q: "What did the Treaty of Maastricht officially create when it was signed in 1992?", options: ["The League of Nations", "The European Union", "NATO", "The Warsaw Pact"], answer: "The European Union" },
  { q: "The Treaty laid the groundwork for creating which massive economic tool?", options: ["The single European currency (The Euro)", "The World Bank", "The internet", "The global stock market"], answer: "The single European currency (The Euro)" },
  { q: "The Treaty of Maastricht expanded cooperation beyond just economics into which area?", options: ["Space exploration", "Common foreign and security policy", "Creating a single European religion", "Banning all local languages"], answer: "Common foreign and security policy" },
  { q: "To adopt the Euro under the Maastricht rules, countries had to meet strict criteria regarding their:", options: ["Population size", "Inflation and government debt", "Military size", "Climate goals"], answer: "Inflation and government debt" },
  { q: "The citizens of member countries under the Maastricht Treaty were granted what new status?", options: ["Citizens of the World", "European Citizenship", "Diplomatic Immunity", "Royalty"], answer: "European Citizenship" }
];


if (runtime.pack) {
  QUESTION_BANK.splice(0, QUESTION_BANK.length, ...runtime.pack.items.map(item => ({ q: item.question, options: item.options, answer: item.answer })));
  document.querySelector('#start-screen h1').textContent = runtime.pack.title;
  document.querySelector('#start-screen .description').textContent = 'Play your classroom question pack. Three strikes end the round. Complete it to unlock a recall challenge.';
}

// ─── Constants ──────────────────────────────
const QUESTIONS_PER_ROUND = Math.min(30, QUESTION_BANK.length);
const BOSS_QUESTIONS = Math.min(10, QUESTION_BANK.length);
const MAX_STRIKES = 3;
const CORRECT_DELAY = 1000;
const INCORRECT_DELAY = 2500;
const BOSS_CORRECT_DELAY = 1500;
const BOSS_INCORRECT_DELAY = 3000;

const LB_QUIZ_KEY = 'wh_quiz_leaderboard';
const LB_BOSS_KEY = 'wh_boss_leaderboard';
const LB_MAX_ENTRIES = 5;


// ─── Game State ─────────────────────────────
let currentQuestions = [];
let currentIndex = 0;
let strikes = 0;
let correctCount = 0;
let isAnswering = false;

// Timer
let timerInterval = null;
let timerStartTime = 0;
let quizElapsedSeconds = 0;

// Boss state
let bossQuestions = [];
let bossIndex = 0;
let bossCorrect = 0;
let bossTimerInterval = null;
let bossTimerStart = 0;
let bossElapsedSeconds = 0;
let bossAnswering = false;


// ─── DOM References ─────────────────────────
const screens = {
    start:       document.getElementById('start-screen'),
    quiz:        document.getElementById('quiz-screen'),
    result:      document.getElementById('result-screen'),
    boss:        document.getElementById('boss-screen'),
    bossResult:  document.getElementById('boss-result-screen')
};

const els = {
    questionCounter: document.getElementById('question-counter'),
    progressBar:     document.getElementById('progress-bar'),
    questionText:    document.getElementById('question-text'),
    feedbackStrip:   document.getElementById('feedback-strip'),
    feedbackIcon:    document.getElementById('feedback-icon'),
    feedbackText:    document.getElementById('feedback-text'),
    resultIcon:      document.getElementById('result-icon'),
    resultTitle:     document.getElementById('result-title'),
    resultMessage:   document.getElementById('result-message'),
    resultStats:     document.getElementById('result-stats'),
    resultCard:      document.getElementById('result-card'),
    replayText:      document.getElementById('replay-text'),
    bossBtn:         document.getElementById('boss-btn'),
    quizTimer:       document.getElementById('quiz-timer'),
    quizLBList:      document.getElementById('quiz-leaderboard-list'),
    // Boss
    bossCounter:     document.getElementById('boss-counter'),
    bossProgressBar: document.getElementById('boss-progress-bar'),
    bossQuestionText:document.getElementById('boss-question-text'),
    bossHint:        document.getElementById('boss-hint'),
    bossInput:       document.getElementById('boss-input'),
    bossSubmitBtn:   document.getElementById('boss-submit-btn'),
    bossVerdict:     document.getElementById('boss-verdict'),
    bossTimer:       document.getElementById('boss-timer'),
    bossResultIcon:  document.getElementById('boss-result-icon'),
    bossResultTitle: document.getElementById('boss-result-title'),
    bossResultMsg:   document.getElementById('boss-result-message'),
    bossResultStats: document.getElementById('boss-result-stats'),
    bossResultCard:  document.getElementById('boss-result-card'),
    bossLBList:      document.getElementById('boss-leaderboard-list'),
    seals: [
        document.getElementById('seal-1'),
        document.getElementById('seal-2'),
        document.getElementById('seal-3')
    ]
};

const optionButtons = [
    document.getElementById('option-0'),
    document.getElementById('option-1'),
    document.getElementById('option-2'),
    document.getElementById('option-3')
];


// ─── Utility ────────────────────────────────

function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
}

function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function normalize(str) {
    return str.toLowerCase().trim().replace(/\s+/g, ' ');
}


// ═══════════════════════════════════════════
// TIMER
// ═══════════════════════════════════════════

function startTimer(displayEl, prefix) {
    const start = Date.now();
    return {
        start,
        interval: setInterval(() => {
            const elapsed = Math.floor((Date.now() - start) / 1000);
            displayEl.textContent = `${prefix} ${formatTime(elapsed)}`;
        }, 250)
    };
}

function stopTimer(interval) {
    clearInterval(interval);
}


// ═══════════════════════════════════════════
// LEADERBOARD (localStorage)
// ═══════════════════════════════════════════

function getLeaderboard(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch { return []; }
}

function saveToLeaderboard(key, entry) {
    const lb = getLeaderboard(key);
    lb.push(entry);
    // Sort by time ascending (fastest first)
    lb.sort((a, b) => a.time - b.time);
    // Keep top entries
    const trimmed = lb.slice(0, LB_MAX_ENTRIES);
    localStorage.setItem(key, JSON.stringify(trimmed));
    return trimmed;
}

function renderLeaderboard(listEl, entries, currentTime) {
    if (entries.length === 0) {
        listEl.innerHTML = '<li class="leaderboard-empty">No records yet.</li>';
        return;
    }
    const medals = ['🥇', '🥈', '🥉'];
    listEl.innerHTML = entries.map((e, i) => {
        const isCurrent = e.time === currentTime && !e._marked;
        if (isCurrent) e._marked = true;
        const medal = medals[i] || '';
        const cls = isCurrent ? 'current-run' : '';
        const score = e.correct !== undefined ? `<span class="lb-score">${e.correct}/${e.total} correct</span>` : '';
        return `<li class="${cls}">
            <span class="lb-medal">${medal}</span>
            <span>${score}</span>
            <span class="lb-time">${formatTime(e.time)}</span>
        </li>`;
    }).join('');
}


// ═══════════════════════════════════════════
// QUIZ FLOW
// ═══════════════════════════════════════════

function startGame() {
    strikes = 0;
    correctCount = 0;
    currentIndex = 0;
    isAnswering = false;

    currentQuestions = shuffle(QUESTION_BANK).slice(0, QUESTIONS_PER_ROUND);

    els.seals.forEach(seal => {
        seal.classList.remove('used');
        seal.classList.add('active');
    });

    hideFeedback();

    // Start timer
    if (timerInterval) stopTimer(timerInterval);
    const t = startTimer(els.quizTimer, '⏱');
    timerStartTime = t.start;
    timerInterval = t.interval;

    showScreen('quiz');
    loadQuestion();
}

function loadQuestion() {
    const q = currentQuestions[currentIndex];

    els.questionCounter.textContent = `Question ${currentIndex + 1} / ${QUESTIONS_PER_ROUND}`;
    els.progressBar.style.width = `${(currentIndex / QUESTIONS_PER_ROUND) * 100}%`;

    const area = document.getElementById('question-area');
    area.classList.add('transitioning');

    setTimeout(() => {
        els.questionText.textContent = q.q;
        const shuffledOptions = shuffle(q.options);

        while (optionButtons.length < shuffledOptions.length) {
            const button = document.createElement('button');
            const index = optionButtons.length;
            button.id = 'option-' + index;
            button.addEventListener('click', () => selectAnswer(index));
            optionButtons[0].parentElement.append(button);
            optionButtons.push(button);
        }
        optionButtons.forEach((btn, i) => {
            btn.hidden = i >= shuffledOptions.length;
            btn.textContent = shuffledOptions[i] || '';
            btn.className = 'btn btn-option';
            btn.disabled = false;
        });

        area.classList.remove('transitioning');
        area.classList.add('entering');
        setTimeout(() => area.classList.remove('entering'), 350);
    }, 250);
}

function selectAnswer(index) {
    if (isAnswering || !optionButtons[index] || optionButtons[index].hidden || optionButtons[index].disabled) return;
    isAnswering = true;

    const q = currentQuestions[currentIndex];
    const selectedText = optionButtons[index].textContent;
    const isCorrect = selectedText === q.answer;

    optionButtons.forEach(btn => {
        btn.classList.add('disabled');
        btn.disabled = true;
    });

    if (isCorrect) {
        optionButtons[index].classList.add('correct');
        showFeedback(true, 'Correct! Well done, scholar.');
        correctCount++;

        setTimeout(() => {
            hideFeedback();
            advanceQuestion();
        }, CORRECT_DELAY);
    } else {
        optionButtons[index].classList.add('incorrect');
        optionButtons.forEach(btn => {
            if (btn.textContent === q.answer) btn.classList.add('correct');
        });

        strikes++;
        updateStrikes();
        showFeedback(false, `The answer was: ${q.answer}`);

        setTimeout(() => {
            hideFeedback();
            if (strikes >= MAX_STRIKES) {
                showGameOver();
            } else {
                advanceQuestion();
            }
        }, INCORRECT_DELAY);
    }
}

function advanceQuestion() {
    currentIndex++;
    isAnswering = false;
    if (currentIndex >= QUESTIONS_PER_ROUND) {
        showVictory();
    } else {
        loadQuestion();
    }
}

function updateStrikes() {
    for (let i = 0; i < strikes; i++) {
        els.seals[i].classList.remove('active');
        els.seals[i].classList.add('used');
    }
}

function showFeedback(isCorrect, message) {
    els.feedbackStrip.className = 'feedback-strip';
    els.feedbackIcon.textContent = isCorrect ? '✓' : '✗';
    els.feedbackText.textContent = message;
    requestAnimationFrame(() => {
        els.feedbackStrip.classList.add(isCorrect ? 'show-correct' : 'show-incorrect');
    });
}

function hideFeedback() {
    els.feedbackStrip.className = 'feedback-strip hidden';
}


// ─── End Screens ────────────────────────────

function showVictory() {
    isAnswering = false;
    stopTimer(timerInterval);
    quizElapsedSeconds = Math.floor((Date.now() - timerStartTime) / 1000);
    els.progressBar.style.width = '100%';

    els.resultIcon.textContent = '🏆';
    els.resultTitle.textContent = 'Victory!';
    els.resultCard.className = 'result-card victory';
    els.resultMessage.textContent = runtime.pack ? 'You completed your classroom challenge! The Final Boss awaits…' : 'You have proven yourself a true scholar of World History! The Final Boss awaits…';
    els.replayText.textContent = 'Play Again';
    els.bossBtn.classList.remove('hidden');

    els.resultStats.innerHTML = `
        <div class="stat-box"><span class="stat-value">${correctCount}</span><span class="stat-label">Correct</span></div>
        <div class="stat-box"><span class="stat-value">${strikes}</span><span class="stat-label">Strikes</span></div>
        <div class="stat-box"><span class="stat-value">${formatTime(quizElapsedSeconds)}</span><span class="stat-label">Time</span></div>
    `;

    // Save & render leaderboard
    const lb = saveToLeaderboard(LB_QUIZ_KEY, { time: quizElapsedSeconds, correct: correctCount, total: QUESTIONS_PER_ROUND });
    renderLeaderboard(els.quizLBList, lb, quizElapsedSeconds);

    showScreen('result');
}

function showGameOver() {
    isAnswering = false;
    stopTimer(timerInterval);
    quizElapsedSeconds = Math.floor((Date.now() - timerStartTime) / 1000);

    els.resultIcon.textContent = '📕';
    els.resultTitle.textContent = 'Game Over';
    els.resultCard.className = 'result-card defeat';
    els.resultMessage.textContent = 'The chronicle has ended. Study the scrolls and return when you are ready, young scholar.';
    els.replayText.textContent = 'Try Again';
    els.bossBtn.classList.add('hidden');

    const answered = currentIndex + 1;
    els.resultStats.innerHTML = `
        <div class="stat-box"><span class="stat-value">${correctCount}</span><span class="stat-label">Correct</span></div>
        <div class="stat-box"><span class="stat-value">${answered}</span><span class="stat-label">Attempted</span></div>
        <div class="stat-box"><span class="stat-value">${formatTime(quizElapsedSeconds)}</span><span class="stat-label">Time</span></div>
    `;

    // No leaderboard entry for losses — just show existing
    const lb = getLeaderboard(LB_QUIZ_KEY);
    renderLeaderboard(els.quizLBList, lb, -1);

    showScreen('result');
}


// ═══════════════════════════════════════════
// BOSS FIGHT
// ═══════════════════════════════════════════

function startBossFight() {
    bossIndex = 0;
    bossCorrect = 0;
    bossAnswering = false;

    // Pick 10 random questions (different from quiz round if possible)
    bossQuestions = shuffle(QUESTION_BANK).slice(0, BOSS_QUESTIONS);

    // Start timer
    if (bossTimerInterval) stopTimer(bossTimerInterval);
    const t = startTimer(els.bossTimer, '⚔️');
    bossTimerStart = t.start;
    bossTimerInterval = t.interval;

    showScreen('boss');
    loadBossQuestion();

    // Focus input after screen transition
    setTimeout(() => els.bossInput.focus(), 650);
}

function loadBossQuestion() {
    const q = bossQuestions[bossIndex];

    els.bossCounter.textContent = `Question ${bossIndex + 1} / ${BOSS_QUESTIONS}`;
    els.bossProgressBar.style.width = `${(bossIndex / BOSS_QUESTIONS) * 100}%`;

    const area = document.getElementById('boss-question-area');
    area.classList.add('transitioning');

    setTimeout(() => {
        els.bossQuestionText.textContent = q.q;

        // Build hint: first letter + word count
        const words = q.answer.split(' ');
        const firstLetter = q.answer.charAt(0).toUpperCase();
        const blanked = words.map((w, i) => {
            if (i === 0) return firstLetter + '·'.repeat(w.length - 1);
            return '·'.repeat(w.length);
        }).join('  ');
        els.bossHint.textContent = `Hint: ${blanked}  (${words.length} word${words.length > 1 ? 's' : ''})`;

        // Reset input
        els.bossInput.value = '';
        els.bossInput.disabled = false;
        els.bossSubmitBtn.disabled = false;
        els.bossVerdict.className = 'boss-verdict hidden';
        els.bossVerdict.textContent = '';

        area.classList.remove('transitioning');
        area.classList.add('entering');
        setTimeout(() => {
            area.classList.remove('entering');
            els.bossInput.focus();
        }, 350);
    }, 250);
}

function checkBossAnswer(userInput, correctAnswer) {
    const u = normalize(userInput);
    const c = normalize(correctAnswer);

    // 1. Exact match
    if (u === c) return true;

    // 2. Strip articles and parentheticals
    const stripArticles = s => s.replace(/^(the|a|an)\s+/i, '');
    const stripParens = s => s.replace(/\s*\(.*?\)\s*/g, ' ').trim();

    if (stripArticles(u) === stripArticles(c)) return true;
    if (normalize(stripParens(u)) === normalize(stripParens(c))) return true;
    if (stripArticles(normalize(stripParens(u))) === stripArticles(normalize(stripParens(c)))) return true;

    // 3. Check if user typed the key part (for answers with parenthetical like "Blitzkrieg (Lightning War)")
    const mainPart = normalize(correctAnswer.split('(')[0]);
    if (u === mainPart) return true;

    // 4. Levenshtein tolerance for short answers (<=15 chars): allow 1–2 typos
    if (c.length <= 15) {
        const dist = levenshtein(u, c);
        if (dist <= 2) return true;
    }

    return false;
}

function levenshtein(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            dp[i][j] = a[i-1] === b[j-1]
                ? dp[i-1][j-1]
                : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
        }
    }
    return dp[m][n];
}

function submitBossAnswer() {
    if (bossAnswering) return;
    const userInput = els.bossInput.value.trim();
    if (!userInput) {
        els.bossInput.focus();
        return;
    }

    bossAnswering = true;
    els.bossInput.disabled = true;
    els.bossSubmitBtn.disabled = true;

    const q = bossQuestions[bossIndex];
    const isCorrect = checkBossAnswer(userInput, q.answer);

    els.bossVerdict.classList.remove('hidden');

    if (isCorrect) {
        bossCorrect++;
        els.bossVerdict.className = 'boss-verdict verdict-correct';
        els.bossVerdict.textContent = '✓ Correct! Impressive recall!';

        setTimeout(() => advanceBoss(), BOSS_CORRECT_DELAY);
    } else {
        els.bossVerdict.className = 'boss-verdict verdict-incorrect';
        els.bossVerdict.innerHTML = `✗ Incorrect.<br>The correct answer: <strong>${escapeHTML(q.answer)}</strong>`;

        setTimeout(() => advanceBoss(), BOSS_INCORRECT_DELAY);
    }
}

function advanceBoss() {
    bossIndex++;
    bossAnswering = false;

    if (bossIndex >= BOSS_QUESTIONS) {
        showBossResult();
    } else {
        loadBossQuestion();
    }
}

function showBossResult() {
    stopTimer(bossTimerInterval);
    bossElapsedSeconds = Math.floor((Date.now() - bossTimerStart) / 1000);
    els.bossProgressBar.style.width = '100%';

    const perfect = bossCorrect === BOSS_QUESTIONS;

    els.bossResultIcon.textContent = perfect ? '👑' : (bossCorrect >= 7 ? '⚔️' : '📕');
    els.bossResultTitle.textContent = perfect ? 'Legendary!' : (bossCorrect >= 7 ? 'Boss Defeated!' : 'Valiant Effort');
    els.bossResultCard.className = 'result-card boss-result-card' + (perfect ? ' victory' : '');
    els.bossResultMsg.textContent = perfect
        ? 'Perfect score! You have achieved true mastery of World History. Your name shall echo through the ages!'
        : bossCorrect >= 7
            ? 'You have conquered the Final Boss! A worthy scholar of the ages.'
            : 'The Boss stands strong. Review the scrolls and return for another attempt!';

    els.bossResultStats.innerHTML = `
        <div class="stat-box"><span class="stat-value">${bossCorrect}/${BOSS_QUESTIONS}</span><span class="stat-label">Correct</span></div>
        <div class="stat-box"><span class="stat-value">${formatTime(bossElapsedSeconds)}</span><span class="stat-label">Time</span></div>
    `;

    // Save & render boss leaderboard
    const lb = saveToLeaderboard(LB_BOSS_KEY, { time: bossElapsedSeconds, correct: bossCorrect, total: BOSS_QUESTIONS });
    renderLeaderboard(els.bossLBList, lb, bossElapsedSeconds);

    showScreen('bossResult');
}


// ─── Keyboard: Enter to submit in boss mode ─
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && screens.boss.classList.contains('active') && !bossAnswering) {
        submitBossAnswer();
    }
});

Object.assign(window, { selectAnswer, startGame, startBossFight, submitBossAnswer });
