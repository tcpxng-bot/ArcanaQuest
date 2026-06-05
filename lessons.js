// lessons.js — Lesson system + new navigation

const LESSONS = [
  {
    id: 'what-is-tarot',
    icon: '🃏',
    title: 'ไพ่ทาโรต์คืออะไร?',
    desc: 'ประวัติและที่มาของไพ่ทาโรต์',
    content: buildLesson_WhatIsTarot,
  },
  {
    id: 'major-arcana',
    icon: '✨',
    title: 'Major Arcana คืออะไร?',
    desc: 'ไพ่หลัก 22 ใบและความหมาย',
    content: buildLesson_MajorArcana,
  },
  {
    id: 'read-one-card',
    icon: '☝️',
    title: 'วิธีอ่านไพ่ 1 ใบ',
    desc: 'ขั้นตอนการอ่านและตีความ',
    content: buildLesson_OneCard,
  },
  {
    id: 'read-three-cards',
    icon: '🎴',
    title: 'วิธีอ่านไพ่ 3 ใบ',
    desc: 'Past · Present · Future spread',
    content: buildLesson_ThreeCards,
  },
  {
    id: 'upright-meaning',
    icon: '⬆️',
    title: 'ความหมายไพ่หงาย',
    desc: 'หลักการอ่านไพ่ตำแหน่งปกติ',
    content: buildLesson_Upright,
  },
  {
    id: 'reversed-meaning',
    icon: '🔄',
    title: 'ความหมายไพ่กลับหัว',
    desc: 'การอ่านไพ่ในตำแหน่งกลับด้าน',
    content: buildLesson_Reversed,
  },
  {
    id: 'tarot-ethics',
    icon: '⚖️',
    title: 'จรรยาบรรณนักอ่านไพ่',
    desc: 'หลักจริยธรรมที่ผู้อ่านควรรู้',
    content: buildLesson_Ethics,
  },
];

// ─── Lesson builders ────────────────────────────────────────────

function buildLesson_WhatIsTarot() {
  return `
<div class="lesson-hero">
  <span class="lesson-hero-icon">🃏</span>
  <h2 class="lesson-hero-title">ไพ่ทาโรต์คืออะไร?</h2>
  <p class="lesson-hero-sub">ประวัติ · ที่มา · วิธีใช้</p>
</div>
<div class="lesson-section">
  <p class="ls-heading">ต้นกำเนิด</p>
  <p class="ls-text">ไพ่ทาโรต์มีต้นกำเนิดในยุโรปศตวรรษที่ 15 เริ่มต้นเป็นเพียงเกมไพ่สำหรับขุนนางในอิตาลีและฝรั่งเศส ก่อนจะกลายมาเป็นเครื่องมือทำนายในศตวรรษที่ 18</p>
  <div class="ls-highlight">
    <strong>Rider-Waite Tarot (1909)</strong> คือชุดไพ่ที่โด่งดังที่สุดในโลก สร้างโดย Arthur Edward Waite ร่วมกับศิลปิน Pamela Colman Smith ซึ่งเป็นชุดไพ่ที่คุณกำลังเรียนอยู่
  </div>
  <p class="ls-text">ไพ่ทาโรต์มาตรฐาน 1 ชุดมี <strong>78 ใบ</strong> แบ่งเป็น 2 ส่วนหลัก</p>
</div>
<div class="lesson-section">
  <p class="ls-heading">โครงสร้างของชุดไพ่</p>
  <table class="meaning-table">
    <tr><td>Major Arcana</td><td>22 ใบ — ไพ่หลัก เล่าเรื่องการเดินทางชีวิตของมนุษย์</td></tr>
    <tr><td>Minor Arcana</td><td>56 ใบ — ไพ่รอง แบ่ง 4 หมวด: Wands, Cups, Swords, Pentacles</td></tr>
  </table>
</div>
<div class="lesson-section">
  <p class="ls-heading">ไพ่ทาโรต์ใช้ทำอะไร?</p>
  <p class="ls-text">นักอ่านไพ่มืออาชีพใช้ไพ่เป็นเครื่องมือในการ <strong>ตั้งคำถาม</strong> และ <strong>สำรวจความรู้สึกภายใน</strong> ไม่ใช่การทำนายอนาคตแบบตายตัว ไพ่ช่วยให้เราเห็น "มุมมองที่เป็นไปได้" ในสถานการณ์หนึ่ง</p>
  <div class="ls-highlight">
    <strong>สิ่งสำคัญ:</strong> ไพ่ทาโรต์เป็นเครื่องมือสำรวจจิตใจ ไม่ใช่การพยากรณ์โชคชะตาที่เปลี่ยนไม่ได้ คุณมีอิสระในการตัดสินใจเสมอ
  </div>
</div>
<div class="lesson-cta">
  <button class="btn-primary" onclick="markLessonDone('what-is-tarot'); startLevel(1)">เริ่มฝึกทันที →</button>
  <button class="btn-secondary" onclick="goHome()">กลับหน้าหลัก</button>
</div>
`;
}

