import { FLEET, SIZE } from "./constants.js";
import { Ship } from "./ship.js";

export class Gameboard {
  #attacks = new Set();
  #ships = new Map();
  #hits;
  #misses;
  #grid;

  constructor() {
    this.#grid = Array(SIZE * SIZE).fill(null);
    this.#hits = [];
    this.#misses = [];
  }

  placeShip(key, name, direction) {
    this.#validateKey(key, "place");

    // ship check
    const entry = FLEET.find((s) => s.name === name);
    if (entry === undefined) throw new Error("place, invalid ship name");

    // duplicate check
    if (this.#ships.has(name)) throw new Error("place, ship already placed");

    // direction check
    if (!["horizontal", "vertical"].includes(direction)) {
      throw new Error("place, invalid direction");
    }

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
      if (this.#grid[cell] !== null) throw new Error("place, cell occupied");
    }

    // valid ship position
    const ship = new Ship(entry.length);
    for (const cell of cells) this.#grid[cell] = ship;

    // return ship
    this.#ships.set(name, { ship, cells });
    return ship;
  }

  removeShip(name) {
    if (this.#attacks.size > 0) throw new Error("remove, game already started");
    if (!this.#ships.has(name)) throw new Error("remove, ship not yet placed");

    const entry = this.#ships.get(name);
    for (const cell of entry.cells) this.#grid[cell] = null;
    this.#ships.delete(name);
  }

  receiveAttack(key) {
    this.#validateKey(key, "attack");

    // duplicate check
    if (this.#attacks.has(key)) throw new Error("attack, duplicate");
    this.#attacks.add(key);

    // miss
    const target = this.#grid[key];
    if (target === null) {
      this.#misses.push(key);
      return { result: "miss", name: null, sunk: false };
    } // hit
    else {
      for (const [name, entry] of this.#ships) {
        if (entry.ship === target) {
          entry.ship.hit();
          this.#hits.push(key);
          return { result: "hit", name, sunk: entry.ship.isSunk };
        }
      }
    }
  }

  isAttacked(key) {
    return this.#attacks.has(key);
  }

  isEmpty(key) {
    return this.#grid[key] === null;
  }

  get allSunk() {
    return (
      this.#ships.size > 0 &&
      this.#ships.values().every(({ ship }) => ship.isSunk)
    );
  }

  shipAt(key) {
    this.#validateKey(key, "shipAt");

    // empty check
    const ship = this.#grid[key];
    if (ship === null) return null;

    for (const [name, entry] of this.#ships)
      if (entry.ship === ship) return { name, isSunk: ship.isSunk };

    return null;
  }

  get fleetShips() {
    return [...this.#ships].map(([name, { ship, cells }]) => ({
      name,
      cells: [...cells],
      isSunk: ship.isSunk,
    }));
  }

  get fleetDone() {
    return this.#ships.size === FLEET.length;
  }

  get attacks() {
    return new Set(this.#attacks);
  }

  get hits() {
    return [...this.#hits];
  }

  get misses() {
    return [...this.#misses];
  }

  reset() {
    if (this.#attacks.size > 0) throw new Error("reset, game already started");

    this.#ships.clear();
    this.#grid.fill(null);
    this.#attacks.clear();
    this.#hits = [];
    this.#misses = [];
  }

  #validateKey(key, prefix) {
    if (!Number.isInteger(key)) throw new Error(`${prefix}, must be integer`);
    if (key < 0 || key >= SIZE * SIZE)
      throw new Error(`${prefix}, out of bounds`);
  }
}
