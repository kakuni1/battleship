import { SIZE } from "../constants.js";

export function createBoard() {
  const board = document.createElement("div");
  board.classList.add("board");

  for (let key = 0; key < SIZE * SIZE; key++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.key = key;
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
    cell.classList.remove("miss", "hit", "sunk");
}
