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

  it("real player attack, returns 'hit'", () => {
    const me = new Player("a real player");
    const enemy = new Player(undefined, PlayerType.CPU);
    enemy.gameboard.placeShip(0, "Destroyer", "horizontal");
    expect(me.attack(enemy, 0)).toBe("hit");
  });

  it("real player attack, returns 'miss'", () => {
    const me = new Player("a real player");
    const enemy = new Player(undefined, PlayerType.CPU);
    enemy.gameboard.placeShip(0, "Destroyer", "horizontal");
    expect(me.attack(enemy, 55)).toBe("miss");
  });

  it("real player attack, player (me) board untouched", () => {
    const me = new Player("a real player");
    const enemy = new Player(undefined, PlayerType.CPU);
    enemy.gameboard.placeShip(0, "Destroyer", "horizontal");
    me.attack(enemy, 0);
    expect(me.gameboard.isAttacked(0)).toBe(false);
  });

  it("real player attack, cpu board (1) attack", () => {
    const me = new Player("a real player");
    const enemy = new Player(undefined, PlayerType.CPU);
    enemy.gameboard.placeShip(0, "Destroyer", "horizontal");
    me.attack(enemy, 0);
    expect(enemy.gameboard.isAttacked(0)).toBe(true);
  });

  it("real player attack, 'out of bounds' error propagates", () => {
    const me = new Player("a real player");
    const enemy = new Player(undefined, PlayerType.CPU);
    enemy.gameboard.placeShip(0, "Destroyer", "horizontal");
    expect(() => me.attack(enemy, 1000)).toThrow("attack, out of bounds");
  });

  it("real player attack, 'duplicates' error propagates", () => {
    const me = new Player("a real player");
    const enemy = new Player(undefined, PlayerType.CPU);
    enemy.gameboard.placeShip(0, "Destroyer", "horizontal");
    me.attack(enemy, 0);
    expect(() => me.attack(enemy, 0)).toThrow("attack, duplicate");
  });
});