function buildLesson_MajorArcana() {
  const featured = [0,1,2,6,9,13,17,19,21].map(id => MAJOR_ARCANA[id]);
  const strips = featured.map(c => `
    <div class="lcs-item" onclick="openCardDetail(${c.id})">
      <img class="lcs-img" src="${cardImg(c.id)}" alt="${c.name}"
           onerror="this.parentElement.innerHTML='<div class=\\'card-fallback\\'><span class=\\'cf-num\\'>${c.number}</span><span class=\\'cf-name\\'>${c.name}</span></div>'">
      <div class="lcs-name">${c.name}<br><small>${c.nameTH.split('/')[0].trim()}</small></div>
    </div>`).join('');

  return `
<div class="lesson-hero">
  <span class="lesson-hero-icon">✨</span>
  <h2 class="lesson-hero-title">Major Arcana</h2>
  <p class="lesson-hero-sub">ไพ่หลัก 22 ใบ · The Fool's Journey</p>
</div>
<div class="lesson-section">
  <p class="ls-heading">ไพ่หลัก 22 ใบ</p>
  <p class="ls-text">Major Arcana เล่าเรื่อง <strong>"การเดินทางของผู้โง่เขลา" (The Fool's Journey)</strong> ซึ่งเป็นอุปมาของชีวิตมนุษย์ตั้งแต่เกิดจนถึงความสมบูรณ์แบบ</p>
</div>
<div class="lesson-section">
  <p class="ls-heading">ตัวอย่างไพ่ — แตะเพื่อดูรายละเอียด</p>
  <div class="lesson-card-strip">${strips}</div>
</div>
<div class="lesson-section">
  <p class="ls-heading">หมวดหมู่</p>
  <table class="meaning-table">
    <tr><td>0 – The Fool</td><td>จุดเริ่มต้น / ผู้เดินทาง</td></tr>
    <tr><td>I – VII</td><td>โลกภายนอก — ทักษะ อำนาจ ความรัก</td></tr>
    <tr><td>VIII – XIV</td><td>โลกภายใน — พลัง ปัญญา การเปลี่ยนแปลง</td></tr>
    <tr><td>XV – XXI</td><td>พลังจักรวาล — การทดสอบ ความหวัง ความสมบูรณ์</td></tr>
  </table>
</div>
<div class="lesson-cta">
  <button class="btn-primary" onclick="markLessonDone('major-arcana'); startCardLibrary()">ดูไพ่ทั้งหมด →</button>
  <button class="btn-secondary" onclick="goHome()">กลับหน้าหลัก</button>
</div>
`;
}

