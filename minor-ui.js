// minor-ui.js — Minor Arcana UI, Library, Reading Lab, Quiz (Minor), Progress
'use strict';

// ══════════════════════════════════════════════════════
// COMBINED DECK HELPERS
// ══════════════════════════════════════════════════════

// allCards = Major (as simplified objects) + Minor
function getAllCards() {
  const major = CHAPTERS.map(ch => ({
    id: ch.id,
    arcana: 'major',
    suit: null,
    name: ch.name,
    nameTH: ch.nameTH,
    number: ch.number,
    image: CARD_IMAGES[ch.id],
    keywords: ch.keywords,
    upright: ch.meaning,
    reversed: ch.reversed,
  }));
  return [...major, ...MINOR_ARCANA];
}

function getRandomCards(deckScope, count) {
  let pool;
  if (deckScope === 'major') pool = CHAPTERS.map(ch => ({ id: ch.id, arcana: 'major', name: ch.name, nameTH: ch.nameTH, image: CARD_IMAGES[ch.id], meaning: ch.meaning, reversed: ch.reversed }));
  else if (deckScope === 'minor') pool = MINOR_ARCANA.slice();
  else pool = getAllCards(); // full
  shuffleArr(pool);
  return pool.slice(0, Math.min(count, pool.length));
}

// ══════════════════════════════════════════════════════
// MINOR PROGRESS TRACKING
// ══════════════════════════════════════════════════════

function getMinorProgress() {
  if (!STATE.minorProgress) STATE.minorProgress = {};
  return STATE.minorProgress;
}

function markMinorCardViewed(cardId) {
  const mp = getMinorProgress();
  if (!mp[cardId]) {
    mp[cardId] = { viewed: true };
    STATE.totalXP += 5;
    saveState();
    checkMinorBadges();
  }
}

function getMinorViewedBySuit(suit) {
  const mp = getMinorProgress();
  return getCardsBySuit(suit).filter(c => mp[c.id] && mp[c.id].viewed).length;
}

function getMinorTotalViewed() {
  const mp = getMinorProgress();
  return MINOR_ARCANA.filter(c => mp[c.id] && mp[c.id].viewed).length;
}

// ── Minor Badges ──────────────────────────────────────
const MINOR_BADGE_DEFS = [
  { id:'wands_apprentice',     icon:'🔥', name:'Wands Apprentice',       desc:'เรียน Wands ครบ 14 ใบ',       check: () => getMinorViewedBySuit('wands') >= 14 },
  { id:'cups_apprentice',      icon:'💧', name:'Cups Apprentice',        desc:'เรียน Cups ครบ 14 ใบ',        check: () => getMinorViewedBySuit('cups') >= 14 },
  { id:'swords_apprentice',    icon:'🌪', name:'Swords Apprentice',      desc:'เรียน Swords ครบ 14 ใบ',      check: () => getMinorViewedBySuit('swords') >= 14 },
  { id:'pentacles_apprentice', icon:'🌿', name:'Pentacles Apprentice',   desc:'เรียน Pentacles ครบ 14 ใบ',   check: () => getMinorViewedBySuit('pentacles') >= 14 },
  { id:'minor_scholar',        icon:'📚', name:'Minor Arcana Scholar',   desc:'เรียน Minor ครบ 56 ใบ',       check: () => getMinorTotalViewed() >= 56 },
  { id:'full_deck_reader',     icon:'🃏', name:'Full Deck Reader',        desc:'เปิดอ่านไพ่ครบ 78 ใบ',        check: () => (typeof completedCount === 'function' ? completedCount() : 0) >= 22 && getMinorTotalViewed() >= 56 },
  { id:'tarot_master',         icon:'✨', name:'Tarot Master',            desc:'ผ่าน Full Deck Challenge',     check: () => STATE.fullDeckChallengePassed },
];

function checkMinorBadges() {
  let earned = false;
  MINOR_BADGE_DEFS.forEach(b => {
    if (!STATE.badges.includes(b.id) && b.check()) {
      STATE.badges.push(b.id);
      earned = true;
      showToast(b.icon + ' ได้รับ Badge: ' + b.name + '!');
    }
  });
  if (earned) saveState();
}

// Extend main checkBadges to also check minor
const _origCheckBadges = (typeof window.checkBadges === 'function')
  ? window.checkBadges.bind(window)
  : function(){};
window.checkBadges = function checkAllBadges() {
  _origCheckBadges();
  checkMinorBadges();
};

// ══════════════════════════════════════════════════════
// SUIT SCREEN (Minor landing/selection)
// ══════════════════════════════════════════════════════

let currentMinorSuit = null;
let currentMinorCard = null;
let minorQuizState = null;

function goMinorSuit(suit) {
  currentMinorSuit = suit;
  showScreen('screen-minor-suit');
  renderMinorSuitScreen(suit);
}

function goMinorCard(cardId) {
  const card = MINOR_ARCANA.find(c => c.id === cardId);
  if (!card) return;
  currentMinorCard = card;
  markMinorCardViewed(cardId);
  showScreen('screen-minor-card');
  renderMinorCardScreen(card);
}

