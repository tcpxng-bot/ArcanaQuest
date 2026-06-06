// chapter.js — Chapter Screen Renderer
'use strict';

let currentSection = 'story';
let quizState = null;

function renderChapter(id) {
  const ch = CHAPTERS.find(c => c.id === id);
  if (!ch) return;
  const prog = getChapterProg(id);

  // top bar
  setText('ch-title-en', ch.name);
  setText('ch-title-th', ch.nameTH);
  setText('ch-num', ch.number);

  // build tabs
  renderChapterTabs(ch, prog);
  // show first incomplete or default
  const defaultSec = prog.storyDone ? (prog.learnDone ? 'quiz' : 'learn') : 'story';
  showChSection(ch, defaultSec);
}

function renderChapterTabs(ch, prog) {
  const tabs = [
    { key:'story',      label:'✦ เรื่องราว',       done: prog.storyDone },
    { key:'learn',      label:'📖 เรียนรู้',         done: prog.learnDone },
    { key:'symbols',    label:'🔮 สัญลักษณ์',       done: prog.symbolsDone },
    { key:'quiz',       label:'🎯 Quiz',             done: prog.quizDone },
    { key:'reflection', label:'💭 ไตร่ตรอง',         done: prog.reflectionDone },
    { key:'reading',    label:'🃏 การอ่านไพ่',       done: prog.readingDone },
  ];
  const el = document.getElementById('ch-tabs');
  if (!el) return;
  el.innerHTML = tabs.map(t => `
    <button class="ch-tab ${currentSection===t.key?'active':''} ${t.done?'done':''}"
      onclick="showChSection(CHAPTERS.find(c=>c.id===${currentChapterId}), '${t.key}')">
      ${t.label}${t.done ? ' ✓' : ''}
    </button>`).join('');
}

function showChSection(ch, section) {
  currentSection = section;
  const prog = getChapterProg(ch.id);
  renderChapterTabs(ch, prog);

  const body = document.getElementById('ch-body');
  if (!body) return;

  switch (section) {
    case 'story':      body.innerHTML = buildStory(ch); markSection(ch.id, 'storyDone'); break;
    case 'learn':      body.innerHTML = buildLearn(ch); markSection(ch.id, 'learnDone'); break;
    case 'symbols':    body.innerHTML = buildSymbols(ch); markSection(ch.id, 'symbolsDone'); break;
    case 'quiz':       body.innerHTML = buildQuiz(ch); initQuiz(ch); break;
    case 'reflection': body.innerHTML = buildReflection(ch); initReflection(ch); break;
    case 'reading':    body.innerHTML = buildReading(ch); markSection(ch.id, 'readingDone'); break;
  }

  body.scrollTop = 0;
  if (section !== 'quiz') updateChapterProg(ch);
}

// ── STORY ──────────────────────────────────────────────────────────
function buildStory(ch) {
  const imgSrc = CARD_IMAGES[ch.id];
  return `
    <div class="card-hero">
      <img class="card-hero-img" src="${imgSrc}" alt="${ch.name}"
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
      <div class="card-hero-fallback" style="display:none">
        <span style="font-family:'Cinzel',serif;font-size:1.2rem;color:var(--gold2)">${ch.number}</span>
        <span style="font-size:.75rem;color:var(--text2);text-align:center;padding:0 8px">${ch.name}</span>
      </div>
      <div class="card-meta">
        <div class="card-meta-title">${ch.name}</div>
        <div class="card-meta-th">${ch.nameTH}</div>
        <div class="tag-row">
          <span class="tag gold">⚡ ${ch.element}</span>
          <span class="tag gold">🪐 ${ch.planet}</span>
          ${ch.zodiac !== '—' ? `<span class="tag gold">♈ ${ch.zodiac}</span>` : ''}
        </div>
        <div class="kw-wrap">${ch.keywords.map(k=>`<span class="kw-chip">${k}</span>`).join('')}</div>
      </div>
    </div>
    <div class="section-label">การเดินทางของ The Fool</div>
    <div class="prose">${ch.story.split('\n\n').map(p=>`<p>${p}</p>`).join('')}</div>
  `;
}