function buildLesson_OneCard() {
  const card = MAJOR_ARCANA[0];
  return `
<div class="lesson-hero">
  <span class="lesson-hero-icon">☝️</span>
  <h2 class="lesson-hero-title">วิธีอ่านไพ่ 1 ใบ</h2>
  <p class="lesson-hero-sub">Single Card Reading</p>
</div>
<div class="lesson-section">
  <p class="ls-heading">5 ขั้นตอนการอ่านไพ่</p>
  <table class="meaning-table">
    <tr><td>1. ตั้งคำถาม</td><td>ถามคำถามที่ชัดเจน เช่น "สิ่งที่ฉันควรระวังในสัปดาห์นี้คืออะไร?"</td></tr>
    <tr><td>2. จับไพ่</td><td>หายใจลึก สงบจิตใจ แล้วเลือกไพ่ 1 ใบ</td></tr>
    <tr><td>3. ดูภาพรวม</td><td>มองภาพรวมของไพ่ก่อน — รู้สึกอะไร? อะไรดึงดูดสายตา?</td></tr>
    <tr><td>4. ตีความ</td><td>เชื่อมความหมายของไพ่กับสถานการณ์ของคุณ</td></tr>
    <tr><td>5. สรุป</td><td>สรุปข้อคิดที่ได้รับและนำไปใช้จริง</td></tr>
  </table>
</div>
<div class="lesson-section">
  <p class="ls-heading">ตัวอย่าง: The Fool ✦ การเริ่มต้นใหม่</p>
  <div class="lesson-card-strip">
    <div class="lcs-item">
      <img class="lcs-img" src="${cardImg(0)}" alt="The Fool"
           onerror="this.parentElement.innerHTML='<div class=\\'card-fallback\\'><span class=\\'cf-num\\'>0</span><span class=\\'cf-name\\'>The Fool</span></div>'">
      <div class="lcs-name">The Fool<br><small>คนโง่เขลา</small></div>
    </div>
  </div>
  <div class="ls-highlight">
    <strong>คำถาม:</strong> "ฉันควรเริ่มโปรเจกต์ใหม่นี้ไหม?"<br>
    <strong>ไพ่:</strong> The Fool<br>
    <strong>การอ่าน:</strong> ไพ่บอกว่านี่คือช่วงเวลาที่ดีสำหรับการเริ่มต้นใหม่ด้วยใจที่เปิดกว้าง อย่ากลัวความไม่แน่นอน เพราะความไม่รู้คือส่วนหนึ่งของการผจญภัย
  </div>
</div>
<div class="lesson-cta">
  <button class="btn-primary" onclick="markLessonDone('read-one-card'); doFreeReading(1); switchScreenWithTitle('screen-free-reading','Free Reading')">ลองอ่านไพ่ 1 ใบ →</button>
  <button class="btn-secondary" onclick="goHome()">กลับหน้าหลัก</button>
</div>
`;
}

function buildLesson_ThreeCards() {
  const positions = ['อดีต','ปัจจุบัน','อนาคต'];
  const cardIds = [4, 17, 19];
  const filenames = ['RWS_Tarot_04_Emperor.jpg','RWS_Tarot_17_Star.jpg','RWS_Tarot_19_Sun.jpg'];
  const strips = cardIds.map((id,i) => `
    <div class="lcs-item">
      <img class="lcs-img" src="${cardImg(id)}" alt="${MAJOR_ARCANA[id].name}"
           onerror="this.parentElement.innerHTML='<div class=\\'card-fallback\\'><span class=\\'cf-num\\'>${MAJOR_ARCANA[id].number}</span><span class=\\'cf-name\\'>${MAJOR_ARCANA[id].name}</span></div>'">
      <div class="lcs-name">${positions[i]}<br><small>${MAJOR_ARCANA[id].name}</small></div>
    </div>`).join('');

  return `
<div class="lesson-hero">
  <span class="lesson-hero-icon">🎴</span>
  <h2 class="lesson-hero-title">วิธีอ่านไพ่ 3 ใบ</h2>
  <p class="lesson-hero-sub">Past · Present · Future</p>
</div>
<div class="lesson-section">
  <p class="ls-heading">การวาง 3 ตำแหน่ง</p>
  <table class="meaning-table">
    <tr><td>ซ้าย — อดีต</td><td>พลังงาน/เหตุการณ์ที่ผ่านมาที่ส่งผลถึงตอนนี้</td></tr>
    <tr><td>กลาง — ปัจจุบัน</td><td>สถานการณ์ที่คุณอยู่ในตอนนี้</td></tr>
    <tr><td>ขวา — อนาคต</td><td>ทิศทางที่กำลังมุ่งหน้าไปหากยังคงแนวทางเดิม</td></tr>
  </table>
</div>
<div class="lesson-section">
  <p class="ls-heading">ตัวอย่างการอ่าน</p>
  <div class="lesson-card-strip">${strips}</div>
  <div class="ls-highlight">
    <strong>อดีต (Emperor):</strong> มีโครงสร้างและวินัยที่แน่วแน่มาก<br>
    <strong>ปัจจุบัน (Star):</strong> ตอนนี้กำลังฟื้นตัวและมีความหวัง<br>
    <strong>อนาคต (Sun):</strong> หากเดินหน้าต่อ จะพบกับความสำเร็จและความสุข
  </div>
</div>
<div class="lesson-section">
  <p class="ls-heading">เคล็ดลับ</p>
  <p class="ls-text">อย่ามองแต่ละใบแยกกัน — มองเรื่องราวที่เชื่อมกันทั้ง 3 ใบ ราวกับกำลังอ่านนิยายสั้น</p>
</div>
<div class="lesson-cta">
  <button class="btn-primary" onclick="markLessonDone('read-three-cards'); doFreeReading(3); switchScreenWithTitle('screen-free-reading','Free Reading')">ลองอ่านไพ่ 3 ใบ →</button>
  <button class="btn-secondary" onclick="goHome()">กลับหน้าหลัก</button>
</div>
`;
}

