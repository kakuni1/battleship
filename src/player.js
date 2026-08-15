import { Gameboard } from "./gameboard.js";

export const PlayerType = Object.freeze({
  REAL: "real",
  CPU: "cpu",
});

export class Player {
  constructor(name, type = PlayerType.REAL) {
    this.name = name ?? (type === PlayerType.REAL ? "Player A" : "cpu");
    this.type = type;
    this.gameboard = new Gameboard();
  }

  attack(enemy, [r, c]) {
    return enemy.gameboard.receiveAttack([r, c]);
  }
}
