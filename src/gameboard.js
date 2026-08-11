import { Ship } from "./ship.js";

export class Gameboard {
  constructor() {
    this.grid = Array.from({ length: 10 }, () => Array(10).fill(null));
    this.ships = [];
    this.misses = [];
  }

  placeShip([r, c], length, direction) {
    // length check
    if (length > 5 || length < 2) throw new Error("invalid length");

    // direction check
    if (!["h", "v"].includes(direction)) throw new Error("invalid direction");

    // bounds check
    if (r < 0 || c < 0 || r >= 10 || c >= 10) throw new Error("out of bounds");
    if (direction === "h" && c + length > 10) throw new Error("out of bounds");
    if (direction === "v" && r + length > 10) throw new Error("out of bounds");

    // overlap check
    const cells = [];
    for (let i = 0; i < length; i++)
      cells.push(direction === "h" ? [r, c + i] : [r + i, c]);
    for (const [cr, cc] of cells)
      if (this.grid[cr][cc] !== null) throw new Error("cell occupied");

    // valid ship position
    const ship = new Ship(length);
    for (const [cr, cc] of cells) this.grid[cr][cc] = ship;

    // return ship
    this.ships.push(ship);
    return ship;
  }

  receiveAttack([r, c]) {
    const target = this.grid[r][c];
    if (target === null) this.misses.push([r, c]);
    else target.hit();
  }

  allSunk() {
    return this.ships.every((ship) => ship.isSunk());
  }
}