function renderMinorSuitScreen(suit) {
  const meta = SUIT_META[suit];
  const cards = getCardsBySuit(suit);
  const viewed = getMinorViewedBySuit(suit);
  const suitNameTH = { wands:'ไม้เท้า', cups:'ถ้วย', swords:'ดาบ', pentacles:'เหรียญ' }[suit];

  const el = document.getElementById('screen-minor-suit');
  if (!el) return;

  el.innerHTML = `
    <div class="top-bar-full" style="background:var(--bg2)">
      <button class="top-bar-back" onclick="goHome()">←</button>
      <div style="flex:1">
        <div style="font-family:'Cinzel',serif;font-size:.95rem;color:var(--cream)">${meta.symbol} ${suit.charAt(0).toUpperCase()+suit.slice(1)}</div>
        <div style="font-size:.78rem;color:var(--text2)">${suitNameTH} · ${meta.element} (${meta.elementTH})</div>
      </div>
      <div style="font-size:.78rem;color:var(--gold);font-family:'Cinzel',serif">${viewed}/14</div>
    </div>
    <div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding-bottom:80px">
      <div class="suit-hero" style="background:linear-gradient(135deg,${meta.accent},transparent);padding:24px 16px;text-align:center;border-bottom:1px solid var(--border)">
        <div style="font-size:3rem;margin-bottom:8px">${meta.symbol}</div>
        <div style="font-family:'Cinzel Decorative',serif;font-size:1.3rem;color:var(--cream)">${suit.charAt(0).toUpperCase()+suit.slice(1)}</div>
        <div style="color:${meta.color};font-family:'Cinzel',serif;font-size:.85rem;margin:4px 0">${suitNameTH} · ${meta.element}</div>
        <div style="display:flex;justify-content:center;gap:8px;margin-top:12px">
          <div style="background:var(--bg3);border:1px solid var(--border);border-radius:20px;padding:4px 12px;font-size:.75rem;color:var(--text2)">${viewed} / 14 ใบ</div>
          <div style="background:${meta.accent};border:1px solid ${meta.colorDim};border-radius:20px;padding:4px 12px;font-size:.75rem;color:${meta.color}">Minor Arcana</div>
        </div>
      </div>
      <div style="padding:16px;font-family:'Cinzel',serif;font-size:.72rem;color:var(--text2);letter-spacing:.12em;text-transform:uppercase">ไพ่ทั้ง 14 ใบ</div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;padding:0 16px 16px">
        ${cards.map(card => {
          const isViewed = getMinorProgress()[card.id] && getMinorProgress()[card.id].viewed;
          return `<div class="minor-card-item ${isViewed?'viewed':''}" onclick="goMinorCard(${card.id})"
            style="background:var(--bg2);border:1px solid ${isViewed ? meta.colorDim : 'var(--border)'};border-radius:14px;padding:14px 12px;cursor:pointer;position:relative;overflow:hidden">
            <div class="card-minor-img-wrap" style="aspect-ratio:2/3;border-radius:8px;background:linear-gradient(135deg,${meta.accent},var(--bg3));margin-bottom:10px;display:flex;align-items:center;justify-content:center;overflow:hidden">
              <img src="${card.image}" alt="${card.name}" style="width:100%;height:100%;object-fit:contain;background:#080711"
                onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
              <div style="display:none;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%">
                <span style="font-size:2rem">${meta.symbol}</span>
                <span style="font-size:.65rem;color:${meta.color};font-family:'Cinzel',serif;text-align:center;padding:4px">${card.rankName}</span>
              </div>
            </div>
            <div style="font-size:.7rem;color:${meta.colorDim};font-family:'Cinzel',serif">${card.rankNameTH}</div>
            <div style="font-size:.83rem;font-weight:600;color:var(--cream);line-height:1.3">${card.name}</div>
            <div style="font-size:.75rem;color:var(--text2)">${card.nameTH}</div>
            ${isViewed ? `<div style="position:absolute;top:8px;right:10px;color:${meta.color};font-size:.75rem">✓</div>` : ''}
          </div>`;
        }).join('')}
      </div>
    </div>
  `;
}

// ══════════════════════════════════════════════════════
// MINOR CARD DETAIL SCREEN
// ══════════════════════════════════════════════════════

function renderMinorCardScreen(card) {
  const el = document.getElementById('screen-minor-card');
  if (!el) return;

  const meta = SUIT_META[card.suit];

  el.innerHTML = `
    <div class="ch-top-bar" style="background:var(--bg2)">
      <button class="ch-back" onclick="goMinorSuit('${card.suit}')">←</button>
      <div class="ch-title-wrap">
        <div class="ch-title-en">${card.name}</div>
        <div class="ch-title-th">${card.nameTH}</div>
      </div>
      <div class="ch-num-badge" style="color:${meta.color};border-color:${meta.colorDim}">${meta.symbol}</div>
    </div>
    <div class="ch-tabs" id="minor-card-tabs">
      <button class="ch-tab active" onclick="showMinorTab('story',this)">✦ เรื่องราว</button>
      <button class="ch-tab" onclick="showMinorTab('meaning',this)">📖 ความหมาย</button>
      <button class="ch-tab" onclick="showMinorTab('life',this)">💼 ชีวิต</button>
      <button class="ch-tab" onclick="showMinorTab('reflection',this)">💭 ไตร่ตรอง</button>
    </div>
    <div class="ch-body" id="minor-card-body"></div>
  `;

  showMinorTab('story', el.querySelector('.ch-tab.active'), card);
}

let _currentMinorTabCard = null;

