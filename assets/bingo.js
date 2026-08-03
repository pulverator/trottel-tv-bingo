/**
 * ============================================================
 *  Trottel-TV Bingo – Spiellogik
 *  Version: 2026-08-03 16:00
 * ============================================================
 *
 *  BEGRIFFE ANPASSEN:
 *  Einfach die Einträge im TERMS-Array unten bearbeiten.
 *  Es müssen genau 25 Begriffe sein.
 *
 * ============================================================
 */


/* ============================================================
   BEGRIFFE – hier anpassen
   Genau 25 Einträge
   ============================================================ */

const TERMS = [
  "den Umständen entsprechend",
  "Nazi",
  "andere Seite des Zauns",
  "Monster",
  "Tonprobleme",
  "Plandemie",
  "Deep State",
  "Badminton",
  "Menschheitsfamilie",
  "2 Wochen",
  "Robert F. Kennedy",
  "unschuldig",
  "Revision",
  "politisch verfolgt",
  "Hunde",
  "Mexiko",
  "Schindler",
  "meine Klagen",
  "Geheimdienste",
  "Rechtsstaat im Arsch",
  "bin fit",
  "Entführung",
  "NWO",
  "Lügner",
  "Hallo alle"
];


/* ============================================================
   KONFIGURATION
   ============================================================ */

// localStorage Key
const STORAGE_KEY = 'trottel-bingo-state';

// BEM-Klassen
const CLASS = {
  cell:       'bingo-card__cell',
  marked:     'bingo-card__cell--marked',
  bannerShow: 'banner--visible',
};


/* ============================================================
   SPIELZUSTAND
   ============================================================ */

let markedCells    = new Set();
let bingoTriggered = false;


/* ============================================================
   LOCALSTORAGE
   ============================================================ */

function saveState(shuffledTerms) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      terms:  shuffledTerms,
      marked: [...markedCells],
      bingo:  bingoTriggered,
    }));
  } catch (e) {}
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
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


/* ============================================================
   KARTE AUFBAUEN
   ============================================================ */

function buildCard(savedTerms = null, savedMarked = [], savedBingo = false) {
  const shuffled = savedTerms || shuffle(TERMS);
  const grid     = document.getElementById('grid');

  grid.innerHTML = '';
  markedCells    = new Set(savedMarked);
  bingoTriggered = savedBingo;
  updateCounter();

  for (let i = 0; i < 25; i++) {
    const cell = document.createElement('div');
    cell.classList.add(CLASS.cell);
    cell.dataset.index = i;
    cell.textContent   = shuffled[i];

    if (markedCells.has(i)) {
      cell.classList.add(CLASS.marked);
    }

    cell.addEventListener('click', () => toggleCell(cell, i, shuffled));
    grid.appendChild(cell);
  }

  saveState(shuffled);
}


/* ============================================================
   ZELLE UMSCHALTEN
   ============================================================ */

function toggleCell(cell, index, shuffled) {
  if (markedCells.has(index)) {
    markedCells.delete(index);
    cell.classList.remove(CLASS.marked);
  } else {
    markedCells.add(index);
    cell.classList.add(CLASS.marked);
  }

  updateCounter();
  saveState(shuffled);
  checkBingo();
}


/* ============================================================
   ZÄHLER AKTUALISIEREN
   ============================================================ */

function updateCounter() {
  document.getElementById('marked-count').textContent = markedCells.size;
}


/* ============================================================
   BINGO PRÜFEN – alle Linien brauchen genau 5 Felder
   ============================================================ */

function checkBingo() {
  if (bingoTriggered) return;

  const lines = [
    // Zeilen
    [0,  1,  2,  3,  4],
    [5,  6,  7,  8,  9],
    [10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24],
    // Spalten
    [0,  5,  10, 15, 20],
    [1,  6,  11, 16, 21],
    [2,  7,  12, 17, 22],
    [3,  8,  13, 18, 23],
    [4,  9,  14, 19, 24],
    // Diagonalen
    [0,  6,  12, 18, 24],
    [4,  8,  12, 16, 20],
  ];

  for (const line of lines) {
    if (line.every(i => markedCells.has(i))) {
      triggerBingo();
      return;
    }
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


/* ============================================================
   BANNER SCHLIESSEN
   ============================================================ */

function dismissBanner() {
  document.getElementById('bingo-banner').classList.remove(CLASS.bannerShow);
}


/* ============================================================
   SPIELSTART
   ============================================================ */

function startGame() {
  // Session als aktiv markieren – überlebt einen Reload aber nicht Tab schliessen
  sessionStorage.setItem('bingo-active', '1');

  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('game-screen').style.display  = 'flex';

  // Startseite = bewusster Neustart → immer frische Karte
  clearState();
  buildCard();
}

/**
 * Wird beim Laden der Seite aufgerufen.
 * Nur bei einem Reload (sessionStorage aktiv) wird die gespeicherte Karte
 * wiederhergestellt. Bei neuem Tab oder direktem Aufruf erscheint die Startseite.
 */
function initGame() {
  const isReload = sessionStorage.getItem('bingo-active');
  const state    = loadState();

  if (isReload && state) {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-screen').style.display  = 'flex';
    buildCard(state.terms, state.marked, state.bingo);
  }
  // Sonst: Startseite anzeigen (Standard)
}

function newCard() {
  clearState();
  buildCard();
}
