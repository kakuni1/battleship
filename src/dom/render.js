import { FLEET, SIZE } from "../constants.js";

const SHIP_CLASSES = Object.freeze({
  MISS: "miss",
  HIT: "hit",
  SUNK: "sunk",
  PLACED: "placed",
  SHIP: "ship",
});

const PREVIEW_CLASSES = Object.freeze({
  VALID: "preview-valid",
  INVALID: "preview-invalid",
});

export function createBoard() {
  const board = document.createElement("div");
  board.classList.add("board");
  board.style.setProperty("--size", SIZE);

  for (let key = 0; key < SIZE * SIZE; key++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    // assign key (coords) to dataset
    cell.dataset.key = key;
    // allow tab to cycle through the two gameboards
    cell.tabIndex = key === 0 ? 0 : -1;
    board.appendChild(cell);
  }

  return board;
}

export function updateBoard(boardEl, gameboard) {
  for (const [key, cell] of boardEl.querySelectorAll(".cell").entries()) {
    const result = gameboard.resultAt(key);
    const sunk = gameboard.shipAt(key)?.isSunk ?? false;
    if (result === SHIP_CLASSES.MISS) cell.classList.add(SHIP_CLASSES.MISS);
    if (result === SHIP_CLASSES.HIT) cell.classList.add(SHIP_CLASSES.HIT);
    if (sunk) cell.classList.add(SHIP_CLASSES.SUNK);
  }
}

export function clearBoard(boardEl) {
  for (const cell of boardEl.querySelectorAll(".cell")) {
    for (const shipClass of Object.values(SHIP_CLASSES))
      cell.classList.remove(shipClass);
    for (const previewClass of Object.values(PREVIEW_CLASSES))
      cell.classList.remove(previewClass);
  }
}

export function updateQueue(ulEl, gameboard) {
  const fleet = new Set();
  for (const ship of gameboard.fleetShips) fleet.add(ship.name);
  for (const li of ulEl.children)
    li.classList.toggle(SHIP_CLASSES.PLACED, fleet.has(li.dataset.name));
}

export function buildQueue(ulEl) {
  for (const { name } of FLEET) {
    const li = document.createElement("li");
    li.textContent = name;
    li.dataset.name = name;
    ulEl.appendChild(li);
  }
}

export function markShips(boardEl, gameboard) {
  const shipKeys = new Set(gameboard.fleetShips.flatMap((ship) => ship.cells));
  for (const [key, cell] of boardEl.querySelectorAll(".cell").entries())
    cell.classList.toggle(SHIP_CLASSES.SHIP, shipKeys.has(key));
}

export function clearPreview(boardEl) {
  for (const cell of boardEl.querySelectorAll(".cell")) {
    cell.classList.remove(PREVIEW_CLASSES.VALID);
    cell.classList.remove(PREVIEW_CLASSES.INVALID);
  }
}

export function renderPreview(boardEl, cells, valid) {
  clearPreview(boardEl);
  const className = valid ? PREVIEW_CLASSES.VALID : PREVIEW_CLASSES.INVALID;
  for (const key of cells) {
    const cell = boardEl.querySelector(`.cell[data-key="${key}"]`);
    if (cell) cell.classList.add(className);
  }
}
