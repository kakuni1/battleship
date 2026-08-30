import { FLEET, SIZE } from "./constants.js";
import { shuffle } from "./shuffle.js";

export function autoFleet(board, maxRestarts = 10) {
  // retry with wiped board if stuck
  for (let attempt = 0; attempt < maxRestarts; attempt++)
    if (randomFleet(board)) return board;
  throw new Error("cpu fleet, multiple restarts, unable to place ships");
}

function randomFleet(board) {
  const placed = [];

  for (const { name, length } of FLEET) {
    // shuffle the generated placements
    const cans = canCell(length).filter((can) => validCell(board, can));
    const pick = shuffle(cans).pop();

    // wipe board if unsuccessful
    if (pick === undefined) {
      board.reset();
      return false;
    }

    board.placeShip(pick.key, name, pick.direction);
    placed.push(name);
  }

  return true;
}

function forCell(key, length, direction) {
  // generate random placements
  return Array.from({ length }, (_, i) =>
    direction === "horizontal" ? key + i : key + i * SIZE,
  );
}

function canCell(length) {
  // filter out-of-bounds considering ship length
  const cans = [];

  for (let key = 0; key < SIZE * SIZE; key++) {
    const col = key % SIZE;
    const row = Math.floor(key / SIZE);

    if (col + length <= SIZE) {
      cans.push({
        key,
        direction: "horizontal",
        cells: forCell(key, length, "horizontal"),
      });
    }
    if (row + length <= SIZE) {
      cans.push({
        key,
        direction: "vertical",
        cells: forCell(key, length, "vertical"),
      });
    }
  }

  return cans;
}

function validCell(board, can) {
  // occupancy check
  return can.cells.every((cell) => board.isEmpty(cell));
}
