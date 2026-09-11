import { describe, expect, it } from "vitest";
import { fitsBoard, spanCells } from "./grid.js";

describe("spanCells", () => {
  it("horizontal", () => {
    expect(spanCells(0, 5, "horizontal")).toEqual([0, 1, 2, 3, 4]);
    expect(spanCells(5, 5, "horizontal")).toEqual([5, 6, 7, 8, 9]);
  });

  it("vertical", () => {
    expect(spanCells(0, 5, "vertical")).toEqual([0, 10, 20, 30, 40]);
    expect(spanCells(5, 5, "vertical")).toEqual([5, 15, 25, 35, 45]);
  });
});

describe("fitsBoard", () => {
  it("invalid direction, return false", () => {
    expect(fitsBoard(0, 5, "hrzntl")).toBe(false);
    expect(fitsBoard(0, 5, undefined)).toBe(false);
  });

  it("horizontal", () => {
    expect(fitsBoard(0, 5, "horizontal")).toBe(true);
    expect(fitsBoard(5, 5, "horizontal")).toBe(true);
    expect(fitsBoard(8, 2, "horizontal")).toBe(true);
    expect(fitsBoard(6, 5, "horizontal")).toBe(false);
    expect(fitsBoard(9, 2, "horizontal")).toBe(false);
  });

  it("vertical", () => {
    expect(fitsBoard(0, 5, "vertical")).toBe(true);
    expect(fitsBoard(55, 5, "vertical")).toBe(true);
    expect(fitsBoard(85, 2, "vertical")).toBe(true);
    expect(fitsBoard(65, 5, "vertical")).toBe(false);
    expect(fitsBoard(95, 2, "vertical")).toBe(false);
  });
});
