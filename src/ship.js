export class Ship {
  #hits = 0;
  #length;

  constructor(length) {
    // length check
    if (!Number.isInteger(length) || length < 2 || length > 5) {
      throw new Error("ship, invalid length");
    }
    this.#length = length;
  }

  get length() {
    return this.#length;
  }

  hit() {
    this.#hits += 1;
  }

  get isSunk() {
    return this.#hits >= this.#length;
  }
}