function buildLesson_Upright() {
  const examples = [
    {id:19,name:'The Sun',meaning:'ความสุข ความสำเร็จ ความสว่าง'},
    {id:17,name:'The Star',meaning:'ความหวัง การรักษา แรงบันดาลใจ'},
    {id:8,name:'Strength',meaning:'พลังภายใน ความกล้า ความอดทน'},
  ];
  const strips = examples.map(e => `
    <div class="lcs-item" onclick="openCardDetail(${e.id})">
      <img class="lcs-img" src="${cardImg(e.id)}" alt="${e.name}"
           onerror="this.parentElement.innerHTML='<div class=\\'card-fallback\\'><span class=\\'cf-num\\'>${MAJOR_ARCANA[e.id].number}</span><span class=\\'cf-name\\'>${e.name}</span></div>'">
      <div class="lcs-name">${e.name}<br><small style='color:var(--green-hi)'>${e.meaning}</small></div>
    </div>`).join('');

  return `
<div class="lesson-hero">
  <span class="lesson-hero-icon">⬆️</span>
  <h2 class="lesson-hero-title">ความหมายไพ่หงาย</h2>
  <p class="lesson-hero-sub">Upright Position Reading</p>
</div>
<div class="lesson-section">
  <p class="ls-heading">ไพ่หงายคืออะไร?</p>
  <p class="ls-text">เมื่อไพ่อยู่ในตำแหน่งปกติ (ด้านบนชี้ขึ้น) เรียกว่า <strong>ไพ่หงาย (Upright)</strong> ซึ่งแสดงพลังงานของไพ่ในแง่บวกหรือพลังเต็มที่</p>
  <div class="ls-highlight">
    ไพ่หงายไม่ได้หมายความว่า "ดี" เสมอไป — ไพ่อย่าง The Tower หรือ Death แม้หงายก็ยังบอกถึงการเปลี่ยนแปลงครั้งใหญ่ แต่เป็นพลังงานที่ตรงไปตรงมา
  </div>
</div>
<div class="lesson-section">
  <p class="ls-heading">ตัวอย่างไพ่หงาย</p>
  <div class="lesson-card-strip">${strips}</div>
</div>
<div class="lesson-section">
  <p class="ls-heading">หลักการอ่าน</p>
  <table class="meaning-table">
    <tr><td>พลังงาน</td><td>ไหลออกได้เต็มที่ ชัดเจน ตรงไปตรงมา</td></tr>
    <tr><td>บริบท</td><td>แสดงถึงสิ่งที่ปรากฏชัดหรือกำลังเกิดขึ้นอยู่</td></tr>
    <tr><td>คำแนะนำ</td><td>ไพ่บอกให้รับ/ใช้พลังงานนั้นในชีวิต</td></tr>
  </table>
</div>
<div class="lesson-cta">
  <button class="btn-primary" onclick="markLessonDone('upright-meaning'); startLevel(1)">ฝึก Card Recognition →</button>
  <button class="btn-secondary" onclick="goHome()">กลับหน้าหลัก</button>
</div>
`;
}

