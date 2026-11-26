import { bindGameControls } from '../../gallery/shared/runtime.js';
import { mapping } from '../../gallery/shared/input.js';

const slides=[
 {tag:'INTRO',instruction:'Invite three classmates in English.',title:'The Party Invite',html:'<p class="big">Invite someone, ask a question, and remember who accepted.</p><p class="medium muted">Talk to one partner at a time.</p>',seconds:0},
 {tag:'HOW TO PLAY',instruction:'Each conversation has four steps',title:'Invite → ask → answer',html:'<div class="script"><span><b>1 · Host:</b> “Would you like to come to my party?”</span><span><b>2 · Guest:</b> “When is it?” / “What time is it?”</span><span><b>3 · Host:</b> “It’s on Friday at five.”</span><span><b>4 · Guest:</b> “Yes, I’d love to!” / “Sorry, I can’t.”</span></div><p class="notice">Switch partners after each conversation.</p>',seconds:0},
 {tag:'PRACTICE · 4 MIN',instruction:'Listen to an example, then practise with a partner.',title:'Try it once',html:'<div class="two"><div class="card"><div class="label">Your party</div><p>Friday · 5:00 p.m.<br>Music and pizza</p></div><div class="card alt"><div class="label">Ask your partner</div><p>When? What time? What food?</p></div></div><p class="notice">Say an invitation and answer one question.</p>',seconds:240},
 {tag:'ROUND 1 · 7 MIN',instruction:'Invite three different people.',title:'Find your guests',html:'<div class="two"><div class="card"><div class="label">Choose a party</div><p>Saturday · 4:00 p.m.<br>Music + cake</p></div><div class="card alt"><div class="label">Or choose this party</div><p>Sunday · 6:00 p.m.<br>Games + pizza</p></div></div><p class="notice">Ask for the day or time before you accept or decline. Count how many people accept.</p>',seconds:420},
 {tag:'ROUND 2 · 7 MIN',instruction:'You cannot make the first time.',title:'Change the time',html:'<div class="script"><span><b>Host:</b> “Would you like to come on Saturday at four?”</span><span><b>Guest:</b> “Sorry, I can’t at four. How about six?”</span><span><b>Host:</b> “Six works!” / “How about five?”</span><span><b>Guest:</b> “Great. I’ll be there!”</span></div><p class="notice">Talk to two classmates and agree on a time with each one.</p>',seconds:420},
 {tag:'ROUND 3 · 7 MIN',instruction:'Add food and give a reason.',title:'Make it your party',html:'<div class="two"><div class="card green"><div class="label">Host</div><p>“Come on ___ at ___! We’ll have ___ because ___.”</p></div><div class="card alt"><div class="label">Guest</div><p>“What will we do?”<br>“Can I bring ___?”</p></div></div><p class="notice">Invite two classmates. Each guest asks a follow-up question.</p>',seconds:420},
 {tag:'FINAL · 8 MIN',instruction:'Tell the group about your party.',title:'Tell us your plan',html:'<div class="script"><span>“My party is on ___ at ___.”</span><span>“We will have ___.”</span><span>“___ and ___ are coming.”</span><span>“I changed the time because ___.”</span></div><p class="notice">Share your plans in two to four sentences. Ask your guests to confirm.</p>',seconds:480}
];

let index = 0, remaining = 0, interval, deadline, disposeControls;
const el = id => document.getElementById(id);

function stop() {
  clearInterval(interval);
  interval = null;
  el('timer').textContent = remaining ? 'Start' : 'Restart timer';
}
function showTime() {
  const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
  const seconds = String(remaining % 60).padStart(2, '0');
  el('clock').textContent = minutes + ':' + seconds;
  el('clock').classList.toggle('done', remaining === 0 && slides[index].seconds > 0);
}
function tick() {
  remaining = Math.ceil(Math.max(0, deadline - Date.now()) / 1000);
  showTime();
  if (!remaining) {
    stop();
    el('timer-status').textContent = 'Time is up.';
  }
}
function render() {
  const slide = slides[index];
  remaining = slide.seconds;
  stop();
  el('timer-status').textContent = '';
  el('stage').innerHTML = `<div class="topline"><span class="round">${slide.tag}</span><span class="instruction">${slide.instruction}</span></div><h1 tabindex="-1">${slide.title}</h1><div class="panel">${slide.html}</div>`;
  el('progress').textContent = (index + 1) + ' / ' + slides.length;
  el('prev').disabled = index === 0;
  el('next').textContent = index === slides.length - 1 ? 'Back to start ↻' : 'Next →';
  el('timer').disabled = el('reset').disabled = !slide.seconds;
  showTime();
  renderControls();
}
function go(delta) {
  index = (index + delta + slides.length) % slides.length;
  render();
  el('stage').querySelector('h1').focus();
}
function toggle() {
  if (interval !== null) {
    tick();
    stop();
    return;
  }
  if (!remaining) remaining = slides[index].seconds;
  deadline = Date.now() + remaining * 1000;
  el('timer-status').textContent = '';
  el('timer').textContent = 'Pause';
  interval = setInterval(tick, 200);
  showTime();
}
el('prev').onclick = () => go(-1);
el('next').onclick = () => go(1);
el('timer').onclick = toggle;
el('reset').onclick = () => {
  remaining = slides[index].seconds;
  stop();
  el('timer-status').textContent = '';
  showTime();
};
el('fullscreen').onclick = async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch {
    el('timer-status').textContent = 'Full screen is unavailable in this browser.';
  }
};
document.addEventListener('keydown', event => {
  if (event.key !== 'ArrowLeft' || event.repeat || index === 0) return;
  const { keys } = mapping();
  if (keys.next === event.code || (slides[index].seconds && keys.confirm === event.code)) return;
  event.preventDefault();
  go(-1);
});
window.addEventListener('pagehide', () => clearInterval(interval));
window.addEventListener('pageshow', event => {
  if (!event.persisted) return;
  if (interval !== null) {
    tick();
    if (remaining) interval = setInterval(tick, 200);
  }
  renderControls();
});
function renderControls() {
  disposeControls?.();
  disposeControls = bindGameControls('party-mingle', {
    next: () => el('next').click(),
    ...(slides[index].seconds ? { confirm: () => el('timer').click() } : {})
  });
}
render();
