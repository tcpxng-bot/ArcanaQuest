// script.js — Core Game Logic v2

// ─── State ───────────────────────────────────────────────────────
const STATE = {
  score: 0,
  level: 1,
  combo: 0,
  maxCombo: 0,
  totalAnswered: 0,
  totalCorrect: 0,
  badges: [],
  progress: {},
  wrongQuestions: [],
  reviewQueue: [],
  sessionHistory: [],
  completedLessons: [],
  soundEnabled: true,
  currentQuestion: null,
  currentLevel: 1,
  questionPool: [],
  poolIndex: 0,
  answered: false,
};

const BADGES = [
  { id:"beginner",     name:"Beginner Reader",     icon:"🌟", threshold:100,  description:"ก้าวแรกสู่โลกแห่งทาโรต์" },
  { id:"student",      name:"Tarot Student",        icon:"📖", threshold:300,  description:"เรียนรู้ความหมายไพ่อย่างจริงจัง" },
  { id:"apprentice",   name:"Apprentice Reader",    icon:"🔮", threshold:600,  description:"เริ่มอ่านไพ่ได้อย่างมั่นใจ" },
  { id:"practitioner", name:"Tarot Practitioner",   icon:"✨", threshold:1000, description:"ผู้ปฏิบัติที่มีทักษะ" },
  { id:"professional", name:"Professional Reader",  icon:"👑", threshold:1500, description:"นักอ่านไพ่ระดับมืออาชีพ" },
];

const LEVEL_INFO = [
  { num:1, name:"Card Recognition", icon:"🃏", desc:"จำชื่อและความหมายหลักของไพ่ 22 ใบ", total:50 },
  { num:2, name:"Keywords Mastery",  icon:"🔑", desc:"จำ Keywords สำคัญของแต่ละไพ่",        total:50 },
  { num:3, name:"Reversed Cards",    icon:"🔄", desc:"เรียนรู้ความหมายไพ่กลับหัว",           total:30 },
  { num:4, name:"Symbol Reading",    icon:"👁", desc:"ตีความสัญลักษณ์ในไพ่แต่ละใบ",          total:15 },
  { num:5, name:"Tarot Ethics",      icon:"⚖️", desc:"จรรยาบรรณนักอ่านไพ่",                 total:12 },
  { num:6, name:"Case Study",        icon:"📋", desc:"วิเคราะห์สถานการณ์จากไพ่หลายใบ",       total:8  },
  { num:7, name:"Real Tarot Reader", icon:"🌙", desc:"เขียนคำทำนายด้วยตนเอง",                total:null },
];

// ─── Storage ─────────────────────────────────────────────────────
function saveState() {
  const toSave = {
    score:STATE.score, level:STATE.level,
    combo:STATE.combo, maxCombo:STATE.maxCombo,
    totalAnswered:STATE.totalAnswered, totalCorrect:STATE.totalCorrect,
    badges:STATE.badges, progress:STATE.progress,
    wrongQuestions:STATE.wrongQuestions, soundEnabled:STATE.soundEnabled,
    completedLessons:STATE.completedLessons||[],
  };
  try { localStorage.setItem('tarot_state', JSON.stringify(toSave)); } catch(e) {}
}

function syncLevelProgress(levelNum) {
  const info = LEVEL_INFO.find(l => l.num === Number(levelNum));
  const prog = STATE.progress[levelNum];
  if (!info || !prog || !info.total) return;

  if ((prog.answered || 0) >= info.total) {
    prog.completed = true;
    STATE.level = Math.max(STATE.level || 1, info.num + 1);
  }
}

function syncAllProgress() {
  LEVEL_INFO.forEach(l => {
    if (!STATE.progress[l.num]) STATE.progress[l.num] = { answered:0, correct:0, completed:false };
    syncLevelProgress(l.num);
  });
}

function loadState() {
  try {
    const saved = localStorage.getItem('tarot_state');
    if (saved) Object.assign(STATE, JSON.parse(saved));
  } catch(e) {}
  if (!STATE.completedLessons) STATE.completedLessons = [];
  syncAllProgress();
  saveState();
}