function buildLesson_Reversed() {
  const examples = [
    {id:0,name:'The Fool',rev:'ความประมาท ขาดความรับผิดชอบ กลัวการเปลี่ยนแปลง'},
    {id:19,name:'The Sun',rev:'ความสุขที่ถูกบดบัง มองโลกในแง่ร้ายชั่วคราว'},
    {id:10,name:'Wheel of Fortune',rev:'โชคร้าย ต่อต้านการเปลี่ยนแปลง วัฏจักรที่ไม่ดี'},
  ];
  const strips = examples.map(e => `
    <div class="lcs-item" onclick="openCardDetail(${e.id})">
      <img class="lcs-img" src="${cardImg(e.id)}" alt="${e.name}" style="transform:rotate(180deg)"
           onerror="this.parentElement.innerHTML='<div class=\\'card-fallback\\'><span class=\\'cf-num\\'>${MAJOR_ARCANA[e.id].number}</span><span class=\\'cf-name\\'>${e.name}</span></div>'">
      <div class="lcs-name">${e.name}<br><small style='color:var(--red-hi)'>${e.rev.split(' ')[0]}…</small></div>
    </div>`).join('');

  return `
<div class="lesson-hero">
  <span class="lesson-hero-icon">🔄</span>
  <h2 class="lesson-hero-title">ความหมายไพ่กลับหัว</h2>
  <p class="lesson-hero-sub">Reversed Position Reading</p>
</div>
<div class="lesson-section">
  <p class="ls-heading">ไพ่กลับหัวคืออะไร?</p>
  <p class="ls-text">เมื่อไพ่หงสลับด้าน (ด้านบนชี้ลง) เรียกว่า <strong>ไพ่กลับหัว (Reversed)</strong> พลังงานของไพ่จะเปลี่ยนไป มักแสดงถึงการอุดกั้น ความล่าช้า หรือพลังงานด้านในที่ยังไม่ปล่อยออกมา</p>
  <div class="ls-highlight">
    นักอ่านบางคนไม่ใช้ไพ่กลับหัว — นั่นก็เป็นเรื่องส่วนตัว ไม่มีถูกหรือผิด ขึ้นอยู่กับสไตล์การอ่านของแต่ละคน
  </div>
</div>
<div class="lesson-section">
  <p class="ls-heading">ตัวอย่างไพ่กลับหัว</p>
  <div class="lesson-card-strip">${strips}</div>
</div>
<div class="lesson-section">
  <p class="ls-heading">วิธีตีความ 3 แบบ</p>
  <table class="meaning-table">
    <tr><td>พลังงานอุดกั้น</td><td>ไพ่มีพลัง แต่มีอะไรขวางกั้นอยู่</td></tr>
    <tr><td>พลังงานบิดเบี้ยว</td><td>พลังงานของไพ่แสดงออกในทางที่ไม่ดี</td></tr>
    <tr><td>พลังงานภายใน</td><td>ยังไม่พร้อมที่จะแสดงออกมาข้างนอก</td></tr>
  </table>
</div>
<div class="lesson-cta">
  <button class="btn-primary" onclick="markLessonDone('reversed-meaning'); startLevel(3)">ฝึก Reversed Cards →</button>
  <button class="btn-secondary" onclick="goHome()">กลับหน้าหลัก</button>
</div>
`;
}

