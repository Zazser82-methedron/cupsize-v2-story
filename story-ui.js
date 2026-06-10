'use strict';
// ════════════════════════════════════════════════════════════════════════════
// story-ui.js — фан-фичи интерфейса: эквалайзер, бит-пульс, интро трека,
// шафл, поделиться, deep-link ?t=N, цитаты на треклисте, титры альбома
// ════════════════════════════════════════════════════════════════════════════

// ─── Интро-карточка трека (рукописный титул при открытии) ────────────────────
const introEl = document.createElement('div');
introEl.className = 'track-intro';
introEl.innerHTML = '<div class="ti-num"></div><div class="ti-title"></div><div class="ti-mood"></div>';
pStage.appendChild(introEl);
let introTimer = null;
function showIntro(t) {
  clearTimeout(introTimer);
  introEl.querySelector('.ti-num').textContent = '№ ' + String(t.n).padStart(2, '0');
  introEl.querySelector('.ti-title').textContent = t.title;
  introEl.querySelector('.ti-mood').textContent = '· ' + (t.mood || '') + ' ·';
  introEl.classList.remove('show');
  void introEl.offsetWidth; // перезапуск css-анимации
  introEl.classList.add('show');
  introTimer = setTimeout(() => introEl.classList.remove('show'), 2600);
}

// ─── Обёртка openTrack: интро + ссылка для шаринга ────────────────────────────
const _openTrack0 = openTrack;
openTrack = function (t) {
  _openTrack0(t);
  showIntro(t);
  try { history.replaceState(null, '', location.pathname + '?t=' + t.n); } catch (e) {}
};

// ─── Эквалайзер (рисованные столбики в бит) ───────────────────────────────────
const metaRow = document.querySelector('.p-meta-row');
const eqC = document.createElement('canvas');
eqC.id = 'eqCanvas'; eqC.width = 92; eqC.height = 30;
metaRow.insertBefore(eqC, metaRow.firstChild);
const eqx = eqC.getContext('2d');
const EQ_N = 9;
const eqH = new Array(EQ_N).fill(0.1);

function uiFrame() {
  requestAnimationFrame(uiFrame);
  if (!overlay.classList.contains('open')) return;
  // бит-пульс в CSS
  document.documentElement.style.setProperty('--beat', AUD.beat.toFixed(3));
  // эквалайзер
  eqx.clearRect(0, 0, 92, 30);
  const wob = Math.sin(Math.floor(performance.now() / 90));
  for (let i = 0; i < EQ_N; i++) {
    const f = i / (EQ_N - 1);
    const target = Math.max(0.08,
      AUD.bass * Math.max(0, 1 - f * 2.2) +
      AUD.mid * Math.max(0, 1 - Math.abs(f - 0.5) * 2.6) +
      AUD.high * Math.max(0, 1 - (1 - f) * 2.2));
    eqH[i] += (Math.min(1, target * 1.5) - eqH[i]) * 0.3;
    const h = 3 + eqH[i] * 24;
    const x = 3 + i * 10 + wob * 0.4;
    eqx.strokeStyle = i % 3 === 1 ? 'rgba(184,34,14,0.75)' : 'rgba(26,22,18,0.65)';
    eqx.lineWidth = 1.2;
    eqx.strokeRect(x, 28 - h, 6.5, h);
    eqx.fillStyle = i % 3 === 1 ? 'rgba(184,34,14,0.18)' : 'rgba(26,22,18,0.12)';
    eqx.fillRect(x, 28 - h, 6.5, h);
  }
}
uiFrame();

// ─── Шафл ─────────────────────────────────────────────────────────────────────
function randomTrack() {
  let pool = TRACKS;
  if (currentTrack) pool = TRACKS.filter(t => t.n !== currentTrack.n);
  openTrack(pool[Math.floor(Math.random() * pool.length)]);
}
const shuffleBtn = document.createElement('button');
shuffleBtn.className = 'p-loop-btn'; shuffleBtn.id = 'pShuffle';
shuffleBtn.title = 'случайный трек'; shuffleBtn.textContent = '⤮';
document.querySelector('.p-center-btns').insertBefore(shuffleBtn, pClose);
shuffleBtn.addEventListener('click', randomTrack);

const tlShuffle = document.createElement('button');
tlShuffle.className = 'tl-shuffle-btn';
tlShuffle.innerHTML = '⚂ &nbsp;мне повезёт — случайный трек';
document.querySelector('.ya-section').appendChild(tlShuffle);
tlShuffle.addEventListener('click', randomTrack);

