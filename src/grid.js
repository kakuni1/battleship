import { SIZE } from "./constants.js";

export function spanCells(key, length, direction) {
  return Array.from({ length }, (_, i) =>
    direction === "horizontal" ? key + i : key + i * SIZE,
  );
}

export function fitsBoard(key, length, direction) {
  if (!["horizontal", "vertical"].includes(direction)) return false;
  if (direction === "horizontal") return (key % SIZE) + length <= SIZE;
  if (direction === "vertical") return Math.floor(key / SIZE) + length <= SIZE;
}