function buildLesson_Ethics() {
  return `
<div class="lesson-hero">
  <span class="lesson-hero-icon">⚖️</span>
  <h2 class="lesson-hero-title">จรรยาบรรณนักอ่านไพ่</h2>
  <p class="lesson-hero-sub">Tarot Ethics & Responsibility</p>
</div>
<div class="lesson-section">
  <p class="ls-heading">หลักจรรยาบรรณ 5 ข้อ</p>
  <table class="meaning-table">
    <tr><td>1. ความยินยอม</td><td>อ่านให้คนอื่นต้องได้รับความยินยอมเสมอ ไม่อ่านลับหลัง</td></tr>
    <tr><td>2. ไม่วินิจฉัยโรค</td><td>ไม่วิเคราะห์หรือทำนายเรื่องสุขภาพ ควรแนะนำให้พบแพทย์</td></tr>
    <tr><td>3. เสริมพลัง</td><td>ช่วยให้ผู้รับรู้สึกมีพลัง ไม่ทำให้กลัวหรือพึ่งพาไพ่มากเกินไป</td></tr>
    <tr><td>4. ความลับ</td><td>รักษาข้อมูลของผู้รับไว้เป็นความลับ</td></tr>
    <tr><td>5. ขีดจำกัด</td><td>รู้ขอบเขตของตนเอง ถ้าไม่พร้อมให้ปฏิเสธได้</td></tr>
  </table>
</div>
<div class="lesson-section">
  <p class="ls-heading">คำถามที่ไม่ควรอ่าน</p>
  <div class="ls-highlight">
    ❌ "เขาตายเมื่อไหร่?"<br>
    ❌ "ฉันมะเร็งไหม?"<br>
    ❌ "ใครเป็นคนขโมยของฉัน?" (กล่าวหาคนอื่น)<br>
    ❌ อ่านชะตาชีวิตคนอื่นโดยไม่ได้รับอนุญาต
  </div>
</div>
<div class="lesson-section">
  <p class="ls-heading">การตอบเมื่อไพ่บอกเรื่องร้าย</p>
  <p class="ls-text">เมื่อไพ่แสดงสัญญาณไม่ดี ควรพูดในเชิง <strong>เตือน + เสนอทางออก</strong> แทนการพยากรณ์ตายตัว เช่น "ไพ่บอกว่าช่วงนี้ควรระวังเรื่อง... ลองพิจารณา..."</p>
</div>
<div class="lesson-cta">
  <button class="btn-primary" onclick="markLessonDone('tarot-ethics'); startLevel(5)">ทำแบบทดสอบ Ethics →</button>
  <button class="btn-secondary" onclick="goHome()">กลับหน้าหลัก</button>
</div>
`;
}

// ─── Helper: get card filename ──────────────────────────────────
function getCardFilename(id) {
  const map = {
    0:'RWS_Tarot_00_Fool.jpg',1:'RWS_Tarot_01_Magician.jpg',
    2:'RWS_Tarot_02_High_Priestess.jpg',3:'RWS_Tarot_03_Empress.jpg',
    4:'RWS_Tarot_04_Emperor.jpg',5:'RWS_Tarot_05_Hierophant.jpg',
    6:'RWS_Tarot_06_Lovers.jpg',7:'RWS_Tarot_07_Chariot.jpg',
    8:'RWS_Tarot_08_Strength.jpg',9:'RWS_Tarot_09_Hermit.jpg',
    10:'RWS_Tarot_10_Wheel_of_Fortune.jpg',11:'RWS_Tarot_11_Justice.jpg',
    12:'RWS_Tarot_12_Hanged_Man.jpg',13:'RWS_Tarot_13_Death.jpg',
    14:'RWS_Tarot_14_Temperance.jpg',15:'RWS_Tarot_15_Devil.jpg',
    16:'RWS_Tarot_16_Tower.jpg',17:'RWS_Tarot_17_Star.jpg',
    18:'RWS_Tarot_18_Moon.jpg',19:'RWS_Tarot_19_Sun.jpg',
    20:'RWS_Tarot_20_Judgement.jpg',21:'RWS_Tarot_21_World.jpg',
  };
  return map[id] || `RWS_Tarot_${String(id).padStart(2,'0')}.jpg`;
}

// ─── Lesson navigation ──────────────────────────────────────────
function openLesson(lessonId) {
  const lesson = LESSONS.find(l => l.id === lessonId);
  if (!lesson) return;
  const screen = document.getElementById('screen-lesson');
  const body = document.getElementById('lesson-content');
  body.innerHTML = lesson.content();
  switchScreenWithTitle('screen-lesson', lesson.title);
}

