/**
 * ============================================================
 *  Trottel-TV Bingo – Spiellogik
 *  Version: 2026-08-03 10:30
 * ============================================================
 *
 *  BEGRIFFE ANPASSEN:
 *  Einfach die Einträge im TERMS-Array unten bearbeiten.
 *  Es müssen genau 24 Begriffe sein (das Mittelfeld zählt nicht).
 *  Der Text im Mittelfeld wird in index.html via
 *  data-center-label="..." gesetzt.
 *
 * ============================================================
 */


/* ============================================================
   BEGRIFFE – hier anpassen
   Genau 24 Einträge (Mittelfeld ist fix in index.html)
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

// Position des fixen Mittelfeldes im 5×5-Raster (0-basiert, 12 = Mitte)
const CENTER_INDEX = 12;

// BEM-Klassen (hier zentral damit JS und CSS synchron bleiben)
const CLASS = {
  cell:        'bingo-card__cell',
  center:      'bingo-card__cell--center',
  marked:      'bingo-card__cell--marked',
  won:         'bingo-card__cell--won',
  bannerShow:  'banner--visible',
};


/* ============================================================
   SPIELZUSTAND
   ============================================================ */

let markedCells    = new Set();
let bingoTriggered = false;


/* ============================================================
   HILFSFUNKTIONEN
   ============================================================ */

/**
 * Mischt ein Array zufällig (Fisher-Yates).
 * Gibt eine neue gemischte Kopie zurück, verändert das Original nicht.
 */
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

function buildCard() {
  const shuffled = shuffle(TERMS);
  const grid     = document.getElementById('grid');

  grid.innerHTML = '';
  markedCells    = new Set();
  bingoTriggered = false;
  updateCounter();

  for (let i = 0; i < 25; i++) {
    const cell = document.createElement('div');
    cell.classList.add(CLASS.cell);
    cell.dataset.index = i;

    if (i === CENTER_INDEX) {
      // Fixes Mittelfeld – Text aus data-center-label
      cell.classList.add(CLASS.center);
      cell.textContent = grid.dataset.centerLabel || 'BINGO';
    } else {
      // Normales Feld – Begriff aus gemischter Liste
      // Indizes 0–11 → shuffled[0–11], Indizes 13–24 → shuffled[12–23]
      const termIndex  = i < CENTER_INDEX ? i : i - 1;
      cell.textContent = shuffled[termIndex];
      cell.addEventListener('click', () => toggleCell(cell, i));
    }

    grid.appendChild(cell);
  }
}


/* ============================================================
   ZELLE UMSCHALTEN
   ============================================================ */

function toggleCell(cell, index) {
  if (index === CENTER_INDEX) return;

  if (markedCells.has(index)) {
    markedCells.delete(index);
    cell.classList.remove(CLASS.marked);
  } else {
    markedCells.add(index);
    cell.classList.add(CLASS.marked);
  }

  updateCounter();
  checkBingo();
}


/* ============================================================
   ZÄHLER AKTUALISIEREN
   ============================================================ */

function updateCounter() {
  document.getElementById('marked-count').textContent = markedCells.size;
}


/* ============================================================
   BINGO PRÜFEN
   Alle möglichen Gewinnlinien in einem 5×5-Raster
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

  const isMarked = (i) => i === CENTER_INDEX || markedCells.has(i);

  for (const line of lines) {
    if (line.every(isMarked)) {
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

  const centerCell = document.querySelector('.' + CLASS.center);
  if (centerCell) {
    centerCell.classList.add(CLASS.won);
  }

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
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('game-screen').style.display  = 'flex';
  buildCard();
}

function newCard() {
  buildCard();
}
