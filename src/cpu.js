import { SIZE } from "./constants.js";
import { shuffle } from "./shuffle.js";

export class Deck {
  #deck;
  #queue = [];
  #attempted = new Set();
  #queued = new Set();
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

    for (const a of this.#adKeys(key))
      if (!this.#attempted.has(a) && !this.#queued.has(a)) {
        this.#queued.add(a);
        this.#queue.push(a);
      }
  }

  get size() {
    return this.#total - this.#attempted.size;
  }

  get isEmpty() {
    return this.#attempted.size === this.#total;
  }

  #adKeys(key) {
    const ad = [];

    // left
    if (key % SIZE !== 0) ad.push(key - 1);
    // right
    if (key % SIZE !== SIZE - 1) ad.push(key + 1);
    // up
    if (key >= SIZE) ad.push(key - SIZE);
    // down
    if (key + SIZE < this.#total) ad.push(key + SIZE);

    // filter to set size
    return ad.filter((can) => can >= 0 && can < this.#total);
  }
}