function markLessonDone(lessonId) {
  STATE.completedLessons = STATE.completedLessons || [];
  if (!STATE.completedLessons.includes(lessonId)) {
    STATE.completedLessons.push(lessonId);
    saveState();
  }
}

// ─── Home: render lesson grid ───────────────────────────────────
function renderLessonGrid() {
  const grid = document.getElementById('lesson-grid');
  if (!grid) return;
  const done = STATE.completedLessons || [];
  grid.innerHTML = LESSONS.map(l => {
    const isDone = done.includes(l.id);
    return `
    <div class="lesson-card ${isDone?'completed':''}" onclick="openLesson('${l.id}')">
      <div class="lc-icon">${l.icon}</div>
      <div class="lc-body">
        <div class="lc-title">${l.title}</div>
        <div class="lc-desc">${l.desc}</div>
      </div>
      <span class="lc-badge ${isDone?'done':'new'}">${isDone?'✓ เรียนแล้ว':'ใหม่'}</span>
    </div>`;
  }).join('');
}

// ─── Card Library ───────────────────────────────────────────────
function startCardLibrary() {
  switchScreenWithTitle('screen-library', 'Card Library');
  renderLibrary(MAJOR_ARCANA);
}

function renderLibrary(cards) {
  const grid = document.getElementById('library-grid');
  if (!grid) return;
  grid.innerHTML = cards.map(c => `
    <div class="lib-item" onclick="openCardDetail(${c.id})">
      <img src="${cardImg(c.id)}" alt="${c.name}"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
      <div class="card-fallback" style="display:none"><span class="cf-num">${c.number}</span><span class="cf-name">${c.name}</span></div>
      <div class="lib-item-name">${c.number}<br>${c.name}</div>
    </div>`).join('');
}

function filterLibrary(q) {
  const s = q.toLowerCase();
  const filtered = MAJOR_ARCANA.filter(c =>
    c.name.toLowerCase().includes(s) ||
    c.nameTH.includes(s) ||
    c.keywords.some(k => k.includes(s))
  );
  renderLibrary(filtered);
}

function openCardDetail(cardId) {
  const c = MAJOR_ARCANA[cardId];
  if (!c) return;
  const kwHtml = c.keywords.map(k => `<span class="kw-tag">${k}</span>`).join('');
  const symHtml = Object.entries(c.symbols).map(([k,v]) =>
    `<div class="sym-row"><span class="sym-key">✦ ${k}</span><span class="sym-val">${v}</span></div>`
  ).join('');
  const metaHtml = [c.element&&`<span class="meta-tag">${c.element}</span>`,
    c.planet&&`<span class="meta-tag">♂ ${c.planet}</span>`,
    c.zodiac&&`<span class="meta-tag">♈ ${c.zodiac}</span>`
  ].filter(Boolean).join('');

  document.getElementById('card-detail-body').innerHTML = `
    <div class="cd-header">
      <div class="cd-card-art">
        <img class="cd-img" src="${cardImg(c.id)}" alt="${c.name}"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <div class="card-fallback" style="display:none"><span class="cf-num">${c.number}</span><span class="cf-name">${c.name}</span></div>
      </div>
      <div>
        <div class="cd-title">${c.number} · ${c.name}</div>
        <div class="cd-thai">${c.nameTH}</div>
        <div class="cd-kw">${kwHtml}</div>
        <div class="cd-meta" style="margin-top:.5rem">${metaHtml}</div>
      </div>
    </div>
    <div class="cd-section">
      <div class="cd-section-title">ความหมายหงาย</div>
      <div class="cd-meaning">${c.meaning}</div>
    </div>
    <div class="cd-section">
      <div class="cd-section-title">ความหมายกลับหัว</div>
      <div class="cd-reversed">${c.reversed}</div>
    </div>
    <div class="cd-section">
      <div class="cd-section-title">สัญลักษณ์</div>
      <div class="cd-symbols">${symHtml}</div>
    </div>
  `;
  document.getElementById('card-detail-overlay').classList.remove('hidden');
}

