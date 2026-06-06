const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

function makeElement() {
  return {
    classList: { add() {}, remove() {}, toggle() {} },
    dataset: {},
    innerHTML: '',
    scrollTop: 0,
    style: {},
    textContent: '',
    addEventListener() {},
    appendChild() {},
    remove() {},
  };
}

const elements = new Map();
const getElement = id => {
  if (!elements.has(id)) elements.set(id, makeElement());
  return elements.get(id);
};

const storage = new Map();
const context = {
  clearTimeout,
  confirm: () => true,
  console,
  document: {
    body: makeElement(),
    createElement: makeElement,
    getElementById: getElement,
    querySelector: () => null,
    querySelectorAll: () => [],
    readyState: 'loading',
    addEventListener() {},
  },
  localStorage: {
    getItem: key => storage.get(key) || null,
    removeItem: key => storage.delete(key),
    setItem: (key, value) => storage.set(key, value),
  },
  location: { reload() {} },
  setTimeout,
};
context.window = context;
vm.createContext(context);

for (const filename of ['chapters.js', 'app.js', 'chapter.js', 'exam.js']) {
  const source = fs.readFileSync(filename, 'utf8');
  vm.runInContext(source, context, { filename });
}

vm.runInContext(`
  globalThis.testApi = {
    CARD_IMAGES,
    CHAPTERS,
    STATE,
    completedCount,
    goJournal,
    renderJourneyGrid,
    showQuizResult,
    startExam,
  };
`, context);

const api = context.testApi;
assert.strictEqual(api.CHAPTERS.length, 22);
assert.strictEqual(Object.keys(api.CARD_IMAGES).length, 22);
api.renderJourneyGrid();
assert.match(getElement('journey-grid').innerHTML, /goChapter\(0\)/);
assert.match(getElement('journey-grid').innerHTML, /RWS_Tarot_21_World\.jpg/);

api.startExam();
assert.strictEqual(vm.runInContext('examState', context), null);

vm.runInContext(`
  quizState = { ch: CHAPTERS[0], questions: [{}, {}], correct: 1 };
  showQuizResult();
`, context);
assert.notStrictEqual(api.STATE.chapterProgress[0].quizDone, true);

vm.runInContext(`
  quizState = { ch: CHAPTERS[0], questions: [{}, {}], correct: 2 };
  showQuizResult();
`, context);
assert.strictEqual(api.STATE.chapterProgress[0].quizDone, true);

api.goJournal();
assert.strictEqual(api.STATE.activeTab, 'journal');

console.log('Smoke tests passed');
