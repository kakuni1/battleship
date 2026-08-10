import { describe, it, expect } from "vitest";
import { Ship } from "./ship.js";

describe("Ship", () => {
  it("no hits, not sunk", () => {
    const ship = new Ship(5);
    expect(ship.isSunk()).toBe(false);
  });

  it("hits less than length, not sunk", () => {
    const ship = new Ship(5);
    for (let i = 0; i < 3; i++) ship.hit();
    expect(ship.isSunk()).toBe(false);
  });

  it("hits equal length, sunk", () => {
    const ship = new Ship(5);
    for (let i = 0; i < 5; i++) ship.hit();
    expect(ship.isSunk()).toBe(true);
  });
});
