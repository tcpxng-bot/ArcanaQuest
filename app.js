// app.js — State, Routing, Home Screen, Achievements
'use strict';

// ─── STATE ────────────────────────────────────────────────────────
const STATE_KEY = 'tarot_mastery_v2';

const DEFAULT_STATE = {
  totalXP: 0,
  streak: 0,
  lastStudyDate: null,
  chapterProgress: {},   // { [id]: { storyDone,learnDone,symbolsDone,quizScore,quizDone,reflectionDone,readingDone } }
  reflections: {},       // { [id]: string }
  examPassed: false,
  examBestScore: 0,
  examAttempts: 0,
  badges: [],            // array of badge ids earned
  activeTab: 'journey',
};

let STATE = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    return raw ? Object.assign({}, DEFAULT_STATE, JSON.parse(raw)) : Object.assign({}, DEFAULT_STATE);
  } catch(e) { return Object.assign({}, DEFAULT_STATE); }
}

function saveState() {
  try { localStorage.setItem(STATE_KEY, JSON.stringify(STATE)); } catch(e) {}
}

function getChapterProg(id) {
  if (!STATE.chapterProgress[id]) STATE.chapterProgress[id] = {};
  return STATE.chapterProgress[id];
}

function markSection(chId, section) {
  const p = getChapterProg(chId);
  if (!p[section]) {
    p[section] = true;
    STATE.totalXP += 10;
    saveState();
    checkBadges();
  }
}

function isChapterComplete(chId) {
  const p = getChapterProg(chId);
  return p.storyDone && p.learnDone && p.quizDone;
}

function completedCount() {
  return CHAPTERS.filter(c => isChapterComplete(c.id)).length;
}

function getStreakEmoji() {
  if (STATE.streak >= 7) return '🔥';
  if (STATE.streak >= 3) return '✨';
  return '🌱';
}

// ─── STREAK ───────────────────────────────────────────────────────
function updateStreak() {
  const today = new Date().toDateString();
  if (STATE.lastStudyDate === today) return;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  STATE.streak = (STATE.lastStudyDate === yesterday) ? STATE.streak + 1 : 1;
  STATE.lastStudyDate = today;
  saveState();
}
updateStreak();

// ─── BADGES ───────────────────────────────────────────────────────
const BADGE_DEFS = [
  { id:'first_step',  icon:'🌱', name:'ก้าวแรก',         desc:'เรียนบทเรียนแรกจนครบ',             check: () => completedCount() >= 1 },
  { id:'week_streak', icon:'🔥', name:'7 วันต่อเนื่อง',   desc:'เรียนติดต่อกัน 7 วัน',             check: () => STATE.streak >= 7 },
  { id:'halfway',     icon:'⭐', name:'ครึ่งทาง',         desc:'ผ่าน 11 บทเรียน',                  check: () => completedCount() >= 11 },
  { id:'master',      icon:'🏆', name:'Major Arcana Master', desc:'สอบผ่าน Master Exam ≥ 80%',   check: () => STATE.examPassed },
  { id:'all_done',    icon:'🌟', name:'Journey Complete', desc:'เรียนครบทุก 22 บทเรียน',          check: () => completedCount() >= 22 },
  { id:'journaler',   icon:'📖', name:'นักบันทึก',         desc:'เขียน Reflection ครบ 5 บท',      check: () => Object.values(STATE.reflections).filter(v=>v&&v.trim()).length >= 5 },
];

function checkBadges() {
  let earned = false;
  BADGE_DEFS.forEach(b => {
    if (!STATE.badges.includes(b.id) && b.check()) {
      STATE.badges.push(b.id);
      earned = true;
      showToast(b.icon + ' ได้รับ Badge: ' + b.name + '!');
    }
  });
  if (earned) saveState();
}

// ─── ROUTING ──────────────────────────────────────────────────────
let currentChapterId = null;

function goHome() {
  showScreen('screen-home');
  renderHomeScreen();
}

function goChapter(id) {
  currentChapterId = id;
  showScreen('screen-chapter');
  if (typeof renderChapter === 'function') renderChapter(id);
}

function goExam() {
  showScreen('screen-exam');
  if (typeof renderExam === 'function') renderExam();
}

function goJournal() {
  STATE.activeTab = 'journal';
  saveState();
  goHome();
}

function goReadingLab() {
  showScreen('screen-reading');
  if (typeof renderReadingLab === 'function') renderReadingLab();
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) { el.classList.add('active'); el.scrollTop = 0; }
}

// ─── HOME SCREEN ──────────────────────────────────────────────────
function renderHomeScreen() {
  // stats
  const done = completedCount();
  setText('stat-xp', STATE.totalXP);
  setText('stat-badge', STATE.badges.length > 0 ? STATE.badges.length + ' 🏅' : '—');
  setText('stat-streak', STATE.streak + ' ' + getStreakEmoji());

  // render active tab content
  const tab = STATE.activeTab || 'journey';
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
  document.querySelectorAll('.tab-pane').forEach(p => {
    p.classList.toggle('active', p.dataset.tab === tab);
  });

  if (tab === 'journey') renderJourneyGrid();
  if (tab === 'practice') renderPracticeTab();
  if (tab === 'journal') renderJournal();
  if (tab === 'awards') renderAwards();
}

