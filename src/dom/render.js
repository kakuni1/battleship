import { FLEET, SIZE } from "../constants.js";

export function createBoard() {
  const board = document.createElement("div");
  board.classList.add("board");

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
    if (result === "miss") cell.classList.add("miss");
    if (result === "hit") cell.classList.add("hit");
    if (sunk) cell.classList.add("sunk");
  }
}

export function clearBoard(boardEl) {
  for (const cell of boardEl.querySelectorAll(".cell"))
    cell.classList.remove("miss", "hit", "sunk", "ship");
}

export function updateQueue(ulEl, gameboard) {
  const fleet = new Set();
  for (const ship of gameboard.fleetShips) fleet.add(ship.name);
  for (const li of ulEl.children)
    li.classList.toggle("placed", fleet.has(li.dataset.name));
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
    cell.classList.toggle("ship", shipKeys.has(key));
}