// ─── Audio ───────────────────────────────────────────────────────
function playSound(type) {
  if (!STATE.soundEnabled) return;
  try {
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    if (type === 'correct') {
      o.frequency.setValueAtTime(523,ctx.currentTime);
      o.frequency.setValueAtTime(659,ctx.currentTime+.1);
      o.frequency.setValueAtTime(784,ctx.currentTime+.2);
      g.gain.setValueAtTime(.3,ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.5);
      o.start(); o.stop(ctx.currentTime+.5);
    } else if (type === 'wrong') {
      o.type='sawtooth';
      o.frequency.setValueAtTime(200,ctx.currentTime);
      o.frequency.setValueAtTime(150,ctx.currentTime+.15);
      g.gain.setValueAtTime(.2,ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.4);
      o.start(); o.stop(ctx.currentTime+.4);
    } else if (type === 'badge') {
      [523,659,784,1047].forEach((f,i) => {
        const oo=ctx.createOscillator(), gg=ctx.createGain();
        oo.connect(gg); gg.connect(ctx.destination);
        oo.frequency.value=f;
        gg.gain.setValueAtTime(.2,ctx.currentTime+i*.1);
        gg.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+i*.1+.3);
        oo.start(ctx.currentTime+i*.1); oo.stop(ctx.currentTime+i*.1+.3);
      });
    }
  } catch(e) {}
}

// ─── Card filename map ───────────────────────────────────────────
const CARD_FILES = {
  0:'RWS_Tarot_00_Fool.jpg',     1:'RWS_Tarot_01_Magician.jpg',
  2:'RWS_Tarot_02_High_Priestess.jpg', 3:'RWS_Tarot_03_Empress.jpg',
  4:'RWS_Tarot_04_Emperor.jpg',  5:'RWS_Tarot_05_Hierophant.jpg',
  6:'RWS_Tarot_06_Lovers.jpg',   7:'RWS_Tarot_07_Chariot.jpg',
  8:'RWS_Tarot_08_Strength.jpg', 9:'RWS_Tarot_09_Hermit.jpg',
  10:'RWS_Tarot_10_Wheel_of_Fortune.jpg', 11:'RWS_Tarot_11_Justice.jpg',
  12:'RWS_Tarot_12_Hanged_Man.jpg', 13:'RWS_Tarot_13_Death.jpg',
  14:'RWS_Tarot_14_Temperance.jpg', 15:'RWS_Tarot_15_Devil.jpg',
  16:'RWS_Tarot_16_Tower.jpg',   17:'RWS_Tarot_17_Star.jpg',
  18:'RWS_Tarot_18_Moon.jpg',    19:'RWS_Tarot_19_Sun.jpg',
  20:'RWS_Tarot_20_Judgement.jpg', 21:'RWS_Tarot_21_World.jpg',
};
const APP_BASE_URL = (() => {
  const script = document.currentScript || Array.from(document.scripts || []).find(s => (s.src || '').endsWith('/script.js'));
  return new URL('.', script ? script.src : window.location.href).href;
})();
function cardImg(id) {
  return new URL(`assets/cards/${CARD_FILES[id]||'RWS_Tarot_00_Fool.jpg'}`, APP_BASE_URL).href;
}
function cardFallback(c) {
  return `<div class="card-fallback" style="display:none"><span class="cf-num">${c.number}</span><span class="cf-name">${c.name}</span></div>`;
}

// ─── Question Logic ──────────────────────────────────────────────
function buildQuestionPool(levelNum) {
  const key = `level${levelNum}`;
  let pool = [...(QUESTION_BANK[key]||[])];
  for (let i=pool.length-1;i>0;i--) {
    const j=Math.floor(Math.random()*(i+1));
    [pool[i],pool[j]]=[pool[j],pool[i]];
  }
  STATE.reviewQueue.forEach((id,i) => {
    const q=findQuestionById(id);
    const at=Math.min((i+1)*5,pool.length);
    if (q && !pool.find(p=>p.id===id)) pool.splice(at,0,q);
  });
  return pool;
}

function findQuestionById(id) {
  for (const key of Object.keys(QUESTION_BANK)) {
    const found = QUESTION_BANK[key].find(q=>q.id===id);
    if (found) return found;
  }
  return null;
}

function getNextQuestion() {
  if (STATE.poolIndex >= STATE.questionPool.length) {
    STATE.poolIndex=0;
    STATE.questionPool=buildQuestionPool(STATE.currentLevel);
  }
  return STATE.questionPool[STATE.poolIndex++];
}

