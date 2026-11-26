import React from 'react';
import { createRoot } from 'react-dom/client';
import { gameRuntime } from '../gallery/shared/runtime.js';

const answerActions = Object.fromEntries(Array.from({ length: 6 }, (_, index) => [
  'answer' + (index + 1),
  () => document.querySelectorAll('.mc-btn')[index]?.click()
]));
const { pack } = gameRuntime('geo-master-primary-edition', 'quiz', answerActions);
const { useState, useEffect, useRef, useCallback, useMemo } = React;

// ═══════════════════════════════════════════════════════════════
// BUBBLE PARTICLE SYSTEM
// ═══════════════════════════════════════════════════════════════
(function initBubbles() {
  const canvas = document.getElementById('bubbles');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  const COLORS = ['rgba(124,77,255,0.12)','rgba(255,64,129,0.10)','rgba(0,188,212,0.10)','rgba(255,215,64,0.12)','rgba(0,200,83,0.10)'];

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
  const COLORS = ['#7C4DFF','#FF4081','#00BCD4','#FFD740','#00C853','#FF6D00'];

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
// DATA: 100-QUESTION BANK
// ═══════════════════════════════════════════════════════════════

const Q_BANK = pack ? pack.items.map((item, index) => ({ ...item, id: index, type: 'mc', question: item.question, theme: pack.title })) : [
  // ─────────────────────────────────────────────────────────────
  // FILL-IN-THE-BLANK (30 questions, id 1–30)
  // ─────────────────────────────────────────────────────────────
  { id:1, type:'fill', theme:'🗺️ Maps',
    sentence:'To keep things organized, we slice the globe into vertical sections called time ___.',
    answer:'zones' },
  { id:2, type:'fill', theme:'🗺️ Maps',
    sentence:'The invisible vertical line at 0 degrees longitude is called the Prime ___.',
    answer:'Meridian' },
  { id:3, type:'fill', theme:'🌍 Earth',
    sentence:'The Earth\'s ___ on its axis causes day and night and necessitates time zones.',
    answer:'rotation' },
  { id:4, type:'fill', theme:'🗺️ Maps',
    sentence:'The ___ projection is a map that is great for ocean navigation but makes Greenland look as big as Africa.',
    answer:'Mercator' },
  { id:5, type:'fill', theme:'🗺️ Maps',
    sentence:'The ___ projection shows the correct physical size of countries but heavily distorts their shape.',
    answer:'Peters' },
  { id:6, type:'fill', theme:'🗺️ Maps',
    sentence:'The inevitable stretching or shrinking of landmasses when making a flat map is called ___.',
    answer:'distortion' },
  { id:7, type:'fill', theme:'🗺️ Maps',
    sentence:'___ is the science and art of making maps.',
    answer:'Cartography', alts:['cartography'] },
  { id:8, type:'fill', theme:'🌍 Earth',
    sentence:'The actions of wind, water, and ice cause ___, which slowly moves rocks and soil.',
    answer:'erosion' },
  { id:9, type:'fill', theme:'🌍 Earth',
    sentence:'The differences in elevation and shape of the land (like mountains and valleys) are called the ___.',
    answer:'relief' },
  { id:10, type:'fill', theme:'🌍 Earth',
    sentence:'A massive, slowly moving river of ice that carves out valleys is a ___.',
    answer:'glacier' },
  { id:11, type:'fill', theme:'👥 Population',
    sentence:'Statistical data relating to the population is known as ___.',
    answer:'demographics' },
  { id:12, type:'fill', theme:'👥 Population',
    sentence:'A measurement of how crowded a place is per square kilometer is called population ___.',
    answer:'density' },
  { id:13, type:'fill', theme:'👥 Population',
    sentence:'The number of live births per 1,000 people in a year is the ___ rate.',
    answer:'birth' },
  { id:14, type:'fill', theme:'🏘️ Settlement',
    sentence:'The countryside, which often relies on agriculture or mining, is considered a ___ area.',
    answer:'rural' },
  { id:15, type:'fill', theme:'🏘️ Settlement',
    sentence:'Cities and towns with factories, offices, and higher population densities are ___ areas.',
    answer:'urban' },
  { id:16, type:'fill', theme:'🏗️ Development',
    sentence:'The basic physical systems of an area, like roads, water pipes, and power grids, are its ___.',
    answer:'infrastructure' },
  { id:17, type:'fill', theme:'🏗️ Development',
    sentence:'The state of lacking the financial resources for a minimum standard of living is called ___.',
    answer:'poverty' },
  { id:18, type:'fill', theme:'🏗️ Development',
    sentence:'Pushing a specific group to the edges of society and denying them power is called ___.',
    answer:'marginalization', alts:['marginalisation'] },
  { id:19, type:'fill', theme:'🚶 Migration',
    sentence:'The movement of people from one place to another is called ___.',
    answer:'migration' },
  { id:20, type:'fill', theme:'🚶 Migration',
    sentence:'Negative reasons that force people to leave their homes are called ___ factors.',
    answer:'push' },
  { id:21, type:'fill', theme:'🚶 Migration',
    sentence:'Positive reasons that attract people to a new place are called ___ factors.',
    answer:'pull' },
  { id:22, type:'fill', theme:'🚶 Migration',
    sentence:'Someone who is leaving their home country is an ___.',
    answer:'emigrant' },
  { id:23, type:'fill', theme:'⚡ Resources',
    sentence:'Coal, oil, and natural gas are examples of ___ fuels.',
    answer:'fossil' },
  { id:24, type:'fill', theme:'⚡ Resources',
    sentence:'Energy sources that replenish naturally, like the sun and wind, are ___ resources.',
    answer:'renewable' },
  { id:25, type:'fill', theme:'⚡ Resources',
    sentence:'The physical process of pulling minerals out of the ground is called ___.',
    answer:'extraction' },
  { id:26, type:'fill', theme:'⚡ Resources',
    sentence:'Turning raw materials into usable products is called ___.',
    answer:'processing' },
  { id:27, type:'fill', theme:'🏭 Industry',
    sentence:'Farming, mining, and fishing belong to the ___ industry.',
    answer:'primary' },
  { id:28, type:'fill', theme:'🏭 Industry',
    sentence:'Manufacturing and factories belong to the ___ industry.',
    answer:'secondary' },
  { id:29, type:'fill', theme:'✈️ Tourism',
    sentence:'Large numbers of people visiting the exact same popular location is known as ___ tourism.',
    answer:'mass' },
  { id:30, type:'fill', theme:'✈️ Tourism',
    sentence:'Responsible travel to natural areas that conserves the environment is called ___.',
    answer:'ecotourism', alts:['eco-tourism','eco tourism'] },

  // ─────────────────────────────────────────────────────────────
  // CORRECT THE MISTAKE (30 questions, id 31–60)
  // ─────────────────────────────────────────────────────────────
  { id:31, type:'fix', theme:'🗺️ Maps',
    sentenceWithError:'The Mercator projection shows the true size of all countries.',
    errorWord:'true', correction:'distorted' },
  { id:32, type:'fix', theme:'🗺️ Maps',
    sentenceWithError:'The Prime Meridian runs horizontally across the Earth.',
    errorWord:'horizontally', correction:'vertically' },
  { id:33, type:'fix', theme:'🌍 Earth',
    sentenceWithError:'A glacier is a massive, slowly moving river of water.',
    errorWord:'water', correction:'ice' },
  { id:34, type:'fix', theme:'🏭 Industry',
    sentenceWithError:'Primary industries include banking, retail, and teaching.',
    errorWord:'Primary', correction:'Tertiary' },
  { id:35, type:'fix', theme:'🚶 Migration',
    sentenceWithError:'Push factors are positive reasons that attract people to a new place.',
    errorWord:'Push', correction:'Pull' },
  { id:36, type:'fix', theme:'✈️ Tourism',
    sentenceWithError:'Ecotourism involves massive cruise ships damaging a small beach town.',
    errorWord:'Ecotourism', correction:'Mass tourism' },
  { id:37, type:'fix', theme:'🗺️ Maps',
    sentenceWithError:'Earth\'s rotation creates different climate zones around the world.',
    errorWord:'climate', correction:'time' },
  { id:38, type:'fix', theme:'🚶 Migration',
    sentenceWithError:'An emigrant is someone who is arriving in a new country.',
    errorWord:'emigrant', correction:'immigrant' },
  { id:39, type:'fix', theme:'🏘️ Settlement',
    sentenceWithError:'Urban areas are mostly based on agriculture and farming.',
    errorWord:'Urban', correction:'Rural' },
  { id:40, type:'fix', theme:'🏗️ Development',
    sentenceWithError:'Poverty is when a group is pushed to the edges of society and denied power.',
    errorWord:'Poverty', correction:'Marginalization' },
  { id:41, type:'fix', theme:'⚡ Resources',
    sentenceWithError:'Fossil fuels like oil and coal are examples of renewable resources.',
    errorWord:'renewable', correction:'non-renewable' },
  { id:42, type:'fix', theme:'🏭 Industry',
    sentenceWithError:'Secondary industries involve extracting raw materials like fishing.',
    errorWord:'Secondary', correction:'Primary' },
  { id:43, type:'fix', theme:'🗺️ Maps',
    sentenceWithError:'Cartography is the science and art of building bridges.',
    errorWord:'bridges', correction:'maps' },
  { id:44, type:'fix', theme:'🗺️ Maps',
    sentenceWithError:'The Robinson projection has absolutely no distortion at all.',
    errorWord:'no', correction:'some' },
  { id:45, type:'fix', theme:'🌍 Earth',
    sentenceWithError:'Relief refers to the movement of broken-down rocks from place to place.',
    errorWord:'Relief', correction:'Erosion' },
  { id:46, type:'fix', theme:'👥 Population',
    sentenceWithError:'Demographics measure how many animals live in a certain forest.',
    errorWord:'animals', correction:'people' },
  { id:47, type:'fix', theme:'⚡ Resources',
    sentenceWithError:'Wind and solar power are examples of non-renewable resources.',
    errorWord:'non-renewable', correction:'renewable' },
  { id:48, type:'fix', theme:'🚶 Migration',
    sentenceWithError:'Migration means staying in one place and never moving.',
    errorWord:'staying', correction:'moving' },
  { id:49, type:'fix', theme:'🗺️ Maps',
    sentenceWithError:'The Peters projection accurately shows the shape of countries.',
    errorWord:'shape', correction:'size' },
  { id:50, type:'fix', theme:'👥 Population',
    sentenceWithError:'A high population density means very few people live in an area.',
    errorWord:'few', correction:'many' },
  { id:51, type:'fix', theme:'✈️ Tourism',
    sentenceWithError:'Ecotourism harms the natural environment and local communities.',
    errorWord:'harms', correction:'protects' },
  { id:52, type:'fix', theme:'🏗️ Development',
    sentenceWithError:'Roads, power grids, and water pipes are examples of natural features.',
    errorWord:'natural', correction:'infrastructure' },
  { id:53, type:'fix', theme:'🏭 Industry',
    sentenceWithError:'Turning raw materials into products in a factory is a tertiary industry.',
    errorWord:'tertiary', correction:'secondary' },
  { id:54, type:'fix', theme:'🌍 Earth',
    sentenceWithError:'Erosion is the breakdown of rocks caused by human activity.',
    errorWord:'human', correction:'natural' },
  { id:55, type:'fix', theme:'🚶 Migration',
    sentenceWithError:'Pull factors include war, famine, and a lack of jobs.',
    errorWord:'Pull', correction:'Push' },
  { id:56, type:'fix', theme:'⚡ Resources',
    sentenceWithError:'The distribution of mineral deposits is completely equal around the world.',
    errorWord:'equal', correction:'unequal' },
  { id:57, type:'fix', theme:'👥 Population',
    sentenceWithError:'Rural areas usually have much higher population densities than cities.',
    errorWord:'higher', correction:'lower' },
  { id:58, type:'fix', theme:'⚡ Resources',
    sentenceWithError:'Processing means pulling resources straight out of the ground.',
    errorWord:'Processing', correction:'Extraction' },
  { id:59, type:'fix', theme:'✈️ Tourism',
    sentenceWithError:'Cultural tourism means traveling specifically to visit factories.',
    errorWord:'factories', correction:'museums' },
  { id:60, type:'fix', theme:'🗺️ Maps',
    sentenceWithError:'The Earth is perfectly flat, so all maps are completely accurate.',
    errorWord:'flat', correction:'round' },

  // ─────────────────────────────────────────────────────────────
  // MULTIPLE CHOICE (40 questions, id 61–100)
  // ─────────────────────────────────────────────────────────────
  { id:61, type:'mc', theme:'🗺️ Maps',
    question:'Why do we have time zones on Earth?',
    options:["Because of the Earth's orbit around the sun","Because of the Earth's rotation on its axis","Because of ocean currents","Because maps need vertical lines"],
    answer:"Because of the Earth's rotation on its axis" },
  { id:62, type:'mc', theme:'🗺️ Maps',
    question:'The invisible vertical line at 0 degrees longitude is called the:',
    options:['Equator','Prime Meridian','Tropic of Cancer','International Date Line'],
    answer:'Prime Meridian' },
  { id:63, type:'mc', theme:'🗺️ Maps',
    question:'Which map projection is excellent for ocean navigation but makes Greenland look massive?',
    options:['Peters Projection','Robinson Projection','Mercator Projection','Azimuthal Projection'],
    answer:'Mercator Projection' },
  { id:64, type:'mc', theme:'🗺️ Maps',
    question:'The Peters projection is mathematically designed to show the accurate:',
    options:['Shape of countries','Distance between cities','Physical size of countries','Ocean depths'],
    answer:'Physical size of countries' },
  { id:65, type:'mc', theme:'🗺️ Maps',
    question:'Because the Earth is a sphere, all flat maps have some level of:',
    options:['Erosion','Marginalization','Distortion','Demographics'],
    answer:'Distortion' },
  { id:66, type:'mc', theme:'🗺️ Maps',
    question:'The science and art of making maps is known as:',
    options:['Geography','Cartography','Topography','Demography'],
    answer:'Cartography' },
  { id:67, type:'mc', theme:'🌍 Earth',
    question:'Which of the following is NOT a natural force that causes erosion?',
    options:['Wind','Ice','Flowing water','Sunlight'],
    answer:'Sunlight' },
  { id:68, type:'mc', theme:'🌍 Earth',
    question:'The shape and differences in elevation of the land are called the:',
    options:['Relief','Equator','Infrastructure','Extraction'],
    answer:'Relief' },
  { id:69, type:'mc', theme:'🌍 Earth',
    question:'A massive, slowly moving river of ice is called a:',
    options:['Glacier','Tsunami','Avalanche','Monsoon'],
    answer:'Glacier' },
  { id:70, type:'mc', theme:'🌍 Earth',
    question:'Erosion modifies the Earth\'s surface over:',
    options:['A few days','Several weeks','Millions of years','Exactly one year'],
    answer:'Millions of years' },
  { id:71, type:'mc', theme:'👥 Population',
    question:'Statistical data relating to a population is called:',
    options:['Topography','Demographics','Cartography','Marginalization'],
    answer:'Demographics' },
  { id:72, type:'mc', theme:'👥 Population',
    question:'Population density measures:',
    options:['How crowded a place is','The total wealth of a country','How many hospitals exist','The number of natural resources'],
    answer:'How crowded a place is' },
  { id:73, type:'mc', theme:'👥 Population',
    question:'A country with an aging population and a low birth rate will face issues with its population\'s:',
    options:['Climate','Composition','Relief','Extraction'],
    answer:'Composition' },
  { id:74, type:'mc', theme:'🏘️ Settlement',
    question:'An economy based heavily on agriculture and farming is characteristic of a:',
    options:['Rural area','Urban area','Metropolitan area','Suburban area'],
    answer:'Rural area' },
  { id:75, type:'mc', theme:'🏘️ Settlement',
    question:'Which of the following is most likely to be found in an urban area?',
    options:['Low population density','Large crop farms','High concentration of tertiary industries and services','Untouched wildlife reserves'],
    answer:'High concentration of tertiary industries and services' },
  { id:76, type:'mc', theme:'🏗️ Development',
    question:'Roads, electricity grids, and water pipes are examples of:',
    options:['Natural relief','Infrastructure','Primary industries','Renewable resources'],
    answer:'Infrastructure' },
  { id:77, type:'mc', theme:'🏗️ Development',
    question:'The state of lacking the financial resources for a minimum standard of living is:',
    options:['Inflation','Migration','Poverty','Emigration'],
    answer:'Poverty' },
  { id:78, type:'mc', theme:'🏗️ Development',
    question:'Pushing a group to the edges of society and denying them power is called:',
    options:['Marginalization','Urbanization','Industrialization','Extraction'],
    answer:'Marginalization' },
  { id:79, type:'mc', theme:'🚶 Migration',
    question:'Moving from one place to another for social, political, or economic reasons is:',
    options:['Ecotourism','Migration','Cartography','Processing'],
    answer:'Migration' },
  { id:80, type:'mc', theme:'🚶 Migration',
    question:'A war breaking out in a country is an example of a:',
    options:['Pull factor','Push factor','Primary industry','Renewable resource'],
    answer:'Push factor' },
  { id:81, type:'mc', theme:'🚶 Migration',
    question:'Excellent schools and abundant job opportunities are examples of:',
    options:['Pull factors','Push factors','Marginalization','Mass tourism'],
    answer:'Pull factors' },
  { id:82, type:'mc', theme:'🚶 Migration',
    question:'Someone arriving in a new country to live is an:',
    options:['Emigrant','Immigrant','Ecotourist','Explorer'],
    answer:'Immigrant' },
  { id:83, type:'mc', theme:'🚶 Migration',
    question:'Someone leaving their home country to live elsewhere is an:',
    options:['Emigrant','Immigrant','Ecotourist','Explorer'],
    answer:'Emigrant' },
  { id:84, type:'mc', theme:'⚡ Resources',
    question:'Oil, coal, and natural gas are:',
    options:['Renewable resources','Fossil fuels','Primary industries','Infrastructure'],
    answer:'Fossil fuels' },
  { id:85, type:'mc', theme:'⚡ Resources',
    question:'Solar energy and wind power are:',
    options:['Non-renewable resources','Renewable resources','Fossil fuels','Extracted minerals'],
    answer:'Renewable resources' },
  { id:86, type:'mc', theme:'⚡ Resources',
    question:'The physical process of digging minerals out of the ground is called:',
    options:['Processing','Extraction','Migration','Marginalization'],
    answer:'Extraction' },
  { id:87, type:'mc', theme:'⚡ Resources',
    question:'Refining crude oil into gasoline is an example of:',
    options:['Processing','Extraction','Erosion','Ecotourism'],
    answer:'Processing' },
  { id:88, type:'mc', theme:'🏭 Industry',
    question:'Farming, mining, and fishing are examples of the:',
    options:['Primary industry','Secondary industry','Tertiary industry','Quaternary industry'],
    answer:'Primary industry' },
  { id:89, type:'mc', theme:'🏭 Industry',
    question:'Manufacturing and building goods in factories are part of the:',
    options:['Primary industry','Secondary industry','Tertiary industry','Service industry'],
    answer:'Secondary industry' },
  { id:90, type:'mc', theme:'🏭 Industry',
    question:'Retail, banking, and education are part of the:',
    options:['Primary industry','Secondary industry','Tertiary industry','Extraction industry'],
    answer:'Tertiary industry' },
  { id:91, type:'mc', theme:'🏭 Industry',
    question:'Large industrial areas are vital to the:',
    options:["Earth's rotation",'Global economy','Mercator projection','Time zones'],
    answer:'Global economy' },
  { id:92, type:'mc', theme:'✈️ Tourism',
    question:'Massive cruise ships dumping thousands of people into a small port town is an example of:',
    options:['Mass tourism','Ecotourism','Cultural tourism','Rural migration'],
    answer:'Mass tourism' },
  { id:93, type:'mc', theme:'✈️ Tourism',
    question:'Travel that conserves the natural environment and supports local people is called:',
    options:['Mass tourism','Ecotourism','Cultural tourism','Infrastructure'],
    answer:'Ecotourism' },
  { id:94, type:'mc', theme:'✈️ Tourism',
    question:'Traveling specifically to visit historical monuments and art museums is:',
    options:['Mass tourism','Ecotourism','Cultural tourism','Marginalization'],
    answer:'Cultural tourism' },
  { id:95, type:'mc', theme:'⚡ Resources',
    question:'Which of the following is a non-renewable resource?',
    options:['Sunlight','Wind','Gold','River water'],
    answer:'Gold' },
  { id:96, type:'mc', theme:'🏗️ Development',
    question:'If a town experiences massive population growth very quickly, what will struggle to keep up?',
    options:['The time zone','The infrastructure',"The Earth's rotation",'The Prime Meridian'],
    answer:'The infrastructure' },
  { id:97, type:'mc', theme:'⚡ Resources',
    question:'How is the distribution of energy deposits spread across the globe?',
    options:['Perfectly equally everywhere','Unequally, causing global trade','Only in the oceans','Only in urban areas'],
    answer:'Unequally, causing global trade' },
  { id:98, type:'mc', theme:'🗺️ Maps',
    question:'The Robinson projection is commonly used in schools because:',
    options:['It has zero distortion','It is a visually pleasing compromise map','It is the only map used for sailing','It makes Africa look tiny'],
    answer:'It is a visually pleasing compromise map' },
  { id:99, type:'mc', theme:'🏘️ Settlement',
    question:'Rural areas often suffer from:',
    options:['Too many skyscrapers','High population densities','Poverty and lack of services','Excessive mass tourism'],
    answer:'Poverty and lack of services' },
  { id:100, type:'mc', theme:'🚶 Migration',
    question:'What is a common consequence of massive rural-to-urban migration?',
    options:['Cities become completely empty','Rural areas become overcrowded','Urban areas experience rapid growth and strain on infrastructure','The climate changes dramatically'],
    answer:'Urban areas experience rapid growth and strain on infrastructure' },
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

function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2,'0');
  const s = (secs % 60).toString().padStart(2,'0');
  return `${m}:${s}`;
}

function getLSLeaderboard() {
  try { const d = localStorage.getItem('gm_primary_lb'); const rows = JSON.parse(d); return Array.isArray(rows) ? rows : []; }
  catch { return []; }
}
function saveLSLeaderboard(lb) {
  try { localStorage.setItem('gm_primary_lb', JSON.stringify(lb)); } catch {}
}
function addToLeaderboard(timeSecs) {
  const lb = getLSLeaderboard();
  lb.push({ time: timeSecs, date: new Date().toLocaleDateString() });
  lb.sort((a,b) => a.time - b.time);
  const trimmed = lb.slice(0, 10);
  saveLSLeaderboard(trimmed);
  return trimmed;
}

function getTimerMax(type) {
  if (type === 'mc')   return 25;
  if (type === 'fill') return 30;
  if (type === 'fix')  return 40;
  return 25;
}

function checkFillAnswer(userInput, q) {
  const user = userInput.trim().toLowerCase();
  const correct = q.answer.toLowerCase();
  if (user === correct) return true;
  if (q.alts && q.alts.some(alt => user === alt.toLowerCase())) return true;
  return false;
}

function checkFixCorrection(userInput, q) {
  const user = userInput.trim().toLowerCase();
  const correct = q.correction.toLowerCase();
  if (user === correct) return true;
  if (q.corrAlts && q.corrAlts.some(alt => user === alt.toLowerCase())) return true;
  // Also accept without hyphens
  if (user.replace(/-/g,' ') === correct.replace(/-/g,' ')) return true;
  if (user.replace(/[-\s]/g,'') === correct.replace(/[-\s]/g,'')) return true;
  return false;
}

const CORRECT_MSGS = ['⭐ Brilliant!','🌟 Amazing!','✨ Perfect!','🎉 Great Job!','👏 Well Done!'];
const WRONG_MSGS = ['Not quite! 💪','Oops! 😊','Almost! 🤔','Keep trying! 💫'];
function randomMsg(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

function QuestionTimer({ value, max, danger }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / max) * circumference;
  return (
    <div className="q-timer-wrap">
      <div className="q-timer-ring">
        <svg viewBox="0 0 72 72">
          <circle className="bg-circle" cx="36" cy="36" r={radius} strokeDasharray={circumference} />
          <circle className={`fg-circle${danger?' danger':''}`} cx="36" cy="36" r={radius}
            strokeDasharray={circumference} strokeDashoffset={offset} />
        </svg>
        <div className={`q-timer-num${danger?' danger':''}`}>{value}</div>
      </div>
    </div>
  );
}

function Lives({ count }) {
  return (
    <span className="lives-display">
      {Array.from({length:3}).map((_,i) => (
        <span key={i} style={{opacity: i < count ? 1 : 0.2, transition:'opacity 0.3s, transform 0.3s', display:'inline-block', transform: i < count ? 'scale(1)' : 'scale(0.7)'}}>❤️</span>
      ))}
    </span>
  );
}

function FeedbackToast({ feedback }) {
  if (!feedback) return null;
  return (
    <div className="feedback-overlay">
      <div className={`feedback-toast ${feedback.correct ? 'correct' : 'wrong'}`}>
        {feedback.correct ? randomMsg(CORRECT_MSGS) : randomMsg(WRONG_MSGS)}
      </div>
    </div>
  );
}

function Leaderboard({ entries, highlightTime }) {
  const medals = ['🥇','🥈','🥉','4','5'];
  const top5 = entries.slice(0,5);
  return (
    <div className="leaderboard">
      <div className="lb-title">🏆 Top 5 Fastest Times</div>
      {top5.length === 0
        ? <div className="lb-empty">No records yet — be the first! 🌟</div>
        : top5.map((e,i) => (
          <div key={i} className={`lb-row${e.time===highlightTime?' highlight':''}`}>
            <span className="lb-rank">{medals[i]}</span>
            <span style={{flex:1, color:'var(--text-medium)', fontSize:'0.85rem'}}>{e.date}</span>
            <span className="lb-time">{formatTime(e.time)}</span>
          </div>
        ))
      }
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// QUESTION RENDERERS
// ═══════════════════════════════════════════════════════════════

function MCQuestion({ q, onAnswer, disabled, result }) {
  const LETTERS = ['A','B','C','D','E','F'];
  return (
    <div>
      <p className="instruction">Read the question and choose the best answer.</p>
      <div className="q-sentence">{q.question}</div>
      <div className="mc-grid">
        {q.options.map((opt, idx) => {
          let cls = 'mc-btn';
          if (disabled) {
            if (opt === q.answer) cls += ' correct';
            else if (result && result.selected === opt) cls += ' wrong';
          }
          return (
            <button key={opt} className={cls} onClick={() => !disabled && onAnswer(opt)} disabled={disabled}>
              <span className="mc-letter">{LETTERS[idx]}</span>
              {opt}
            </button>
          );
        })}
      </div>
      {disabled && result && !result.correct && (
        <div className="answer-reveal mt-16">
          ✅ The correct answer is: <strong>{q.answer}</strong>
        </div>
      )}
    </div>
  );
}

function FillInQuestion({ q, onAnswer, disabled, result }) {
  const [val, setVal] = useState('');
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { if (inputRef.current) inputRef.current.focus(); }, []);

  function submit() {
    if (disabled || !val.trim()) return;
    const correct = checkFillAnswer(val, q);
    if (!correct) { setShake(true); setTimeout(()=>setShake(false), 500); }
    onAnswer({ value: val.trim(), correct });
  }

  const parts = q.sentence.split('___');

  return (
    <div>
      <p className="instruction">Read the sentence and type the missing word. Press Enter to submit.</p>
      <div className="q-sentence">
        {parts[0]}<span className="blank">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>{parts[1]}
      </div>
      <div className="fill-form">
        <input
          ref={inputRef}
          className={`fill-input${shake?' shake':''}`}
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key==='Enter' && submit()}
          placeholder="Type your answer…"
          disabled={disabled}
          autoComplete="off"
        />
        <button className="btn btn-primary" onClick={submit} disabled={disabled}>Submit</button>
      </div>
      {disabled && result && (
        <div className={`answer-reveal mt-16${!result.correct?' wrong-reveal':''}`}>
          {result.correct
            ? <>✅ Correct! The answer is: <strong>"{q.answer}"</strong></>
            : <>❌ The correct answer is: <strong>"{q.answer}"</strong></>
          }
        </div>
      )}
    </div>
  );
}

function FixQuestion({ q, onAnswer, disabled, result }) {
  const words = q.sentenceWithError.split(' ');
  const [selected, setSelected] = useState(null);
  const [correction, setCorrection] = useState('');
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { if (selected !== null && inputRef.current) inputRef.current.focus(); }, [selected]);

  function submit() {
    if (disabled || selected === null || !correction.trim()) return;
    const pickedWord = words[selected].replace(/[.,!?;:'"]/g, '');
    const isRightWord = pickedWord.toLowerCase() === q.errorWord.toLowerCase();
    const isRightFix  = checkFixCorrection(correction, q);
    if (isRightWord && isRightFix) {
      onAnswer({ correct: true });
    } else {
      setShake(true); setTimeout(()=>setShake(false), 500);
      onAnswer({ correct: false });
    }
  }

  return (
    <div>
      <p className="instruction">This sentence has a mistake! Click the wrong word, then type the correction and press Enter.</p>
      <div className="fix-sentence">
        {words.map((w, i) => (
          <span key={i}
            className={`fix-word${selected===i?' selected':''}`}
            onClick={() => !disabled && setSelected(i)}
          >{w}</span>
        ))}
      </div>
      {selected !== null && !disabled && (
        <div className="fix-correction">
          <div className="fix-hint">You selected: <strong style={{color:'var(--orange)'}}>{words[selected]}</strong> — type the correction:</div>
          <input
            ref={inputRef}
            className={`fill-input${shake?' shake':''}`}
            value={correction}
            onChange={e=>setCorrection(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&submit()}
            placeholder="Corrected word…"
            style={{maxWidth:'320px'}}
            autoComplete="off"
          />
          <button className="btn btn-primary" onClick={submit}>Submit</button>
        </div>
      )}
      {disabled && (
        <div className={`answer-reveal mt-16${result && !result.correct?' wrong-reveal':''}`}>
          {result && result.correct
            ? <>✅ Correct! "<strong>{q.errorWord}</strong>" → "<strong>{q.correction}</strong>"</>
            : <>❌ The mistake was "<strong>{q.errorWord}</strong>" → it should be "<strong>{q.correction}</strong>"</>
          }
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN GAME COMPONENT
// ═══════════════════════════════════════════════════════════════

const TOTAL_QUESTIONS = Math.min(20, Q_BANK.length);

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
  const globalTimerRef = useRef(0);
  const livesRef = useRef(3);
  const questionLockedRef = useRef(false);
  const currentIndexRef = useRef(0);

  function startGame() {
    const selected = shuffle(Q_BANK).slice(0, TOTAL_QUESTIONS);
    // Shuffle MC options
    const prepared = selected.map(q => {
      if (q.type === 'mc') return { ...q, options: shuffle([...q.options]) };
      return q;
    });
    setRoundQuestions(prepared);
    setCurrentIndex(0);     currentIndexRef.current = 0;
    setLives(3);            livesRef.current = 3;
    setGlobalTimer(0);      globalTimerRef.current = 0;
    setQuestionResult(null);
    setFeedback(null);
    setQuestionLocked(false); questionLockedRef.current = false;
    setFinalTime(null);
    setNewRecord(false);
    setGameState('playing');
  }

  // Global timer
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

  // Question timer
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

  function handleTimeout() {
    if (questionLockedRef.current) return;
    questionLockedRef.current = true;
    setQuestionLocked(true);
    setFeedback({ correct: false });
    setQuestionResult({ correct: false, timeout: true });
    processResult(false);
  }

  function processResult(correct) {
    const prevLives = livesRef.current;
    const nextLives = correct ? prevLives : prevLives - 1;
    livesRef.current = nextLives < 0 ? 0 : nextLives;
    setLives(livesRef.current);

    if (!correct && livesRef.current <= 0) {
      setTimeout(() => setGameState('gameover'), 1200);
      setTimeout(() => setFeedback(null), 1200);
      return;
    }
    setTimeout(() => {
      setFeedback(null);
      advanceQuestion();
    }, 1200);
  }

  function advanceQuestion() {
    questionLockedRef.current = false;
    setQuestionLocked(false);
    setQuestionResult(null);
    const nextIndex = currentIndexRef.current + 1;
    if (nextIndex >= TOTAL_QUESTIONS) {
      const elapsed = globalTimerRef.current;
      const lb = addToLeaderboard(elapsed);
      const isNew = lb[0] && lb[0].time === elapsed;
      setFinalTime(elapsed);
      setNewRecord(isNew);
      setLeaderboard(lb);
      confettiSystem.launch();
      setGameState('victory');
    } else {
      currentIndexRef.current = nextIndex;
      setCurrentIndex(nextIndex);
    }
  }

  // MC answer
  function handleMCAnswer(answer) {
    if (questionLockedRef.current || gameState !== 'playing') return;
    clearInterval(questionIntervalRef.current);
    questionLockedRef.current = true;
    setQuestionLocked(true);
    const correct = answer === currentQ.answer;
    setQuestionResult({ correct, selected: answer });
    setFeedback({ correct });
    processResult(correct);
  }

  // Fill-in answer
  function handleFillAnswer(ansObj) {
    if (questionLockedRef.current || gameState !== 'playing') return;
    clearInterval(questionIntervalRef.current);
    questionLockedRef.current = true;
    setQuestionLocked(true);
    setQuestionResult({ correct: ansObj.correct });
    setFeedback({ correct: ansObj.correct });
    processResult(ansObj.correct);
  }

  // Fix answer
  function handleFixAnswer(ansObj) {
    if (questionLockedRef.current || gameState !== 'playing') return;
    clearInterval(questionIntervalRef.current);
    questionLockedRef.current = true;
    setQuestionLocked(true);
    const correct = ansObj.correct;
    setQuestionResult({ correct });
    setFeedback({ correct });
    processResult(correct);
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: START
  // ═══════════════════════════════════════════════════════════
  if (gameState === 'start') {
    return (
      <div className="app">
        <div className="main">
          <div className="card start-screen">
            <span className="start-icon">🌍</span>
            <h1 className="start-title">GEO MASTER</h1>
            <div className="start-subtitle">{pack?.title || 'Geography in English'}</div>
            <p className="start-desc">
              {pack ? 'Play with your selected question pack.' : 'Test your geography knowledge with questions about maps, population, resources, migration, and more!'}
              Answer {TOTAL_QUESTIONS} questions before you run out of lives. How fast can you finish? ⚡
            </p>

            <div className="rules-grid">
              <div className="rule-item">
                <span className="rule-icon">🔘</span>
                <div className="rule-text"><strong>Multiple Choice</strong><br/>25s — Pick the best answer</div>
              </div>
              <div className="rule-item">
                <span className="rule-icon">📝</span>
                <div className="rule-text"><strong>Fill in the Blank</strong><br/>30s — Type the missing word</div>
              </div>
              <div className="rule-item">
                <span className="rule-icon">🔍</span>
                <div className="rule-text"><strong>Spot the Mistake</strong><br/>40s — Click the error &amp; fix it</div>
              </div>
            </div>

            <button className="btn btn-primary btn-lg" onClick={startGame}>
              🌍 Start Quiz!
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
            <span className="end-icon">🌎</span>
            <h1 className="end-title defeat">Good Effort!</h1>
            <p className="end-sub">
              You made it to question {currentIndex + 1} of {TOTAL_QUESTIONS}.<br/>
              Keep studying and you'll be a geography expert in no time! 📚✨
            </p>
            <button className="btn btn-primary btn-lg" onClick={startGame}>
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
            <h1 className="end-title victory">CHAMPION!</h1>
            <p className="end-sub">
              You answered all {TOTAL_QUESTIONS} questions with {lives} ❤️ remaining!<br/>
              You're a Geography Superstar! 🌟
            </p>
            {newRecord && (
              <div className="new-record">🌟 NEW PERSONAL BEST! 🌟</div>
            )}
            <div className="final-time">{formatTime(finalTime ?? globalTimer)}</div>
            <button className="btn btn-green btn-lg" onClick={startGame} style={{marginBottom:'12px'}}>
              ⚡ Play Again
            </button>
            <button className="btn btn-ghost" onClick={() => setGameState('start')}>
              ← Back to Menu
            </button>
            <div className="mt-24">
              <Leaderboard entries={leaderboard} highlightTime={finalTime ?? globalTimer} />
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
  const timerMax = getTimerMax(currentQ.type);
  const isDanger = questionTimer < 6 && questionTimer > 0;
  const progress = ((currentIndex) / TOTAL_QUESTIONS) * 100;

  const typeBadge = {
    mc:   'badge-mc',
    fill: 'badge-fill',
    fix:  'badge-fix',
  }[currentQ.type];

  const typeLabel = {
    mc:   '🔘 Multiple Choice',
    fill: '📝 Fill in the Blank',
    fix:  '🔍 Spot the Mistake',
  }[currentQ.type];

  return (
    <div className="app">
      {/* TOP BAR */}
      <div className="topbar">
        <div className="topbar-brand">🌍 GEO MASTER</div>
        <div className="topbar-stats">
          <div className="stat-pill">
            <span className="stat-label">Time</span>
            <span className="stat-value primary">{formatTime(globalTimer)}</span>
          </div>
          <div className="stat-pill">
            <span className="stat-label">Q</span>
            <span className="stat-value">{currentIndex + 1} / {TOTAL_QUESTIONS}</span>
          </div>
          <div className="stat-pill">
            <Lives count={lives} />
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
              <span className={`q-type-badge ${typeBadge}`}>{typeLabel}</span>
              <span className="q-theme-badge">{currentQ.theme}</span>
            </div>
            <QuestionTimer value={questionTimer} max={timerMax} danger={isDanger} />
          </div>

          {/* Question UI */}
          {currentQ.type === 'mc' && (
            <MCQuestion
              key={currentQ.id}
              q={currentQ}
              onAnswer={handleMCAnswer}
              disabled={questionLocked}
              result={questionResult}
            />
          )}
          {currentQ.type === 'fill' && (
            <FillInQuestion
              key={currentQ.id}
              q={currentQ}
              onAnswer={handleFillAnswer}
              disabled={questionLocked}
              result={questionResult}
            />
          )}
          {currentQ.type === 'fix' && (
            <FixQuestion
              key={currentQ.id}
              q={currentQ}
              onAnswer={handleFixAnswer}
              disabled={questionLocked}
              result={questionResult}
            />
          )}
        </div>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
