import { describe, expect, it } from "vitest";
import { Gameboard } from "./gameboard.js";
import { cpuPlaceFleet } from "./cpuFleet.js";

describe("cpuFleet", () => {
  it("random cpu fleet placement, fleetDone true", () => {
    const board = new Gameboard();
    cpuPlaceFleet(board);
    expect(board.fleetDone).toBe(true);
  });

  it("full fleet, (17) cells", () => {
    const board = new Gameboard();
    cpuPlaceFleet(board);
    expect(board.grid.filter((cell) => cell !== null).length).toBe(17);
  });

  it("unique ships (5)", () => {
    const board = new Gameboard();
    cpuPlaceFleet(board);
    const ships = new Set(board.grid);
    ships.delete(null);
    expect(ships.size).toBe(5);
  });

  it("new fleet, no hits or misses", () => {
    const board = new Gameboard();
    cpuPlaceFleet(board);
    expect(board.hits).toEqual([]);
    expect(board.misses).toEqual([]);
  });

  it("check that ships were randomly placed, run multiple times (10)", () => {
    const layouts = new Set();
    for (let i = 0; i < 10; i++) {
      const board = new Gameboard();
      cpuPlaceFleet(board);
      layouts.add(board.grid.map((cell) => (cell !== null ? 1 : 0)).join(""));
    }
    expect(layouts.size).toBeGreaterThan(5);
  });
});
