import { SIZE } from "./constants.js";
import { shuffle } from "./shuffle.js";

export class CpuMove {
  #deck;

  constructor(size = SIZE * SIZE) {
    this.#deck = shuffle(Array.from({ length: size }, (_, i) => i));
  }

  next() {
    if (this.isEmpty) throw new Error("cpu, out of moves");
    return this.#deck.pop();
  }

  get size() {
    return this.#deck.length;
  }

  get isEmpty() {
    return this.#deck.length === 0;
  }
}
