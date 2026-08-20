import { describe, expect, it } from "vitest";
import { Ship } from "./ship.js";

describe("Ship", () => {
  it("no hits, not sunk", () => {
    const ship = new Ship(5);
    expect(ship.isSunk).toBe(false);
  });

  it("hits less than length, not sunk", () => {
    const ship = new Ship(5);
    for (let i = 0; i < 3; i++) ship.hit();
    expect(ship.isSunk).toBe(false);
  });

  it("hits equal length, sunk", () => {
    const ship = new Ship(5);
    for (let i = 0; i < 5; i++) ship.hit();
    expect(ship.isSunk).toBe(true);
  });

  it("readable length", () => {
    const ship = new Ship(5);
    expect(ship.length).toBe(5);
  });

  it("private length manipulation, result in error throw & no length change", () => {
    const ship = new Ship(5);
    expect(() => (ship.length = 0)).toThrow();
    expect(ship.length).toBe(5);
  });

  it("constructor, non-integer length, throw error", () => {
    expect(() => new Ship(2.5)).toThrow("ship, invalid length");
    expect(() => new Ship("x")).toThrow("ship, invalid length");
    expect(() => new Ship(null)).toThrow("ship, invalid length");
    expect(() => new Ship(NaN)).toThrow("ship, invalid length");
  });

  it("constructor, too short, throws", () => {
    expect(() => new Ship(1)).toThrow("ship, invalid length");
    expect(() => new Ship(0)).toThrow("ship, invalid length");
    expect(() => new Ship(-5)).toThrow("ship, invalid length");
  });

  it("constructor, too long, throws", () => {
    expect(() => new Ship(6)).toThrow("ship, invalid length");
    expect(() => new Ship(50)).toThrow("ship, invalid length");
  });

  it("constructor, no argument, throws", () => {
    expect(() => new Ship()).toThrow("ship, invalid length");
  });

  it("constructor, lengths (2) & (5), accepted", () => {
    const short = new Ship(2);
    expect(short.length).toBe(2);
    expect(short.isSunk).toBe(false);

    const long = new Ship(5);
    expect(long.length).toBe(5);
    expect(long.isSunk).toBe(false);
  });
});
