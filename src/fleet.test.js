import { describe, expect, it } from "vitest";
import { autoFleet } from "./fleet.js";
import { Gameboard } from "./gameboard.js";

describe("autoFleet", () => {
  it("random cpu fleet placement, fleetDone true", () => {
    const board = new Gameboard();
    autoFleet(board);
    expect(board.fleetDone).toBe(true);
  });

  it("full fleet, (17) cells", () => {
    const board = new Gameboard();
    autoFleet(board);
    expect(board.fleetShips.reduce((n, s) => n + s.cells.length, 0)).toBe(17);
  });

  it("unique ships (5)", () => {
    const board = new Gameboard();
    autoFleet(board);
    expect(board.fleetShips.length).toBe(5);
  });

  it("new fleet, no hits or misses", () => {
    const board = new Gameboard();
    autoFleet(board);
    expect(board.hits).toEqual([]);
    expect(board.misses).toEqual([]);
  });

  it("check that ships were randomly placed, run multiple times (10)", () => {
    const layouts = new Set();
    for (let i = 0; i < 10; i++) {
      const board = new Gameboard();
      autoFleet(board);
      // mark occupied spots with a 1, rest are 0
      const grid = Array(100).fill(0);
      for (const s of board.fleetShips) for (const c of s.cells) grid[c] = 1;
      layouts.add(grid.join(""));
    }
    expect(layouts.size).toBeGreaterThan(5);
  });
});
