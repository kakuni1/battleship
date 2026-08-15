import { Ship } from "./ship.js";

function attackKey([r, c]) {
  return r * 10 + c;
}

export class Gameboard {
  constructor() {
    this.grid = Array.from({ length: 10 }, () => Array(10).fill(null));
    this.ships = [];
    this.hits = [];
    this.misses = [];
    this.attacks = new Set();
  }

  placeShip([r, c], length, direction) {
    // integer check
    if (!Number.isInteger(r) || !Number.isInteger(c))
      throw new Error("placement, must be integer");

    // length check
    if (length > 5 || length < 2) throw new Error("invalid length");

    // direction check
    if (!["h", "v"].includes(direction)) throw new Error("invalid direction");

    // bounds check
    if (r < 0 || c < 0 || r >= 10 || c >= 10)
      throw new Error("placement, out of bounds");
    if (direction === "h" && c + length > 10)
      throw new Error("placement, out of bounds");
    if (direction === "v" && r + length > 10)
      throw new Error("placement, out of bounds");

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
    // integer check
    if (!Number.isInteger(r) || !Number.isInteger(c))
      throw new Error("attack, must be integer");

    if (r < 0 || c < 0 || r >= 10 || c >= 10)
      // bounds check
      throw new Error("attack, out of bounds");

    // duplicate check
    const key = attackKey([r, c]);
    if (this.attacks.has(key)) throw new Error("attack, duplicate");
    else this.attacks.add(key);

    // miss
    const target = this.grid[r][c];
    if (target === null) {
      this.misses.push([r, c]);
      return "miss";
    }
    // hit
    else {
      target.hit();
      this.hits.push([r, c]);
      return "hit";
    }
  }

  allSunk() {
    return this.ships.every((ship) => ship.isSunk());
  }
}