function showMinorTab(tab, btnEl, cardOverride) {
  const card = cardOverride || currentMinorCard;
  if (!card) return;
  _currentMinorTabCard = card;

  const meta = SUIT_META[card.suit];

  // update tabs
  document.querySelectorAll('#minor-card-tabs .ch-tab').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

  const body = document.getElementById('minor-card-body');
  if (!body) return;

  if (tab === 'story') {
    body.innerHTML = `
      <div class="card-hero">
        <div style="width:100px;flex-shrink:0">
          <img src="${card.image}" alt="${card.name}" style="width:100px;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,.5);object-fit:contain;background:#080711"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
          <div style="display:none;width:100px;aspect-ratio:2/3;border-radius:8px;background:linear-gradient(160deg,var(--bg3),#0d0820);border:1px solid var(--border);align-items:center;justify-content:center;flex-direction:column">
            <span style="font-size:2.5rem">${meta.symbol}</span>
          </div>
        </div>
        <div class="card-meta">
          <div class="card-meta-title">${card.name}</div>
          <div class="card-meta-th">${card.nameTH}</div>
          <div class="tag-row">
            <span class="tag" style="border-color:${meta.colorDim};color:${meta.color};background:${meta.accent}">${meta.symbol} ${card.suit.charAt(0).toUpperCase()+card.suit.slice(1)}</span>
            <span class="tag gold">🌍 ${card.element}</span>
          </div>
          <div class="kw-wrap">${card.keywords.map(k=>`<span class="kw-chip" style="border-color:${meta.colorDim+'66'};color:${meta.color};background:${meta.accent}">${k}</span>`).join('')}</div>
        </div>
      </div>
      <div class="section-label">เรื่องเล่าของไพ่</div>
      <div class="prose"><p>${card.story}</p></div>
    `;
  } else if (tab === 'meaning') {
    body.innerHTML = `
      <div class="section-label">ความหมาย</div>
      <div class="meaning-box">
        <h4>🌟 ตั้งตรง</h4>
        <p class="prose">${card.upright}</p>
      </div>
      <div class="meaning-box reversed">
        <h4>🔄 กลับหัว</h4>
        <p class="prose">${card.reversed}</p>
      </div>
      <div class="section-label">Keywords</div>
      <div class="kw-wrap">${card.keywords.map(k=>`<span class="kw-chip" style="border-color:${meta.colorDim+'66'};color:${meta.color};background:${meta.accent}">${k}</span>`).join('')}</div>
      <div class="section-label">ข้อมูลไพ่</div>
      <div class="meaning-box">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:.85rem">
          <div><span style="color:var(--text2)">Suit: </span><span style="color:${meta.color}">${meta.symbol} ${card.suit}</span></div>
          <div><span style="color:var(--text2)">Rank: </span><span style="color:var(--cream)">${card.rankName} (${card.rankNameTH})</span></div>
          <div><span style="color:var(--text2)">ธาตุ: </span><span style="color:var(--cream)">${card.element} (${card.elementTH})</span></div>
          <div><span style="color:var(--text2)">Arcana: </span><span style="color:var(--cream)">Minor</span></div>
        </div>
      </div>
    `;
  } else if (tab === 'life') {
    body.innerHTML = `
      <div class="section-label">การตีความในชีวิต</div>
      <div class="meaning-box" style="border-color:${meta.colorDim+'55'}">
        <h4 style="color:${meta.color}">❤️ ความรัก</h4>
        <p class="prose">${card.love}</p>
      </div>
      <div class="meaning-box" style="border-color:${meta.colorDim+'55'}">
        <h4 style="color:${meta.color}">💼 การงาน</h4>
        <p class="prose">${card.career}</p>
      </div>
      <div class="meaning-box" style="border-color:${meta.colorDim+'55'}">
        <h4 style="color:${meta.color}">💰 การเงิน</h4>
        <p class="prose">${card.finance}</p>
      </div>
      <div class="meaning-box" style="border-color:${meta.colorDim+'55'}">
        <h4 style="color:${meta.color}">🔮 จิตวิญญาณ</h4>
        <p class="prose">${card.spirituality}</p>
      </div>
    `;
  } else if (tab === 'reflection') {
    body.innerHTML = `
      <div class="section-label">คำถามสำหรับไตร่ตรอง</div>
      ${card.reflectionQuestions.map((q,i) => `
        <div class="reflection-prompt" style="border-color:${meta.colorDim+'55'}">
          <span style="color:${meta.color};font-family:'Cinzel',serif">${i+1}.</span> "${q}"
        </div>
      `).join('')}
      <div class="section-label">เขียนบันทึก</div>
      <textarea class="reflection-ta" id="minor-reflect-ta" placeholder="เขียนความคิดของคุณที่นี่...">${(STATE.minorReflections && STATE.minorReflections[card.id]) || ''}</textarea>
      <div class="reflection-save">
        <button class="btn-gold" onclick="saveMinorReflection(${card.id})">บันทึก ✦</button>
      </div>
    `;
    const ta = document.getElementById('minor-reflect-ta');
    if (ta) ta.addEventListener('input', () => {
      if (!STATE.minorReflections) STATE.minorReflections = {};
      STATE.minorReflections[card.id] = ta.value;
      saveState();
    });
  }
  body.scrollTop = 0;
}

function saveMinorReflection(cardId) {
  const ta = document.getElementById('minor-reflect-ta');
  if (!ta) return;
  if (!STATE.minorReflections) STATE.minorReflections = {};
  STATE.minorReflections[cardId] = ta.value.trim();
  saveState();
  showToast('บันทึกแล้ว ✦');
}