// ─── Score & Badges ──────────────────────────────────────────────
function addScore(points, isCorrect) {
  if (isCorrect) {
    STATE.combo++;
    if (STATE.combo > STATE.maxCombo) STATE.maxCombo=STATE.combo;
    let bonus=0;
    if (STATE.combo>=5 && STATE.combo%5===0) { bonus=20; showComboBonus(); }
    STATE.score += points+bonus;
    STATE.totalCorrect++;
    playSound('correct');
    checkBadges();
  } else {
    STATE.combo=0;
    playSound('wrong');
    const qId=STATE.currentQuestion.id;
    if (!STATE.wrongQuestions.includes(qId)) STATE.wrongQuestions.push(qId);
    if (!STATE.reviewQueue.includes(qId)) STATE.reviewQueue.push(qId);
  }
  STATE.totalAnswered++;
  updateHUD();
  saveState();
}

function checkBadges() {
  BADGES.forEach(b => {
    if (STATE.score>=b.threshold && !STATE.badges.includes(b.id)) {
      STATE.badges.push(b.id);
      showBadgeNotification(b);
      playSound('badge');
      saveState();
    }
  });
}

function showComboBonus() {
  const el=document.getElementById('combo-bonus');
  if (!el) return;
  el.textContent=`🔥 COMBO x${STATE.combo}! +20`;
  el.classList.add('animate-in');
  setTimeout(()=>el.classList.remove('animate-in'),1800);
}

function showBadgeNotification(badge) {
  const el=document.getElementById('badge-notification');
  if (!el) return;
  document.getElementById('badge-notif-icon').textContent=badge.icon;
  document.getElementById('badge-notif-name').textContent=badge.name;
  el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'),3500);
}

function updateHUD() {
  const sc=document.getElementById('score-display');
  if (sc) sc.textContent=STATE.score.toLocaleString();
  const co=document.getElementById('combo-display');
  if (co) {
    if (STATE.combo>1) { co.textContent=`🔥×${STATE.combo}`; co.classList.remove('hidden'); }
    else co.classList.add('hidden');
  }
  updateProgressBar();
}

function updateProgressBar() {
  const prog=STATE.progress[STATE.currentLevel];
  if (!prog) return;
  const info=LEVEL_INFO.find(l=>l.num===STATE.currentLevel);
  const pct=info&&info.total ? Math.min(100,(prog.answered/info.total)*100) : 0;
  const bar=document.getElementById('progress-fill');
  if (bar) bar.style.width=pct+'%';
  const lbl=document.getElementById('progress-label');
  if (lbl&&info&&info.total) lbl.textContent=`${Math.min(prog.answered||0,info.total)}/${info.total}`;
}

// ─── Render Question ─────────────────────────────────────────────
function renderQuestion(q) {
  STATE.currentQuestion=q;
  STATE.answered=false;
  const container=document.getElementById('question-container');
  if (!container) return;

  let cardHTML='';
  if (q.cardId !== undefined) {
    const c=MAJOR_ARCANA.find(x=>x.id===q.cardId);
    if (c) {
      cardHTML=`<div class="card-frame">
        <img src="${cardImg(c.id)}" alt="${c.name}" class="card-frame-img"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        ${cardFallback(c)}
      </div>
      <p style="text-align:center;font-size:.78rem;color:var(--cream-dim);margin-bottom:.5rem">${c.name} — ${c.nameTH}</p>`;
    }
  }
  if (q.cards) {
    const imgs=q.cards.map(id=>{
      const c=MAJOR_ARCANA.find(x=>x.id===id);
      return c?`<div class="cm-item">
        <img src="${cardImg(c.id)}" alt="${c.name}" style="max-width:90px;max-height:145px;border-radius:5px;border:1px solid var(--border)"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        ${cardFallback(c)}
        <span class="cm-label">${c.name}</span>
      </div>`:''}).join('');
    cardHTML=`<div class="card-frame"><div class="card-multi">${imgs}</div></div>
      <p style="text-align:center;font-size:.82rem;color:var(--cream-dim);margin-bottom:.5rem">${q.situation||''}</p>`;
  }

  const optHtml=q.options.map((opt,i)=>`
    <button class="option-btn" data-index="${i}" onclick="handleAnswer(${i})">
      <span class="opt-letter">${['A','B','C','D'][i]}</span>
      <span class="opt-text">${opt}</span>
    </button>`).join('');

  container.innerHTML=`
    ${cardHTML}
    <p class="q-text">${q.question}</p>
    <div class="options-grid">${optHtml}</div>
    <div id="explanation-box" class="explanation-box hidden"></div>`;

  updateProgressBar();
}

