import { Ship } from "./ship.js";

export const SIZE = 10;
export const FLEET = Object.freeze([
  Object.freeze({ name: "Destroyer", length: 2 }),
  Object.freeze({ name: "Submarine", length: 3 }),
  Object.freeze({ name: "Cruiser", length: 3 }),
  Object.freeze({ name: "Battleship", length: 4 }),
  Object.freeze({ name: "Carrier", length: 5 }),
]);

export class Gameboard {
  #attacks = new Set();
  #placed = new Set();
  #ships = [];

  constructor() {
    this.grid = Array(SIZE * SIZE).fill(null);
    this.hits = [];
    this.misses = [];
  }

  placeShip(key, name, direction) {
    // integer check
    if (!Number.isInteger(key)) throw new Error("place, must be integer");

    // ship check
    const entry = FLEET.find((s) => s.name === name);
    if (entry === undefined) throw new Error("place, invalid ship name");

    // duplicate check
    if (this.#placed.has(name)) throw new Error("place, ship already placed");

    // direction check
    if (!["horizontal", "vertical"].includes(direction)) {
      throw new Error("place, invalid direction");
    }

    // bounds check
    if (key < 0 || key >= SIZE * SIZE) throw new Error("place, out of bounds");

    // wrap check
    if (direction === "horizontal" && (key % SIZE) + entry.length > SIZE) {
      throw new Error("place, out of bounds");
    }
    if (
      direction === "vertical" &&
      Math.floor(key / SIZE) + entry.length > SIZE
    ) {
      throw new Error("place, out of bounds");
    }

    // overlap check
    const cells = [];
    for (let i = 0; i < entry.length; i++) {
      cells.push(direction === "horizontal" ? key + i : key + i * SIZE);
    }
    for (const cell of cells) {
      if (this.grid[cell] !== null) throw new Error("place, cell occupied");
    }

    // valid ship position
    const ship = new Ship(entry.length);
    for (const cell of cells) this.grid[cell] = ship;

    // return ship
    this.#ships.push(ship);
    this.#placed.add(name);
    return ship;
  }

  receiveAttack(key) {
    // integer check
    if (!Number.isInteger(key)) throw new Error("attack, must be integer");

    // bounds check
    if (key < 0 || key >= SIZE * SIZE) throw new Error("attack, out of bounds");

    // duplicate check
    if (this.#attacks.has(key)) throw new Error("attack, duplicate");
    this.#attacks.add(key);

    // miss
    const target = this.grid[key];
    if (target === null) {
      this.misses.push(key);
      return "miss";
    } // hit
    else {
      target.hit();
      this.hits.push(key);
      return "hit";
    }
  }

  isAttacked(key) {
    return this.#attacks.has(key);
  }

  get allSunk() {
    return this.#ships.length > 0 && this.#ships.every((ship) => ship.isSunk);
  }

  get fleetDone() {
    return this.#placed.size === FLEET.length;
  }
}
