import { autoFleet } from "./fleet.js";
import { CpuDeck } from "./move.js";
import { Player, PlayerType } from "./player.js";

export const gamePhase = Object.freeze({
  PLACE: "place",
  PLAY: "play",
  GAMEOVER: "gameOver",
});

export class GameController {
  #players;
  #activePlayer;
  #phase;
  #winner;
  #cpuDeck;

  constructor(
    playerOneName = "Player 1",
    playerTwoName = "Computer",
    playerTwoType = PlayerType.CPU,
  ) {
    this.#players = [
      new Player(playerOneName, PlayerType.REAL),
      new Player(playerTwoName, playerTwoType),
    ];
    this.#activePlayer = 0;
    this.#phase = gamePhase.PLACE;
    this.#winner = null;
    this.#cpuDeck = playerTwoType === PlayerType.CPU ? new CpuDeck() : null;
  }

  getPlayer(index) {
    return this.#players[index];
  }

  placeShip(key, name, direction) {
    if (this.#phase !== gamePhase.PLACE)
      throw new Error("controller placeShip, not in 'place' phase");

    return this.getPlayer(this.activePlayer).gameboard.placeShip(
      key,
      name,
      direction,
    );
  }

  autoPlace() {
    if (this.#phase !== gamePhase.PLACE)
      throw new Error("controller placeShip, not in 'place' phase");

    const board = this.getPlayer(this.activePlayer).gameboard;
    board.resetShips();
    return autoFleet(board);
  }

  get activePlayer() {
    return this.#activePlayer;
  }

  get opponentPlayer() {
    return this.activePlayer === 0 ? 1 : 0;
  }

  get phase() {
    return this.#phase;
  }

  get winner() {
    return this.#winner === null ? this.#winner : null;
  }

  get isGameOver() {
    return this.#phase === gamePhase.GAMEOVER ? true : false;
  }
}
