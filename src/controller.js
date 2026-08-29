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
    playerOneType = PlayerType.REAL,
    playerTwoType = PlayerType.CPU,
  ) {
    this.#players = [
      new Player(playerOneName, playerOneType),
      new Player(playerTwoName, playerTwoType),
    ];
    this.#activePlayer = 0;
    this.#phase = gamePhase.PLACE;
    this.#winner = null;
    this.#cpuDeck = [
      playerOneType === PlayerType.CPU ? new CpuDeck() : null,
      playerTwoType === PlayerType.CPU ? new CpuDeck() : null,
    ];
  }

  placeShip(index, key, name, direction) {
    if (this.phase !== gamePhase.PLACE)
      throw new Error("controller placeShip, not in 'place' phase");

    return this.getPlayer(index).gameboard.placeShip(key, name, direction);
  }

  removeShip(index, name) {
    if (this.phase !== gamePhase.PLACE)
      throw new Error("controller removeShip, not in 'place' phase");

    return this.getPlayer(index).gameboard.removeShip(name);
  }

  autoPlace(index) {
    if (this.phase !== gamePhase.PLACE)
      throw new Error("controller autoPlace, not in 'place' phase");

    const board = this.getPlayer(index).gameboard;
    board.resetShips();
    return autoFleet(board);
  }

  startGame() {
    if (this.phase !== gamePhase.PLACE)
      throw new Error("controller start game, not in 'place' phase");

    const active = this.getPlayer(this.activePlayer);
    const opponent = this.getPlayer(this.opponentPlayer);

    if (active.type === PlayerType.CPU) this.autoPlace(this.activePlayer);
    if (opponent.type === PlayerType.CPU) this.autoPlace(this.opponentPlayer);
    if (
      active.gameboard.fleetDone !== true ||
      opponent.gameboard.fleetDone !== true
    )
      throw new Error("controller start game, fleets not yet fully placed");

    this.#phase = gamePhase.PLAY;
  }

  playTurn(key) {
    if (this.phase !== gamePhase.PLAY)
      throw new Error("controller process turn, must be in phase 'play'");

    const attacker = this.activePlayer;
    const opponent = this.getPlayer(this.opponentPlayer);
    const targetKey =
      this.getPlayer(this.activePlayer).type === PlayerType.CPU
        ? this.#cpuDeck.next()
        : key;
    const result = opponent.gameboard.receiveAttack(targetKey);

    // end game or swap players & continue game
    if (opponent.gameboard.allSunk === true) {
      this.#winner = this.activePlayer;
      this.#phase = gamePhase.GAMEOVER;
    } else this.#activePlayer = this.opponentPlayer;

    return {
      success: true,
      attacker,
      targetKey,
      result: result.result,
      ship: result.name,
      sunk: result.sunk,
      gameover: this.isGameOver,
      winner: this.winner,
    };
  }

  getPlayer(index) {
    return this.#players[index];
  }

  resetGame() {
    this.#activePlayer = 0;
    this.#players = [
      new Player(this.#players[0].name, this.#players[0].type),
      new Player(this.#players[1].name, this.#players[1].type),
    ];
    this.#cpuDeck = [
      this.#players[0].type === PlayerType.CPU ? new CpuDeck() : null,
      this.#players[1].type === PlayerType.CPU ? new CpuDeck() : null,
    ];
    this.#phase = gamePhase.PLACE;
    this.#winner = null;
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
    return this.#winner;
  }

  get isGameOver() {
    return this.#phase === gamePhase.GAMEOVER;
  }
}