// ══════════════════════════════════════════════════════
// CARD LIBRARY (78 ใบ)
// ══════════════════════════════════════════════════════

let libraryFilter = 'all';
let librarySearch = '';

function goLibrary() {
  showScreen('screen-library');
  renderLibrary();
}

function renderLibrary() {
  const el = document.getElementById('screen-library');
  if (!el) return;

  const filters = [
    { key:'all',       label:'ทั้งหมด (78)' },
    { key:'major',     label:'Major (22)' },
    { key:'wands',     label:'🔥 Wands' },
    { key:'cups',      label:'💧 Cups' },
    { key:'swords',    label:'🌪 Swords' },
    { key:'pentacles', label:'🌿 Pentacles' },
  ];

  const allCards = getAllCards();
  let filtered = allCards;

  if (libraryFilter === 'major') filtered = allCards.filter(c => c.arcana === 'major');
  else if (libraryFilter !== 'all') filtered = allCards.filter(c => c.suit === libraryFilter);

  if (librarySearch.trim()) {
    const q = librarySearch.toLowerCase();
    filtered = filtered.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.nameTH.includes(q) ||
      (c.keywords && c.keywords.some(k => k.toLowerCase().includes(q) || k.includes(q))) ||
      (c.suit && c.suit.includes(q)) ||
      (c.rankName && c.rankName.toLowerCase().includes(q))
    );
  }

  el.innerHTML = `
    <div class="top-bar-full">
      <button class="top-bar-back" onclick="goHome()">←</button>
      <div style="flex:1">
        <div style="font-family:'Cinzel',serif;font-size:.95rem;color:var(--cream)">Card Library</div>
        <div style="font-size:.75rem;color:var(--text2)">${filtered.length} / 78 ใบ</div>
      </div>
    </div>
    <div style="padding:12px 16px;background:var(--bg2);border-bottom:1px solid var(--border)">
      <input id="lib-search" type="text" placeholder="🔍 ค้นหาชื่อ, ความหมาย, keyword..."
        value="${escapeHtml(librarySearch)}"
        style="width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:8px 12px;color:var(--cream);font-family:'Sarabun',sans-serif;font-size:.88rem"
        oninput="librarySearch=this.value;renderLibrary()">
    </div>
    <div style="display:flex;gap:6px;padding:10px 16px;overflow-x:auto;scrollbar-width:none;background:var(--bg2);border-bottom:1px solid var(--border)">
      ${filters.map(f => `
        <button onclick="libraryFilter='${f.key}';renderLibrary()"
          style="flex-shrink:0;background:${libraryFilter===f.key?'var(--gold)':'var(--bg3)'};color:${libraryFilter===f.key?'#1a1000':'var(--text2)'};border:1px solid ${libraryFilter===f.key?'var(--gold)':'var(--border)'};border-radius:20px;padding:5px 12px;font-size:.78rem;cursor:pointer;font-family:'Sarabun',sans-serif;white-space:nowrap">
          ${f.label}
        </button>`).join('')}
    </div>
    <div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding-bottom:20px">
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:12px 12px">
        ${filtered.map(card => renderLibraryCard(card)).join('')}
      </div>
      ${filtered.length === 0 ? '<div style="text-align:center;padding:40px;color:var(--text2)">ไม่พบไพ่ที่ค้นหา</div>' : ''}
    </div>
  `;
}

function renderLibraryCard(card) {
  const isMajor = card.arcana === 'major';
  const meta = isMajor ? null : SUIT_META[card.suit];
  const borderColor = isMajor ? 'var(--border)' : (meta.colorDim + '88');
  const imgSrc = isMajor ? CARD_IMAGES[card.id] : card.image;
  const clickFn = isMajor ? `goChapter(${card.id})` : `goMinorCard(${card.id})`;

  return `<div onclick="${clickFn}" style="background:var(--bg2);border:1px solid ${borderColor};border-radius:10px;padding:8px;cursor:pointer">
    <div style="aspect-ratio:2/3;border-radius:6px;background:var(--bg3);overflow:hidden;margin-bottom:6px;display:flex;align-items:center;justify-content:center">
      <img src="${imgSrc}" alt="${card.name}" style="width:100%;height:100%;object-fit:contain;background:#080711"
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
      <div style="display:none;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%">
        <span style="font-size:1.5rem">${isMajor ? '✦' : meta.symbol}</span>
        <span style="font-size:.6rem;color:${isMajor ? 'var(--gold-dim)' : meta.color};text-align:center;padding:2px 4px;font-family:'Cinzel',serif">${card.name.split(' ').slice(-1)[0]}</span>
      </div>
    </div>
    <div style="font-size:.65rem;color:${isMajor ? 'var(--gold-dim)' : meta.colorDim};font-family:'Cinzel',serif">${isMajor ? (card.number || '') : (meta.symbol + ' ' + card.rankNameTH)}</div>
    <div style="font-size:.7rem;color:var(--cream);line-height:1.2;font-weight:600">${card.name}</div>
  </div>`;
}

// ══════════════════════════════════════════════════════
// READING LAB (Deck Scope)
// ══════════════════════════════════════════════════════

let deckScope = 'major';
let spreadCount2 = 1;

const SPREAD_LABELS2 = {
  1:['ไพ่แห่งวัน'],
  3:['อดีต','ปัจจุบัน','อนาคต'],
  5:['สถานการณ์','อุปสรรค','รากเหตุ','แนวทาง','ผลลัพธ์']
};