function renderJourneyGrid() {
  const grid = document.getElementById('journey-grid');
  if (!grid) return;
  const done = completedCount();
  grid.innerHTML = CHAPTERS.map(ch => {
    const prog = getChapterProg(ch.id);
    const complete = isChapterComplete(ch.id);
    const locked = ch.id > 0 && !isChapterComplete(ch.id - 1) && ch.id > done;
    const imgSrc = CARD_IMAGES[ch.id];
    const pct = calcChapterPct(ch.id);
    const cls = complete ? 'completed' : locked ? 'locked' : '';
    const clickFn = locked ? 'showLockedChapter()' : `goChapter(${ch.id})`;
    return `<div class="chapter-card ${cls}" onclick="${clickFn}">
      <img class="card-thumb" src="${imgSrc}" alt="${ch.name}"
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
      <div class="card-thumb-fallback" style="display:none">
        <span class="fnum">${ch.number}</span>
        <span class="fn">${ch.name}</span>
      </div>
      <div class="card-num">${ch.number}</div>
      <div class="card-name">${ch.name}</div>
      <div class="card-nameTH">${ch.nameTH}</div>
      <div class="card-progress">
        <div class="prog-bar"><div class="prog-fill" style="width:${pct}%"></div></div>
      </div>
    </div>`;
  }).join('') + comingSoonStrips();

  // Exam button if all done
  if (done === 22) {
    const examEl = document.getElementById('exam-cta');
    if (examEl) examEl.style.display = 'block';
  }
}

function comingSoonStrips() {
  const suits = [
    { icon:'🔥', name:'Wands' },
    { icon:'💧', name:'Cups' },
    { icon:'🌪', name:'Swords' },
    { icon:'🌱', name:'Pentacles' },
  ];
  return suits.map(s => `
    <div class="coming-soon-strip" style="grid-column:1/-1">
      <span class="cs-icon">${s.icon}</span>
      <div>
        <div style="font-family:'Cinzel',serif;font-size:.8rem;color:var(--text2)">${s.icon} ${s.name}</div>
        <div style="font-size:.75rem;color:var(--text2)">Minor Arcana</div>
      </div>
      <span class="cs-badge">Coming Soon</span>
    </div>`).join('');
}

function calcChapterPct(id) {
  const p = getChapterProg(id);
  const sections = ['storyDone','learnDone','symbolsDone','quizDone','reflectionDone','readingDone'];
  const done = sections.filter(s => p[s]).length;
  return Math.round((done / sections.length) * 100);
}

function renderPracticeTab() {
  const done = completedCount();
  const el = document.getElementById('practice-content');
  if (!el) return;
  if (done < 22) {
    el.innerHTML = `<div class="practice-cta">
      <h3>🎯 เตรียมตัวสอบ</h3>
      <p>เรียนให้ครบทุก 22 บทเรียนก่อน แล้วจึงเข้าสอบ Major Arcana Master Exam</p>
      <div style="margin-top:12px;background:var(--bg3);border-radius:10px;height:8px;overflow:hidden">
        <div style="height:100%;width:${Math.round(done/22*100)}%;background:linear-gradient(90deg,var(--gold-dim),var(--gold))"></div>
      </div>
      <p style="margin-top:8px;font-size:.8rem;color:var(--gold)">${done}/22 บทเรียน</p>
    </div>`;
  } else {
    el.innerHTML = `<div class="practice-cta">
      <h3>🏆 พร้อมสอบ!</h3>
      <p>คุณเรียนครบทุก 22 บทเรียนแล้ว พร้อมสำหรับ Major Arcana Master Exam</p>
      ${STATE.examBestScore > 0 ? `<p style="color:var(--gold);font-family:'Cinzel',serif">คะแนนสูงสุด: ${STATE.examBestScore}%</p>` : ''}
      <br><button class="btn-gold" onclick="goExam()">เริ่มสอบ 50 ข้อ</button>
    </div>`;
  }
}

function renderAwards() {
  const el = document.getElementById('awards-list');
  if (!el) return;
  el.innerHTML = BADGE_DEFS.map(b => {
    const earned = STATE.badges.includes(b.id);
    return `<div class="award-item ${earned ? '' : 'locked'}">
      <div class="award-icon">${b.icon}</div>
      <div>
        <div class="award-name">${b.name}</div>
        <div class="award-desc">${b.desc}</div>
      </div>
      ${earned ? '<span class="badge-new">EARNED</span>' : ''}
    </div>`;
  }).join('');
}

function renderJournal() {
  const el = document.getElementById('journal-entries');
  if (!el) return;
  const entries = CHAPTERS.filter(ch => STATE.reflections[ch.id] && STATE.reflections[ch.id].trim());
  if (entries.length === 0) {
    el.innerHTML = '<div class="journal-empty">✦ ยังไม่มีบันทึก<br><small>เขียน Reflection ในแต่ละบทเรียน</small></div>';
    return;
  }
  el.innerHTML = entries.map(ch => `
    <div class="journal-entry">
      <div class="journal-entry-card">${ch.number} — ${ch.name} · ${ch.nameTH}</div>
      <div class="journal-entry-text">${escapeHtml(STATE.reflections[ch.id])}</div>
    </div>`).join('');
}

// ─── HELPERS ──────────────────────────────────────────────────────
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function showLockedChapter() {
  showToast('เรียนบทก่อนหน้าให้ครบก่อนนะ ✦');
}

function showToast(msg, dur) {
  const old = document.querySelector('.toast');
  if (old) old.remove();
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), dur || 2600);
}

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
}

function resetData() {
  if (confirm('รีเซ็ตข้อมูลทั้งหมด? (ไม่สามารถกู้คืนได้)')) {
    localStorage.removeItem(STATE_KEY);
    location.reload();
  }
}

// ─── INIT ─────────────────────────────────────────────────────────
// Scripts are at end of <body> so DOM is already ready — no DOMContentLoaded needed
function initApp() {
  document.querySelectorAll('.tab-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      STATE.activeTab = btn.dataset.tab;
      saveState();
      renderHomeScreen();
    });
  });
  renderHomeScreen();
  checkBadges();
}

// Run immediately (DOM ready) or on DOMContentLoaded as fallback
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
