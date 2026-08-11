import { describe, it, expect } from "vitest";
import { Gameboard } from "./gameboard.js";

describe("Gameboard", () => {
  it("initialize empty 10x10 grid, each filled as null", () => {
    const board = new Gameboard();
    const emptyRow = Array(10).fill(null);
    expect(board.grid.length).toBe(10);
    for (const row of board.grid) expect(row).toEqual(emptyRow);
  });

  it("rows are independent arrays", () => {
    const board = new Gameboard();
    expect(board.grid[0]).not.toBe(board.grid[1]);
  });

  it("check for valid length", () => {
    const board = new Gameboard();
    expect(() => board.placeShip([0, 0], 1, "h")).toThrow("invalid length");
  });

  it("check for valid direction", () => {
    const board = new Gameboard();
    expect(() => board.placeShip([0, 0], 2, "x")).toThrow("invalid direction");
  });

  it("place ship (2), horizontal", () => {
    const board = new Gameboard();
    const ship = board.placeShip([0, 0], 2, "h");
    for (const c of [0, 1]) expect(board.grid[0][c]).toBe(ship);
  });

  it("place ship (5), vertical", () => {
    const board = new Gameboard();
    const ship = board.placeShip([2, 2], 5, "v");
    for (const r of [2, 3, 4, 5, 6]) expect(board.grid[r][2]).toBe(ship);
  });

  it("place ship (5), vertical, completely out of bounds", () => {
    const board = new Gameboard();
    expect(() => board.placeShip([-5, -5], 5, "v")).toThrow("out of bounds");
  });

  it("place ship (2), horizontal, extends out of bounds", () => {
    const board = new Gameboard();
    expect(() => board.placeShip([9, 9], 2, "h")).toThrow("out of bounds");
  });

  it("place ship (2), overlap", () => {
    const board = new Gameboard();
    board.placeShip([0, 0], 2, "h");
    expect(() => board.placeShip([0, 0], 2, "h")).toThrow("cell occupied");
  });

  it("ship (2), receive attack (1), isSunk false", () => {
    const board = new Gameboard();
    const ship = board.placeShip([0, 0], 2, "h");
    board.receiveAttack([0, 0]);
    expect(ship.isSunk()).toBe(false);
  });

  it("ship (2), receive attack (2), isSunk true", () => {
    const board = new Gameboard();
    const ship = board.placeShip([0, 0], 2, "h");
    board.receiveAttack([0, 0]);
    board.receiveAttack([0, 1]);
    expect(ship.isSunk()).toBe(true);
  });

  it("ship (5), receive attack (7), mismatched", () => {
    const board = new Gameboard();
    const ship = board.placeShip([2, 2], 5, "v");
    for (const r of [2, 3, 4, 5, 6, 7, 8]) board.receiveAttack([r, 2]);
    expect(ship.isSunk()).toBe(true);
  });

  it("miss (1), track the miss", () => {
    const board = new Gameboard();
    board.placeShip([0, 0], 2, "h");
    board.receiveAttack([5, 5]);
    expect(board.misses).toEqual([[5, 5]]);
  });

  it("hit (1), miss, dont track", () => {
    const board = new Gameboard();
    board.placeShip([0, 0], 2, "h");
    board.receiveAttack([0, 0]);
    expect(board.misses).toEqual([]);
  });

  it("ships (2) & (5), not sunk, allSunk false", () => {
    const board = new Gameboard();
    board.placeShip([0, 0], 2, "h");
    board.placeShip([5, 5], 2, "v");
    board.receiveAttack([0, 0]);
    board.receiveAttack([5, 5]);
    expect(board.allSunk()).toBe(false);
  });

  it("ships (2) & (5), sink only (2), allSunk false", () => {
    const board = new Gameboard();
    board.placeShip([0, 0], 2, "h");
    board.placeShip([5, 5], 2, "v");
    for (const c of [0, 1]) board.receiveAttack([0, c]);
    expect(board.allSunk()).toBe(false);
  });

  it("ships (2) & (5), sunk, allSunk true", () => {
    const board = new Gameboard();
    board.placeShip([0, 0], 2, "h");
    board.placeShip([3, 3], 5, "v");
    for (const c of [0, 1]) board.receiveAttack([0, c]);
    for (const r of [3, 4, 5, 6, 7]) board.receiveAttack([r, 3]);
    expect(board.allSunk()).toBe(true);
  });
});