function goReadingLab() {
  showScreen('screen-reading');
  renderReadingLab();
}

function renderReadingLab() {
  const el = document.getElementById('screen-reading');
  if (!el) return;

  const deckOptions = [
    { key:'major', label:'Major Only', desc:'22 ใบ', icon:'✦' },
    { key:'minor', label:'Minor Only', desc:'56 ใบ', icon:'🃏' },
    { key:'full',  label:'Full Deck',  desc:'78 ใบ', icon:'🌟' },
  ];

  el.innerHTML = `
    <div class="top-bar-full">
      <button class="top-bar-back" onclick="goHome()">←</button>
      <div>
        <div style="font-family:'Cinzel',serif;font-size:.95rem;color:var(--cream)">Reading Lab</div>
        <div style="font-size:.78rem;color:var(--text2)">สุ่มไพ่และฝึกอ่าน</div>
      </div>
    </div>
    <div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding-bottom:80px">
      <div style="padding:16px">
        <div style="font-family:'Cinzel',serif;font-size:.72rem;color:var(--text2);letter-spacing:.12em;text-transform:uppercase;margin-bottom:10px">เลือก Deck</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:20px">
          ${deckOptions.map(d => `
            <button onclick="deckScope='${d.key}';renderReadingLab()"
              style="background:${deckScope===d.key?'rgba(201,168,76,.12)':'var(--bg2)'};border:1px solid ${deckScope===d.key?'var(--gold)':'var(--border)'};border-radius:10px;padding:10px 6px;text-align:center;cursor:pointer">
              <div style="font-size:1.3rem;margin-bottom:4px">${d.icon}</div>
              <div style="font-family:'Cinzel',serif;font-size:.72rem;color:${deckScope===d.key?'var(--gold)':'var(--cream)'}">${d.label}</div>
              <div style="font-size:.68rem;color:var(--text2)">${d.desc}</div>
            </button>`).join('')}
        </div>

        <div style="font-family:'Cinzel',serif;font-size:.72rem;color:var(--text2);letter-spacing:.12em;text-transform:uppercase;margin-bottom:10px">เลือก Spread</div>
        <div style="display:flex;gap:8px;margin-bottom:20px;overflow-x:auto">
          ${[1,3,5].map(n => `
            <button onclick="spreadCount2=${n};renderReadingLab()"
              style="flex-shrink:0;background:${spreadCount2===n?'rgba(201,168,76,.12)':'var(--bg2)'};border:1px solid ${spreadCount2===n?'var(--gold)':'var(--border)'};border-radius:10px;padding:8px 14px;font-size:.8rem;color:${spreadCount2===n?'var(--gold)':'var(--text2)'};cursor:pointer;font-family:'Sarabun',sans-serif">
              ${n===1?'1 ใบ — ไพ่แห่งวัน':n===3?'3 ใบ — อดีต/ปัจจุบัน/อนาคต':'5 ใบ — Celtic Cross ย่อ'}
            </button>`).join('')}
        </div>

        <button class="btn-gold" style="display:block;width:100%;margin-bottom:20px" onclick="drawSpread2()">✦ สุ่มไพ่</button>

        <div id="spread2-cards" style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-bottom:16px"></div>
        <div id="spread2-output" style="display:none;background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:16px;font-size:.87rem;line-height:1.7;color:var(--text)"></div>
      </div>
    </div>
  `;
}

function drawSpread2() {
  const drawn = getRandomCards(deckScope, spreadCount2).map(c => ({ card: c, reversed: Math.random() > 0.7 }));
  const labels = SPREAD_LABELS2[spreadCount2] || [];

  const cardsHTML = drawn.map((d, i) => {
    const isMajor = d.card.arcana === 'major';
    const meta = isMajor ? null : SUIT_META[d.card.suit];
    const imgSrc = isMajor ? (d.card.image || CARD_IMAGES[d.card.id]) : d.card.image;
    const fallbackIcon = isMajor ? '✦' : meta.symbol;

    return `<div style="text-align:center">
      <div style="width:70px;aspect-ratio:2/3;border-radius:6px;border:1px solid ${isMajor?'var(--gold-dim)':(meta.colorDim+'88')};background:var(--bg2);margin:0 auto 6px;overflow:hidden;${d.reversed?'transform:rotate(180deg)':''}">
        <img src="${imgSrc}" alt="${d.card.name}" style="width:100%;height:100%;object-fit:contain;background:#080711"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <div style="display:none;width:100%;height:100%;align-items:center;justify-content:center;font-size:1.4rem">${fallbackIcon}</div>
      </div>
      <div style="font-size:.65rem;color:var(--text2)">${labels[i]||''}</div>
      <div style="font-size:.68rem;color:${isMajor?'var(--gold)':meta.color};font-family:'Cinzel',serif">${d.card.name}</div>
      ${d.reversed?`<div style="font-size:.6rem;color:var(--danger)">กลับหัว</div>`:''}
    </div>`;
  }).join('');

  document.getElementById('spread2-cards').innerHTML = cardsHTML;

  const output = document.getElementById('spread2-output');
  output.style.display = 'block';
  output.innerHTML = drawn.map((d, i) => {
    const lbl = labels[i] ? `<strong style="color:var(--gold)">${labels[i]}:</strong> ` : '';
    const meaning = d.reversed
      ? (d.card.reversed || d.card.meaning || '')
      : (d.card.upright || d.card.meaning || '');
    return `<p style="margin-bottom:12px">${lbl}<strong>${d.card.name}</strong>${d.reversed?' (กลับหัว)':''}<br><span style="color:var(--text2);font-size:.85rem">${meaning}</span></p>`;
  }).join('');
}

