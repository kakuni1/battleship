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
    this.#cpuDeck = playerTwoType === PlayerType.CPU ? new CpuDeck() : null;
  }

  placeShip(index, key, name, direction) {
    if (this.phase !== gamePhase.PLACE)
      throw new Error("controller placeShip, not in 'place' phase");

    return this.getPlayer(index).gameboard.placeShip(key, name, direction);
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

  playRealTurn(key) {
    if (this.phase !== gamePhase.PLAY)
      throw new Error("controller real player turn, must be in phase 'play'");
    if (this.getPlayer(this.activePlayer).type !== PlayerType.REAL)
      throw new Error(
        "controller real player turn, must be player type 'real'",
      );

    const attacker = this.activePlayer;
    const opponent = this.getPlayer(this.opponentPlayer);

    const result = opponent.gameboard.receiveAttack(key);
    // end game or swap players & continue game
    if (opponent.gameboard.allSunk === true) {
      this.#winner = this.activePlayer;
      this.#phase = gamePhase.GAMEOVER;
    } else this.#activePlayer = this.opponentPlayer;

    return {
      success: true,
      attacker,
      key,
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
