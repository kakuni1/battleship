import { describe, expect, it } from "vitest";
import { Gameboard } from "./gameboard.js";

describe("Gameboard", () => {
  it("initialize empty board, 100 cells, each filled as null", () => {
    const board = new Gameboard();
    expect(board.grid.length).toBe(100);
    for (const cell of board.grid) expect(cell).toBe(null);
  });

  it("integer check, non-integer throw error", () => {
    const board = new Gameboard();
    expect(() => board.placeShip([0, 1.1], "Destroyer", "horizontal")).toThrow(
      "place, must be integer",
    );
    expect(() => board.placeShip(1.1, "Destroyer", "h")).toThrow(
      "place, must be integer",
    );
    expect(() => board.placeShip(-Infinity, "Destroyer", "h")).toThrow(
      "place, must be integer",
    );
    expect(() => board.placeShip(NaN, "Destroyer", "h")).toThrow(
      "place, must be integer",
    );
  });

  it("check for valid length, too short", () => {
    const board = new Gameboard();
    expect(() => board.placeShip(0, 1, "horizontal")).toThrow(
      "place, invalid ship name",
    );
  });

  it("check for valid length, not an integer", () => {
    const board = new Gameboard();
    expect(() => board.placeShip(0, 2.5, "horizontal")).toThrow(
      "place, invalid ship name",
    );
  });

  it("check for valid direction", () => {
    const board = new Gameboard();
    expect(() => board.placeShip(0, "Destroyer", "x")).toThrow(
      "place, invalid direction",
    );
  });

  it("place ship (2), horizontal", () => {
    const board = new Gameboard();
    const ship = board.placeShip(0, "Destroyer", "horizontal");
    for (const cell of [0, 1]) expect(board.grid[cell]).toBe(ship);
  });

  it("place ship (5), vertical", () => {
    const board = new Gameboard();
    const ship = board.placeShip(22, "Carrier", "vertical");
    for (const cell of [22, 32, 42, 52, 62]) {
      expect(board.grid[cell]).toBe(ship);
    }
  });

  it("place ship (5), vertical, completely out of bounds", () => {
    const board = new Gameboard();
    expect(() => board.placeShip(-55, "Carrier", "vertical")).toThrow(
      "place, out of bounds",
    );
  });

  it("place ship (2), horizontal, extends out of bounds", () => {
    const board = new Gameboard();
    expect(() => board.placeShip(99, "Destroyer", "horizontal")).toThrow(
      "place, out of bounds",
    );
  });

  it("place ships (2) & (3), overlap", () => {
    const board = new Gameboard();
    board.placeShip(0, "Destroyer", "horizontal");
    expect(() => board.placeShip(0, "Submarine", "horizontal")).toThrow(
      "place, cell occupied",
    );
  });

  it("place ships (2) & (3), overlap, retry continues & succeeds", () => {
    const board = new Gameboard();
    board.placeShip(0, "Destroyer", "horizontal");
    expect(() => board.placeShip(1, "Submarine", "horizontal")).toThrow(
      "place, cell occupied",
    );
    const ship = board.placeShip(55, "Carrier", "vertical");
    expect(ship.length).toBe(5);
  });

  it("place ship (2) & (2), duplicate, no overlap, throws error", () => {
    const board = new Gameboard();
    board.placeShip(0, "Destroyer", "horizontal");
    expect(() => board.placeShip(55, "Destroyer", "vertical")).toThrow(
      "place, ship already placed",
    );
  });

  it("ship (2), receive attack (1), isSunk false", () => {
    const board = new Gameboard();
    const ship = board.placeShip(0, "Destroyer", "horizontal");
    board.receiveAttack(0);
    expect(ship.isSunk).toBe(false);
  });

  it("integer check, attack, non-integer", () => {
    const board = new Gameboard();
    board.placeShip(0, "Destroyer", "horizontal");
    expect(() => board.receiveAttack(1.111)).toThrow("attack, must be integer");
  });

  it("integer check, attack, infinity non-integer", () => {
    const board = new Gameboard();
    board.placeShip(0, "Destroyer", "horizontal");
    expect(() => board.receiveAttack(-Infinity)).toThrow(
      "attack, must be integer",
    );
  });

  it("ship (2), receive attack (2), isSunk true", () => {
    const board = new Gameboard();
    const ship = board.placeShip(0, "Destroyer", "horizontal");
    board.receiveAttack(0);
    board.receiveAttack(1);
    expect(ship.isSunk).toBe(true);
  });

  it("ship (5), receive attack (7), extra misses, isSunk true", () => {
    const board = new Gameboard();
    const ship = board.placeShip(22, "Carrier", "vertical");
    for (const cell of [22, 32, 42, 52, 62, 72, 82]) board.receiveAttack(cell);
    expect(ship.isSunk).toBe(true);
  });

  it("miss (1), track the miss", () => {
    const board = new Gameboard();
    board.placeShip(0, "Destroyer", "horizontal");
    board.receiveAttack(55);
    expect(board.misses).toEqual([55]);
  });

  it("hit (1), miss, dont track", () => {
    const board = new Gameboard();
    board.placeShip(0, "Destroyer", "horizontal");
    board.receiveAttack(0);
    expect(board.misses).toEqual([]);
  });

  it("hit (1), track the hit", () => {
    const board = new Gameboard();
    board.placeShip(0, "Destroyer", "horizontal");
    board.receiveAttack(0);
    expect(board.hits).toEqual([0]);
  });

  it("miss (1), dont track", () => {
    const board = new Gameboard();
    board.placeShip(0, "Destroyer", "horizontal");
    board.receiveAttack(55);
    expect(board.hits).toEqual([]);
  });

  it("hits (2), track in order", () => {
    const board = new Gameboard();
    board.placeShip(0, "Destroyer", "horizontal");
    board.receiveAttack(0);
    board.receiveAttack(1);
    expect(board.hits).toEqual([0, 1]);
  });

  it("ships (2) & (5), not sunk, allSunk false", () => {
    const board = new Gameboard();
    board.placeShip(0, "Destroyer", "horizontal");
    board.placeShip(55, "Submarine", "vertical");
    board.receiveAttack(0);
    board.receiveAttack(55);
    expect(board.allSunk).toBe(false);
  });

  it("ships (2) & (5), sink only (2), allSunk false", () => {
    const board = new Gameboard();
    board.placeShip(0, "Destroyer", "horizontal");
    board.placeShip(55, "Submarine", "vertical");
    for (const cell of [0, 1]) board.receiveAttack(cell);
    expect(board.allSunk).toBe(false);
  });

  it("ships (2) & (5), sunk, allSunk true", () => {
    const board = new Gameboard();
    board.placeShip(0, "Destroyer", "horizontal");
    board.placeShip(33, "Carrier", "vertical");
    for (const cell of [0, 1]) board.receiveAttack(cell);
    for (const cell of [33, 43, 53, 63, 73]) board.receiveAttack(cell);
    expect(board.allSunk).toBe(true);
  });

  it("no ships, empty board, dont auto end game on start, allSunk false", () => {
    const board = new Gameboard();
    expect(board.allSunk).toBe(false);
  });

  it("ship (2), duplicate attack, hit check", () => {
    const board = new Gameboard();
    board.placeShip(0, "Destroyer", "horizontal");
    board.receiveAttack(0);
    expect(() => board.receiveAttack(0)).toThrow("attack, duplicate");
  });

  it("ship (2), duplicate attack, miss check", () => {
    const board = new Gameboard();
    board.placeShip(0, "Destroyer", "horizontal");
    board.receiveAttack(77);
    expect(board.misses).toEqual([77]);
    expect(() => board.receiveAttack(77)).toThrow("attack, duplicate");
    expect(board.misses).toEqual([77]);
  });

  it("ship (2), attack out of bounds", () => {
    const board = new Gameboard();
    board.placeShip(0, "Destroyer", "horizontal");
    expect(() => board.receiveAttack(100)).toThrow("attack, out of bounds");
  });

  it("ship (2), return 'hit'", () => {
    const board = new Gameboard();
    board.placeShip(0, "Destroyer", "horizontal");
    expect(board.receiveAttack(0)).toEqual({
      name: "Destroyer",
      result: "hit",
      sunk: false,
    });
  });

  it("ship (2), return 'miss'", () => {
    const board = new Gameboard();
    board.placeShip(0, "Destroyer", "horizontal");
    expect(board.receiveAttack(7)).toEqual({
      result: "miss",
    });
  });

  it("ship (2), final hit, return sunk", () => {
    const board = new Gameboard();
    board.placeShip(0, "Destroyer", "horizontal");
    board.receiveAttack(0);
    expect(board.receiveAttack(1)).toEqual({
      result: "hit",
      name: "Destroyer",
      sunk: true,
    });
  });

  it("no attack, isAttacked false", () => {
    const board = new Gameboard();
    expect(board.isAttacked(0)).toBe(false);
  });

  it("attack (1), isAttacked true", () => {
    const board = new Gameboard();
    board.receiveAttack(0);
    expect(board.isAttacked(0)).toBe(true);
  });

  it("ship (2), attack(1), isAttacked true", () => {
    const board = new Gameboard();
    board.placeShip(0, "Destroyer", "horizontal");
    board.receiveAttack(0);
    expect(board.isAttacked(0)).toBe(true);
    expect(board.isAttacked(1)).toBe(false);
  });

  it("ship (2), attack (2), hit (1), miss (1), isAttacked true", () => {
    const board = new Gameboard();
    board.placeShip(0, "Destroyer", "horizontal");
    board.receiveAttack(0);
    board.receiveAttack(5);
    expect(board.isAttacked(0)).toBe(true);
    expect(board.isAttacked(5)).toBe(true);
    expect(board.isAttacked(1)).toBe(false);
  });

  it("no ships placed, fleetDone false", () => {
    const board = new Gameboard();
    expect(board.fleetDone).toBe(false);
  });

  it("ships placed (4 out of 5), fleetDone false", () => {
    const board = new Gameboard();
    board.placeShip(0, "Destroyer", "horizontal");
    board.placeShip(20, "Submarine", "horizontal");
    board.placeShip(40, "Cruiser", "horizontal");
    board.placeShip(60, "Battleship", "horizontal");
    expect(board.fleetDone).toBe(false);
  });

  it("all ships placed (5 out of 5), fleetDone true", () => {
    const board = new Gameboard();
    board.placeShip(0, "Destroyer", "horizontal");
    board.placeShip(20, "Submarine", "horizontal");
    board.placeShip(40, "Cruiser", "horizontal");
    board.placeShip(60, "Battleship", "horizontal");
    board.placeShip(80, "Carrier", "horizontal");
    expect(board.fleetDone).toBe(true);
  });

  it("place ship (2), horizontal, edge fit, last cells of row, succeeds", () => {
    const board = new Gameboard();
    const ship = board.placeShip(8, "Destroyer", "horizontal");
    for (const cell of [8, 9]) expect(board.grid[cell]).toBe(ship);
  });

  it("place ship (2), horizontal, wraps to next row, throws", () => {
    const board = new Gameboard();
    expect(() => board.placeShip(9, "Destroyer", "horizontal")).toThrow(
      "place, out of bounds",
    );
  });

  it("place ship (5), vertical, extends past bottom edge, throw error", () => {
    const board = new Gameboard();
    expect(() => board.placeShip(75, "Carrier", "vertical")).toThrow(
      "place, out of bounds",
    );
  });

  it("remove ship (2) from grid, horizontal", () => {
    const board = new Gameboard();
    board.placeShip(0, "Destroyer", "horizontal");
    board.removeShip("Destroyer");
    for (const cell of [0, 1]) expect(board.grid[cell]).toBe(null);
  });

  it("remove ship (2) from grid, vertical", () => {
    const board = new Gameboard();
    board.placeShip(12, "Carrier", "vertical");
    board.removeShip("Carrier");
    for (const cell of [12, 22, 32, 42, 52])
      expect(board.grid[cell]).toBe(null);
  });

  it("place same ship after removal", () => {
    const board = new Gameboard();
    board.placeShip(0, "Destroyer", "horizontal");
    board.removeShip("Destroyer");
    for (const cell of [0, 1]) expect(board.grid[cell]).toBe(null);
    const ship = board.placeShip(0, "Destroyer", "horizontal");
    for (const cell of [0, 1]) expect(board.grid[cell]).toBe(ship);
  });

  it("place different ship on removed cells", () => {
    const board = new Gameboard();
    board.placeShip(0, "Destroyer", "horizontal");
    board.removeShip("Destroyer");
    const ship = board.placeShip(0, "Carrier", "horizontal");
    for (const cell of [0, 1, 2, 3, 4]) expect(board.grid[cell]).toBe(ship);
  });

  it("removal doesnt affect other ships", () => {
    const board = new Gameboard();
    board.placeShip(0, "Destroyer", "horizontal");
    const ship = board.placeShip(55, "Submarine", "vertical");
    board.removeShip("Destroyer");
    for (const cell of [0, 1]) expect(board.grid[cell]).toBe(null);
    board.placeShip(0, "Carrier", "vertical");
    for (const cell of [55, 65, 75]) expect(board.grid[cell]).toBe(ship);
  });

  it("ship not placed, throw error", () => {
    const board = new Gameboard();
    expect(() => board.removeShip("Destroyer")).toThrow(
      "remove, ship not yet placed",
    );
  });

  it("cannot remove a ship after a miss", () => {
    const board = new Gameboard();
    board.placeShip(0, "Destroyer", "horizontal");
    board.receiveAttack(5);
    expect(() => board.removeShip("Destroyer")).toThrow(
      "remove, game already started",
    );
  });

  it("cannot remove a ship after a hit", () => {
    const board = new Gameboard();
    board.placeShip(0, "Destroyer", "horizontal");
    board.receiveAttack(0);
    expect(() => board.removeShip("Destroyer")).toThrow(
      "remove, game already started",
    );
  });

  it("getter fleetShips, returns name, cells & isSunk", () => {
    const board = new Gameboard();
    board.placeShip(0, "Destroyer", "horizontal");
    board.receiveAttack(0);
    board.receiveAttack(1);
    expect(board.fleetShips).toEqual([
      { name: "Destroyer", cells: [0, 1], isSunk: true },
    ]);
  });

  it("getter fleetShips (multi-ship), returns name, cells & isSunk", () => {
    const board = new Gameboard();
    board.placeShip(0, "Destroyer", "horizontal");
    board.placeShip(50, "Carrier", "horizontal");
    expect(board.fleetShips).toEqual([
      { name: "Destroyer", cells: [0, 1], isSunk: false },
      { name: "Carrier", cells: [50, 51, 52, 53, 54], isSunk: false },
    ]);
  });
});