// ══════════════════════════════════════════════════════
// MINOR QUIZ
// ══════════════════════════════════════════════════════

let minorQuizMode = null;

function goMinorQuiz(mode) {
  minorQuizMode = mode;
  showScreen('screen-minor-quiz');
  renderMinorQuiz(mode);
}

const MINOR_QUIZ_MODES = [
  { key:'keyword',  label:'🔑 Minor Keyword Match',    desc:'จับคู่ keyword กับไพ่' },
  { key:'meaning',  label:'📖 Minor Meaning Quiz',     desc:'เดาความหมายของไพ่' },
  { key:'suit',     label:'♠ Suit Recognition',        desc:'ระบุ Suit จากคำอธิบาย' },
  { key:'court',    label:'👑 Court Card Challenge',   desc:'ทายไพ่ Court Cards' },
  { key:'full',     label:'🌟 Full Deck Challenge',     desc:'ทดสอบทั้ง 78 ใบ' },
];

function buildMinorQuizQuestions(mode) {
  const qs = [];
  const pool = mode === 'full' ? [...MINOR_ARCANA, ...CHAPTERS.map(ch=>({...ch, arcana:'major', upright:ch.meaning}))] : MINOR_ARCANA;
  const shuffled = shuffleArr([...pool]);

  shuffled.slice(0, 10).forEach(card => {
    const isMinor = card.arcana !== 'major';
    const name = card.name;
    const nameTH = card.nameTH;
    const upright = isMinor ? card.upright : card.meaning;
    const keywords = card.keywords;
    const suit = isMinor ? card.suit : null;

    // Generate distractors from pool
    const others = pool.filter(c => c.name !== name);
    const pick3 = shuffleArr([...others]).slice(0, 3);

    if (mode === 'keyword' || mode === 'suit') {
      // Keyword to card
      const kw = keywords[Math.floor(Math.random() * Math.min(keywords.length, 3))];
      const opts = shuffleArr([name, ...pick3.map(c => c.name)]);
      qs.push({
        q: `"${kw}" คือ keyword ของไพ่ใด?`,
        opts,
        ans: opts.indexOf(name),
        exp: `${name} (${nameTH}) — ${upright.slice(0,80)}...`
      });
    } else if (mode === 'meaning' || mode === 'full') {
      const snippet = upright.slice(0, 60) + '...';
      const opts = shuffleArr([name, ...pick3.map(c => c.name)]);
      qs.push({
        q: `"${snippet}" นี่คือความหมายของไพ่ใด?`,
        opts,
        ans: opts.indexOf(name),
        exp: `${name} (${nameTH})`
      });
    } else if (mode === 'court') {
      const courtCards = MINOR_ARCANA.filter(c => ['page','knight','queen','king'].includes(c.rank));
      if (courtCards.length < 4) return;
      const courtCard = courtCards[Math.floor(Math.random() * courtCards.length)];
      const courtOthers = courtCards.filter(c => c.id !== courtCard.id);
      const courtPick3 = shuffleArr([...courtOthers]).slice(0, 3);
      const cOpts = shuffleArr([courtCard.name, ...courtPick3.map(c => c.name)]);
      qs.push({
        q: `Court Card แห่ง "${courtCard.suit}" ที่มีความหมาย: "${courtCard.upright.slice(0,50)}..."`,
        opts: cOpts,
        ans: cOpts.indexOf(courtCard.name),
        exp: `${courtCard.name} (${courtCard.nameTH}) — ${courtCard.upright.slice(0,80)}...`
      });
    }
  });

  return qs.slice(0, 10);
}

function renderMinorQuiz(mode) {
  const el = document.getElementById('screen-minor-quiz');
  if (!el) return;

  const modeInfo = MINOR_QUIZ_MODES.find(m => m.key === mode) || MINOR_QUIZ_MODES[0];

  minorQuizState = {
    mode,
    questions: buildMinorQuizQuestions(mode),
    current: 0,
    correct: 0,
    answered: false,
  };

  el.innerHTML = `
    <div class="top-bar-full">
      <button class="top-bar-back" onclick="goHome()">←</button>
      <div style="flex:1">
        <div style="font-family:'Cinzel',serif;font-size:.88rem;color:var(--cream)">${modeInfo.label}</div>
        <div style="font-size:.75rem;color:var(--text2)">${modeInfo.desc}</div>
      </div>
    </div>
    <div id="minor-quiz-wrap" style="padding:16px;flex:1;overflow-y:auto"></div>
  `;

  renderMinorQuizQuestion();
}

function renderMinorQuizQuestion() {
  if (!minorQuizState) return;
  const wrap = document.getElementById('minor-quiz-wrap');
  if (!wrap) return;

  const { questions, current } = minorQuizState;
  if (current >= questions.length) {
    showMinorQuizResult();
    return;
  }

  const q = questions[current];
  const pct = Math.round((current / questions.length) * 100);

  wrap.innerHTML = `
    <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${pct}%"></div></div>
    <div style="font-size:.8rem;color:var(--text2);margin-bottom:12px">${current+1}/${questions.length}</div>
    <div class="quiz-q">${q.q}</div>
    <div class="quiz-opts">
      ${q.opts.map((opt,i) => `<button class="quiz-opt" id="mqopt-${i}" onclick="selectMinorAnswer(${i})">${opt}</button>`).join('')}
    </div>
    <div class="quiz-exp" id="mq-exp">${q.exp}</div>
    <div class="quiz-nav">
      <button class="btn-next" id="mq-next" onclick="nextMinorQuestion()">${current+1 < questions.length ? 'ถัดไป →' : 'ดูผล →'}</button>
    </div>
  `;
  minorQuizState.answered = false;
}

