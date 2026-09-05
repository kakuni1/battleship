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