function handleAnswer(idx) {
  if (STATE.answered) return;
  STATE.answered=true;
  const q=STATE.currentQuestion;
  const correct=idx===q.correct;

  document.querySelectorAll('.option-btn').forEach((btn,i)=>{
    btn.disabled=true;
    if (i===q.correct) btn.classList.add('correct');
    else if (i===idx&&!correct) btn.classList.add('wrong');
  });

  const exp=document.getElementById('explanation-box');
  if (exp) {
    exp.classList.remove('hidden');
    exp.innerHTML=`
      <p class="exp-text"><strong>${correct?'✨ ถูกต้อง!':'❌ ไม่ถูกต้อง'}</strong>${correct?' +10 คะแนน':''}</p>
      <p class="exp-text" style="margin-top:.4rem">${q.explanation}</p>
      <p class="exp-text" style="margin-top:.25rem;color:var(--gold)">🔑 ${q.keyword}</p>
      <button class="next-btn" onclick="nextQuestion()">ต่อไป →</button>`;
  }

  const prog = STATE.progress[STATE.currentLevel];
  if (prog) {
    prog.answered = (prog.answered || 0) + 1;
    if (correct) prog.correct = (prog.correct || 0) + 1;
    syncLevelProgress(STATE.currentLevel);
  }
  addScore(10,correct);
  if (correct && STATE.reviewQueue.includes(q.id))
    STATE.reviewQueue=STATE.reviewQueue.filter(id=>id!==q.id);
}

function nextQuestion() {
  const q=getNextQuestion();
  if (q) renderQuestion(q);
}

// ─── Screen Navigation ───────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const t=document.getElementById(id);
  if (t) t.classList.add('active');
}

function startLevel(levelNum) {
  if (levelNum===7) { loadLevel7(); return; }
  STATE.currentLevel=levelNum;
  STATE.questionPool=buildQuestionPool(levelNum);
  STATE.poolIndex=0;

  const info=LEVEL_INFO.find(l=>l.num===levelNum);
  switchScreenWithTitle('screen-game', `Level ${levelNum}: ${info?info.name:''}`);
  document.getElementById('level-header').textContent=info ? `${info.icon} Level ${levelNum}: ${info.name}` : '';

  nextQuestion();
  updateHUD();
}

function goHome() {
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById('screen-home').classList.add('active');
  document.getElementById('top-bar').classList.add('hidden');
  renderHomeScreen();
  window.scrollTo(0,0);
}

function switchScreenWithTitle(screenId, title) {
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
  const tb=document.getElementById('top-bar');
  const tt=document.getElementById('top-bar-title');
  tb.classList.remove('hidden');
  if (tt) tt.textContent=title||'';
  window.scrollTo(0,0);
}

function navBack() { goHome(); }

function renderHomeScreen() {
  // Score & badge
  const sc=document.getElementById('home-score');
  if (sc) sc.textContent=STATE.score.toLocaleString();
  const earned=BADGES.filter(b=>STATE.badges.includes(b.id));
  const cur=earned[earned.length-1];
  const be=document.getElementById('home-badge');
  if (be) be.textContent=cur?`${cur.icon} ${cur.name}`:'🌱 ยังไม่มี';
  const st=document.getElementById('home-streak');
  if (st) st.textContent=`${STATE.maxCombo||0}🔥`;

  // Level grid
  const grid=document.getElementById('level-grid');
  if (!grid) return;
  syncAllProgress();
  grid.innerHTML=LEVEL_INFO.map(info=>{
    const prog=STATE.progress[info.num]||{answered:0,correct:0,completed:false};
    const pct=info.total?Math.min(100,Math.round((prog.answered/info.total)*100)):0;
    const prevInfo = LEVEL_INFO.find(l => l.num === info.num - 1);
    const prevProg = STATE.progress[info.num-1];
    const prevCompleted = !prevInfo || !prevInfo.total || !!prevProg?.completed || (prevProg?.answered || 0) >= prevInfo.total;
    const locked=info.num>1 && !prevCompleted;
    const rightHTML = locked
      ? '<span style="font-size:1.1rem">🔒</span>'
      : `<span class="lv-pct">${pct}%</span><div class="lv-bar"><div class="lv-bar-fill" style="width:${pct}%"></div></div>`;
    const clickFn = locked ? 'showLockedMsg()' : `startLevel(${info.num})`;
    return `<div class="level-card${locked?' locked':''}" onclick="${clickFn}">
      <div class="lv-icon">${info.icon}</div>
      <div>
        <div class="lv-num">Level ${info.num}</div>
        <div class="lv-name">${info.name}</div>
        <div class="lv-desc">${info.desc}</div>
      </div>
      <div class="lv-right">${rightHTML}</div>
    </div>`;
  }).join('');

  // Refresh lessons grid
  if (typeof renderLessonGrid === 'function') renderLessonGrid();
  if (typeof renderBadgesHome === 'function') renderBadgesHome();
  if (typeof renderStatsHome === 'function') renderStatsHome();
}