function selectMinorAnswer(i) {
  if (!minorQuizState || minorQuizState.answered) return;
  minorQuizState.answered = true;
  const q = minorQuizState.questions[minorQuizState.current];

  document.querySelectorAll('.quiz-opt').forEach((btn, idx) => {
    btn.classList.add('disabled');
    if (idx === q.ans) btn.classList.add('correct');
    if (idx === i && i !== q.ans) btn.classList.add('wrong');
  });

  if (i === q.ans) minorQuizState.correct++;

  const exp = document.getElementById('mq-exp');
  if (exp) exp.classList.add('show');
  const btn = document.getElementById('mq-next');
  if (btn) btn.classList.add('show');
}

function nextMinorQuestion() {
  if (!minorQuizState) return;
  minorQuizState.current++;
  renderMinorQuizQuestion();
}

function showMinorQuizResult() {
  const { correct, questions, mode } = minorQuizState;
  const pct = Math.round((correct / questions.length) * 100);
  const pass = pct >= 70;

  if (mode === 'full' && pass && !STATE.fullDeckChallengePassed) {
    STATE.fullDeckChallengePassed = true;
    saveState();
    checkMinorBadges();
  }

  if (!STATE.minorQuizBest) STATE.minorQuizBest = {};
  STATE.minorQuizBest[mode] = Math.max(STATE.minorQuizBest[mode] || 0, pct);
  saveState();

  const wrap = document.getElementById('minor-quiz-wrap');
  if (!wrap) return;
  wrap.innerHTML = `
    <div class="quiz-result">
      <span class="quiz-score-num">${pct}%</span>
      <div class="quiz-score-lbl">${correct}/${questions.length} ข้อถูก</div>
      <div style="margin:16px 0;font-size:1.5rem">${pass?'🌟':'💪'}</div>
      <div style="font-size:.9rem;color:var(--text2)">${pass?'ยอดเยี่ยม!':'ลองใหม่นะ'}</div>
      <div style="margin-top:20px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        <button class="btn-outline" onclick="goMinorQuiz('${mode}')">ทำอีกครั้ง</button>
        <button class="btn-gold" onclick="goHome()">กลับหน้าหลัก</button>
      </div>
    </div>
  `;
}

// ══════════════════════════════════════════════════════
// HOME SCREEN EXTENSIONS
// ══════════════════════════════════════════════════════

// Patch renderJourneyGrid to add Minor Arcana section and fix coming-soon
function renderJourneyGridFull() {
  const grid = document.getElementById('journey-grid');
  if (!grid) return;

  const done = completedCount();

  // Major Arcana cards
  let majorHTML = CHAPTERS.map(ch => {
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
  }).join('');

  // Minor progress summary
  const totalMinorViewed = getMinorTotalViewed();

  // Exam CTA
  let examHTML = '';
  if (done === 22) {
    examHTML = `<div style="grid-column:1/-1;margin:8px 0">
      <div class="practice-cta">
        <h3>🏆 พร้อมสอบ Major!</h3>
        <button class="btn-gold" onclick="goExam()">สอบ Master Exam</button>
      </div>
    </div>`;
  }

  // Minor Arcana section
  const suits = [
    { suit:'wands',     icon:'🔥', nameTH:'ไม้เท้า', color:'#e05c2a' },
    { suit:'cups',      icon:'💧', nameTH:'ถ้วย',    color:'#4a90d9' },
    { suit:'swords',    icon:'🌪', nameTH:'ดาบ',     color:'#9b7fe0' },
    { suit:'pentacles', icon:'🌿', nameTH:'เหรียญ',  color:'#56c996' },
  ];

  const minorSuitHTML = suits.map(s => {
    const viewed = getMinorViewedBySuit(s.suit);
    const pct = Math.round(viewed / 14 * 100);
    return `<div onclick="goMinorSuit('${s.suit}')"
      style="background:var(--bg2);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:14px 12px;cursor:pointer;position:relative;overflow:hidden">
      <div style="font-size:2rem;margin-bottom:8px">${s.icon}</div>
      <div style="font-family:'Cinzel',serif;font-size:.75rem;color:${s.color};margin-bottom:2px">${s.suit.charAt(0).toUpperCase()+s.suit.slice(1)}</div>
      <div style="font-size:.78rem;color:var(--cream)">${s.nameTH}</div>
      <div style="font-size:.7rem;color:var(--text2);margin-top:4px">${viewed}/14 ใบ</div>
      <div class="card-progress" style="margin-top:6px">
        <div class="prog-bar"><div class="prog-fill" style="width:${pct}%;background:${s.color}66"></div></div>
      </div>
    </div>`;
  }).join('');

  grid.innerHTML = `
    <div style="grid-column:1/-1;padding:4px 0 8px">
      <div class="section-title" style="padding:0">✦ Major Arcana — 22 บท</div>
    </div>
    ${majorHTML}
    ${examHTML}
    <div style="grid-column:1/-1;padding:12px 0 8px">
      <div class="section-title" style="padding:0">◈ Minor Arcana — 56 ใบ</div>
      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:4px">
        <span style="font-size:.78rem;color:var(--text2)">${totalMinorViewed}/56 ใบที่เรียนแล้ว</span>
        <button onclick="goLibrary()" style="background:none;border:1px solid var(--border);color:var(--gold);padding:3px 10px;border-radius:20px;font-size:.72rem;cursor:pointer;font-family:'Cinzel',serif">📚 Library</button>
      </div>
    </div>
    ${minorSuitHTML}
  `;
}

