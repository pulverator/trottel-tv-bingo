/**
 * Trottel-TV Bingo – Spiellogik
 * Version: 2026-08-03 18:00
 *
 * NEUE EDITION HINZUFÜGEN:
 * 1. .txt Datei in /collections/ ablegen (ein Begriff pro Zeile)
 * 2. Eintrag in EDITIONS eintragen: { id: 'dateiname', label: 'Anzeigename' }
 *
 * SILBENTRENNUNG: &shy; in .txt Datei verwenden
 * Beispiel: Geheim&shy;dienste
 */


/* ============================================================
   EDITIONEN – hier neue Editionen eintragen
   ============================================================ */

const EDITIONS = [
  { id: 'fuelli', label: 'Fülli-Edition' },
  { id: 'egon',   label: 'Egon-Edition'  },
];


/* ============================================================
   KONFIGURATION
   ============================================================ */

const STORAGE_KEY = 'trottel-bingo-state';

const CLASS = {
  cell:       'bingo-card__cell',
  marked:     'bingo-card__cell--marked',
  bannerShow: 'banner--visible',
  btnActive:  'edition-selector__btn--active',
};


/* ============================================================
   SPIELZUSTAND
   ============================================================ */

let markedCells      = new Set();
let bingoTriggered   = false;
let currentTerms     = [];
let currentEditionId = EDITIONS[0].id;


/* ============================================================
   LOCALSTORAGE
   ============================================================ */

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      edition: currentEditionId,
      terms:   currentTerms,
      marked:  [...markedCells],
      bingo:   bingoTriggered,
    }));
  } catch (e) {}
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function clearState() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
}


/* ============================================================
   HILFSFUNKTIONEN
   ============================================================ */

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Lädt .txt Datei, entfernt Duplikate automatisch.
 */
async function loadCollection(id) {
  const response = await fetch(`collections/${id}.txt`);
  const text     = await response.text();
  const lines    = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  return [...new Set(lines)];
}


/* ============================================================
   EDITION-BUTTONS
   ============================================================ */

function renderEditionButtons() {
  const container = document.getElementById('edition-selector');
  container.innerHTML = '';
  EDITIONS.forEach(edition => {
    const btn = document.createElement('button');
    btn.type        = 'button';
    btn.className   = 'edition-selector__btn';
    btn.textContent = edition.label;
    btn.dataset.id  = edition.id;
    if (edition.id === currentEditionId) btn.classList.add(CLASS.btnActive);
    btn.addEventListener('click', () => switchEdition(edition.id));
    container.appendChild(btn);
  });
}

function updateEditionButtons() {
  document.querySelectorAll('.edition-selector__btn').forEach(btn => {
    btn.classList.toggle(CLASS.btnActive, btn.dataset.id === currentEditionId);
  });
  const edition = EDITIONS.find(e => e.id === currentEditionId);
  if (edition) {
    document.getElementById('game-title').textContent =
      `Trottel-TV Bingo – ${edition.label}`;
  }
}


/* ============================================================
   EDITION WECHSELN
   ============================================================ */

async function switchEdition(id) {
  currentEditionId = id;
  updateEditionButtons();
  clearState();
  const terms = await loadCollection(id);
  buildCard(terms);
}


/* ============================================================
   KARTE AUFBAUEN
   ============================================================ */

function buildCard(terms, savedMarked = [], savedBingo = false) {
  currentTerms   = shuffle(terms).slice(0, 25);
  markedCells    = new Set(savedMarked);
  bingoTriggered = savedBingo;
  renderGrid();
  updateCounter();
  saveState();
}

function restoreCard(terms, savedMarked, savedBingo) {
  currentTerms   = terms;
  markedCells    = new Set(savedMarked);
  bingoTriggered = savedBingo;
  renderGrid();
  updateCounter();
}

function renderGrid() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  currentTerms.forEach((term, i) => {
    const cell = document.createElement('div');
    cell.classList.add(CLASS.cell);
    cell.dataset.index = i;
    cell.innerHTML = term; // innerHTML für &shy; Support
    if (markedCells.has(i)) cell.classList.add(CLASS.marked);
    cell.addEventListener('click', () => toggleCell(cell, i));
    grid.appendChild(cell);
  });
}


/* ============================================================
   ZELLE UMSCHALTEN
   ============================================================ */

function toggleCell(cell, index) {
  if (markedCells.has(index)) {
    markedCells.delete(index);
    cell.classList.remove(CLASS.marked);
  } else {
    markedCells.add(index);
    cell.classList.add(CLASS.marked);
  }
  updateCounter();
  saveState();
  checkBingo();
}


/* ============================================================
   ZÄHLER
   ============================================================ */

function updateCounter() {
  document.getElementById('marked-count').textContent = markedCells.size;
}


/* ============================================================
   BINGO PRÜFEN
   ============================================================ */

function checkBingo() {
  if (bingoTriggered) return;
  const lines = [
    [0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24],
    [0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24],
    [0,6,12,18,24],[4,8,12,16,20],
  ];
  for (const line of lines) {
    if (line.every(i => markedCells.has(i))) { triggerBingo(); return; }
  }
}


/* ============================================================
   BINGO AUSLÖSEN
   ============================================================ */

function triggerBingo() {
  bingoTriggered = true;
  setTimeout(() => {
    document.getElementById('bingo-banner').classList.add(CLASS.bannerShow);
  }, 400);
}

function dismissBanner() {
  document.getElementById('bingo-banner').classList.remove(CLASS.bannerShow);
}


/* ============================================================
   SPIELSTART
   ============================================================ */

async function startGame() {
  sessionStorage.setItem('bingo-active', '1');
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('game-screen').style.display  = 'flex';
  clearState();
  renderEditionButtons();
  updateEditionButtons();
  const terms = await loadCollection(currentEditionId);
  buildCard(terms);
}

async function newCard() {
  clearState();
  const terms = await loadCollection(currentEditionId);
  buildCard(terms);
}

async function initGame() {
  const isReload = sessionStorage.getItem('bingo-active');
  const state    = loadState();
  if (isReload && state) {
    currentEditionId = state.edition || EDITIONS[0].id;
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-screen').style.display  = 'flex';
    renderEditionButtons();
    updateEditionButtons();
    restoreCard(state.terms, state.marked, state.bingo);
  }
}
