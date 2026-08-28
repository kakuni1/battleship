import { describe, expect, it } from "vitest";
import { GameController } from "./controller.js";
import { PlayerType } from "./player.js";

describe("GameController", () => {
  it("return, player info", () => {
    const game = new GameController();
    expect(game.getPlayer(0).name).toBe("Player 1");
    expect(game.getPlayer(0).type).toBe("real");
    expect(game.getPlayer(1).name).toBe("Computer");
    expect(game.getPlayer(1).type).toBe("cpu");
  });

  it("placeShip, through the controller", () => {
    const game = new GameController();
    game.placeShip(0, 0, "Destroyer", "horizontal");
    expect(game.getPlayer(0).gameboard.shipAt(0)).toEqual({
      isSunk: false,
      name: "Destroyer",
    });
    expect(game.getPlayer(0).gameboard.shipAt(1)).toEqual({
      isSunk: false,
      name: "Destroyer",
    });
    expect(game.getPlayer(0).gameboard.shipAt(2)).toBeNull();
  });

  it("autoPlace, reset board & randomly place (5) ships", () => {
    const game = new GameController();
    game.autoPlace(0);
    expect(game.getPlayer(0).gameboard.fleetDone).toBe(true);
    expect(game.getPlayer(0).gameboard.fleetShips.length).toBe(5);
  });

  it("startGame, real & cpu, real fleet incomplete, throw error", () => {
    const game = new GameController();
    expect(() => game.startGame()).toThrow(
      "controller start game, fleets not yet fully placed",
    );
  });

  it("startGame, game phase already in 'play', throw error", () => {
    const game = new GameController();
    game.autoPlace(0);
    game.startGame();
    expect(() => game.startGame()).toThrow(
      "controller start game, not in 'place' phase",
    );
  });

  it("startGame, autoPlace after game start, throw error", () => {
    const game = new GameController();
    game.autoPlace(0);
    game.startGame();
    expect(() => game.autoPlace(0)).toThrow(
      "controller autoPlace, not in 'place' phase",
    );
  });

  it("startGame, both real, both real fleets incomplete, throw error", () => {
    const game = new GameController(
      "Alice",
      "Bob",
      PlayerType.REAL,
      PlayerType.REAL,
    );
    expect(() => game.startGame()).toThrow(
      "controller start game, fleets not yet fully placed",
    );
  });

  it("startGame, both cpu, both cpu fleets auto-placed", () => {
    const game = new GameController(
      "Computer 1",
      "Computer 2",
      PlayerType.CPU,
      PlayerType.CPU,
    );
    game.startGame();
    expect(game.getPlayer(0).gameboard.fleetDone).toBe(true);
    expect(game.getPlayer(1).gameboard.fleetDone).toBe(true);
    expect(game.phase).toBe("play");
  });

  it("startGame, real player, manual placement", () => {
    const game = new GameController();
    game.placeShip(0, 0, "Carrier", "horizontal");
    game.placeShip(0, 10, "Battleship", "horizontal");
    game.placeShip(0, 20, "Cruiser", "horizontal");
    game.placeShip(0, 30, "Submarine", "horizontal");
    game.placeShip(0, 40, "Destroyer", "horizontal");
    game.startGame();
    expect(game.getPlayer(0).gameboard.fleetDone).toBe(true);
    expect(game.getPlayer(1).gameboard.fleetDone).toBe(true);
    expect(game.phase).toBe("play");
  });

  it("startGame, game state ready", () => {
    const game = new GameController();
    game.autoPlace(0);
    game.startGame();
    expect(game.getPlayer(0).gameboard.fleetDone).toBe(true);
    expect(game.getPlayer(1).gameboard.fleetDone).toBe(true);
    expect(game.phase).toBe("play");
  });

  it("playRealTurn, not in phase 'play', throw error", () => {
    const game = new GameController();
    expect(() => game.playRealTurn(0)).toThrow(
      "controller real player turn, must be in phase 'play'",
    );
  });

  it("playRealTurn, not for 'cpu', throw error", () => {
    const game = new GameController(
      "Computer 1",
      "Computer 2",
      PlayerType.CPU,
      PlayerType.CPU,
    );
    expect(() => game.playRealTurn(0)).toThrow(
      "controller real player turn, must be in phase 'play'",
    );
  });

  it("playRealTurn, win ends game", () => {
    const game = new GameController(
      "Alice",
      "Bob",
      PlayerType.REAL,
      PlayerType.REAL,
    );
    game.placeShip(0, 0, "Carrier", "horizontal");
    game.placeShip(0, 10, "Battleship", "horizontal");
    game.placeShip(0, 20, "Cruiser", "horizontal");
    game.placeShip(0, 30, "Submarine", "horizontal");
    game.placeShip(0, 40, "Destroyer", "horizontal");
    game.placeShip(1, 0, "Carrier", "horizontal");
    game.placeShip(1, 10, "Battleship", "horizontal");
    game.placeShip(1, 20, "Cruiser", "horizontal");
    game.placeShip(1, 30, "Submarine", "horizontal");
    game.placeShip(1, 40, "Destroyer", "horizontal");
    game.startGame();
    game.playRealTurn(0);
    game.playRealTurn(0);
    game.playRealTurn(1);
    game.playRealTurn(1);
    game.playRealTurn(2);
    game.playRealTurn(2);
    game.playRealTurn(3);
    game.playRealTurn(3);
    game.playRealTurn(4);
    game.playRealTurn(4);
    game.playRealTurn(10);
    game.playRealTurn(10);
    game.playRealTurn(11);
    game.playRealTurn(11);
    game.playRealTurn(12);
    game.playRealTurn(12);
    game.playRealTurn(13);
    game.playRealTurn(13);
    game.playRealTurn(20);
    game.playRealTurn(20);
    game.playRealTurn(21);
    game.playRealTurn(21);
    game.playRealTurn(22);
    game.playRealTurn(22);
    game.playRealTurn(30);
    game.playRealTurn(30);
    game.playRealTurn(31);
    game.playRealTurn(31);
    game.playRealTurn(32);
    game.playRealTurn(32);
    game.playRealTurn(40);
    game.playRealTurn(40);
    const final = game.playRealTurn(41);
    expect(final.result).toBe("hit");
    expect(final.sunk).toBe(true);
    expect(final.winner).toBe(0);
    expect(final.gameover).toBe(true);
    expect(game.winner).toBe(0);
    expect(game.phase).toBe("gameOver");
    expect(game.isGameOver).toBe(true);
  });

  it("playRealTurn, win ends game", () => {
    const game = new GameController(
      "Alice",
      "Bob",
      PlayerType.REAL,
      PlayerType.REAL,
    );
    game.placeShip(0, 0, "Carrier", "horizontal");
    game.placeShip(0, 10, "Battleship", "horizontal");
    game.placeShip(0, 20, "Cruiser", "horizontal");
    game.placeShip(0, 30, "Submarine", "horizontal");
    game.placeShip(0, 40, "Destroyer", "horizontal");
    game.placeShip(1, 0, "Carrier", "horizontal");
    game.placeShip(1, 10, "Battleship", "horizontal");
    game.placeShip(1, 20, "Cruiser", "horizontal");
    game.placeShip(1, 30, "Submarine", "horizontal");
    game.placeShip(1, 40, "Destroyer", "horizontal");
    game.startGame();
    game.playRealTurn(0);
    game.playRealTurn(0);
    game.playRealTurn(1);
    game.playRealTurn(1);
    game.playRealTurn(2);
    game.playRealTurn(2);
    game.playRealTurn(3);
    game.playRealTurn(3);
    game.playRealTurn(4);
    game.playRealTurn(4);
    game.playRealTurn(10);
    game.playRealTurn(10);
    game.playRealTurn(11);
    game.playRealTurn(11);
    game.playRealTurn(12);
    game.playRealTurn(12);
    game.playRealTurn(13);
    game.playRealTurn(13);
    game.playRealTurn(20);
    game.playRealTurn(20);
    game.playRealTurn(21);
    game.playRealTurn(21);
    game.playRealTurn(22);
    game.playRealTurn(22);
    game.playRealTurn(30);
    game.playRealTurn(30);
    game.playRealTurn(31);
    game.playRealTurn(31);
    game.playRealTurn(32);
    game.playRealTurn(32);
    game.playRealTurn(40);
    game.playRealTurn(40);
    game.playRealTurn(41);
    expect(() => game.playRealTurn(41)).toThrow(
      "controller real player turn, must be in phase 'play'",
    );
  });

  it("return, current phase", () => {
    const game = new GameController();
    expect(game.phase).toBe("place");
  });

  it("return, current player", () => {
    const game = new GameController();
    expect(game.activePlayer).toBe(0);
  });

  it("return, opponent player", () => {
    const game = new GameController();
    expect(game.opponentPlayer).toBe(1);
  });

  it("return, winner", () => {
    const game = new GameController();
    expect(game.winner).toBeNull();
  });

  it("return, gameover state", () => {
    const game = new GameController();
    expect(game.isGameOver).toBe(false);
  });
});