// Override the original renderJourneyGrid
if (typeof window !== 'undefined') {
  window.renderJourneyGrid = renderJourneyGridFull;
}

// ── Extend Awards ─────────────────────────────────────
const _origRenderAwards = (typeof renderAwards === 'function') ? renderAwards : function(){};
function renderAwards() {
  const el = document.getElementById('awards-list');
  if (!el) return;

  const allBadges = [...BADGE_DEFS, ...MINOR_BADGE_DEFS];
  el.innerHTML = allBadges.map(b => {
    const earned = STATE.badges.includes(b.id);
    return `<div class="award-item ${earned?'':'locked'}">
      <div class="award-icon">${b.icon}</div>
      <div>
        <div class="award-name">${b.name}</div>
        <div class="award-desc">${b.desc}</div>
      </div>
      ${earned ? '<span class="badge-new">EARNED</span>' : ''}
    </div>`;
  }).join('');
}

// ── Extend Practice Tab ────────────────────────────────
const _origRenderPracticeTab = (typeof renderPracticeTab === 'function') ? renderPracticeTab : function(){};
function renderPracticeTab() {
  const el = document.getElementById('practice-content');
  if (!el) return;

  const done = completedCount();
  let html = '';

  // Major exam section
  if (done < 22) {
    html += `<div class="practice-cta">
      <h3>🎯 Major Arcana</h3>
      <p>เรียนให้ครบทุก 22 บทก่อน แล้วจึงสอบ Major Arcana Master Exam</p>
      <div style="margin-top:12px;background:var(--bg3);border-radius:10px;height:8px;overflow:hidden">
        <div style="height:100%;width:${Math.round(done/22*100)}%;background:linear-gradient(90deg,var(--gold-dim),var(--gold))"></div>
      </div>
      <p style="margin-top:8px;font-size:.8rem;color:var(--gold)">${done}/22 บทเรียน</p>
    </div>`;
  } else {
    html += `<div class="practice-cta">
      <h3>🏆 พร้อมสอบ Major!</h3>
      ${STATE.examBestScore > 0 ? `<p style="color:var(--gold);font-family:'Cinzel',serif">คะแนนสูงสุด: ${STATE.examBestScore}%</p>` : ''}
      <br><button class="btn-gold" onclick="goExam()">เริ่มสอบ Major 50 ข้อ</button>
    </div>`;
  }

  // Minor Quiz section
  html += `<div style="padding:0 16px 8px;font-family:'Cinzel',serif;font-size:.72rem;color:var(--text2);letter-spacing:.12em;text-transform:uppercase;margin-top:8px">Minor Arcana Quiz</div>`;
  html += `<div style="display:flex;flex-direction:column;gap:8px;padding:0 16px 24px">`;
  MINOR_QUIZ_MODES.forEach(m => {
    const best = STATE.minorQuizBest && STATE.minorQuizBest[m.key] ? STATE.minorQuizBest[m.key] + '%' : '—';
    html += `<div onclick="goMinorQuiz('${m.key}')"
      style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:14px;cursor:pointer;display:flex;align-items:center;gap:12px">
      <div style="font-size:1.5rem">${m.label.split(' ')[0]}</div>
      <div style="flex:1">
        <div style="font-size:.88rem;color:var(--cream);font-weight:600">${m.label.split(' ').slice(1).join(' ')}</div>
        <div style="font-size:.75rem;color:var(--text2)">${m.desc}</div>
      </div>
      <div style="font-size:.75rem;color:var(--gold);font-family:'Cinzel',serif">${best}</div>
    </div>`;
  });
  html += '</div>';

  el.innerHTML = html;
}

// ══════════════════════════════════════════════════════
// HOME STATS EXTENSION
// ══════════════════════════════════════════════════════
function renderHomeStats() {
  const done = completedCount();
  const minorDone = getMinorTotalViewed();
  setText('stat-xp', STATE.totalXP);
  setText('stat-badge', STATE.badges.length > 0 ? STATE.badges.length + ' 🏅' : '—');
  setText('stat-streak', STATE.streak + ' ' + getStreakEmoji());

  // Update progress bars if elements exist
  const majorBar = document.getElementById('stat-major-bar');
  if (majorBar) majorBar.style.width = Math.round(done/22*100) + '%';
  const minorBar = document.getElementById('stat-minor-bar');
  if (minorBar) minorBar.style.width = Math.round(minorDone/56*100) + '%';
}

// ══════════════════════════════════════════════════════
// INIT OVERRIDES — run after DOM ready
// ══════════════════════════════════════════════════════
(function patchHomeScreen() {
  const _orig = (typeof renderHomeScreen === 'function') ? renderHomeScreen : function(){};
  window.renderHomeScreen = function() {
    _orig();
    renderHomeStats();
    // Also re-render awards if on awards tab
    const awardsEl = document.getElementById('awards-list');
    if (awardsEl && awardsEl.closest('.tab-pane.active')) renderAwards();
  };
})();
