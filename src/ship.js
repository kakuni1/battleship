export class Ship {
  #hits = 0;

  constructor(length) {
    this.length = length;
  }

  hit() {
    this.#hits += 1;
  }

  isSunk() {
    return this.#hits >= this.length;
  }
}