function closeCardDetail() {
  document.getElementById('card-detail-overlay').classList.add('hidden');
}

// ─── Free Reading ───────────────────────────────────────────────
const SPREAD_POSITIONS = {
  1: ['คำตอบ'],
  3: ['อดีต','ปัจจุบัน','อนาคต'],
  5: ['สถานการณ์','อุปสรรค','อดีต','อนาคต','ผลลัพธ์'],
};

function startFreeReading() {
  switchScreenWithTitle('screen-free-reading', 'Free Reading');
  document.getElementById('fr-result').classList.add('hidden');
}

function doFreeReading(n) {
  const positions = SPREAD_POSITIONS[n] || ['ไพ่'];
  const shuffled = [...MAJOR_ARCANA].sort(() => Math.random()-.5);
  const drawn = shuffled.slice(0, n).map((c,i) => ({
    card: c,
    reversed: Math.random() > 0.7,
    position: positions[i] || `ใบที่ ${i+1}`,
  }));

  const cardsHtml = drawn.map(d => `
    <div class="fr-card-item">
      <img src="${cardImg(d.card.id)}" alt="${d.card.name}"
           style="${d.reversed?'transform:rotate(180deg)':''};width:80px;height:128px;object-fit:cover;border-radius:5px;border:1px solid var(--border)"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
      <div class="card-fallback" style="display:none"><span class="cf-num">${d.card.number}</span><span class="cf-name">${d.card.name}</span></div>
      <div class="fr-card-pos">${d.position}</div>
      <div class="fr-card-name">${d.card.number} ${d.card.name}</div>
    </div>`).join('');

  const meaningsHtml = drawn.map(d => `
    <div class="fr-meaning-item">
      <div class="frm-pos">${d.position} ${d.reversed?'· กลับหัว':''}</div>
      <div class="frm-name">${d.card.name} · ${d.card.nameTH}</div>
      <div class="frm-meaning">${d.reversed ? d.card.reversed : d.card.meaning}</div>
    </div>`).join('');

  const result = document.getElementById('fr-result');
  result.innerHTML = `
    <div class="fr-cards-row">${cardsHtml}</div>
    <div class="fr-meanings">${meaningsHtml}</div>
    <button class="btn-secondary full-width" style="margin-top:1rem" onclick="doFreeReading(${n})">
      สุ่มใหม่อีกครั้ง ↺
    </button>
  `;
  result.classList.remove('hidden');
  result.scrollIntoView({behavior:'smooth',block:'nearest'});
}

// ─── Screen navigation helpers ──────────────────────────────────
function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.toggle('active', t.id === `tab-${tabId}`));
}

function switchScreenWithTitle(screenId, title) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
  const tb = document.getElementById('top-bar');
  const tt = document.getElementById('top-bar-title');
  tb.classList.remove('hidden');
  tt.textContent = title || '';
  window.scrollTo(0,0);
}

function navBack() {
  goHome();
}

// lessons.js init is called by script.js renderHomeScreen()

function renderBadgesHome() {
  const container = document.getElementById('badges-container');
  if (!container) return;
  container.innerHTML = BADGES.map(b => {
    const earned = STATE.badges && STATE.badges.includes(b.id);
    return `
    <div class="badge-item ${earned?'earned':'locked-b'}">
      <div class="bi-icon">${b.icon}</div>
      <div class="bi-info">
        <div class="bi-name">${b.name}</div>
        <div class="bi-desc">${b.description}</div>
      </div>
      <div class="bi-pts">${b.threshold} pts</div>
    </div>`;
  }).join('');
}

function renderStatsHome() {
  const set = (id, v) => { const el = document.getElementById(id); if(el) el.textContent = v; };
  set('stat-total', STATE.totalAnswered || 0);
  set('stat-correct', STATE.totalCorrect || 0);
  set('stat-accuracy', STATE.totalAnswered > 0 ? Math.round((STATE.totalCorrect/STATE.totalAnswered)*100)+'%' : '0%');
  set('stat-combo', STATE.maxCombo || 0);
  set('stat-wrong', (STATE.wrongQuestions||[]).length);
}
