import { SIZE } from "./constants.js";
import { shuffle } from "./shuffle.js";

export class Deck {
  #deck;
  #queue = [];
  #attempted = new Set();
  #queued = new Map();
  #total;

  constructor(size = SIZE * SIZE) {
    this.#deck = shuffle(Array.from({ length: size }, (_, i) => i));
    this.#total = size;
  }

  next() {
    if (this.isEmpty) throw new Error("cpu, out of moves");

    while (this.#queue.length > 0) {
      const key = this.#queue.pop();
      this.#queued.delete(key);

      if (!this.#attempted.has(key)) {
        this.#attempted.add(key);
        return key;
      }
    }

    while (this.#deck.length > 0) {
      const key = this.#deck.pop();

      if (!this.#attempted.has(key) && !this.#queued.has(key)) {
        this.#attempted.add(key);
        return key;
      }
    }

    throw new Error("cpu, out of moves");
  }

  recordAttack(key, result) {
    if (result.result !== "hit") return;
    const ship = result.name;
    const keys = [];

    if (result.sunk) {
      this.#clearQueue(ship);
      return;
    }

    for (const adjacent of this.#adjacentKeys(key))
      if (!this.#attempted.has(adjacent)) {
        const ships = this.#queued.get(adjacent);

        if (ships === undefined) {
          this.#queued.set(adjacent, new Set([ship]));
          keys.push(adjacent);
        } else ships.add(ship);
      }

    shuffle(keys);
    this.#queue.push(...keys);
  }

  get size() {
    return this.#total - this.#attempted.size;
  }

  get isEmpty() {
    return this.#attempted.size === this.#total;
  }

  #adjacentKeys(key) {
    const adjacent = [];

    // left
    if (key % SIZE !== 0) adjacent.push(key - 1);
    // right
    if (key % SIZE !== SIZE - 1) adjacent.push(key + 1);
    // up
    if (key >= SIZE) adjacent.push(key - SIZE);
    // down
    if (key + SIZE < this.#total) adjacent.push(key + SIZE);

    // filter to set size
    return adjacent.filter((can) => can >= 0 && can < this.#total);
  }

  #clearQueue(ship) {
    for (const [key, ships] of this.#queued) {
      ships.delete(ship);
      if (ships.size === 0) this.#queued.delete(key);
    }

    this.#queue = this.#queue.filter((key) => this.#queued.has(key));
  }
}