function showLockedMsg() {
  alert('ทำ Level ก่อนหน้าให้ครบก่อนนะ 🔮');
}

function toggleSound() {
  STATE.soundEnabled=!STATE.soundEnabled;
  document.querySelectorAll('#sound-btn,#sound-btn-l7').forEach(b=>{ if(b) b.textContent=STATE.soundEnabled?'🔊':'🔇'; });
  saveState();
}

// ─── Level 7 ─────────────────────────────────────────────────────
const L7_PROMPTS=[
  {question:"ถามเรื่องการเปลี่ยนงาน",cards:[0,7,19]},
  {question:"ถามเรื่องความรัก",cards:[6,3,14]},
  {question:"ถามเรื่องเส้นทางชีวิต",cards:[9,11,21]},
  {question:"ถามเรื่องการเงิน",cards:[1,4,10]},
  {question:"ถามเรื่องการตัดสินใจสำคัญ",cards:[2,12,20]},
];

function loadLevel7() {
  switchScreenWithTitle('screen-level7','Real Tarot Reader');
  generateLevel7Question();
}

function generateLevel7Question() {
  const p=L7_PROMPTS[Math.floor(Math.random()*L7_PROMPTS.length)];
  const cardEls=document.getElementById('l7-cards');
  const qEl=document.getElementById('l7-question');
  if (cardEls) {
    cardEls.innerHTML=p.cards.map(id=>{
      const c=MAJOR_ARCANA.find(x=>x.id===id);
      return c?`<div class="cm-item">
        <img src="${cardImg(c.id)}" alt="${c.name}" style="width:90px;height:145px;object-fit:cover;border-radius:6px;border:1px solid var(--border)"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        ${cardFallback(c)}
        <span class="cm-label">${c.name}</span>
        <span class="cm-label" style="color:var(--cream-dim)">${c.keywords.slice(0,2).join(' · ')}</span>
      </div>`:'';
    }).join('');
  }
  if (qEl) qEl.textContent=`ลูกค้า ${p.question}`;
  window.currentL7=p;
}

function submitLevel7() {
  const input=document.getElementById('l7-input').value.trim();
  if (!input||input.length<30) { alert('กรุณาพิมพ์คำทำนายอย่างน้อย 30 ตัวอักษร'); return; }
  const p=window.currentL7;
  const cardData=p.cards.map(id=>MAJOR_ARCANA.find(x=>x.id===id));
  const rubricEl=document.getElementById('l7-rubric');
  if (rubricEl) {
    rubricEl.innerHTML=`<div class="rubric-card">
      <div class="rubric-title">📋 ตัวอย่างการตีความ</div>
      <div class="rubric-example">${cardData.map(c=>`<strong>${c.name}:</strong> ${c.meaning}`).join('<br><br>')}</div>
      <div class="rubric-title">📊 เกณฑ์การประเมิน</div>
      <ul class="rubric-criteria">
        ${['ตีความไพ่แต่ละใบถูกต้อง (5 คะแนน)','เชื่อมโยงไพ่เข้าด้วยกัน (5 คะแนน)','ใช้ภาษาสุภาพและเป็นมิตร (3 คะแนน)','ไม่ฟันธงอนาคต (4 คะแนน)','มีคำแนะนำเชิงบวก (3 คะแนน)'].map(x=>`<li>${x}</li>`).join('')}
      </ul>
      <button class="next-btn" style="margin-top:1rem" onclick="generateLevel7Question();document.getElementById('l7-input').value='';document.getElementById('l7-rubric').innerHTML=''">
        ลองอีกครั้ง ↺
      </button>
    </div>`;
    STATE.score+=20; updateHUD(); saveState();
  }
}

// ─── Init ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded',()=>{
  loadState();
  renderHomeScreen();
  showScreen('screen-home');
  document.querySelectorAll('#sound-btn,#sound-btn-l7').forEach(b=>{ if(b) b.textContent=STATE.soundEnabled?'🔊':'🔇'; });
});