// ── LEARN ──────────────────────────────────────────────────────────
function buildLearn(ch) {
  return `
    <div class="section-label">ความหมาย</div>
    <div class="meaning-box">
      <h4>🌟 ตั้งตรง</h4>
      <p class="prose">${ch.meaning}</p>
    </div>
    <div class="meaning-box reversed">
      <h4>🔄 กลับหัว</h4>
      <p class="prose">${ch.reversed}</p>
    </div>
    <div class="section-label">Keywords</div>
    <div class="kw-wrap">${ch.keywords.map(k=>`<span class="kw-chip">${k}</span>`).join('')}</div>
    <div class="section-label">ข้อมูลไพ่</div>
    <div class="meaning-box">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:.85rem">
        <div><span style="color:var(--text2)">ธาตุ: </span><span style="color:var(--cream)">${ch.element}</span></div>
        <div><span style="color:var(--text2)">ดาว: </span><span style="color:var(--cream)">${ch.planet}</span></div>
        <div><span style="color:var(--text2)">ราศี: </span><span style="color:var(--cream)">${ch.zodiac}</span></div>
        <div><span style="color:var(--text2)">หมายเลข: </span><span style="color:var(--cream)">${ch.number}</span></div>
      </div>
    </div>
  `;
}

// ── SYMBOLS ────────────────────────────────────────────────────────
function buildSymbols(ch) {
  return `
    <div class="section-label">กดสัญลักษณ์เพื่อเรียนรู้</div>
    <div class="symbol-grid">
      ${ch.symbols.map((s, i) => `
        <div class="symbol-btn" id="sym-${i}" onclick="toggleSymbol(${i})">
          <span class="s-emoji">${s.emoji}</span>
          <div class="s-name">${s.name}</div>
          <div class="symbol-detail">${s.meaning}</div>
        </div>`).join('')}
    </div>
  `;
}

function toggleSymbol(i) {
  const el = document.getElementById('sym-' + i);
  if (el) el.classList.toggle('open');
}

// ── QUIZ ───────────────────────────────────────────────────────────
function buildQuiz(ch) {
  return `<div class="quiz-wrap" id="quiz-container"></div>`;
}

function initQuiz(ch) {
  quizState = {
    ch,
    questions: shuffleArr([...ch.quiz]),
    current: 0,
    correct: 0,
    answered: false,
  };
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const { questions, current, ch } = quizState;
  const container = document.getElementById('quiz-container');
  if (!container) return;

  if (current >= questions.length) {
    showQuizResult();
    return;
  }

  const q = questions[current];
  const pct = Math.round((current / questions.length) * 100);

  container.innerHTML = `
    <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${pct}%"></div></div>
    <div class="quiz-q">${current + 1}/${questions.length} — ${q.q}</div>
    <div class="quiz-opts" id="quiz-opts">
      ${q.opts.map((opt, i) => `
        <button class="quiz-opt" id="opt-${i}" onclick="selectAnswer(${i})">
          ${opt}
        </button>`).join('')}
    </div>
    <div class="quiz-exp" id="quiz-exp">${q.exp}</div>
    <div class="quiz-nav">
      <button class="btn-next" id="btn-next" onclick="nextQuestion()">
        ${current + 1 < questions.length ? 'ถัดไป →' : 'ดูผล →'}
      </button>
    </div>
  `;
  quizState.answered = false;
}

function selectAnswer(i) {
  if (quizState.answered) return;
  quizState.answered = true;
  const q = quizState.questions[quizState.current];
  const correct = q.ans;

  document.querySelectorAll('.quiz-opt').forEach((btn, idx) => {
    btn.classList.add('disabled');
    if (idx === correct) btn.classList.add('correct');
    if (idx === i && i !== correct) btn.classList.add('wrong');
  });

  if (i === correct) quizState.correct++;

  const exp = document.getElementById('quiz-exp');
  if (exp) exp.classList.add('show');
  const btn = document.getElementById('btn-next');
  if (btn) btn.classList.add('show');
}

function nextQuestion() {
  quizState.current++;
  renderQuizQuestion();
}

