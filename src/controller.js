import { CpuDeck } from "./move";
import { Player, PlayerType } from "./player";

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
}
