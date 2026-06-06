// exam.js — Major Arcana Master Exam (50 questions, 80% pass)
'use strict';

const EXAM_TOTAL = 50;
const EXAM_PASS_PCT = 80;
let examState = null;

function renderExam() {
  const screen = document.getElementById('screen-exam');
  if (!screen) return;

  // If already passed, show trophy
  if (STATE.examPassed) {
    screen.innerHTML = buildExamPassedScreen();
    return;
  }

  screen.innerHTML = buildExamStartScreen();
}

function buildExamStartScreen() {
  const done = completedCount();
  return `
    <div class="top-bar-full">
      <button class="top-bar-back" onclick="goHome()">←</button>
      <div style="flex:1">
        <div style="font-family:'Cinzel',serif;font-size:.95rem;color:var(--cream)">Major Arcana Master Exam</div>
        <div style="font-size:.78rem;color:var(--text2)">50 ข้อ • ผ่าน 80%</div>
      </div>
    </div>
    <div class="exam-header">
      <div style="font-size:3rem;margin-bottom:12px">🏆</div>
      <h1>Major Arcana Master Exam</h1>
      <p>ทดสอบความรู้ทั้ง 22 ใบ ใน 50 ข้อ</p>
      <div class="exam-meta">
        <div class="exam-meta-item">
          <span class="exam-meta-val">50</span>
          <span class="exam-meta-lbl">ข้อ</span>
        </div>
        <div class="exam-meta-item">
          <span class="exam-meta-val">80%</span>
          <span class="exam-meta-lbl">คะแนนผ่าน</span>
        </div>
        <div class="exam-meta-item">
          <span class="exam-meta-val">${STATE.examAttempts || 0}</span>
          <span class="exam-meta-lbl">ครั้ง</span>
        </div>
      </div>
      ${STATE.examBestScore > 0 ? `<p style="color:var(--gold);font-family:'Cinzel',serif;margin-top:12px">คะแนนสูงสุด: ${STATE.examBestScore}%</p>` : ''}
    </div>
    <div style="padding:0 16px 24px;text-align:center">
      ${done < 22
        ? `<p style="color:var(--danger);font-size:.85rem;margin-bottom:16px">⚠️ เรียนให้ครบทุก 22 บทก่อนนะ (${done}/22)</p>`
        : ''}
      <button class="btn-gold" onclick="startExam()" ${done < 22 ? 'disabled style="opacity:.5;cursor:not-allowed"' : ''}>
        เริ่มสอบเลย ✦
      </button>
    </div>
  `;
}

function buildExamPassedScreen() {
  return `
    <div class="top-bar-full">
      <button class="top-bar-back" onclick="goHome()">←</button>
      <div style="font-family:'Cinzel',serif;font-size:.95rem;color:var(--cream)">Master Exam</div>
    </div>
    <div class="exam-result">
      <span class="exam-trophy">🏆</span>
      <span class="exam-score-big">${STATE.examBestScore}%</span>
      <div class="exam-pass-msg">Major Arcana Master</div>
      <p class="exam-detail">คุณผ่านการทดสอบ Major Arcana แล้ว!<br>Badge 🏆 ถูกปลดล็อกแล้ว</p>
      <div style="margin-top:24px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        <button class="btn-outline" onclick="startExam()">ทำอีกครั้ง</button>
        <button class="btn-gold" onclick="goHome()">กลับหน้าหลัก</button>
      </div>
    </div>
  `;
}

function startExam() {
  if (completedCount() < 22) {
    showToast('เรียนให้ครบทั้ง 22 บทก่อนเริ่ม Master Exam');
    return;
  }

  // Build 50-question pool from all chapters
  const allQ = [];
  CHAPTERS.forEach(ch => {
    ch.quiz.forEach(q => allQ.push({ ...q, chName: ch.name, chNameTH: ch.nameTH }));
  });

  // Shuffle and take 50 (or all if < 50)
  const shuffled = shuffleArr([...allQ]);
  const pool = shuffled.slice(0, Math.min(EXAM_TOTAL, shuffled.length));

  examState = {
    questions: pool,
    current: 0,
    correct: 0,
    answered: false,
  };

  STATE.examAttempts = (STATE.examAttempts || 0) + 1;
  saveState();
  renderExamQuestion();
}