function showQuizResult() {
  const { correct, questions, ch } = quizState;
  const pct = Math.round((correct / questions.length) * 100);
  const pass = pct >= 60;

  const container = document.getElementById('quiz-container');
  if (!container) return;
  container.innerHTML = `
    <div class="quiz-result">
      <span class="quiz-score-num">${pct}%</span>
      <div class="quiz-score-lbl">${correct}/${questions.length} ข้อถูก</div>
      <div style="margin:16px 0;font-size:1.5rem">${pass ? '🌟' : '💪'}</div>
      <div style="font-size:.9rem;color:var(--text2)">${pass ? 'ยอดเยี่ยม! ผ่านบทเรียนนี้แล้ว' : 'ลองใหม่ได้นะ — ฝึกอีกสักครั้ง'}</div>
      <div style="margin-top:20px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        <button class="btn-outline" onclick="initQuiz(CHAPTERS.find(c=>c.id===${ch.id}))">ทำอีกครั้ง</button>
        <button class="btn-gold" onclick="showChSection(CHAPTERS.find(c=>c.id===${ch.id}),'reflection')">ถัดไป →</button>
      </div>
    </div>
  `;

  // save progress
  const prog = getChapterProg(ch.id);
  prog.quizDone = true;
  prog.quizScore = Math.max(prog.quizScore || 0, pct);
  STATE.totalXP += pass ? 30 : 10;
  saveState();
  checkBadges();
  updateChapterProg(ch);
}

// ── REFLECTION ─────────────────────────────────────────────────────
function buildReflection(ch) {
  const saved = STATE.reflections[ch.id] || '';
  return `
    <div class="section-label">ไตร่ตรองกับตนเอง</div>
    <div class="reflection-prompt">"${ch.reflection}"</div>
    <textarea class="reflection-ta" id="reflection-ta" placeholder="เขียนความคิดของคุณที่นี่...">${escapeHtml(saved)}</textarea>
    <div class="reflection-save">
      <button class="btn-gold" onclick="saveReflection(${ch.id})">บันทึก ✦</button>
    </div>
    ${saved ? '<div style="margin-top:8px;font-size:.8rem;color:var(--success)">✓ บันทึกแล้ว</div>' : ''}
  `;
}

function initReflection(ch) {
  // autosave on input
  const ta = document.getElementById('reflection-ta');
  if (ta) {
    ta.addEventListener('input', () => {
      STATE.reflections[ch.id] = ta.value;
      saveState();
    });
  }
}

function saveReflection(chId) {
  const ta = document.getElementById('reflection-ta');
  if (!ta) return;
  STATE.reflections[chId] = ta.value.trim();
  markSection(chId, 'reflectionDone');
  saveState();
  checkBadges();
  showToast('บันทึกแล้ว ✦');
  updateChapterProg(CHAPTERS.find(c => c.id === chId));
}

// ── READING EXAMPLES ───────────────────────────────────────────────
function buildReading(ch) {
  const cats = [
    { key:'love',    label:'❤️ ความรัก' },
    { key:'career',  label:'💼 การงาน' },
    { key:'finance', label:'💰 การเงิน' },
    { key:'growth',  label:'🌱 พัฒนาตน' },
  ];
  return `
    <div class="section-label">ตัวอย่างการตีความ</div>
    <div class="reading-tabs">
      ${cats.map((c,i) => `<button class="rtab ${i===0?'active':''}" onclick="switchReading('${c.key}',this)">${c.label}</button>`).join('')}
    </div>
    ${cats.map((c,i) => `
      <div class="reading-box ${i===0?'active':''}" id="rdg-${c.key}">
        ${ch.readings[c.key]}
      </div>`).join('')}
  `;
}

function switchReading(key, el) {
  document.querySelectorAll('.rtab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.reading-box').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  const box = document.getElementById('rdg-' + key);
  if (box) box.classList.add('active');
}

// ── HELPERS ────────────────────────────────────────────────────────
function updateChapterProg(ch) {
  if (!ch) return;
  const prog = getChapterProg(ch.id);
  renderChapterTabs(ch, prog);

  // check if whole chapter complete
  if (isChapterComplete(ch.id)) {
    checkBadges();
    saveState();
  }
}

function shuffleArr(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
