import { Gameboard } from "./gameboard.js";

export const PlayerType = Object.freeze({
  REAL: "real",
  CPU: "cpu",
});

export class Player {
  #gameboard;
  #name;
  #type;

  constructor(name, type = PlayerType.REAL) {
    this.#gameboard = new Gameboard();
    this.#name = name ?? (type === PlayerType.REAL ? "Player A" : "cpu");
    this.#type = type;
  }

  get gameboard() {
    return this.#gameboard;
  }

  get name() {
    return this.#name;
  }

  get type() {
    return this.#type;
  }
}