function renderExamQuestion() {
  if (!examState) return;
  const screen = document.getElementById('screen-exam');
  if (!screen) return;
  const { questions, current } = examState;

  if (current >= questions.length) {
    showExamResult();
    return;
  }

  const q = questions[current];
  const pct = Math.round((current / questions.length) * 100);

  screen.innerHTML = `
    <div class="top-bar-full">
      <button class="top-bar-back" onclick="confirmExamExit()">←</button>
      <div style="flex:1">
        <div style="font-family:'Cinzel',serif;font-size:.85rem;color:var(--cream)">Master Exam</div>
        <div style="font-size:.75rem;color:var(--text2)">${current + 1}/${questions.length} ข้อ</div>
      </div>
      <div style="font-family:'Cinzel',serif;font-size:.85rem;color:var(--gold)">${examState.correct} ถูก</div>
    </div>
    <div style="padding:0 16px;background:var(--bg2);border-bottom:1px solid var(--border)">
      <div class="quiz-progress-bar" style="margin:8px 0">
        <div class="quiz-progress-fill" style="width:${pct}%"></div>
      </div>
    </div>
    <div class="exam-body">
      <div class="exam-q-num">${q.chName} · ${q.chNameTH}</div>
      <div class="exam-q-text">${q.q}</div>
      <div class="quiz-opts" id="exam-opts">
        ${q.opts.map((opt, i) => `
          <button class="quiz-opt" id="eopt-${i}" onclick="examAnswer(${i})">${opt}</button>
        `).join('')}
      </div>
      <div class="quiz-exp" id="exam-exp">${q.exp}</div>
      <div class="quiz-nav">
        <button class="btn-next" id="exam-next" onclick="examNext()">
          ${current + 1 < questions.length ? 'ถัดไป →' : 'ดูผล →'}
        </button>
      </div>
    </div>
  `;
  examState.answered = false;
}

function examAnswer(i) {
  if (examState.answered) return;
  examState.answered = true;
  const q = examState.questions[examState.current];

  document.querySelectorAll('.quiz-opt').forEach((btn, idx) => {
    btn.classList.add('disabled');
    if (idx === q.ans) btn.classList.add('correct');
    if (idx === i && i !== q.ans) btn.classList.add('wrong');
  });

  if (i === q.ans) examState.correct++;

  const exp = document.getElementById('exam-exp');
  if (exp) exp.classList.add('show');
  const next = document.getElementById('exam-next');
  if (next) next.classList.add('show');
}

function examNext() {
  examState.current++;
  renderExamQuestion();
}

function showExamResult() {
  const { correct, questions } = examState;
  const pct = Math.round((correct / questions.length) * 100);
  const pass = pct >= EXAM_PASS_PCT;

  if (pct > (STATE.examBestScore || 0)) {
    STATE.examBestScore = pct;
    saveState();
  }
  if (pass && !STATE.examPassed) {
    STATE.examPassed = true;
    saveState();
    checkBadges();
  }

  const screen = document.getElementById('screen-exam');
  if (!screen) return;

  screen.innerHTML = `
    <div class="top-bar-full">
      <button class="top-bar-back" onclick="goHome()">←</button>
      <div style="font-family:'Cinzel',serif;font-size:.95rem;color:var(--cream)">ผลการสอบ</div>
    </div>
    <div class="exam-result">
      <span class="exam-trophy">${pass ? '🏆' : '💪'}</span>
      <span class="exam-score-big">${pct}%</span>
      <div class="${pass ? 'exam-pass-msg' : 'exam-fail-msg'}">
        ${pass ? 'ผ่าน! Major Arcana Master 🎉' : `ยังไม่ผ่าน (ต้องการ ${EXAM_PASS_PCT}%)`}
      </div>
      <p class="exam-detail">${correct}/${questions.length} ข้อถูก</p>
      ${pass ? `<div style="margin:12px 0;padding:12px;background:rgba(201,168,76,.1);border:1px solid var(--gold-dim);border-radius:10px;font-size:.85rem;color:var(--gold)">🏅 Badge ถูกปลดล็อก: Major Arcana Master</div>` : ''}
      <div style="margin-top:20px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        <button class="btn-outline" onclick="startExam()">ทำอีกครั้ง</button>
        <button class="btn-gold" onclick="goHome()">กลับหน้าหลัก</button>
      </div>
    </div>
  `;
}

function confirmExamExit() {
  if (confirm('ออกจากการสอบ? คะแนนจะหายไป')) goHome();
}

// shuffleArr is defined in chapter.js — if called standalone, add fallback
if (typeof shuffleArr === 'undefined') {
  window.shuffleArr = function(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };
}