// ─── Поделиться треком ────────────────────────────────────────────────────────
const shareBtn = document.createElement('button');
shareBtn.className = 'p-share-btn';
shareBtn.textContent = 'поделиться ↗';
metaRow.appendChild(shareBtn);
shareBtn.addEventListener('click', async () => {
  if (!currentTrack) return;
  const url = location.origin + location.pathname + '?t=' + currentTrack.n;
  try {
    await navigator.clipboard.writeText(url);
    toast('ссылка скопирована ♥');
  } catch (e) {
    toast(url);
  }
});

let toastEl = null, toastTimer = null;
function toast(msg) {
  if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'ui-toast'; document.body.appendChild(toastEl); }
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
}

// ─── Deep-link ?t=N ──────────────────────────────────────────────────────────
(function () {
  const m = new URLSearchParams(location.search).get('t');
  const n = m ? parseInt(m, 10) : NaN;
  const tr = TRACKS.find(t => t.n === n);
  if (!tr) return;
  function go() {
    pg1.classList.remove('active');
    pg2.classList.add('active');
    buildZones();
    openTrack(tr);
  }
  if (sessionStorage.getItem('zmk_ok')) {
    // сессия уже подтверждена — открываем сразу (звук запустится по первому клику, если браузер заблокирует)
    setTimeout(go, 400);
  } else {
    btnYes.addEventListener('click', () => setTimeout(go, 500), { once: true });
  }
})();

// ─── Цитаты из песен на странице треклиста ────────────────────────────────────
const QUOTES = [
  'а я плыву в облаках…', 'красиво падает снег в январе', 'если уходить — уходи красиво',
  'мы очень ждём тебя, найдись', 'ты теперь черновик…', 'мама, я люблю тебя',
  'станцуй со мной', 'видимо, песня спета', 'я без ума от тебя', 'мы с юга на север',
  'мои колени — вата', 'давай представим, что мы где-то', 'я прокачу тебя на велосипеде',
  'ты хочешь со мной', 'мы выглядим так клёво', 'ты никогда не будешь одна',
  'прыгай со мною, дура, до утра'
];
const QUOTE_SPOTS = [
  { left: '4%', top: '18%', rot: -7 }, { right: '3%', top: '30%', rot: 5 },
  { left: '6%', bottom: '24%', rot: 4 }, { right: '5%', bottom: '14%', rot: -5 },
  { left: '2%', top: '55%', rot: -3 }
];
const quoteEls = QUOTE_SPOTS.map(s => {
  const el = document.createElement('span');
  el.className = 'floating-quote';
  for (const k of ['left', 'right', 'top', 'bottom']) if (s[k]) el.style[k] = s[k];
  el.style.setProperty('--qrot', s.rot + 'deg');
  pg2.appendChild(el);
  return el;
});
let qIdx = 0;
function cycleQuotes() {
  quoteEls.forEach((el, i) => {
    el.classList.remove('show');
    setTimeout(() => {
      el.textContent = '«' + QUOTES[(qIdx + i) % QUOTES.length] + '»';
      el.classList.add('show');
    }, 700 + i * 350);
  });
  qIdx = (qIdx + quoteEls.length) % QUOTES.length;
}
cycleQuotes();
setInterval(cycleQuotes, 14000);

// ─── Титры после последнего трека ────────────────────────────────────────────
const creditsEl = document.createElement('div');
creditsEl.id = 'creditsOverlay';
creditsEl.innerHTML =
  '<div class="credits-scroll">' +
  '<p class="cr-head">заставь меня плакать</p>' +
  '<p class="cr-sub">cupsize · 26 треков · одна жизнь</p>' +
  '<div class="cr-list">' +
  TRACKS.map(t => '<p>' + String(t.n).padStart(2, '0') + ' · ' + t.title + '</p>').join('') +
  '</div>' +
  '<p class="cr-thanks">спасибо, что дослушал до конца ♥</p>' +
  '<p class="cr-end">конец</p>' +
  '</div>';
document.body.appendChild(creditsEl);
creditsEl.addEventListener('click', () => creditsEl.classList.remove('show'));
window.showCredits = function () {
  creditsEl.classList.add('show');
  const sc = creditsEl.querySelector('.credits-scroll');
  sc.style.animation = 'none'; void sc.offsetWidth; sc.style.animation = '';
};
// триггер: конец 26-го трека (без главного main.js — опрос позиции)
setInterval(() => {
  if (!currentTrack || currentTrack.n !== 26 || !howl || !howlPlaying) return;
  try {
    const pos = howl.seek(), dur = howl.duration();
    if (typeof pos === 'number' && dur > 0 && dur - pos < 0.8) window.showCredits();
  } catch (e) {}
}, 600);

window.__STORY_UI = true;
