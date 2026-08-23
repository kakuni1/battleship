import { describe, expect, it } from "vitest";
import { Gameboard } from "./gameboard.js";
import { Player, PlayerType } from "./player.js";

describe("Player", () => {
  it("default type, 'real'", () => {
    const player = new Player("a real player");
    expect(player.type).toBe(PlayerType.REAL);
  });

  it("set cpu type, 'cpu'", () => {
    const player = new Player("cpu", PlayerType.CPU);
    expect(player.type).toBe(PlayerType.CPU);
  });

  it("default name 'cpu'", () => {
    const player = new Player(undefined, PlayerType.CPU);
    expect(player.name).toBe("cpu");
  });

  it("default real player name, 'Player A'", () => {
    const player = new Player();
    expect(player.name).toBe("Player A");
  });

  it("player owns gameboard instance", () => {
    const player = new Player("a player name");
    expect(player.gameboard).toBeInstanceOf(Gameboard);
  });

  it("2 independent gameboards", () => {
    const a = new Player("a player name");
    const b = new Player(undefined, PlayerType.CPU);
    expect(a.gameboard).not.toBe(b.gameboard);
  });
});
