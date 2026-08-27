import { describe, expect, it } from "vitest";
import { GameController } from "./controller";

describe("GameController", () => {
  it("return, player info", () => {
    const game = new GameController();
    expect(game.getPlayer(0).name).toBe("Player 1");
    expect(game.getPlayer(0).type).toBe("real");
    expect(game.getPlayer(1).name).toBe("Computer");
    expect(game.getPlayer(1).type).toBe("cpu");
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
