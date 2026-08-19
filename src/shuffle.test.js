import { describe, expect, it } from "vitest";
import { shuffle } from "./shuffle.js";

describe("shuffle", () => {
  it("returns same array instance (shuffles in place)", () => {
    const input = [1, 2, 3];
    expect(shuffle(input)).toBe(input);
  });

  it("identical length", () => {
    expect(shuffle([1, 2, 3, 4, 5]).length).toBe(5);
  });

  it("result is permutation of the input (same elements)", () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const expected = [...input];
    const result = shuffle(input);
    expect([...result].sort((a, b) => a - b)).toEqual(expected);
  });

  it("empty array, unchanged", () => {
    expect(shuffle([])).toEqual([]);
  });

  it("single element, unchanged", () => {
    expect(shuffle([42])).toEqual([42]);
  });
});
